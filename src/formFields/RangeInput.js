import React from 'react'

export default function RangeInput(props) {
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
  const min = schema.minimum || 0
  const max = schema.maximum || 100
  const oneOf = schema.oneOf

  const defaultValue = schema.default !== undefined && schema.default !== null ? schema.default : min
  const rangeValue = formData[fieldName] || defaultValue

  return (
    <div key={fieldName} className={`${layoutClass}`}>
      {(title || fieldName) && (showLabel) && <label className="form-label">
        {title || fieldName}
        {isRequired && <span>*</span>}
      </label>}
      <input
        type="range"
        ref={(element) => (fieldRefs.current[fieldName] = element)}
        name={fieldName}
        className={`${fieldClass} form-range ${errors[fieldName] ? 'is-invalid' : ''}`}
        value={rangeValue}
        onChange={(e) => handleChange(fieldName, e.target.value)}
        min={min}
        max={max}
        step="1"
        placeholder={uiSchema['ui:placeholder']}
      />
      <div className="range-value">
        <span>{rangeValue}</span>
      </div>
      {errors[fieldName] && (
        <div className="invalid-feedback">
          {errors[fieldName].map((error, index) => (
            <p key={index} className="m-0">
              {error}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}
