import { Logger } from "@nestjs/common";
import { setTimeout } from "node:timers/promises";
import { isUint8Array } from "node:util/types";
import { setFlagsFromString } from "v8";
import { runInNewContext } from "vm";
import { printMemUsage } from "../format.utils";
import ByteTransferService from "./byte-transfer.service";
import ByteTransferDto from "./byte.transfer.dto";

// test array transfer between main and worker
(async () => {
    const logger = new Logger(`Main`);
    const ALLOCATE_BYTE = 104_857_600; // 100MB
    const PAUSE_GC = 10_000; // ms
    logger.log("application start start");
    printMemUsage(logger);

    const service = new ByteTransferService();

    // sending Uint8Array to the worker with data move
    const notShared = async () => {
        logger.log("not shared...");
        const originalData = new ArrayBuffer(ALLOCATE_BYTE);
        const viewData = new Uint8Array(originalData);
        viewData[0] = 1;
        viewData[1] = 2;

        printMemUsage(logger);
        let res = await service.edit(viewData);
        logger.log("returned from piscina");
        printMemUsage(logger);
        logger.log(viewData[0]); // this should be undefined because data are deallocated with the move to piscina
        if (isUint8Array(res)) {
            logger.log(res[0]); // this should be the value edited inside the worker
        }
    };
    await notShared();

    setFlagsFromString("--expose_gc");
    const gc = runInNewContext("gc"); // nocommit
    gc();

    logger.log(`waiting for gc.. pause ${PAUSE_GC}ms...`);
    await setTimeout(PAUSE_GC);
    logger.log("after gc");
    printMemUsage(logger);

    // sending payload including a Uint8Array to the worker with data move
    const notSharedPayload = async () => {
        logger.log("not shared payload...");
        const originalData = new ArrayBuffer(ALLOCATE_BYTE);
        const viewData = new Uint8Array(originalData);
        viewData[0] = 1;
        viewData[1] = 2;

        printMemUsage(logger);
        const dto = new ByteTransferDto("somemetadata", viewData);

        let res = await service.editWithPayload(dto);
        logger.log("returned from piscina");
        printMemUsage(logger);
        logger.log(viewData[0]); // this should be undefined because data are deallocated with the move to piscina
        if (isUint8Array(res)) {
            logger.log(res[0]); // this should be the value edited inside the worker
        }
    };
    await notSharedPayload();

    gc();
    logger.log(`waiting for gc.. pause ${PAUSE_GC}ms...`);
    await setTimeout(PAUSE_GC);
    logger.log("after gc");
    printMemUsage(logger);

    // sending a shared buffer to the worker
    logger.log("shared...");

    const shared = async () => {
        //// shared example
        const originalDataShared = new SharedArrayBuffer(ALLOCATE_BYTE);
        const viewDataShared = new Uint8Array(originalDataShared);
        viewDataShared[0] = 1;
        viewDataShared[1] = 2;

        printMemUsage(logger);
        await service.editShared(viewDataShared);
        logger.log("returned from piscina");
        printMemUsage(logger);
        logger.log(viewDataShared[0]);
    };
    await shared();

    logger.log("end");
})();
