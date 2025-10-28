/**
 * Application-wide constants
 * Centralizes all magic strings and values
 */

// Colors
export const COLORS = {
  // Primary colors
  PRIMARY: '#48bb78',
  SECONDARY: '#edf2f7',
  DANGER: '#f56565',
  WARNING: '#ed8936',
  INFO: '#4299e1',
  SUCCESS: '#48bb78',

  // Background colors
  BG_LIGHT: '#f8f9fa',
  BG_GRAY: '#edf2f7',
  BG_BLUE_LIGHT: '#EBF8FF',
  BG_RED_LIGHT: '#FED7D7',
  BG_DARK: '#363636',

  // Text colors
  TEXT_PRIMARY: '#2d3748',
  TEXT_SECONDARY: '#4a5568',
  TEXT_MUTED: '#718096',
  TEXT_BLUE: '#2C5282',
  TEXT_LINK: '#3182ce',

  // Border colors
  BORDER_LIGHT: '#e2e8f0',
  BORDER_GRAY: '#cbd5e0',

  // Badge colors
  BADGE_GREEN_BG: '#c6f6d5',
  BADGE_GREEN_TEXT: '#22543d',
  BADGE_BLUE_BG: '#bee3f8',
  BADGE_BLUE_TEXT: '#2c5282',
  BADGE_PURPLE_BG: '#e9d8fd',
  BADGE_PURPLE_TEXT: '#44337a',
  BADGE_ORANGE_BG: '#fbd38d',
  BADGE_ORANGE_TEXT: '#7c2d12',
  BADGE_PINK_BG: '#fbb6ce',
  BADGE_PINK_TEXT: '#702459',
  BADGE_GRAY_BG: '#e2e8f0',
  BADGE_GRAY_TEXT: '#2d3748',

  // Priority colors
  PRIORITY_HIGH_BG: '#fed7e2',
  PRIORITY_HIGH_TEXT: '#97266d',
  PRIORITY_MEDIUM_BG: '#feebc8',
  PRIORITY_MEDIUM_TEXT: '#7c2d12',
  PRIORITY_LOW_BG: '#c6f6d5',
  PRIORITY_LOW_TEXT: '#22543d',

  // Importance colors
  IMPORTANCE_CRITICAL_BG: '#fed7d7',
  IMPORTANCE_CRITICAL_TEXT: '#742a2a',
  IMPORTANCE_HIGH_BG: '#fbd38d',
  IMPORTANCE_HIGH_TEXT: '#7c2d12',
  IMPORTANCE_NORMAL_BG: '#bee3f8',
  IMPORTANCE_NORMAL_TEXT: '#2c5282',

  // Toast colors (react-hot-toast)
  TOAST_BG: '#363636',
  TOAST_TEXT: '#fff',
  TOAST_SUCCESS: '#48bb78',
  TOAST_ERROR: '#f56565'
}

// Status values
export const STATUS = {
  NEW: 'New',
  IN_PROGRESS: 'In Progress',
  DONE: 'Done',
  ON_HOLD: 'On Hold',
  CANCELLED: 'Cancelled',
  ABANDONED: 'Abandoned',
  NA: 'N/A'
}

// Status options array for dropdowns
export const STATUS_OPTIONS = [
  { value: STATUS.NEW, label: 'New' },
  { value: STATUS.IN_PROGRESS, label: 'In Progress' },
  { value: STATUS.DONE, label: 'Done' },
  { value: STATUS.ON_HOLD, label: 'On Hold' },
  { value: STATUS.CANCELLED, label: 'Cancelled' },
  { value: STATUS.ABANDONED, label: 'Abandoned' },
  { value: STATUS.NA, label: 'N/A' }
]

// Triage Status values (for review workflow)
export const TRIAGE_STATUS = {
  NEW: 'New',
  ACTIVE: 'Active',
  DONE: 'Done'
}

// Triage status options array for dropdowns
export const TRIAGE_STATUS_OPTIONS = [
  { value: TRIAGE_STATUS.NEW, label: 'New' },
  { value: TRIAGE_STATUS.ACTIVE, label: 'Active' },
  { value: TRIAGE_STATUS.DONE, label: 'Done' }
]

// Note types
export const NOTE_TYPES = {
  NOTE: 'note',
  TASK: 'task',
  IDEA: 'idea',
  LIST: 'list',
  PROMPT: 'prompt',
  QUESTION: 'question',
  REFLECTION: 'reflection',
  EVENT: 'event',
  LINK: 'link'
}

