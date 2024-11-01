const { workerData } = require("node:worker_threads");

if (workerData.fullpath.endsWith(".ts")) {
    // eslint-disable-next-line global-require,import/no-extraneous-dependencies
    require("ts-node").register();
}
// eslint-disable-next-line import/no-dynamic-require
module.exports = require(workerData.fullpath);
