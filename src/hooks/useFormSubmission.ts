import { useState, useCallback, useRef } from 'react';

interface FormValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  validate?: (value: any) => boolean;
  message?: string;
}

interface FormField {
  [key: string]: FormValidationRule;
}

interface FormErrors {
  [key: string]: string;
}

export function useFormSubmission<T extends Record<string, any>>(
  initialValues: T,
  validationRules?: FormField,
  onSubmit?: (values: T) => Promise<void> | void
) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const submitAttemptedRef = useRef(false);

  // 验证单个字段
  const validateField = useCallback((name: string, value: any): string | null => {
    if (!validationRules || !validationRules[name]) return null;

    const rules = validationRules[name];

    // 必填验证
    if (rules.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
      return rules.message || `${name} is required`;
    }

    // 最小长度验证
    if (rules.minLength && typeof value === 'string' && value.length < rules.minLength) {
      return rules.message || `${name} must be at least ${rules.minLength} characters long`;
    }

    // 最大长度验证
    if (rules.maxLength && typeof value === 'string' && value.length > rules.maxLength) {
      return rules.message || `${name} must be at most ${rules.maxLength} characters long`;
    }

    // 正则表达式验证
    if (rules.pattern && typeof value === 'string' && !rules.pattern.test(value)) {
      return rules.message || `${name} is invalid`;
    }

    // 自定义验证函数
    if (rules.validate && !rules.validate(value)) {
      return rules.message || `${name} is invalid`;
    }

    return null;
  }, [validationRules]);

  // 验证所有字段
  const validateForm = useCallback((): boolean => {
    if (!validationRules) return true;

    const newErrors: FormErrors = {};
    let isValid = true;

    Object.keys(validationRules).forEach((field) => {
      const error = validateField(field, values[field as keyof T]);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [values, validationRules, validateField]);

  // 处理字段变化
  const handleChange = useCallback((name: keyof T, value: any) => {
    setValues((prev) => ({ ...prev, [name]: value }));

    // 实时验证已提交过的表单
    if (submitAttemptedRef.current) {
      const error = validateField(name as string, value);
      setErrors((prev) => ({ ...prev, [name]: error || '' }));
    }
  }, [validateField]);

  // 处理表单提交
  const handleSubmit = useCallback(
    async (event?: React.FormEvent) => {
      if (event) {
        event.preventDefault();
      }

      submitAttemptedRef.current = true;
      setIsSubmitting(true);
      setSubmitError(null);
      setSubmitSuccess(false);

      try {
        const isValid = validateForm();
        if (!isValid) {
          throw new Error('表单验证失败');
        }

        if (onSubmit) {
          await onSubmit(values);
        }

        setSubmitSuccess(true);
        return true;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '提交失败';
        setSubmitError(errorMessage);
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [values, validateForm, onSubmit]
  );

  // 重置表单
  const resetForm = useCallback((newValues?: T) => {
    setValues(newValues || initialValues);
    setErrors({});
    setSubmitSuccess(false);
    setSubmitError(null);
    submitAttemptedRef.current = false;
  }, [initialValues]);

  // 批量更新字段
  const setFields = useCallback((newValues: Partial<T>) => {
    setValues((prev) => ({ ...prev, ...newValues }));
  }, []);

  return {
    values,
    errors,
    isSubmitting,
    submitSuccess,
    submitError,
    handleChange,
    handleSubmit,
    resetForm,
    setFields,
    validateField,
    validateForm,
  };
}