import { DocumentFields } from 'fastfire/dist/types';
import {
  FastFire,
  FastFireCollection,
  FastFireField,
  FastFireDocument,
} from 'fastfire';
import { generateRandId } from '../utils/misc';

/**
 * Defines collaborator class.
 * @authors Ibrahim Almalki
 */

//TODO: add createdAt and updatedAt
//TODO: change permissionLevel to an enum
@FastFireCollection('Collaborator')
export class Collaborator extends FastFireDocument<Collaborator> {
  @FastFireField({ required: true })
  uid!: string;
  @FastFireField({ required: true })
  permissionLevel!: string;
  @FastFireField({ required: true })
  user!: string;
  @FastFireField({ required: true })
  createdAt!: Date;
  @FastFireField({ required: true })
  updatedAt!: Date;
}

// Function to create a collaborator
export async function createCollaborator(
  permissionLevel: string,
  user: string,
) {
  const uid = generateRandId();
  const createdAt = new Date();
  const updatedAt = new Date();
  return await FastFire.create(
    Collaborator,
    {
      uid,
      permissionLevel,
      user,
      createdAt,
      updatedAt,
    },
    uid,
  );
}

// Function to find a collaborator by ID
export const findCollaboratorById = async (collaboratorId: string) =>
  FastFire.findById(Collaborator, collaboratorId);

// Function to update a collaborator
export const updateCollaborator = async (
  collaborator: Collaborator,
  updatedFields: Partial<DocumentFields<Collaborator>>,
) => {
  updatedFields.updatedAt = new Date();
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
