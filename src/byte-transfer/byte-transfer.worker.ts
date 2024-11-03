import { Logger } from "@nestjs/common";
import { randomUUID } from "crypto";
import * as path from "node:path";
import { isAnyArrayBuffer, isUint8Array } from "node:util/types";
import { move } from "piscina";
import { printMemUsage } from "../format.utils";
import ByteTransferDto from "./byte.transfer.dto";

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

// IMPORTANT: The caller must await all this calls because Piscina always return a Promise

/**
 * in this case the move must be done with the underlying ArrayBuffer because ArrayBuffer is transferable
 * @param data
 * @returns
 */
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
    return move(isUint8Array(data) ? data.buffer : data); // ensure to transfer the underlying buffer
}

/**
 * here no data are trasfer or returned
 * Pay attention because SharedArrayBuffer could soffer race conditions
 * @param data
 */
export function editShared(data: SharedByteTransferPayload): void {
    // TODO: use mutex to avoid race conditions
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

/**
 * in this case ByteTransferDto transfer the underlying ArrayBuffer in both directions
 * @param data
 * @returns
 */
export function editWithPayload(data: ByteTransferDto): PiscinaTransferable {
    const logger = new Logger(`byte-transfer-worker ${randomUUID()}`);
    logger.log(`executing...`);
    logger.log(
        `payload: metadata: ${data.metadata}, byteArray length: ${data.byteArray.byteLength}`
    );

    if (isUint8Array(data.byteArray)) {
        doEdit(data.byteArray);
    } else if (isAnyArrayBuffer(data.byteArray)) {
        doEdit(new Uint8Array(data.byteArray));
    } else {
        throw new Error("Not supported type");
    }
    printMemUsage(logger);
    // move back only the byteArray
    return move(
        isUint8Array(data.byteArray) ? data.byteArray.buffer : data.byteArray
    );
}

export function editWithPayloadBoth(
    data: ByteTransferDto
): PiscinaTransferable {
    const logger = new Logger(`byte-transfer-worker ${randomUUID()}`);
    logger.log(`executing...`);
    logger.log(
        `payload: metadata: ${data.metadata}, byteArray length: ${data.byteArray.byteLength}`
    );

    if (isUint8Array(data.byteArray)) {
        doEdit(data.byteArray);
    } else if (isAnyArrayBuffer(data.byteArray)) {
        doEdit(new Uint8Array(data.byteArray));
    } else {
        throw new Error("Not supported type");
    }
    printMemUsage(logger);
    // the ByteTransferDto has transferable symbol
    return move(new ByteTransferDto(data.metadata, data.byteArray));
}
