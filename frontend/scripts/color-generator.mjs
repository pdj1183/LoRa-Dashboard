import { COLORS } from "../src/utils/colors-data.js";

import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

const outFile = "src/styles/colors-generated.css";

await mkdir(dirname(outFile), { recursive: true });

const css = COLORS
    .map((hex) => {
        const cls = `.colors-${hex.replace("#", "").toLowerCase()}`;
        return `${cls} { color: ${hex}; }`;
    })
    .join("\n");

await writeFile(outFile, css);

console.log(`Color classes written to ${outFile}`);
