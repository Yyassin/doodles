import express from 'express';
import { handleGetToken } from './token.controller';

/**
 * Defines tempfirebase routes.
 * @authors Zakariyya Almalki
 */

// The express router
const router = express.Router();

// Endpoint to handle token
router.post('/token', handleGetToken);

export default router;
