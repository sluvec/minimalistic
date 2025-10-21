import { useState, useCallback } from 'react'
import {
  useCreateNote,
  useUpdateNote,
  useDeleteNote,
  useArchiveNote,
  useRestoreNote
} from './useNotesQuery'

/**
 * Custom hook for CRUD operations on notes
 * Now powered by React Query with optimistic updates
 *
 * Performance improvements:
 * - Optimistic updates (UI updates before server confirms)
 * - Automatic rollback on error
 * - Automatic cache invalidation
 * - Background sync
 */
export function useNotesCRUD() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Get React Query mutations
  const createMutation = useCreateNote()
  const updateMutation = useUpdateNote()
  const deleteMutation = useDeleteNote()
  const archiveMutation = useArchiveNote()
  const restoreMutation = useRestoreNote()

  /**
   * Create a new note
   * Now with optimistic updates - UI updates instantly!
   */
  const createNote = useCallback(async (noteData) => {
    setLoading(true)
    setError(null)

    try {
      const data = await createMutation.mutateAsync(noteData)
      return { data, error: null }
    } catch (err) {
      console.error('Error creating note:', err)
      setError(err.message)
      return { data: null, error: err }
    } finally {
      setLoading(false)
    }
  }, [createMutation])

  /**
   * Update an existing note
   * Now with optimistic updates - UI updates instantly!
   */
  const updateNote = useCallback(async (noteId, updates) => {
    setLoading(true)
    setError(null)

    try {
      const data = await updateMutation.mutateAsync({ id: noteId, updates })
      return { data, error: null }
    } catch (err) {
      console.error('Error updating note:', err)
      setError(err.message)
      return { data: null, error: err }
    } finally {
      setLoading(false)
    }
  }, [updateMutation])

  /**
   * Delete a note permanently
   * Now with optimistic updates - UI updates instantly!
   */
  const deleteNote = useCallback(async (noteId) => {
    setLoading(true)
    setError(null)

    try {
      await deleteMutation.mutateAsync(noteId)
      return { error: null }
    } catch (err) {
      console.error('Error deleting note:', err)
      setError(err.message)
      return { error: err }
    } finally {
      setLoading(false)
    }
  }, [deleteMutation])

  /**
   * Archive a note (soft delete)
   * Now with optimistic updates - UI updates instantly!
   */
  const archiveNote = useCallback(async (noteId) => {
    setLoading(true)
    setError(null)

    try {
      const data = await archiveMutation.mutateAsync(noteId)
      return { data, error: null }
    } catch (err) {
      console.error('Error archiving note:', err)
      setError(err.message)
      return { data: null, error: err }
    } finally {
      setLoading(false)
    }
  }, [archiveMutation])

  /**
   * Restore an archived note
   * Now with optimistic updates - UI updates instantly!
   */
  const restoreNote = useCallback(async (noteId) => {
    setLoading(true)
    setError(null)

    try {
      const data = await restoreMutation.mutateAsync(noteId)
      return { data, error: null }
    } catch (err) {
      console.error('Error restoring note:', err)
      setError(err.message)
      return { data: null, error: err }
    } finally {
      setLoading(false)
    }
  }, [restoreMutation])

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
