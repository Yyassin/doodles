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
  elemID!: string;
  @FastFireField({ required: true })
  comment!: string;
  @FastFireField({ required: true })
  collaborator!: string; // Collaborator ID
  @FastFireField({ required: true })
  createdAt!: Date;
  @FastFireField({ required: true })
  likes!: string[];
}

// Function to create a comment
export async function createComment(
  elemID: string,
  comment: string,
  collaborator: string,
) {
  const uid = generateRandId();
  const createdAt = new Date().toUTCString();
  return await FastFire.create(
    Comment,
    {
      uid,
      elemID,
      comment,
      collaborator,
      createdAt,
      likes: [],
    },
    uid,
  );
}

// Function to find a comment by ID
export const findCommentById = async (commentId: string) =>
  FastFire.findById(Comment, commentId);

export const findCommentsByElemID = async (elemID: string) =>
  await FastFire.where(Comment, 'elemID', '==', elemID).get();

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
