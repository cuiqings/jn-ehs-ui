export const consoleBlock = function() {
    console = {
      log: () => {},
      error: () => {},
      warn: () => {},
      table: () => {},
      debug: () => {},
      info: () => {},
    }
    fetch = function() {
      return null;
    };
}
