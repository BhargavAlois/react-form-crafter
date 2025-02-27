import React, { forwardRef, useState, useEffect, useRef, useImperativeHandle } from 'react'
import DefaultTemplate from '../templates/DefaultTemplate'
import { format, parseISO } from 'date-fns'
import ContentTemplate from '../templates/ContentTemplate'

const MyForm = forwardRef((props, ref) => {
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
  const defaultData = useRef({})
  const isInitialized = useRef(false)
  if (!isInitialized.current) {
    defaultData.current = initializeDefaultData()
    isInitialized.current = true
  }
  const [formData, setFormData] = useState(flattenData({...defaultData.current, ...prefilledFormData} || {}));
  const [errors, setErrors] = useState({})
  const templates = props?.templates
  const templateName = uiSchema?.['template']
  const fieldRefs = useRef({});    // To focus the input fields which are empty when performing validation

  let MyTemplate
  if (templateName) {
    MyTemplate = templates[templateName]
  }

  // const normalizeFieldName = (fieldName) => {
  //   const parts = fieldName.split('.')
  //   return parts[parts.length - 1] // Return the last part of the path
  // }

  const normalizeData = async (schema, data, uiSchema = {}) => {
    const processProperties = async (schemaProperties, inputData, parentKey = '') => {
      const result = {};
  
      for (const [key, value] of Object.entries(inputData || {})) {
        const fieldSchema = schemaProperties?.[key];
  
        if (fieldSchema?.type === "object" && fieldSchema.properties) {
          // Recursively process nested objects, preserving structure
          result[key] = await processProperties(
            fieldSchema.properties,
            value,
            `${parentKey}${key}.`
          );
        } else if (fieldSchema?.type === "string" && fieldSchema.format === "date") {
          // Handle date formatting based on UI schema
          const fieldUiSchema = uiSchema[`${parentKey}${key}`] || {};
          const displayFormat =
            fieldUiSchema?.["ui:options"]?.format ||
            fieldUiSchema?.["ui-options"]?.format ||
            "yyyy-MM-dd";
  
          try {
            result[key] = format(parseISO(value), displayFormat);
          } catch {
            result[key] = value; // Fallback to raw value if formatting fails
          }
        } else {
          // Directly assign other fields
          result[key] = value;
        }
      }
  
      return result;
    };
  
    // Call the recursive processor
    return processProperties(schema?.properties, data);
  };

  function flattenData(data) {
    const result = {};
  
    function flatten(obj, parentKey = "") {
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          const newKey = parentKey ? `${parentKey}.${key}` : key;
  
          if (typeof obj[key] === "object" && !Array.isArray(obj[key])) {
            flatten(obj[key], newKey);
          } else {
            result[newKey] = obj[key];
          }
        }
      }
    }
  
    flatten(data);
    return result;
  }

  function initializeDefaultData() {
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

    const defaultData = extractDefaults(schema)
    return defaultData // Encode URLs
  }

  const convertToNestedStructure = (dottedData) => {
    const nestedData = {};
  
    Object.entries(dottedData).forEach(([key, value]) => {
      const keys = key.split("."); // Split the dotted key into parts
      let current = nestedData;
  
      keys.forEach((part, index) => {
        if (!current[part]) {
          // Create a nested object if it doesn't exist
          current[part] = {};
        }
  
        // If it's the last key, assign the value
        if (index === keys.length - 1) {
          current[part] = value;
        }
  
        // Move deeper into the nested structure
        current = current[part];
      });
    });
  
    return nestedData;
  };  

  useEffect(() => {
    if (!isInitialized.current) {
      defaultData.current = initializeDefaultData()
      isInitialized.current = true
    }

    const processPrefilledData = async () => {
      const mergedData = { ...defaultData.current, ...prefilledFormData }
      const normalizedData = (await normalizeData(schema, mergedData, uiSchema));
      //Convert merged data to the format : formData.info.firstName=value;
      const flatData = flattenData(normalizedData); //Converting data into dotted notation
      setFormData(flatData);
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

      //array validations
      if(value && fieldSchema.type === 'array')
      {
        if (Array.isArray(value)) {
          const hasEmptyField = value.some((item) => !item || item === '');
      
          if (hasEmptyField) {
            errors.push(`One or more fields in the ${fieldTitle} are empty.`);
          }
        }
      }

      // File validations
      const uiOptions = uiSchema[fieldName]?.['ui:options'] || {}
      if (uiOptions.accept && value) {
        let fileType
        let fileSize

        if (typeof value === 'string' && value.startsWith('data:')) {
          const mimeTypeMatch = value.match(/data:(.*?);/)
          fileType = mimeTypeMatch?.[1]
        }
        // Case 2: File object (from file input)
        else if (value instanceof File || value instanceof Blob) {
          fileType = value.type
          fileSize = value.size
        }
        if (fileType && !uiOptions.accept.includes(fileType)) {
          errors.push(
            `The selected file type (${fileType}) is not supported.`,
            // `${fieldTitle} must be one of the accepted file types: ${uiOptions.accept.join(', ')}`,
          )
        }

        if (uiOptions.size && fileSize) {
          const maxSizeInBytes = uiOptions.size * 1024 * 1024;
          if (fileSize > maxSizeInBytes) {
            errors.push(
              `The selected file size (${(fileSize / (1024 * 1024)).toFixed(
                2
              )} MB) exceeds the maximum allowed size of ${uiOptions.size} MB.`
            );
          }
        }
      }

      if (errors.length > 0) {
        // const normalizedFieldName = normalizeFieldName(fullPath)
        formErrors[fullPath] = errors
      }
    }

    // Recursive function to handle nested objects
    const validateObject = (objectSchema, parentPath = '') => {
      Object.entries(objectSchema.properties || {}).forEach(([fieldName, fieldSchema]) => {
        const fullPath = parentPath ? `${parentPath}.${fieldName}` : fieldName // Construct the full path
        // const normalizedFieldName = normalizeFieldName(fullPath)
        const value = formData?.[fullPath] // Use the full path to access the value

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

    if (Object.keys(formErrors).length > 0) {
      const firstErrorField = Object.keys(formErrors)[0];
      const fieldElement = fieldRefs.current[firstErrorField];
      if (fieldElement) {
        fieldElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        fieldElement.focus();
      }
      return false;
    }
    
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

  const handleSubmit = (e) => {
    if (e) e.preventDefault()

    if (validateForm()) {
      if (onSuccess) {
        onSuccess()
      } else {
        defaultOnSuccess()
      }

      //Transforming data into nesting format specified in schema
      const nestedData = convertToNestedStructure(formData)
      const data = { formData: nestedData }

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
    console.log("Inside handle reset")
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
    const nestedData = convertToNestedStructure(updatedData)
    const data = { formData: nestedData }

    if (onChange) {
      onChange(data)
    }

    setErrors((prevErrors) => ({
      ...prevErrors,
      [fieldName]: '',
    }))
  }

  useImperativeHandle(
    ref,
    () => ({handleSubmit, handleReset})
  )

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
      fieldRefs={fieldRefs}
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
});

export default MyForm;