// Note type options for dropdowns
export const NOTE_TYPE_OPTIONS = [
  { value: NOTE_TYPES.NOTE, label: 'Note' },
  { value: NOTE_TYPES.TASK, label: 'Task' },
  { value: NOTE_TYPES.IDEA, label: 'Idea' },
  { value: NOTE_TYPES.EVENT, label: 'Event' },
  { value: NOTE_TYPES.LINK, label: 'Link' },
  { value: NOTE_TYPES.LIST, label: 'List' },
  { value: NOTE_TYPES.PROMPT, label: 'Prompt' },
  { value: NOTE_TYPES.QUESTION, label: 'Question' },
  { value: NOTE_TYPES.REFLECTION, label: 'Reflection' }
]

// Priority values
export const PRIORITY = {
  HIGH: 'High',
  MEDIUM: 'Medium',
  LOW: 'Low'
}

// Importance values
export const IMPORTANCE = {
  CRITICAL: 'Critical',
  HIGH: 'High',
  NORMAL: 'Normal',
  LOW: 'Low'
}

// Filter options
export const FILTER_OPTIONS = {
  BOTH: 'both',
  WITH: 'with',
  WITHOUT: 'without'
}

// Sorting options
export const SORT_FIELDS = {
  UPDATED_AT: 'updated_at',
  CREATED_AT: 'created_at',
  TITLE: 'title',
  DUE_DATE: 'due_date',
  STATUS: 'status'
}

export const SORT_DIRECTIONS = {
  ASC: 'asc',
  DESC: 'desc'
}

// Toast configuration
export const TOAST_CONFIG = {
  POSITION: 'top-right',
  DURATION_DEFAULT: 3000,
  DURATION_ERROR: 4000,
  STYLE: {
    background: COLORS.TOAST_BG,
    color: COLORS.TOAST_TEXT
  },
  SUCCESS: {
    duration: 3000,
    iconTheme: {
      primary: COLORS.TOAST_SUCCESS,
      secondary: COLORS.TOAST_TEXT
    }
  },
  ERROR: {
    duration: 4000,
    iconTheme: {
      primary: COLORS.TOAST_ERROR,
      secondary: COLORS.TOAST_TEXT
    }
  }
}

// Validation limits
export const VALIDATION = {
  TITLE_MAX_LENGTH: 200,
  CONTENT_MAX_LENGTH: 10000,
  TAG_MAX_LENGTH: 50,
  URL_MAX_LENGTH: 2000,
  CATEGORY_MAX_LENGTH: 100,
  TYPE_MAX_LENGTH: 100
}

// UI Constants
export const UI = {
  CARD_MIN_WIDTH: '300px',
  CONTENT_PREVIEW_LENGTH: 100,
  LOADING_TIMEOUT: 30000, // 30 seconds
  DEBOUNCE_DELAY: 300 // milliseconds
}

// Error messages
export const ERROR_MESSAGES = {
  GENERIC: 'Something went wrong. Please try again.',
  NETWORK: 'Network error. Please check your connection.',
  AUTH_REQUIRED: 'Please sign in to continue.',
  NOT_FOUND: 'The requested item was not found.',
  PERMISSION_DENIED: 'You do not have permission to perform this action.',
  VALIDATION_FAILED: 'Please check your input and try again.',

  // Specific errors
  NOTE_CREATE_FAILED: 'Failed to create note',
  NOTE_UPDATE_FAILED: 'Failed to update note',
  NOTE_DELETE_FAILED: 'Failed to delete note',
  NOTE_ARCHIVE_FAILED: 'Failed to archive note',
  NOTE_RESTORE_FAILED: 'Failed to restore note',
  NOTE_FETCH_FAILED: 'Failed to fetch notes',

  // Validation errors
  CONTENT_REQUIRED: 'Content is required',
  TITLE_TOO_LONG: `Title must be less than ${VALIDATION.TITLE_MAX_LENGTH} characters`,
  CONTENT_TOO_LONG: `Content must be less than ${VALIDATION.CONTENT_MAX_LENGTH} characters`,
  INVALID_URL: 'Please enter a valid URL',
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_DATE: 'Please enter a valid date'
}

// Success messages
export const SUCCESS_MESSAGES = {
  NOTE_CREATED: 'Note created successfully!',
  NOTE_UPDATED: 'Note updated successfully!',
  NOTE_DELETED: 'Note deleted successfully',
  NOTE_ARCHIVED: 'Note archived successfully',
  NOTE_RESTORED: 'Note restored successfully',
  CHANGES_SAVED: 'Changes saved successfully'
}

// Confirmation messages
export const CONFIRM_MESSAGES = {
  DELETE_NOTE: 'Are you sure you want to permanently delete this note? This cannot be undone.',
  ARCHIVE_NOTE: 'Are you sure you want to archive this note?',
  RESTORE_NOTE: 'Are you sure you want to restore this note?'
}
