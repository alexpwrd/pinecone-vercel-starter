const levels = {
  error: 0,
  warn: 1,
  info: 2,
  verbose: 3,
  debug: 4,
  silly: 5,
};

const level = levels[process.env.LOG_LEVEL || 'info'];

const logger = {
  error: (...args) => level >= levels.error && console.error(...args),
  warn: (...args) => level >= levels.warn && console.warn(...args),
  info: (...args) => level >= levels.info && console.log(...args),
  verbose: (...args) => level >= levels.verbose && console.log(...args),
  debug: (...args) => level >= levels.debug && console.log(...args),
  silly: (...args) => level >= levels.silly && console.log(...args),
};

export default logger;