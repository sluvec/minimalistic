import { useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useNotesQuery } from './useNotesQuery'

/**
 * Custom hook for fetching and managing notes data
 * Now powered by React Query + IndexedDB for blazing fast performance
 *
 * Performance improvements:
 * - Instant navigation with cached data
 * - Background sync
 * - Automatic refetching on window focus
 * - Offline support via IndexedDB
 * - Optimistic updates
 */
export function useNotesData(archived = false) {
  const queryClient = useQueryClient()

  // Use React Query hook (with caching and background sync)
  const { notes, loading, error, refresh, isFetching } = useNotesQuery(archived)

  // Update local state after mutations (optimistic updates)
  // Now using React Query cache instead of local state
  const updateNoteInState = useCallback((noteId, updates) => {
    queryClient.setQueryData(['notes', archived], (oldData) => {
      if (!oldData) return oldData
      return oldData.map(note =>
        note.id === noteId ? { ...note, ...updates } : note
      )
    })
  }, [queryClient, archived])

  const removeNoteFromState = useCallback((noteId) => {
    queryClient.setQueryData(['notes', archived], (oldData) => {
      if (!oldData) return oldData
      return oldData.filter(note => note.id !== noteId)
    })
  }, [queryClient, archived])

  const addNoteToState = useCallback((newNote) => {
    queryClient.setQueryData(['notes', archived], (oldData) => {
      if (!oldData) return [newNote]
      return [newNote, ...oldData]
    })
  }, [queryClient, archived])

  return {
    notes,
    loading,
    error,
    refresh,
    updateNoteInState,
    removeNoteFromState,
    addNoteToState,
    isFetching // New: shows when background fetching is happening
  }
}
