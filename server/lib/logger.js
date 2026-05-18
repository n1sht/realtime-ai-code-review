const levels = { error: 0, warn: 1, info: 2, debug: 3 };
const currentLevel = levels[process.env.LOG_LEVEL || "info"] ?? 2;

const fmt = (level, msg, meta) => {
  const entry = { timestamp: new Date().toISOString(), level, msg };
  if (meta) entry.meta = meta;
  return JSON.stringify(entry);
};

const logger = {
  error: (msg, meta) => currentLevel >= 0 && console.error(fmt("error", msg, meta)),
  warn: (msg, meta) => currentLevel >= 1 && console.warn(fmt("warn", msg, meta)),
  info: (msg, meta) => currentLevel >= 2 && console.log(fmt("info", msg, meta)),
  debug: (msg, meta) => currentLevel >= 3 && console.log(fmt("debug", msg, meta)),
};

export default logger;
