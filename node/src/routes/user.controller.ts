import { Response, Request } from 'express';
import {
  createUser,
  findUserById,
  deleteUser,
  updateUser,
} from '../models/user';
import { HTTP_STATUS } from '../constants';
import { firebaseApp } from '../firebase/firebaseApp';

/**
 * Firebase API controllers, logic for endpoint routes.
 * @author Ibrahim, Zakariyya Almalki
 */

// TODO: JSDOC

interface User {
  id: string;
  email: string;
  name: string;
}

//Create user
export const handleCreateUser = async (req: Request, res: Response) => {
  try {
    const { username, firstname, lastname, email, password, avatar } = req.body; // The user parameters are in the body.
    const { fastFireOptions: _fastFireOptions, ...user } = await createUser(
      username,
      firstname,
      lastname,
      email,
      password,
      avatar,
    );
    //const _ = fastFireOptions;
    res.status(HTTP_STATUS.SUCCESS).json({ user });
  } catch (error) {
    console.error('Error creating user:', error);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ error: 'Failed to create user' });
  }
};
const validateId = (id: string, res: Response): id is string => {
  if (id === undefined) {
    res.status(HTTP_STATUS.ERROR).json({ error: 'NO ID PROVIDED' });
    return false;
  }
  return true;
};
const errorNotFound = 'user not found';
const notFoundError = (res: Response) =>
  res.status(HTTP_STATUS.ERROR).json({ error: errorNotFound });

//Get user
export const handleFindUserById = async (req: Request, res: Response) => {
  try {
    const email = req.query.email as string;

    if (!email) {
      return res.status(HTTP_STATUS.ERROR);
    }

    const user = await findUserByEmail(email);
    if (user) {
      res.status(HTTP_STATUS.SUCCESS).json({ user });
    } else {
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ error: errorNotFound });
    }
  } catch (error) {
    console.error('error finding user through email', error);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ error: errorNotFound });
  }
};

async function findUserByEmail(email: string): Promise<User | null> {
  const usersCollection = firebaseApp.firestore().collection('User');

  const querySnapshot = await usersCollection.where('email', '==', email).get();

  if (querySnapshot.empty) {
    return null;
  }

  const userDoc = querySnapshot.docs[0];
  return userDoc.data() as User;
}

// Update user
export const handleUpdateUser = async (req: Request, res: Response) => {
  try {
    // The user ID and new parameters are in the body.
    const { id: userId, fields: updatedFields } = req.body;
    if (!validateId(userId, res)) return;
    const user = await findUserById(userId);

    if (user) {
      await updateUser(user, updatedFields);
      const { fastFireOptions: _fastFireOptions, ...fields } = user;
      return res.status(HTTP_STATUS.SUCCESS).json(fields);
    } else {
      return notFoundError(res);
    }
  } catch (error) {
    console.error('Error updating user :', error);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ error: 'Failed to update user' });
  }
};

// Delete user
export const handleDeleteUser = async (req: Request, res: Response) => {
  try {
    const userId = req.body.id; // The user ID parameter is in the body.
    if (!validateId(userId, res)) return;

    const user = await findUserById(userId as string);

    if (user) {
      await deleteUser(user);
      res
        .status(HTTP_STATUS.SUCCESS)
        .json({ message: 'User deleted successfully' });
    } else {
      return notFoundError(res);
    }
  } catch (error) {
    console.error('Error deleting user:', error);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ error: 'Failed to delete user' });
  }
};
