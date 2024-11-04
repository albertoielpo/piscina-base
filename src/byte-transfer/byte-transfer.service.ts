import { Logger } from "@nestjs/common";
import { resolve } from "node:path";
import { isUint8Array } from "node:util/types";
import { move, Piscina } from "piscina";
import FormatUtils from "../format.utils";
import ByteTransferDto from "./byte-transfer.dto";
import { filename, PiscinaTransferable } from "./byte-transfer.worker";

export default class ByteTransferService {
    private readonly logger = new Logger(ByteTransferService.name);
    private readonly piscina = new Piscina<
        PiscinaTransferable,
        PiscinaTransferable
    >({
        filename: resolve(
            process.cwd(),
            "resources",
            "workers",
            "worker-wrapper.js"
        ),
        workerData: { fullpath: filename }
    });

    public edit(bytes: Uint8Array | ArrayBuffer): Promise<PiscinaTransferable> {
        this.logger.log("before calling piscina");
        FormatUtils.printMemUsage(this.logger);
        // here data are moved because ArrayBuffer is transferable
        return this.piscina.run(
            move(isUint8Array(bytes) ? bytes.buffer : bytes),
            { name: "edit" }
        );
    }

    public editWithPayload(
        payload: ByteTransferDto
    ): Promise<PiscinaTransferable> {
        this.logger.log("before calling piscina");
        FormatUtils.printMemUsage(this.logger);
        // here data are moved using ByteTransferDto (transferableSymbol)
        return this.piscina.run(move(payload), { name: "editWithPayload" });
    }

    public async editWithPayloadBoth(
        payload: ByteTransferDto
    ): Promise<ByteTransferDto> {
        this.logger.log("before calling piscina");
        FormatUtils.printMemUsage(this.logger);
        // here data are moved using ByteTransferDto (transferableSymbol)
        const res = await this.piscina.run(move(payload), {
            name: "editWithPayloadBoth"
        });
        return res as ByteTransferDto;
    }

    public async editShared(
        bytes: Uint8Array,
        mutexSab: SharedArrayBuffer
    ): Promise<void> {
        this.logger.log("before calling piscina");
        FormatUtils.printMemUsage(this.logger);
        /**
         * Here there is no need to move because bytes contains a SharedArrayBuffer reference
         * and by default is copied the pointer and not the data
         * It's important to transfer also mutexSab in order to sync access
         */
        await this.piscina.run(
            { data: bytes.buffer, mutexSab },
            { name: "editShared" }
        );
    }
}
