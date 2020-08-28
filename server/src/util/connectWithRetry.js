import sql from 'mssql';
import config from '../config/db';
import debug from '../util/log/debug';
import User from '../models/user.model';
import hashPassword from './hashPassword';

var retryWait = process.env.DB_RETRY_WAIT_SECONDS || 5;
var maxRetries = process.env.DB_MAX_RETRIES;
var currentTry = 1;

require('dotenv').config();

async function createAdminUser() {
  var username = process.env.ADMIN_USERNAME || 'admin',
    password = process.env.ADMIN_PASSWORD || 'admin',
    email = process.env.ADMIN_EMAIL || 'admin@admin.com',
    name = process.env.ADMIN_NAME || 'Admin';

  try {
    var all = await User.getAll();
    if(all.length === 0) {
      var password = await hashPassword(password);
      var user = new User(username, name, email, password, true, 'A');
      await User.create(user);
      debug(`Created initial user '${username}'`);
    }
  } catch(error) {
    console.error(`Error creating initial user '${username}'.`);
    console.error(error);
    process.exit(1);
  }
}

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
      createAdminUser();
    }
  });
}
