from marshmallow import Schema, fields


class SDRequest(object):
    def __init__(self, im_dataurl, prompt):
        self.im_dataurl = im_dataurl
        self.prompt = prompt

    def __repr__(self):
        return "<SDRequest(name={self.description!r})>".format(self=self)


class SDRequestSchema(Schema):
    im_dataurl = fields.Str()
    prompt = fields.Str()
