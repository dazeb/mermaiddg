import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";

interface AuthCallbackProps {
  onAuthComplete: () => void;
}

export function AuthCallback({ onAuthComplete }: AuthCallbackProps) {
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Set up auth state listener to handle the OAuth callback
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        setStatus("success");
        setMessage("Successfully signed in with GitHub!");

        // Redirect to main app after a short delay
        setTimeout(() => {
          onAuthComplete();
        }, 2000);
      } else if (event === "SIGNED_OUT" || event === "TOKEN_REFRESHED") {
        // Handle other auth events if needed
      }
    });

    // Check for immediate session (in case auth already completed)
    const checkSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        if (session?.user) {
          setStatus("success");
          setMessage("Successfully signed in with GitHub!");

          setTimeout(() => {
            onAuthComplete();
          }, 2000);
        } else {
          // Check for error in URL parameters
          const urlParams = new URLSearchParams(window.location.search);
          const error = urlParams.get("error");
          const errorDescription = urlParams.get("error_description");

          if (error) {
            throw new Error(errorDescription || error);
          }

          // If no immediate session and no error, wait for auth state change
          // Set a timeout in case auth never completes
          setTimeout(() => {
            if (status === "loading") {
              setStatus("error");
              setMessage("Authentication timed out. Please try again.");
              setTimeout(() => {
                onAuthComplete();
              }, 2000);
            }
          }, 10000); // 10 second timeout
        }
      } catch (error) {
        console.error("Auth callback error:", error);
        setStatus("error");
        setMessage(
          error instanceof Error
            ? error.message
            : "Authentication failed. Please try again."
        );

        setTimeout(() => {
          onAuthComplete();
        }, 3000);
      }
    };

    checkSession();

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, [onAuthComplete, status]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
        {status === "loading" && (
          <>
            <div className="flex justify-center mb-4">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Completing Sign In
            </h2>
            <p className="text-gray-600">
              Please wait while we complete your GitHub authentication...
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="flex justify-center mb-4">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Welcome!
            </h2>
            <p className="text-gray-600 mb-4">{message}</p>
            <p className="text-sm text-gray-500">
              Redirecting you to the application...
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="flex justify-center mb-4">
              <AlertCircle className="w-12 h-12 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Authentication Failed
            </h2>
            <p className="text-gray-600 mb-4">{message}</p>
            <p className="text-sm text-gray-500">
              Redirecting you back to try again...
            </p>
          </>
        )}
      </div>
    </div>
  );
}
