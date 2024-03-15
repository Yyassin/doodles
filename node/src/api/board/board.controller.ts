import { Response, Request } from 'express';
import {
  createBoard,
  findBoardById,
  updateBoard,
  deleteBoard,
  findBoardsByCollaboratorsId,
  Board,
} from '../../models/board';
import { HTTP_STATUS } from '../../constants';
import {
  Collaborator,
  createCollaborator,
  deleteCollaborator,
  findCollaboratorById,
  findCollaboratorByIdAndBoard,
  findCollaboratorsById,
} from '../../models/collaborator';
import { generateRandId, getInitials } from '../../utils/misc';
import { findUserById } from '../../models/user';
import { findUserByEmail } from '../user/user.controller';

/**
 * Firebase API controllers, logic for endpoint routes.
 * @author Ibrahim Almalki, Abdalla Abdelhadi, Zakariyya Almalki
 */

// TODO: JSDOC

// Create board
export const handleCreateBoard = async (req: Request, res: Response) => {
  try {
    const boardID = generateRandId();
    const { user, serialized, title, shareUrl } = req.body; // The board parameters are in the body.

    const {
      id: collabID,
      permissionLevel,
      uid,
    } = await createCollaborator('owner', user, boardID);

    const board = await createBoard(boardID, serialized, title, shareUrl, [
      uid,
    ]);

    const userInfo = await findUserById(user);
    const users = [
      {
        email: userInfo?.email,
        avatar: userInfo?.avatar,
        initials: getInitials(userInfo?.firstname + ' ' + userInfo?.lastname),
        username: userInfo?.firstname + ' ' + userInfo?.lastname,
        permission: permissionLevel,
        collabID,
      },
    ];

    res
      .status(HTTP_STATUS.SUCCESS)
      .json({ board, collabID, users, permissionLevel });
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
    const userID = req.query.userID as string;

    if (!validateId(boardId, res)) return;
    const board = await findBoardById(boardId as string);

    let collabID;
    let permissionLevel;
    if (userID) {
      const { id, permissionLevel: perm } = (
        await findCollaboratorByIdAndBoard(userID, boardId)
      ).pop() as Collaborator;

      collabID = id;
      permissionLevel = perm;
    } else {
      collabID = undefined;
      permissionLevel = undefined;
    }

    const users =
      board &&
      (await Promise.all(
        board.collaborators.map(async (collabID) => {
          const collab = await findCollaboratorById(collabID);
          const user = await findUserById(collab?.user as string);
          return {
            email: user?.email,
            avatar: user?.avatar,
            initials: getInitials(user?.firstname + ' ' + user?.lastname),
            username: user?.firstname + ' ' + user?.lastname,
            permission: collab?.permissionLevel,
            collabID: collab?.id,
          };
        }),
      ));

    return board
      ? res
          .status(HTTP_STATUS.SUCCESS)
          .json({ board, collabID, users, permissionLevel })
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
    let collabID;

    if (board !== null) {
      if (updatedFields.collaborators !== undefined) {
        const collab = await findCollaboratorByIdAndBoard(
          updatedFields.collaborators,
          boardId,
        );

        if (collab.length !== 0) {
          collabID = collab.pop()?.uid;
          const board = await findBoardById(boardId);
          const users =
            board &&
            (await Promise.all(
              board.collaborators.map(async (collabID) => {
                const collab = await findCollaboratorById(collabID);
                const user = await findUserById(collab?.user as string);
                return {
                  email: user?.email,
                  avatar: user?.avatar,
                  initials: getInitials(user?.firstname + ' ' + user?.lastname),
                  username: user?.firstname + ' ' + user?.lastname,
                  permission: collab?.permissionLevel,
                  collabID: collab?.id,
                };
              }),
            ));

          const { permissionLevel: permission } = (await findCollaboratorById(
            collabID as string,
          )) as Collaborator;
          return res.status(HTTP_STATUS.SUCCESS).json({
            ...board,
            collabID,
            users,
            permission: permission,
          });
        }

        collabID = (
          await createCollaborator(
            'edit',
            updatedFields.collaborators,
            board.id,
          )
        ).uid;

        updatedFields.collaborators = collabID;
      }

      const update = await updateBoard(board, updatedFields);
      const users =
        board &&
        (await Promise.all(
          (update.collaborators as string[]).map(async (collabID) => {
            const collab = await findCollaboratorById(collabID);
            const user = await findUserById(collab?.user as string);
            return {
              email: user?.email,
              avatar: user?.avatar,
              initials: getInitials(user?.firstname + ' ' + user?.lastname),
              username: user?.firstname + ' ' + user?.lastname,
              permission: collab?.permissionLevel,
              collabID: collab?.id,
            };
          }),
        ));

      const { fastFireOptions: _fastFireOptions, ...fields } = update; // TODO(yousef): Should make a helper method to extract the options
      return res
        .status(HTTP_STATUS.SUCCESS)
        .json({ ...fields, collabID, users, permission: 'edit' });
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

// remove collaborator from board
export const handleRemoveCollaborator = async (req: Request, res: Response) => {
  try {
    // The board ID and new parameters are in the body.
    const { boardId, newCollabs } = req.body;
    if (!validateId(boardId, res)) return;
    const board = (await findBoardById(boardId)) as Board;

    await updateBoard(board, { collaborators: newCollabs }, true);

    return res.status(HTTP_STATUS.SUCCESS).json({});
  } catch (error) {
    console.error('Error updating board: ', error);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ error: 'Failed to remove Collaborator' });
  }
};

// Update board
export const handleAddUserbyEmail = async (req: Request, res: Response) => {
  try {
    // The board ID and new parameters are in the body.
    const { boardId, email, perm } = req.body;
    if (!validateId(boardId, res)) return;
    const board = await findBoardById(boardId);
    const user = await findUserByEmail(email);
    if (user === null) return res.status(HTTP_STATUS.ERROR).json();

    const collab = await createCollaborator(perm, user.uid, boardId);
    await updateBoard(board as Board, {
      collaborators: collab.id,
    });

    return res.status(HTTP_STATUS.SUCCESS).json({
      user: {
        email: user.email,
        avatar: user.avatar,
        initials: getInitials(user.firstname + ' ' + user.lastname),
        username: user.firstname + ' ' + user.lastname,
        permission: perm,
        collabID: collab.id,
      },
    });
  } catch (error) {
    console.error('Error adding user: ', error);
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
