from PIL import Image
import base64
from io import BytesIO

"""
Defines byte-level operations for encoding and decoding images.
@author Yousef Yassin
"""


def pil_image_to_data_url(pil_image: Image.Image, format: str = "PNG") -> str:
    """
    Convert the specified PIL image to a data URL.

    Args:
        pil_image (Image.Image): The PIL image to convert.
        format (str): The image format (defaults to "PNG").

    Returns:
        str: The data URL representing the image.
    """
    # Convert PIL image to bytes
    image_stream = BytesIO()
    pil_image.save(image_stream, format=format)
    image_data = image_stream.getvalue()

    # Encode the image data in base64
    base64_encoded = base64.b64encode(image_data).decode("utf-8")

    # Create the data URL
    data_url = f"data:image/{format.lower()};base64,{base64_encoded}"
    return data_url


PADDING_MULTIPLE = 4


def data_url_to_pil_image(data_url: str) -> Image.Image:
    """
    Convert a data URL to a PIL image.

    Args:
        data_url (str): The data URL representing the image.

    Returns:
        Image.Image: The PIL image.
    """
    # Extract the base64-encoded image data from the data URL
    _, data = data_url.split(",", 1)

    # Add padding if necessary
    # Source: An additional pad character is allocated which may
    # be used to force the encoded output into an integer multiple of 4 characters
    padding = "=" * (PADDING_MULTIPLE - len(data) % PADDING_MULTIPLE)
    data += padding

    # Decode base64 and create BytesIO object
    image_data = base64.b64decode(data)
    image_stream = BytesIO(image_data)

    # Load PIL image
    pil_image = Image.open(image_stream)

    return pil_image
