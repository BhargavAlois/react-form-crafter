import React from 'react'

export default function TextArea(props) {
  const {
    schema,
    uiSchema,
    formData,
    errors,
    title,
    layoutClass,
    fieldClass,
    handleChange,
    fieldName,
    isRequired,
    showLabel,
    fieldRefs
  } = props
  const rows = uiSchema?.['ui:options']?.rows
  const cols = uiSchema?.['ui:options']?.cols

  return (
    <div key={fieldName} className={`${layoutClass}`}>
      {(title || fieldName) && (showLabel) && <label className="form-label">
        {title || fieldName}
        {isRequired && <span>*</span>}
      </label>}
      <textarea
        className={`${fieldClass} ${errors[fieldName] ? 'is-invalid' : ''}`}
        ref={(element) => (fieldRefs.current[fieldName] = element)}
        name={fieldName}
        value={formData[fieldName] || ''}
        onChange={(e) => handleChange(fieldName, e.target.value)}
        rows={rows}
        cols={cols}
        placeholder={uiSchema['ui:placeholder']}
      />
      {errors[fieldName] &&
        errors[fieldName].map((error, index) => (
          <p key={index} className="invalid-feedback m-0">
            {error}
          </p>
        ))}
    </div>
  )
}
