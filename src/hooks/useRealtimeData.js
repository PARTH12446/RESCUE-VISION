import { useState, useEffect } from 'react';
import {
    fetchStats,
    fetchPredictions,
    fetchAlerts,
    fetchResources,
    fetchHistoricalData,
    fetchResourceAllocationData,
    fetchAIInsights,
    fetchAlertStats,
    fetchResourceStats,
} from '@/services/api';
import { subscribeToRealtimeUpdates } from '@/services/socket';

function computeAllocationData(resources) {
    const resourcesArray = Array.isArray(resources) ? resources : [];
    const totalDeployed = resourcesArray.reduce((sum, resource) =>
        sum + Math.max(0, (resource.quantity || 0) - (resource.available || 0)),
    0);

    if (totalDeployed <= 0) {
        return [];
    }

    const deployedByType = {};
    resourcesArray.forEach((resource) => {
        const deployed = Math.max(0, (resource.quantity || 0) - (resource.available || 0));
        if (!deployedByType[resource.type]) {
            deployedByType[resource.type] = 0;
        }
        deployedByType[resource.type] += deployed;
    });

    return Object.entries(deployedByType).map(([type, deployed]) => ({
        name: type,
        allocated: Math.round((deployed / totalDeployed) * 100),
    }));
}

export function useRealtimeData() {
    const [data, setData] = useState({
        stats: null,
        predictions: null,
        alerts: null,
        resources: null,
        historicalData: null,
        allocationData: null,
        insights: null,
        alertStats: null,
        resourceStats: null,
        reportedDisasters: null,
        analytics: null,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let mounted = true;

        // Fetch initial data
        async function loadInitialData() {
            try {
                setLoading(true);
                const [stats, predictions, alerts, resources, historical, allocation, insights, alertStats, resourceStats] = await Promise.all([
                    fetchStats(),
                    fetchPredictions(),
                    fetchAlerts(),
                    fetchResources(),
                    fetchHistoricalData(),
                    fetchResourceAllocationData(),
                    fetchAIInsights(),
                    fetchAlertStats(),
                    fetchResourceStats(),
                ]);

                const allocationData = computeAllocationData(resources);

                if (mounted) {
                    setData({
                        stats,
                        predictions,
                        alerts,
                        resources,
                        historicalData: historical,
                        allocationData,
                        insights,
                        alertStats,
                        resourceStats,
                        reportedDisasters: null,
                        analytics: null,
                    });
                    setError(null);
                }
            } catch (err) {
                if (mounted) {
                    setError(err instanceof Error ? err.message : 'Failed to load data');
                    console.error('Error loading initial data:', err);
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        }

        loadInitialData();

        // Subscribe to real-time updates
        const unsubscribe = subscribeToRealtimeUpdates((updates) => {
            if (mounted) {
                setData((prev) => {
                    const merged = { ...prev, ...updates };
                    const nextAllocation = computeAllocationData(merged.resources);
                    return { ...merged, allocationData: nextAllocation };
                });
            }
        });

        return () => {
            mounted = false;
            unsubscribe();
        };
    }, []);

    return { data, loading, error };
}

// Individual hooks for specific data types
export function useStats() {
    const { data, loading, error } = useRealtimeData();
    return { stats: data.stats, loading, error };
}

export function usePredictions() {
    const { data, loading, error } = useRealtimeData();
    return { predictions: data.predictions, loading, error };
}

export function useAlerts() {
    const { data, loading, error } = useRealtimeData();
    return { alerts: data.alerts, loading, error };
}

export function useResources() {
    const { data, loading, error } = useRealtimeData();
    return { resources: data.resources, loading, error };
}