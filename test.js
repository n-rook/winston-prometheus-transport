const promClient = require("prom-client");
const winston = require("winston");
const expect = require("chai").expect;

const PrometheusTransport = require(".");

describe("PrometheusTransport", function() {
  beforeEach(function() {
    promClient.register.clear();
  });

  it("registers default labels", function() {
    winston.createLogger({
      transports: [new PrometheusTransport()]
    });

    for (const l of ["error", "warn", "info", "verbose", "debug", "silly"]) {
      expect(promClient.register.metrics()).to.include(
        `winston_lines_total{level="${l}"} 0`
      );
    }
  });

  it("registers syslog levels", function() {
    winston.createLogger({
      levels: winston.config.syslog.levels,
      transports: [new PrometheusTransport()]
    });
    expect(promClient.register.metrics()).to.include("notice");
    expect(promClient.register.metrics()).not.to.include("silly");
  });

  it("increments metrics when logging", function() {
    const logger = winston.createLogger({
      transports: [new PrometheusTransport()]
    });
    logger.info("hi");
    logger.info("hi");
    logger.warn("oh no");
    expect(promClient.register.metrics()).to.include(
      'winston_lines_total{level="info"} 2'
    );
    expect(promClient.register.metrics()).to.include(
      'winston_lines_total{level="warn"} 1'
    );
  });

  it("can use a different registry", function() {
    const someOtherRegistry = new promClient.Registry();
    const logger = winston.createLogger({
      transports: [new PrometheusTransport({ register: someOtherRegistry })]
    });
    logger.info("hi");
    expect(someOtherRegistry.metrics()).to.include(
      'winston_lines_total{level="info"} 1'
    );
    expect(promClient.register.metrics()).not.to.include("winston_lines_total");
  });
});
