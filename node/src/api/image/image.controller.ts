import { Response, Request } from 'express';
import { createImage, findImageById } from '../../models/image';
import { HTTP_STATUS } from '../../constants';

/**
 * Firebase API controllers, logic for endpoint routes.
 * @author Ibrahim Almalki
 */

// TODO: JSDOC

// Create image
export const handleCreateImage = async (req: Request, res: Response) => {
  try {
    const { imageEncoded } = req.body;
    const image = await createImage(imageEncoded);

    res.status(HTTP_STATUS.SUCCESS).json({ image });
  } catch (error) {
    console.error('Error creating image:', error);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ error: 'Failed to create image' });
  }
};

const validateId = (id: string, res: Response): id is string => {
  if (id === undefined) {
    res.status(HTTP_STATUS.ERROR).json({ error: 'NO ID PROVIDED' });
    return false;
  }
  return true;
};

const notFoundError = (res: Response) =>
  res.status(HTTP_STATUS.ERROR).json({ error: 'image not found' });

// Get image
export const handleFindImageById = async (req: Request, res: Response) => {
  try {
    const imageId = req.body.id; // The comment ID parameter is in the body.
    if (!validateId(imageId, res)) return;

    const image = await findImageById(imageId as string);

    if (image) {
      res.status(HTTP_STATUS.SUCCESS).json({ image });
    } else {
      return notFoundError(res);
    }
  } catch (error) {
    console.error('Error finding image by ID:', error);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ error: 'Failed to find image' });
  }
};
