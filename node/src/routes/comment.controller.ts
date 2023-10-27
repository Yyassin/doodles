import { Response, Request } from 'express';
import {
  createComment,
  findCommentById,
  updateCommentText,
  deleteComment,
} from '../models/comment';
import { HTTP_STATUS } from '../constants';

/**
 * Firebase API controllers, logic for endpoint routes.
 * @author Ibrahim Almalki
 */

// TODO: JSDOC

// Create comment
export const handleCreateComment = async (req: Request, res: Response) => {
  try {
    const { text, collaborator } = req.body; // The comment parameters are in the body.
    const comment = await createComment(text, collaborator);

    res.status(HTTP_STATUS.SUCCESS).json({ comment });
  } catch (error) {
    console.error('Error creating comment:', error);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ error: 'Failed to create comment' });
  }
};

// Get comment
export const handleFindCommentById = async (req: Request, res: Response) => {
  try {
    const commentId = req.query.id; // The comment ID parameter is in the URL.
    if (commentId === undefined) {
      res.status(HTTP_STATUS.ERROR).json({ error: 'No ID provided' });
      return;
    }
    const comment = await findCommentById(commentId as string);

    if (comment) {
      res.status(HTTP_STATUS.SUCCESS).json({ comment });
    } else {
      res.status(HTTP_STATUS.ERROR).json({ error: 'comment not found' });
    }
  } catch (error) {
    console.error('Error finding comment by ID:', error);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ error: 'Failed to find comment' });
  }
};

// Update comment text
export const handleUpdateText = async (req: Request, res: Response) => {
  try {
    const commentId = req.body.id; // // The comment ID and text parameters are in the body.
    const newText = req.body.newText;
    if (commentId === undefined) {
      res.status(HTTP_STATUS.ERROR).json({ error: 'No ID provided' });
      return;
    }
    const comment = await findCommentById(commentId as string);

    if (comment) {
      await updateCommentText(comment, newText);
      res.status(HTTP_STATUS.SUCCESS).json({ newText });
    } else {
      res.status(HTTP_STATUS.ERROR).json({ error: 'comment not found' });
    }
  } catch (error) {
    console.error('Error updating comment text:', error);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ error: 'Failed to update comment text' });
  }
};

// Delete comment
export const handleDeleteComment = async (req: Request, res: Response) => {
  try {
    const commentId = req.body.id; // The comment ID parameter is in the body.
    if (commentId === undefined) {
      res.status(HTTP_STATUS.ERROR).json({ error: 'No ID provided' });
      return;
    }
    const comment = await findCommentById(commentId as string);

    if (comment) {
      await deleteComment(comment);
      res
        .status(HTTP_STATUS.SUCCESS)
        .json({ message: 'comment deleted successfully' });
    } else {
      res.status(HTTP_STATUS.ERROR).json({ error: 'comment not found' });
    }
  } catch (error) {
    console.error('Error deleting comment:', error);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ error: 'Failed to delete comment' });
  }
};
