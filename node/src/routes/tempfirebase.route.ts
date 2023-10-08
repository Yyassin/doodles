import express from 'express';
import multer from 'multer';
import { handleUploadImage } from './tempfirebase.controller';

/**
 * Defines tempfirebase routes.
 * @authors Ibrahim Almalki
 */

// Multer middleware to handle file uploads
const storageMulter = multer({ storage: multer.memoryStorage() });

// The express router
const router = express.Router();

// Endpoint to handle image upload
router.post('/upload-image', storageMulter.single('image'), handleUploadImage);

export default router;
