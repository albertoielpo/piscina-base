import { Logger } from "@nestjs/common";
import { randomUUID } from "crypto";
import * as path from "node:path";
import { isAnyArrayBuffer, isUint8Array } from "node:util/types";
import { move } from "piscina";
import { printMemUsage } from "../format.utils";

export const filename = path.resolve(__filename);

export type SharedByteTransferPayload = SharedArrayBuffer | Uint8Array;
export type PiscinaTransferable =
    | ArrayBuffer
    | ArrayBufferView
    | Transferable
    | MessagePort;

function doEdit(data: Uint8Array): void {
    data[0] = 10;
}

// this could also not be async but must be awaited in app.ts
export function edit(data: PiscinaTransferable): PiscinaTransferable {
    const logger = new Logger(`byte-transfer-worker ${randomUUID()}`);
    logger.log("executing...");

    if (isUint8Array(data)) {
        doEdit(data);
    } else if (isAnyArrayBuffer(data)) {
        doEdit(new Uint8Array(data));
    } else {
        throw new Error("Not supported type");
    }
    printMemUsage(logger);
    return move(data);
}

// here no data are trasfer or returned
export function editShared(data: SharedByteTransferPayload): void {
    const logger = new Logger(`byte-transfer-worker ${randomUUID()}`);
    logger.log("executing...");
    // printMemUsage(logger);
    if (isUint8Array(data)) {
        doEdit(data);
    } else if (isAnyArrayBuffer(data)) {
        doEdit(new Uint8Array(data));
    } else {
        throw new Error("Not supported type");
    }
}
