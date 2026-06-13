import Joi from 'joi';

export const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      return res.status(400).json({
        success: false,
        message: '数据验证失败',
        errors
      });
    }
    
    next();
  };
};

export const schemas = {
  register: Joi.object({
    username: Joi.string().min(3).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(100).required()
  }),
  
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),
  
  createTravel: Joi.object({
    name: Joi.string().max(200).required(),
    description: Joi.string().allow('').optional(),
    start_date: Joi.date().required(),
    end_date: Joi.date().greater(Joi.ref('start_date')).optional(),
    cover_image: Joi.string().uri().allow('').optional(),
    status: Joi.string().valid('ongoing', 'completed', 'archived').optional()
  }),
  
  updateTravel: Joi.object({
    name: Joi.string().max(200).optional(),
    description: Joi.string().allow('').optional(),
    start_date: Joi.date().optional(),
    end_date: Joi.date().optional(),
    cover_image: Joi.string().uri().allow('').optional(),
    status: Joi.string().valid('ongoing', 'completed', 'archived').optional(),
    privacy_level: Joi.string().valid('public', 'private', 'password_protected', 'family').optional(),
    password: Joi.string().allow('').optional()
  }),
  
  createCompanion: Joi.object({
    user_id: Joi.string().uuid().allow(null).optional(),
    name: Joi.string().max(100).required(),
    avatar: Joi.string().uri().allow('').optional(),
    role: Joi.string().valid('family', 'friend', 'colleague', 'other').optional()
  }),
  
  createLocation: Joi.object({
    name: Joi.string().max(200).required(),
    latitude: Joi.number().min(-90).max(90).optional(),
    longitude: Joi.number().min(-180).max(180).optional(),
    type: Joi.string().valid('hotel', 'restaurant', 'attraction', 'shopping', 'transport', 'other').optional(),
    check_in_time: Joi.date().optional()
  }),
  
  createSnippet: Joi.object({
    title: Joi.string().max(200).allow('').optional(),
    content: Joi.string().required(),
    location_id: Joi.string().uuid().allow(null).optional(),
    date: Joi.date().optional()
  }),
  
  createPhoto: Joi.object({
    url: Joi.string().uri().required(),
    description: Joi.string().max(500).allow('').optional(),
    location_id: Joi.string().uuid().allow(null).optional(),
    taken_at: Joi.date().optional()
  }),
  
  createRestaurant: Joi.object({
    name: Joi.string().max(200).required(),
    address: Joi.string().max(500).allow('').optional(),
    rating: Joi.number().min(0).max(5).optional(),
    review: Joi.string().allow('').optional(),
    latitude: Joi.number().min(-90).max(90).optional(),
    longitude: Joi.number().min(-180).max(180).optional()
  }),
  
  createTicket: Joi.object({
    type: Joi.string().valid('flight', 'train', 'bus', 'taxi', 'museum', 'show', 'other').optional(),
    amount: Joi.number().positive().required(),
    currency: Joi.string().length(3).optional(),
    date: Joi.date().optional(),
    notes: Joi.string().allow('').optional()
  }),
  
  createHighlight: Joi.object({
    title: Joi.string().max(200).required(),
    type: Joi.string().valid('attraction', 'food', 'activity', 'reflection', 'other').optional(),
    description: Joi.string().allow('').optional(),
    date: Joi.date().optional(),
    is_featured: Joi.boolean().optional()
  }),
  
  createMood: Joi.object({
    tag_name: Joi.string().max(50).required(),
    date: Joi.date().optional()
  }),
  
  createExpense: Joi.object({
    category: Joi.string().valid('accommodation', 'food', 'transport', 'shopping', 'entertainment', 'other').optional(),
    amount: Joi.number().positive().required(),
    currency: Joi.string().length(3).optional(),
    date: Joi.date().optional(),
    payment_method: Joi.string().max(50).allow('').optional(),
    notes: Joi.string().max(500).allow('').optional()
  }),
  
  createRoute: Joi.object({
    name: Joi.string().max(200).required(),
    distance: Joi.number().positive().optional(),
    duration: Joi.number().integer().positive().optional(),
    start_location: Joi.string().max(200).allow('').optional(),
    end_location: Joi.string().max(200).allow('').optional(),
    route_data: Joi.string().allow('').optional()
  }),
  
  createAnniversary: Joi.object({
    travel_id: Joi.string().uuid().allow(null).optional(),
    name: Joi.string().max(200).required(),
    date: Joi.date().required(),
    reminder_days: Joi.number().integer().min(0).max(365).optional(),
    frequency: Joi.string().valid('once', 'yearly', 'monthly').optional()
  }),
  
  createShareLink: Joi.object({
    expires_in_days: Joi.number().integer().positive().optional()
  }),
  
  search: Joi.object({
    query: Joi.string().required(),
    type: Joi.string().valid('location', 'companion', 'content', 'all').optional(),
    start_date: Joi.date().optional(),
    end_date: Joi.date().optional()
  })
};
