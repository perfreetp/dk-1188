import { v4 as uuidv4 } from 'uuid';

export const generateToken = (length = 32) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < length; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
};

export const calculateDuration = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return diffDays;
};

export const formatDateRange = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  
  if (!endDate || startDate === endDate) {
    return start.toLocaleDateString('zh-CN', options);
  }
  
  return `${start.toLocaleDateString('zh-CN', options)} - ${end.toLocaleDateString('zh-CN', options)}`;
};

export const groupByDate = (items, dateField = 'createdAt') => {
  const grouped = {};
  
  items.forEach(item => {
    const date = new Date(item[dateField]).toISOString().split('T')[0];
    if (!grouped[date]) {
      grouped[date] = [];
    }
    grouped[date].push(item);
  });
  
  return Object.entries(grouped)
    .sort(([a], [b]) => new Date(a) - new Date(b))
    .map(([date, items]) => ({
      date,
      items
    }));
};

export const calculateTotal = (items, field = 'amount') => {
  return items.reduce((sum, item) => {
    const value = parseFloat(item[field]) || 0;
    return sum + value;
  }, 0);
};

export const groupByCategory = (items, categoryField = 'category') => {
  const grouped = {};
  
  items.forEach(item => {
    const category = item[categoryField] || 'other';
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(item);
  });
  
  return Object.entries(grouped).map(([category, items]) => ({
    category,
    total: calculateTotal(items),
    count: items.length,
    items
  }));
};

export const paginate = (items, page = 1, limit = 20) => {
  const offset = (page - 1) * limit;
  const paginatedItems = items.slice(offset, offset + limit);
  
  return {
    items: paginatedItems,
    pagination: {
      page,
      limit,
      total: items.length,
      totalPages: Math.ceil(items.length / limit)
    }
  };
};

export const sortByDate = (items, field = 'createdAt', order = 'DESC') => {
  return [...items].sort((a, b) => {
    const dateA = new Date(a[field]);
    const dateB = new Date(b[field]);
    return order === 'DESC' ? dateB - dateA : dateA - dateB;
  });
};

export const getStartOfYear = (year) => {
  return new Date(year, 0, 1);
};

export const getEndOfYear = (year) => {
  return new Date(year, 11, 31, 23, 59, 59);
};

export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return d;
};

const deg2rad = (deg) => {
  return deg * (Math.PI / 180);
};
