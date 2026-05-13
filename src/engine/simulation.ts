import { operationsNetwork, baselinePolicy, defaultDecisionActions, defaultScenarioEvents } from '../data/network'
import { clamp } from '../domain/format'
import type {
  DecisionAction,
  OperationsNetwork,
  Policy,
  RiskFinding,
  ScenarioEvent,
  SimulationRun,
  SimulationSummary,
  WeeklyMetric,
} from '../domain/types'
import { createSeededRandom, jitter } from './random'

export interface SimulationInput {
  decisions?: DecisionAction[]
  events?: ScenarioEvent[]
  network?: OperationsNetwork
  policy?: Policy
  seed?: number
  weeks?: number
}

const defaultInput = {
  decisions: defaultDecisionActions,
  events: defaultScenarioEvents,
  network: operationsNetwork,
  policy: baselinePolicy,
  seed: 42,
  weeks: 26,
}

export function runSimulation(input: SimulationInput = {}): SimulationRun {
  const network = input.network ?? defaultInput.network
  const policy = input.policy ?? defaultInput.policy
  const events = input.events ?? defaultInput.events
  const decisions = input.decisions ?? defaultInput.decisions
  const seed = input.seed ?? defaultInput.seed
  const weeks = input.weeks ?? defaultInput.weeks
  const random = createSeededRandom(seed)
  const inventory = createStartingInventory(network)
  const metrics: WeeklyMetric[] = []
  const findings: RiskFinding[] = []
  let cashBalance = 1_850_000

  for (let week = 1; week <= weeks; week += 1) {
    const activeEvents = events.filter((event) => isActive(event, week))
    const activeDecisions = decisions.filter((decision) => decision.week <= week)
    const policyState = applyDecisionPolicy(policy, activeDecisions)
    const eventState = summarizeEvents(activeEvents)
    const demandPressure = 1 + eventState.demandSpike - policyState.demandShaping * 0.22
    const dataQualityScore = clamp(98 - eventState.dataQuality * 34 - activeEvents.length * 0.8, 42, 100)

    let demandUnits = 0
    let fulfilledUnits = 0
    let lostSalesUnits = 0
    let revenue = 0
    let grossMargin = 0
    let holdingCost = 0
    let expediteCost = 0
    let operatingCost = 0
    let delayDays = 0
    let carbonIndex = 0

    for (const product of network.products) {
      const supplier = network.suppliers.find((item) => item.id === product.primarySupplierId)
      const supplierDelay = supplier ? eventState.supplierDelayById[supplier.id] ?? 0 : 0
      const weeklyDemand = Math.round(
        product.baseWeeklyDemand *
          demandPressure *
          seasonalCurve(week) *
          jitter(random, 0.16),
      )
      const inventoryKey = product.id
      const productInventory = inventory[inventoryKey] ?? 0
      const fulfillmentRate = clamp(
        0.78 + policyState.safetyStockWeeks * 0.06 + policyState.expeditedShippingRate * 0.3 - supplierDelay * 0.32,
        0.42,
        0.99,
      )
      const effectiveInventory = Math.min(productInventory, Math.ceil(weeklyDemand * fulfillmentRate))
      const fulfilled = Math.min(weeklyDemand, effectiveInventory)
      const lost = weeklyDemand - fulfilled
      const replenishment = Math.round(
        product.baseWeeklyDemand *
          (0.82 + policyState.reorderPointMultiplier * 0.18 + policyState.supplierDiversification * 0.12) *
          (1 - supplierDelay * 0.35) *
          jitter(random, 0.1),
      )
      const diversifiedRecovery = Math.round(product.baseWeeklyDemand * policyState.supplierDiversification * 0.14)
      const rebalanceRecovery = Math.round(lost * policyState.warehouseRebalanceRate * 0.44)
      const expeditedRecovery = Math.round(lost * policyState.expeditedShippingRate * 0.5)
      const recovered = Math.min(lost, diversifiedRecovery + rebalanceRecovery + expeditedRecovery)

      demandUnits += weeklyDemand
      fulfilledUnits += fulfilled + recovered
      lostSalesUnits += Math.max(0, lost - recovered)
      revenue += (fulfilled + recovered) * product.unitPrice
      grossMargin += (fulfilled + recovered) * (product.unitPrice - product.unitCost)
      inventory[inventoryKey] = Math.max(0, productInventory - fulfilled + replenishment + diversifiedRecovery)
      holdingCost += inventory[inventoryKey] * product.holdingCostPerWeek
      expediteCost += expeditedRecovery * product.unitPrice * 0.13
      delayDays += Math.round((supplier?.leadTimeWeeks ?? 2) * supplierDelay * 4)
      carbonIndex += expeditedRecovery * 0.12 + replenishment * averageLaneCarbon(network, supplier?.id)
    }

    const inventoryUnits = Object.values(inventory).reduce((sum, value) => sum + value, 0)
    const inventoryValue = network.products.reduce(
      (sum, product) => sum + (inventory[product.id] ?? 0) * product.unitCost,
      0,
    )
    holdingCost += inventoryValue * 0.002
    operatingCost += inventoryUnits * averageWarehouseCost(network)
    const stockoutIncidents = network.products.filter((product) => (inventory[product.id] ?? 0) < product.baseWeeklyDemand * 0.42).length
    const riskScore = clamp(
      28 +
        eventState.totalSeverity * 36 +
        stockoutIncidents * 9 +
        (100 - dataQualityScore) * 0.22 -
        policyState.supplierDiversification * 9 -
        policyState.warehouseRebalanceRate * 5,
      0,
      100,
    )
    const serviceLevel = demandUnits > 0 ? clamp((fulfilledUnits / demandUnits) * 100, 0, 100) : 100
    const profit = grossMargin - holdingCost - expediteCost - operatingCost
    cashBalance += profit - inventoryValue * 0.005 - eventState.cashConstraint * 34_000

    const metric: WeeklyMetric = {
      carbonIndex: Math.round(carbonIndex / 1_000),
      cashBalance,
      dataQualityScore,
      delayDays,
      demandUnits,
      expediteCost,
      fulfilledUnits,
      grossMargin,
      holdingCost,
      inventoryUnits,
      inventoryValue,
      lostSalesUnits,
      operatingCost,
      profit,
      revenue,
      riskScore,
      serviceLevel,
      stockoutIncidents,
      week,
    }
    metrics.push(metric)
    findings.push(...createFindings(metric, activeEvents))
  }

  return {
    decisions,
    events,
    findings,
    id: `run-${seed}-${weeks}-${events.length}-${decisions.length}`,
    policy,
    seed,
    summary: summarize(metrics),
    weeks: metrics,
  }
}

