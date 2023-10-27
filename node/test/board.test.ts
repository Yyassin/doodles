import { describe, it } from 'mocha';
import { expect } from 'chai';
import { server } from '../src/app';
import superwstest from 'superwstest';
import { Board, findBoardById } from '../src/models/board';
import { Collaborator } from '../src/models/collaborator';
import { User } from '../src/models/user';

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

describe('Test Board', () => {
  let testBoard: Board | null = null;

  it('Should create and read a Board', async () => {
    //create a user to add it to the collaborator
    const createBoardResponse = await request
      .post('/user/createUser')
      .send(expectedUser);

    expect(createBoardResponse.status).to.eq(200);
    const createdUser = createBoardResponse.body.user as User;

    //create collaborator with previously created user
    const collabResponse = await request
      .post('/collaborator/createCollaborator')
      .send({ permissionLevel: 'edit', user: createdUser });

    expect(collabResponse.status).to.eq(200);
    const createdCollaborator = collabResponse.body
      .collaborator as Collaborator;

    //create board with previously created collaborator
    const BoardResponse = await request.post('/board/createBoard').send({
      serialized: 'abc123',
      title: 'myBoard',
      tags: ['bestBoard', 'cool'],
      shareUrl: 'abc.com',
      collaborators: [createdCollaborator],
    });

    expect(BoardResponse.status).to.eq(200);

    const createdBoard = BoardResponse.body.board as Board;
    testBoard = await findBoardById(createdBoard.id);
    expect(testBoard).to.be.an.instanceOf(Board);
  });

  it("Should update a board's title", async () => {
    if (testBoard) {
      const updatetTitleResponse = await request
        .put('/board/updateBoardTitle')
        .send({
          id: testBoard.id,
          newTitle: 'newBoard',
        });

      expect(updatetTitleResponse.status).to.equal(200);
      expect(updatetTitleResponse.body.newTitle).to.equal('newBoard');
    }
  });

  it('Should delete a board', async function () {
    if (testBoard) {
      const deleteBoardResponse = await request
        .delete('/board/deleteBoard')
        .send({
          id: testBoard.id,
        });

      expect(deleteBoardResponse.status).to.equal(200);

      expect(await findBoardById(testBoard.id)).to.equal(null);
    }
  });
});
