import { defineConfig } from "astro/config";
import preact from "@astrojs/preact";
import icon from "astro-icon";
import symlink from "symlink-dir";
import * as path from "path";
import { AstroUserConfig } from "astro";

await symlink(path.resolve("content"), path.resolve("public/content"));

export default defineConfig({
	// import.meta.env does not resolve to env variables in the config script!
	// https://docs.astro.build/en/guides/environment-variables/#in-the-astro-config-file
	site:
		process.env.SITE_URL ??
		(process.env.VERCEL_URL
			? `https://${process.env.VERCEL_URL}`
			: undefined) ??
		"https://playfulprogramming.com",
	output: "static",
	image: {
		service: {
			entrypoint: "astro/assets/services/sharp",
			config: {
				limitInputPixels: false,
			},
		},
	},
	integrations: [icon(), preact({ compat: true })],
	server: {
		headers: {
			["Cross-Origin-Embedder-Policy"]: "require-corp",
			["Cross-Origin-Opener-Policy"]: "same-origin",
		},
	},
	vite: {
		optimizeDeps: {
			exclude: ["msw", "msw/node", "sharp"],
		},
		ssr: {
			external: ["svgo"],
			noExternal: [
				"react-aria",
				"react-stately",
				/@react-aria/,
				/@react-stately/,
				/@react-types/,
			],
		},
		css: {
			preprocessorOptions: {
				scss: {
					api: "modern",
				},
			},
		},
	},
	markdown: {} as AstroUserConfig["markdown"] as never,
});
