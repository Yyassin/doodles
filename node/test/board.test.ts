import { describe, it } from 'mocha';
import { expect } from 'chai';
import { server } from '../src/app';
import superwstest from 'superwstest';
import { Board, findBoardById } from '../src/models/board';
import { Collaborator } from '../src/models/collaborator';
import { User } from '../src/models/user';
import { HTTP_STATUS } from '../src/constants';

/**
 * Defines Board tests.
 * @authors Ibrahim Almalki
 */

// Connect to the server instance
const request = superwstest(server);

// sample test user data
const expectedUser = {
  username: 'testuser',
  firstname: 'John',
  lastname: 'Doe',
  email: 'johndoe2@example.com',
  password: 'testpassword',
  avatar: 'testavatar.jpg',
};

describe('Test Board', () => {
  let testBoard: Board | null = null;
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

  it('Should create a Board', async () => {
    //create board with previously created collaborator
    const BoardResponse = await request.post('/board/createBoard').send({
      serialized: 'abc123',
      title: 'myBoard',
      tags: ['bestBoard', 'cool'],
      shareUrl: 'abc.com',
      collaborators: [createdCollaborator.id],
    });

    expect(BoardResponse.status).to.eq(HTTP_STATUS.SUCCESS);

    const createdBoard = BoardResponse.body.board as Board;
    testBoard = await findBoardById(createdBoard.id);
    expect(testBoard).to.be.an.instanceOf(Board);
  });

  it("Should read a board's name", async () => {
    if (testBoard) {
      const getResponse = await request.get('/board/getBoard').send({
        id: testBoard.id,
      });

      expect(getResponse.status).to.equal(HTTP_STATUS.SUCCESS);
      const createdBoard = getResponse.body.board as Board;

      expect(createdBoard.title).to.include('myBoard');
    }
  });

  it('Should update a board', async () => {
    if (testBoard) {
      const newFields = {
        title: 'newBoard',
        tags: ['tagA', 'tagB'],
        serialized: 'newSerialized',
      };
      const updateBoardResponse = await request.put('/board/updateBoard').send({
        id: testBoard.id,
        fields: newFields,
      });

      expect(updateBoardResponse.status).to.equal(HTTP_STATUS.SUCCESS);

      const { fastFireOptions: _fastFireOptions, ...testBoardfields } =
        testBoard;
      expect(updateBoardResponse.body).to.deep.equal(testBoardfields);
    }
  });

  it('Should delete a board', async function () {
    if (testBoard) {
      const deleteBoardResponse = await request
        .delete('/board/deleteBoard')
        .send({
          id: testBoard.id,
        });

      expect(deleteBoardResponse.status).to.equal(HTTP_STATUS.SUCCESS);

      expect(await findBoardById(testBoard.id)).to.equal(null);

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
