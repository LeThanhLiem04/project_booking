import { statisticsService } from '../services/statistics-service.js';

/**
 * @description Get system statistics
 * @route GET /api/admin/stats
 */
export const getStats = async (req, res) => {
  try {
    console.log('---[GET /api/admin/stats]---');
    console.log('Body:', JSON.stringify(req.body));
    console.log('Query:', JSON.stringify(req.query));
    console.log('Params:', JSON.stringify(req.params));
    console.log('User:', JSON.stringify(req.user));
    const stats = await statisticsService.getStats(req.user, req.query);
    console.log('Received stats from service:', JSON.stringify(stats, null, 2));
    console.log('Attempting to send 200 response with stats...');
    res.status(200).json(stats);
  } catch (error) {
    console.error('Error in getStats controller:', error);
    if (error && error.stack) {
      console.error('Stack trace:', error.stack);
    }
    res.status(403).json({ message: error.message });
  }
};