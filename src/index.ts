import express from 'express';
import logger from 'morgan';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import redis from 'redis';
const app = express();
const port = 3000;
import { User } from './types/user';
import { asyncClient } from './helpers/redis';
import { isLoggedIn } from './retwis';
import path from 'path';

declare module 'express-session' {
  interface SessionData {
    user: User | null;
  }
}

const client = redis.createClient();
const clientAsync = asyncClient(client);

client.on('error', error => {
  // tslint:disable-next-line:no-console
  console.error(error);
});

app.use(logger('dev'));
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(cookieParser());
app.use(session({ secret: 'Harry Potter', name: 'auth', saveUninitialized: false, resave: false }))
app.set('views', path.resolve(__dirname, '../views'));
app.set('view engine', 'pug');

app.get('/', async (req, res) => {
  const isAuthenticated = await isLoggedIn(req, clientAsync);
  // tslint:disable-next-line:no-console
  console.log('isAuthenticated:', isAuthenticated);

  if (!isAuthenticated) {
    return res.render('index');
  }

  res.send('Hello World!')
  // res.render('home');
});

app.listen(port, () => {
  // tslint:disable-next-line:no-console
  console.log(`Example app listening on port ${port}!`)
});
