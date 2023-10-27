import { describe, it } from 'mocha';
import { expect } from 'chai';
import { server } from '../src/app';
import superwstest from 'superwstest';
import { User, findUserById } from '../src/models/user';

// Connect to the server instance
const request = superwstest(server);

// Expected values
const expectedUser = {
  username: 'testuser',
  firstname: 'John',
  lastname: 'Doe',
  email: 'testuser@example.com',
  password: 'testpassword',
  avatar: 'testavatar.jpg',
};

describe('Test Users', () => {
  let testUser: User | null = null;

  it('Should create and read a user', async () => {
    const createUserResponse = await request
      .post('/user/createUser')
      .send(expectedUser);

    expect(createUserResponse.status).to.eq(200);
    const createdUser = createUserResponse.body.user as User;

    expect(createdUser).to.deep.equal({
      id: createdUser.id,
      ...expectedUser,
    });

    testUser = await findUserById(createdUser.id);

    expect(testUser).to.be.an.instanceOf(User);
  });

  it("Should update user's name", async function () {
    if (testUser) {
      console.log('test id:', testUser.id);
      const updateUserNameResponse = await request
        .put('/user/updateUser')
        .send({
          id: testUser.id,
          newName: 'NewName',
        });

      expect(updateUserNameResponse.status).to.equal(200);
      expect(updateUserNameResponse.body.newName).to.include('NewName');
    }
  });

  it('Should delete a user', async function () {
    if (testUser) {
      const deleteUserResponse = await request.delete('/user/deleteUser').send({
        id: testUser.id,
      });

      expect(deleteUserResponse.status).to.equal(200);

      expect(await findUserById(testUser.id)).to.equal(null);
    }
  });
});
