import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react()],
	optimizeDeps: {
		exclude: ["lucide-react"],
	},
	build: {
		rollupOptions: {
			output: {
				manualChunks: {
					// Separate vendor chunks for better caching
					"react-vendor": ["react", "react-dom"],
					"mermaid-vendor": ["mermaid"],
					"ui-vendor": ["lucide-react"],
					"utils-vendor": ["uuid", "@supabase/supabase-js"],
				},
			},
		},
		// Increase chunk size warning limit to 1000kb since we're now splitting chunks
		chunkSizeWarningLimit: 1000,
	},
});
