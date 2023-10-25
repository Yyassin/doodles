import express from 'express';
import {
  handleCreateCollaborator,
  handleDeleteCollaborator,
  handleFindCollaboratorById,
  handleUpdatePermissionLevel,
} from './collaborator.controller';

/**
 * Defines tempfirebase routes.
 * @authors Ibrahim Almalki
 */

// The express router
const router = express.Router();

// POST create a new collaborator
router.post('/createCollaborator', handleCreateCollaborator);

// GET collaborator by ID
router.get('/getCollaborator', handleFindCollaboratorById);

// PUT update collaborator's permission level
router.put('/updatePermissionLevel', handleUpdatePermissionLevel);

// DELETE collaborator by ID
router.delete('/deleteCollaborator', handleDeleteCollaborator);

export default router;
