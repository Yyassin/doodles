from flask import Flask, request

from .util.bytes import pil_image_to_data_url, data_url_to_pil_image
from .util.pipeline import DiffuserPipeline
from .models.SDRequest import SDRequestSchema


app = Flask(__name__)
pipeline = DiffuserPipeline(model_name="dreamshaper")


@app.route("/test")
def get_test():
    return "Online"


@app.route("/diffusion", methods=["POST"])
def post_diffusion():
    sd_request = SDRequestSchema().load(request.get_json())
    init_image = data_url_to_pil_image(data_url=sd_request["im_dataurl"])
    images = pipeline.generate_images(
        prompt=sd_request["prompt"],
        init_image=init_image,
        num_images=5,
        # TODO: These will be passed in req
        num_inference_steps=10,
        guidance_scale=8.0,
        lcm_origin_steps=50,
        strength=0.8,
    )
    # TODO: Use generator
    image_data_urls = [pil_image_to_data_url(image) for image in images]
    return image_data_urls


if __name__ == "__main__":
    app.run(debug=True)
