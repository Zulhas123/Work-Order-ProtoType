import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Priority, WorkOrder, WorkOrderLine, WorkOrderStatus, useWorkOrders } from "../store/workOrders";
import { Button, Field, Modal, Panel } from "../ui/controls";
import { IconList, IconPlus } from "../ui/icons";

function toMDY(iso: string) {
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${m}/${d}/${y}`;
}

function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function emptyLine(uid: (p: string) => string): WorkOrderLine {
  return {
    id: uid("line"),
    item: "লাইট",
    quantity: 1,
    issue: "",
    location: "",
    priority: "urgent",
    state: "Select",
    completionDate: todayISO()
  };
}

const STATUSES: WorkOrderStatus[] = ["Open", "Accepted", "Work Undergoing", "Completed & Waiting for Acceptance", "Close", "Closed"];
const PRIORITIES: Priority[] = ["urgent", "medium", "low"];

export default function WorkOrderCreatePage({ mode }: { mode: "create" | "edit" }) {
  const navigate = useNavigate();
  const params = useParams();
  const { getById, create, update, nextOrderNo, uid } = useWorkOrders();

  const editing = mode === "edit";
  const existing = editing && params.id ? getById(params.id) : undefined;

  const initial = useMemo((): Omit<WorkOrder, "id" | "history"> => {
    const base = existing
      ? {
          orderNo: existing.orderNo,
          submittedBy: existing.submittedBy,
          submissionDate: existing.submissionDate,
          submittedTo: existing.submittedTo,
          assignedTo: existing.assignedTo ?? "",
          type: existing.type,
          dept: existing.dept,
          status: existing.status,
          priority: existing.priority,
          lines: existing.lines.length ? existing.lines : [emptyLine(uid)],
          materials: existing.materials ?? [],
          additionalDescription: existing.additionalDescription ?? "",
          createdByDeptCode: existing.createdByDeptCode ?? "M(EMT)"
        }
      : {
          orderNo: nextOrderNo(),
          submittedBy: "M(EMT)",
          submissionDate: todayISO(),
          submittedTo: "M(CEMT)T-S",
          assignedTo: "",
          type: "ইলেক্ট্রিক্যাল মেইনটেন্যান্স-ভিতর",
          dept: "",
          status: "Open" as WorkOrderStatus,
          priority: "urgent" as Priority,
          lines: [emptyLine(uid)],
          materials: [],
          additionalDescription: "",
          createdByDeptCode: "M(EMT)"
        };
    return base;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existing?.id]);

  const [submittedBy, setSubmittedBy] = useState(initial.submittedBy);
  const [orderNo] = useState(initial.orderNo);
  const [dateISO] = useState(initial.submissionDate);
  const [type] = useState(initial.type);
  const [submittedTo, setSubmittedTo] = useState(initial.submittedTo);
  const [status, setStatus] = useState<WorkOrderStatus>(initial.status);
  const [dept, setDept] = useState(initial.dept);
  const [lines, setLines] = useState<WorkOrderLine[]>(initial.lines);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowConfirm(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const payload = useMemo(() => {
    return {
      orderNo,
      submittedBy,
      submissionDate: dateISO,
      submittedTo,
      assignedTo: initial.assignedTo,
      type,
      dept,
      status,
      priority: lines[0]?.priority ?? "urgent",
      lines,
      materials: initial.materials,
      additionalDescription: initial.additionalDescription,
      createdByDeptCode: initial.createdByDeptCode
    };
  }, [dept, dateISO, initial, lines, orderNo, status, submittedBy, submittedTo, type]);

  const canConfirm = lines.some((l) => l.item.trim()) && submittedBy.trim();

  return (
    <div>
      <div className="breadcrumbs">
        <span>Work Order</span> {">"} Create
      </div>

      <Panel>
        <div style={{ fontWeight: 700, marginBottom: 12 }}>Work Order</div>

        <div className="formGrid">
          <Field label="প্রাপকঃ">
            <select className="select" value={submittedBy} onChange={(e) => setSubmittedBy(e.target.value)}>
              {["M(EMT)", "M(COPL-A)T", "ATO(CMM)T", "DGM(PGFM)", "Admin"].map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Work Order No.">
            <input className="input" value={orderNo} disabled />
          </Field>
          <Field label="Date">
            <input className="input" value={toMDY(dateISO)} disabled />
          </Field>
          <Field label="Type">
            <input className="input" value={type} disabled />
          </Field>

          <Field label="প্রেরকঃ">
            <input className="input" value={submittedTo} onChange={(e) => setSubmittedTo(e.target.value)} placeholder="Submitted To" />
          </Field>
          <Field label="Status">
            <select className="select" value={status} onChange={(e) => setStatus(e.target.value as WorkOrderStatus)}>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Dept.">
            <input className="input" value={dept} onChange={(e) => setDept(e.target.value)} />
          </Field>
        </div>

        <div style={{ height: 16 }} />

        <div className="formGrid" style={{ gridTemplateColumns: "1.2fr .6fr 1.4fr 1fr .5fr .9fr .4fr" }}>
          <Field label="Select Item">
            <select
              className="select"
              value={lines[0]?.item ?? ""}
              onChange={(e) => setLines((prev) => prev.map((l, idx) => (idx === 0 ? { ...l, item: e.target.value } : l)))}
            >
              {["লাইট", "ফ্যান", "সুইচ", "তার", "অন্যান্য"].map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Quantity">
            <input
              className="input"
              type="number"
              value={lines[0]?.quantity ?? 1}
              onChange={(e) =>
                setLines((prev) => prev.map((l, idx) => (idx === 0 ? { ...l, quantity: Number(e.target.value) } : l)))
              }
            />
          </Field>
          <Field label="Issue">
            <input
              className="input"
              value={lines[0]?.issue ?? ""}
              onChange={(e) => setLines((prev) => prev.map((l, idx) => (idx === 0 ? { ...l, issue: e.target.value } : l)))}
              placeholder="Issue"
            />
          </Field>
          <Field label="Location">
            <input
              className="input"
              value={lines[0]?.location ?? ""}
              onChange={(e) => setLines((prev) => prev.map((l, idx) => (idx === 0 ? { ...l, location: e.target.value } : l)))}
              placeholder="Location"
            />
          </Field>
          <Field label="CFT">
            <Button
              size="icon"
              variant="warning"
              onClick={() => {
                const note = prompt("CFT note (prototype):", lines[0]?.cftNote ?? "");
                if (note === null) return;
                setLines((prev) => prev.map((l, idx) => (idx === 0 ? { ...l, cftNote: note } : l)));
              }}
              title="CFT"
            >
              ✎
            </Button>
          </Field>
          <Field label="Priority">
            <select
              className="select"
              value={lines[0]?.priority ?? "urgent"}
              onChange={(e) =>
                setLines((prev) => prev.map((l, idx) => (idx === 0 ? { ...l, priority: e.target.value as Priority } : l)))
              }
            >
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Remove">
            <Button
              size="icon"
              variant="danger"
              onClick={() => setLines((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev))}
              title="Remove"
            >
              −
            </Button>
          </Field>
        </div>

        <div style={{ height: 12 }} />
        <div className="row">
          <Button
            size="icon"
            variant="primary"
            onClick={() => setLines((prev) => [...prev, emptyLine(uid)])}
            title="Add line"
          >
            <IconPlus style={{ width: 18, height: 18 }} />
          </Button>
          <Button
            size="icon"
            variant="primary"
            onClick={() => alert("Prototype: only the first row is rendered like the screenshot.\nExtra lines are still stored and used in other pages.")}
            title="List"
          >
            <IconList style={{ width: 18, height: 18 }} />
          </Button>
          <div className="muted">({lines.length} line{lines.length === 1 ? "" : "s"})</div>
        </div>

        <div className="rowBetween" style={{ marginTop: 18 }}>
          <Button variant="danger" onClick={() => navigate("/work-orders")}>
            Cancel
          </Button>
          <Button variant="primary" onClick={() => setShowConfirm(true)} disabled={!canConfirm}>
            Go to Confirmation
          </Button>
        </div>
      </Panel>

      {showConfirm ? (
        <Modal title="Confirmation" onClose={() => setShowConfirm(false)}>
          <div className="stack">
            <div className="muted">Review and save.</div>
            <div className="tableWrap">
              <table>
                <tbody>
                  <tr>
                    <th>Work Order No.</th>
                    <td>{payload.orderNo}</td>
                    <th>Date</th>
                    <td>{toMDY(payload.submissionDate)}</td>
                  </tr>
                  <tr>
                    <th>প্রাপকঃ</th>
                    <td>{payload.submittedBy}</td>
                    <th>প্রেরকঃ</th>
                    <td>{payload.submittedTo}</td>
                  </tr>
                  <tr>
                    <th>Status</th>
                    <td>{payload.status}</td>
                    <th>Priority</th>
                    <td>{payload.priority}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="row" style={{ justifyContent: "flex-end" }}>
              <Button variant="ghost" onClick={() => setShowConfirm(false)}>
                Back
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  if (editing && existing) {
                    update({ ...existing, ...payload }, "Admin", "Work order edited");
                    navigate("/work-orders");
                    return;
                  }
                  const id = create(payload);
                  navigate(`/work-orders/${id}/review`);
                }}
              >
                Save
              </Button>
            </div>
          </div>
        </Modal>
      ) : null}
    </div>
  );
}
