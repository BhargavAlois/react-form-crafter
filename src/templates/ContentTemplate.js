import React from 'react'
import * as formFields from '../formFields/InputFieldsExports'

export default function ContentTemplate({
  formData,
  schema,
  uiSchema = {},
  widgets,
  fields,
  errors,
  onChange: handleChange,
  onSuccess,
  onError,
  onSubmit,
  requiredFields = [],
  fieldRefs,
}) {
  const getDeepValue = (obj, path) => {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj)
  }

  const normalizeFieldName = (fieldName) => {
    const parts = fieldName.split('.')
    return parts[parts.length - 1] // Return the last part of the path
  }

  const showSchemaInvalidError = (fieldName) => {
    return (<p className="text-danger mt-2 mb-2"> Unsupported field schema for field {fieldName} </p>)
  }

  const getFieldSchemaByName = (schema, fieldName) => {
    // Recursive function to find the field by its name
    const findField = (currentSchema, currentFieldName) => {
      // If the current schema is an object with properties, check each property
      if (currentSchema.type === 'object' && currentSchema.properties) {
        // Iterate through all properties to find the one that matches currentFieldName
        for (const [key, value] of Object.entries(currentSchema.properties)) {
          // If the key matches the field name, return the field
          if (key === currentFieldName) {
            return value
          }

          // If the field is an object, recurse into it
          if (value.type === 'object') {
            const result = findField(value, currentFieldName)
            if (result) return result // Return the field if found in nested object
          }
        }
      }
      // If the field is not found, return null
      return null
    }

    return findField(schema, fieldName)
  }

  const renderField = (field, fieldName, parentSchema = schema, fieldPath) => {
    const { title, enum: enumValues, oneOf, format, type } = field
    fieldPath = fieldPath ? `${fieldPath}.${fieldName}` : fieldName
    const uiFieldSchema = getDeepValue(uiSchema, fieldPath) || {}
    const uiOptions = uiFieldSchema?.['ui:options']
    const divClassName = uiFieldSchema?.['className']
    const divClass = divClassName ? `${divClassName}` : ''
    const layoutClass = divClass ? `form-group ${divClass}` : 'form-group'
    const widget = uiFieldSchema['ui:widget'] || format || type || 'string'
    const optionsClassName = uiOptions?.className
    const fieldClass = `form-control ${optionsClassName ? optionsClassName : ''}`
    const normalizedFieldName = normalizeFieldName(fieldName)
    const isRequired = requiredFields.includes(fieldName)
    const showLabel = uiOptions?.label !== undefined ? uiOptions?.label : true
    const titleClass = uiFieldSchema['titleClass'] ? `${uiFieldSchema['titleClass']} mt-2` : 'mt-2'

    // Implementation of handleDefaultFieldChange where only target value is accepted as parameter (for custom widgets and fields only)
    const handleDefaultFieldChange = (value) => {
      handleChange(fieldPath, value)
    }

    if (field.type === 'object' && field.properties) {
      return (
        <div>
          {title && (
            <legend id={`root_${normalizedFieldName}__title`} className={titleClass}>
              {title}
              {isRequired && <span>*</span>}
            </legend>
          )}
          {field.description && <p style={{ size: '5px' }}>{field?.description}</p>}
          <div
            id={`root_${normalizedFieldName}`}
            key={normalizedFieldName}
            className={`${divClass}`}
          >
            {Object.keys(field.properties).map((nestedFieldName) => {
              const nestedField = field.properties[nestedFieldName]
              const updatedParentSchema = parentSchema.properties[nestedFieldName]
              return renderField(nestedField, `${nestedFieldName}`, updatedParentSchema, fieldPath)
            })}
          </div>
        </div>
      )
    } else if (uiFieldSchema['ui:field']) {
      const Component =
        typeof uiFieldSchema['ui:field'] === 'function'
          ? uiFieldSchema['ui:field']
          : fields
            ? fields[uiFieldSchema['ui:field']]
            : null

      if (Component) {
        return (
          <div className={`${layoutClass}`}>
            <Component
              key={fieldName}
              uiSchema={uiFieldSchema}
              onChange={handleDefaultFieldChange}
              value={formData[fieldPath]}
              onSubmit={onSubmit}
              options={uiOptions}
            />
          </div>
        )
      }
    }

    const inputFields = {
      string: formFields.TextInput,
      text: formFields.TextInput,
      TextWidget: formFields.TextInput,
      'alt-date': formFields.AltDateInput,
      password: formFields.PasswordInput,
      email: formFields.EmailInput,
      file: formFields.FileInput,
      button: formFields.ButtonInput,
      calendar: formFields.CalendarInput,
      checkboxes: formFields.CheckboxInput,
      date: formFields.DateInput,
      daterange: formFields.DateRangeInput,
      datetime: formFields.DateTimeInput,
      day: formFields.DayInput,
      month: formFields.MonthInput,
      progress: formFields.ProgressInput,
      radio: formFields.RadioInput,
      range: formFields.RangeInput,
      select: formFields.SelectInput,
      time: formFields.TimeInput,
      UpDownWidget: formFields.UpDownInput,
      updown: formFields.UpDownInput,
      year: formFields.YearInput,
      number: formFields.UpDownInput,
      numberEnum: formFields.RadioInput,
      textarea: formFields.TextArea,
      hidden: formFields.HiddenField,
    }

    const Component = inputFields[widget]
    if (Component) {
      return (
        <Component
          key={fieldName}
          schema={schema}
          uiSchema={uiSchema}
          formData={formData}
          field={field}
          uiFieldSchema={uiFieldSchema}
          errors={errors}
          handleChange={handleChange}
          fieldName={fieldPath}
          fieldClass={fieldClass}
          title={title}
          layoutClass={layoutClass}
          isRequired={isRequired}
          showLabel={showLabel}
          onSubmit={onSubmit}
          fieldRefs={fieldRefs}
        />
      )
    } else {
      const CustomWidget = typeof widget === 'function' ? widget : widgets ? widgets[widget] : null
      if (CustomWidget) {
        return (
          <div key={fieldName} className={`${layoutClass}`}>
            {showLabel && field?.title && (
              <label className="form-label">
                {title}
                {isRequired && <span>*</span>}
              </label>
            )}
            <CustomWidget
              schema={field}
              uiSchema={uiFieldSchema}
              fieldName={fieldPath}
              value={formData[fieldPath]}
              onChange={handleDefaultFieldChange}
              errors={errors[fieldPath]}
              onSubmit={onSubmit}
              placeholder={uiFieldSchema?.['ui:placeholder']}
              options={uiOptions}
            />
            {errors[fieldPath] &&
              errors[fieldPath].map((error, index) => (
                <p
                  key={index}
                  className="text-danger"
                  style={{ fontSize: '0.875rem', marginTop: 0 }}
                >
                  {error}
                </p>
              ))}
          </div>
        )
      } else {
        return showSchemaInvalidError(fieldName);
      }
    }
  }

  const renderSections = () => {
    const layout = uiSchema.layout || []

    if (!layout || layout.length === 0) {
      // Fallback to normal rendering when layout is not provided
      return Object.keys(schema.properties || {}).map((fieldName, index) => {
        const field = getFieldSchemaByName(schema, fieldName)
        return field ? renderField(field, fieldName) : showSchemaInvalidError(fieldName);
      })
    }

    return layout.map((section, index) => {
      const { title, classNames, fields } = section
      return (
        <div key={index} className="w-100 mb-2">
          {title && <h5 className="mb-2">{title}</h5>}
          <div className={`${classNames}`}>
            {fields.map((fieldPathOrSection, fieldIndex) => {
              if (typeof fieldPathOrSection === 'string') {
                const fieldName = fieldPathOrSection.split('.').pop()
                const field = getFieldSchemaByName(schema, fieldName)
                if (field) {
                  return renderField(field, fieldPathOrSection)
                }
              } else if (
                typeof fieldPathOrSection === 'object' &&
                fieldPathOrSection.type === 'section'
              ) {
                return (
                  <div key={fieldIndex} className={`${fieldPathOrSection.classNames}`}>
                    {fieldPathOrSection.title && <h6>{fieldPathOrSection.title}</h6>}
                    {fieldPathOrSection.fields.map((nestedField) => {
                      const nestedFieldName = nestedField.split('.').pop()
                      const nestedFieldSchema = getFieldSchemaByName(schema, nestedFieldName)
                      return nestedFieldSchema ? renderField(nestedFieldSchema, nestedField) : null
                    })}
                  </div>
                )
              }
              return showSchemaInvalidError(fieldName);
            })}
          </div>
        </div>
      )
    })
  }

  return <div className="w-100 row justify-content-around">{renderSections()}</div>
}
