import React from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { format, parse, isValid } from 'date-fns'
import { Calendar, CalendarIcon, CalendarRangeIcon, CalendarX2Icon } from 'lucide-react'

export default function DateInput(props) {
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
    fieldRefs,
  } = props
  const formatOfDate = uiSchema[fieldName]?.['ui:options']?.format || 'MM/dd/yyyy'

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

  const getSelectedDate = (dateString, formatString) => {
    if (!dateString) return null // Return null if the date string is empty or undefined
    try {
      const parsedDate = parse(dateString, formatString, new Date())
      if (!isValid(parsedDate)) {
        return null
      }
      return parsedDate
    } catch (error) {
      return null
    }
  }

  // Custom Input Component to position the icon
  const CustomInput = ({ value, onClick }) => (
    <div className="date-picker-container">
      <input
        className={`${fieldClass} ${errors[fieldName] ? 'is-invalid' : ''} form-control`}
        ref={(element) => (fieldRefs.current[fieldName] = element)}
        value={value}
        onClick={onClick}
        placeholder={uiSchema['ui:placeholder'] || formatOfDate}
        readOnly
      />
      {(!errors[fieldName] || errors[fieldName].length === 0) && (
        <span className="calendar-icon" onClick={onClick}>
          <CalendarIcon size={16} />
        </span>
      )}
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
          selected={getSelectedDate(formData[fieldName], formatOfDate)}
          onChange={(date) => handleDateChange(fieldName, date, formatOfDate)}
          dateFormat={formatOfDate}
          customInput={<CustomInput />}
          portalId="custom-popper"
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
