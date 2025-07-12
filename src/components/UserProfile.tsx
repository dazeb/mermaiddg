import React, { useState } from "react";
import { User, LogOut, Settings, Crown, Edit3, Check, X } from "lucide-react";
import { User as UserType } from "../types";

interface UserProfileProps {
  user: UserType;
  onSignOut: () => void;
  onUpgradeAccount: () => void;
  onUpdateName: (name: string) => void;
  onOpenSettings: () => void;
}

export function UserProfile({
  user,
  onSignOut,
  onUpgradeAccount,
  onUpdateName,
  onOpenSettings,
}: UserProfileProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState(user.name);

  const handleSaveName = () => {
    if (editName.trim() && editName !== user.name) {
      onUpdateName(editName.trim());
    }
    setIsEditingName(false);
  };

  const handleCancelEdit = () => {
    setEditName(user.name);
    setIsEditingName(false);
  };

  // Memoize the avatar style to prevent flickering
  const avatarStyle = React.useMemo(
    () => ({
      backgroundColor: user.color,
    }),
    [user.color]
  );
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
          style={avatarStyle}
        >
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div className="text-left">
          <p className="text-sm font-medium text-gray-900">{user.name}</p>
          <p className="text-xs text-gray-500">
            {user.isGuest ? "Guest User" : "Registered"}
          </p>
        </div>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium"
                  style={avatarStyle}
                >
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  {isEditingName ? (
                    <div className="flex items-center space-x-1">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveName();
                          if (e.key === "Escape") handleCancelEdit();
                        }}
                        autoFocus
                      />
                      <button
                        onClick={handleSaveName}
                        className="p-1 text-green-600 hover:bg-green-50 rounded"
                      >
                        <Check size={14} />
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="p-1 text-gray-400 hover:bg-gray-50 rounded"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500">
                          {user.isGuest ? "Guest User" : user.email}
                        </p>
                      </div>
                      <button
                        onClick={() => setIsEditingName(true)}
                        className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded"
                      >
                        <Edit3 size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-2">
              {user.isGuest && (
                <button
                  onClick={() => {
                    onUpgradeAccount();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-blue-50 rounded-lg transition-colors text-blue-600"
                >
                  <Crown size={16} />
                  <div>
                    <p className="text-sm font-medium">Upgrade Account</p>
                    <p className="text-xs text-blue-500">
                      Save work & collaborate
                    </p>
                  </div>
                </button>
              )}

              <button
                onClick={() => {
                  onOpenSettings();
                  setIsOpen(false);
                }}
                className="w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-gray-50 rounded-lg transition-colors text-gray-700"
              >
                <Settings size={16} />
                <span className="text-sm">Settings</span>
              </button>

              {!user.isGuest && (
                <button
                  onClick={() => {
                    onSignOut();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-red-50 rounded-lg transition-colors text-red-600"
                >
                  <LogOut size={16} />
                  <span className="text-sm">Sign Out</span>
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
