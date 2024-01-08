import express from 'express';
import {
  handleCreateBoard,
  handleDeleteBoard,
  handleFindBoardById,
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

// PUT update a board
router.put('/updateBoard', handleUpdateBoard);

// DELETE board by ID
router.delete('/deleteBoard', handleDeleteBoard);

export default router;
