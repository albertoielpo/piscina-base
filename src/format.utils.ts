export function humanFileSize(size: number): string {
    var i = size == 0 ? 0 : Math.floor(Math.log(size) / Math.log(1024));
    return (
        +(size / Math.pow(1024, i)).toFixed(2) * 1 +
        " " +
        ["B", "kB", "MB", "GB", "TB"][i]
    );
}

export function printMemUsage(logger: { log: Function }): void {
    const memUsage = process.memoryUsage();
    logger.log("---");
    logger.log(`rss: ${humanFileSize(memUsage.rss)}`);
    logger.log(`heapTotal: ${humanFileSize(memUsage.heapTotal)}`);
    logger.log(`heapUsed: ${humanFileSize(memUsage.heapUsed)}`);
    logger.log(`external: ${humanFileSize(memUsage.external)}`);
    logger.log(`arrayBuffers: ${humanFileSize(memUsage.arrayBuffers)}`);
    logger.log("---");
}