function createStartingInventory(network: OperationsNetwork) {
  return network.warehouses.reduce<Record<string, number>>((inventory, warehouse) => {
    Object.entries(warehouse.startingInventory).forEach(([productId, units]) => {
      inventory[productId] = (inventory[productId] ?? 0) + units
    })
    return inventory
  }, {})
}

function isActive(event: ScenarioEvent, week: number) {
  return week >= event.week && week < event.week + event.durationWeeks
}

function summarizeEvents(events: ScenarioEvent[]) {
  return events.reduce(
    (state, event) => {
      state.totalSeverity += event.severity
      if (event.type === 'demand_spike') state.demandSpike += event.severity
      if (event.type === 'logistics_failure') state.logisticsFailure += event.severity
      if (event.type === 'cash_constraint') state.cashConstraint += event.severity
      if (event.type === 'data_quality') state.dataQuality += event.severity
      if (event.type === 'warehouse_capacity') state.warehouseCapacity += event.severity
      if (event.type === 'supplier_delay' && event.targetId) {
        state.supplierDelayById[event.targetId] = (state.supplierDelayById[event.targetId] ?? 0) + event.severity
      }
      return state
    },
    {
      cashConstraint: 0,
      dataQuality: 0,
      demandSpike: 0,
      logisticsFailure: 0,
      supplierDelayById: {} as Record<string, number>,
      totalSeverity: 0,
      warehouseCapacity: 0,
    },
  )
}

function applyDecisionPolicy(policy: Policy, decisions: DecisionAction[]): Policy {
  return decisions.reduce<Policy>((next, decision) => {
    const amount = decision.intensity
    if (decision.type === 'increase_safety_stock') next.safetyStockWeeks += amount * 0.85
    if (decision.type === 'diversify_supplier') next.supplierDiversification += amount * 0.5
    if (decision.type === 'expedite_shipping') next.expeditedShippingRate += amount * 0.34
    if (decision.type === 'warehouse_rebalance') next.warehouseRebalanceRate += amount * 0.42
    if (decision.type === 'demand_shaping') next.demandShaping += amount * 0.38
    return {
      demandShaping: clamp(next.demandShaping, 0, 0.7),
      expeditedShippingRate: clamp(next.expeditedShippingRate, 0, 0.72),
      reorderPointMultiplier: clamp(next.reorderPointMultiplier, 0.82, 1.6),
      safetyStockWeeks: clamp(next.safetyStockWeeks, 0.8, 5),
      supplierDiversification: clamp(next.supplierDiversification, 0, 0.86),
      warehouseRebalanceRate: clamp(next.warehouseRebalanceRate, 0, 0.8),
    }
  }, { ...policy })
}

