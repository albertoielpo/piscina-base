import { Logger } from "@nestjs/common";
import Json2Yaml from "./json2yaml.service";

async function fetchRemoteJson(): Promise<ArrayBuffer> {
    const jsonSmall = "https://jsonplaceholder.typicode.com/todos/1";
    const jsonLarge =
        "https://raw.githubusercontent.com/json-iterator/test-data/refs/heads/master/large-file.json";

    const res = await fetch(jsonLarge, {
        method: "GET",
        signal: AbortSignal.timeout(30_000)
    });

    return res.arrayBuffer();
}

// exec convertion from json to yaml
// the idea is to test big json data
(async () => {
    const logger = new Logger(`Main`);
    logger.log("application start start");
    const service = new Json2Yaml();

    const json1 = {
        how: 1,
        are: true,
        you: ["fine", "thanks!"]
    };

    const json2 = await fetchRemoteJson();
    const data = [json2];
    const yamls = await Promise.all(data.map((x) => service.convert(x)));
    //     printMemUsage(logger);

    // for (let ii = 0; ii < data.length; ii++) {
    //     logger.log(data[ii]);
    //     logger.log(yamls[ii]);
    // }

    logger.log("end");
})();
