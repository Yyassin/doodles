import express from 'express';
import {
  handleCreateUser,
  handleDeleteUser,
  handleFindUserById,
  handleUpdateUser,
} from './user.controller';

/**
 * Defines User routes.
 * @authors Ibrahim Almalki
 */

// The express router
const router = express.Router();

// POST create a new user
router.post('/createUser', handleCreateUser);

// GET user by ID
router.get('/getUser', handleFindUserById);

// PUT update user
router.put('/updateUser', handleUpdateUser);

// DELETE user by ID
router.delete('/deleteUser', handleDeleteUser);

export default router;
