import { dataService } from '../services/DataService.js';
import { asyncHandler } from '../middlewares/error.middleware.js';

export class IndiaRiskController {
    static getIndiaRisk = asyncHandler(async (req, res) => {
        const { lat, lon } = req.query;

        const latitude = lat !== undefined ? parseFloat(lat) : NaN;
        const longitude = lon !== undefined ? parseFloat(lon) : NaN;

        if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
            const response = {
                success: false,
                message: 'Invalid or missing lat/lon query parameters',
                timestamp: new Date(),
            };
            return res.status(400).json(response);
        }

        const result = await dataService.getIndiaRisk(latitude, longitude);
        return res.status(result.success ? 200 : 400).json(result);
    });
}
