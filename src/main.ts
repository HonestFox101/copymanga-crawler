import { launch } from "puppeteer-core";

import CopyMangaCrawler from "./CopyMangaCrawler";
import { enhanceManga } from "./waifu2x";
import * as path from "path";
import { execSync } from "child_process";
import { existsSync, mkdirSync, readdirSync, rmSync } from "fs";

(async () => {
    const edgePath: string =
        "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
    const url: URL = new URL(
        "https://copymanga.com/comic/qiangweiyuanchuangqi"
    );
    const saveDir: string = ".\\蔷薇园传奇\\";

    // fetching manga from internet
    const app = new CopyMangaCrawler(
        await launch({
            executablePath: edgePath,
            headless: true,
        })
    );
    await app.newTask(url, saveDir,5);
    await app.close();
    
    // Enhancing resolution
    // const targetPath = path.join("./Manga/", saveDir);
    // const tempPath = 'raw_img';
    // enhanceManga(targetPath, tempPath, /.\d{1,2}.$/g);

    // compress image
    // const pathToInputDir = path.join(tempPath, '第03话' + '/');
    // const pathToOutputDir = path.join(targetPath, '第03话' + '_2x/');
    // mozjpeg(pathToInputDir, pathToOutputDir, true, true);
})();

function mozjpeg(pathToInputDir:string, pathToOutputDir?:string,deleteInputDir?: boolean, displayInfo?:boolean) {
    let command: string = '.\\node_modules\\.bin\\squoosh-cli --mozjpeg auto'
    if (!existsSync(pathToInputDir)) {
        console.error(`找不到目录:${pathToInputDir}`);
        return;
    }
    if (pathToOutputDir) {
        if (!existsSync(pathToOutputDir)) {
            mkdirSync(pathToOutputDir);
        }
        command += ` -d "${pathToOutputDir}"`;
    }
    for (const imgName of readdirSync(pathToInputDir)) {
        const pathToFile = ".\\" + path.join(pathToInputDir, imgName);
        command += ` "${pathToFile}"`
    }
    try {
        execSync(command, { stdio: displayInfo ? "inherit" : "ignore", encoding: 'utf8' });
        if (deleteInputDir) {
            rmSync(pathToInputDir, { recursive: true});
        }
    } catch (error: unknown) {
        console.log(error);
    }
}