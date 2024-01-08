import axios from 'axios';

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
