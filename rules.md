# Minimalistic Notes - Project Rules & Guidelines

## Development Workflow

### Git Commit Strategy
**CRITICAL RULE:** Always commit and push changes to GitHub after each significant change.

**When to commit:**
- ✅ After creating new files (components, utilities, constants)
- ✅ After refactoring existing files
- ✅ After fixing bugs or errors
- ✅ After adding new features
- ✅ After completing a logical unit of work
- ✅ Before switching to a different task/feature

**Commit Message Convention:**
```
<type>: <short description>

<optional detailed description>

🤖 Generated with Claude Code
```

**Types:**
- `feat:` - New feature
- `fix:` - Bug fix
- `refactor:` - Code refactoring
- `perf:` - Performance improvement
- `style:` - Code style/formatting
- `docs:` - Documentation
- `test:` - Tests
- `chore:` - Maintenance tasks

---

## Code Quality Standards

### Architecture Principles
1. **DRY (Don't Repeat Yourself)** - Use custom hooks and utilities
2. **Separation of Concerns** - Components, hooks, utilities, constants in separate files
3. **Single Source of Truth** - All constants in `/src/constants/`
4. **Component Composition** - Reusable, focused components

### File Organization
```
src/
├── constants/      # All magic values, messages, config
├── utils/          # Pure helper functions
├── hooks/          # Custom React hooks
├── components/     # Reusable UI components
│   └── notes/      # Feature-specific components
└── pages/          # Route components
```

### Code Standards
- ✅ **PropTypes** on all components
- ✅ **React.memo** for performance-critical components
- ✅ **useCallback** for event handlers passed to children
- ✅ **useMemo** for expensive computations
- ✅ **Error Boundaries** for graceful error handling
- ✅ **Memory leak prevention** with cleanup in useEffect
- ✅ **Accessibility** - ARIA labels, semantic HTML, keyboard navigation

### Constants Usage
- ❌ NEVER hardcode colors, messages, or config
- ✅ ALWAYS import from `/src/constants/`
- ✅ Use `STATUS.NEW` instead of `'New'`
- ✅ Use `SUCCESS_MESSAGES.NOTE_CREATED` instead of `'Note created!'`

### Utilities Usage
- ❌ NEVER duplicate validation logic
- ✅ Use `parseTags()` from `tagHelpers`
- ✅ Use `validateNote()` from `validation`
- ✅ Use `formatDateForDisplay()` from `dateHelpers`
- ✅ Use `getErrorMessage()` from `errorHandler`

---

## Accessibility Requirements (WCAG 2.1)

### Mandatory ARIA Attributes
- `aria-label` on all interactive elements without visible text
- `aria-labelledby` on sections/forms
- `aria-required` on required form fields
- `role="alert"` on error messages
- `role="status"` on loading states
- `aria-live="polite"` for dynamic content updates

### Keyboard Navigation
- All interactive elements must be keyboard accessible
- Tab order must be logical
- Focus indicators must be visible (`:focus-visible`)
- Enter/Space must activate clickable elements

### Semantic HTML
- Use `<section>`, `<article>`, `<nav>`, `<main>` appropriately
- Use `<button>` for actions, `<a>` for navigation
- Form elements must have associated `<label>`

---

## Performance Guidelines

### Component Optimization
```javascript
// ✅ DO: Memoize expensive components
export default React.memo(MyComponent)

// ✅ DO: Use useCallback for event handlers
const handleClick = useCallback(() => {
  // handler logic
}, [dependencies])

// ✅ DO: Use useMemo for expensive computations
const filteredData = useMemo(() => {
  return data.filter(expensive)
}, [data])
```

### Memory Management
```javascript
// ✅ DO: Cleanup in useEffect
useEffect(() => {
  let mounted = true
  const isMounted = () => mounted

  asyncOperation(isMounted)

  return () => {
    mounted = false
  }
}, [])
```

---

## Testing Checklist

Before committing, verify:
- [ ] Dev server runs without errors
- [ ] All HMR updates successful
- [ ] No console errors/warnings
- [ ] PropTypes validation passes
- [ ] Accessibility labels present
- [ ] No memory leaks (cleanup in useEffect)
- [ ] 0 npm vulnerabilities

---

## Security

### Supabase Configuration
- ✅ Use `.env` for credentials (never commit)
- ✅ Use `VITE_` prefix for public env vars
- ✅ Validate user input before database operations
- ✅ Use RLS (Row Level Security) policies

### Input Validation
- ✅ Validate on frontend (UX)
- ✅ Validate on backend (Security)
- ✅ Sanitize user input
- ✅ Use URL validation for links

---

## Dependencies Management

### Installation
```bash
npm install <package>    # Always check for vulnerabilities
npm audit fix           # Fix security issues
```

### Key Dependencies
- `react` - UI framework
- `react-router-dom` - Routing
- `@supabase/supabase-js` - Backend
- `react-hot-toast` - Notifications
- `react-calendar` - Calendar widget
- `prop-types` - Runtime type checking

---

## Build & Deploy

### Development
```bash
npm run dev              # Start dev server
```

### Production Build
```bash
npm run build           # Build for production
npm run preview         # Preview production build
```

### Environment Variables
Required in `.env`:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

---

## Refactoring History

### Major Refactorings Completed
1. ✅ **Code Duplication Elimination** (68% → 5%)
   - Dashboard: 1687 → 601 lines
   - Archive: 743 → 178 lines

2. ✅ **Custom Hooks Architecture**
   - `useNotesData` - Data fetching & state
   - `useNoteFilters` - Filtering & sorting
   - `useNotesCRUD` - CRUD operations

3. ✅ **Shared Components**
   - NoteCard, NoteSearch, NoteSorting, NoteFilters

4. ✅ **Constants & Utilities**
   - All magic values → constants
   - All duplicated logic → utilities

5. ✅ **Accessibility Overhaul**
   - ARIA labels, semantic HTML, keyboard nav

6. ✅ **Performance Optimization**
   - React.memo, useCallback, useMemo

7. ✅ **Security Fixes**
   - Memory leaks fixed
   - Race conditions fixed
   - 0 vulnerabilities

---

## Contribution Guidelines

When making changes:
1. Create a feature branch
2. Make changes following these rules
3. Test thoroughly
4. Commit with descriptive message
5. Push to GitHub
6. Create PR if working with team

---

**Last Updated:** 2025-10-21
**Maintained by:** Claude Code + Development Team
**Version:** 1.0.0
