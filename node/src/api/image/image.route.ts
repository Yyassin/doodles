import express from 'express';
import { handleCreateImage, handleFindImageById } from './image.controller';

/**
 * Defines image routes.
 * @authors Ibrahim Almalki
 */

// The express router
const router = express.Router();

// POST create a new Image
router.post('/createImage', handleCreateImage);

// GET Image by ID
router.get('/getImage', handleFindImageById);

export default router;
