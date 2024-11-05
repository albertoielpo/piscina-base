import { transferableSymbol, valueSymbol } from "piscina";

export default class ByteTransferDto {
    public metadata: string;
    public byteArray: ArrayBuffer; // better to be strict to a transferable

    constructor(metadata: string, byteArray: ArrayBuffer) {
        this.metadata = metadata;
        this.byteArray = byteArray;
    }

    get [transferableSymbol]() {
        // Transfer the underlying ArrayBuffer
        if (ArrayBuffer.isView(this.byteArray)) {
            // safety check.. if arrives a view then use the ArrayBuffer
            return [this.byteArray.buffer];
        }
        return [this.byteArray];
    }

    get [valueSymbol]() {
        return { metadata: this.metadata, byteArray: this.byteArray };
    }
}
