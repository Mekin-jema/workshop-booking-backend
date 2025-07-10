const { z } = require('zod');
const { isValidTimeFormat, isFutureDate } = require("../utils/helper")

// Common validation schemas
const emailSchema = z.string().email('Invalid email address').toLowerCase();
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');
const nameSchema = z.string().min(2, 'Name must be at least 2 characters').trim();

// User registration/login validation
exports.validateUser = (req, res, next) => {
  const registerSchema = z.object({
    name: nameSchema,
    email: emailSchema,
    password: passwordSchema,
    role: z.enum(['ADMIN', 'CUSTOMER']).optional().default('CUSTOMER')
  });

  const loginSchema = z.object({
    email: emailSchema,
    password: passwordSchema
  });

  try {
    const schema = req.path.includes('register') ? registerSchema : loginSchema;
    const validatedData = schema.parse(req.body);
    req.validatedData = validatedData;
    next();
  } catch (error) {
    res.status(400).json({ 
      error: 'Validation failed',
      details: error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      })) 
    });
  }
};

// Workshop validation
exports.validateWorkshop = (req, res, next) => {
  const timeSlotSchema = z.object({
    startTime: z.string()
      .refine(isValidTimeFormat, 'Invalid time format (HH:MM)')
      .transform(time => time.toUpperCase()),
    endTime: z.string()
      .refine(isValidTimeFormat, 'Invalid time format (HH:MM)')
      .transform(time => time.toUpperCase())
  }).refine(data => {
    const start = new Date(`2000-01-01T${data.startTime}`);
    const end = new Date(`2000-01-01T${data.endTime}`);
    return start < end;
  }, 'End time must be after start time');

  const schema = z.object({
    title: z.string().min(3, 'Title must be at least 3 characters').trim(),
    description: z.string().min(10, 'Description must be at least 10 characters').trim(),
    date: z.string()
      .refine(val => !isNaN(Date.parse(val)), 'Invalid date format')
      .refine(isFutureDate, 'Date must be in the future')
      .transform(val => new Date(val)),
    maxCapacity: z.number()
      .int()
      .positive('Capacity must be positive')
      .max(100, 'Capacity cannot exceed 100'),
    timeSlots: z.array(timeSlotSchema)
      .min(1, 'At least one time slot is required')
      .max(10, 'Maximum 10 time slots per workshop')
  });

  try {
    const validatedData = schema.parse(req.body);
    req.validatedData = validatedData;
    next();
  } catch (error) {
    res.status(400).json({ 
      error: 'Workshop validation failed',
      details: error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }))
    });
  }
};

// Booking validation
exports.validateBooking = (req, res, next) => {
  const schema = z.object({
    workshopId: z.preprocess(
      val => parseInt(val, 10),
      z.number().int().positive('Invalid workshop ID')
    ),
    timeSlotId: z.preprocess(
      val => parseInt(val, 10),
      z.number().int().positive('Invalid time slot ID')
    )
  });

  try {
    const validatedData = schema.parse(req.body);
    req.validatedData = validatedData;
    next();
  } catch (error) {
    res.status(400).json({ 
      error: 'Booking validation failed',
      details: error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }))
    });
  }
};

// Time slot validation
exports.validateTimeSlot = (req, res, next) => {
  const schema = z.object({
    startTime: z.string()
      .refine(isValidTimeFormat, 'Invalid time format (HH:MM)')
      .transform(time => time.toUpperCase()),
    endTime: z.string()
      .refine(isValidTimeFormat, 'Invalid time format (HH:MM)')
      .transform(time => time.toUpperCase())
  }).refine(data => {
    const start = new Date(`2000-01-01T${data.startTime}`);
    const end = new Date(`2000-01-01T${data.endTime}`);
    return start < end;
  }, 'End time must be after start time');

  try {
    const validatedData = schema.parse(req.body);
    req.validatedData = validatedData;
    next();
  } catch (error) {
    res.status(400).json({ 
      error: 'Time slot validation failed',
      details: error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }))
    });
  }
};

// Admin booking status validation
exports.validateBookingStatus = (req, res, next) => {
  const schema = z.object({
    status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED'], {
      errorMap: () => ({ message: 'Status must be PENDING, CONFIRMED, or CANCELLED' })
    })
  });

  try {
    const validatedData = schema.parse(req.body);
    req.validatedData = validatedData;
    next();
  } catch (error) {
    res.status(400).json({ 
      error: 'Invalid booking status',
      details: error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }))
    });
  }
};