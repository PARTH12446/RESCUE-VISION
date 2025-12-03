import { DisasterPrediction, Resource, Alert, DashboardStats } from '@/types/disaster';

export const mockPredictions: DisasterPrediction[] = [
  {
    id: '1',
    type: 'earthquake',
    location: 'San Francisco, CA',
    coordinates: { lat: 37.7749, lng: -122.4194 },
    probability: 0.78,
    severity: 'high',
    predictedTime: new Date(Date.now() + 86400000 * 3),
    affectedPopulation: 850000,
    riskScore: 8.2,
  },
  {
    id: '2',
    type: 'flood',
    location: 'Miami, FL',
    coordinates: { lat: 25.7617, lng: -80.1918 },
    probability: 0.92,
    severity: 'critical',
    predictedTime: new Date(Date.now() + 86400000),
    affectedPopulation: 1200000,
    riskScore: 9.1,
  },
  {
    id: '3',
    type: 'hurricane',
    location: 'Houston, TX',
    coordinates: { lat: 29.7604, lng: -95.3698 },
    probability: 0.65,
    severity: 'moderate',
    predictedTime: new Date(Date.now() + 86400000 * 5),
    affectedPopulation: 650000,
    riskScore: 6.8,
  },
  {
    id: '4',
    type: 'wildfire',
    location: 'Los Angeles, CA',
    coordinates: { lat: 34.0522, lng: -118.2437 },
    probability: 0.85,
    severity: 'high',
    predictedTime: new Date(Date.now() + 86400000 * 2),
    affectedPopulation: 420000,
    riskScore: 7.9,
  },
  {
    id: '5',
    type: 'tsunami',
    location: 'Seattle, WA',
    coordinates: { lat: 47.6062, lng: -122.3321 },
    probability: 0.45,
    severity: 'moderate',
    predictedTime: new Date(Date.now() + 86400000 * 7),
    affectedPopulation: 380000,
    riskScore: 5.4,
  },
];

export const mockResources: Resource[] = [
  { id: '1', type: 'medical', name: 'Emergency Medical Units', quantity: 150, available: 89, location: 'Regional Hub A', status: 'available' },
  { id: '2', type: 'food', name: 'Food Supply Kits', quantity: 50000, available: 32000, location: 'Warehouse B', status: 'available' },
  { id: '3', type: 'shelter', name: 'Emergency Tents', quantity: 2000, available: 1200, location: 'Storage C', status: 'deployed' },
  { id: '4', type: 'rescue', name: 'Search & Rescue Teams', quantity: 45, available: 28, location: 'Base Station D', status: 'available' },
  { id: '5', type: 'transport', name: 'Evacuation Vehicles', quantity: 200, available: 156, location: 'Fleet Center E', status: 'in-transit' },
  { id: '6', type: 'medical', name: 'Mobile Hospitals', quantity: 12, available: 8, location: 'Medical Reserve', status: 'available' },
];

export const mockAlerts: Alert[] = [
  {
    id: '1',
    type: 'flood',
    severity: 'critical',
    title: 'Flash Flood Warning',
    message: 'Severe flooding expected in Miami coastal areas. Immediate evacuation recommended.',
    timestamp: new Date(Date.now() - 3600000),
    isRead: false,
    location: 'Miami, FL',
  },
  {
    id: '2',
    type: 'earthquake',
    severity: 'high',
    title: 'Seismic Activity Detected',
    message: 'Elevated seismic activity detected along San Andreas Fault. Prepare emergency kits.',
    timestamp: new Date(Date.now() - 7200000),
    isRead: false,
    location: 'San Francisco, CA',
  },
  {
    id: '3',
    type: 'wildfire',
    severity: 'high',
    title: 'Wildfire Risk Elevated',
    message: 'Extreme fire conditions expected. Red flag warning in effect.',
    timestamp: new Date(Date.now() - 14400000),
    isRead: true,
    location: 'Los Angeles, CA',
  },
  {
    id: '4',
    type: 'hurricane',
    severity: 'moderate',
    title: 'Tropical Storm Forming',
    message: 'Tropical depression may strengthen. Monitor updates closely.',
    timestamp: new Date(Date.now() - 28800000),
    isRead: true,
    location: 'Gulf of Mexico',
  },
];

export const mockDashboardStats: DashboardStats = {
  activeAlerts: 4,
  predictedDisasters: 12,
  resourcesDeployed: 847,
  populationAtRisk: 3500000,
  responseTeams: 156,
  successRate: 94.7,
};

export const historicalData = [
  { month: 'Jan', predictions: 8, actual: 7, accuracy: 87.5 },
  { month: 'Feb', predictions: 12, actual: 10, accuracy: 83.3 },
  { month: 'Mar', predictions: 15, actual: 14, accuracy: 93.3 },
  { month: 'Apr', predictions: 9, actual: 9, accuracy: 100 },
  { month: 'May', predictions: 18, actual: 16, accuracy: 88.9 },
  { month: 'Jun', predictions: 22, actual: 21, accuracy: 95.5 },
];

export const resourceAllocationData = [
  { name: 'Medical', allocated: 65, total: 100 },
  { name: 'Food', allocated: 78, total: 100 },
  { name: 'Shelter', allocated: 45, total: 100 },
  { name: 'Rescue', allocated: 82, total: 100 },
  { name: 'Transport', allocated: 56, total: 100 },
];
