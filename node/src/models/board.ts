import { DocumentFields } from 'fastfire/dist/types';
import { Collaborator } from './collaborator';
import {
  FastFire,
  FastFireCollection,
  FastFireField,
  FastFireDocument,
} from 'fastfire';

/**
 * Defines Board class.
 * @authors Ibrahim Almalki
 */

//TODO: add createdAt and updatedAt
@FastFireCollection('Board')
export class Board extends FastFireDocument<Board> {
  @FastFireField({ required: true })
  serialized!: string;
  @FastFireField({ required: true })
  title!: string;
  @FastFireField({ required: true })
  tags!: string[];
  @FastFireField({ required: true })
  shareUrl!: string;
  @FastFireField({ required: true })
  collaborators!: Collaborator[];
}

// Function to create a board
export async function createBoard(
  serialized: string,
  title: string,
  tags: string[],
  shareUrl: string,
  collaborators: Collaborator[],
) {
  return FastFire.create(Board, {
    serialized,
    title,
    tags,
    shareUrl,
    collaborators,
  });
}

// Function to find a board by ID
export const findBoardById = async (boardId: string) =>
  FastFire.findById(Board, boardId);

// Function to update a baord's title
export const updateBoard = async (
  board: Board,
  updatedFields: Partial<DocumentFields<Board>>,
) => {
  const { fastFireOptions: _fastFireOptions, id: _id, ...boardFields } = board;
  const updatedBoard = { ...boardFields, ...updatedFields };
  await board.update(updatedBoard);
  return updatedBoard;
};

// Function to delete a board
export const deleteBoard = async (board: Board) => await board.delete();
