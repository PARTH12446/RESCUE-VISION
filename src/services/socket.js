import { io } from 'socket.io-client';

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL?.trim() || 'http://localhost:3001';

let socket = null;

export function getSocket() {
    if (!socket) {
        socket = io(SOCKET_URL, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5,
        });

        socket.on('connect', () => {
            console.log('✅ WebSocket connected');
        });

        socket.on('disconnect', () => {
            console.log('❌ WebSocket disconnected');
        });

        socket.on('connect_error', (error) => {
            console.error('WebSocket connection error:', error);
        });
    }

    return socket;
}

export function subscribeToRealtimeUpdates(listener) {
    const socket = getSocket();

    // Initial data
    socket.on('initial:data', (data) => {
        listener({
            stats: data.stats,
            predictions: data.predictions,
            alerts: data.alerts,
            resources: data.resources,
        });
    });

    // Real-time updates
    socket.on('stats:update', (stats) => {
        listener({ stats });
    });

    socket.on('predictions:update', (predictions) => {
        listener({ predictions });
    });

    socket.on('alerts:update', (alerts) => {
        listener({ alerts });
    });

    socket.on('resources:update', (resources) => {
        listener({ resources });
    });

    socket.on('insights:update', (insights) => {
        listener({ insights });
    });

    socket.on('alertStats:update', (alertStats) => {
        listener({ alertStats });
    });

    socket.on('resourceStats:update', (resourceStats) => {
        listener({ resourceStats });
    });

    socket.on('charts:update', (data) => {
        listener({
            historicalData: data.historical,
            allocationData: data.allocation,
        });
    });

    socket.on('reportedDisasters:update', (disasters) => {
        listener({ reportedDisasters: disasters });
    });

    socket.on('analytics:update', (analytics) => {
        listener({ analytics });
    });

    // Cleanup function
    return () => {
        socket.off('initial:data');
        socket.off('stats:update');
        socket.off('predictions:update');
        socket.off('alerts:update');
        socket.off('resources:update');
        socket.off('insights:update');
        socket.off('alertStats:update');
        socket.off('resourceStats:update');
        socket.off('charts:update');
        socket.off('reportedDisasters:update');
        socket.off('analytics:update');
    };
}

export function disconnectSocket() {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
}