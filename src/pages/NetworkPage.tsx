import { PageShell } from '../app/AppShell'
import { operationsNetwork } from '../data/network'
import { formatNumber } from '../domain/format'
import { ReactFlow, Background, Controls, type Edge, type Node } from '@xyflow/react'
import { useState } from 'react'

export function NetworkPage() {
  const [selected, setSelected] = useState<string | null>(null)

  const nodes: Node[] = [
    ...operationsNetwork.suppliers.map((s, i) => ({
      id: s.id,
      data: { label: `${s.name}\n${s.region}` },
      position: { x: 0, y: i * 120 },
      style: nodeStyle('#00e5a0'),
      type: 'default' as const,
    })),
    ...operationsNetwork.warehouses.map((w, i) => ({
      id: w.id,
      data: { label: `${w.name}\n${w.region}` },
      position: { x: 400, y: i * 150 + 30 },
      style: nodeStyle('#3b82f6'),
      type: 'default' as const,
    })),
    ...operationsNetwork.customerRegions.map((c, i) => ({
      id: c.id,
      data: { label: c.name },
      position: { x: 800, y: i * 150 + 60 },
      style: nodeStyle('#ffb547'),
      type: 'default' as const,
    })),
  ]

  const laneEdges: Edge[] = operationsNetwork.lanes.map((lane) => ({
    id: lane.id,
    animated: lane.reliability < 0.88,
    label: `${lane.mode} | ${formatNumber(lane.reliability * 100)}%`,
    source: lane.from,
    target: lane.to,
    style: { stroke: lane.reliability < 0.88 ? '#ff5a5a' : '#00e5a0', strokeWidth: 2 },
  }))

  const demandEdges: Edge[] = operationsNetwork.customerRegions.flatMap((c) =>
    operationsNetwork.warehouses.map((w) => ({
      id: `${w.id}-${c.id}`,
      label: `target ${c.serviceTarget}%`,
      source: w.id,
      target: c.id,
      style: { stroke: '#64748b', strokeDasharray: '6 6', strokeWidth: 1.5 },
    })),
  )

  const selectedSupplier = operationsNetwork.suppliers.find(s => s.id === selected)
  const selectedWarehouse = operationsNetwork.warehouses.find(w => w.id === selected)
  const selectedCustomer = operationsNetwork.customerRegions.find(c => c.id === selected)

  return (
    <PageShell eyebrow="Operational Graph" title="Network risk map">
      <section className="control-surface h-[520px] overflow-hidden rounded-xl">
        <ReactFlow
          edges={[...laneEdges, ...demandEdges]}
          fitView
          nodes={nodes}
          nodesDraggable
          proOptions={{ hideAttribution: true }}
          onNodeClick={(_, node) => setSelected(node.id)}
          onPaneClick={() => setSelected(null)}
        >
          <Background gap={20} color="rgba(255,255,255,0.03)" />
          <Controls />
        </ReactFlow>
      </section>

      {/* Detail panel */}
      {selected && (selectedSupplier || selectedWarehouse || selectedCustomer) && (
        <section className="control-surface rounded-xl p-5 animate-fade-in-up">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--text-muted)] mb-1">Selected node</p>
          {selectedSupplier && (
            <div>
              <h2 className="text-lg font-bold">{selectedSupplier.name}</h2>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="badge badge-teal">{selectedSupplier.region}</span>
                <span className="badge badge-blue">Reliability {formatNumber(selectedSupplier.reliability * 100)}%</span>
                <span className="badge badge-amber">Lead {selectedSupplier.leadTimeWeeks}w</span>
                <span className={`badge ${selectedSupplier.riskTier === 'high' ? 'badge-red' : selectedSupplier.riskTier === 'medium' ? 'badge-amber' : 'badge-teal'}`}>{selectedSupplier.riskTier} risk</span>
              </div>
              <p className="mt-2 text-sm text-[var(--text-muted)]">Products: {selectedSupplier.products.join(', ')}</p>
            </div>
          )}
          {selectedWarehouse && (
            <div>
              <h2 className="text-lg font-bold">{selectedWarehouse.name}</h2>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="badge badge-blue">{selectedWarehouse.region}</span>
                <span className="badge badge-teal">{formatNumber(selectedWarehouse.capacityUnits)} units capacity</span>
              </div>
            </div>
          )}
          {selectedCustomer && (
            <div>
              <h2 className="text-lg font-bold">{selectedCustomer.name}</h2>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="badge badge-amber">Target {selectedCustomer.serviceTarget}%</span>
                <span className="badge badge-blue">Priority {formatNumber(selectedCustomer.priority * 100)}%</span>
              </div>
            </div>
          )}
        </section>
      )}

      {/* Legend */}
      <section className="control-surface rounded-xl p-5">
        <h2 className="text-lg font-bold mb-3">Legend</h2>
        <div className="flex flex-wrap gap-4 text-sm text-[var(--text-muted)]">
          <span className="flex items-center gap-2"><span className="size-3 rounded-sm" style={{ background: '#00e5a0' }} /> Suppliers</span>
          <span className="flex items-center gap-2"><span className="size-3 rounded-sm" style={{ background: '#3b82f6' }} /> Warehouses</span>
          <span className="flex items-center gap-2"><span className="size-3 rounded-sm" style={{ background: '#ffb547' }} /> Customers</span>
          <span className="flex items-center gap-2"><span className="w-5 h-0.5" style={{ background: '#00e5a0' }} /> Reliable lane</span>
          <span className="flex items-center gap-2"><span className="w-5 h-0.5" style={{ background: '#ff5a5a' }} /> Risky lane (animated)</span>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
        <div className="control-surface rounded-xl p-5">
          <h2 className="text-lg font-bold mb-3">Supplier exposure</h2>
          <div className="space-y-3">{operationsNetwork.suppliers.map(s => (
            <div key={s.id} className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-3 interactive-card cursor-pointer" onClick={() => setSelected(s.id)}>
              <div className="flex justify-between gap-3">
                <strong className="text-sm">{s.name}</strong>
                <span className={`badge ${s.riskTier === 'high' ? 'badge-red' : s.riskTier === 'medium' ? 'badge-amber' : 'badge-teal'}`}>{s.riskTier}</span>
              </div>
              <p className="mt-1 text-xs text-[var(--text-muted)]">Reliability {formatNumber(s.reliability * 100)}% · {s.leadTimeWeeks}w lead</p>
            </div>
          ))}</div>
        </div>
        <div className="control-surface rounded-xl p-5">
          <h2 className="text-lg font-bold mb-3">Warehouse capacity</h2>
          <div className="space-y-3">{operationsNetwork.warehouses.map(w => (
            <div key={w.id} className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-3 interactive-card cursor-pointer" onClick={() => setSelected(w.id)}>
              <strong className="text-sm">{w.name}</strong>
              <p className="mt-1 text-xs text-[var(--text-muted)]">{w.region} · {formatNumber(w.capacityUnits)} units</p>
            </div>
          ))}</div>
        </div>
        <div className="control-surface rounded-xl p-5">
          <h2 className="text-lg font-bold mb-3">Product families</h2>
          <div className="space-y-3">{operationsNetwork.products.map(p => (
            <div key={p.id} className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-3">
              <strong className="text-sm">{p.name}</strong>
              <p className="mt-1 text-xs text-[var(--text-muted)]">Demand {formatNumber(p.baseWeeklyDemand)}/wk · margin ${formatNumber(p.unitPrice - p.unitCost)}</p>
            </div>
          ))}</div>
        </div>
      </section>
    </PageShell>
  )
}

function nodeStyle(accentColor: string) {
  return {
    background: 'var(--bg-elevated)',
    border: `1.5px solid ${accentColor}40`,
    borderRadius: 10,
    color: 'var(--text-primary)',
    fontSize: 12,
    fontWeight: 600,
    padding: 14,
    whiteSpace: 'pre-line' as const,
    width: 180,
  }
}
