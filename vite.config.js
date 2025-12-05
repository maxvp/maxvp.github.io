import { defineConfig } from "vite";
import { copyFileSync, cpSync, existsSync, mkdirSync } from "fs";
import { resolve } from "path";

export default defineConfig({
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
      },
    },
  },
  plugins: [
    {
      name: "copy-static-assets",
      closeBundle() {
        const outDir = "dist";

        // Copy archive directory
        if (existsSync("archive")) {
          cpSync("archive", `${outDir}/archive`, { recursive: true });
          console.log("✓ Copied archive/ directory");
        }

        // Copy PDF resume
        if (existsSync("MaxPhillips_resume.pdf")) {
          copyFileSync(
            "MaxPhillips_resume.pdf",
            `${outDir}/MaxPhillips_resume.pdf`
          );
          console.log("✓ Copied MaxPhillips_resume.pdf");
        }

        // Copy HTML resume
        if (existsSync("MaxPhillips_resume.html")) {
          copyFileSync(
            "MaxPhillips_resume.html",
            `${outDir}/MaxPhillips_resume.html`
          );
          console.log("✓ Copied MaxPhillips_resume.html");
        }
      },
    },
  ],
});
