import * as fs from 'fs-extra';
import * as path from 'path';

const Seven = require("node-7z");
const sevenBin = require('7zip-bin');

const buildDir = "./output";
const zipDir = "./builds";

if(!fs.existsSync(buildDir))
{
    fs.mkdir(buildDir);
}

if(!fs.existsSync(zipDir))
{
    fs.mkdir(zipDir);
}

const buildName = `build-${Date.now()}`;
const outputDir = path.join(buildDir, buildName);

fs.mkdirSync(outputDir);

fs.copySync("./src", path.join(outputDir, "src"));
fs.copySync("./package.json", path.join(outputDir, "package.json"));
fs.copySync("./tsconfig.json", path.join(outputDir, "tsconfig.json"));
fs.copySync("./twitter-text.d.ts", path.join(outputDir, "twitter-text.d.ts"));
fs.copySync("./yarn.lock", path.join(outputDir, "yarn.lock"));

console.log("Zipping output...");
const zipPath = path.join(zipDir, buildName + ".zip");
const toAdd = path.resolve(outputDir, "./*.*");
const process = Seven.add(zipPath, toAdd, {
    recursive: true,
    $bin: sevenBin.path7za,
});

process.on("end", () => {
    console.log("Done: " + zipPath);
    fs.rmdir(buildDir, {recursive: true});
});