import { defineConfig } from "vite";
import fs from "fs";
import path from "path";

const getThemes = () => {
  return fs
    .readdirSync("./src/resources/themes/", { withFileTypes: true })
    .filter((theme) => theme.isDirectory())
    .map((theme) => theme.name);
};

export default defineConfig(() => {
  const themes = getThemes();

  // Build input object for all themes
  const input = {};

  for (const theme of themes) {
    // Add JS entries
    const themeJsPath = `./src/resources/themes/${theme}/js/app.js`;
    if (fs.existsSync(path.resolve(themeJsPath))) {
      input[`${theme}-theme-js`] = themeJsPath;
    }

    const commonJsPath = "./src/resources/js/app.js";
    if (fs.existsSync(path.resolve(commonJsPath))) {
      input[`${theme}-common-js`] = commonJsPath;
    }

    // css checkpoint
    const scssPath = `./src/resources/themes/${theme}/sass/app.scss`;
    if (fs.existsSync(path.resolve(scssPath))) {
      input[`${theme}-style`] = scssPath;
    }
  }

  return {
    build: {
      rollupOptions: {
        input,
        output: {
          // Customize output paths
          entryFileNames: (chunkInfo) => {
            const theme = chunkInfo.name.split("-")[0];
            if (chunkInfo.name.includes("-js")) {
              return `themes/${theme}/js/[name].js`;
           }
            // when css files are empty, they are faulty classified
            if (chunkInfo.name.includes("-style")) {
              return `themes/${theme}/css/app.css`;
            }
            return `themes/${theme}/js/[name].[hash].js`;
          },

          assetFileNames: (assetInfo) => {
            if (assetInfo.names?.at(0)?.endsWith(".css")) {
              const theme = assetInfo.names?.at(0).split("-")[0];
              return `themes/${theme}/css/[name].css`;
            }
            return "themes/[name]/[ext]/[name].[ext]";
          },
        },
      },
    },
    css: {
      preprocessorOptions: {
        scss: {
          // Add any SCSS options here if needed
        },
      },
      // for js inmporting css stuff
      inject: false,
      extract: true,
    },
    plugins: [
      // Copy images for each theme
      {
        name: "copy-theme-images",
        enforce: "post",
        apply: "build",
        closeBundle() {
          themes.forEach((theme) => {
            const srcDir = path.resolve(`./resources/themes/${theme}/images`);
            const destDir = path.resolve(`./public/themes/${theme}/images`);

            if (fs.existsSync(srcDir)) {
              if (!fs.existsSync(destDir)) {
                fs.mkdirSync(destDir, { recursive: true });
              }

              fs.cpSync(srcDir, destDir, { recursive: true });
            }
          });
        },
      },
    ],
  };
});
