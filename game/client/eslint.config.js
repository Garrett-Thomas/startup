import globals from "globals";
import pluginJs from "@eslint/js";
import { p5globals} from "/Users/garrett/.vscode/extensions/samplavigne.p5-vscode-1.2.16/p5types/global.d.ts";

export default [
  {
    files: ["**/*.js"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...p5globals,
      },
      sourceType: "script",
    },
  },
  pluginJs.configs.recommended,
];