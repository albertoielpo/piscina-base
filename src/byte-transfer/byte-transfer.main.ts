import { Logger } from "@nestjs/common";
import { setTimeout } from "node:timers/promises";
import { isAnyArrayBuffer, isUint8Array } from "node:util/types";
import { setFlagsFromString } from "v8";
import { runInNewContext } from "vm";
import FormatUtils from "../format.utils";
import { Mutex } from "../mutex";
import ByteTransferDto from "./byte-transfer.dto";
import ByteTransferService from "./byte-transfer.service";

const logger = new Logger(`Main`);
const ALLOCATE_BYTE = 10_485_760; // 10MB
const PAUSE_GC = 10_000; // ms

/**
 * This test send to the worker raw data and expected back raw data
 * Move must apply
 * @param service
 */
async function sendRaw(service: ByteTransferService) {
    logger.log("not shared...");
    const originalData = new ArrayBuffer(ALLOCATE_BYTE);
    const viewData = new Uint8Array(originalData);
    viewData[0] = 1;
    viewData[1] = 2;

    FormatUtils.printMemUsage(logger);
    let res = await service.edit(viewData);
    logger.log("returned from piscina");
    FormatUtils.printMemUsage(logger);
    logger.log(
        `this should be undefined because data are deallocated with the move to piscina : ${viewData[0]}`
    );
    if (isUint8Array(res)) {
        logger.warn(
            "data are Uint8Array.. check the if data are truly transferable"
        );
        logger.log(res[0]);
    } else if (isAnyArrayBuffer(res)) {
        logger.log("Data are in raw format, good");
        const v = new Uint8Array(res);
        logger.log(v[0]); // this should be the value edited inside the worker
    } else {
        logger.error("Bad returned data");
    }
}

/**
 * This test send to the worker a transferable payload data and expected back raw data
 * Move must apply in both direction
 * @param service
 */
async function sendWithPayload(service: ByteTransferService) {
    logger.log("not shared payload only to the worker...");
    const originalData = new ArrayBuffer(ALLOCATE_BYTE);
    const viewData = new Uint8Array(originalData);
    viewData[0] = 1;
    viewData[1] = 2;

    FormatUtils.printMemUsage(logger);
    const dto = new ByteTransferDto("somemetadata", viewData);

    let res = await service.editWithPayload(dto);
    logger.log("returned from piscina");
    FormatUtils.printMemUsage(logger);
    logger.log(
        `this should be undefined because data are deallocated with the move to piscina : ${viewData[0]}`
    );
    if (isUint8Array(res)) {
        logger.warn(
            "data are Uint8Array.. check the if data are truly transferable"
        );
        logger.log(res[0]); // in case of payload data are recreated
    } else if (isAnyArrayBuffer(res)) {
        logger.log("Data are in raw format, good");
        const v = new Uint8Array(res);
        logger.log(v[0]);
    } else {
        logger.error("Bad returned data");
    }
}

/**
 * This test send to the worker a transferable payload data and expected back a transferable payload
 * Move must apply in both direction
 * @param service
 */
async function sendWithPayloadBoth(service: ByteTransferService) {
    logger.log("not shared payload both...");
    const originalData = new ArrayBuffer(ALLOCATE_BYTE);
    const viewData = new Uint8Array(originalData);
    viewData[0] = 1;
    viewData[1] = 2;

    FormatUtils.printMemUsage(logger);
    const dto = new ByteTransferDto("somemetadata", viewData);

    let res = await service.editWithPayloadBoth(dto);
    logger.log("returned from piscina");
    FormatUtils.printMemUsage(logger);
    logger.log(`print metadata: ${res.metadata}`);
    logger.log(
        `this should be undefined because data are deallocated with the move to piscina : ${viewData[0]}`
    );
    if (isUint8Array(res.byteArray)) {
        // type array is recreated
        logger.log(
            "data are Uint8Array.. check the the external memory if deallocated"
        );
        logger.log(res.byteArray[0]);
    } else if (isAnyArrayBuffer(res.byteArray)) {
        logger.log("Data are in raw format, no needs to check");
        const v = new Uint8Array(res.byteArray);
        logger.log(v[0]);
    } else {
        logger.error("Bad returned data");
    }
}

async function sharedBuffer(service: ByteTransferService) {
    // shared example
    const originalDataShared = new SharedArrayBuffer(ALLOCATE_BYTE);
    const viewDataShared = new Uint8Array(originalDataShared);

    // this array should follow originalDataShared
    const mutexSab = new SharedArrayBuffer(4);
    const mutex = new Mutex(mutexSab);

    /**
     * Every time that there is a data manipulation on a shared array buffer a lock needs to be applied
     * between lock() and unlock() the other threads that trying to access are paused
     * Important: if a double lock is applied in the same thread, that is paused forever
     * Always try finally a mutex block
     */
    try {
        mutex.lock();
        viewDataShared[0] = 1;
        viewDataShared[1] = 2;
    } finally {
        mutex.unlock();
    }

    FormatUtils.printMemUsage(logger);
    await service.editShared(viewDataShared, mutexSab);
    logger.log("returned from piscina");
    FormatUtils.printMemUsage(logger);
    logger.log(`Data must have changed: ${viewDataShared[0]}`);
}

async function callGc() {
    setFlagsFromString("--expose_gc");
    const gc = runInNewContext("gc"); // nocommit
    gc();
    logger.log(`waiting for gc.. pause ${PAUSE_GC}ms...`);
    await setTimeout(PAUSE_GC);
    logger.log("after gc");
}

// test array transfer between main and worker
(async () => {
    logger.log("application start start");
    FormatUtils.printMemUsage(logger);

    const service = new ByteTransferService();

    if (true) {
        // sending raw data to the worker with data move
        await sendRaw(service);
        await callGc();
        FormatUtils.printMemUsage(logger);
    }

    if (true) {
        // sending payload including a raw data to the worker with data move
        await sendWithPayload(service);
        await callGc();
        FormatUtils.printMemUsage(logger);
    }

    if (true) {
        // sending payload including a raw data to the worker with data move
        await sendWithPayloadBoth(service);
        await callGc();
        FormatUtils.printMemUsage(logger);
    }

    if (true) {
        // sending a shared buffer to the worker
        logger.log("shared...");
        await sharedBuffer(service);
        FormatUtils.printMemUsage(logger);
    }

    logger.log("end");
})();
