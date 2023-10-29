import { DocumentFields } from 'fastfire/dist/types';
import { User } from './user';
import {
  FastFire,
  FastFireCollection,
  FastFireField,
  FastFireDocument,
} from 'fastfire';

/**
 * Defines collaborator class.
 * @authors Ibrahim Almalki
 */

//TODO: add createdAt and updatedAt
//TODO: change permissionLevel to an enum
@FastFireCollection('Collaborator')
export class Collaborator extends FastFireDocument<Collaborator> {
  @FastFireField({ required: true })
  permissionLevel!: string;
  @FastFireField({ required: true })
  user!: User;
}

// Function to create a collaborator
export async function createCollaborator(permissionLevel: string, user: User) {
  return await FastFire.create(Collaborator, {
    permissionLevel,
    user,
  });
}

// Function to find a collaborator by ID
export const findCollaboratorById = async (collaboratorId: string) =>
  FastFire.findById(Collaborator, collaboratorId);

// Function to update a collaborator
export const updateCollaborator = async (
  collaborator: Collaborator,
  updatedFields: Partial<DocumentFields<Collaborator>>,
) => {
  const {
    fastFireOptions: _fastFireOptions,
    id: _id,
    ...collaboratorFields
  } = collaborator;
  const updatedCollaborator = { ...collaboratorFields, ...updatedFields };
  await collaborator.update(updatedCollaborator);
  return updatedCollaborator;
};

// Function to delete a collaborator
export const deleteCollaborator = async (collaborator: Collaborator) =>
  await collaborator.delete();
