import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWorkOrders } from "../store/workOrders";
import { Button, Panel } from "../ui/controls";
import { IconEdit, IconEye, IconTrash } from "../ui/icons";

function fmtDMY(iso: string) {
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${d}-${m}-${y}`;
}

export default function WorkOrderListPage() {
  const navigate = useNavigate();
  const { workOrders, remove } = useWorkOrders();
  const [query, setQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return workOrders;
    return workOrders.filter((w) => {
      return (
        w.orderNo.toLowerCase().includes(q) ||
        w.submittedBy.toLowerCase().includes(q) ||
        w.submittedTo.toLowerCase().includes(q) ||
        (w.assignedTo ?? "").toLowerCase().includes(q) ||
        w.priority.toLowerCase().includes(q) ||
        w.status.toLowerCase().includes(q)
      );
    });
  }, [query, workOrders]);

  const rows = filtered.slice(0, pageSize);

  return (
    <div>
      <div className="rowBetween">
        <div className="pageTitle" style={{ marginBottom: 8 }}>
          Work Order
        </div>
        <div className="row">
          <Button variant="primary" className="btnSmall" onClick={() => navigate("/work-orders/create")}>
            New
          </Button>
          <Button variant="primary" className="btnSmall" onClick={() => navigate("/work-orders")}>
            Assigned
          </Button>
        </div>
      </div>

      <Panel>
        <div className="tableControls">
          <div className="row">
            <div className="muted">Show</div>
            <select className="entriesSelect" value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))}>
              {[10, 25, 50, 100].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <div className="muted">entries</div>
          </div>
          <div className="row">
            <div className="muted">Search:</div>
            <input className="pillInput" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
        </div>

        <div className="tableWrap">
          <table>
            <thead>
              <tr>
                <th>Order No.</th>
                <th>Submitted By</th>
                <th>Submission Date</th>
                <th>Submitted To</th>
                <th>Assigned To</th>
                <th>Priority</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((w) => (
                <tr key={w.id}>
                  <td>{w.orderNo}</td>
                  <td>{w.submittedBy}</td>
                  <td>{fmtDMY(w.submissionDate)}</td>
                  <td>{w.submittedTo}</td>
                  <td>{w.assignedTo || ""}</td>
                  <td>{w.priority}</td>
                  <td>{w.status}</td>
                  <td style={{ textAlign: "right" }}>
                    <div className="row" style={{ justifyContent: "flex-end", gap: 8 }}>
                      <Button size="sm" variant="primary" onClick={() => navigate(`/work-orders/${w.id}/review`)} title="View">
                        <IconEye style={{ width: 16, height: 16 }} />
                      </Button>
                      <Button size="sm" variant="primary" onClick={() => navigate(`/work-orders/${w.id}/execution`)} title="Status">
                        status
                      </Button>
                      <Button size="sm" variant="primary" onClick={() => navigate(`/work-orders/${w.id}/edit`)} title="Edit">
                        <IconEdit style={{ width: 16, height: 16 }} />
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => {
                          // prototype confirm
                          if (confirm(`Delete ${w.orderNo}?`)) remove(w.id);
                        }}
                        title="Delete"
                      >
                        <IconTrash style={{ width: 16, height: 16 }} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="muted">
                    No work orders found.
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

