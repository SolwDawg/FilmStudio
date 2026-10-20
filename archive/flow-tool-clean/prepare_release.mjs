import fs from "fs";
import path from "path";

const bundlePath = "c:/learning/Film/flow-tool-clean/dist/app.bundle.js";
const code = fs.readFileSync(bundlePath, "utf8");
const b64 = Buffer.from(code).toString("base64");
const dataUrl = `data:text/javascript;base64,${b64}`;

fs.writeFileSync("c:/learning/Film/flow-tool-clean/dist/app.dataurl.txt", dataUrl, "utf8");

console.log("Successfully prepared release bundle!");
console.log(`Original bundle size: ${(code.length / 1024).toFixed(2)} KB`);
console.log(`Data URL size: ${(dataUrl.length / 1024).toFixed(2)} KB`);
