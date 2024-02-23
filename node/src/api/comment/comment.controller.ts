import { Response, Request } from 'express';
import {
  createComment,
  findCommentById,
  updateComment,
  deleteComment,
  findCommentsByElemID,
} from '../../models/comment';
import { HTTP_STATUS } from '../../constants';
import {
  findCollaboratorById,
  findCollaboratorByIdAndBoard,
} from '../../models/collaborator';
import { findUserById } from '../../models/user';
import { getInitials } from '../../utils/misc';

/**
 * Firebase API controllers, logic for endpoint routes.
 * @author Ibrahim Almalki
 */

// TODO: JSDOC

// Create comment
export const handleCreateComment = async (req: Request, res: Response) => {
  try {
    const { elemID, commentText, userID, boardID } = req.body; // The comment parameters are in the body.
    const collabID = (await findCollaboratorByIdAndBoard(userID, boardID)).pop()
      ?.id;
    if (!validateId(collabID, res)) return;
    const comment = await createComment(elemID, commentText, collabID);

    res.status(HTTP_STATUS.SUCCESS).json({ comment });
  } catch (error) {
    console.error('Error creating comment:', error);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ error: 'Failed to create comment' });
  }
};

const validateId = (id: string | undefined, res: Response): id is string => {
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

// Get comment
export const handleFindCommentsByElemID = async (
  req: Request,
  res: Response,
) => {
  try {
    const elemID = req.query.elemID as string; // The comment ID parameter is in the body.
    const collabID = req.query.collabID as string;
    if (!validateId(elemID, res)) return;

    const comments = await Promise.all(
      (await findCommentsByElemID(elemID)).map(async (comment) => {
        const collab = await findCollaboratorById(comment.collaborator);
        const user = await findUserById(collab?.user || ' ');

        return {
          uid: comment.uid,
          username: `${user?.firstname} ${user?.lastname}`,
          avatar: user?.avatar,
          time: comment.createdAt,
          comment: comment.comment,
          likes: comment.likes.length,
          initials: getInitials(`${user?.firstname} ${user?.lastname}`),
          outlineColor: collab?.uid,
          isLiked: comment.likes.includes(collabID),
        };
      }),
    );

    res.status(HTTP_STATUS.SUCCESS).json({ comments });
  } catch (error) {
    console.error('Error finding comment by ID:', error);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ error: 'Failed to find comment' });
  }
};

// add or remove like
export const handleLike = async (req: Request, res: Response) => {
  try {
    // The comment ID and text parameters are in the body.
    const { commentID, userID, boardID, action } = req.body;
    if (!validateId(commentID, res)) return;
    const comment = await findCommentById(commentID);
    const collab = (await findCollaboratorByIdAndBoard(userID, boardID)).pop();

    if (comment && collab) {
      if (action === 'add' && !comment.likes.includes(collab.id as string)) {
        comment.likes.push(collab.id as string);
        await updateComment(comment, { likes: comment.likes });
      } else if (
        action === 'remove' &&
        comment.likes.includes(collab.id as string)
      ) {
        comment.likes = comment.likes.filter(
          (collabID) => collabID != collab.id,
        );
        await updateComment(comment, { likes: comment.likes });
      }
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
    const commentId = req.query.id as string; // The comment ID parameter is in the body.
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
