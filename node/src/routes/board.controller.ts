import { Response, Request } from 'express';
import {
  createBoard,
  findBoardById,
  updateBoardTitle,
  deleteBoard,
} from '../models/board';
import { HTTP_STATUS } from '../constants';

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

// Get board
export const handleFindBoardById = async (req: Request, res: Response) => {
  try {
    const boardId = req.query.id; // The board ID parameter is in the URL.
    if (boardId === undefined) {
      res.status(HTTP_STATUS.ERROR).json({ error: 'No ID provided' });
      return;
    }
    const board = await findBoardById(boardId as string);

    if (board) {
      res.status(HTTP_STATUS.SUCCESS).json({ board });
    } else {
      res.status(HTTP_STATUS.ERROR).json({ error: 'board not found' });
    }
  } catch (error) {
    console.error('Error finding board by ID:', error);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ error: 'Failed to find board' });
  }
};

// Update board title
export const handleUpdateBoardTitle = async (req: Request, res: Response) => {
  try {
    const boardId = req.body.id; // // The board ID and title parameters are in the body.
    const newTitle = req.body.newTitle;
    if (boardId === undefined) {
      res.status(HTTP_STATUS.ERROR).json({ error: 'No ID provided' });
      return;
    }
    const board = await findBoardById(boardId as string);

    if (board) {
      await updateBoardTitle(board, newTitle);
      res.status(HTTP_STATUS.SUCCESS).json({ newTitle });
    } else {
      res.status(HTTP_STATUS.ERROR).json({ error: 'board not found' });
    }
  } catch (error) {
    console.error('Error updating board text:', error);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ error: 'Failed to update board text' });
  }
};

// Delete board
export const handleDeleteBoard = async (req: Request, res: Response) => {
  try {
    const boardId = req.body.id; // The board ID parameter is in the body.
    if (boardId === undefined) {
      res.status(HTTP_STATUS.ERROR).json({ error: 'No ID provided' });
      return;
    }
    const board = await findBoardById(boardId as string);

    if (board) {
      await deleteBoard(board);
      res
        .status(HTTP_STATUS.SUCCESS)
        .json({ message: 'board deleted successfully' });
    } else {
      res.status(HTTP_STATUS.ERROR).json({ error: 'board not found' });
    }
  } catch (error) {
    console.error('Error deleting board:', error);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ error: 'Failed to delete board' });
  }
};
