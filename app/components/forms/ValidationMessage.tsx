'use client';

import React from 'react';
import { clsx } from 'clsx';
import { CheckCircle, AlertCircle, XCircle, Info } from 'lucide-react';
import { ZodError } from 'zod';
import {
  validateEmailOnly,
  validatePasswordOnly,
  validateAgeOnly,
  isValidObjectId,
  isValidStoryWordCount,
  isValidAge,
  isValidTier,
  isValidRole,
} from '@utils/validators';
import {
  getAgeGroup,
  needsParentalConsent,
  getContentRating,
} from '@utils/age-restrictions';
import { VALIDATION_RULES, AGE_GROUPS, USER_ROLES } from '@utils/constants';
// Import from config instead of utils
import { SUBSCRIPTION_TIERS } from '@config/subscription';

export interface ValidationMessageProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  field?: string;
  value?: any;
  validationType?:
    | 'email'
    | 'password'
    | 'age'
    | 'story'
    | 'role'
    | 'tier'
    | 'objectId';
  showIcon?: boolean;
  className?: string;
  detailed?: boolean;
  ageContext?: {
    userAge: number;
    showCOPPAInfo?: boolean;
    showContentRating?: boolean;
  };
}

const ValidationMessage: React.FC<ValidationMessageProps> = ({
  type,
  message,
  field,
  value,
  validationType,
  showIcon = true,
  className,
  detailed = false,
  ageContext,
}) => {
  // Get appropriate icon based on type
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'error':
        return <XCircle size={16} className="text-red-500" />;
      case 'warning':
        return <AlertCircle size={16} className="text-yellow-500" />;
      case 'info':
        return <Info size={16} className="text-blue-500" />;
      default:
        return null;
    }
  };

  // Real-time validation using utils/validators.ts
  const performRealTimeValidation = () => {
    if (!validationType || !value) return null;

    try {
      switch (validationType) {
        case 'email':
          validateEmailOnly(value);
          return { isValid: true, message: 'Valid email address' };

        case 'password':
          validatePasswordOnly(value);
          return { isValid: true, message: 'Password meets requirements' };

        case 'age':
          validateAgeOnly(value);
          return { isValid: true, message: 'Valid age' };

        case 'story':
          const wordCount =
            typeof value === 'string' ? value.split(' ').length : 0;
          if (isValidStoryWordCount(wordCount)) {
            return {
              isValid: true,
              message: `Story length is good (${wordCount} words)`,
            };
          }
          return {
            isValid: false,
            message: 'Story must be between 300-600 words',
          };

        case 'role':
          if (isValidRole(value)) {
            return { isValid: true, message: 'Valid user role' };
          }
          return {
            isValid: false,
            message: `Role must be one of: ${Object.values(USER_ROLES).join(', ')}`,
          };

        case 'tier':
          if (isValidTier(value)) {
            return { isValid: true, message: 'Valid subscription tier' };
          }
          // Fix: Get tier names from SUBSCRIPTION_TIERS object
          return {
            isValid: false,
            message: `Tier must be one of: ${Object.keys(SUBSCRIPTION_TIERS).join(', ')}`,
          };

        case 'objectId':
          if (isValidObjectId(value)) {
            return { isValid: true, message: 'Valid ID format' };
          }
          return { isValid: false, message: 'Invalid ID format' };

        default:
          return null;
      }
    } catch (error) {
      if (error instanceof ZodError) {
        return {
          isValid: false,
          message: error.errors[0]?.message || 'Validation failed',
          details: error.errors,
        };
      }
      return { isValid: false, message: 'Validation error occurred' };
    }
  };

  // Get age-specific information using utils/age-restrictions.ts
  const getAgeSpecificInfo = () => {
    // Fix: Proper condition check for age validation
    if (!ageContext || validationType !== 'age') return null;

    const { userAge, showCOPPAInfo, showContentRating } = ageContext;
    const ageGroup = getAgeGroup(userAge);
    const needsConsent = needsParentalConsent(userAge);
    const contentRating = getContentRating(userAge);

    return {
      ageGroup,
      needsConsent,
      contentRating: showContentRating ? contentRating : null,
      showCOPPAInfo: showCOPPAInfo && needsConsent,
    };
  };

  // Get validation rules for detailed view
  const getValidationRules = () => {
    if (!detailed || !validationType) return null;

    switch (validationType) {
      case 'password':
        return [
          `Minimum ${VALIDATION_RULES.PASSWORD.MIN_LENGTH} characters`,
          'At least 1 uppercase letter',
          'At least 1 lowercase letter',
          'At least 1 number',
        ];

      case 'story':
        return [
          `Minimum ${VALIDATION_RULES.STORY_CONTENT.MIN_LENGTH} characters`,
          `Maximum ${VALIDATION_RULES.STORY_CONTENT.MAX_LENGTH} characters`,
          'Age-appropriate content only',
        ];

      case 'age':
        return [
          'Must be between 2-18 years old',
          'COPPA compliance for under 13',
          'Parental consent required for minors',
        ];

      default:
        return null;
    }
  };

  const realTimeValidation = performRealTimeValidation();
  const ageInfo = getAgeSpecificInfo();
  const validationRules = getValidationRules();

  // Override type and message if real-time validation is available
  let finalType = type;
  let finalMessage = message;

  if (realTimeValidation) {
    finalType = realTimeValidation.isValid ? 'success' : 'error';
    finalMessage = realTimeValidation.message;
  }

  const baseStyles = clsx(
    'p-3 rounded-lg border text-sm',
    {
      'bg-green-50 border-green-200 text-green-800': finalType === 'success',
      'bg-red-50 border-red-200 text-red-800': finalType === 'error',
      'bg-yellow-50 border-yellow-200 text-yellow-800': finalType === 'warning',
      'bg-blue-50 border-blue-200 text-blue-800': finalType === 'info',
    },
    className
  );

  return (
    <div className={baseStyles}>
      <div className="flex items-start space-x-2">
        {showIcon && getIcon()}
        <div className="flex-1">
          <p className="font-medium">{finalMessage}</p>

          {/* Field-specific information */}
          {field && <p className="mt-1 text-xs opacity-75">Field: {field}</p>}

          {/* Age-specific information */}
          {ageInfo && (
            <div className="mt-2 space-y-1">
              {ageInfo.ageGroup && (
                <p className="text-xs">
                  <strong>Age Group:</strong> {ageInfo.ageGroup.label}
                </p>
              )}

              {ageInfo.showCOPPAInfo && (
                <p className="rounded border bg-yellow-100 p-2 text-xs">
                  <strong>COPPA Notice:</strong> Parental consent required for
                  users under 13
                </p>
              )}

              {ageInfo.contentRating && (
                <div className="mt-2 text-xs">
                  <p>
                    <strong>Content Restrictions:</strong>
                  </p>
                  <ul className="ml-2 list-inside list-disc space-y-1">
                    {ageInfo.contentRating.restrictions.map(
                      (restriction, index) => (
                        <li key={index}>{restriction}</li>
                      )
                    )}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Detailed validation rules */}
          {validationRules && (
            <div className="mt-2">
              <p className="mb-1 text-xs font-medium">Requirements:</p>
              <ul className="space-y-1 text-xs">
                {validationRules.map((rule, index) => (
                  <li key={index} className="flex items-center space-x-1">
                    <span className="text-gray-400">•</span>
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* ZodError details */}
          {realTimeValidation?.details && detailed && (
            <div className="mt-2">
              <p className="mb-1 text-xs font-medium">Validation Details:</p>
              <ul className="space-y-1 text-xs">
                {realTimeValidation.details.map((error, index) => (
                  <li key={index} className="flex items-start space-x-1">
                    <span className="mt-0.5 text-red-400">•</span>
                    <span>
                      {error.path.join('.')}: {error.message}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ValidationMessage;
