import { Logger } from "@nestjs/common";
import { randomUUID } from "crypto";
import * as path from "node:path";

export const filename = path.resolve(__filename);
export type ByteTransferPayload = ArrayBuffer | Uint8Array;
export type SharedByteTransferPayload = SharedArrayBuffer | Uint8Array;

function doEdit(data: Uint8Array): void {
    data[0] = 10;
}

// this could also not be async but must be awaited in app.ts
export function edit(data: ByteTransferPayload): ByteTransferPayload {
    const logger = new Logger(`byte-transfer-worker ${randomUUID()}`);
    logger.log("executing...");
    // printMemUsage(logger);
    if (ArrayBuffer.isView(data)) {
        doEdit(data);
    } else {
        doEdit(new Uint8Array(data));
    }
    return data;
}

// here no data are trasfer or returned
export function editShared(data: SharedByteTransferPayload): void {
    const logger = new Logger(`byte-transfer-worker ${randomUUID()}`);
    logger.log("executing...");
    // printMemUsage(logger);
    if (ArrayBuffer.isView(data)) {
        doEdit(data);
    } else {
        doEdit(new Uint8Array(data));
    }
}
