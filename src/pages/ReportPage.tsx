import { useMemo, useState } from "react";
import { useWorkOrders } from "../store/workOrders";
import { Button, Field, Panel } from "../ui/controls";

function downloadText(filename: string, text: string, mime = "text/plain") {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

function toCSVRow(cols: (string | number)[]) {
  return cols
    .map((c) => {
      const s = String(c ?? "");
      if (s.includes('"') || s.includes(",") || s.includes("\n")) return `"${s.replaceAll('"', '""')}"`;
      return s;
    })
    .join(",");
}

export default function ReportPage() {
  const { workOrders } = useWorkOrders();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [status, setStatus] = useState("");

  const filtered = useMemo(() => {
    return workOrders.filter((w) => {
      if (from && w.submissionDate < from) return false;
      if (to && w.submissionDate > to) return false;
      if (status && w.status !== status) return false;
      return true;
    });
  }, [from, status, to, workOrders]);

  const byStatus = useMemo(() => {
    const map = new Map<string, number>();
    for (const w of filtered) map.set(w.status, (map.get(w.status) ?? 0) + 1);
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [filtered]);

  return (
    <div>
      <div className="pageTitle">Report</div>
      <Panel>
        <div className="rowBetween" style={{ alignItems: "flex-end" }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, marginBottom: 10 }}>Filters</div>
            <div className="formGrid">
              <Field label="From (yyyy-mm-dd)">
                <input className="input" value={from} onChange={(e) => setFrom(e.target.value)} placeholder="2026-01-01" />
              </Field>
              <Field label="To (yyyy-mm-dd)">
                <input className="input" value={to} onChange={(e) => setTo(e.target.value)} placeholder="2026-12-31" />
              </Field>
              <Field label="Status">
                <select className="select" value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="">All</option>
                  {Array.from(new Set(workOrders.map((w) => w.status))).map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
          </div>
          <div style={{ width: 340 }}>
            <div style={{ fontWeight: 700, marginBottom: 10 }}>Export</div>
            <div className="stack">
              <Button
                variant="primary"
                onClick={() => {
                  const header = toCSVRow(["orderNo", "submittedBy", "submissionDate", "submittedTo", "assignedTo", "priority", "status"]);
                  const rows = filtered.map((w) =>
                    toCSVRow([w.orderNo, w.submittedBy, w.submissionDate, w.submittedTo, w.assignedTo ?? "", w.priority, w.status])
                  );
                  downloadText(`work-orders_${Date.now()}.csv`, [header, ...rows].join("\n"), "text/csv");
                }}
              >
                Download CSV
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  const lines = byStatus.map(([s, n]) => `${s}: ${n}`).join("\n");
                  downloadText(`work-orders_summary_${Date.now()}.txt`, lines || "No data");
                }}
              >
                Download Summary
              </Button>
            </div>
          </div>
        </div>

        <div style={{ height: 14 }} />
        <div style={{ fontWeight: 700, marginBottom: 10 }}>Summary (filtered)</div>
        <div className="tableWrap">
          <table>
            <thead>
              <tr>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Count</th>
              </tr>
            </thead>
            <tbody>
              {byStatus.map(([s, n]) => (
                <tr key={s}>
                  <td>{s}</td>
                  <td style={{ textAlign: "right", fontWeight: 700 }}>{n}</td>
                </tr>
              ))}
              {byStatus.length === 0 ? (
                <tr>
                  <td colSpan={2} className="muted">
                    No results for current filters.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}

