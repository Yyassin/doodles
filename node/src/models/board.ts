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
 * @authors Ibrahim Almalki
 */

//TODO: add createdAt and updatedAt
@FastFireCollection('Board')
export class Board extends FastFireDocument<Board> {
  @FastFireField({ required: true })
  uid!: string;
  @FastFireField({ required: true })
  serialized!: string;
  @FastFireField({ required: true })
  title!: string;
  @FastFireField({ required: true })
  tags!: string[];
  @FastFireField({ required: true })
  shareUrl!: string;
  @FastFireField({ required: true })
  collaborators!: string[]; // Array of collaborator IDs
  @FastFireField({ required: true })
  createdAt!: Date;
  @FastFireField({ required: true })
  updatedAt!: Date;
}

// Function to create a board
export async function createBoard(
  serialized: string,
  title: string,
  tags: string[],
  shareUrl: string,
  collaborators: string[],
) {
  const uid = generateRandId();
  const createdAt = new Date();
  const updatedAt = new Date();
  return FastFire.create(
    Board,
    {
      uid,
      serialized,
      title,
      tags,
      shareUrl,
      collaborators,
      createdAt,
      updatedAt,
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
  updatedFields.updatedAt = new Date();
  const { fastFireOptions: _fastFireOptions, id: _id, ...boardFields } = board;
  const updatedBoard = { ...boardFields, ...updatedFields };
  await board.update(updatedBoard);
  return updatedBoard;
};

// Function to delete a board
export const deleteBoard = async (board: Board) => await board.delete();

export const findBoardsByCollaboratorId = async (collaboratorId: string) => {
  return await FastFire.where(
    Board,
    'collaborators',
    'array-contains',
    collaboratorId,
  ).get();
};
