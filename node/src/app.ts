import express from 'express';
import http from 'http';
import setUpWSS from './websockets';
import { FastFire } from 'fastfire';
import { Firestore } from 'fastfire/dist/firestore';
import bodyParser from 'body-parser';
import cors from 'cors';

import { firestore } from './firebase/firebaseApp';
import userRoutes from './routes/user.route';
import collaboratorRoutes from './routes/collaborator.route';
import commentRoutes from './routes/comment.route';
import boardRoutes from './routes/board.route';
import authRoutes from './routes/auth.route';

FastFire.initialize(firestore as Firestore);

const app = express();
const port = 3005;
export const server = http.createServer(app);
app.use(express.json()); // parse application/json
app.use(bodyParser.urlencoded({ extended: false })); // parse application/x-www-form-urlencoded
app.use(cors()); // allow cross-origin

app.get('/', (_req, res) => {
  res.send('Hello World!');
});

app.use('/user', userRoutes);
app.use('/collaborator', collaboratorRoutes);
app.use('/comment', commentRoutes);
app.use('/board', boardRoutes);
app.use('/auth', authRoutes);

server.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

setUpWSS(server);
