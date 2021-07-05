import express, { Request, Response, NextFunction } from 'express';
import logger from 'morgan';
import cookieParser from 'cookie-parser';
import session from 'express-session';
// tslint:disable-next-line:no-var-requires
const asyncRedis = require('async-redis');
const app = express();
const port = 3000;
import { User } from './types/user';
import { isLoggedIn } from './retwis';
import path from 'path';
import { register } from './register';
import { login } from './login';

declare module 'express-session' {
  interface SessionData {
    user: User | null;
  }
}

const client = asyncRedis.createClient();
export type AsyncRedisClient = typeof client;

client.on('error', (error: Error) => {
  // tslint:disable-next-line:no-console
  console.error(error);
});

app.use(logger('dev'));
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(cookieParser('Harry Potter'));
app.use(session({ secret: 'Harry Potter', name: 'auth', saveUninitialized: false, resave: false }))
app.use(express.static('public'));
app.set('views', path.resolve(__dirname, '../views'));
app.set('view engine', 'pug');

app.get('/', async (req, res) => {
  const isAuthenticated = await isLoggedIn(req, client);
  // tslint:disable-next-line:no-console
  console.log('isAuthenticated:', isAuthenticated);

  if (!isAuthenticated) {
    return res.render('index');
  }

  res.redirect('/home');
});

register(app, client);
login(app, client);

app.listen(port, () => {

  // tslint:disable-next-line:no-console
  console.log(`Example app listening on port ${port}!`)
});

const authenticated = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session.user) {

    // tslint:disable-next-line:no-console
    console.warn('authenticated middleware - no user set!');

    res.redirect('/');
    return;
  }
  next();
};

app.all('*', authenticated);

app.get('/home', async (req, res) => {
  const { user } = req.session;

  // tslint:disable-next-line:no-console
  console.warn('home - user:', user);

  res.render('home', user);
});


