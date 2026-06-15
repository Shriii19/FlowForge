export const logEvent = ({
  level = "INFO",
  event,
  socketId = null,
  room = null,
  metadata = {},
}) => {
  console.log(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      level,
      event,
      socketId,
      room,
      ...metadata,
    })
  );
};