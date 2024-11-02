import { Logger } from "@nestjs/common";
import { resolve } from "node:path";
import { move, Piscina } from "piscina";
import { printMemUsage } from "../format.utils";
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
        printMemUsage(this.logger);
        return this.piscina.run(move(bytes), { name: "edit" });
    }

    public async editShared(
        bytes: Uint8Array | SharedArrayBuffer
    ): Promise<void> {
        this.logger.log("before calling piscina");
        printMemUsage(this.logger);
        await this.piscina.run(bytes, { name: "editShared" });
    }
}
