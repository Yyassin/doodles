import express from 'express';
import { handleGetToken } from './auth.controller';

/**
 * Defines auth routes.
 * @authors Zakariyya Almalki
 */

// The express router
const router = express.Router();

// Endpoint to handle token
router.post('/token', handleGetToken);

export default router;
