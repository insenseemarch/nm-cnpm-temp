import React, { useState, useEffect, useRef } from 'react';
import { Calendar } from 'lucide-react';

/**
 * Custom Date Input component with dd/mm/yyyy format
 */
const DateInput = ({
  value,
  onChange,
  label,
  required = false,
  disabled = false,
  className = '',
}) => {
  const [displayValue, setDisplayValue] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const hiddenInputRef = useRef(null);

  // Convert yyyy-mm-dd to dd/mm/yyyy for display
  const formatToDisplay = (dateStr) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return '';
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  };

  // Convert dd/mm/yyyy to yyyy-mm-dd for value
  const formatToValue = (displayStr) => {
    if (!displayStr) return '';
    const parts = displayStr.split('/');
    if (parts.length !== 3) return '';
    const [day, month, year] = parts;
    if (!day || !month || !year) return '';
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  };

  // Update display when value changes from outside
  useEffect(() => {
    setDisplayValue(formatToDisplay(value));
  }, [value]);

  // Handle text input change
  const handleDisplayChange = (e) => {
    let input = e.target.value;

    // Remove non-numeric and non-slash characters
    input = input.replace(/[^\d/]/g, '');

    // Auto-add slashes
    if (input.length === 2 && !input.includes('/')) {
      input = input + '/';
    } else if (input.length === 5 && input.split('/').length === 2) {
      input = input + '/';
    }

    // Limit length (dd/mm/yyyy = 10 chars)
    if (input.length > 10) {
      input = input.slice(0, 10);
    }

    setDisplayValue(input);

    // If complete date, update the actual value
    if (input.length === 10) {
      const valueFormat = formatToValue(input);
      if (valueFormat && isValidDate(valueFormat)) {
        onChange({ target: { value: valueFormat } });
      }
    } else if (input === '') {
      onChange({ target: { value: '' } });
    }
  };

  // Validate date format
  const isValidDate = (dateStr) => {
    if (!dateStr) return false;
    const date = new Date(dateStr);
    return !isNaN(date.getTime());
  };

  // Handle native date picker change
  const handleNativeDateChange = (e) => {
    const newValue = e.target.value;
    onChange({ target: { value: newValue } });
    setDisplayValue(formatToDisplay(newValue));
    setIsEditing(false);
  };

  // Open native date picker
  const openDatePicker = () => {
    if (disabled) return;
    if (hiddenInputRef.current) {
      hiddenInputRef.current.showPicker?.();
      hiddenInputRef.current.focus();
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="text-accent font-medium text-sm">
          {label} {required && '*'}
        </label>
      )}
      <div className="relative">
        {/* Display input with dd/mm/yyyy format */}
        <input
          type="text"
          value={displayValue}
          onChange={handleDisplayChange}
          onFocus={() => setIsEditing(true)}
          onBlur={() => {
            setIsEditing(false);
            // Validate on blur
            if (displayValue && displayValue.length === 10) {
              const valueFormat = formatToValue(displayValue);
              if (!isValidDate(valueFormat)) {
                setDisplayValue(formatToDisplay(value));
              }
            } else if (displayValue && displayValue.length !== 10) {
              setDisplayValue(formatToDisplay(value));
            }
          }}
          placeholder="dd/mm/yyyy"
          className="w-full px-4 py-3 pr-12 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:ring-2 focus:ring-cosmic-energy transition-all"
          disabled={disabled}
          required={required}
        />

        {/* Calendar icon button */}
        <button
          type="button"
          onClick={openDatePicker}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-accent transition-colors"
          disabled={disabled}
          tabIndex={-1}
        >
          <Calendar className="w-5 h-5" />
        </button>

        {/* Hidden native date input for picker */}
        <input
          ref={hiddenInputRef}
          type="date"
          value={value || ''}
          onChange={handleNativeDateChange}
          className="absolute opacity-0 w-0 h-0 overflow-hidden"
          tabIndex={-1}
          disabled={disabled}
        />
      </div>
    </div>
  );
};

export default DateInput;
