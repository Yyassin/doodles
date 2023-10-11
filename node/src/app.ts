import express from 'express';
import http from 'http';
import setUpWSS from './websockets';

const app = express();
const port = 3005;
const server = http.createServer(app);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

server.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

setUpWSS(server);
