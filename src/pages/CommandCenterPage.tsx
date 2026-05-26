import { useMemo, useState } from 'react'
import { AlertTriangle, Banknote, Boxes, Check, Gauge, ShieldAlert, Wrench, Play, Pause, RotateCcw, Sparkles } from 'lucide-react'
import { PageShell } from '../app/AppShell'
import { KpiCard } from '../components/KpiCard'
import { TrendChart } from '../components/TrendChart'
import { formatCurrency, formatNumber, formatPercent } from '../domain/format'
import { rankRecommendations } from '../engine/advisor'
import { useOpsTwinStore } from '../store/useOpsTwinStore'

export function CommandCenterPage() {
  const run = useOpsTwinStore((state) => state.run)
  const decisions = useOpsTwinStore((state) => state.decisions)
  const events = useOpsTwinStore((state) => state.events)
  const addDecision = useOpsTwinStore((state) => state.addDecision)

  // Playback store selectors
  const isPlaying = useOpsTwinStore((state) => state.isPlaying)
  const currentPlayWeek = useOpsTwinStore((state) => state.currentPlayWeek)
  const playbackSpeed = useOpsTwinStore((state) => state.playbackSpeed)
  const startPlayback = useOpsTwinStore((state) => state.startPlayback)
  const pausePlayback = useOpsTwinStore((state) => state.pausePlayback)
  const resetPlayback = useOpsTwinStore((state) => state.resetPlayback)
  const setPlaybackSpeed = useOpsTwinStore((state) => state.setPlaybackSpeed)
  const setPlayWeek = useOpsTwinStore((state) => state.setPlayWeek)

  const [applied, setApplied] = useState<string | null>(null)
  
  // AI Chat simulation state
  const [activeTab, setActiveTab] = useState<'advisor' | 'chat'>('advisor')
  const [chatLog, setChatLog] = useState<{ sender: 'user' | 'ai'; text: string }[]>([
    { sender: 'ai', text: 'Hi! I am your Operations Copilot. Select a prompt below or let me know what supply chain telemetry you want to audit.' }
  ])
  const [isTyping, setIsTyping] = useState(false)

  const recommendations = useMemo(
    () => rankRecommendations({ decisions, events }, run),
    [decisions, events, run],
  )
  const topRecommendation = recommendations[0]
  const finalWeek = run.weeks.at(-1)

  function handleApply(rec: typeof topRecommendation) {
    addDecision(rec.action)
    setApplied(rec.action.id)
    setTimeout(() => setApplied(null), 2000)
  }

  // AI chat question responses
  const askCoPilot = (question: string) => {
    setChatLog(prev => [...prev, { sender: 'user', text: question }])
    setIsTyping(true)
    
    setTimeout(() => {
      let answer = ''
      
      if (question.includes('bottlenecks')) {
        const topFinding = run.findings.find(f => f.area === 'supplier' || f.area === 'inventory')
        const stockouts = run.summary.stockoutIncidents
        answer = `Checking active runs: We have registered ${stockouts} stockout incidents. ${
          topFinding 
            ? `Our primary bottleneck is currently around the "${topFinding.title}" category triggered at Week ${topFinding.week}.` 
            : 'Operational inventory paths are stable. No heavy supplier bottlenecks flagged.'
        } I recommend diversifying high-risk suppliers under the scenarios tab.`
      } else if (question.includes('cash')) {
        const minCash = Math.min(...run.weeks.map(w => w.cashBalance))
        answer = `Our minimum projected cash dip is ${formatCurrency(minCash)}. If cash reserves fall below $1.0M, we risk liquidity lock. Safety stock increases margin holding costs by ~0.2% per week. Expediting shipments is cash-heavy, costing 13% of product value. Consider demand shaping to preserve margins.`
      } else if (question.includes('carbon')) {
        const totalCarbon = run.summary.carbonIndex
        answer = `Our current average weekly Carbon Footprint index is ${totalCarbon.toFixed(1)}k CO2e. Expedited shipping is a primary driver of carbon spikes (representing 0.12 impact per unit). Inter-lane shipping via sea and rail routes is 4x cleaner than air freight. Recommend swapping priority lanes in policy.`
      } else {
        answer = "I've reviewed the current 26-week control run. Service levels are running at " + run.summary.serviceLevel.toFixed(1) + "%. Adjust policies using the decision playbook or run Monte Carlo resilience tests to audit structural variance."
      }

      setChatLog(prev => [...prev, { sender: 'ai', text: answer }])
      setIsTyping(false)
    }, 750)
  }

  return (
    <PageShell eyebrow="Operations review" title="Command center">
      
      {/* Playback Controls Panel */}
      <section className="control-surface rounded-lg p-4 flex flex-wrap items-center justify-between gap-4 animate-fade-in-up">
        <div className="flex items-center gap-3">
          <button
            onClick={() => isPlaying ? pausePlayback() : startPlayback()}
            className="btn-primary flex items-center justify-center p-2 rounded-md size-10"
            aria-label={isPlaying ? 'Pause simulation' : 'Play simulation'}
          >
            {isPlaying ? <Pause size={18} /> : <Play size={18} />}
          </button>
          <button
            onClick={resetPlayback}
            className="btn-secondary flex items-center justify-center p-2 rounded-md size-10"
            aria-label="Reset simulation to week 26"
          >
            <RotateCcw size={18} />
          </button>
          
          <div className="h-6 w-[1px] bg-[var(--border-subtle)]" />
          
          <span className="text-sm font-bold text-[var(--text-secondary)] min-w-[120px]">
            {currentPlayWeek === 26 ? 'Completed run' : `Week ${currentPlayWeek} / 26`}
          </span>
        </div>

        {/* Progress Slider */}
        <div className="flex-1 min-w-[200px] flex items-center gap-3">
          <span className="text-xs text-[var(--text-muted)] font-mono">W1</span>
          <input
            type="range"
            min="1"
            max="26"
            value={currentPlayWeek}
            onChange={(e) => setPlayWeek(Number(e.target.value))}
            className="w-full accent-[var(--accent-teal)] h-1.5 bg-[var(--bg-elevated)] rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-xs text-[var(--text-muted)] font-mono">W26</span>
        </div>

        {/* Speed Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-extrabold uppercase text-[var(--text-muted)]">Speed</span>
          <div className="inline-flex rounded-md border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-0.5">
            {[1, 2, 4].map((speed) => (
              <button
                key={speed}
                onClick={() => setPlaybackSpeed(speed)}
                className={`px-2.5 py-1 text-xs font-bold rounded-sm transition-colors ${
                  playbackSpeed === speed
                    ? 'bg-[var(--accent-teal)] text-white'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Hero Section & Recommendations */}
      <section className="dark-surface rounded-lg p-5 sm:p-7">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-stretch">
          <div className="flex flex-col justify-between">
            <div>
              <span className="badge badge-teal">26-week model</span>
              <h2 className="mt-4 max-w-3xl text-3xl font-bold leading-tight sm:text-4xl">
                Test supply chain decisions before the cost shows up.
              </h2>
              <p className="mt-3 max-w-2xl text-base text-[var(--text-secondary)]">
                Add disruptions, choose responses, and compare service level, profit, inventory, cash, and risk.
              </p>
            </div>
            <div className="mt-4 text-xs text-[var(--text-muted)]">
              Use the play controls above to simulate chronological disruptions and playbook responses.
            </div>
          </div>

          <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] flex flex-col">
            <div className="border-b border-[var(--border-subtle)] flex">
              <button
                onClick={() => setActiveTab('advisor')}
                className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-all ${
                  activeTab === 'advisor'
                    ? 'border-[var(--accent-teal)] text-[var(--accent-teal)] bg-[var(--bg-hover)]'
                    : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                }`}
              >
                <Wrench size={16} /> Playbook Advisor
              </button>
              <button
                onClick={() => setActiveTab('chat')}
                className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-all ${
                  activeTab === 'chat'
                    ? 'border-[var(--accent-teal)] text-[var(--accent-teal)] bg-[var(--bg-hover)]'
                    : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                }`}
              >
                <Sparkles size={16} /> Operations Copilot
              </button>
            </div>

            <div className="p-5 flex-1 flex flex-col justify-between">
              {activeTab === 'advisor' ? (
                <div className="flex items-start gap-3 h-full">
                  <span className="grid size-10 shrink-0 place-items-center rounded-md bg-[var(--accent-teal-dim)] text-[var(--accent-teal)]">
                    <Wrench size={18} aria-hidden="true" />
                  </span>
                  <div className="flex-1 flex flex-col justify-between h-full min-h-[140px]">
                    <div>
                      <p className="text-xs font-extrabold uppercase text-[var(--text-muted)]">Recommended next move</p>
                      <h3 className="mt-1 text-lg font-bold text-[var(--text-primary)]">{topRecommendation.action.name}</h3>
                      <p className="mt-2 text-sm text-[var(--text-secondary)]">{topRecommendation.rationale}</p>
                      
                      <div className="mt-3 flex flex-wrap gap-2">
                        {topRecommendation.expectedProfitDelta !== 0 ? (
                          <span className={`badge ${topRecommendation.expectedProfitDelta > 0 ? 'badge-teal' : 'badge-red'}`}>
                            {topRecommendation.expectedProfitDelta > 0 ? '+' : ''}{formatCurrency(topRecommendation.expectedProfitDelta)} profit
                          </span>
                        ) : null}
                        {topRecommendation.expectedServiceDelta !== 0 ? (
                          <span className={`badge ${topRecommendation.expectedServiceDelta > 0 ? 'badge-teal' : 'badge-red'}`}>
                            {topRecommendation.expectedServiceDelta > 0 ? '+' : ''}{topRecommendation.expectedServiceDelta.toFixed(1)}% service
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <button
                      aria-label={`Apply recommended action: ${topRecommendation.action.name}`}
                      type="button"
                      className={`focus-ring mt-4 self-start ${applied === topRecommendation.action.id ? 'btn-secondary' : 'btn-primary'}`}
                      onClick={() => handleApply(topRecommendation)}
                    >
                      {applied === topRecommendation.action.id ? (
                        <>
                          <Check size={16} /> Applied
                        </>
                      ) : (
                        <>
                          <Wrench size={16} /> Apply action
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col h-[180px] justify-between">
                  <div className="flex-1 overflow-y-auto space-y-2 mb-3 max-h-[120px] text-xs pr-1">
                    {chatLog.map((chat, idx) => (
                      <div
                        key={idx}
                        className={`p-2.5 rounded-lg max-w-[85%] ${
                          chat.sender === 'ai'
                            ? 'bg-[var(--bg-base)] text-[var(--text-primary)] self-start border border-[var(--border-subtle)]'
                            : 'bg-[var(--accent-teal-dim)] text-[var(--accent-teal)] self-end ml-auto'
                        }`}
                      >
                        {chat.text}
                      </div>
                    ))}
                    {isTyping && (
                      <div className="bg-[var(--bg-base)] text-[var(--text-muted)] p-2 rounded-lg w-16 text-center animate-pulse">
                        typing...
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      onClick={() => askCoPilot("Identify supply chain bottlenecks")}
                      className="text-[10px] bg-[var(--bg-base)] hover:bg-[var(--bg-hover)] border border-[var(--border-subtle)] px-2 py-1 rounded font-bold"
                    >
                      🔍 Bottlenecks
                    </button>
                    <button
                      onClick={() => askCoPilot("Audit carbon emissions")}
                      className="text-[10px] bg-[var(--bg-base)] hover:bg-[var(--bg-hover)] border border-[var(--border-subtle)] px-2 py-1 rounded font-bold"
                    >
                      🌱 Carbon footprint
                    </button>
                    <button
                      onClick={() => askCoPilot("Analyze cash reserves & risk")}
                      className="text-[10px] bg-[var(--bg-base)] hover:bg-[var(--bg-hover)] border border-[var(--border-subtle)] px-2 py-1 rounded font-bold"
                    >
                      💵 Cash/Risk
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* KPI Cards Grid */}
      <section className="stagger-children grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          detail="Weighted fulfilled demand"
          icon={<Gauge size={18} />}
          label="Service level"
          tone={run.summary.serviceLevel >= 92 ? 'good' : 'risk'}
          value={formatPercent(run.summary.serviceLevel)}
          numericValue={run.summary.serviceLevel}
          format={(n) => formatPercent(n)}
          sparkData={run.weeks.map((w) => w.serviceLevel)}
          tooltip="% of customer demand fulfilled on time"
        />
        <KpiCard
          detail="26-week simulated total"
          icon={<Banknote size={18} />}
          label="Profit"
          tone={run.summary.totalProfit > 0 ? 'good' : 'risk'}
          value={formatCurrency(run.summary.totalProfit)}
          numericValue={run.summary.totalProfit}
          format={(n) => formatCurrency(n)}
          sparkData={run.weeks.map((w) => w.profit)}
          tooltip="Total profit across the simulation window"
        />
        <KpiCard
          detail={`${formatNumber(run.summary.stockoutIncidents)} weekly product breaches`}
          icon={<Boxes size={18} />}
          label="Stockouts"
          tone={run.summary.stockoutIncidents < 20 ? 'good' : 'risk'}
          value={formatNumber(run.summary.stockoutIncidents)}
          numericValue={run.summary.stockoutIncidents}
          format={(n) => formatNumber(n)}
          sparkData={run.weeks.map((w) => w.stockoutIncidents)}
          tooltip="Times when demand exceeded available inventory"
        />
        <KpiCard
          detail="Average network exposure"
          icon={<ShieldAlert size={18} />}
          label="Risk score"
          tone={run.summary.averageRiskScore < 45 ? 'good' : 'risk'}
          value={formatNumber(run.summary.averageRiskScore)}
          numericValue={run.summary.averageRiskScore}
          format={(n) => formatNumber(n)}
          sparkData={run.weeks.map((w) => w.riskScore)}
          tooltip="Composite risk across suppliers, logistics, and inventory"
        />
      </section>

      {/* Main Charts & Live Alert Ticker */}
      <section className="grid items-start gap-5 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="control-surface rounded-lg p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-extrabold uppercase text-[var(--text-muted)]">Recovery curve</p>
              <h2 className="text-lg font-bold font-sans">Profit through disruption</h2>
            </div>
            <span className="badge badge-teal">{currentPlayWeek} weeks active</span>
          </div>
          <TrendChart data={run.weeks} metric="profit" events={events} />
        </div>

        {/* Live Alert Ticker Panel */}
        <div className="control-surface rounded-lg p-5 flex flex-col h-[420px]">
          <div className="flex items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-3 mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="text-[var(--accent-amber)]" size={18} aria-hidden="true" />
              <h2 className="text-lg font-bold">Live Alert Ticker</h2>
            </div>
            <span className="badge badge-amber">{run.findings.length} alerts</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {run.findings.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <span className="grid size-12 place-items-center rounded-full bg-[var(--accent-teal-dim)] text-[var(--accent-teal)] mb-3 animate-pulse">
                  <Check size={24} />
                </span>
                <p className="font-bold text-sm text-[var(--text-primary)]">All Systems Nominal</p>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  No active supply chain disruption events recorded for the network.
                </p>
              </div>
            ) : (
              run.findings.slice(0, 5).map((finding) => {
                const tierColor = {
                  critical: 'var(--accent-red)',
                  high: 'var(--accent-amber)',
                  medium: 'var(--accent-blue)',
                  low: 'var(--accent-teal)',
                }[finding.tier]

                const isCurrent = finding.week === currentPlayWeek

                return (
                  <article
                    key={finding.id}
                    className={`rounded-md border p-3 transition-all ${
                      isCurrent 
                        ? 'border-[var(--accent-amber)] bg-[var(--accent-amber-dim)]/20 animate-pulse scale-[0.98]'
                        : 'border-[var(--border-subtle)] bg-[var(--bg-elevated)]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-1.5">
                        {isCurrent && <span className="size-2 rounded-full bg-[var(--accent-amber)] animate-ping" />}
                        <strong className="text-sm text-[var(--text-primary)]">{finding.title}</strong>
                      </div>
                      <span
                        className="badge"
                        style={{
                          color: tierColor,
                          background: `${tierColor}18`,
                        }}
                      >
                        {finding.tier}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-[var(--text-secondary)]">{finding.description}</p>
                    <div className="mt-2 flex items-center justify-between text-[10px] text-[var(--text-muted)] font-medium">
                      <span>Area: {finding.area.toUpperCase()}</span>
                      <span>Triggered: Week {finding.week}</span>
                    </div>
                  </article>
                )
              })
            )}
          </div>
          {finalWeek && run.findings.length > 0 && (
            <div className="border-t border-[var(--border-subtle)] pt-3 mt-3 text-xs text-[var(--text-muted)] flex justify-between">
              <span>Ending Week: {finalWeek.week}</span>
              <span>Cash: <strong>{formatCurrency(finalWeek.cashBalance)}</strong></span>
            </div>
          )}
        </div>
      </section>
    </PageShell>
  )
}
