import {
  FastFire,
  FastFireCollection,
  FastFireField,
  FastFireDocument,
} from 'fastfire';
import { generateRandId } from '../utils/misc';

/**
 * Defines image class.
 * @authors Ibrahim Almalki
 */

//TODO: add createdAt and updatedAt
@FastFireCollection('Image')
export class Image extends FastFireDocument<Image> {
  @FastFireField({ required: true })
  uid!: string;
  @FastFireField({ required: true })
  imageEncoded!: string;
  @FastFireField({ required: true })
  createdAt!: Date;
}

// Function to create an image
export async function createImage(imageEncoded: string) {
  const uid = generateRandId();
  const createdAt = new Date();
  return await FastFire.create(
    Image,
    {
      uid,
      imageEncoded,
      createdAt,
    },
    uid,
  );
}

// Function to find a image by ID
export const findImageById = async (imageId: string) =>
  FastFire.findById(Image, imageId);
