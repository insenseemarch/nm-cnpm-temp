import React, { useState, useEffect, useRef } from 'react';

/**
 * A select component with predefined options and an "Other" option
 * that reveals a text input for custom values.
 */
const SelectWithOther = ({
    label,
    value,
    onChange,
    options,
    placeholder = 'Chọn một tùy chọn',
    otherPlaceholder = 'Nhập giá trị khác...',
    required = false,
    disabled = false,
}) => {
    // Check if current value is in the options list
    const isCustomValue = value && !options.includes(value) && value !== '';
    const [showOtherInput, setShowOtherInput] = useState(isCustomValue);
    const [customValue, setCustomValue] = useState(isCustomValue ? value : '');

    // Track internal changes to prevent useEffect from hiding input on empty value
    const isInternalChange = useRef(false);

    // Update state when value changes externally
    useEffect(() => {
        if (isInternalChange.current) {
            isInternalChange.current = false;
            return;
        }

        const isCustom = value && !options.includes(value) && value !== '';
        setShowOtherInput(isCustom);
        if (isCustom) {
            setCustomValue(value);
        }
    }, [value, options]);

    const handleSelectChange = (e) => {
        const selectedValue = e.target.value;
        if (selectedValue === '__other__') {
            isInternalChange.current = true;
            setShowOtherInput(true);
            setCustomValue('');
            onChange('');
        } else {
            setShowOtherInput(false);
            setCustomValue('');
            onChange(selectedValue);
        }
    };

    const handleCustomInputChange = (e) => {
        isInternalChange.current = true;
        const inputValue = e.target.value;
        setCustomValue(inputValue);
        onChange(inputValue);
    };

    const selectValue = showOtherInput ? '__other__' : options.includes(value) ? value : '';

    return (
        <div className="space-y-2">
            {label && (
                <label className="text-accent font-medium text-sm">
                    {label} {required && '*'}
                </label>
            )}
            <select
                value={selectValue}
                onChange={handleSelectChange}
                disabled={disabled}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-cosmic-energy transition-all"
            >
                <option value="" className="bg-gray-800 text-white/50">
                    {placeholder}
                </option>
                {options.map((option) => (
                    <option key={option} value={option} className="bg-gray-800 text-white">
                        {option}
                    </option>
                ))}
                <option value="__other__" className="bg-gray-800 text-white">
                    Khác
                </option>
            </select>

            {showOtherInput && (
                <input
                    type="text"
                    value={customValue}
                    onChange={handleCustomInputChange}
                    disabled={disabled}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:ring-2 focus:ring-cosmic-energy transition-all"
                    placeholder={otherPlaceholder}
                    required={required && showOtherInput}
                />
            )}
        </div>
    );
};

export default SelectWithOther;
