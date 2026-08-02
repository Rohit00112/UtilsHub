'use client';
import { ReceiptText, Users } from 'lucide-react';
import ToolLayout from '@/components/ToolLayout';
import { ToolField, ToolMetric, ToolPanel } from '@/components/tools/ToolPrimitives';
import { useToolState } from '@/lib/toolState';
export default function TipCalculator() {
  const [bill, setBill] = useToolState('tip-calculator', 'bill', 75); const [tip, setTip] = useToolState('tip-calculator', 'tip', 18); const [people, setPeople] = useToolState('tip-calculator', 'people', 2); const [round, setRound] = useToolState('tip-calculator', 'round', false);
  const safeBill = Math.max(0, bill || 0), safeTip = Math.max(0, tip || 0), safePeople = Math.max(1, people || 1);
  const tipAmount = safeBill * safeTip / 100, total = safeBill + tipAmount, rawEach = total / safePeople, each = round ? Math.ceil(rawEach) : rawEach;
  const money = (n: number) => n.toLocaleString(undefined, { style: 'currency', currency: 'USD' });
  return <ToolLayout title="Tip Calculator" description="Calculate gratuity, totals, and per-person splits" category="calculator"><div className="mx-auto max-w-3xl space-y-6">
    <ToolPanel title="Bill details"><div className="grid gap-5 sm:grid-cols-2"><ToolField label="Bill amount" htmlFor="bill"><input id="bill" className="input" type="number" min="0" step="0.01" value={bill} onChange={(e) => setBill(Number(e.target.value))} /></ToolField><ToolField label="Number of people" htmlFor="people"><div className="relative"><Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><input id="people" className="input pl-9" type="number" min="1" step="1" value={people} onChange={(e) => setPeople(Number(e.target.value))} /></div></ToolField></div><div className="mt-5"><ToolField label="Tip percentage"><div className="flex flex-wrap gap-2">{[10, 15, 18, 20, 25].map((n) => <button key={n} className={`btn ${tip === n ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setTip(n)}>{n}%</button>)}<input aria-label="Custom tip percentage" className="input w-28" type="number" min="0" value={tip} onChange={(e) => setTip(Number(e.target.value))} /></div></ToolField></div><label className="mt-5 flex items-center gap-2 text-sm"><input type="checkbox" checked={round} onChange={(e) => setRound(e.target.checked)} /> Round each person up to the next dollar</label></ToolPanel>
    <ToolPanel title="Your split" actions={<ReceiptText className="h-5 w-5 text-muted-foreground" />}><div className="grid gap-3 sm:grid-cols-2"><ToolMetric label="Tip amount" value={money(tipAmount)} /><ToolMetric label="Total bill" value={money(total)} /><ToolMetric label="Tip per person" value={money(tipAmount / safePeople)} /><ToolMetric label="Total per person" value={money(each)} description={round && each > rawEach ? `${money(each * safePeople - total)} extra from rounding` : undefined} /></div></ToolPanel>
  </div></ToolLayout>;
}
