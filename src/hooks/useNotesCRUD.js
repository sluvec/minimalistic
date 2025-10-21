import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'

/**
 * Custom hook for CRUD operations on notes
 * Handles create, update, delete, archive, and restore operations
 */
export function useNotesCRUD() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  /**
   * Create a new note
   */
  const createNote = useCallback(async (noteData) => {
    setLoading(true)
    setError(null)

    try {
      const user = await supabase.auth.getUser()
      if (!user.data.user) {
        throw new Error('You must be logged in to create a note')
      }

      const { data, error } = await supabase
        .from('notes')
        .insert({
          ...noteData,
          user_id: user.data.user.id
        })
        .select()
        .single()

      if (error) throw error

      return { data, error: null }
    } catch (err) {
      console.error('Error creating note:', err)
      setError(err.message)
      return { data: null, error: err }
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Update an existing note
   */
  const updateNote = useCallback(async (noteId, updates) => {
    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase
        .from('notes')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', noteId)
        .select()
        .single()

      if (error) throw error

      return { data, error: null }
    } catch (err) {
      console.error('Error updating note:', err)
      setError(err.message)
      return { data: null, error: err }
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Delete a note permanently
   */
  const deleteNote = useCallback(async (noteId) => {
    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', noteId)

      if (error) throw error

      return { error: null }
    } catch (err) {
      console.error('Error deleting note:', err)
      setError(err.message)
      return { error: err }
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Archive a note (soft delete)
   */
  const archiveNote = useCallback(async (noteId) => {
    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase
        .from('notes')
        .update({ archived: true })
        .eq('id', noteId)
        .select()
        .single()

      if (error) throw error

      return { data, error: null }
    } catch (err) {
      console.error('Error archiving note:', err)
      setError(err.message)
      return { data: null, error: err }
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Restore an archived note
   */
  const restoreNote = useCallback(async (noteId) => {
    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase
        .from('notes')
        .update({ archived: false })
        .eq('id', noteId)
        .select()
        .single()

      if (error) throw error

      return { data, error: null }
    } catch (err) {
      console.error('Error restoring note:', err)
      setError(err.message)
      return { data: null, error: err }
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    loading,
    error,
    createNote,
    updateNote,
    deleteNote,
    archiveNote,
    restoreNote
  }
}
