import { DocumentFields } from 'fastfire/dist/types';
import {
  FastFire,
  FastFireCollection,
  FastFireField,
  FastFireDocument,
} from 'fastfire';
import { generateRandId } from '../utils/misc';

/**
 * Defines comment class.
 * @authors Ibrahim Almalki
 */

//TODO: add createdAt and updatedAt
@FastFireCollection('Comment')
export class Comment extends FastFireDocument<Comment> {
  @FastFireField({ required: true })
  uid!: string;
  @FastFireField({ required: true })
  text!: string;
  @FastFireField({ required: true })
  collaborator!: string; // Collaborator ID
  @FastFireField({ required: true })
  createdAt!: Date;
  @FastFireField({ required: true })
  updatedAt!: Date;
}

// Function to create a comment
export async function createComment(text: string, collaborator: string) {
  const uid = generateRandId();
  const createdAt = new Date().toUTCString();
  const updatedAt = new Date().toUTCString();
  return await FastFire.create(
    Comment,
    {
      uid,
      text,
      collaborator,
      createdAt,
      updatedAt,
    },
    uid,
  );
}

// Function to find a comment by ID
export const findCommentById = async (commentId: string) =>
  FastFire.findById(Comment, commentId);

// Function to update a comment
export const updateComment = async (
  comment: Comment,
  updatedFields: Partial<DocumentFields<Comment>>,
) => {
  updatedFields.updatedAt = new Date().toUTCString();
  const {
    fastFireOptions: _fastFireOptions,
    id: _id,
    ...commentFields
  } = comment;
  const updatedComment = { ...commentFields, ...updatedFields };
  await comment.update(updatedComment);
  return updatedComment;
};

// Function to delete a comment
export const deleteComment = async (comment: Comment) => await comment.delete();
