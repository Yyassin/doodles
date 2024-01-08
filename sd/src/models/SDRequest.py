from marshmallow import Schema, fields

"""
Defines a data class (SDRequest) representing a request for image diffusion and a schema class
(SDRequestSchema) for validating and deserializing JSON data into SDRequest objects.
@author Yousef Yassin
"""


class SDRequest(object):
    """
    Class representing a request for image diffusion.

    Attributes:
        im_dataurl (str): Image data URL for the initial image.
        prompt (str): Prompt for generating diffused images.

    Methods:
        __init__(self, im_dataurl, prompt): Initializes SDRequest with image data URL and prompt.
        __repr__(self): Returns a string representation of the SDRequest object.

    """

    def __init__(self, im_dataurl, prompt):
        """
        Initializes SDRequest with image data URL and prompt.

        Args:
            im_dataurl (str): Image data URL for the initial image.
            prompt (str): Prompt for generating diffused images.
        """
        self.im_dataurl = im_dataurl
        self.prompt = prompt

    def __repr__(self):
        """
        Returns a string representation of the SDRequest object.

        Returns:
            str: String representation of the SDRequest object.
        """
        return "<SDRequest(name={self.description!r})>".format(self=self)


class SDRequestSchema(Schema):
    """
    Schema class for validating and deserializing JSON data into SDRequest objects.

    Fields:
        im_dataurl (fields.Str): String field for image data URL.
        prompt (fields.Str): String field for the prompt.

    """

    im_dataurl = fields.Str()
    prompt = fields.Str()
