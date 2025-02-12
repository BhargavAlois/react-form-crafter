import React, { useState, useEffect, useRef } from 'react'
import DefaultTemplate from '../templates/DefaultTemplate'
import { format, parseISO } from 'date-fns'
import ContentTemplate from '../templates/ContentTemplate'
import '../mystyles/myStyle.css'

export default function MyForm(props) {
  const {
    schema,
    uiSchema = {},
    widgets,
    fields,
    onSubmit,
    onReset,
    onChange,
    onSuccess,
    onError,
    formData: prefilledFormData,
  } = props
  const [formData, setFormData] = useState(prefilledFormData)
  const defaultData = useRef({})
  const [errors, setErrors] = useState({})
  const templates = props?.templates
  const templateName = uiSchema?.['template']
  const isInitialized = useRef(false)

  let MyTemplate
  if (templateName) {
    MyTemplate = templates[templateName]
  }

  const normalizeFieldName = (fieldName) => {
    const parts = fieldName.split('.')
    return parts[parts.length - 1] // Return the last part of the path
  }

  const normalizeData = async (schema, data) => {
    const processProperties = async (properties, data, parentKey = '') => {
      const result = {}

      for (const [fieldName, fieldSchema] of Object.entries(properties || {})) {
        const fullPath = parentKey ? `${parentKey}.${fieldName}` : fieldName
        let fieldValue = data?.[fieldName]

        if (fieldSchema.type === 'string' && fieldSchema.format === 'date') {
          const fieldUiSchema = getSchema(fieldName, uiSchema)
          const displayFormat = fieldUiSchema?.['ui:options']?.format || fieldUiSchema?.['ui-options']?.format || 'yyyy-MM-dd'
          try {
            result[fieldName] = format(parseISO(fieldValue), displayFormat)
          } catch {
            if (data[fieldName]) {
              result[fieldName] = fieldValue // Fallback to raw value
            }
          }
        } else if (fieldSchema.type === 'object' && fieldSchema.properties) {
          result[fieldName] = await processProperties(
            fieldSchema.properties,
            data[fieldName] || {},
            fullPath,
          )
        } else {
          if (fieldValue !== undefined && fieldValue !== null) {
            result[fieldName] = fieldValue
          }
        }
      }

      return result
    }

    // Process and normalize schema-defined fields
    const structuredData = await processProperties(schema.properties, data || {})

    // Identify extra fields not in schema
    const schemaKeys = new Set(Object.keys(structuredData))
    const extraFields = Object.fromEntries(
      Object.entries(data || {}).filter(([key]) => !schemaKeys.has(key)),
    )

    // Merge structured schema-based data with extra fields (extra fields stay at the root level)
    const finalData = { ...structuredData, ...extraFields }

    return finalData
  }

  const flattenData = (data, parentKey = '') => {
    let result = {}

    Object.entries(data || {}).forEach(([key, value]) => {
      const newKey = parentKey ? key : key // Keep just the field name as key

      if (Array.isArray(value)) {
        result[newKey] = value
      } else if (typeof value === 'object' && value !== null) {
        result = { ...result, ...flattenData(value, newKey) }
      } else {
        result[newKey] = value
      }
    })

    return result
  }

  const initializeDefaultData = () => {
    const extractDefaults = (schema) => {
      const defaults = {}

      const processSchema = (properties) => {
        Object.entries(properties || {}).forEach(([key, value]) => {
          if (value.type === 'object' && value.properties) {
            defaults[key] = extractDefaults(value) // Recursively process nested objects
          } else if (value.type === 'array' && value.default) {
            defaults[key] = value.default // Handle default arrays
          } else if (value.default !== undefined) {
            defaults[key] = value.default
          }
        })
      }

      processSchema(schema?.properties)
      return defaults
    }

    let defaultData = extractDefaults(schema)
    defaultData = flattenData(defaultData)
    return defaultData // Encode URLs
  }

  useEffect(() => {
    if (!isInitialized.current) {
      const flattenedDefaultData = initializeDefaultData()
      defaultData.current = flattenedDefaultData
      isInitialized.current = true
    }

    const processPrefilledData = async () => {
      let flattenedPrefilledData = flattenData(prefilledFormData)
      const mergedData = { ...defaultData.current, ...flattenedPrefilledData }
      const normalizedData = await normalizeData(schema, mergedData)
      setFormData(normalizedData)
    }

    processPrefilledData()
  }, [prefilledFormData])

  const getRequiredFields = (schema) => {
    let requiredFields = []

    if (schema.required) {
      requiredFields = requiredFields.concat(schema.required)
    }

    Object.keys(schema.properties).forEach((fieldName) => {
      const field = schema.properties[fieldName]

      if (field.type === 'object' && field.properties) {
        const nestedRequiredFields = getRequiredFields(field)
        nestedRequiredFields.forEach((nestedField) => {
          requiredFields.push(`${nestedField}`)
        })
      }
    })

    return requiredFields
  }

  function getSchema(fieldName, schema) {
    if (typeof schema === 'object' && schema !== null) {
      if (schema.hasOwnProperty(fieldName)) {
        return schema[fieldName]
      }

      for (const key in schema) {
        if (schema[key] && typeof schema[key] === 'object') {
          const result = getSchema(fieldName, schema[key])
          if (result) {
            return result
          }
        }
      }
    }

    return null
  }

  const validateForm = () => {
    const formErrors = {}

    // Helper function to validate single field
    const validateField = (fieldName, fieldSchema, value, parentPath = '') => {
      const fullPath = parentPath ? `${parentPath}.${fieldName}` : fieldName
      const fieldTitle = fieldSchema.title || fieldName
      const errors = []

      // Required field validation
      if (fieldSchema.required || (getRequiredFields(schema) || []).includes(fieldName)) {
        if (value === undefined || value === '' || value === null || value.length === 0) {
          errors.push(`"${fieldTitle}" is required`)
        }
      }

      // String validations
      if (value && fieldSchema.type === 'string') {
        if (fieldSchema.format === 'email') {
          const emailPattern = new RegExp('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$')
          if (!emailPattern.test(value)) {
            errors.push(`"${fieldTitle}" must be a valid email address`)
          }
        }
        // Pattern validation
        if (fieldSchema.pattern) {
          const regex = new RegExp(fieldSchema.pattern)
          if (!regex.test(value)) {
            const fieldUiSchema = getSchema(fieldName, uiSchema)
            if (fieldUiSchema?.pattern_message) {
              // Add specific pattern_message errors
              if (Array.isArray(fieldUiSchema.pattern_message)) {
                errors.push(...fieldUiSchema.pattern_message)
              } else {
                errors.push(fieldUiSchema.pattern_message)
              }
            } else {
              // Default error message for invalid format
              errors.push(`"${fieldTitle}" is not in the correct format`)
            }
          }
        }

        // Length validations
        if (fieldSchema.minLength && value.length < fieldSchema.minLength) {
          errors.push(`"${fieldTitle}" should have at least ${fieldSchema.minLength} characters`)
        }
        if (fieldSchema.maxLength && value.length > fieldSchema.maxLength) {
          errors.push(
            `"${fieldTitle}" should have no more than ${fieldSchema.maxLength} characters`,
          )
        }

        // Date validation
        if (fieldSchema.format === 'date' && value) {
          const date = new Date(value)
          if (isNaN(date.getTime())) {
            errors.push(`"${fieldTitle}" must be a valid date`)
          }
          if (fieldSchema.minimum && new Date(value) < new Date(fieldSchema.minimum)) {
            errors.push(`"${fieldTitle}" must be after ${fieldSchema.minimum}`)
          }
          if (fieldSchema.maximum && new Date(value) > new Date(fieldSchema.maximum)) {
            errors.push(`"${fieldTitle}" must be before ${fieldSchema.maximum}`)
          }
        }
      }

      // Number validations
      if (value && fieldSchema.type === 'number') {
        if (fieldSchema.minimum !== undefined && value < fieldSchema.minimum) {
          errors.push(`"${fieldTitle}" must be greater than or equal to ${fieldSchema.minimum}`)
        }
        if (fieldSchema.maximum !== undefined && value > fieldSchema.maximum) {
          errors.push(`"${fieldTitle}" must be less than or equal to ${fieldSchema.maximum}`)
        }
      }

      // File validations
      const uiOptions = uiSchema[fieldName]?.['ui:options'] || {}
      if (uiOptions.accept && value) {
        let fileType

        if (typeof value === 'string' && value.startsWith('data:')) {
          const mimeTypeMatch = value.match(/data:(.*?);/)
          fileType = mimeTypeMatch?.[1]
        }
        // Case 2: File object (from file input)
        else if (value instanceof File || value instanceof Blob) {
          fileType = value.type
        }
        // console.log('File type : ', fileType)
        if (fileType && !uiOptions.accept.includes(fileType)) {
          errors.push(
            `The selected file type (${fileType}) is not supported.`,
            // `${fieldTitle} must be one of the accepted file types: ${uiOptions.accept.join(', ')}`,
          )
        }
      }

      if (errors.length > 0) {
        const normalizedFieldName = normalizeFieldName(fullPath)
        formErrors[normalizedFieldName] = errors
      }
    }

    // Recursive function to handle nested objects
    const validateObject = (objectSchema, parentPath = '') => {
      Object.entries(objectSchema.properties || {}).forEach(([fieldName, fieldSchema]) => {
        const fullPath = parentPath ? `${parentPath}.${fieldName}` : fieldName // Construct the full path
        const normalizedFieldName = normalizeFieldName(fullPath)
        const value = formData?.[normalizedFieldName] // Use the full path to access the value

        if (fieldSchema.type === 'object') {
          // Recursively validate nested objects
          validateObject(fieldSchema, fullPath)
        } else {
          // Validate individual fields
          validateField(fieldName, fieldSchema, value, parentPath)
        }
      })
    }

    // Start validation from root schema
    validateObject(schema)
    setErrors(formErrors)
    return Object.keys(formErrors).length === 0
  }

  const defaultSubmit = (e) => {
    if (e) e.preventDefault()
    // console.log('Default submit called')
  }

  const defaultOnSuccess = (e) => {
    // console.log('Submission successfull!')
  }

  const defaultOnError = (e) => {
    // console.log('Error occurred!')
  }

  const transformFormData = (schema, flatData) => {
    const buildNestedData = (schemaProperties, flatData, parentKey = '') => {
      const nestedData = {} // Initialize with only schema-defined fields

      Object.entries(schemaProperties || {}).forEach(([key, value]) => {
        const fullPath = parentKey ? `${parentKey}.${key}` : key

        if (value.type === 'object' && value.properties) {
          // Recursively build nested objects
          nestedData[key] = buildNestedData(value.properties, flatData, fullPath)
        } else {
          // Map flatData to the structured schema-defined fields
          if (flatData.hasOwnProperty(fullPath)) {
            nestedData[key] = flatData[fullPath] // Use full path key if exists
          } else if (flatData.hasOwnProperty(key)) {
            nestedData[key] = flatData[key] // Fallback to direct key match
          }
        }
      })

      return nestedData
    }

    // Create structured data as per schema
    const structuredData = buildNestedData(schema.properties, flatData)

    // Identify extra fields (not in schema)  //This implementation was necessary as some fields were being filled like this : (eg. PhoneNumber-> +971 +971 1234567890)
    const schemaKeys = new Set(Object.keys(structuredData))
    const extraFields = Object.fromEntries(
      Object.entries(flatData).filter(([key]) => !schemaKeys.has(key)),
    )

    // Merge structured schema-based data with extra fields (extra fields stay at the root level)
    return { ...structuredData, ...extraFields }
  }

  const handleSubmit = (e) => {
    if (e) e.preventDefault()

    if (validateForm()) {
      if (onSuccess) {
        onSuccess()
      } else {
        defaultOnSuccess()
      }

      //Transforming data into nesting format specified in schema
      const transformedData = transformFormData(schema, formData)
      const data = { formData: transformedData }

      if (onSubmit) {
        onSubmit(data, e)
        return
      } else {
        defaultSubmit(e)
        return
      }
    } else {
      if (onError) {
        onError()
      } else {
        defaultOnError()
      }
      return
    }
  }

  const handleReset = (event) => {
    setFormData({});
    if(onReset)
    {
      onReset(event);
    }
  }

  const handleChange = (fieldName, value) => {
    const fieldSchema = getSchema(fieldName, schema)
    let updatedData

    if (fieldSchema?.type === 'array') {
      if (Array.isArray(value)) {
        const array = value.map((item) => {
          return item
        })
        updatedData = { ...formData, [fieldName]: array }
        setFormData((prevData) => ({
          ...prevData,
          [fieldName]: array,
        }))
      } else {
        updatedData = { ...formData, [fieldName]: [] }
        setFormData((prevData) => ({
          ...prevData,
          [fieldName]: [],
        }))
      }
    } else {
      updatedData = { ...formData, [fieldName]: value ? value : null }
      setFormData((prevData) => ({
        ...prevData,
        [fieldName]: value ? value : null,
      }))
    }

    //Transforming data into nesting format specified in schema
    const transformedData = transformFormData(schema, updatedData)
    const data = { formData: transformedData }

    if (onChange) {
      onChange(data)
    }

    setErrors((prevErrors) => ({
      ...prevErrors,
      [fieldName]: '',
    }))
  }

  const submitBtnOptions = {
    ...uiSchema?.['ui:submitButtonOptions'],
  }

  const resetBtnOptions={
    ...uiSchema?.['ui:resetButtonOptions'],
  }
  
  const requiredFields = getRequiredFields(schema)

  const content = (
    <ContentTemplate
      formData={formData}
      schema={schema}
      uiSchema={uiSchema}
      errors={errors}
      widgets={widgets}
      fields={fields}
      onSubmit={handleSubmit}
      onReset={handleReset}
      onError={onError}
      onChange={handleChange}
      onSuccess={onSuccess}
      requiredFields={requiredFields}
    />
  )

  if (!MyTemplate) {
    return (
      <DefaultTemplate
        schema={schema}
        uiSchema={uiSchema}
        content={content}
        onSubmit={handleSubmit}
        onReset={handleReset}
        submitBtnOptions={submitBtnOptions}
        resetBtnOptions={resetBtnOptions}
      />
    )
  }

  return (
    <MyTemplate
      schema={schema}
      uiSchema={uiSchema}
      content={content}
      onSubmit={handleSubmit}
      onReset={handleReset}
      submitBtnOptions={submitBtnOptions}
      resetBtnOptions={resetBtnOptions}
    />
  )
}
