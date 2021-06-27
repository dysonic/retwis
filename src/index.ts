import express from 'express';
import logger from 'morgan';
const app = express();
const port = 3000;

app.use(logger('dev'));

app.get('/', (req, res) => {
  res.send('Hello World!')
});

app.listen(port, () => {
  // tslint:disable-next-line:no-console
  console.log(`Example app listening on port ${port}!`)
});
