import { describe, it } from 'mocha';
import { expect } from 'chai';
import { server } from '../../src/app';
import supertest from 'supertest';
import {
  Collaborator,
  findCollaboratorById,
} from '../../src/models/collaborator';
import { User } from '../../src/models/user';
import { HTTP_STATUS } from '../../src/constants';

/**
 * Defines Collaborator tests.
 * @authors Ibrahim Almalki
 */

// Connect to the server instance
const request = supertest(server);

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

    expect(createUserResponse.status).to.eq(HTTP_STATUS.SUCCESS);
    createdUser = createUserResponse.body.user as User;
  });

  it('Should create a Collaborator', async () => {
    //create collaborator with previously created user
    const response = await request
      .post('/collaborator/createCollaborator')
      .send({ permissionLevel: 'edit', user: createdUser.id });

    expect(response.status).to.eq(HTTP_STATUS.SUCCESS);

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

      expect(getResponse.status).to.equal(HTTP_STATUS.SUCCESS);

      const createdCollaborator = getResponse.body.collaborator as Collaborator;
      expect(createdCollaborator.id).to.equal(testCollaborator.id);
    }
  });

  it('Should update a collaborator', async () => {
    if (testCollaborator) {
      const newFields = {
        permissionLevel: 'edit',
      };
      const updateCollaboratorResponse = await request
        .put('/collaborator/updateCollaborator')
        .send({
          id: testCollaborator.id,
          fields: newFields,
        });

      expect(updateCollaboratorResponse.status).to.equal(HTTP_STATUS.SUCCESS);
      const { fastFireOptions: _fastFireOptions, ...testColaboratorfields } =
        testCollaborator;
      expect(updateCollaboratorResponse.body).to.deep.equal(
        testColaboratorfields,
      );
    }
  });

  it('Should delete a collaborator', async function () {
    if (testCollaborator) {
      const deleteCommentResponse = await request
        .delete('/collaborator/deleteCollaborator')
        .send({
          id: testCollaborator.id,
        });

      expect(deleteCommentResponse.status).to.equal(HTTP_STATUS.SUCCESS);

      expect(await findCollaboratorById(testCollaborator.id)).to.equal(null);

      // delete created user
      await request.delete('/user/deleteUser').send({
        id: createdUser.id,
      });
    }
  });
});
