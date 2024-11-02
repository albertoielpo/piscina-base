import { Logger } from "@nestjs/common";
import { resolve } from "node:path";
import { Piscina } from "piscina";
import { printMemUsage } from "../format.utils";
import { ByteTransferPayload, filename } from "./byte-transfer.worker";

export default class ByteTransferService {
    private readonly logger = new Logger(ByteTransferService.name);
    private readonly piscina = new Piscina<ByteTransferPayload, any>({
        filename: resolve(
            process.cwd(),
            "resources",
            "workers",
            "worker-wrapper.js"
        ),
        workerData: { fullpath: filename }
    });

    public edit(bytes: ByteTransferPayload): Promise<ByteTransferPayload> {
        this.logger.log("before calling piscina");
        printMemUsage(this.logger);
        return this.piscina.run(bytes, { name: "edit" });
    }

    public editShared(bytes: ByteTransferPayload): Promise<void> {
        this.logger.log("before calling piscina");
        printMemUsage(this.logger);
        return this.piscina.run(bytes, { name: "editShared" });
    }
}