function seasonalCurve(week: number) {
  return 1 + Math.sin((week / 26) * Math.PI * 2) * 0.08
}

function averageWarehouseCost(network: OperationsNetwork) {
  return network.warehouses.reduce((sum, warehouse) => sum + warehouse.operatingCostPerUnit, 0) / network.warehouses.length
}

function averageLaneCarbon(network: OperationsNetwork, supplierId?: string) {
  const lanes = supplierId ? network.lanes.filter((lane) => lane.from === supplierId) : network.lanes
  const pool = lanes.length > 0 ? lanes : network.lanes
  return pool.reduce((sum, lane) => sum + lane.carbonIndex, 0) / Math.max(1, pool.length)
}

function summarize(metrics: WeeklyMetric[]): SimulationSummary {
  const totalRevenue = sum(metrics, 'revenue')
  const totalProfit = sum(metrics, 'profit')
  const totalDemand = sum(metrics, 'demandUnits')
  const totalFulfilled = sum(metrics, 'fulfilledUnits')
  const averageInventoryValue = sum(metrics, 'inventoryValue') / metrics.length

  return {
    averageDataQualityScore: average(metrics, 'dataQualityScore'),
    averageRiskScore: average(metrics, 'riskScore'),
    carbonIndex: average(metrics, 'carbonIndex'),
    endingCash: metrics.at(-1)?.cashBalance ?? 0,
    inventoryTurnover: averageInventoryValue > 0 ? totalRevenue / averageInventoryValue : 0,
    serviceLevel: totalDemand > 0 ? (totalFulfilled / totalDemand) * 100 : 100,
    stockoutIncidents: sum(metrics, 'stockoutIncidents'),
    totalProfit,
    totalRevenue,
  }
}

function createFindings(metric: WeeklyMetric, events: ScenarioEvent[]): RiskFinding[] {
  const findings: RiskFinding[] = []
  if (metric.serviceLevel < 90) {
    findings.push({
      area: 'inventory',
      description: `Service level fell to ${metric.serviceLevel.toFixed(1)}% as stockouts increased.`,
      id: `inventory-${metric.week}`,
      score: 100 - metric.serviceLevel,
      tier: metric.serviceLevel < 82 ? 'critical' : 'high',
      title: 'Service level breach',
      week: metric.week,
    })
  }
  if (metric.cashBalance < 1_000_000) {
    findings.push({
      area: 'cash',
      description: 'Cash balance is below the resilience buffer needed for recovery actions.',
      id: `cash-${metric.week}`,
      score: 75,
      tier: 'high',
      title: 'Cash buffer pressure',
      week: metric.week,
    })
  }
  if (metric.dataQualityScore < 92) {
    findings.push({
      area: 'data',
      description: 'Planning confidence dropped because operational data quality is degraded.',
      id: `data-${metric.week}`,
      score: 100 - metric.dataQualityScore,
      tier: metric.dataQualityScore < 80 ? 'critical' : 'medium',
      title: 'Planning data quality drift',
      week: metric.week,
    })
  }
  events
    .filter((event) => event.type === 'supplier_delay' || event.type === 'logistics_failure')
    .forEach((event) => {
      findings.push({
        area: event.type === 'supplier_delay' ? 'supplier' : 'logistics',
        description: event.description,
        id: `${event.id}-${metric.week}`,
        score: event.severity * 100,
        tier: event.severity > 0.4 ? 'high' : 'medium',
        title: event.name,
        week: metric.week,
      })
    })
  return findings
}

function average(metrics: WeeklyMetric[], key: keyof WeeklyMetric) {
  return sum(metrics, key) / metrics.length
}

function sum(metrics: WeeklyMetric[], key: keyof WeeklyMetric) {
  return metrics.reduce((total, metric) => total + Number(metric[key]), 0)
}
