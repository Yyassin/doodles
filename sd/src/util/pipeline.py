import torch
from diffusers import DiffusionPipeline, StableDiffusionImg2ImgPipeline

"""
Defines utility functions for loading pre-trained diffusion models and a class
(DiffuserPipeline) for generating diffused images using the loaded models.
@author Yousef Yassin
"""


def load_model(model_name: str):
    """
    Load a pre-trained diffusion model based on the specified model_name.

    Args:
        model_name (str): Name of the diffusion model.

    Returns:
        diffusers.DiffusionPipeline or diffusers.StableDiffusionImg2ImgPipeline: Loaded model instance.
    """
    match model_name:
        case "dreamshaper":
            # Loading Dreamshaper model
            pipeline = DiffusionPipeline.from_pretrained(
                "SimianLuo/LCM_Dreamshaper_v7",
                revision="fb9c5d167af11fd84454ae6493878b10bb63b067",
                safety_checker=None,
                custom_pipeline="latent_consistency_img2img",
            )
            pipeline.to(torch_device="cuda", torch_dtype=torch.float16)
            pipeline.set_progress_bar_config(disable=True)
            return pipeline

        case "stable_diffusion_14":
            # Loading Stable Diffusion model version 1.4
            pipeline = StableDiffusionImg2ImgPipeline.from_pretrained(
                "CompVis/stable-diffusion-v1-4",
                revision="fp16",
                torch_dtype=torch.float16,
                use_auth_token=True,
            )
            pipeline.to(torch_device="cuda", torch_dtype=torch.float16)
            pipeline.set_progress_bar_config(disable=True)
            return pipeline


class DiffuserPipeline:
    """
    Wrapper class for a diffusion model with pre-trained weights, providing an interface for generating diffused images.

    Attributes:
        pipeline: An instance of a pre-trained diffusion model.

    Methods:
        __init__(self, model_name: str): Initializes DiffuserPipeline with the specified model_name.
        load_model(self, model_name: str): Loads a pre-trained diffusion model based on the model_name.
        generate_images(self, prompt: str, init_image, num_images: int = 5, **kwargs): Generates a series of diffused images.
    """

    def __init__(self, model_name: str):
        """
        Initialize DiffuserPipeline with the specified model_name.

        Args:
            model_name (str): Name of the diffusion model.
        """
        self.load_model(model_name=model_name)

    def load_model(self, model_name: str):
        """
        Load a pre-trained diffusion model based on the specified model_name.

        Args:
            model_name (str): Name of the diffusion model.
        """
        self.pipeline = load_model(model_name=model_name)

    def generate_images(self, prompt: str, init_image, num_images: int = 5, **kwargs):
        """
        Generate a series of diffused images based on a prompt.

        Args:
            prompt (str): Prompt for generating images.
            init_image: Initial image for the diffusion process.
            num_images (int): Number of images to generate.
            **kwargs: Additional arguments to pass to the diffusion model.

        Returns:
            list: List of generated diffused images.
        """
        images = []
        for _ in range(num_images):
            # TODO: Add negative prompr, guidance, scale on gui
            # image = pipeline(prompt, negative_prompt=negative_prompt, image=init_image).images[0]
            # Generating diffused image using the loaded model
            image = self.pipeline(prompt, image=init_image, **kwargs).images[0]
            images.append(image)

        return images
