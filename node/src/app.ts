import express from 'express';
import http from 'http';
import { FastFire } from 'fastfire';
import { Firestore } from 'fastfire/dist/firestore';
import bodyParser from 'body-parser';
import cors from 'cors';

import { firestore } from './firebase/firebaseApp';
import { websocketManager } from './lib/websocket/WebSocketManager';
import { Logger } from './utils/Logger';
import { LOG_LEVEL } from './constants';
import { sfuManager } from './lib/webrtc/SFUManager';
import userRoutes from './api/user/user.route';
import collaboratorRoutes from './api/collaborator/collaborator.route';
import commentRoutes from './api/comment/comment.route';
import boardRoutes from './api/board/board.route';
import authRoutes from './api/auth/auth.route';
import sfuRoutes from './api/sfu/sfu.route';

const mainLogger = new Logger('MainModule', LOG_LEVEL);
const port = 3005;

FastFire.initialize(firestore as Firestore);
const app = express();

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
app.use('/sfu', sfuRoutes);

server.listen(port, () => {
  mainLogger.info(`Example app listening on port ${port}.`);
});

websocketManager.init(server);
sfuManager.init();
