export const presetQueries = [
  {
    label: 'Worst service weeks',
    sql: 'select week, serviceLevel, lostSalesUnits, riskScore from weekly_metrics order by serviceLevel asc limit 8',
  },
  {
    label: 'Profit by risk band',
    sql: "select case when riskScore >= 65 then 'high' when riskScore >= 45 then 'medium' else 'low' end as risk_band, round(sum(profit), 0) as profit from weekly_metrics group by 1 order by profit",
  },
  {
    label: 'Active disruptions',
    sql: 'select week, name, type, severity, durationWeeks from scenario_events order by week',
  },
  {
    label: 'Carbon vs Profit Efficiency',
    sql: 'select week, profit, carbonIndex, round(profit / nullif(carbonIndex, 0), 2) as profit_per_co2_unit from weekly_metrics order by profit_per_co2_unit desc',
  },
  {
    label: 'Bottleneck Diagnostic',
    sql: 'select week, stockoutIncidents, holdingCost, expediteCost, profit, case when stockoutIncidents > 2 then \'Stockout Alert\' when holdingCost > 1500 then \'High Holding Cost\' else \'Optimal\' end as diagnostic_flag from weekly_metrics order by week',
  },
  {
    label: 'Disruption Cost Correlation',
    sql: 'select e.name, e.type, sum(m.lostSalesUnits) as total_lost_sales, sum(m.expediteCost) as total_expedite_cost, round(avg(m.riskScore), 1) as avg_risk_score from scenario_events e join weekly_metrics m on m.week between e.week and (e.week + e.durationWeeks - 1) group by e.name, e.type order by total_lost_sales desc',
  },
]

