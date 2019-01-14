"use strict";

const promClient = require("prom-client");
const Transport = require("winston-transport");

/**
 * @typedef {object} PrometheusTransportOptions
 * @param {?object} register A specific register to use. If absent, we use
 *     the global register.
 */

/**
 * Records the number of lines logged by a Winston logger.
 */
module.exports = class PrometheusTransport extends Transport {
  /**
   * Initialize a new Prometheus transport.
   *
   * @param {?PrometheusTransportOptions} opts
   */
  constructor(opts) {
    super(opts);

    opts = opts || {};
    const register = opts.register || promClient.register;
    this._lines = new promClient.Counter({
      name: "winston_lines_total",
      help: "The number of lines logged.",
      labelNames: ["level"],
      registers: [register]
    });

    this.once("pipe", logger => {
      this._initializeLevels();
    });
  }

  // Make sure the number of log lines for each level are set to zero.
  // This helps rate() calls detect the first time a log level is used.
  // See https://www.robustperception.io/existential-issues-with-metrics
  _initializeLevels() {
    for (const level in this.levels) {
      this._lines.inc({ level }, 0);
    }
  }

  /**
   * Handle log message
   *
   * @param {object} info
   * @param {Function} callback
   */
  log(info, callback) {
    setImmediate(() => {
      this.emit("logged", info);
    });

    this._lines.inc({ level: info.level });

    callback();
  }
};
