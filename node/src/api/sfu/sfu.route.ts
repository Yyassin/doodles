import express from 'express';
import { addProducer, addConsumer, pollProducer } from './sfu.controller';
/**
 * Defines WebRTC SFU routes.
 * @author Yousef Yassin
 */

// The express router
const router = express.Router();

// Endpoint for adding a consumer to the SFUManager.
router.post('/subscribe', addConsumer);
// Endpoint for adding a producer to the SFUManager.
router.post('/broadcast', addProducer);
// Endpoint for polling the SFUManager to check if a room has an active producer.
router.put('/poll', pollProducer);

export default router;
