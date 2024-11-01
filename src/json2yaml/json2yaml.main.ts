import { Logger } from "@nestjs/common";
import { writeFile } from "node:fs/promises";
import { printMemUsage } from "../format.utils";
import Json2Yaml from "./json2yaml.service";

async function fetchRemoteJson(type: "small" | "large"): Promise<ArrayBuffer> {
    const jsonSmall = "https://jsonplaceholder.typicode.com/todos/1";
    const jsonLarge =
        "https://raw.githubusercontent.com/json-iterator/test-data/refs/heads/master/large-file.json";

    const res = await fetch(type === "small" ? jsonSmall : jsonLarge, {
        method: "GET",
        signal: AbortSignal.timeout(30_000)
    });

    return res.arrayBuffer();
}

// exec convertion from json to yaml
(async () => {
    const logger = new Logger(`Main`);
    logger.log("application start start");
    const service = new Json2Yaml();

    const json1 = await fetchRemoteJson("small");
    const json2 = await fetchRemoteJson("large");
    const data = [json1, json2];
    printMemUsage(logger);
    const yamls = await Promise.all(data.map((x) => service.convert(x)));
    printMemUsage(logger);

    for (let ii = 0; ii < data.length; ii++) {
        writeFile(`res-${ii}.yml`, yamls[ii]).catch((err) => console.log(err));
    }

    logger.log("end");
})();
