import { Logger } from "@nestjs/common";
import FibonacciService from "./fibonacci.service";

// exec fibonacci inside a separate worker then await all results
(async () => {
    const logger = new Logger(`Main`);
    logger.log("application start start");
    const service = new FibonacciService();

    const data = [42, 10, 6];
    const res = await Promise.all(data.map((x) => service.fibonacci(x)));

    for (let ii = 0; ii < data.length; ii++) {
        logger.log(`Fibonacci ${data[ii]}: ${res[ii]}`);
    }

    logger.log("end");
})();
