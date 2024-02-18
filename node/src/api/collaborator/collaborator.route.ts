import express from 'express';
import {
  handleCreateCollaborator,
  handleDeleteCollaborator,
  handleFindCollaboratorById,
  handleFindCollaboratorsById,
  handleUpdateCollaborator,
} from './collaborator.controller';

/**
 * Defines collaborator routes.
 * @authors Ibrahim Almalki
 */

// The express router
const router = express.Router();

// POST create a new collaborator
router.post('/createCollaborator', handleCreateCollaborator);

// GET collaborator by ID
router.get('/getCollaborator', handleFindCollaboratorById);

// GET collaborators by ID
router.get('/getCollaborators', handleFindCollaboratorsById);

// PUT update a collaborator
router.put('/updateCollaborator', handleUpdateCollaborator);

// DELETE collaborator by ID
router.delete('/deleteCollaborator', handleDeleteCollaborator);

export default router;
