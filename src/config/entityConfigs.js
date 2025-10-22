/**
 * Entity Configuration for EntityManager Components
 * Defines fields, validation, and display settings for each entity type
 */

export const spaceConfig = {
  tableName: 'spaces',
  entityDisplayName: 'Space',
  selectQuery: '*',
  fields: [
    {
      name: 'name',
      label: 'Name',
      type: 'text',
      required: true,
      placeholder: 'e.g., Work, Personal, Projects',
      helpText: 'A descriptive name for your space',
    },
    {
      name: 'description',
      label: 'Description',
      type: 'textarea',
      required: false,
      placeholder: 'What is this space for?',
      helpText: 'Optional description to help you remember the purpose of this space',
    },
    {
      name: 'color',
      label: 'Color',
      type: 'color',
      required: false,
      defaultValue: '#6366f1',
      helpText: 'Choose a color to visually identify this space',
    },
    {
      name: 'icon',
      label: 'Icon',
      type: 'text',
      required: false,
      defaultValue: '📁',
      placeholder: '📁',
      helpText: 'Optional emoji icon for this space',
    },
  ],
}

export const categoryConfig = {
  tableName: 'categories',
  entityDisplayName: 'Category',
  selectQuery: '*',
  fields: [
    {
      name: 'name',
      label: 'Name',
      type: 'text',
      required: true,
      placeholder: 'e.g., Urgent, Important, Review',
      helpText: 'A descriptive name for your category',
    },
    {
      name: 'description',
      label: 'Description',
      type: 'textarea',
      required: false,
      placeholder: 'What kind of notes belong in this category?',
      helpText: 'Optional description for this category',
    },
    {
      name: 'color',
      label: 'Color',
      type: 'color',
      required: false,
      defaultValue: '#10b981',
      helpText: 'Choose a color to visually identify this category',
    },
  ],
}

export const tagConfig = {
  tableName: 'tags',
  entityDisplayName: 'Tag',
  selectQuery: '*',
  fields: [
    {
      name: 'name',
      label: 'Name',
      type: 'text',
      required: true,
      placeholder: 'e.g., meeting, idea, todo',
      helpText: 'A short tag name (no spaces or special characters recommended)',
    },
    {
      name: 'color',
      label: 'Color',
      type: 'color',
      required: false,
      defaultValue: '#8b5cf6',
      helpText: 'Choose a color for this tag',
    },
  ],
}

export const projectConfig = (spaces = []) => ({
  tableName: 'projects',
  entityDisplayName: 'Project',
  selectQuery: '*, spaces(name)',
  fields: [
    {
      name: 'name',
      label: 'Name',
      type: 'text',
      required: true,
      placeholder: 'e.g., Website Redesign, Q1 Planning',
      helpText: 'A descriptive name for your project',
    },
    {
      name: 'description',
      label: 'Description',
      type: 'textarea',
      required: false,
      placeholder: 'What is this project about?',
      helpText: 'Optional project description',
    },
    {
      name: 'color',
      label: 'Color',
      type: 'color',
      required: false,
      defaultValue: '#3b82f6',
      helpText: 'Choose a color to visually identify this project',
    },
    {
      name: 'space_id',
      label: 'Space',
      type: 'select',
      required: false,
      options: spaces.map((space) => ({
        value: space.id,
        label: space.name,
      })),
      helpText: 'Optional: Assign this project to a space',
    },
  ],
})
