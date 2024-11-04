export default class FormatUtils {
    /**
     * Format as human readable byte
     * 1024b = 1kB
     * @param size
     * @returns
     */
    public static byte(size: number): string {
        const ii = size === 0 ? 0 : Math.floor(Math.log(size) / Math.log(1024));
        return (
            +(size / Math.pow(1024, ii)).toFixed(2) * 1 +
            " " +
            ["B", "kB", "MB", "GB", "TB"][ii]
        );
    }

    /**
     * Print memory usage using application logger
     * @param logger
     */
    public static printMemUsage(logger: { log: Function }): void {
        const memUsage = process.memoryUsage();
        logger.log("---");
        logger.log(`rss: ${FormatUtils.byte(memUsage.rss)}`);
        logger.log(`heapTotal: ${FormatUtils.byte(memUsage.heapTotal)}`);
        logger.log(`heapUsed: ${FormatUtils.byte(memUsage.heapUsed)}`);
        logger.log(`external: ${FormatUtils.byte(memUsage.external)}`);
        logger.log(`arrayBuffers: ${FormatUtils.byte(memUsage.arrayBuffers)}`);
        logger.log("---");
    }
}
