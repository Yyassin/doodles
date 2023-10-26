import { Collaborator } from './collaborator';
import {
  FastFire,
  FastFireCollection,
  FastFireField,
  FastFireDocument,
} from 'fastfire';

//TODO: add createdAt and updatedAt
@FastFireCollection('Board')
class Board extends FastFireDocument<Board> {
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
  const board = await FastFire.create(Board, {
    serialized,
    title,
    tags,
    shareUrl,
    collaborators,
  });
  return board;
}

// Function to find a board by ID
export async function findBoardById(boardId: string) {
  const board = await FastFire.findById(Board, boardId);
  return board;
}

// Function to update a baord's title
export async function updateBoardTitle(board: Board, newTitle: string) {
  await board.update({ title: newTitle });
}

// Function to delete a board
export async function deleteBoard(board: Board) {
  await board.delete();
}
