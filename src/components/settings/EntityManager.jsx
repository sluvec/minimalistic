import { useState, useEffect, memo } from 'react'
import PropTypes from 'prop-types'
import { useEntityCRUD } from '../../hooks/useEntityCRUD'
import './EntityManager.css'

/**
 * Reusable component for managing entities (Spaces, Categories, Tags)
 * Demonstrates:
 * - Custom hook usage (useEntityCRUD)
 * - Component reusability
 * - PropTypes validation
 * - Performance optimization with React.memo
 * - Input sanitization (handled by useEntityCRUD hook)
 */
const EntityManager = memo(function EntityManager({
  tableName,
  entityDisplayName,
  fields,
  selectQuery,
  onRefresh,
}) {
  const { entities, loading, error, success, fetchEntities, createEntity, updateEntity, archiveEntity, clearMessages } = useEntityCRUD(tableName, {
    onSuccess: onRefresh,
  })

  const [showForm, setShowForm] = useState(false)
  const [editingEntity, setEditingEntity] = useState(null)
  const [formData, setFormData] = useState({})

  // Initialize form data with default values from fields config
  useEffect(() => {
    const defaultValues = {}
    fields.forEach((field) => {
      defaultValues[field.name] = field.defaultValue || ''
    })
    setFormData(defaultValues)
  }, [fields])

  // Fetch entities on mount
  useEffect(() => {
    fetchEntities(selectQuery)
  }, [fetchEntities, selectQuery])

  const handleSubmit = async (e) => {
    e.preventDefault()
    clearMessages()

    if (editingEntity) {
      await updateEntity(editingEntity.id, formData)
    } else {
      await createEntity(formData)
    }

    // Reset form on success
    if (!error) {
      handleCancel()
    }
  }

  const handleEdit = (entity) => {
    setEditingEntity(entity)
    const editFormData = {}
    fields.forEach((field) => {
      editFormData[field.name] = entity[field.name] || field.defaultValue || ''
    })
    setFormData(editFormData)
    setShowForm(true)
  }

  const handleCancel = () => {
    setEditingEntity(null)
    setShowForm(false)
    const defaultValues = {}
    fields.forEach((field) => {
      defaultValues[field.name] = field.defaultValue || ''
    })
    setFormData(defaultValues)
    clearMessages()
  }

  const handleArchive = async (id) => {
    await archiveEntity(
      id,
      `Are you sure you want to archive this ${entityDisplayName.toLowerCase()}?`
    )
  }

  const handleInputChange = (fieldName, value) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }))
  }

  return (
    <div className="entity-manager">
      <div className="entity-header">
        <h3>{entityDisplayName} Management</h3>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="btn-primary">
            Add {entityDisplayName}
          </button>
        )}
      </div>

      {/* Messages */}
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="entity-form">
          <h4>{editingEntity ? `Edit ${entityDisplayName}` : `Add ${entityDisplayName}`}</h4>

          {fields.map((field) => (
            <div key={field.name} className="form-group">
              <label htmlFor={field.name}>
                {field.label}
                {field.required && <span className="required">*</span>}
              </label>

              {field.type === 'text' || field.type === 'textarea' ? (
                field.type === 'textarea' ? (
                  <textarea
                    id={field.name}
                    value={formData[field.name] || ''}
                    onChange={(e) => handleInputChange(field.name, e.target.value)}
                    placeholder={field.placeholder}
                    required={field.required}
                    rows={3}
                  />
                ) : (
                  <input
                    type="text"
                    id={field.name}
                    value={formData[field.name] || ''}
                    onChange={(e) => handleInputChange(field.name, e.target.value)}
                    placeholder={field.placeholder}
                    required={field.required}
                  />
                )
              ) : field.type === 'color' ? (
                <div className="color-picker-group">
                  <input
                    type="color"
                    id={field.name}
                    value={formData[field.name] || field.defaultValue}
                    onChange={(e) => handleInputChange(field.name, e.target.value)}
                  />
                  <span className="color-value">{formData[field.name] || field.defaultValue}</span>
                </div>
              ) : field.type === 'select' ? (
                <select
                  id={field.name}
                  value={formData[field.name] || ''}
                  onChange={(e) => handleInputChange(field.name, e.target.value)}
                  required={field.required}
                >
                  <option value="">Select {field.label}</option>
                  {field.options &&
                    field.options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                </select>
              ) : null}

              {field.helpText && <small className="help-text">{field.helpText}</small>}
            </div>
          ))}

          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Saving...' : editingEntity ? 'Update' : 'Create'}
            </button>
            <button type="button" onClick={handleCancel} className="btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Entity List */}
      <div className="entity-list">
        {loading && <p>Loading {entityDisplayName.toLowerCase()}s...</p>}
        {!loading && entities.length === 0 && (
          <p className="empty-state">
            No {entityDisplayName.toLowerCase()}s yet. Create one to get started!
          </p>
        )}
        {!loading && entities.length > 0 && (
          <div className="entity-grid">
            {entities.map((entity) => (
              <div key={entity.id} className="entity-card">
                <div className="entity-card-header">
                  <div className="entity-name-group">
                    {entity.color && (
                      <span className="color-indicator" style={{ backgroundColor: entity.color }} />
                    )}
                    {entity.icon && <span className="entity-icon">{entity.icon}</span>}
                    <h4>{entity.name}</h4>
                  </div>
                  <div className="entity-actions">
                    <button
                      onClick={() => handleEdit(entity)}
                      className="btn-icon"
                      title={`Edit ${entityDisplayName.toLowerCase()}`}
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleArchive(entity.id)}
                      className="btn-icon btn-danger"
                      title={`Archive ${entityDisplayName.toLowerCase()}`}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                {entity.description && <p className="entity-description">{entity.description}</p>}
                {entity.spaces && <p className="entity-meta">Space: {entity.spaces.name}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
})

EntityManager.propTypes = {
  tableName: PropTypes.string.isRequired,
  entityDisplayName: PropTypes.string.isRequired,
  fields: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      type: PropTypes.oneOf(['text', 'textarea', 'color', 'select']).isRequired,
      required: PropTypes.bool,
      placeholder: PropTypes.string,
      defaultValue: PropTypes.any,
      helpText: PropTypes.string,
      options: PropTypes.arrayOf(
        PropTypes.shape({
          value: PropTypes.any.isRequired,
          label: PropTypes.string.isRequired,
        })
      ),
    })
  ).isRequired,
  selectQuery: PropTypes.string,
  onRefresh: PropTypes.func,
}

EntityManager.defaultProps = {
  selectQuery: '*',
  onRefresh: null,
}

export default EntityManager
