import dotenv from 'dotenv';

dotenv.config();

const PROVIDER = process.env.ROUTING_PROVIDER || 'ORS'; // 'ORS' | 'GOOGLE' | 'MAPBOX'

async function callORS(start, end) {
    const orsApiKey = process.env.ORS_API_KEY;
    if (!orsApiKey) return null;
    if (!start || !end || start.lat == null || start.lng == null || end.lat == null || end.lng == null) {
        return null;
    }

    const body = {
        coordinates: [
            [start.lng, start.lat],
            [end.lng, end.lat],
        ],
    };

    const response = await fetch('https://api.openrouteservice.org/v2/directions/driving-car', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: orsApiKey,
        },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        return null;
    }

    const data = await response.json();
    const segment = data?.features?.[0];
    if (!segment) return null;

    const distanceKm = (segment.properties?.summary?.distance || 0) / 1000;
    const durationSec = segment.properties?.summary?.duration || 0;
    const estimatedTimeMin = Math.round(durationSec / 60);

    const coords = segment.geometry?.coordinates || [];
    const path = coords.map(([lng, lat]) => ({ lat, lng }));

    return { distanceKm, estimatedTimeMin, path };
}

async function callGoogle(start, end) {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) return null;
    if (!start || !end || start.lat == null || start.lng == null || end.lat == null || end.lng == null) {
        return null;
    }

    const origin = `${start.lat},${start.lng}`;
    const destination = `${end.lat},${end.lng}`;

    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&mode=driving&key=${apiKey}`;

    const res = await fetch(url);
    if (!res.ok) return null;

    const data = await res.json();
    const leg = data.routes?.[0]?.legs?.[0];
    if (!leg) return null;

    const distanceKm = (leg.distance?.value || 0) / 1000;
    const estimatedTimeMin = Math.round((leg.duration?.value || 0) / 60);

    // Here we keep a simple path; frontend can call Google directly if it needs full polyline
    const path = [start, end];

    return { distanceKm, estimatedTimeMin, path };
}

async function callMapbox(start, end) {
    const token = process.env.MAPBOX_ACCESS_TOKEN;
    if (!token) return null;
    if (!start || !end || start.lat == null || start.lng == null || end.lat == null || end.lng == null) {
        return null;
    }

    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${start.lng},${start.lat};${end.lng},${end.lat}?geometries=geojson&access_token=${token}`;

    const res = await fetch(url);
    if (!res.ok) return null;

    const data = await res.json();
    const route = data.routes?.[0];
    if (!route) return null;

    const distanceKm = (route.distance || 0) / 1000;
    const estimatedTimeMin = Math.round((route.duration || 0) / 60);

    const coords = route.geometry?.coordinates || [];
    const path = coords.map(([lng, lat]) => ({ lat, lng }));

    return { distanceKm, estimatedTimeMin, path };
}

export async function getRoute(start, end) {
    if (!start || !end) return null;

    if (PROVIDER === 'GOOGLE') {
        return callGoogle(start, end);
    }

    if (PROVIDER === 'MAPBOX') {
        return callMapbox(start, end);
    }

    return callORS(start, end);
}
