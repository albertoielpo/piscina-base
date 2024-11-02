import { Logger } from "@nestjs/common";
import { setTimeout } from "node:timers/promises";
import { setFlagsFromString } from "v8";
import { runInNewContext } from "vm";
import { printMemUsage } from "../format.utils";
import ByteTransferService from "./byte-transfer.service";
import { ByteTransferPayload } from "./byte-transfer.worker";

// test array transfer between main and worker
(async () => {
    const logger = new Logger(`Main`);
    const ALLOCATE_BYTE = 104_857_600; // 100MB
    const PAUSE_GC = 10_000; // ms
    logger.log("application start start");

    const service = new ByteTransferService();

    const notShared = async () => {
        logger.log("not shared...");
        const originalData = new ArrayBuffer(ALLOCATE_BYTE);
        const viewData = new Uint8Array(originalData);
        viewData[0] = 1;
        viewData[1] = 2;

        // logger.log(viewData);
        printMemUsage(logger);
        let res: ByteTransferPayload | null = null;
        res = await service.edit(viewData);
        printMemUsage(logger);
        logger.log(viewData[0]);
        if (res && ArrayBuffer.isView(res)) {
            logger.log(res[0]);
        }
    };
    await notShared();

    setFlagsFromString("--expose_gc");
    const gc = runInNewContext("gc"); // nocommit
    gc();

    logger.log(`waiting for gc.. pause ${PAUSE_GC}ms...`);
    await setTimeout(PAUSE_GC);

    logger.log("shared...");

    const shared = async () => {
        //// shared example
        const originalDataShared = new SharedArrayBuffer(ALLOCATE_BYTE);
        const viewDataShared = new Uint8Array(originalDataShared);
        viewDataShared[0] = 1;
        viewDataShared[1] = 2;

        printMemUsage(logger);
        await service.editShared(viewDataShared);
        printMemUsage(logger);
        logger.log(viewDataShared[0]);
    };
    await shared();

    logger.log("end");
})();
