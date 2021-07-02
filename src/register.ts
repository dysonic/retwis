import { goback } from './retwis';
import { Application, Request, Response } from 'express';
import { AsyncRedisClient  } from './index';

export const register = (app: Application, client: AsyncRedisClient) => {
  app.post('/register', async (req: Request, res: Response) => {

    // Form sanity checks
    if (!req.body.username || !req.body.password || !req.body.password2) {
      return goback('Every field of the registration form is needed!', res);
    }
    if (req.body.password !== req.body.password2) {
      return goback('The two password fields don\'t match!', res);
    }

    // The form is ok, check if the username is available
    const username = req.body.username.trim();
    const password = req.body.password.trim();

    const existingUsername = await client.hget('users', username);
    if (existingUsername) {
      return goback('Sorry the selected username is already in use.', res);
    }

    // Everything is ok, Register the user!
    const userId = await client.incr('next_user_id');
    const userIdStr = String(userId);

    const authSecret = req.session.id;

    // tslint:disable-next-line:no-console
    console.log(`registration successful for '${username}'. Storing authSecret: ${authSecret}`);

    await client.hset('users', username, userIdStr);
    await client.hmset(`user:${userId}`,
        'username', username,
        'password', password,
        'auth', authSecret);
    await client.hset('auths', authSecret, userIdStr);

    // PHP time() returns the number of SECONDS since the Unix Epoch (January 1 1970 00:00:00 GMT).
    // JS Date.now() method returns the number of MILLISECONDS elapsed since January 1, 1970 00:00:00 UTC.
    // Use seconds:
    const nowSeconds = Math.floor(Date.now());
    await client.zadd('users_by_time', nowSeconds, username);

    // User registered! Login her / him.
    // setcookie('auth',$authsecret,time()+3600*24*365);
    req.session.user = {
      id: userIdStr,
      username,
    }

    res.render('register', { username });
  });
};
