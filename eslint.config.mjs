import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = defineConfig([
  ...nextVitals,
  {
    rules: {
      "react/no-unescaped-entities": [
        "error",
        {
          forbid: [
            { char: "'", alternatives: ["&apos;", "&#39;", "&rsquo;"] },
            { char: '"', alternatives: ["&quot;", "&#34;", "&rdquo;"] },
          ],
        },
      ],
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    ".velite/**",
    "public/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
