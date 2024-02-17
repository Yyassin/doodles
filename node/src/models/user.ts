import { DocumentFields } from 'fastfire/dist/types';
import {
  FastFire,
  FastFireCollection,
  FastFireField,
  FastFireDocument,
} from 'fastfire';
import { generateRandId } from '../utils/misc';

/**
 * Defines user class.
 * @authors Ibrahim Almalki
 */

//TODO: add createdAt and updatedAt
@FastFireCollection('User')
export class User extends FastFireDocument<User> {
  @FastFireField({ required: true })
  uid!: string;
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
  @FastFireField({ required: true })
  createdAt!: Date;
  @FastFireField({ required: true })
  updatedAt!: Date;
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
  const uid = generateRandId();
  const createdAt = new Date();
  const updatedAt = new Date();
  return await FastFire.create(
    User,
    {
      uid,
      username,
      firstname,
      lastname,
      email,
      password,
      avatar,
      createdAt,
      updatedAt,
    },
    uid,
  );
}

// Function to find a user by ID
export const findUserById = async (userId: string) =>
  FastFire.findById(User, userId);

// Function to update a user's name
export const updateUser = async (
  user: User,
  updatedFields: Partial<DocumentFields<User>>,
) => {
  updatedFields.updatedAt = new Date();
  const { fastFireOptions: _fastFireOptions, id: _id, ...userFields } = user;
  const updatedUser = { ...userFields, ...updatedFields };
  await user.update(updatedUser);
  return updatedUser;
};

// Function to delete a user
export const deleteUser = async (user: User) => await user.delete();
