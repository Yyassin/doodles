import { Response, Request } from 'express';
import { uploadImageToStorage } from '../firebase/firebaseDB';
import { HTTP_STATUS } from '../constants';

/**
 * Firebase API controllers, logic for endpoint routes.
 * @author Ibrahim Almalki
 */

// TODO: JSDOC

export const handleUploadImage = async (req: Request, res: Response) => {
  try {
    // Get the uploaded image data from req.file
    const imageBuffer = req.file?.buffer;
    if (imageBuffer === undefined) {
      throw new Error('Image file or buffer is empty.');
    }

    // Specify the destination path in Firebase Storage where you want to store the image
    const destinationPath =
      req.body.destinationPath || 'node/imageSamples/cat.png';

    // Upload the image to Firebase Storage
    await uploadImageToStorage(imageBuffer, destinationPath);

    res
      .status(HTTP_STATUS.SUCCESS)
      .json({ message: 'Image uploaded successfully' });
  } catch (error) {
    console.error('Error handling image upload:', error);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ error: 'Image upload failed' });
  }
};
