import { isUint8Array } from "node:util/types";
import { transferableSymbol, valueSymbol } from "piscina";

export default class ByteTransferDto {
    public metadata: string;
    public byteArray: ArrayBuffer | Uint8Array;

    constructor(metadata: string, byteArray: ArrayBuffer | Uint8Array) {
        this.metadata = metadata;
        this.byteArray = byteArray;
    }

    get [transferableSymbol]() {
        // Transfer the underlying ArrayBuffer
        if (isUint8Array(this.byteArray)) {
            return [this.byteArray.buffer];
        }
        return [this.byteArray];
    }

    get [valueSymbol]() {
        return { metadata: this.metadata, byteArray: this.byteArray };
    }
}
