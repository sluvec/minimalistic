import Dexie from 'dexie'

// Initialize IndexedDB for local-first caching
export const db = new Dexie('MinimalisticNotesDB')

db.version(1).stores({
  notes: 'id, user_id, updated_at, archived, due_date, category, status, *tags',
  syncMetadata: 'key'
})

// Helper functions for cache management
export const cacheHelpers = {
  // Save notes to IndexedDB
  async cacheNotes(notes, archived = false) {
    try {
      await db.notes.bulkPut(notes)
      await db.syncMetadata.put({
        key: `last_sync_${archived ? 'archived' : 'active'}`,
        timestamp: Date.now()
      })
      return true
    } catch (error) {
      console.error('Failed to cache notes:', error)
      return false
    }
  },

  // Get cached notes
  async getCachedNotes(userId, archived = false) {
    try {
      const notes = await db.notes
        .where({ user_id: userId, archived })
        .sortBy('updated_at')

      return notes.reverse() // Most recent first
    } catch (error) {
      console.error('Failed to get cached notes:', error)
      return []
    }
  },

  // Get last sync timestamp
  async getLastSync(archived = false) {
    try {
      const metadata = await db.syncMetadata.get(
        `last_sync_${archived ? 'archived' : 'active'}`
      )
      return metadata?.timestamp || 0
    } catch (error) {
      console.error('Failed to get last sync:', error)
      return 0
    }
  },

  // Clear all cached data
  async clearCache() {
    try {
      await db.notes.clear()
      await db.syncMetadata.clear()
      return true
    } catch (error) {
      console.error('Failed to clear cache:', error)
      return false
    }
  },

  // Add or update a single note in cache
  async updateCachedNote(note) {
    try {
      await db.notes.put(note)
      return true
    } catch (error) {
      console.error('Failed to update cached note:', error)
      return false
    }
  },

  // Delete a note from cache
  async deleteCachedNote(noteId) {
    try {
      await db.notes.delete(noteId)
      return true
    } catch (error) {
      console.error('Failed to delete cached note:', error)
      return false
    }
  },

  // Check if cache is stale (older than 5 minutes)
  async isCacheStale(archived = false) {
    const lastSync = await this.getLastSync(archived)
    const fiveMinutes = 5 * 60 * 1000
    return Date.now() - lastSync > fiveMinutes
  }
}

export default db
