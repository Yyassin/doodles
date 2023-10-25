import express from 'express';
import http from 'http';
import setUpWSS from './websockets';
import userRoutes from './routes/user.route';
import collaboratorRoutes from './routes/collaborator.route';
import bodyParser from 'body-parser';
import cors from 'cors';

import { FastFire } from 'fastfire';
import { firestore } from './firebase/firebaseApp';
FastFire.initialize(firestore as any);

const app = express();
const port = 3005;
const server = http.createServer(app);
app.use(express.json()); // parse application/json
app.use(bodyParser.urlencoded({ extended: false })); // parse application/x-www-form-urlencoded
app.use(cors()); // allow cross-origin
app.get('/', (req, res) => {
  res.send('Hello World!');
});

server.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

app.use('/user', userRoutes);
app.use('/collaborator', collaboratorRoutes);

setUpWSS(server);
