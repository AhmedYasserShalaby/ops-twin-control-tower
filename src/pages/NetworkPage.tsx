import { PageShell } from '../app/AppShell'
import { operationsNetwork } from '../data/network'
import { formatNumber } from '../domain/format'
import { ReactFlow, Background, Controls, type Edge, type Node } from '@xyflow/react'

export function NetworkPage() {
  const nodes: Node[] = [
    ...operationsNetwork.suppliers.map((supplier, index) => ({
      id: supplier.id,
      data: { label: `${supplier.name}\n${supplier.region}` },
      position: { x: 0, y: index * 110 },
      style: nodeStyle('#e7f7f0'),
      type: 'default',
    })),
    ...operationsNetwork.warehouses.map((warehouse, index) => ({
      id: warehouse.id,
      data: { label: `${warehouse.name}\n${warehouse.region}` },
      position: { x: 360, y: index * 145 + 30 },
      style: nodeStyle('#eef4fb'),
      type: 'default',
    })),
    ...operationsNetwork.customerRegions.map((customer, index) => ({
      id: customer.id,
      data: { label: customer.name },
      position: { x: 760, y: index * 145 + 50 },
      style: nodeStyle('#fff4df'),
      type: 'default',
    })),
  ]

  const laneEdges: Edge[] = operationsNetwork.lanes.map((lane) => ({
    id: lane.id,
    animated: lane.reliability < 0.88,
    data: lane,
    label: `${lane.mode} | ${formatNumber(lane.reliability * 100)}%`,
    source: lane.from,
    target: lane.to,
    style: { stroke: lane.reliability < 0.88 ? '#e85d3f' : '#009b77', strokeWidth: 2 },
  }))

  const demandEdges: Edge[] = operationsNetwork.customerRegions.flatMap((customer) =>
    operationsNetwork.warehouses.map((warehouse) => ({
      id: `${warehouse.id}-${customer.id}`,
      label: `target ${customer.serviceTarget}%`,
      source: warehouse.id,
      target: customer.id,
      style: { stroke: '#94a39a', strokeDasharray: '6 6', strokeWidth: 1.5 },
    })),
  )

  return (
    <PageShell eyebrow="Operational Graph" title="Network risk map">
      <section className="control-surface h-[620px] overflow-hidden rounded-md">
        <ReactFlow
          edges={[...laneEdges, ...demandEdges]}
          fitView
          nodes={nodes}
          nodesDraggable={false}
          proOptions={{ hideAttribution: true }}
        >
          <Background />
          <Controls />
        </ReactFlow>
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
        <div className="control-surface rounded-md p-4">
          <h2 className="text-xl font-semibold">Supplier exposure</h2>
          <div className="mt-4 space-y-3">
            {operationsNetwork.suppliers.map((supplier) => (
              <div key={supplier.id} className="rounded-md border border-[#13201b]/10 p-3">
                <div className="flex justify-between gap-3">
                  <strong>{supplier.name}</strong>
                  <span className="text-sm font-bold uppercase text-[#66756b]">{supplier.riskTier}</span>
                </div>
                <p className="mt-1 text-sm text-[#5d6b63]">
                  Reliability {formatNumber(supplier.reliability * 100)}% | lead time {supplier.leadTimeWeeks} weeks
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="control-surface rounded-md p-4">
          <h2 className="text-xl font-semibold">Warehouse capacity</h2>
          <div className="mt-4 space-y-3">
            {operationsNetwork.warehouses.map((warehouse) => (
              <div key={warehouse.id} className="rounded-md border border-[#13201b]/10 p-3">
                <strong>{warehouse.name}</strong>
                <p className="mt-1 text-sm text-[#5d6b63]">
                  {warehouse.region} | {formatNumber(warehouse.capacityUnits)} unit capacity
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="control-surface rounded-md p-4">
          <h2 className="text-xl font-semibold">Product families</h2>
          <div className="mt-4 space-y-3">
            {operationsNetwork.products.map((product) => (
              <div key={product.id} className="rounded-md border border-[#13201b]/10 p-3">
                <strong>{product.name}</strong>
                <p className="mt-1 text-sm text-[#5d6b63]">
                  Demand {formatNumber(product.baseWeeklyDemand)}/week | margin{' '}
                  {formatNumber(product.unitPrice - product.unitCost)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  )
}

function nodeStyle(background: string) {
  return {
    background,
    border: '1px solid rgba(19,32,27,0.18)',
    borderRadius: 8,
    color: '#13201b',
    fontSize: 13,
    fontWeight: 700,
    padding: 12,
    whiteSpace: 'pre-line' as const,
    width: 190,
  }
}
