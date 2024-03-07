import { Response, Request } from 'express';
import {
  createTemplate,
  findTemplateById,
  findAllTemplates,
  deleteTemplate,
} from '../../models/template';
import { HTTP_STATUS } from '../../constants';
import { generateRandId } from '../../utils/misc';

/**
 * Firebase API controllers, logic for endpoint routes.
 * @author Ibrahim Almalki
 */

// Create template
export const handleCreateTemplate = async (req: Request, res: Response) => {
  try {
    const templateID = generateRandId();
    const { serialized, title } = req.body; // The template parameters are in the body.

    const template = await createTemplate(templateID, serialized, title);

    res.status(HTTP_STATUS.SUCCESS).json({ template });
  } catch (error) {
    console.error('Error creating template:', error);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ error: 'Failed to create tempalate' });
  }
};

const validateId = (id: string, res: Response): id is string => {
  if (id === undefined) {
    res.status(HTTP_STATUS.ERROR).json({ error: 'No ID provided' });
    return false;
  }
  return true;
};

const notFoundError = (res: Response) =>
  res.status(HTTP_STATUS.ERROR).json({ error: 'template not found' });

// Get tempalte by ID
export const handleFindTemplateById = async (req: Request, res: Response) => {
  try {
    const templateId = req.query.id as string;
    if (!validateId(templateId, res)) return;
    const template = await findTemplateById(templateId as string);

    if (template) {
      res.status(HTTP_STATUS.SUCCESS).json({ template });
    } else {
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ error: notFoundError });
    }
  } catch (error) {
    console.error('Error finding template by ID:', error);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ error: 'Failed to find template' });
  }
};

// fetch all templates
export const handleFetchAllTemplates = async (_req: Request, res: Response) => {
  try {
    const templates = (await findAllTemplates()).map((template) => ({
      id: template.id,
      title: template.title,
    }));
    res.status(HTTP_STATUS.SUCCESS).json({ templates });
  } catch (error) {
    console.error('Error fetching all templates:', error);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ error: 'Failed to fetch all templates' });
  }
};

// Delete board
export const handleDeleteTemplate = async (req: Request, res: Response) => {
  try {
    const templateID = req.query.id as string; // The board ID parameter is in the body.
    if (!validateId(templateID, res)) return;
    const template = await findTemplateById(templateID);

    if (template) {
      await deleteTemplate(template);
      res
        .status(HTTP_STATUS.SUCCESS)
        .json({ message: 'Template deleted successfully' });
    } else {
      return notFoundError(res);
    }
  } catch (error) {
    console.error('Error deleting tempalte:', error);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ error: 'Failed to delete template' });
  }
};
