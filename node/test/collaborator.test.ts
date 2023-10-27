import { describe, it } from 'mocha';
import { expect } from 'chai';
import { server } from '../src/app';
import superwstest from 'superwstest';
import { Collaborator, findCollaboratorById } from '../src/models/collaborator';
import { User } from '../src/models/user';

// Connect to the server instance
const request = superwstest(server);

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

  it('Should create and read a Collaborator', async () => {
    //create a user to add it to the collaborator
    const createUserResponse = await request
      .post('/user/createUser')
      .send(expectedUser);

    expect(createUserResponse.status).to.eq(200);
    const createdUser = createUserResponse.body.user as User;
    console.log('createdUser:', createdUser);

    //create collaborator with previously created user
    const response = await request
      .post('/collaborator/createCollaborator')
      .send({ permissionLevel: 'edit', user: createdUser });

    expect(response.status).to.eq(200);
    const createdCollaborator = response.body.collaborator as Collaborator;
    console.log('createdcolab:', createdCollaborator);

    testCollaborator = await findCollaboratorById(createdCollaborator.id);

    expect(testCollaborator).to.be.an.instanceOf(Collaborator);
  });

  it("Should update collaborator's permission", async () => {
    if (testCollaborator) {
      console.log('test id:', testCollaborator.id);
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
    }
  });
});
