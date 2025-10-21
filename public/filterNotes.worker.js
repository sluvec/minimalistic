// Web Worker for heavy filtering and sorting operations
// Runs in background thread to avoid blocking UI

self.onmessage = function(e) {
  const { notes, filters, searchTerm, sorting } = e.data

  try {
    let filtered = [...notes]

    // Apply search filter
    if (searchTerm && searchTerm.trim() !== '') {
      const search = searchTerm.toLowerCase()
      filtered = filtered.filter(note => {
        const titleMatch = note.title?.toLowerCase().includes(search)
        const contentMatch = note.content?.toLowerCase().includes(search)
        const urlMatch = note.url?.toLowerCase().includes(search)
        return titleMatch || contentMatch || urlMatch
      })
    }

    // Apply tag filters
    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter(note =>
        note.tags?.some(tag => filters.tags.includes(tag))
      )
    }

    // Apply category filters
    if (filters.categories && filters.categories.length > 0) {
      filtered = filtered.filter(note =>
        filters.categories.includes(note.category)
      )
    }

    // Apply type filters
    if (filters.types && filters.types.length > 0) {
      filtered = filtered.filter(note =>
        filters.types.includes(note.type)
      )
    }

    // Apply priority filters
    if (filters.priorities && filters.priorities.length > 0) {
      filtered = filtered.filter(note =>
        filters.priorities.includes(note.priority)
      )
    }

    // Apply importance filters
    if (filters.importances && filters.importances.length > 0) {
      filtered = filtered.filter(note =>
        filters.importances.includes(note.importance)
      )
    }

    // Apply status filters
    if (filters.statuses && filters.statuses.length > 0) {
      filtered = filtered.filter(note =>
        filters.statuses.includes(note.status)
      )
    }

    // Apply task filter
    if (filters.isTask) {
      filtered = filtered.filter(note => note.isTask === true)
    }

    // Apply list filter
    if (filters.isList) {
      filtered = filtered.filter(note => note.isList === true)
    }

    // Apply idea filter
    if (filters.isIdea) {
      filtered = filtered.filter(note => note.isIdea === true)
    }

    // Apply date filter
    if (filters.date) {
      const filterDate = new Date(filters.date).toISOString().split('T')[0]
      filtered = filtered.filter(note => {
        if (!note.due_date) return false
        const noteDate = new Date(note.due_date).toISOString().split('T')[0]
        return noteDate === filterDate
      })
    }

    // Apply due date filter
    if (filters.showWithDueDate === 'with') {
      filtered = filtered.filter(note => note.due_date !== null && note.due_date !== '')
    } else if (filters.showWithDueDate === 'without') {
      filtered = filtered.filter(note => note.due_date === null || note.due_date === '')
    }

    // Apply URL filter
    if (filters.showWithUrl === 'with') {
      filtered = filtered.filter(note => note.url !== null && note.url !== '')
    } else if (filters.showWithUrl === 'without') {
      filtered = filtered.filter(note => note.url === null || note.url === '')
    }

    // Apply sorting
    if (sorting && sorting.field) {
      filtered.sort((a, b) => {
        let aVal = a[sorting.field]
        let bVal = b[sorting.field]

        // Handle null/undefined values
        if (aVal === null || aVal === undefined) return 1
        if (bVal === null || bVal === undefined) return -1

        // String comparison
        if (typeof aVal === 'string') {
          aVal = aVal.toLowerCase()
          bVal = bVal.toLowerCase()
        }

        // Date comparison
        if (sorting.field === 'updated_at' || sorting.field === 'created_at' || sorting.field === 'due_date') {
          aVal = new Date(aVal).getTime()
          bVal = new Date(bVal).getTime()
        }

        if (aVal < bVal) return sorting.direction === 'asc' ? -1 : 1
        if (aVal > bVal) return sorting.direction === 'asc' ? 1 : -1
        return 0
      })
    }

    // Send filtered results back
    self.postMessage({
      success: true,
      filtered,
      count: filtered.length
    })

  } catch (error) {
    // Send error back
    self.postMessage({
      success: false,
      error: error.message
    })
  }
}
