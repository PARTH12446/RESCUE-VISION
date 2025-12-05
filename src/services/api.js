const API_BASE_URL = 'http://localhost:3001/api';

// Helper function for fetch requests
async function fetchAPI(endpoint, options) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers,
        },
        ...options,
    });

    let data = null;
    try {
        data = await response.json();
    } catch {
        // Non-JSON or empty response body
    }

    if (!response.ok) {
        const backendMessage = data?.message || data?.error;
        const error = new Error(
            `API Error ${response.status}: ${backendMessage || response.statusText}`
        );
        error.status = response.status;
        error.body = data;
        error.endpoint = endpoint;
        throw error;
    }

    return data;
}

// Dashboard stats
export async function fetchStats() {
    return fetchAPI('/dashboard/stats');
}

// Predictions
export async function fetchPredictions() {
    const result = await fetchAPI('/predictions');
    if (Array.isArray(result)) {
        return result;
    }
    if (result && Array.isArray(result.data)) {
        return result.data;
    }
    return [];
}

// Alerts
export async function fetchAlerts() {
    const result = await fetchAPI('/alerts');
    if (Array.isArray(result)) {
        return result;
    }
    if (result && Array.isArray(result.data)) {
        return result.data;
    }
    return [];
}

// Mark alert as read
export async function markAlertAsRead(id) {
    return fetchAPI(`/alerts/${id}/read`, { method: 'POST' });
}

// Resources
export async function fetchResources() {
    return fetchAPI('/resources');
}

// Add new resource
export async function addResource(resource) {
    return fetchAPI('/resources', {
        method: 'POST',
        body: JSON.stringify(resource),
    });
}

// Delete resource
export async function deleteResource(id) {
    return fetchAPI(`/resources/${id}`, {
        method: 'DELETE',
    });
}

// Historical chart data
export async function fetchHistoricalData() {
    return fetchAPI('/dashboard/historical');
}

// Resource allocation chart data
export async function fetchResourceAllocationData() {
    return fetchAPI('/dashboard/resource-stats');
}

// AI Insights
export async function fetchAIInsights() {
    return fetchAPI('/dashboard/insights');
}

// Alert stats
export async function fetchAlertStats() {
    return fetchAPI('/dashboard/alert-stats');
}

// Resource stats
export async function fetchResourceStats() {
    return fetchAPI('/dashboard/resource-stats');
}

// Report disaster
export async function reportDisaster(report) {
    return fetchAPI('/reports', {
        method: 'POST',
        body: JSON.stringify(report),
    });
}

// Get reported disasters
export async function fetchReportedDisasters() {
    return fetchAPI('/reports');
}

// Search
export async function search(query) {
    return fetchAPI(`/reports/search/all?search=${encodeURIComponent(query)}`);
}

// Analytics data
export async function fetchAnalytics() {
    return fetchAPI('/analytics');
}