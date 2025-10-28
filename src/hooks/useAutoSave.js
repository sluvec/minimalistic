import { useEffect, useRef, useCallback, useState } from 'react'

/**
 * Custom hook for auto-saving with debouncing
 * Provides a modern, friction-free save experience
 *
 * @param {Function} saveFunction - Async function to save data
 * @param {any} data - Data to save
 * @param {Object} options - Configuration options
 * @param {number} options.delay - Debounce delay in ms (default: 1500)
 * @param {boolean} options.enabled - Enable/disable auto-save (default: true)
 * @returns {Object} - { isSaving, lastSaved, saveNow, error }
 */
export function useAutoSave(saveFunction, data, options = {}) {
  const {
    delay = 1500,
    enabled = true
  } = options

  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState(null)
  const [error, setError] = useState(null)

  const timeoutRef = useRef(null)
  const previousDataRef = useRef(data)
  const isMountedRef = useRef(false)

  // Save immediately (for manual triggers like Cmd+S)
  const saveNow = useCallback(async () => {
    if (!enabled) return

    setIsSaving(true)
    setError(null)

    try {
      await saveFunction(data)
      setLastSaved(new Date())
      previousDataRef.current = data
    } catch (err) {
      console.error('Auto-save error:', err)
      setError(err.message || 'Failed to save')
    } finally {
      setIsSaving(false)
    }
  }, [saveFunction, data, enabled])

  // Debounced auto-save
  useEffect(() => {
    // Skip on initial mount
    if (!isMountedRef.current) {
      isMountedRef.current = true
      previousDataRef.current = data
      return
    }

    if (!enabled) return

    // Check if data actually changed
    const hasChanged = JSON.stringify(previousDataRef.current) !== JSON.stringify(data)
    if (!hasChanged) return

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Set new timeout for debounced save
    timeoutRef.current = setTimeout(() => {
      saveNow()
    }, delay)

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [data, delay, enabled, saveNow])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return {
    isSaving,
    lastSaved,
    saveNow,
    error
  }
}
