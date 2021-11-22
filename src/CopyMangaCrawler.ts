import { writeFileSync, existsSync, mkdirSync } from "fs";
import { Browser, ElementHandle, HTTPResponse, Page } from "puppeteer-core";
import { join } from "path";

export default class CopyMangaCrawler {
    browser: Browser;
    directory: string;

    constructor(browser: Browser) {
        this.browser = browser;

        this.directory = "./Manga/";
        if (!existsSync("./Manga/")) {
            mkdirSync("./Manga/");
        }
        if (!existsSync(this.directory)) {
            mkdirSync(this.directory);
        }
    }

    async close() {
        this.browser.close();
    }

    async newTask(
        url: URL,
        saveDir: string,
        start?: number,
        end?: number
    ): Promise<void> {
        const page: Page = await this.browser.newPage();
        console.log("获取章节列表中...");
        const episodeMap: [string, string][] = (
            await this._catchEpisodeMap(page, url.href)
        ).slice(start, end);
        if (episodeMap.length == 0) {
            console.warn("无法获取任何章节！");
            return;
        }
        console.log(`获取完成，共有${episodeMap.length}章`);

        if (!existsSync(join(this.directory, saveDir))) {
            mkdirSync(join(this.directory, saveDir));
        }
        for (const episodeEntry of episodeMap) {
            const saveDirPath: string = join(
                this.directory,
                saveDir,
                episodeEntry[0] + '/'
            );
            if (!existsSync(saveDirPath)) {
                mkdirSync(saveDirPath);
            }
            const href: string = url.origin + episodeEntry[1];
            console.log(`开始获取列表: ${episodeEntry[0]}`);
            const mangaMap: [string, string][] = await this._catchMangaMap(
                page,
                href
            );
            console.log("获取完成");
            console.log("开始下载漫画图片");
            for (const mangaPage of mangaMap) {
                console.log(`正在加载第${mangaPage[0]}/${mangaMap.length}张`);
                await this._fetchImage(
                    page,
                    mangaPage[1],
                    saveDirPath + mangaPage[0] + ".jpg"
                );
            }
            console.log(`${episodeEntry[0]}加载完成`);
        }
        page.close();
        console.log("任务完成！");
    }

    async _catchMangaMap(page: Page, url: string): Promise<[string, string][]> {
        await page.goto(url);

        const pageCountHandle: ElementHandle<Element> = (await page.$(
            ".comicCount"
        ))!;

        const expectPageCount: number = await page.evaluate(
            (element: Element) => Number(element.innerHTML),
            pageCountHandle
        );

        pageCountHandle.dispose();

        if (expectPageCount == 0) {
            return [];
        }
        while (true) {
            await page.waitForTimeout(2000);

            await page.keyboard.press("ArrowDown", { delay: 1 });

            const imgHandles: ElementHandle<Element>[] = await page.$$(
                ".comicContent-list > li > img[src]"
            );

            const count = imgHandles.length;

            if (count == expectPageCount) {
                let pageMap: [string, string][] = [];

                for (let index = 0; index < count; index++) {
                    const imgHandle = imgHandles[index];
                    const src: string = (await page.evaluate(
                        (element: Element) => element.getAttribute("data-src"),
                        imgHandle
                    ))!;

                    pageMap.push([String(index + 1), src]);

                    imgHandle.dispose();
                }
                return pageMap;
            }

            imgHandles.map((handle: ElementHandle<Element>) => {
                handle.dispose();
            });
        }
    }

    async _catchEpisodeMap(
        page: Page,
        url: string
    ): Promise<[string, string][]> {
        try {
            await page.goto(url);
        } catch (error: unknown) {
            console.error(error);
            return [];
        }
        try {
            await page.waitForSelector("#default全部 > ul:nth-child(1)");
        } catch (error: unknown) {
            console.error(error);
            return [];
        }
        const episodeItemHandles: ElementHandle<Element>[] = await page.$$(
            "#default全部 > ul:nth-child(1) > a"
        );
        let episodeMap: [string, string][] = [];
        for (let index = 0; index < episodeItemHandles.length; index++) {
            const episodeItemHandle = episodeItemHandles[index];
            const entry: [string, string] = await page.evaluate(
                (element: Element): [string, string] => [
                    element.getAttribute("title")!,
                    element.getAttribute("href")!,
                ],
                episodeItemHandle
            );
            episodeMap.push(entry);
            episodeItemHandle.dispose();
        }

        return episodeMap;
    }

    async _fetchImage(page: Page, url: string, savePath: string) {
        let lastChar = savePath.charAt(savePath.length - 1);
        if (lastChar != '\\' && lastChar != '/') {
            savePath += '/';
        }
        let resp: HTTPResponse|null = await page.goto(url)
            .catch(reason => {
                console.warn(`获取图片失败，正在重试\n${reason}`);
                return null;
            });
        for (let times = 0; !resp || times < 3; times++){
            resp = await page.goto(url).catch(reason => {
                console.warn(`第${times + 1}次重试失败\n${reason}`);
                return null;
            });
        }
        if (!resp) {
            console.error(`获取图片失败！`);
            return;
        }
        const data: Buffer = await resp.buffer();
        writeFileSync(savePath, data, {
            flag: "w",
        });
    }
}
