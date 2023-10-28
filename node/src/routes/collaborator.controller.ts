import { Response, Request } from 'express';
import {
  createCollaborator,
  findCollaboratorById,
  updateCollaboratorPermission,
  deleteCollaborator,
} from '../models/collaborator';
import { HTTP_STATUS } from '../constants';

/**
 * Firebase API controllers, logic for endpoint routes.
 * @author Ibrahim Almalki
 */

// TODO: JSDOC

//Create collaborator
export const handleCreateCollaborator = async (req: Request, res: Response) => {
  try {
    const { permissionLevel, user } = req.body; // The permission level and user parameters are in the body.
    const { fastFireOptions, ...collaborator } = await createCollaborator(
      permissionLevel,
      user,
    );

    res.status(HTTP_STATUS.SUCCESS).json({ collaborator });
  } catch (error) {
    console.error('Error creating collaborator:', error);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ error: 'Failed to create collaborator' });
  }
};

//Get collaborator
export const handleFindCollaboratorById = async (
  req: Request,
  res: Response,
) => {
  try {
    const collabId = req.body.id; // The collaborator ID parameter is in the body.
    if (collabId === undefined) {
      res.status(HTTP_STATUS.ERROR).json({ error: 'No ID provided' });
      return;
    }
    const collaborator = await findCollaboratorById(collabId as string);

    if (collaborator) {
      res.status(HTTP_STATUS.SUCCESS).json({ collaborator });
    } else {
      res.status(HTTP_STATUS.ERROR).json({ error: 'collaborator not found' });
    }
  } catch (error) {
    console.error('Error finding collaborator by ID:', error);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ error: 'Failed to find collaborator' });
  }
};

// Update permissionLevel
export const handleUpdatePermissionLevel = async (
  req: Request,
  res: Response,
) => {
  try {
    const collabId = req.body.id; // // The collaborator ID and permissionLevel parameters are in the body.
    const newPermissionLevel = req.body.newPermissionLevel;
    if (collabId === undefined) {
      res.status(HTTP_STATUS.ERROR).json({ error: 'No ID provided' });
      return;
    }
    const collaborator = await findCollaboratorById(collabId as string);

    if (collaborator) {
      await updateCollaboratorPermission(collaborator, newPermissionLevel);
      res.status(HTTP_STATUS.SUCCESS).json({ newPermissionLevel });
    } else {
      res.status(HTTP_STATUS.ERROR).json({ error: 'collaborator not found' });
    }
  } catch (error) {
    console.error('Error updating permission level:', error);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ error: 'Failed to update permission level' });
  }
};

// Delete collaborator
export const handleDeleteCollaborator = async (req: Request, res: Response) => {
  try {
    const collabId = req.body.id; // The collaborator ID parameter is in the body.
    if (collabId === undefined) {
      res.status(HTTP_STATUS.ERROR).json({ error: 'No ID provided' });
      return;
    }
    const collaborator = await findCollaboratorById(collabId as string);

    if (collaborator) {
      await deleteCollaborator(collaborator);
      res
        .status(HTTP_STATUS.SUCCESS)
        .json({ message: 'Collaborator deleted successfully' });
    } else {
      res.status(HTTP_STATUS.ERROR).json({ error: 'Collaborator not found' });
    }
  } catch (error) {
    console.error('Error deleting collaborator:', error);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ error: 'Failed to delete collaborator' });
  }
};
