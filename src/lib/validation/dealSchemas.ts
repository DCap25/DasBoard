import { z } from 'zod';

// Common validation patterns
const nonEmptyString = z.string().trim().min(1, 'This field is required');
const optionalString = z.string().trim().optional();
const positiveNumber = z.number().positive('Must be a positive number');
const nonNegativeNumber = z.number().min(0, 'Cannot be negative');
const currency = z.number().min(0, 'Amount cannot be negative').max(999999, 'Amount too large');

// VIN validation (last 8 characters)
const vinLast8 = z.string()
  .trim()
  .length(8, 'VIN must be exactly 8 characters')
  .regex(/^[A-HJ-NPR-Z0-9]{8}$/, 'Invalid VIN format');

// Stock number validation
const stockNumber = z.string()
  .trim()
  .min(1, 'Stock number is required')
  .max(50, 'Stock number too long')
  .regex(/^[A-Z0-9-]+$/i, 'Stock number can only contain letters, numbers, and hyphens');

// Deal number validation
const dealNumber = z.string()
  .trim()
  .max(50, 'Deal number too long')
  .regex(/^[A-Z0-9-]*$/i, 'Deal number can only contain letters, numbers, and hyphens')
  .optional();

// Customer name validation
const customerName = z.string()
  .trim()
  .min(1, 'Customer name is required')
  .max(100, 'Customer name too long')
  .regex(/^[a-zA-Z\s\-'.]+$/, 'Customer name contains invalid characters');

// Vehicle description validation
const vehicleDescription = z.string()
  .trim()
  .min(1, 'Vehicle description is required')
  .max(200, 'Vehicle description too long');

// Date validation
const dateString = z.string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format')
  .refine((date) => {
    const parsed = new Date(date);
    return !isNaN(parsed.getTime()) && parsed >= new Date('2020-01-01') && parsed <= new Date('2030-12-31');
  }, 'Date must be between 2020 and 2030');

// Lender validation
const lender = z.string()
  .trim()
  .max(100, 'Lender name too long')
  .optional();

// Notes validation
const notes = z.string()
  .trim()
  .max(1000, 'Notes too long')
  .optional();

/**
 * Single Finance Deal Log Form Validation Schema
 */
export const singleFinanceDealSchema = z.object({
  // Basic deal information
  dealNumber: dealNumber,
  stockNumber: stockNumber,
  vinLast8: vinLast8,
  vehicleType: z.enum(['N', 'U', 'C'], { errorMap: () => ({ message: 'Must select New, Used, or CPO' }) }),
  customerName: customerName,
  vehicleDescription: vehicleDescription,
  dealType: z.enum(['Finance', 'Lease', 'Cash'], { errorMap: () => ({ message: 'Must select a deal type' }) }),
  saleDate: dateString,

  // Financial data
  frontEndGross: z.string()
    .transform((val) => val === '' ? 0 : parseFloat(val))
    .pipe(nonNegativeNumber.max(999999, 'Amount too large')),
  
  // Salesperson information
  salespersonId: nonEmptyString,
  isSplitDeal: z.boolean(),
  secondSalespersonId: z.string().optional(),

  // Lender information
  lender: lender,
  reserveFlat: z.string()
    .transform((val) => val === '' ? 0 : parseFloat(val))
    .pipe(nonNegativeNumber.max(99999, 'Amount too large')),

  // F&I Product profits
  vscProfit: z.string()
    .transform((val) => val === '' ? 0 : parseFloat(val))
    .pipe(nonNegativeNumber.max(99999, 'Amount too large')),
  
  gapProfit: z.string()
    .transform((val) => val === '' ? 0 : parseFloat(val))
    .pipe(nonNegativeNumber.max(99999, 'Amount too large')),
  
  ppmProfit: z.string()
    .transform((val) => val === '' ? 0 : parseFloat(val))
    .pipe(nonNegativeNumber.max(99999, 'Amount too large')),
  
  tireWheelProfit: z.string()
    .transform((val) => val === '' ? 0 : parseFloat(val))
    .pipe(nonNegativeNumber.max(99999, 'Amount too large')),
  
  appearanceProfit: z.string()
    .transform((val) => val === '' ? 0 : parseFloat(val))
    .pipe(nonNegativeNumber.max(99999, 'Amount too large')),
  
  keyReplacementProfit: z.string()
    .transform((val) => val === '' ? 0 : parseFloat(val))
    .pipe(nonNegativeNumber.max(99999, 'Amount too large')),
  
  theftProfit: z.string()
    .transform((val) => val === '' ? 0 : parseFloat(val))
    .pipe(nonNegativeNumber.max(99999, 'Amount too large')),
  
  windshieldProfit: z.string()
    .transform((val) => val === '' ? 0 : parseFloat(val))
    .pipe(nonNegativeNumber.max(99999, 'Amount too large')),
  
  lojackProfit: z.string()
    .transform((val) => val === '' ? 0 : parseFloat(val))
    .pipe(nonNegativeNumber.max(99999, 'Amount too large')),
  
  extWarrantyProfit: z.string()
    .transform((val) => val === '' ? 0 : parseFloat(val))
    .pipe(nonNegativeNumber.max(99999, 'Amount too large')),
  
  otherProfit: z.string()
    .transform((val) => val === '' ? 0 : parseFloat(val))
    .pipe(nonNegativeNumber.max(99999, 'Amount too large')),

  // Deal status and notes
  status: z.enum(['pending', 'funded', 'unwound', 'deaddeal'], { 
    errorMap: () => ({ message: 'Must select a valid status' }) 
  }),
  notes: notes,
}).refine((data) => {
  // If it's a split deal, second salesperson is required
  if (data.isSplitDeal && !data.secondSalespersonId) {
    return false;
  }
  return true;
}, {
  message: 'Second salesperson is required for split deals',
  path: ['secondSalespersonId']
}).refine((data) => {
  // If deal type is not Cash, lender might be required (depending on business rules)
  if (data.dealType !== 'Cash' && data.lender && data.lender.trim() === '') {
    // This is a warning rather than an error for flexibility
    return true; // Allow empty lender for now
  }
  return true;
});

/**
 * Team Member Validation Schema
 */
export const teamMemberSchema = z.object({
  firstName: z.string()
    .trim()
    .min(1, 'First name is required')
    .max(50, 'First name too long')
    .regex(/^[a-zA-Z\s\-'.]+$/, 'First name contains invalid characters'),
  
  lastName: z.string()
    .trim()
    .min(1, 'Last name is required')
    .max(50, 'Last name too long')
    .regex(/^[a-zA-Z\s\-'.]+$/, 'Last name contains invalid characters'),
  
  role: z.enum(['salesperson', 'sales_manager'], {
    errorMap: () => ({ message: 'Must select a valid role' })
  })
});

// Export types for TypeScript
export type SingleFinanceDealData = z.infer<typeof singleFinanceDealSchema>;
export type TeamMemberData = z.infer<typeof teamMemberSchema>;