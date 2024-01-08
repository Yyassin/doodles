import { Response, Request } from 'express';
import {
  createBoard,
  findBoardById,
  updateBoard,
  deleteBoard,
} from '../../models/board';
import { HTTP_STATUS } from '../../constants';

/**
 * Firebase API controllers, logic for endpoint routes.
 * @author Ibrahim Almalki
 */

// TODO: JSDOC

// Create board
export const handleCreateBoard = async (req: Request, res: Response) => {
  try {
    const { serialized, title, tags, shareUrl, collaborators } = req.body; // The board parameters are in the body.
    const board = await createBoard(
      serialized,
      title,
      tags,
      shareUrl,
      collaborators,
    );

    res.status(HTTP_STATUS.SUCCESS).json({ board });
  } catch (error) {
    console.error('Error creating board:', error);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ error: 'Failed to create board' });
  }
};

const validateId = (id: string, res: Response): id is string => {
  if (id === undefined) {
    res.status(HTTP_STATUS.ERROR).json({ error: 'No ID provided' });
    return false;
  }
  return true;
};

const notFoundError = (res: Response) =>
  res.status(HTTP_STATUS.ERROR).json({ error: 'board not found' });

// Get board
export const handleFindBoardById = async (req: Request, res: Response) => {
  try {
    const boardId = req.body.id; // The board ID parameter is in the body.
    if (!validateId(boardId, res)) return;
    const board = await findBoardById(boardId as string);

    return board
      ? res.status(HTTP_STATUS.SUCCESS).json({ board })
      : notFoundError(res);
  } catch (error) {
    console.error('Error finding board by ID:', error);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ error: 'Failed to find board' });
  }
};

// Update board
export const handleUpdateBoard = async (req: Request, res: Response) => {
  try {
    // The board ID and new parameters are in the body.
    const { id: boardId, fields: updatedFields } = req.body;
    if (!validateId(boardId, res)) return;
    const board = await findBoardById(boardId);

    if (board) {
      await updateBoard(board, updatedFields);
      const { fastFireOptions: _fastFireOptions, ...fields } = board; // TODO(yousef): Should make a helper method to extract the options
      return res.status(HTTP_STATUS.SUCCESS).json(fields);
    } else {
      return notFoundError(res);
    }
  } catch (error) {
    console.error('Error updating board: ', error);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ error: 'Failed to update board' });
  }
};

// Delete board
export const handleDeleteBoard = async (req: Request, res: Response) => {
  try {
    const boardId = req.body.id; // The board ID parameter is in the body.
    if (!validateId(boardId, res)) return;
    const board = await findBoardById(boardId);

    if (board) {
      await deleteBoard(board);
      return res
        .status(HTTP_STATUS.SUCCESS)
        .json({ message: 'board deleted successfully' });
    } else {
      return notFoundError(res);
    }
  } catch (error) {
    console.error('Error deleting board:', error);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ error: 'Failed to delete board' });
  }
};
