import { Logger } from "@nestjs/common";
import { randomUUID } from "crypto";
import * as path from "node:path";

const json2Yaml = require("json2yaml");

// declare a view on ArrayBuffer raw (Uint8)

export const filename = path.resolve(__filename);
export type Json2YamlWorkerPayload =
    | Record<string, unknown> // valid json
    | ArrayBuffer // for large data
    | Uint8Array; // for large data

// this could also not be async but must be awaited in app.ts
export async function convert(data: Json2YamlWorkerPayload): Promise<string> {
    const logger = new Logger(`json2yaml-worker ${randomUUID()}`);
    logger.log("executing...");
    // printMemUsage(logger);

    let dataJson: Record<string, unknown>;
    if (ArrayBuffer.isView(data)) {
        dataJson = JSON.parse(
            Buffer.from((<Uint8Array>data).buffer).toString()
        );
    } else if (data.byteLength) {
        dataJson = JSON.parse(Buffer.from(<ArrayBuffer>data).toString());
    } else {
        dataJson = data as Record<string, unknown>;
    }

    return json2Yaml.stringify(dataJson);
    // printMemUsage(logger);
}
