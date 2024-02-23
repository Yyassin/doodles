import { Response, Request } from 'express';
import {
  createBoard,
  findBoardById,
  updateBoard,
  deleteBoard,
  findBoardsByCollaboratorsId,
} from '../../models/board';
import { HTTP_STATUS } from '../../constants';
import {
  createCollaborator,
  deleteCollaborator,
  findCollaboratorById,
  findCollaboratorsById,
} from '../../models/collaborator';

/**
 * Firebase API controllers, logic for endpoint routes.
 * @author Ibrahim Almalki, Abdalla Abdelhadi, Zakariyya Almalki
 */

// TODO: JSDOC

// Create board
export const handleCreateBoard = async (req: Request, res: Response) => {
  try {
    const { user, serialized, title, shareUrl } = req.body; // The board parameters are in the body.

    const collaborator = await createCollaborator('edit', user);

    const board = await createBoard(serialized, title, shareUrl, [
      collaborator.uid,
    ]);

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
    const boardId = req.query.id as string; // The board ID parameter is in the body.
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

// Function to get boards associated with a collaborator
export const handleGetCollaboratorBoards = async (
  req: Request,
  res: Response,
) => {
  try {
    const userID = req.query.userID as string;
    if (!userID) {
      return res
        .status(HTTP_STATUS.ERROR)
        .json({ error: 'No user ID provided' });
    }

    const collaborators = (await findCollaboratorsById(userID)).map(
      (collab) => collab.uid,
    );

    if (collaborators.length === 0) {
      return res.status(HTTP_STATUS.SUCCESS).json({ boards: [] });
    }

    const boards = (await findBoardsByCollaboratorsId(collaborators)).map(
      (board) => ({
        collaborators: board.collaborators,
        createdAt: board.createdAt,
        updatedAt: board.updatedAt,
        id: board.id,
        title: board.title,
        tags: board.tags,
        folder: board.folder,
        shareUrl: board.shareUrl,
        roomID: board.roomID,
      }),
    );

    return res.status(HTTP_STATUS.SUCCESS).json({ boards });
  } catch (error) {
    console.error('Error getting collaborator boards:', error);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ error: 'Failed to get collaborator boards' });
  }
};

// Update board
export const handleUpdateBoard = async (req: Request, res: Response) => {
  try {
    // The board ID and new parameters are in the body.
    const { id: boardId, fields: updatedFields } = req.body;
    if (!validateId(boardId, res)) return;
    const board = await findBoardById(boardId);
    console.log(updatedFields);
    if (board !== null) {
      if (updatedFields.collaborators !== undefined) {
        const collaborators = (
          await findCollaboratorsById(updatedFields.collaborators)
        ).map((collab) => collab.uid);

        if (collaborators.length !== 0) {
          const sharedBoard = (
            await findBoardsByCollaboratorsId(collaborators)
          ).find((board) => board.id === boardId);

          if (sharedBoard !== undefined)
            return res.status(HTTP_STATUS.SUCCESS).json(sharedBoard);
        }
        const collaborator = await createCollaborator(
          'edit',
          updatedFields.collaborators,
        );

        updatedFields.collaborators = collaborator.uid;
      }

      const update = await updateBoard(board, updatedFields);
      const { fastFireOptions: _fastFireOptions, ...fields } = update; // TODO(yousef): Should make a helper method to extract the options
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
    const boardId = req.query.id as string; // The board ID parameter is in the body.
    if (!validateId(boardId, res)) return;
    const board = await findBoardById(boardId);

    if (board !== null) {
      board.collaborators.forEach(async (collabId) => {
        const collaborator = await findCollaboratorById(collabId);
        collaborator && (await deleteCollaborator(collaborator));
      });

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
