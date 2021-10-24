import { existsSync, mkdirSync, readdirSync } from "fs";
import { launch } from "puppeteer-core";

import CopyMangaCrawler from "./CopyMangaCrawler";
import waifu2x from "./waifu2x";

(async () => {
    const edgePath: string =
        "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
    const url: URL = new URL("https://copymanga.com/comic/gigant");
    const saveDir: string = ".\\GIGANT\\";

    const app = new CopyMangaCrawler(
        await launch({
            executablePath: edgePath,
            headless: true,
        }),
        saveDir
    );
    await app.newTask(url, 50);
    await app.close();

    // const pathToWaifu2x: string =
    //     ".\\waifu2x-ncnn-vulkan\\waifu2x-ncnn-vulkan.exe";
    // const outputdir = `${saveDir.substring(0, saveDir.length - 2)}_processed/`;
    // if (!existsSync(outputdir)) {
    //     mkdirSync(outputdir);
    // }

    // const dirs: string[] = readdirSync(saveDir).filter((dir: string) =>
    //     Boolean(dir.match(/.\d{1,2}./g))
    // );
    // for (const episodeDir of dirs) {
    //     if (episodeDir.match(/.\d./g)) {
    //         console.log(`正在处理${episodeDir}...`);
    //         waifu2x(pathToWaifu2x, saveDir + episodeDir + '/' , outputdir + episodeDir + '/');
    //     }
    // }
})();
