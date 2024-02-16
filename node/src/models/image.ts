import { DocumentFields } from 'fastfire/dist/types';
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
}

// Function to create an image
export async function createImage(imageEncoded: string) {
  const uid = generateRandId();
  return await FastFire.create(
    Image,
    {
      uid,
      imageEncoded,
    },
    uid,
  );
}

// Function to find a image by ID
export const findImageById = async (imageId: string) =>
  FastFire.findById(Image, imageId);

// Function to update a the image
export const updateImage = async (
  image: Image,
  updatedFields: Partial<DocumentFields<Image>>,
) => {
  const { fastFireOptions: _fastFireOptions, id: _id, ...imageFields } = image;
  const updatedImage = { ...imageFields, ...updatedFields };
  await image.update(updatedImage);
  return updateImage;
};

// Function to delete an image
export const deleteImage = async (image: Image) => await image.delete();
