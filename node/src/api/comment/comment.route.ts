import express from 'express';
import {
  handleLike,
  handleCreateComment,
  handleDeleteComment,
  handleFindCommentById,
  handleFindCommentsByElemID,
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

// GET comments by elemID
router.get('/getComments', handleFindCommentsByElemID);

// GET comment by ID
router.get('/getComment', handleFindCommentById);

// PUT add user like
router.put('/handleLike', handleLike);

// PUT update comment
router.put('/updateComment', handleUpdateComment);

// DELETE comment by ID
router.delete('/deleteComment', handleDeleteComment);

export default router;
