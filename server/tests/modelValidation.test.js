const FitnessCenter = require('../models/FitnessCenter');
const UserProfile = require('../models/UserProfile');

describe('FitnessCenter Model Validation', () => {
  test('should pass validation with valid email, website, and phone', () => {
    const center = new FitnessCenter({
      name: 'Test Gym',
      type: 'gym',
      email: 'test@example.com',
      website: 'www.testgym.com',
      contact: '+91 9820000001',
      alternateContact: '+91-98200-00011',
      openingHours: {
        monday: { open: '06:00', close: '22:00', closed: false },
        sunday: { open: null, close: null, closed: true }
      }
    });
    const err = center.validateSync();
    expect(err).toBeUndefined();
  });

  test('should fail validation with invalid email', () => {
    const center = new FitnessCenter({
      name: 'Test Gym',
      type: 'gym',
      email: 'invalid-email'
    });
    const err = center.validateSync();
    expect(err).toBeDefined();
    expect(err.errors.email).toBeDefined();
    expect(err.errors.email.message).toContain('is not a valid email address');
  });

  test('should fail validation with invalid website', () => {
    const center = new FitnessCenter({
      name: 'Test Gym',
      type: 'gym',
      website: 'not-a-website!!'
    });
    const err = center.validateSync();
    expect(err).toBeDefined();
    expect(err.errors.website).toBeDefined();
    expect(err.errors.website.message).toContain('is not a valid website URL');
  });

  test('should fail validation with invalid phone numbers', () => {
    const center = new FitnessCenter({
      name: 'Test Gym',
      type: 'gym',
      contact: '123'
    });
    const err = center.validateSync();
    expect(err).toBeDefined();
    expect(err.errors.contact).toBeDefined();
    expect(err.errors.contact.message).toContain('is not a valid phone number');
  });

  test('should fail validation with invalid openingHours times', () => {
    const center = new FitnessCenter({
      name: 'Test Gym',
      type: 'gym',
      openingHours: {
        monday: { open: '25:00', close: '22:00' }
      }
    });
    const err = center.validateSync();
    expect(err).toBeDefined();
    expect(err.errors['openingHours.monday.open']).toBeDefined();
    expect(err.errors['openingHours.monday.open'].message).toContain('is not a valid 24-hour time format');
  });
});

describe('UserProfile Model Validation', () => {
  test('should pass validation with valid email and phone numbers', () => {
    const profile = new UserProfile({
      userId: 'firebase123',
      email: 'user@example.com',
      phone: '+91 9999999999',
      addresses: [
        {
          id: 'addr1',
          label: 'Home',
          phone: '+91-88888-88888'
        }
      ]
    });
    const err = profile.validateSync();
    expect(err).toBeUndefined();
  });

  test('should fail validation with invalid email', () => {
    const profile = new UserProfile({
      userId: 'firebase123',
      email: 'not-an-email'
    });
    const err = profile.validateSync();
    expect(err).toBeDefined();
    expect(err.errors.email).toBeDefined();
  });

  test('should fail validation with invalid phone in base profile', () => {
    const profile = new UserProfile({
      userId: 'firebase123',
      phone: '123'
    });
    const err = profile.validateSync();
    expect(err).toBeDefined();
    expect(err.errors.phone).toBeDefined();
  });

  test('should fail validation with invalid phone in address', () => {
    const profile = new UserProfile({
      userId: 'firebase123',
      addresses: [
        {
          id: 'addr1',
          phone: 'abc'
        }
      ]
    });
    const err = profile.validateSync();
    expect(err).toBeDefined();
    expect(err.errors['addresses.0.phone']).toBeDefined();
  });
});
