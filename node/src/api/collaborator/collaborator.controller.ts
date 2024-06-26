import { Response, Request } from 'express';
import {
  createCollaborator,
  findCollaboratorById,
  findCollaboratorsById,
  updateCollaborator,
  deleteCollaborator,
} from '../../models/collaborator';
import { HTTP_STATUS } from '../../constants';
import { findUserById } from '../../models/user';
import { getInitials } from '../../utils/misc';

/**
 * Firebase API controllers, logic for endpoint routes.
 * @author Ibrahim Almalki
 */

const memo = {} as Record<string, string>;
export const handleGetCollaboratorAvatars = async (
  req: Request,
  res: Response,
) => {
  const { collaboratorIds } = req.body as { collaboratorIds: string[] };
  const collaboratorAvatarMap = await Promise.all(
    collaboratorIds.map(async (id) => {
      if (memo[id]) return { id, avatar: memo[id] };

      const collaborator = await findCollaboratorById(id);
      const userId = collaborator?.user ?? id;
      const user = await findUserById(userId);
      memo[id] = user?.avatar ?? '';
      return { id: collaborator?.id, avatar: user?.avatar };
    }),
  );
  const collaborators = collaboratorAvatarMap.reduce(
    (acc, { id, avatar }) => {
      id && avatar && (acc[id] = avatar);
      return acc;
    },
    {} as Record<string, string>,
  );
  res.status(HTTP_STATUS.SUCCESS).json({ collaborators });
};

//Create collaborator
export const handleCreateCollaborator = async (req: Request, res: Response) => {
  try {
    const { permissionLevel, user, board } = req.body; // The permission level and user parameters are in the body.
    const collaborator = await createCollaborator(permissionLevel, user, board);

    res.status(HTTP_STATUS.SUCCESS).json({ collaborator });
  } catch (error) {
    console.error('Error creating collaborator:', error);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ error: 'Failed to create collaborator' });
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
  res.status(HTTP_STATUS.ERROR).json({ error: 'collaborator not found' });

//Get collaborator
export const handleFindCollaboratorById = async (
  req: Request,
  res: Response,
) => {
  try {
    const collabId = req.query.id as string; // The collaborator ID parameter is in the body.
    if (!validateId(collabId, res)) return;
    const collaborator = await findCollaboratorById(collabId as string);
    const user = await findUserById(collaborator?.user as string);

    if (collaborator) {
      res.status(HTTP_STATUS.SUCCESS).json({
        userInfo: {
          email: user?.email,
          avatar: user?.avatar,
          initials: getInitials(user?.firstname + ' ' + user?.lastname),
          username: user?.firstname + ' ' + user?.lastname,
          permission: collaborator.permissionLevel,
          collabID: collaborator.id,
        },
      });
    } else {
      return notFoundError(res);
    }
  } catch (error) {
    console.error('Error finding collaborator by ID:', error);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ error: 'Failed to find collaborator' });
  }
};

//Get all of the users collaborators
export const handleFindCollaboratorsById = async (
  req: Request,
  res: Response,
) => {
  try {
    const userID = req.body.id; // The collaborator ID parameter is in the body.
    if (!validateId(userID, res)) return;
    const collaborators = await findCollaboratorsById(userID as string);
    if (collaborators) {
      res.status(HTTP_STATUS.SUCCESS).json({ collaborators });
    } else {
      return notFoundError(res);
    }
  } catch (error) {
    console.error('Error finding collaborators by ID:', error);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ error: 'Failed to find collaborators' });
  }
};

// Update collaborator
export const handleUpdateCollaborator = async (req: Request, res: Response) => {
  try {
    // The collaborator ID and new parameters are in the body.
    const { id: collaboratorId, fields: updatedFields } = req.body;
    if (!validateId(collaboratorId, res)) return;
    const collaborator = await findCollaboratorById(collaboratorId);

    if (collaborator) {
      await updateCollaborator(collaborator, updatedFields);
      const { fastFireOptions: _fastFireOptions, ...fields } = collaborator;
      return res.status(HTTP_STATUS.SUCCESS).json(fields);
    } else {
      return notFoundError(res);
    }
  } catch (error) {
    console.error('Error updating collaborator:', error);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ error: 'Failed to update collaborator' });
  }
};

// Delete collaborator
export const handleDeleteCollaborator = async (req: Request, res: Response) => {
  try {
    const collabId = req.body.id; // The collaborator ID parameter is in the body.
    if (!validateId(collabId, res)) return;

    const collaborator = await findCollaboratorById(collabId as string);

    if (collaborator) {
      await deleteCollaborator(collaborator);
      res
        .status(HTTP_STATUS.SUCCESS)
        .json({ message: 'Collaborator deleted successfully' });
    } else {
      return notFoundError(res);
    }
  } catch (error) {
    console.error('Error deleting collaborator:', error);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ error: 'Failed to delete collaborator' });
  }
};
