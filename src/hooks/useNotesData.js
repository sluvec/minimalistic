import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'

/**
 * Custom hook for fetching and managing notes data
 * Handles loading, error states, and data fetching
 */
export function useNotesData(archived = false) {
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchNotes = useCallback(async (isMounted) => {
    try {
      if (!isMounted()) return

      setLoading(true)
      setError(null)

      const { data: { user } } = await supabase.auth.getUser()

      if (!isMounted()) return

      if (!user) {
        setNotes([])
        return
      }

      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.id)
        .eq('archived', archived)
        .order('updated_at', { ascending: false })

      if (!isMounted()) return

      if (error) {
        throw error
      }

      if (data) {
        setNotes(data)
      }
    } catch (error) {
      console.error('Error fetching notes:', error.message)
      if (isMounted()) {
        setError('Failed to fetch notes.')
      }
    } finally {
      if (isMounted()) {
        setLoading(false)
      }
    }
  }, [archived])

  useEffect(() => {
    let mounted = true
    const isMounted = () => mounted

    fetchNotes(isMounted)

    return () => {
      mounted = false
    }
  }, [fetchNotes])

  // Refresh notes (can be called manually)
  const refresh = useCallback(() => {
    // For manual refresh, we use a simple mounted check
    let mounted = true
    const isMounted = () => mounted
    fetchNotes(isMounted)
  }, [fetchNotes])

  // Update local state after mutations (optimistic updates)
  const updateNoteInState = useCallback((noteId, updates) => {
    setNotes(prevNotes =>
      prevNotes.map(note =>
        note.id === noteId ? { ...note, ...updates } : note
      )
    )
  }, [])

  const removeNoteFromState = useCallback((noteId) => {
    setNotes(prevNotes => prevNotes.filter(note => note.id !== noteId))
  }, [])

  const addNoteToState = useCallback((newNote) => {
    setNotes(prevNotes => [newNote, ...prevNotes])
  }, [])

  return {
    notes,
    loading,
    error,
    refresh,
    updateNoteInState,
    removeNoteFromState,
    addNoteToState
  }
}
