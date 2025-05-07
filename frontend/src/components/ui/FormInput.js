"use client"
import "./FormInput.css"

const FormInput = ({
  label,
  type = "text",
  id,
  name,
  value,
  placeholder,
  onChange,
  onBlur,
  error,
  required = false,
  disabled = false,
  className = "",
  pattern,
  minLength,
  maxLength,
  min,
  max,
  ...rest
}) => {
  return (
    <div className={`form-group ${className}`}>
      {label && (
        <label htmlFor={id} className="form-label">
          {label} {required && <span className="required">*</span>}
        </label>
      )}
      <input
        type={type}
        id={id}
        name={name}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        onBlur={onBlur}
        required={required}
        disabled={disabled}
        className={`form-input ${error ? "form-input-error" : ""}`}
        pattern={pattern}
        minLength={minLength}
        maxLength={maxLength}
        min={min}
        max={max}
        {...rest}
      />
      {error && <div className="form-error">{error}</div>}
    </div>
  )
}

export default FormInput
