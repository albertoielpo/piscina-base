import { Logger } from "@nestjs/common";
import { setTimeout } from "node:timers/promises";
import { printMemUsage } from "../format.utils";
import ByteTransferService from "./byte-transfer.service";
import { ByteTransferPayload } from "./byte-transfer.worker";

// test array transfer between main and worker
(async () => {
    const logger = new Logger(`Main`);
    logger.log("application start start");

    const service = new ByteTransferService();

    await setTimeout(100);
    logger.log("not shared...");
    const originalData = new ArrayBuffer(10_485_760); // 10 MB
    const viewData = new Uint8Array(originalData);
    viewData[0] = 1;
    viewData[1] = 2;

    // logger.log(viewData);
    printMemUsage(logger);
    let res: ByteTransferPayload | null = null;
    for (let ii = 0; ii < 30; ii++) {
        res = await service.edit(viewData);
    }
    printMemUsage(logger);
    logger.log(viewData[0]);
    if (res && ArrayBuffer.isView(res)) {
        logger.log(res[0]);
    }

    await setTimeout(100);

    logger.log("shared...");

    //// shared example
    const originalDataShared = new SharedArrayBuffer(10_485_760); // 10 MB
    const viewDataShared = new Uint8Array(originalDataShared);
    viewDataShared[0] = 1;
    viewDataShared[1] = 2;

    printMemUsage(logger);
    for (let ii = 0; ii < 30; ii++) {
        await service.editShared(viewDataShared);
    }
    printMemUsage(logger);
    logger.log(viewDataShared[0]);

    logger.log("end");
})();
