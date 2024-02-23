import { DocumentFields } from 'fastfire/dist/types';
import {
  FastFire,
  FastFireCollection,
  FastFireField,
  FastFireDocument,
} from 'fastfire';
import { generateRandId } from '../utils/misc';

/**
 * Defines Board class.
 * @authors Ibrahim Almalki, Abdalla Abdelhadi, Zakariyya Almalki
 */

//TODO: add createdAt and updatedAt
@FastFireCollection('Board')
export class Board extends FastFireDocument<Board> {
  @FastFireField({ required: true })
  uid!: string;
  @FastFireField({ required: true })
  serialized!: Record<string, unknown>;
  @FastFireField({ required: true })
  title!: string;
  @FastFireField({ required: true })
  tags!: string[];
  @FastFireField({ required: true })
  folder!: string;
  @FastFireField({ required: true })
  shareUrl!: string;
  @FastFireField({ required: true })
  collaborators!: string[]; // Array of collaborator IDs
  @FastFireField({ required: true })
  createdAt!: Date;
  @FastFireField({ required: true })
  updatedAt!: Date;
  @FastFireField({ required: true })
  roomID!: string;
}

// Function to create a board
export async function createBoard(
  serialized: Record<string, unknown>,
  title: string,
  shareUrl: string,
  collaborators: string[],
) {
  const uid = generateRandId();
  const createdAt = new Date().toUTCString();
  const updatedAt = new Date().toUTCString();
  shareUrl = shareUrl + `?boardID=${uid}`;
  return FastFire.create(
    Board,
    {
      uid,
      serialized,
      title,
      tags: [],
      folder: 'none',
      shareUrl,
      collaborators,
      createdAt,
      updatedAt,
      roomID: generateRandId(),
    },
    uid,
  );
}

// Function to find a board by ID
export const findBoardById = async (boardId: string) =>
  FastFire.findById(Board, boardId);

// Function to update a baord's title
export const updateBoard = async (
  board: Board,
  updatedFields: Partial<DocumentFields<Board>>,
) => {
  updatedFields.updatedAt = new Date().toUTCString();
  const { fastFireOptions: _fastFireOptions, id: _id, ...boardFields } = board;
  if (updatedFields.collaborators !== undefined) {
    boardFields.collaborators.push(updatedFields.collaborators as string);
    delete updatedFields.collaborators;
  }
  const updatedBoard = { ...boardFields, ...updatedFields };
  await board.update(updatedBoard);
  return updatedBoard;
};

// Function to delete a board
export const deleteBoard = async (board: Board) => await board.delete();

export const findBoardsByCollaboratorsId = async (collaboratorId: string[]) => {
  return await FastFire.where(
    Board,
    'collaborators',
    'array-contains-any',
    collaboratorId,
  ).get();
};
