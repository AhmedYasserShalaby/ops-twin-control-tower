export type RiskTier = 'low' | 'medium' | 'high' | 'critical'

export type ScenarioEventType =
  | 'demand_spike'
  | 'supplier_delay'
  | 'logistics_failure'
  | 'warehouse_capacity'
  | 'cash_constraint'
  | 'data_quality'

export type DecisionActionType =
  | 'increase_safety_stock'
  | 'diversify_supplier'
  | 'expedite_shipping'
  | 'warehouse_rebalance'
  | 'demand_shaping'

export interface Supplier {
  id: string
  name: string
  region: string
  reliability: number
  leadTimeWeeks: number
  costIndex: number
  riskTier: RiskTier
  products: string[]
}

export interface Warehouse {
  id: string
  name: string
  region: string
  capacityUnits: number
  startingInventory: Record<string, number>
  operatingCostPerUnit: number
}

export interface Product {
  id: string
  name: string
  category: string
  unitPrice: number
  unitCost: number
  baseWeeklyDemand: number
  holdingCostPerWeek: number
  primarySupplierId: string
}

export interface CustomerRegion {
  id: string
  name: string
  demandMultiplier: number
  priority: number
  serviceTarget: number
}

export interface Lane {
  id: string
  from: string
  to: string
  mode: 'ocean' | 'air' | 'road' | 'rail'
  costPerUnit: number
  leadTimeWeeks: number
  reliability: number
  carbonIndex: number
}

export interface OperationsNetwork {
  suppliers: Supplier[]
  warehouses: Warehouse[]
  products: Product[]
  customerRegions: CustomerRegion[]
  lanes: Lane[]
}

export interface Policy {
  safetyStockWeeks: number
  reorderPointMultiplier: number
  expeditedShippingRate: number
  supplierDiversification: number
  warehouseRebalanceRate: number
  demandShaping: number
}

export interface ScenarioEvent {
  id: string
  type: ScenarioEventType
  name: string
  week: number
  durationWeeks: number
  severity: number
  targetId?: string
  description: string
}

export interface DecisionAction {
  id: string
  type: DecisionActionType
  name: string
  week: number
  intensity: number
  description: string
}

export interface WeeklyMetric {
  week: number
  demandUnits: number
  fulfilledUnits: number
  lostSalesUnits: number
  serviceLevel: number
  revenue: number
  grossMargin: number
  holdingCost: number
  expediteCost: number
  operatingCost: number
  profit: number
  cashBalance: number
  inventoryUnits: number
  inventoryValue: number
  stockoutIncidents: number
  delayDays: number
  riskScore: number
  dataQualityScore: number
  carbonIndex: number
}

export interface SimulationSummary {
  serviceLevel: number
  totalRevenue: number
  totalProfit: number
  endingCash: number
  stockoutIncidents: number
  averageRiskScore: number
  averageDataQualityScore: number
  inventoryTurnover: number
  carbonIndex: number
}

export interface RiskFinding {
  id: string
  tier: RiskTier
  area: 'supplier' | 'inventory' | 'logistics' | 'cash' | 'data'
  title: string
  description: string
  week: number
  score: number
}

export interface SimulationRun {
  id: string
  seed: number
  weeks: WeeklyMetric[]
  summary: SimulationSummary
  findings: RiskFinding[]
  events: ScenarioEvent[]
  decisions: DecisionAction[]
  policy: Policy
}

export interface AdvisorRecommendation {
  action: DecisionAction
  expectedProfitDelta: number
  expectedServiceDelta: number
  expectedRiskDelta: number
  expectedCashDelta: number
  score: number
  rationale: string
}

export interface MonteCarloResult {
  runs: SimulationRun[]
  p10Profit: number
  p50Profit: number
  p90Profit: number
  averageServiceLevel: number
  worstCaseRisk: number
}

export interface PostmortemReport {
  title: string
  rootCause: string
  impact: string
  decisions: string[]
  prevention: string[]
  executiveSummary: string
}
