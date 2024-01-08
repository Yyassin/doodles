import axios from 'axios';

/**
 * Defines REST methods for the Stable Diffusion API.
 * @author Yousef Yassin
 */

/**
 * Sends a textual prompt and an image, as a dataURL, to the server
 * to perform stable diffusion. Return the generated images.
 * TODO: Add more options here. / more methods to set models.
 * @param prompt The textual prompt.
 * @param dataURL The image to condition on.
 * @returns The generated images { image_data_urls: string[] }.
 */
const diffusion = async (prompt: string, dataURL: string) => {
  try {
    const { data } = await axios.post('http://localhost:5000/diffusion', {
      prompt,
      im_dataurl: dataURL,
    });
    return data;
  } catch (e) {
    console.error('Failed to diffuse.');
  }
};

export const stableDiffusion = { diffusion };
