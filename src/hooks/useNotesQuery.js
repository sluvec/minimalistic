import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { notesApi } from '../api/notesApi'
import toast from 'react-hot-toast'
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '../constants'

// Hook for fetching notes with React Query
export function useNotesQuery(archived = false) {
  const queryClient = useQueryClient()
  const [userId, setUserId] = useState(null)

  // Get user ID
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id || null)
    })
  }, [])

  // Fetch notes query
  const {
    data,
    isLoading,
    error,
    refetch,
    isFetching
  } = useQuery({
    queryKey: ['notes', archived],
    queryFn: () => notesApi.fetchAllNotes(archived),
    enabled: !!userId, // Only run when user is authenticated
    staleTime: 30000, // 30 seconds
    cacheTime: 300000, // 5 minutes
  })

  // Subscribe to realtime updates
  useEffect(() => {
    if (!userId) return

    const channel = notesApi.subscribeToNotes(userId, archived, (payload) => {
      // Invalidate and refetch on any change
      queryClient.invalidateQueries(['notes', archived])
    })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, archived, queryClient])

  return {
    notes: data || [],
    loading: isLoading,
    error: error?.message || null,
    refresh: refetch,
    isFetching
  }
}

// Hook for creating notes
export function useCreateNote() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: notesApi.createNote,
    onMutate: async (newNote) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries(['notes', false])

      // Snapshot previous value
      const previousNotes = queryClient.getQueryData(['notes', false])

      // Optimistically update cache
      queryClient.setQueryData(['notes', false], (old) => {
        return [{ ...newNote, id: `temp-${Date.now()}`, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }, ...(old || [])]
      })

      return { previousNotes }
    },
    onError: (err, newNote, context) => {
      // Rollback on error
      queryClient.setQueryData(['notes', false], context.previousNotes)
      toast.error(ERROR_MESSAGES.NOTE_CREATE_FAILED)
    },
    onSuccess: () => {
      toast.success(SUCCESS_MESSAGES.NOTE_CREATED)
    },
    onSettled: () => {
      // Refetch to sync with server
      queryClient.invalidateQueries(['notes', false])
    },
  })
}

// Hook for updating notes
export function useUpdateNote() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, updates }) => notesApi.updateNote(id, updates),
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries(['notes'])

      const previousNotes = queryClient.getQueryData(['notes', false])

      queryClient.setQueryData(['notes', false], (old) => {
        return old?.map(note =>
          note.id === id ? { ...note, ...updates, updated_at: new Date().toISOString() } : note
        )
      })

      return { previousNotes }
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(['notes', false], context.previousNotes)
      toast.error(ERROR_MESSAGES.NOTE_UPDATE_FAILED)
    },
    onSuccess: () => {
      toast.success(SUCCESS_MESSAGES.NOTE_UPDATED)
    },
    onSettled: () => {
      queryClient.invalidateQueries(['notes'])
    },
  })
}

// Hook for deleting notes
export function useDeleteNote() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: notesApi.deleteNote,
    onMutate: async (id) => {
      await queryClient.cancelQueries(['notes'])

      const previousNotes = queryClient.getQueryData(['notes', false])
      const previousArchivedNotes = queryClient.getQueryData(['notes', true])

      queryClient.setQueryData(['notes', false], (old) =>
        old?.filter(note => note.id !== id)
      )
      queryClient.setQueryData(['notes', true], (old) =>
        old?.filter(note => note.id !== id)
      )

      return { previousNotes, previousArchivedNotes }
    },
    onError: (err, id, context) => {
      queryClient.setQueryData(['notes', false], context.previousNotes)
      queryClient.setQueryData(['notes', true], context.previousArchivedNotes)
      toast.error(ERROR_MESSAGES.NOTE_DELETE_FAILED)
    },
    onSuccess: () => {
      toast.success(SUCCESS_MESSAGES.NOTE_DELETED)
    },
    onSettled: () => {
      queryClient.invalidateQueries(['notes'])
    },
  })
}

// Hook for archiving notes
export function useArchiveNote() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: notesApi.archiveNote,
    onMutate: async (id) => {
      await queryClient.cancelQueries(['notes'])

      const previousNotes = queryClient.getQueryData(['notes', false])

      queryClient.setQueryData(['notes', false], (old) =>
        old?.filter(note => note.id !== id)
      )

      return { previousNotes }
    },
    onError: (err, id, context) => {
      queryClient.setQueryData(['notes', false], context.previousNotes)
      toast.error(ERROR_MESSAGES.NOTE_ARCHIVE_FAILED)
    },
    onSuccess: () => {
      toast.success(SUCCESS_MESSAGES.NOTE_ARCHIVED)
    },
    onSettled: () => {
      queryClient.invalidateQueries(['notes'])
    },
  })
}

// Hook for restoring notes
export function useRestoreNote() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: notesApi.restoreNote,
    onMutate: async (id) => {
      await queryClient.cancelQueries(['notes'])

      const previousArchivedNotes = queryClient.getQueryData(['notes', true])

      queryClient.setQueryData(['notes', true], (old) =>
        old?.filter(note => note.id !== id)
      )

      return { previousArchivedNotes }
    },
    onError: (err, id, context) => {
      queryClient.setQueryData(['notes', true], context.previousArchivedNotes)
      toast.error(ERROR_MESSAGES.NOTE_RESTORE_FAILED)
    },
    onSuccess: () => {
      toast.success(SUCCESS_MESSAGES.NOTE_RESTORED)
    },
    onSettled: () => {
      queryClient.invalidateQueries(['notes'])
    },
  })
}

// Infinite scroll hook for pagination
export function useInfiniteNotes(archived = false) {
  const [userId, setUserId] = useState(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id || null)
    })
  }, [])

  return useInfiniteQuery({
    queryKey: ['notes-infinite', archived],
    queryFn: ({ pageParam = 0 }) => notesApi.fetchNotes({ archived, page: pageParam }),
    getNextPageParam: (lastPage, pages) => {
      const totalFetched = pages.reduce((sum, page) => sum + page.data.length, 0)
      return totalFetched < lastPage.total ? pages.length : undefined
    },
    enabled: !!userId,
  })
}
