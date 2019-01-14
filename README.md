# winston-prometheus-transport

A Winston transport that records the numbers of log messages to a Prometheus
registry.

Prometheus is not a logging framework, so in addition to this library, you'll
almost always want a more normal transport on your logger. But it can be
useful to, for example, see how many error logs a service is printing.

This library is very young, so use it at your own risk!
