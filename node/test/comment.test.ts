import { describe, it } from 'mocha';
import { expect } from 'chai';
import { server } from '../src/app';
import superwstest from 'superwstest';
import { Comment, findCommentById } from '../src/models/comment';
import { Collaborator } from '../src/models/collaborator';
import { User } from '../src/models/user';

/**
 * Defines Comment tests.
 * @authors Ibrahim Almalki
 */

// Connect to the server instance
const request = superwstest(server);

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

    expect(createUserResponse.status).to.eq(200);
    createdUser = createUserResponse.body.user as User;

    //create collaborator with previously created user
    const collabResponse = await request
      .post('/collaborator/createCollaborator')
      .send({ permissionLevel: 'edit', user: createdUser });

    expect(collabResponse.status).to.eq(200);
    createdCollaborator = collabResponse.body.collaborator as Collaborator;
  });

  it('Should create a comment', async () => {
    //create comment with previously created collaborator
    const CommentResponse = await request
      .post('/comment/createComment')
      .send({ text: 'hello', collaborator: createdCollaborator.id });

    expect(CommentResponse.status).to.eq(200);

    const createdComment = CommentResponse.body.comment as Comment;
    testComment = await findCommentById(createdComment.id);
    expect(testComment).to.be.an.instanceOf(Comment);
  });

  it('Should read a comment', async () => {
    if (testComment) {
      const getResponse = await request.get('/comment/getComment').send({
        id: testComment.id,
      });

      expect(getResponse.status).to.equal(200);

      const createdComment = getResponse.body.comment as Comment;
      expect(createdComment.id).to.equal(testComment.id);
    }
  });
  it("Should update Comment's text", async () => {
    if (testComment) {
      const updatetTextResponse = await request
        .put('/comment/updateCommentText')
        .send({
          id: testComment.id,
          newText: 'bye',
        });

      expect(updatetTextResponse.status).to.equal(200);
      expect(updatetTextResponse.body.newText).to.equal('bye');
    }
  });

  it('Should delete a comment', async function () {
    if (testComment) {
      const deleteCommentResponse = await request
        .delete('/comment/deleteComment')
        .send({
          id: testComment.id,
        });

      expect(deleteCommentResponse.status).to.equal(200);

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
