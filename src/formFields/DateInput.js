import React from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { format, parse } from 'date-fns'
import { CalendarIcon } from 'lucide-react'

export default function DateInput(props) {
  const {
    schema,
    uiSchema,
    formData,
    errors,
    title,
    field,
    uiFieldSchema,
    layoutClass,
    fieldClass,
    handleChange,
    fieldName,
    isRequired,
    showLabel,
  } = props
  const formatOfDate = uiSchema[fieldName]?.['ui:options']?.format || uiSchema[fieldName]?.['ui-options']?.format || 'MM/dd/yyyy'
  
  const handleDateChange = (fieldName, date, formatString) => {
    let formattedDate

    if (!date || isNaN(date.getTime())) {
      date = new Date()
    }

    if (formatString) {
      try {
        formattedDate = format(date, formatString)
      } catch (error) {
        formattedDate = date.toISOString()
      }
    } else {
      formattedDate = new Date(date).toISOString()
    }
    handleChange(fieldName, formattedDate)
  }

  // Custom Input Component to position the icon
  const CustomInput = ({ value, onClick }) => (
    <div className="date-picker-container">
      <input
        className={`${fieldClass} ${errors[fieldName] ? 'is-invalid' : ''} form-control`}
        value={value}
        onClick={onClick}
        placeholder={uiFieldSchema['ui:placeholder'] || formatOfDate}
      />
      {(!errors[fieldName] || errors[fieldName].length === 0) && <span className="calendar-icon" onClick={onClick}><CalendarIcon size={16}/></span>}
    </div>
  )

  return (
    <div key={fieldName} className={`${layoutClass}`}>
      {(title || fieldName) && showLabel && (
        <label className="form-label">
          {title || fieldName}
          {isRequired && <span>*</span>}
        </label>
      )}
      <div>
        <DatePicker
          selected={
            formData[fieldName] ? parse(formData[fieldName], formatOfDate, new Date()) : ''
          }
          onChange={(date) => handleDateChange(fieldName, date, formatOfDate)}
          dateFormat={formatOfDate}
          customInput={<CustomInput />}
        />
      </div>
      {errors[fieldName] &&
          errors[fieldName].map((error, index) => (
            <p key={index} className="text-danger m-0">
              {error}
            </p>
          ))}
    </div>
  )
}
