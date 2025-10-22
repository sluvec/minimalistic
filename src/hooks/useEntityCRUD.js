import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import { sanitizeFormData } from '../utils/sanitize'

/**
 * Custom hook for managing CRUD operations on Supabase entities
 * Eliminates duplicate code across Settings components
 *
 * @param {string} tableName - Name of the Supabase table
 * @param {object} options - Configuration options
 * @param {array} options.textFields - Fields to sanitize as text
 * @param {function} options.onSuccess - Callback after successful operation
 * @returns {object} CRUD operations and state
 */
export function useEntityCRUD(tableName, options = {}) {
  const { textFields = ['name', 'description'], onSuccess } = options

  const [entities, setEntities] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  /**
   * Fetch all entities for the current user
   */
  const fetchEntities = useCallback(
    async (selectQuery = '*', orderBy = 'created_at') => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) return

        const { data, error: fetchError } = await supabase
          .from(tableName)
          .select(selectQuery)
          .eq('user_id', user.id)
          .eq('archived', false)
          .order(orderBy, { ascending: false })

        if (fetchError) throw fetchError
        setEntities(data || [])
        setError(null)
      } catch (err) {
        console.error(`Error fetching ${tableName}:`, err)
        setError(`Failed to load ${tableName}`)
      }
    },
    [tableName]
  )

  /**
   * Create a new entity
   */
  const createEntity = useCallback(
    async (formData) => {
      setLoading(true)
      setError(null)
      setSuccess(null)

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')

        // Sanitize text fields to prevent XSS
        const sanitizedData = sanitizeFormData(formData, { htmlFields: [] })

        const { error: insertError } = await supabase
          .from(tableName)
          .insert([{ ...sanitizedData, user_id: user.id }])

        if (insertError) throw insertError

        const entityName = tableName.slice(0, -1) // Remove 's' from plural
        const capitalizedName = entityName.charAt(0).toUpperCase() + entityName.slice(1)
        setSuccess(`${capitalizedName} created successfully`)

        // Refetch to update list
        await fetchEntities()

        if (onSuccess) onSuccess()
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    },
    [tableName, fetchEntities, onSuccess]
  )

  /**
   * Update an existing entity
   */
  const updateEntity = useCallback(
    async (id, formData) => {
      setLoading(true)
      setError(null)
      setSuccess(null)

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')

        // Sanitize text fields to prevent XSS
        const sanitizedData = sanitizeFormData(formData, { htmlFields: [] })

        const { error: updateError } = await supabase
          .from(tableName)
          .update({ ...sanitizedData, updated_at: new Date().toISOString() })
          .eq('id', id)
          .eq('user_id', user.id)

        if (updateError) throw updateError

        const entityName = tableName.slice(0, -1) // Remove 's' from plural
        const capitalizedName = entityName.charAt(0).toUpperCase() + entityName.slice(1)
        setSuccess(`${capitalizedName} updated successfully`)

        // Refetch to update list
        await fetchEntities()

        if (onSuccess) onSuccess()
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    },
    [tableName, fetchEntities, onSuccess]
  )

  /**
   * Archive an entity (soft delete)
   */
  const archiveEntity = useCallback(
    async (id, confirmMessage) => {
      if (confirmMessage && !window.confirm(confirmMessage)) {
        return
      }

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')

        const { error: archiveError } = await supabase
          .from(tableName)
          .update({ archived: true })
          .eq('id', id)
          .eq('user_id', user.id)

        if (archiveError) throw archiveError

        const entityName = tableName.slice(0, -1) // Remove 's' from plural
        const capitalizedName = entityName.charAt(0).toUpperCase() + entityName.slice(1)
        setSuccess(`${capitalizedName} archived successfully`)

        // Refetch to update list
        await fetchEntities()

        if (onSuccess) onSuccess()
      } catch (err) {
        setError(err.message)
      }
    },
    [tableName, fetchEntities, onSuccess]
  )

  /**
   * Clear success/error messages
   */
  const clearMessages = useCallback(() => {
    setError(null)
    setSuccess(null)
  }, [])

  return {
    entities,
    loading,
    error,
    success,
    fetchEntities,
    createEntity,
    updateEntity,
    archiveEntity,
    clearMessages,
  }
}
