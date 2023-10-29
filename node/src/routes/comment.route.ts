import express from 'express';
import {
  handleCreateComment,
  handleDeleteComment,
  handleFindCommentById,
  handleUpdateComment,
} from './comment.controller';

/**
 * Defines comment routes.
 * @authors Ibrahim Almalki
 */

// The express router
const router = express.Router();

// POST create a new comment
router.post('/createComment', handleCreateComment);

// GET comment by ID
router.get('/getComment', handleFindCommentById);

// PUT update comment
router.put('/updateComment', handleUpdateComment);

// DELETE comment by ID
router.delete('/deleteComment', handleDeleteComment);

export default router;
