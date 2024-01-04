import express from 'express';
import http from 'http';
import { FastFire } from 'fastfire';
import { Firestore } from 'fastfire/dist/firestore';
import bodyParser from 'body-parser';
import cors from 'cors';

import { firestore } from './firebase/firebaseApp';
import userRoutes from './api/user/user.route';
import collaboratorRoutes from './api/collaborator/collaborator.route';
import commentRoutes from './api/comment/comment.route';
import boardRoutes from './api/board/board.route';
import authRoutes from './api/auth/auth.route';
import WebSocketManager from './lib/websocket/WebSocketManager';

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

WebSocketManager.Instance.init(server);
// Init SFU Manager
