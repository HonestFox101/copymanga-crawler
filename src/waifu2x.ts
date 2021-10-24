import { execSync } from "child_process";
import { existsSync, mkdirSync } from "fs";

export default function waifu2x(
    pathToWaifu2x: string,
    input: string,
    output: string,
    noiseLevel: -1 | 0 | 1 | 2 | 3 = 2,
    scale: 1 | 2 | 4 | 8 | 16 | 32 = 2
): Buffer | null {
    if (!existsSync(input)) {
        mkdirSync(input);
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
            stdio: "ignore",
        });
    } catch (error: unknown) {
        console.log(error);
    }
    return bf;
}
