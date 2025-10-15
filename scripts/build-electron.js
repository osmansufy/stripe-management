const fs = require("fs");
const path = require("path");

// Copy electron files to build directory
const electronDir = path.join(__dirname, "../electron");
const buildDir = path.join(__dirname, "../build");

// Ensure build directory exists
if (!fs.existsSync(buildDir)) {
  fs.mkdirSync(buildDir, { recursive: true });
}

// Copy main.js to build/electron.js
const mainFile = path.join(electronDir, "main.js");
const preloadFile = path.join(electronDir, "preload.js");

if (fs.existsSync(mainFile)) {
  fs.copyFileSync(mainFile, path.join(buildDir, "electron.js"));
  console.log("Copied main.js to build/electron.js");
}

if (fs.existsSync(preloadFile)) {
  fs.copyFileSync(preloadFile, path.join(buildDir, "preload.js"));
  console.log("Copied preload.js to build/preload.js");
}

console.log("Electron files copied to build directory");
