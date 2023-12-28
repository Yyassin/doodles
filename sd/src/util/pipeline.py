import torch
from diffusers import DiffusionPipeline


def load_model(model_name: str):
    match model_name:
        case "dreamshaper":
            pipeline = DiffusionPipeline.from_pretrained(
                "SimianLuo/LCM_Dreamshaper_v7",
                revision="fb9c5d167af11fd84454ae6493878b10bb63b067",
                safety_checker=None,
                custom_pipeline="latent_consistency_img2img",
            )
            pipeline.to(torch_device="cuda", torch_dtype=torch.float16)
            pipeline.set_progress_bar_config(disable=True)
            return pipeline


class DiffuserPipeline:
    def __init__(self, model_name: str):
        self.load_model(model_name=model_name)

    def load_model(self, model_name: str):
        self.pipeline = load_model(model_name=model_name)

    def generate_images(self, prompt: str, init_image, num_images: int = 5, **kwargs):
        images = []
        for _ in range(num_images):
            # Guidance scale and strength
            # image = pipeline(prompt, negative_prompt=negative_prompt, image=init_image).images[0]
            image = self.pipeline(prompt, image=init_image, **kwargs).images[0]
            images.append(image)

        return images
