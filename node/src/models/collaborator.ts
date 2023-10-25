import { User } from './user';
import {
  FastFire,
  FastFireCollection,
  FastFireField,
  FastFireDocument,
} from 'fastfire';

//TODO: add createdAt and updatedAt
//TODO: change permissionLevel to an enum
@FastFireCollection('Collaborator')
class Collaborator extends FastFireDocument<Collaborator> {
  @FastFireField({ required: true })
  permissionLevel!: string;
  @FastFireField({ required: true })
  user!: User;
}

// Function to create a collaborator
export async function createCollaborator(permissionLevel: string, user: User) {
  const collaborator = await FastFire.create(Collaborator, {
    permissionLevel,
    user,
  });
  return collaborator;
}

// Function to find a collaborator by ID
export async function findCollaboratorById(collabId: string) {
  const collaborator = await FastFire.findById(Collaborator, collabId);
  return collaborator;
}

// Function to update a collaborator's permissionLevel
export async function updateCollaboratorPermission(
  collaborator: Collaborator,
  newPermissionLevel: string,
) {
  await collaborator.update({ permissionLevel: newPermissionLevel });
}

// Function to delete a collaborator
export async function deleteCollaborator(collaborator: Collaborator) {
  await collaborator.delete();
}
