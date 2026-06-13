import { schemas } from '../middleware/validation.js';

describe('Validation Schemas', () => {
  describe('register schema', () => {
    test('should validate valid registration data', () => {
      const validData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };
      
      const { error } = schemas.register.validate(validData);
      expect(error).toBeUndefined();
    });

    test('should reject short username', () => {
      const invalidData = {
        username: 'ab',
        email: 'test@example.com',
        password: 'password123'
      };
      
      const { error } = schemas.register.validate(invalidData);
      expect(error).toBeDefined();
    });

    test('should reject invalid email', () => {
      const invalidData = {
        username: 'testuser',
        email: 'invalid-email',
        password: 'password123'
      };
      
      const { error } = schemas.register.validate(invalidData);
      expect(error).toBeDefined();
    });

    test('should reject short password', () => {
      const invalidData = {
        username: 'testuser',
        email: 'test@example.com',
        password: '12345'
      };
      
      const { error } = schemas.register.validate(invalidData);
      expect(error).toBeDefined();
    });
  });

  describe('createTravel schema', () => {
    test('should validate valid travel data', () => {
      const validData = {
        name: 'My Trip',
        description: 'A great trip',
        start_date: '2024-01-01',
        end_date: '2024-01-10'
      };
      
      const { error } = schemas.createTravel.validate(validData);
      expect(error).toBeUndefined();
    });

    test('should reject missing required fields', () => {
      const invalidData = {
        description: 'A trip without name'
      };
      
      const { error } = schemas.createTravel.validate(invalidData);
      expect(error).toBeDefined();
    });

    test('should reject end_date before start_date', () => {
      const invalidData = {
        name: 'My Trip',
        start_date: '2024-01-10',
        end_date: '2024-01-01'
      };
      
      const { error } = schemas.createTravel.validate(invalidData);
      expect(error).toBeDefined();
    });
  });

  describe('createExpense schema', () => {
    test('should validate valid expense data', () => {
      const validData = {
        category: 'food',
        amount: 100.50,
        currency: 'CNY'
      };
      
      const { error } = schemas.createExpense.validate(validData);
      expect(error).toBeUndefined();
    });

    test('should reject negative amount', () => {
      const invalidData = {
        amount: -50
      };
      
      const { error } = schemas.createExpense.validate(invalidData);
      expect(error).toBeDefined();
    });
  });

  describe('search schema', () => {
    test('should validate valid search query', () => {
      const validData = {
        query: 'Tokyo',
        type: 'location'
      };
      
      const { error } = schemas.search.validate(validData);
      expect(error).toBeUndefined();
    });

    test('should reject missing query', () => {
      const invalidData = {
        type: 'location'
      };
      
      const { error } = schemas.search.validate(invalidData);
      expect(error).toBeDefined();
    });
  });
});
