interface Props {
  label: string;
  value: string;
  helper?: string;
}

export function KpiCard({ label, value, helper }: Props) {
  return (
    <div className="kpi-card">
      <dt>{label}</dt>
      <dd>{value}</dd>
      {helper && <small>{helper}</small>}
      <style jsx>{`
        .kpi-card {
          background: #fff;
          padding: 1rem;
          border-radius: 0.75rem;
          border: 1px solid #e5e7eb;
          display: grid;
          gap: 0.25rem;
        }
        dt {
          font-size: 0.875rem;
          color: #6b7280;
        }
        dd {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 600;
        }
        small {
          color: #6b7280;
        }
      `}</style>
    </div>
  );
}
