import { describe, it } from 'mocha';
import { expect } from 'chai';
import { server } from '../src/app';
import superwstest from 'superwstest';
import { User, findUserById } from '../src/models/user';

/**
 * Defines User tests.
 * @authors Ibrahim Almalki
 */

// Connect to the server instance
const request = superwstest(server);

// sample test user data
const expectedUser = {
  username: 'testuser',
  firstname: 'John',
  lastname: 'Doe',
  email: 'john@example.com',
  password: 'testpassword',
  avatar: 'testavatar.jpg',
};

describe('Test Users', () => {
  let testUser: User | null = null;

  it('Should create a user', async () => {
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

  it("Should read user's name", async () => {
    if (testUser) {
      const getUserNameResponse = await request.get('/user/getUser').send({
        id: testUser.id,
      });

      expect(getUserNameResponse.status).to.equal(200);
      const createdUser = getUserNameResponse.body.user as User;

      expect(createdUser).to.include(expectedUser);
    }
  });

  it('Should update a user', async () => {
    if (testUser) {
      const newFields = {
        username: 'newtestuser',
        email: 'newjohn@example.com',
        password: 'newtestpassword',
        avatar: 'newtestavatar.jpg',
      };
      const updateUserResponse = await request.put('/user/updateUser').send({
        id: testUser.id,
        newName: newFields,
      });

      expect(updateUserResponse.status).to.equal(200);
      const { fastFireOptions: _fastFireOptions, ...testFields } = testUser;
      expect(updateUserResponse.body).to.deep.equal(testFields);
    }
  });

  it('Should delete a user', async () => {
    if (testUser) {
      const deleteUserResponse = await request.delete('/user/deleteUser').send({
        id: testUser.id,
      });

      expect(deleteUserResponse.status).to.equal(200);

      expect(await findUserById(testUser.id)).to.equal(null);
    }
  });
});
