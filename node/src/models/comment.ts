import { DocumentFields } from 'fastfire/dist/types';
import { Collaborator } from './collaborator';
import {
  FastFire,
  FastFireCollection,
  FastFireField,
  FastFireDocument,
} from 'fastfire';

/**
 * Defines comment class.
 * @authors Ibrahim Almalki
 */

//TODO: add createdAt and updatedAt
@FastFireCollection('Comment')
export class Comment extends FastFireDocument<Comment> {
  @FastFireField({ required: true })
  text!: string;
  @FastFireField({ required: true })
  collaborator!: Collaborator;
}

// Function to create a comment
export async function createComment(text: string, collaborator: Collaborator) {
  return await FastFire.create(Comment, {
    text,
    collaborator,
  });
}

// Function to find a comment by ID
export const findCommentById = async (commentId: string) =>
  FastFire.findById(Comment, commentId);

// Function to update a comment
export const updateComment = async (
  comment: Comment,
  updatedFields: Partial<DocumentFields<Comment>>,
) => {
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
