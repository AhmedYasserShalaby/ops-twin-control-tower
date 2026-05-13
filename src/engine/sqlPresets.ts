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
]
