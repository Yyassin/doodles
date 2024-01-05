import express from 'express';
import { addProducer, addConsumer, pollProducer } from './sfu.controller';
/**
 * Defines WebRTC SFU routes.
 * @author Yousef Yassin
 */

// The express router
const router = express.Router();

router.post('/subscribe', addConsumer);
router.post('/broadcast', addProducer);
router.put('/poll', pollProducer);

export default router;
