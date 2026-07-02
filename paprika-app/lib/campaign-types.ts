export type AdsPlatform = 'google_ads' | 'meta_ads' | 'unknown';

export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info';

export type CampaignRow = {
  sourceRow: number;
  platform: AdsPlatform;
  date?: string;
  account?: string;
  campaign?: string;
  adGroup?: string;
  ad?: string;
  keyword?: string;
  searchTerm?: string;
  status?: string;
  currency?: string;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  conversionValue: number;
  ctr: number;
  cpc: number;
  cpm: number;
  conversionRate: number;
  roas: number;
  frequency: number;
  raw: Record<string, string>;
};

export type Recommendation = {
  id: string;
  platform: AdsPlatform;
  severity: Severity;
  category:
    | 'tracking'
    | 'budget'
    | 'search_terms'
    | 'keywords'
    | 'creative'
    | 'audience'
    | 'bidding'
    | 'landing_page'
    | 'measurement'
    | 'structure';
  title: string;
  explanation: string;
  evidence: string[];
  expectedImpact: string;
  confidence: number;
  requiresApproval: true;
  rollbackPlan: string;
  entityName?: string;
  suggestedAction?: string;
};

export type AnalysisSummary = {
  platform: AdsPlatform;
  rowCount: number;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  conversionValue: number;
  ctr: number;
  cpc: number;
  cpm: number;
  conversionRate: number;
  roas: number;
  recommendations: Recommendation[];
  warnings: string[];
  detectedColumns: string[];
};

export type ImportPreview = {
  headers: string[];
  rows: CampaignRow[];
  platform: AdsPlatform;
  warnings: string[];
};
