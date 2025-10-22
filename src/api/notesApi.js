import { supabase } from '../lib/supabaseClient'
import { cacheHelpers } from '../lib/db'

const NOTES_PER_PAGE = 50

export const notesApi = {
  // Fetch notes with pagination and caching
  async fetchNotes({ archived = false, page = 0, pageSize = NOTES_PER_PAGE }) {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('User not authenticated')
      }

      // 1. Try to get cached data first (instant load)
      const cachedNotes = await cacheHelpers.getCachedNotes(user.id, archived)
      const isCacheStale = await cacheHelpers.isCacheStale(archived)

      // Return cached data immediately if available and fresh
      if (cachedNotes.length > 0 && !isCacheStale) {
        return {
          data: cachedNotes.slice(page * pageSize, (page + 1) * pageSize),
          total: cachedNotes.length,
          fromCache: true
        }
      }

      // 2. Fetch from Supabase (optimized query with pagination)
      const { data, error, count } = await supabase
        .from('notes')
        .select('*, projects(id, name, color)', { count: 'exact' })
        .eq('user_id', user.id)
        .eq('archived', archived)
        .order('updated_at', { ascending: false })
        .range(page * pageSize, (page + 1) * pageSize - 1)

      if (error) throw error

      // 3. Update cache in background
      if (page === 0 && data) {
        cacheHelpers.cacheNotes(data, archived).catch(console.error)
      } else if (data) {
        // Update individual notes in cache
        data.forEach(note => {
          cacheHelpers.updateCachedNote(note).catch(console.error)
        })
      }

      return {
        data: data || [],
        total: count || 0,
        fromCache: false
      }
    } catch (error) {
      console.error('Error fetching notes:', error)
      throw error
    }
  },

  // Fetch all notes (for initial cache population)
  async fetchAllNotes(archived = false) {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('User not authenticated')
      }

      const { data, error } = await supabase
        .from('notes')
        .select('*, projects(id, name, color)')
        .eq('user_id', user.id)
        .eq('archived', archived)
        .order('updated_at', { ascending: false })

      if (error) throw error

      // Cache all notes
      if (data) {
        await cacheHelpers.cacheNotes(data, archived)
      }

      return data || []
    } catch (error) {
      console.error('Error fetching all notes:', error)
      throw error
    }
  },

  // Create note with optimistic update
  async createNote(noteData) {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('User not authenticated')
      }

      const { data, error } = await supabase
        .from('notes')
        .insert({
          ...noteData,
          user_id: user.id
        })
        .select()
        .single()

      if (error) throw error

      // Update cache
      if (data) {
        await cacheHelpers.updateCachedNote(data)
      }

      return data
    } catch (error) {
      console.error('Error creating note:', error)
      throw error
    }
  },

  // Update note with optimistic update
  async updateNote(id, updates) {
    try {
      const { data, error } = await supabase
        .from('notes')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      // Update cache
      if (data) {
        await cacheHelpers.updateCachedNote(data)
      }

      return data
    } catch (error) {
      console.error('Error updating note:', error)
      throw error
    }
  },

  // Delete note
  async deleteNote(id) {
    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id)

      if (error) throw error

      // Remove from cache
      await cacheHelpers.deleteCachedNote(id)

      return { success: true }
    } catch (error) {
      console.error('Error deleting note:', error)
      throw error
    }
  },

  // Archive note
  async archiveNote(id) {
    try {
      const { data, error } = await supabase
        .from('notes')
        .update({ archived: true })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      // Update cache
      if (data) {
        await cacheHelpers.updateCachedNote(data)
      }

      return data
    } catch (error) {
      console.error('Error archiving note:', error)
      throw error
    }
  },

  // Restore note
  async restoreNote(id) {
    try {
      const { data, error } = await supabase
        .from('notes')
        .update({ archived: false })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      // Update cache
      if (data) {
        await cacheHelpers.updateCachedNote(data)
      }

      return data
    } catch (error) {
      console.error('Error restoring note:', error)
      throw error
    }
  },

  // Subscribe to realtime changes
  subscribeToNotes(userId, archived, callback) {
    const channel = supabase
      .channel(`notes-${archived ? 'archived' : 'active'}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notes',
          filter: `user_id=eq.${userId}`
        },
        async (payload) => {
          // Update cache based on event type
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            await cacheHelpers.updateCachedNote(payload.new)
          } else if (payload.eventType === 'DELETE') {
            await cacheHelpers.deleteCachedNote(payload.old.id)
          }

          // Notify callback
          callback(payload)
        }
      )
      .subscribe()

    return channel
  }
}

export default notesApi
