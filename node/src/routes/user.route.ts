import express from 'express';
import {
  handleCreateUser,
  handleDeleteUser,
  handleFindUserById,
  handleUpdateUserName,
} from './user.controller';

/**
 * Defines tempfirebase routes.
 * @authors Ibrahim Almalki
 */

// The express router
const router = express.Router();

// POST create a new user
router.post('/createUser', handleCreateUser);

// GET user by ID
router.get('/getUser', handleFindUserById);

// PUT update user's name
router.put('/updateUser', handleUpdateUserName);

// DELETE user by ID
router.delete('/deleteUser', handleDeleteUser);

export default router;
