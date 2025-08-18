import { z } from 'zod';

// Email validation
const email = z
  .string()
  .trim()
  .toLowerCase()
  .email('Please enter a valid email address')
  .max(254, 'Email address too long'); // RFC 5321 limit

// Password validation
const password = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password too long')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    'Password must contain at least one lowercase letter, one uppercase letter, and one number'
  );

// Name validation
const name = z
  .string()
  .trim()
  .min(1, 'Name is required')
  .max(100, 'Name too long')
  .regex(/^[a-zA-Z\s\-'.]+$/, 'Name contains invalid characters');

// Phone validation (optional)
const phone = z
  .string()
  .trim()
  .regex(/^[\+]?[\d\s\-\(\)\.]{10,}$/, 'Please enter a valid phone number')
  .optional()
  .or(z.literal(''));

// Company/Dealership name validation
const companyName = z
  .string()
  .trim()
  .min(1, 'Company name is required')
  .max(200, 'Company name too long')
  .regex(/^[a-zA-Z0-9\s\-'.,&]+$/, 'Company name contains invalid characters');

/**
 * User Sign Up Validation Schema
 */
export const signUpSchema = z
  .object({
    email: email,
    password: password,
    confirmPassword: z.string(),
    firstName: name,
    lastName: name,
    companyName: companyName,
    phone: phone,
    role: z.enum(['finance_manager', 'sales_manager', 'salesperson', 'admin'], {
      errorMap: () => ({ message: 'Please select a valid role' }),
    }),
    agreeToTerms: z.boolean().refine(val => val === true, {
      message: 'You must agree to the terms and conditions',
    }),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

/**
 * User Sign In Validation Schema
 */
export const signInSchema = z.object({
  email: email,
  password: z.string().min(1, 'Password is required'),
});

/**
 * Password Reset Request Schema
 */
export const passwordResetSchema = z.object({
  email: email,
});

/**
 * Password Reset Confirmation Schema
 */
export const passwordResetConfirmSchema = z
  .object({
    password: password,
    confirmPassword: z.string(),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

/**
 * Profile Update Schema
 */
export const profileUpdateSchema = z.object({
  firstName: name,
  lastName: name,
  phone: phone,
  companyName: companyName.optional(),
});

/**
 * Change Password Schema
 */
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: password,
    confirmNewPassword: z.string(),
  })
  .refine(data => data.newPassword === data.confirmNewPassword, {
    message: "New passwords don't match",
    path: ['confirmNewPassword'],
  })
  .refine(data => data.currentPassword !== data.newPassword, {
    message: 'New password must be different from current password',
    path: ['newPassword'],
  });

// Export types for TypeScript
export type SignUpData = z.infer<typeof signUpSchema>;
export type SignInData = z.infer<typeof signInSchema>;
export type PasswordResetData = z.infer<typeof passwordResetSchema>;
export type PasswordResetConfirmData = z.infer<typeof passwordResetConfirmSchema>;
export type ProfileUpdateData = z.infer<typeof profileUpdateSchema>;
export type ChangePasswordData = z.infer<typeof changePasswordSchema>;
