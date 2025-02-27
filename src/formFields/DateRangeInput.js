import React from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { format, parse, isValid } from 'date-fns'
import { CalendarIcon } from 'lucide-react'

export default function DateRangeInput(props) {
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
    fieldRefs,
  } = props

  const formatOfDate = uiSchema[fieldName]?.['ui:options']?.format || 'MM/dd/yyyy'
  const isColumnLayout = uiFieldSchema['ui:layout'] === 'column'

  const handleDateRangeChange = (key, date) => {
    const updatedRange = {
      ...formData[fieldName],
      [key]: date,
    }
    handleChange(fieldName, updatedRange)
  }

  const getSelectedDate = (dateString) => {
    if (!dateString) return null
    try {
      const parsedDate = parse(dateString, formatOfDate, new Date())
      return isValid(parsedDate) ? parsedDate : null
    } catch (error) {
      console.error('Error parsing date:', error)
      return null
    }
  }

  const CustomInput = ({ value, onClick, placeholder }) => (
    <div className="date-picker-container">
      <input
        className={`${fieldClass} ${errors[fieldName] ? 'is-invalid' : ''} form-control`}
        ref={(element) => (fieldRefs.current[fieldName] = element)}
        value={value}
        onClick={onClick}
        placeholder={placeholder}
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
      <div className={`${isColumnLayout ? 'd-flex flex-column' : 'd-flex flex-row'}`}>
        {/* Start Date Picker */}
        <DatePicker
          selected={getSelectedDate(formData[fieldName]?.startDate)}
          onChange={(date) => handleDateRangeChange('startDate', date)}
          selectsStart
          startDate={getSelectedDate(formData[fieldName]?.startDate)}
          endDate={getSelectedDate(formData[fieldName]?.endDate)}
          placeholderText="Start Date"
          dateFormat={formatOfDate}
          customInput={
            <CustomInput
              placeholder={uiFieldSchema['ui:placeholder'] || 'Start Date'}
            />
          }
          portalId="custom-popper-start"
        />
        {/* End Date Picker */}
        <DatePicker
          selected={getSelectedDate(formData[fieldName]?.endDate)}
          onChange={(date) => handleDateRangeChange('endDate', date)}
          selectsEnd
          startDate={getSelectedDate(formData[fieldName]?.startDate)}
          endDate={getSelectedDate(formData[fieldName]?.endDate)}
          minDate={getSelectedDate(formData[fieldName]?.startDate)}
          placeholderText="End Date"
          dateFormat={formatOfDate}
          customInput={
            <CustomInput
              placeholder={uiFieldSchema['ui:placeholder'] || 'End Date'}
            />
          }
          portalId="custom-popper-end"
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
