import {
  calculateDuration,
  formatDateRange,
  groupByDate,
  calculateTotal,
  groupByCategory,
  paginate,
  sortByDate,
  calculateDistance
} from '../utils/helpers.js';

describe('Helper Functions', () => {
  describe('calculateDuration', () => {
    test('should calculate duration between two dates', () => {
      const result = calculateDuration('2024-01-01', '2024-01-05');
      expect(result).toBe(5);
    });

    test('should return 1 for same day', () => {
      const result = calculateDuration('2024-01-01', '2024-01-01');
      expect(result).toBe(1);
    });
  });

  describe('calculateTotal', () => {
    test('should calculate total of amounts', () => {
      const items = [
        { amount: '100.50' },
        { amount: '50.25' },
        { amount: '200' }
      ];
      const result = calculateTotal(items, 'amount');
      expect(result).toBe(350.75);
    });

    test('should return 0 for empty array', () => {
      const result = calculateTotal([]);
      expect(result).toBe(0);
    });
  });

  describe('groupByCategory', () => {
    test('should group items by category', () => {
      const items = [
        { category: 'food', amount: 100 },
        { category: 'food', amount: 50 },
        { category: 'transport', amount: 200 }
      ];
      const result = groupByCategory(items, 'category');
      expect(result).toHaveLength(2);
      expect(result.find(g => g.category === 'food').total).toBe(150);
      expect(result.find(g => g.category === 'transport').total).toBe(200);
    });
  });

  describe('paginate', () => {
    test('should paginate items correctly', () => {
      const items = Array.from({ length: 25 }, (_, i) => ({ id: i + 1 }));
      const result = paginate(items, 2, 10);
      
      expect(result.items).toHaveLength(10);
      expect(result.items[0].id).toBe(11);
      expect(result.pagination.page).toBe(2);
      expect(result.pagination.total).toBe(25);
      expect(result.pagination.totalPages).toBe(3);
    });
  });

  describe('sortByDate', () => {
    test('should sort items by date descending', () => {
      const items = [
        { createdAt: '2024-01-01' },
        { createdAt: '2024-03-01' },
        { createdAt: '2024-02-01' }
      ];
      const result = sortByDate(items, 'createdAt', 'DESC');
      expect(result[0].createdAt).toBe('2024-03-01');
      expect(result[2].createdAt).toBe('2024-01-01');
    });
  });

  describe('calculateDistance', () => {
    test('should calculate distance between two coordinates', () => {
      const distance = calculateDistance(31.2304, 121.4737, 31.2304, 121.4737);
      expect(distance).toBe(0);
    });

    test('should calculate non-zero distance', () => {
      const distance = calculateDistance(31.2304, 121.4737, 32.0603, 118.7969);
      expect(distance).toBeGreaterThan(0);
      expect(distance).toBeLessThan(500);
    });
  });
});
