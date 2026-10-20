import fs from "fs";
const app = fs.readFileSync("c:/learning/Film/flow-tool-clean/App.tsx", "utf8");
const lines = app.split("\n");
lines.forEach((l, idx) => {
  if (l.includes("storyText") && (l.includes("const ") || l.includes("function ") || l.includes("=>"))) {
    console.log("Line " + (idx + 1) + ": " + l.slice(0, 100));
  }
});
