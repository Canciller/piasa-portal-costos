import sql from 'mssql';
import config from '../config/db';
import debug from '../util/log/debug';

var retryWait = process.env.DB_RETRY_WAIT_SECONDS || 5;
var maxRetries = process.env.DB_MAX_RETRIES;
var currentTry = 1;

export default function connectWithRetry() {
  sql.connect(config, (error) => {
    if (error) {
      if (maxRetries !== undefined && currentTry === maxRetries) {
        console.error('Error: Failed to connect to database\n', error);
        process.exit(1);
      } else {
        console.error(
          `Error: Failed to connect to database - retrying in ${retryWait} sec\n`,
          error
        );
        currentTry++;
      }
      setTimeout(connectWithRetry, retryWait * 1000);
    } else {
      debug(`Connected to Database at ${config.server}`);
    }
  });
}
