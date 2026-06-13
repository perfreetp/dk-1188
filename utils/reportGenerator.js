import { Travel, Companion, Location, TextSnippet, Photo, Restaurant, Expense, Route, Highlight, MoodTag } from '../models/index.js';
import { calculateDuration, calculateTotal, groupByCategory } from './helpers.js';

export const generateAnnualReport = async (userId, year) => {
  const startDate = new Date(year, 0, 1).toISOString().split('T')[0];
  const endDate = new Date(year, 11, 31).toISOString().split('T')[0];

  const travels = await Travel.findByUserId(userId);
  const yearTravels = travels.filter(t => t.start_date >= startDate && t.start_date <= endDate);

  let totalDays = 0;
  let totalExpenses = 0;
  let totalPhotos = 0;
  let totalHighlights = 0;
  let allExpenses = [];
  let allMoods = {};
  let locationVisits = {};
  let featuredHighlights = [];

  for (const travel of yearTravels) {
    totalDays += calculateDuration(travel.start_date, travel.end_date || travel.start_date);
    
    const [photos, highlights, moods, expenses, locations] = await Promise.all([
      Photo.findByTravelId(travel.id),
      Highlight.findByTravelId(travel.id),
      MoodTag.findByTravelId(travel.id),
      Expense.findByTravelId(travel.id),
      Location.findByTravelId(travel.id)
    ]);

    totalPhotos += photos.length;
    totalHighlights += highlights.length;
    allExpenses = [...allExpenses, ...expenses];

    moods.forEach(mood => {
      allMoods[mood.tag_name] = (allMoods[mood.tag_name] || 0) + 1;
    });

    locations.forEach(loc => {
      locationVisits[loc.name] = (locationVisits[loc.name] || 0) + 1;
    });

    highlights.filter(h => h.is_featured).forEach(h => {
      featuredHighlights.push({ title: h.title, type: h.type, travelName: travel.name, description: h.description });
    });
  }

  totalExpenses = calculateTotal(allExpenses);
  const expenseBreakdown = groupByCategory(allExpenses, 'category');

  const topLocations = Object.entries(locationVisits)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));

  const moodDistribution = allMoods;

  const monthlyDistribution = Array(12).fill(0);
  yearTravels.forEach(t => {
    const month = new Date(t.start_date).getMonth();
    monthlyDistribution[month]++;
  });

  return {
    year,
    summary: {
      totalTrips: yearTravels.length,
      totalDays,
      totalExpenses,
      totalPhotos,
      totalHighlights
    },
    expenseBreakdown,
    moodDistribution,
    topLocations,
    featuredHighlights,
    monthlyDistribution,
    travels: yearTravels.map(t => ({
      id: t.id,
      name: t.name,
      startDate: t.start_date,
      endDate: t.end_date,
      duration: calculateDuration(t.start_date, t.end_date || t.start_date)
    }))
  };
};

export const generateTravelSummary = async (travelId) => {
  const travel = await Travel.findById(travelId);
  
  if (!travel) {
    throw new Error('Travel not found');
  }

  const [companions, locations, snippets, photos, restaurants, highlights, moods, expenses, routes] = await Promise.all([
    Companion.findByTravelId(travelId),
    Location.findByTravelId(travelId),
    TextSnippet.findByTravelId(travelId),
    Photo.findByTravelId(travelId),
    Restaurant.findByTravelId(travelId),
    Highlight.findByTravelId(travelId),
    MoodTag.findByTravelId(travelId),
    Expense.findByTravelId(travelId),
    Route.findByTravelId(travelId)
  ]);

  const duration = calculateDuration(travel.start_date, travel.end_date || travel.start_date);
  const totalExpenses = calculateTotal(expenses);
  const expenseBreakdown = groupByCategory(expenses, 'category');
  const totalDistance = routes.reduce((sum, r) => sum + (parseFloat(r.distance) || 0), 0);
  const totalDuration = routes.reduce((sum, r) => sum + (r.duration || 0), 0);

  return {
    basic: {
      name: travel.name,
      description: travel.description,
      startDate: travel.start_date,
      endDate: travel.end_date,
      duration,
      coverImage: travel.cover_image,
      status: travel.status
    },
    stats: {
      companions: companions.length,
      locations: locations.length,
      snippets: snippets.length,
      photos: photos.length,
      restaurants: restaurants.length,
      highlights: highlights.length,
      totalExpenses,
      totalDistance,
      totalDuration
    },
    expenseBreakdown,
    companions,
    locations,
    snippets,
    photos,
    restaurants,
    highlights,
    featuredHighlights: highlights.filter(h => h.is_featured),
    moods,
    routes
  };
};
