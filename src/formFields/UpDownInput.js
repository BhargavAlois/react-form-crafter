import React from 'react'

export default function UpDownInput(props) {
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
  return (
    <div key={fieldName} className={`${layoutClass} `}>
      {(title || fieldName) && (showLabel) && <label className="form-label">
        {title || fieldName}
        {isRequired && <span>*</span>}
      </label>}
      <input
        type="number"
        ref={(element) => (fieldRefs.current[fieldName] = element)}
        className={`${fieldClass} ${errors[fieldName] ? 'is-invalid' : ''}`}
        name={fieldName}
        value={formData[fieldName] || ''}
        onChange={(e) => handleChange(fieldName, e.target.value)}
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
