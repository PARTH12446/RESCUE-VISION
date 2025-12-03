export type DisasterType = 'earthquake' | 'flood' | 'hurricane' | 'wildfire' | 'tsunami';

export type SeverityLevel = 'low' | 'moderate' | 'high' | 'critical';

export type ResourceType = 'medical' | 'food' | 'shelter' | 'rescue' | 'transport';

export interface DisasterPrediction {
  id: string;
  type: DisasterType;
  location: string;
  coordinates: { lat: number; lng: number };
  probability: number;
  severity: SeverityLevel;
  predictedTime: Date;
  affectedPopulation: number;
  riskScore: number;
}

export interface Resource {
  id: string;
  type: ResourceType;
  name: string;
  quantity: number;
  available: number;
  location: string;
  status: 'available' | 'deployed' | 'in-transit';
}

export interface Alert {
  id: string;
  type: DisasterType;
  severity: SeverityLevel;
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  location: string;
}

export interface DashboardStats {
  activeAlerts: number;
  predictedDisasters: number;
  resourcesDeployed: number;
  populationAtRisk: number;
  responseTeams: number;
  successRate: number;
}
