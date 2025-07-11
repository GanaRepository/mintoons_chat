'use client';

import React, { forwardRef } from 'react';
import { clsx } from 'clsx';
import { LucideIcon } from 'lucide-react';
import { VALIDATION_RULES } from '@utils/constants';
import { isValidAge } from '@utils/age-restrictions';

export interface FormFieldProps {
  label: string;
  error?: string;
  hint?: string;
  icon?: LucideIcon;
  variant?: 'default' | 'mintoons' | 'error' | 'success';
  fieldType?: 'input' | 'textarea' | 'select' | 'age';
  options?: { value: string; label: string }[];
  rows?: number;
  isLoading?: boolean;
  required?: boolean;
  showCounter?: boolean;
  maxLength?: number;
  ageValidation?: boolean;
  value?: any;
  onChange?: React.ChangeEventHandler<
    HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
  >;
  className?: string;
  // ...add any other props you need
}

const FormField = forwardRef<
  HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
  FormFieldProps
>(
  (
    {
      label,
      error,
      hint,
      icon: Icon,
      variant = 'default',
      fieldType = 'input',
      options = [],
      rows = 3,
      isLoading = false,
      required = false,
      showCounter = false,
      maxLength,
      ageValidation = false,
      className,
      value,
      onChange,
      ...props
    },
    ref
  ) => {
    const currentLength = typeof value === 'string' ? value.length : 0;

    // Age validation using utils/age-restrictions.ts
    const validateAge = (ageValue: string | number) => {
      const age = typeof ageValue === 'string' ? parseInt(ageValue) : ageValue;
      return isValidAge(age);
    };

    // Enhanced onChange handler for age validation
    const handleChange = (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) => {
      if (ageValidation && fieldType === 'age') {
        const age = parseInt(e.target.value);
        if (!validateAge(age)) {
          // Could trigger error state or validation message
        }
      }
      onChange?.(e);
    };

    // Apply validation rules from utils/constants.ts
    const getValidationRules = () => {
      switch (fieldType) {
        case 'input':
          if (
            (props as React.InputHTMLAttributes<HTMLInputElement>).type ===
            'password'
          ) {
            return {
              minLength: VALIDATION_RULES.PASSWORD.MIN_LENGTH,
              pattern: VALIDATION_RULES.PASSWORD.PATTERN.source,
            };
          }
          return {};
        case 'textarea':
          return {
            minLength: VALIDATION_RULES.STORY_CONTENT.MIN_LENGTH,
            maxLength: maxLength || VALIDATION_RULES.STORY_CONTENT.MAX_LENGTH,
          };
        case 'age':
          return {
            min: 2,
            max: 18,
            type: 'number' as const,
          };
        default:
          return {};
      }
    };

    const validationRules = getValidationRules();

    const baseFieldStyles = clsx(
      'w-full rounded-lg border px-4 py-3 transition-all duration-200',
      'focus:outline-none focus:ring-2 focus:ring-offset-1',
      'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed',
      {
        'pl-11': Icon,
        'border-gray-300 bg-white text-gray-900 focus:border-primary-500 focus:ring-primary-500':
          variant === 'default' && !error,
        'border-mintoons-purple bg-gradient-to-r from-mintoons-purple/5 to-mintoons-pink/5 text-gray-900 focus:border-mintoons-purple focus:ring-mintoons-purple/20':
          variant === 'mintoons' && !error,
        'border-red-300 bg-red-50 text-red-900 focus:border-red-500 focus:ring-red-500':
          error || variant === 'error',
        'border-green-300 bg-green-50 text-green-900 focus:border-green-500 focus:ring-green-500':
          variant === 'success',
      },
      className
    );

    const labelStyles = clsx('block text-sm font-medium mb-2', {
      'text-gray-700': !error && variant !== 'mintoons',
      'text-mintoons-purple': variant === 'mintoons' && !error,
      'text-red-700': error,
      'text-green-700': variant === 'success',
    });

    const renderField = () => {
      if (fieldType === 'textarea') {
        return (
          <textarea
            ref={ref as React.Ref<HTMLTextAreaElement>}
            rows={rows}
            className={baseFieldStyles}
            value={value}
            onChange={
              handleChange as React.ChangeEventHandler<HTMLTextAreaElement>
            }
            disabled={isLoading}
            {...validationRules}
            {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
          />
        );
      }

      if (fieldType === 'select') {
        return (
          <select
            ref={ref as React.Ref<HTMLSelectElement>}
            className={baseFieldStyles}
            value={value}
            onChange={
              handleChange as React.ChangeEventHandler<HTMLSelectElement>
            }
            disabled={isLoading}
            {...(props as React.SelectHTMLAttributes<HTMLSelectElement>)}
          >
            <option value="">Select {label}</option>
            {options.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      }

      return (
        <input
          ref={ref as React.Ref<HTMLInputElement>}
          className={baseFieldStyles}
          value={value}
          onChange={handleChange as React.ChangeEventHandler<HTMLInputElement>}
          disabled={isLoading}
          {...validationRules}
          {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
        />
      );
    };

    return (
      <div className="relative">
        <label className={labelStyles}>
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </label>

        <div className="relative">
          {Icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-400">
              <Icon size={18} />
            </div>
          )}

          {renderField()}

          {isLoading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 transform">
              <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-mintoons-purple"></div>
            </div>
          )}
        </div>

        {/* Character Counter */}
        {showCounter && maxLength && fieldType === 'textarea' && (
          <div className="mt-1 flex justify-end">
            <span
              className={clsx(
                'text-xs',
                currentLength > maxLength * 0.9
                  ? 'text-red-500'
                  : 'text-gray-400'
              )}
            >
              {currentLength}/{maxLength}
            </span>
          </div>
        )}

        {/* Age validation hint */}
        {fieldType === 'age' && !error && (
          <p className="mt-1 text-sm text-gray-500">
            Must be between 2 and 18 years old (COPPA compliant)
          </p>
        )}

        {/* Hint Text */}
        {hint && !error && fieldType !== 'age' && (
          <p className="mt-1 text-sm text-gray-500">{hint}</p>
        )}

        {/* Error Message */}
        {error && (
          <p className="mt-1 flex items-center text-sm text-red-600">
            <span className="mr-1">⚠️</span>
            {error}
          </p>
        )}
      </div>
    );
  }
);

FormField.displayName = 'FormField';

export default FormField;
