import { execSync } from "child_process";
import { existsSync, mkdirSync, readdirSync } from "fs";
import { join } from "path";

export function enhanceManga(inputPath: string, outputPath: string, EpisodeFilter?:RegExp, pathToWaifu2x?: string) {
    if (!existsSync(inputPath)) {
        console.error("未找到输入路径");
        return;
    }
    if (!existsSync(outputPath)) {
        mkdirSync(outputPath);
    }
    if (!pathToWaifu2x) {
        pathToWaifu2x = ".\\waifu2x-ncnn-vulkan\\waifu2x-ncnn-vulkan.exe"
    }
    let dirs: string[] = readdirSync(inputPath);
    if (EpisodeFilter) {
        dirs = dirs.filter((value: string) => Boolean(value.match(EpisodeFilter)));
    }
    for (const episodeDir of dirs) {
        console.log(`正在处理${episodeDir}...`);
        waifu2x(pathToWaifu2x, join(inputPath, episodeDir) , join(outputPath, episodeDir));
    }
}

export function waifu2x(
    pathToWaifu2x: string,
    input: string,
    output: string,
    noiseLevel: -1 | 0 | 1 | 2 | 3 = 2,
    scale: 1 | 2 | 4 | 8 | 16 | 32 = 2
): Buffer | null {
    if (!existsSync(input)) {
        return null;
    }
    if (!existsSync(output)) {
        mkdirSync(output);
    }
    if (!existsSync(pathToWaifu2x)) {
        return null;
    }

    const command: string = `${pathToWaifu2x} -i ${input} -o ${output} -n ${noiseLevel} -s ${scale}`;

    let bf: Buffer = Buffer.alloc(0);
    try {
        bf = execSync(command, {
            stdio: 'inherit',
        });
    } catch (error: unknown) {
        console.log(error);
    }
    return bf;
}
