import express from 'express';
import {
  handleCreateBoard,
  handleDeleteBoard,
  handleFindBoardById,
  handleUpdateBoardTitle,
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

// PUT update board's title
router.put('/updateBoardTitle', handleUpdateBoardTitle);

// DELETE board by ID
router.delete('/deleteBoard', handleDeleteBoard);

export default router;
