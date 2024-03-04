import express from 'express';
import {
  handleCreateTemplate,
  handleDeleteTemplate,
  handleFetchAllTemplates,
  handleFindTemplateById,
} from './template.controller';

/**
 * Defines Template routes.
 * @authors Ibrahim Almalki
 */

// The express router
const router = express.Router();

// POST create a new template
router.post('/createTemplate', handleCreateTemplate);

// GET template by ID
router.get('/getTemplate', handleFindTemplateById);

// GET all templates
router.get('/getAllTemplates', handleFetchAllTemplates);

// DELETE template by ID
router.delete('/deleteTemplate', handleDeleteTemplate);

export default router;
