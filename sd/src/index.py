from flask import Flask, request, jsonify
from flask_cors import CORS

from .util.bytes import pil_image_to_data_url, data_url_to_pil_image
from .util.pipeline import DiffuserPipeline
from .models.SDRequest import SDRequestSchema

"""
Defines a Flask web application that exposes two endpoints:
1. /test: Returns a simple "Online" message to check if the server is running.
2. /diffusion: Accepts a POST request with JSON data containing an image data URL and a prompt.
   It uses a DiffuserPipeline to generate a series of diffused images based on the provided data.
    It returns a JSON response containing a list of image data URLs.
@author Yousef Yassin
"""

# Initializing the Flask app
app = Flask(__name__)
# Enabling CORS for the app
CORS(app)

# Creating an instance of DiffuserPipeline with a specific model
pipeline = DiffuserPipeline(model_name="stable_diffusion_14")


# Endpoint to check if the server is online
@app.route("/test")
def get_test():
    return "Online"


# Endpoint to perform image diffusion based on received image and prompt
@app.route("/diffusion", methods=["POST"])
def post_diffusion():
    sd_request = SDRequestSchema().load(request.get_json())
    # Converting the image data URL in the request to a PIL image
    # TODO: TEST THIS IS CORRECT
    init_image = data_url_to_pil_image(data_url=sd_request["im_dataurl"])
    # Generating a series of images using the DiffuserPipeline
    images = pipeline.generate_images(
        prompt=sd_request["prompt"],
        init_image=init_image,
        num_images=5,
        # TODO: These will be passed in req
        num_inference_steps=40,
        strength=0.5,
        guidance_scale=7.5,
        # lcm_origin_steps=50,
        # strength=0.8,
    )
    # TODO: Use generator if more images / diff size
    # Converting the generated images to data URLs
    image_data_urls = [pil_image_to_data_url(image) for image in images]
    # Creating a JSON response with the generated image data URLs
    response = jsonify({"image_data_urls": image_data_urls})
    # Returning the JSON response
    return response


if __name__ == "__main__":
    app.run(debug=True)
