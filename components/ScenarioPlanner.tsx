'use client';

import { useMemo, useState, useTransition } from 'react';
import { constructionCostPerM2, CostParams, MixRule } from '@/lib/cost';
import { KpiCard } from './KpiCard';
import { upsertScenarioItemAction, deleteScenarioItemAction } from '@/server/scenarios';

interface Rent {
  code: string;
  monthly_usd: number;
}

interface Overheads {
  dev_monthly_usd: number;
  maint_monthly_usd: number;
  lease_years: number;
  infra_subsidy_pct: number;
}

interface ScenarioItem {
  typology_code: string;
  units: number;
  gfa_m2: number;
}

interface Props {
  scenarioId: string;
  mixRules: MixRule[];
  costParams: CostParams;
  rents: Rent[];
  overheads: Overheads;
  items: ScenarioItem[];
}

export function ScenarioPlanner({ scenarioId, mixRules, costParams, rents, overheads, items }: Props) {
  const [isPending, startTransition] = useTransition();
  const [category, setCategory] = useState(mixRules[0]?.category ?? 'A');
  const [gfa, setGfa] = useState(items[0]?.gfa_m2 ?? 1000);
  const [rentCode, setRentCode] = useState(rents[0]?.code ?? 'AMS');
  const [units, setUnits] = useState(items[0]?.units ?? 10);
  const [itemList, setItemList] = useState(items);

  const rent = rents.find((item) => item.code === rentCode) ?? rents[0];

  const costPerM2 = useMemo(() => constructionCostPerM2(category, mixRules, costParams), [category, mixRules, costParams]);
  const unitConstructionCost = costPerM2 * gfa;
  const leaseYears = overheads.lease_years;
  const monthlyRent = rent?.monthly_usd ?? 0;
  const maxCapex = monthlyRent * 12 * leaseYears - (overheads.dev_monthly_usd + overheads.maint_monthly_usd) * 12 * leaseYears;
  const margin = maxCapex - unitConstructionCost;

  function handleSave() {
    startTransition(async () => {
      await upsertScenarioItemAction({
        scenarioId,
        typology: category,
        units,
        gfa,
        overrides: {
          rentCode
        }
      });
      setItemList((prev) => {
        const existing = prev.findIndex((item) => item.typology_code === category);
        const next = [...prev];
        if (existing >= 0) {
          next[existing] = { typology_code: category, units, gfa_m2: gfa };
        } else {
          next.push({ typology_code: category, units, gfa_m2: gfa });
        }
        return next;
      });
    });
  }

  function handleDelete(typology: string) {
    startTransition(async () => {
      await deleteScenarioItemAction(scenarioId, typology);
      setItemList((prev) => prev.filter((item) => item.typology_code !== typology));
    });
  }

  return (
    <div className="planner">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          handleSave();
        }}
      >
        <fieldset>
          <legend className="visually-hidden">Scenario inputs</legend>
          <label htmlFor="category">Category</label>
          <select id="category" value={category} onChange={(event) => setCategory(event.target.value)}>
            {mixRules.map((rule) => (
              <option key={rule.category} value={rule.category}>
                {rule.category}
              </option>
            ))}
          </select>

          <label htmlFor="gfa">GFA (m²)</label>
          <input
            id="gfa"
            type="number"
            min={0}
            value={gfa}
            onChange={(event) => setGfa(Number(event.target.value))}
          />

          <label htmlFor="rent">Monthly rent code</label>
          <select id="rent" value={rentCode} onChange={(event) => setRentCode(event.target.value)}>
            {rents.map((entry) => (
              <option key={entry.code} value={entry.code}>
                {entry.code} – ${entry.monthly_usd.toLocaleString()}
              </option>
            ))}
          </select>

          <label htmlFor="units">Units</label>
          <input id="units" type="number" min={0} value={units} onChange={(event) => setUnits(Number(event.target.value))} />

          <button type="submit" disabled={isPending}>
            {isPending ? 'Saving…' : 'Save scenario item'}
          </button>
        </fieldset>
      </form>
      <section className="kpis" aria-live="polite">
        <dl>
          <KpiCard label="Construction cost / m²" value={`$${costPerM2.toLocaleString(undefined, { maximumFractionDigits: 2 })}`} />
          <KpiCard label="Unit construction cost" value={`$${unitConstructionCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} />
          <KpiCard label="Max CAPEX" value={`$${maxCapex.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} helper={`${leaseYears} years`} />
          <KpiCard label="Margin" value={`$${margin.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} />
        </dl>
      </section>
      <section>
        <h2>Scenario items</h2>
        <table>
          <thead>
            <tr>
              <th scope="col">Typology</th>
              <th scope="col">Units</th>
              <th scope="col">GFA (m²)</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {itemList.map((item) => (
              <tr key={item.typology_code}>
                <td>{item.typology_code}</td>
                <td>{item.units}</td>
                <td>{item.gfa_m2.toLocaleString()}</td>
                <td>
                  <button type="button" onClick={() => handleDelete(item.typology_code)} disabled={isPending}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {itemList.length === 0 && (
              <tr>
                <td colSpan={4}>No items yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
      <style jsx>{`
        .planner {
          display: grid;
          gap: 2rem;
        }
        form fieldset {
          display: grid;
          gap: 0.75rem;
          background: #fff;
          padding: 1.5rem;
          border-radius: 1rem;
          border: 1px solid #e5e7eb;
        }
        select,
        input,
        textarea {
          border-radius: 0.5rem;
          border: 1px solid #d1d5db;
          padding: 0.5rem 0.75rem;
        }
        button {
          border: none;
          border-radius: 999px;
          padding: 0.75rem 1rem;
          background: #111827;
          color: #fff;
          cursor: pointer;
        }
        button:hover,
        button:focus-visible {
          background: #1f2937;
        }
        button[disabled] {
          opacity: 0.5;
          cursor: progress;
        }
        .kpis dl {
          display: grid;
          gap: 1rem;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        }
        table {
          width: 100%;
          border-collapse: collapse;
          background: #fff;
          border-radius: 1rem;
          overflow: hidden;
        }
        th,
        td {
          padding: 0.75rem 1rem;
          border-bottom: 1px solid #e5e7eb;
          text-align: left;
        }
        tr:last-child td {
          border-bottom: none;
        }
      `}</style>
    </div>
  );
}
