import { Collaborator } from './collaborator';
import {
  FastFire,
  FastFireCollection,
  FastFireField,
  FastFireDocument,
} from 'fastfire';

//TODO: add createdAt and updatedAt
@FastFireCollection('Comment')
class Comment extends FastFireDocument<Comment> {
  @FastFireField({ required: true })
  text!: string;
  @FastFireField({ required: true })
  collaborator!: Collaborator;
}

// Function to create a comment
export async function createComment(text: string, collaborator: Collaborator) {
  const comment = await FastFire.create(Comment, {
    text,
    collaborator,
  });
  return comment;
}

// Function to find a comment by ID
export async function findCommentById(commentId: string) {
  const comment = await FastFire.findById(Comment, commentId);
  return comment;
}

// Function to update a comment's text
export async function updateCommentText(comment: Comment, newText: string) {
  await comment.update({ text: newText });
}

// Function to delete a comment
export async function deleteComment(comment: Comment) {
  await comment.delete();
}
