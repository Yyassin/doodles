import express from 'express';
import {
  handleCreateImage,
  handleDeleteImage,
  handleFindImageById,
  handleUpdateImage,
} from './image.controller';

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

// PUT update Image
router.put('/updateImage', handleUpdateImage);

// DELETE Image by ID
router.delete('/deleteImage', handleDeleteImage);

export default router;
