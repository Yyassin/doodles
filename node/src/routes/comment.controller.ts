import { Response, Request } from 'express';
import {
  createComment,
  findCommentById,
  updateComment,
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

const validateId = (id: string, res: Response): id is string => {
  if (id === undefined) {
    res.status(HTTP_STATUS.ERROR).json({ error: 'NO ID PROVIDED' });
    return false;
  }
  return true;
};

const notFoundError = (res: Response) =>
  res.status(HTTP_STATUS.ERROR).json({ error: 'comment not found' });

// Get comment
export const handleFindCommentById = async (req: Request, res: Response) => {
  try {
    const commentId = req.body.id; // The comment ID parameter is in the body.
    if (!validateId(commentId, res)) return;

    const comment = await findCommentById(commentId as string);

    if (comment) {
      res.status(HTTP_STATUS.SUCCESS).json({ comment });
    } else {
      return notFoundError(res);
    }
  } catch (error) {
    console.error('Error finding comment by ID:', error);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ error: 'Failed to find comment' });
  }
};

// Update comment
export const handleUpdateComment = async (req: Request, res: Response) => {
  try {
    // The comment ID and text parameters are in the body.
    const { id: commentId, fields: updatedFields } = req.body;
    if (!validateId(commentId, res)) return;
    const comment = await findCommentById(commentId);

    if (comment) {
      await updateComment(comment, updatedFields);
      const { fastFireOptions: _fastFireOptions, ...fields } = comment;
      return res.status(HTTP_STATUS.SUCCESS).json(fields);
    } else {
      return notFoundError(res);
    }
  } catch (error) {
    console.error('Error updating comment: ', error);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ error: 'Failed to update comment' });
  }
};

// Delete comment
export const handleDeleteComment = async (req: Request, res: Response) => {
  try {
    const commentId = req.body.id; // The comment ID parameter is in the body.
    if (!validateId(commentId, res)) return;

    const comment = await findCommentById(commentId as string);

    if (comment) {
      await deleteComment(comment);
      res
        .status(HTTP_STATUS.SUCCESS)
        .json({ message: 'comment deleted successfully' });
    } else {
      return notFoundError(res);
    }
  } catch (error) {
    console.error('Error deleting comment:', error);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ error: 'Failed to delete comment' });
  }
};
