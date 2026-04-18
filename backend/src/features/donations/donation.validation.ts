import { body } from 'express-validator';
import { DonationType } from '../../shared/types/enums';

export const createDonationValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters'),

  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),

  body('type')
    .notEmpty()
    .withMessage('Donation type is required')
    .isIn(Object.values(DonationType))
    .withMessage('Invalid donation type'),

  body('quantity')
    .notEmpty()
    .withMessage('Quantity is required')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),

  body('unit')
    .trim()
    .notEmpty()
    .withMessage('Unit is required'),

  body('images')
    .optional()
    .isArray()
    .withMessage('Images must be an array'),

  body('pickupLocation')
    .notEmpty()
    .withMessage('Pickup location is required'),

  body('pickupLocation.address')
    .trim()
    .notEmpty()
    .withMessage('Pickup address is required'),

  body('pickupLocation.city')
    .trim()
    .notEmpty()
    .withMessage('Pickup city is required'),

  body('pickupLocation.coordinates.latitude')
    .notEmpty()
    .withMessage('Latitude is required')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),

  body('pickupLocation.coordinates.longitude')
    .notEmpty()
    .withMessage('Longitude is required')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),

  body('pickupTimeWindow')
    .optional()
    .isObject()
    .withMessage('Pickup time window must be an object'),

  body('pickupTimeWindow.start')
    .optional()
    .isISO8601()
    .withMessage('Pickup start time must be a valid date'),

  body('pickupTimeWindow.end')
    .optional()
    .isISO8601()
    .withMessage('Pickup end time must be a valid date')
    .custom((value, { req }) => {
      if (req.body.pickupTimeWindow?.start && value) {
        const start = new Date(req.body.pickupTimeWindow.start);
        const end = new Date(value);
        if (end <= start) {
          throw new Error('Pickup end time must be after start time');
        }
      }
      return true;
    }),

  body('expiryDate')
    .optional()
    .isISO8601()
    .withMessage('Expiry date must be a valid date'),

  body('isFood')
    .optional()
    .isBoolean()
    .withMessage('isFood must be a boolean'),

  body('foodDetails')
    .optional()
    .isObject()
    .withMessage('Food details must be an object'),

  body('foodDetails.allergens')
    .optional()
    .isArray()
    .withMessage('Allergens must be an array'),

  body('foodDetails.storageInstructions')
    .optional()
    .isString()
    .withMessage('Storage instructions must be a string'),

  body('foodDetails.isCooked')
    .optional()
    .isBoolean()
    .withMessage('isCooked must be a boolean'),

  body('foodDetails.isPackaged')
    .optional()
    .isBoolean()
    .withMessage('isPackaged must be a boolean'),

  body('estimatedValue')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Estimated value must be a positive number'),

  body('weight')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Weight must be a positive number'),

  body('notes')
    .optional()
    .isString()
    .withMessage('Notes must be a string'),
];

export const updateDonationValidation = [
  body('title')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),

  body('quantity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),

  body('unit')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Unit cannot be empty'),

  body('images')
    .optional()
    .isArray()
    .withMessage('Images must be an array'),

  body('pickupLocation.address')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Pickup address cannot be empty'),

  body('pickupLocation.city')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Pickup city cannot be empty'),

  body('pickupLocation.coordinates.latitude')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),

  body('pickupLocation.coordinates.longitude')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),

  body('expiryDate')
    .optional()
    .isISO8601()
    .withMessage('Expiry date must be a valid date'),

  body('estimatedValue')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Estimated value must be a positive number'),

  body('weight')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Weight must be a positive number'),
];

export const updateDonationStatusValidation = [
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isString()
    .withMessage('Status must be a string'),

  body('rejectionReason')
    .optional()
    .isString()
    .withMessage('Rejection reason must be a string'),

  body('adminNotes')
    .optional()
    .isString()
    .withMessage('Admin notes must be a string'),
];

