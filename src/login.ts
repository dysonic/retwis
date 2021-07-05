import { goback } from './retwis';
import { Application, Request, Response } from 'express';
import { AsyncRedisClient  } from './index';

export const login = (app: Application, client: AsyncRedisClient) => {
  app.post('/login', async (req: Request, res: Response) => {

    // Form sanity checks
    if (!req.body.username || !req.body.password) {
      return goback('You need to enter both username and password to login.', res);
    }

    //  The form is ok, check if the username is available
    const username = req.body.username.trim();
    const password = req.body.password.trim();

    const userId = await client.hget('users', username);
    if (!userId) {
      return goback('Wrong username or password', res);
    }
    const realPassword = await client.hget(`user:${userId}`, 'password');
    if (realPassword !== password) {

      // tslint:disable-next-line:no-console
      console.log(`login #${userId} - supplied password:`, password, 'real password:', realPassword);

      return goback('Wrong username or password', res);
    }

    // Username / password OK, set the cookie and redirect to /index
    const authSecret = req.session.id;

    // tslint:disable-next-line:no-console
    console.log(`login successful for '${username}'. Storing authSecret: ${authSecret}`);

    client.hset(`user:${userId}`, 'auth', authSecret);

    req.session.user = {
      id: userId,
      username,
    };

    res.redirect('/')
  });
};
