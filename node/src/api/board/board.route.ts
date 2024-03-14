import express from 'express';
import {
  handleAddUserbyEmail,
  handleCreateBoard,
  handleDeleteBoard,
  handleFindBoardById,
  handleGetCollaboratorBoards,
  handleRemoveCollaborator,
  handleUpdateBoard,
} from './board.controller';

/**
 * Defines board routes.
 * @authors Ibrahim Almalki
 */

// The express router
const router = express.Router();

// POST create a new board
router.post('/createBoard', handleCreateBoard);

// GET board by ID
router.get('/getBoard', handleFindBoardById);

// GET board by ID
router.get('/getCollaboratorsBoard', handleGetCollaboratorBoards);

// PUT update a board
router.put('/updateBoard', handleUpdateBoard);

// PUT add user by email
router.put('/addUser', handleAddUserbyEmail);

// DELETE board by ID
router.delete('/deleteBoard', handleDeleteBoard);

// PUT new collaborators a board
router.put('/updateCollabs', handleRemoveCollaborator);

export default router;
