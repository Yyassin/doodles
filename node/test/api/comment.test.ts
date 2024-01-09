import { describe, it } from 'mocha';
import { expect } from 'chai';
import { server } from '../../src/app';
import supertest from 'supertest';
import { Comment, findCommentById } from '../../src/models/comment';
import { Collaborator } from '../../src/models/collaborator';
import { User } from '../../src/models/user';
import { HTTP_STATUS } from '../../src/constants';

/**
 * Defines Comment tests.
 * @authors Ibrahim Almalki
 */

// Connect to the server instance
const request = supertest(server);

// sample test user data
const expectedUser = {
  username: 'testuser',
  firstname: 'John',
  lastname: 'Doe',
  email: 'johndoe1@example.com',
  password: 'testpassword',
  avatar: 'testavatar.jpg',
};

describe('Test Comment', () => {
  let testComment: Comment | null = null;
  let createdUser: User;
  let createdCollaborator: Collaborator;

  before(async () => {
    //create a user to add it to the collaborator
    const createUserResponse = await request
      .post('/user/createUser')
      .send(expectedUser);

    expect(createUserResponse.status).to.eq(HTTP_STATUS.SUCCESS);
    createdUser = createUserResponse.body.user as User;

    //create collaborator with previously created user
    const collabResponse = await request
      .post('/collaborator/createCollaborator')
      .send({ permissionLevel: 'edit', user: createdUser.id });

    expect(collabResponse.status).to.eq(HTTP_STATUS.SUCCESS);
    createdCollaborator = collabResponse.body.collaborator as Collaborator;
  });

  it('Should create a comment', async () => {
    //create comment with previously created collaborator
    const CommentResponse = await request
      .post('/comment/createComment')
      .send({ text: 'hello', collaborator: createdCollaborator.id });

    expect(CommentResponse.status).to.eq(HTTP_STATUS.SUCCESS);

    const createdComment = CommentResponse.body.comment as Comment;
    testComment = await findCommentById(createdComment.id);
    expect(testComment).to.be.an.instanceOf(Comment);
  });

  it('Should read a comment', async () => {
    if (testComment) {
      const getResponse = await request.get('/comment/getComment').send({
        id: testComment.id,
      });

      expect(getResponse.status).to.equal(HTTP_STATUS.SUCCESS);

      const createdComment = getResponse.body.comment as Comment;
      expect(createdComment.id).to.equal(testComment.id);
    }
  });
  it('Should update comment', async () => {
    if (testComment) {
      const newFields = {
        text: 'cool board there bud',
      };
      const updateCommentResponse = await request
        .put('/comment/updateComment')
        .send({
          id: testComment.id,
          fields: newFields,
        });

      expect(updateCommentResponse.status).to.equal(HTTP_STATUS.SUCCESS);
      const { fastFireOptions: _fastFireOptions, ...testCommentfields } =
        testComment;
      expect(updateCommentResponse.body).to.deep.equal(testCommentfields);
    }
  });

  it('Should delete a comment', async function () {
    if (testComment) {
      const deleteCommentResponse = await request
        .delete('/comment/deleteComment')
        .send({
          id: testComment.id,
        });

      expect(deleteCommentResponse.status).to.equal(HTTP_STATUS.SUCCESS);

      expect(await findCommentById(testComment.id)).to.equal(null);

      // delete created user
      await request.delete('/user/deleteUser').send({
        id: createdUser.id,
      });

      // delete created collaborator
      await request.delete('/collaborator/deleteCollaborator').send({
        id: createdCollaborator.id,
      });
    }
  });
});
