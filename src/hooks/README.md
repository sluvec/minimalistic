# Custom React Hooks

This directory contains reusable React hooks for the application.

## Planned Hooks:

- `useAuth.js` - Authentication state management
- `useForm.js` - Form handling with validation
- `useNotes.js` - Notes data fetching and mutations
- `useProjects.js` - Projects data management
- `useDebounce.js` - Debounce values for search/filter
- `useLocalStorage.js` - Local storage persistence

## Usage Pattern:

```javascript
import { useNotes } from './hooks/useNotes'

function MyComponent() {
  const { notes, isLoading, error } = useNotes()
  // ...
}
```

See individual hook files for detailed documentation.
