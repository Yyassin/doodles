import { Response, Request } from 'express';
import {
  createUser,
  findUserById,
  deleteUser,
  updateUserName,
} from '../models/user';
import { HTTP_STATUS } from '../constants';

/**
 * Firebase API controllers, logic for endpoint routes.
 * @author Ibrahim Almalki
 */

// TODO: JSDOC

//Create user
export const handleCreateUser = async (req: Request, res: Response) => {
  try {
    const { username, firstname, lastname, email, password, avatar } = req.body; // The user parameters are in the body.
    const user = await createUser(
      username,
      firstname,
      lastname,
      email,
      password,
      avatar,
    );

    res.status(HTTP_STATUS.SUCCESS).json({ user });
  } catch (error) {
    console.error('Error creating user:', error);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ error: 'Failed to create user' });
  }
};

//Get user
export const handleFindUserById = async (req: Request, res: Response) => {
  try {
    const userId = req.query.id; // The user ID parameter is in the URL.
    if (userId === undefined) {
      res.status(HTTP_STATUS.ERROR).json({ error: 'No ID provided' });
      return;
    }
    const user = await findUserById(userId as string);

    if (user) {
      res.status(HTTP_STATUS.SUCCESS).json({ user });
    } else {
      res.status(HTTP_STATUS.ERROR).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('Error finding user by ID:', error);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ error: 'Failed to find user' });
  }
};

// Update userName
export const handleUpdateUserName = async (req: Request, res: Response) => {
  try {
    const userId = req.body.id; // // The user ID and newName parameters are in the body.
    const newName = req.body.newName;
    if (userId === undefined) {
      res.status(HTTP_STATUS.ERROR).json({ error: 'No ID provided' });
      return;
    }
    const user = await findUserById(userId as string);

    if (user) {
      await updateUserName(user, newName);
      res
        .status(HTTP_STATUS.SUCCESS)
        .json({ message: 'User name updated successfully' });
    } else {
      res.status(HTTP_STATUS.ERROR).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('Error updating user name:', error);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ error: 'Failed to update user name' });
  }
};

// Delete user
export const handleDeleteUser = async (req: Request, res: Response) => {
  try {
    const userId = req.body.id; // The user ID parameter is in the body.
    if (userId === undefined) {
      res.status(HTTP_STATUS.ERROR).json({ error: 'No ID provided' });
      return;
    }
    const user = await findUserById(userId as string);

    if (user) {
      await deleteUser(user);
      res
        .status(HTTP_STATUS.SUCCESS)
        .json({ message: 'User deleted successfully' });
    } else {
      res.status(HTTP_STATUS.ERROR).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('Error deleting user:', error);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ error: 'Failed to delete user' });
  }
};
