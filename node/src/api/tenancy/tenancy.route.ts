import express from 'express';
import { roomTenancy } from './tenancy.controller';

/**
 * Defines Tenancy routes.
 * @author Yousef Yassin
 */

// The express router
const router = express.Router();

// Endpoint for adding a consumer to the SFUManager.
router.put('/room', roomTenancy);

export default router;
