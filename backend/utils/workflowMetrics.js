const metrics = {
  connections: 0,
  disconnections: 0,
  joins: 0,
  reactions: 0,
  taskMoves: 0,
  seenEvents: 0,
};

export const incrementMetric = (metricName) => {
  if (Object.prototype.hasOwnProperty.call(metrics, metricName)) {
    metrics[metricName]++;
  }
};

export const getMetrics = () => ({
  ...metrics,
});