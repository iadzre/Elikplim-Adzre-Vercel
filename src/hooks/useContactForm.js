import { useState, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * @param {{ name: string; email: string; topic: string; message: string }} fields
 */
function validateFields(fields) {
  /** @type {Record<string, string>} */
  const errors = {};

  if (!fields.name.trim()) errors.name = 'This field is required.';
  if (!fields.email.trim()) {
    errors.email = 'This field is required.';
  } else if (!EMAIL_REGEX.test(fields.email.trim())) {
    errors.email = 'Please enter a valid email address.';
  }
  if (!fields.topic.trim()) errors.topic = 'This field is required.';
  if (!fields.message.trim()) errors.message = 'This field is required.';

  return errors;
}

export function useContactForm() {
  const [fieldErrors, setFieldErrors] = useState({});
  const [formMessage, setFormMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const clearFormState = useCallback(() => {
    setFieldErrors({});
    setFormMessage('');
    setIsSuccess(false);
    setSubmitError(null);
  }, []);

  /**
   * @param {{ name: string; email: string; topic: string; message: string; botField?: string }} data
   */
  const submit = useCallback(async (data) => {
    clearFormState();

    if (data.botField?.trim()) {
      return { ok: false };
    }

    const errors = validateFields(data);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setFormMessage('Please fill in all required fields correctly.');
      setIsSuccess(false);
      return { ok: false, errors };
    }

    if (!isSupabaseConfigured()) {
      setFormMessage('Contact form is not configured. Please set Supabase environment variables.');
      setIsSuccess(false);
      setSubmitError(new Error('Supabase not configured'));
      return { ok: false };
    }

    setIsSubmitting(true);

    const { error } = await supabase.from('contact_submissions').insert({
      name: data.name.trim(),
      email: data.email.trim(),
      topic: data.topic.trim(),
      message: data.message.trim(),
    });

    setIsSubmitting(false);

    if (error) {
      setFormMessage('Something went wrong. Please try again later.');
      setIsSuccess(false);
      setSubmitError(error);
      return { ok: false, error };
    }

    setFormMessage('Thank you! Your message has been sent successfully.');
    setIsSuccess(true);
    return { ok: true };
  }, [clearFormState]);

  return {
    fieldErrors,
    formMessage,
    isSuccess,
    isSubmitting,
    submitError,
    submit,
    clearFormState,
  };
}
