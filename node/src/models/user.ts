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
  const user = await FastFire.create(User, {
    username,
    firstname,
    lastname,
    email,
    password,
    avatar,
  });
  return user;
}

// Function to find a user by ID
export async function findUserById(userId: string) {
  const user = await FastFire.findById(User, userId);
  return user;
}

// Function to update a user's name
export async function updateUserName(user: User, newName: string) {
  await user.update({ username: newName });
}

// Function to delete a user
export async function deleteUser(user: User) {
  await user.delete();
}
