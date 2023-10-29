import { DocumentFields } from 'fastfire/dist/types';
import {
  FastFire,
  FastFireCollection,
  FastFireField,
  FastFireDocument,
} from 'fastfire';

/**
 * Defines user class.
 * @authors Ibrahim Almalki
 */

//TODO: add createdAt and updatedAt
@FastFireCollection('User')
export class User extends FastFireDocument<User> {
  @FastFireField({ required: true })
  username!: string;
  @FastFireField({ required: true })
  firstname!: string;
  @FastFireField({ required: true })
  lastname!: string;
  @FastFireField({ required: true })
  email!: string;
  @FastFireField({ required: true })
  password!: string;
  @FastFireField()
  avatar!: string;
}

// Function to create a user
export async function createUser(
  username: string,
  firstname: string,
  lastname: string,
  email: string,
  password: string,
  avatar: string,
) {
  return await FastFire.create(User, {
    username,
    firstname,
    lastname,
    email,
    password,
    avatar,
  });
}

// Function to find a user by ID
export const findUserById = async (userId: string) =>
  FastFire.findById(User, userId);

// Function to update a user's name
export const updateUser = async (
  user: User,
  updatedFields: Partial<DocumentFields<User>>,
) => {
  const { fastFireOptions: _fastFireOptions, id: _id, ...userFields } = user;
  const updatedUser = { ...userFields, ...updatedFields };
  await user.update(updatedUser);
  return updatedUser;
};

// Function to delete a user
export const deleteUser = async (user: User) => await user.delete();
