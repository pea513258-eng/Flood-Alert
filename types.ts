export interface GeoLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
}

export interface AnalysisResult {
  peopleCount: number;
  animalCount: number;
  hasVulnerable: boolean; // Elderly, disabled, children, cannot help themselves
  urgency: 'Low' | 'Medium' | 'High' | 'Critical';
  reasoning: string; // Why is it this urgency?
  description: string; // Brief description of the scene
}

export interface FloodReport {
  id: string;
  image: string | null; // Base64
  location: GeoLocation | null;
  timestamp: number;
  analysis: AnalysisResult | null;
  userNotes?: string;
  status: 'draft' | 'analyzing' | 'submitted';
}

export enum ReportStatus {
  DRAFT = 'draft',
  ANALYZING = 'analyzing',
  CONFIRMING = 'confirming',
  SUBMITTED = 'submitted',
  ERROR = 'error'
}