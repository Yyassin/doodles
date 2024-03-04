import {
  FastFire,
  FastFireCollection,
  FastFireField,
  FastFireDocument,
} from 'fastfire';
//import firebase from 'firebase/compat';

/**
 * Defines template class.
 * @authors Ibrahim Almalki
 */

@FastFireCollection('Template')
export class Template extends FastFireDocument<Template> {
  @FastFireField({ required: true })
  uid!: string;
  @FastFireField({ required: true })
  serialized!: Record<string, unknown>;
  @FastFireField({ required: true })
  title!: string;
  @FastFireField({ required: true })
  createdAt!: Date;
  @FastFireField({ required: true })
  updatedAt!: Date;
}

// Function to create a tenmplate
export async function createTemplate(
  uid: string,
  serialized: Record<string, unknown>,
  title: string,
) {
  const createdAt = new Date().toUTCString();
  const updatedAt = new Date().toUTCString();
  return FastFire.create(
    Template,
    {
      uid,
      serialized,
      title,
      createdAt,
      updatedAt,
    },
    uid,
  );
}

// Function to find a template by ID
export const findTemplateById = async (templateId: string) =>
  FastFire.findById(Template, templateId);

// Function to find all templates
export const findAllTemplates = async () =>
  FastFire.where(Template, 'uid', '!=', 'null').get();

// Function to delete a template
export const deleteTemplate = async (template: Template) =>
  await template.delete();
