import { describe, it } from 'mocha';
import { expect } from 'chai';
import { server } from '../src/app';
import superwstest from 'superwstest';
import { Collaborator, findCollaboratorById } from '../src/models/collaborator';
import { User } from '../src/models/user';

/**
 * Defines Collaborator tests.
 * @authors Ibrahim Almalki
 */

// Connect to the server instance
const request = superwstest(server);

// sample test user data
const expectedUser = {
  username: 'testuser',
  firstname: 'John',
  lastname: 'Doe',
  email: 'testuser@example.com',
  password: 'testpassword',
  avatar: 'testavatar.jpg',
};

describe('Test Collaborator', () => {
  let testCollaborator: Collaborator | null = null;
  let createdUser: User;

  before(async () => {
    //create a user to add it to the collaborator
    const createUserResponse = await request
      .post('/user/createUser')
      .send(expectedUser);

    expect(createUserResponse.status).to.eq(200);
    createdUser = createUserResponse.body.user as User;
  });

  it('Should create a Collaborator', async () => {
    //create collaborator with previously created user
    const response = await request
      .post('/collaborator/createCollaborator')
      .send({ permissionLevel: 'edit', user: createdUser });

    expect(response.status).to.eq(200);

    const createdCollaborator = response.body.collaborator as Collaborator;
    testCollaborator = await findCollaboratorById(createdCollaborator.id);

    expect(testCollaborator).to.be.an.instanceOf(Collaborator);
  });

  it("Should read a collaborator's name", async () => {
    if (testCollaborator) {
      const getResponse = await request
        .get('/collaborator/getCollaborator')
        .send({
          id: testCollaborator.id,
        });

      expect(getResponse.status).to.equal(200);

      const createdCollaborator = getResponse.body.collaborator as Collaborator;
      expect(createdCollaborator.id).to.equal(testCollaborator.id);
    }
  });

  it("Should update collaborator's permission", async () => {
    if (testCollaborator) {
      const updateUserNameResponse = await request
        .put('/collaborator/updatePermissionLevel')
        .send({
          id: testCollaborator.id,
          newPermissionLevel: 'view',
        });

      expect(updateUserNameResponse.status).to.equal(200);
      expect(updateUserNameResponse.body.newPermissionLevel).to.equal('view');
    }
  });

  it('Should delete a collaborator', async function () {
    if (testCollaborator) {
      const deleteCommentResponse = await request
        .delete('/collaborator/deleteCollaborator')
        .send({
          id: testCollaborator.id,
        });

      expect(deleteCommentResponse.status).to.equal(200);

      expect(await findCollaboratorById(testCollaborator.id)).to.equal(null);

      // delete created user
      await request.delete('/user/deleteUser').send({
        id: createdUser.id,
      });
    }
  });
});
