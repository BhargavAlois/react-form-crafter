import React from 'react'

export default function SelectInput(props) {
  const {
    schema,
    uiSchema,
    formData,
    errors,
    title,
    field,
    uiFieldSchema,
    fieldClass,
    layoutClass,
    handleChange,
    fieldName,
    isRequired,
    showLabel,
    fieldRefs
  } = props

  const { oneOf, enum: enumValues, enumNames } = field

  const renderEnumOptions = (enumValues) => {
    return enumValues.map((value, index) => (
      <option key={index} value={value}>
        {value}
      </option>
    ))
  }

  const renderEnumNamesOption = (enumValues, enumNames) => {
    return enumValues.map((value, index) => (
      <option key={index} value={value}>
        {enumNames[index] || value}
      </option>
    ))
  }

  const renderOneOfOptions = (oneOfOptions) => {
    return oneOfOptions.map((option, index) => {
      const value = typeof option === 'object' ? option.const : option
      const label = typeof option === 'object' ? option.title || value : value

      return (
        <option key={index} value={value}>
          {label}
        </option>
      )
    })
  }

  return (
    <div key={fieldName} className={`${layoutClass}`}>
      {(title || fieldName) && (showLabel) && <label className="form-label">
        {title || fieldName}
        {isRequired && <span>*</span>}
      </label>}
      <select
        name={fieldName}
        ref={(element) => (fieldRefs.current[fieldName] = element)}
        className={`form-select ${errors[fieldName] ? 'is-invalid' : ''}`}
        value={formData[fieldName] || ''}
        onChange={(e) => handleChange(fieldName, e.target.value)}
        placeholder={uiFieldSchema?.['ui:placeholder']}
      >
        <option value="">{uiFieldSchema?.['ui:placeholder'] || "Select an option"}</option>
        {(enumNames && enumValues && renderEnumNamesOption(enumValues, enumNames)) ||
          (enumValues && renderEnumOptions(enumValues)) ||
          (field?.items?.enum && renderEnumOptions(field?.items?.enum)) ||
          (oneOf && renderOneOfOptions(oneOf))}
      </select>
      {errors[fieldName] &&
        errors[fieldName].map((error, index) => (
          <p key={index} className="invalid-feedback m-0">
            {error}
          </p>
        ))}
    </div>
  )
}
