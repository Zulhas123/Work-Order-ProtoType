import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MaterialLine, Priority, WorkOrderLine, WorkOrderStatus, useWorkOrders } from "../store/workOrders";
import { useSettings } from "../store/settings";
import { useUsers } from "../store/users";
import { Button, Field, Panel } from "../ui/controls";
import { IconList, IconPlus } from "../ui/icons";

function toMDY(iso: string) {
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${m}/${d}/${y}`;
}

function toISOFromMDY(mdy: string) {
  const [m, d, y] = mdy.split("/");
  if (!m || !d || !y) return mdy;
  return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
}

const STATUSES: WorkOrderStatus[] = ["Open", "Accepted", "Work Undergoing", "Completed & Waiting for Acceptance", "Close", "Closed"];
const PRIORITIES: Priority[] = ["urgent", "medium", "low"];

export default function WorkOrderExecutionPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getById, update, uid } = useWorkOrders();
  const { state: settingsState } = useSettings();
  const { activeUsers, getById: getUserById } = useUsers();
  const wo = id ? getById(id) : undefined;
  const currentUser = settingsState.currentUserId ? getUserById(settingsState.currentUserId) : undefined;
  const [assignedTo, setAssignedTo] = useState(wo?.assignedTo ?? "");
  const [status, setStatus] = useState<WorkOrderStatus>(wo?.status ?? "Open");
  const [lineState, setLineState] = useState<WorkOrderLine["state"]>(wo?.lines[0]?.state ?? "Select");
  const [completionMDY, setCompletionMDY] = useState(toMDY(wo?.lines[0]?.completionDate ?? wo?.submissionDate ?? ""));
  const [materials, setMaterials] = useState<MaterialLine[]>(wo?.materials ?? []);
  const [description, setDescription] = useState(wo?.additionalDescription ?? "");

  const costs = useMemo(() => {
    const totalMaterial = materials.reduce((sum, m) => sum + (Number(m.quantity) || 0) * (Number(m.unitPrice) || 0), 0);
    const existingMaterial = 0;
    const extraMaterial = 0;
    const existingTech = 0;
    const extraTech = 0;
    const total = totalMaterial + existingMaterial + extraMaterial + existingTech + extraTech;
    return { totalMaterial, existingMaterial, extraMaterial, existingTech, extraTech, total };
  }, [materials]);

  if (!wo) {
    return (
      <div>
        <div className="pageTitle">Work Order</div>
        <div className="panel">Not found.</div>
      </div>
    );
  }

  return (
    <div>
      <Panel>
        <div className="rowBetween" style={{ marginBottom: 12 }}>
          <div style={{ color: "#16a34a", fontSize: 13 }}>Work Order Info</div>
          <div style={{ color: "#86efac", fontSize: 13, opacity: 0.9 }}>Assign &amp; Status Section</div>
        </div>

        <div className="rowBetween" style={{ alignItems: "stretch" }}>
          <div style={{ flex: 1 }}>
            <div className="rowBetween" style={{ padding: "6px 0" }}>
              <div style={{ fontWeight: 700 }}>প্রাপকঃ</div>
              <div style={{ fontWeight: 700 }}>ওয়ার্ক অর্ডার নংঃ</div>
              <div style={{ fontWeight: 700 }}>তৈরির তারিখঃ</div>
            </div>
            <div className="rowBetween" style={{ paddingBottom: 10 }}>
              <div style={{ fontWeight: 700 }}>{wo.submittedBy}</div>
              <div style={{ fontWeight: 700 }}>{wo.orderNo}</div>
              <div style={{ fontWeight: 700 }}>{toMDY(wo.submissionDate)}</div>
            </div>
            <div className="row" style={{ gap: 24, paddingBottom: 6 }}>
              <div style={{ fontWeight: 700 }}>প্রকার</div>
              <div>{wo.type}</div>
            </div>
          </div>
          <div style={{ width: 340 }}>
            <div className="stack" style={{ gap: 10 }}>
              <Field label="কর্মী করুনঃ">
                <select className="select" value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)}>
                  <option value="">Select One</option>
                  {activeUsers.map((u) => (
                    <option key={u.id} value={u.displayName}>
                      {u.displayName}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="অবস্থা">
                <select className="select" value={status} onChange={(e) => setStatus(e.target.value as WorkOrderStatus)}>
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
          </div>
        </div>

        <div style={{ height: 14 }} />

        <div className="tableWrap">
          <table>
            <thead>
              <tr>
                <th>কার্যবিবরণী</th>
                <th>স্থান</th>
                <th>প্রাধান্য</th>
                <th>অবস্থা</th>
                <th>সমাপ্তির দিন</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{`${wo.lines[0]?.item ?? ""} : ${wo.lines[0]?.issue ?? ""}`}</td>
                <td>{wo.lines[0]?.location ?? ""}</td>
                <td>
                  <select
                    className="select"
                    value={wo.lines[0]?.priority ?? "urgent"}
                    onChange={(e) => {
                      const p = e.target.value as Priority;
                      const nextLines = wo.lines.map((l, idx) => (idx === 0 ? { ...l, priority: p } : l));
                      update({ ...wo, lines: nextLines }, currentUser?.displayName ?? "Admin", "Priority changed");
                    }}
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <select className="select" value={lineState ?? "Select"} onChange={(e) => setLineState(e.target.value as WorkOrderLine["state"])}>
                    {["Select", "Pending", "Done"].map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <input className="input" value={completionMDY} onChange={(e) => setCompletionMDY(e.target.value)} />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style={{ height: 14 }} />

        <div className="rowBetween" style={{ alignItems: "flex-start" }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>উপকরণ</div>
            <div className="tableWrap">
              <table>
                <thead>
                  <tr>
                    <th style={{ width: "55%" }}>উপকরণ</th>
                    <th>পরিমাণ</th>
                    <th>দর</th>
                    <th style={{ textAlign: "right" }}>মোট</th>
                  </tr>
                </thead>
                <tbody>
                  {materials.map((m) => (
                    <tr key={m.id}>
                      <td>
                        <input
                          className="input"
                          value={m.name}
                          onChange={(e) => setMaterials((prev) => prev.map((x) => (x.id === m.id ? { ...x, name: e.target.value } : x)))}
                        />
                      </td>
                      <td>
                        <input
                          className="input"
                          type="number"
                          value={m.quantity}
                          onChange={(e) => setMaterials((prev) => prev.map((x) => (x.id === m.id ? { ...x, quantity: Number(e.target.value) } : x)))}
                        />
                      </td>
                      <td>
                        <input
                          className="input"
                          type="number"
                          value={m.unitPrice}
                          onChange={(e) => setMaterials((prev) => prev.map((x) => (x.id === m.id ? { ...x, unitPrice: Number(e.target.value) } : x)))}
                        />
                      </td>
                      <td style={{ textAlign: "right" }}>{((Number(m.quantity) || 0) * (Number(m.unitPrice) || 0)).toFixed(2)}</td>
                    </tr>
                  ))}
                  {materials.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="muted">
                        No materials.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>

            <div style={{ height: 10 }} />
            <div className="row" style={{ justifyContent: "center" }}>
              <Button
                size="icon"
                variant="primary"
                onClick={() => setMaterials((prev) => [...prev, { id: uid("mat"), name: "", quantity: 1, unitPrice: 0 }])}
                title="Add"
              >
                <IconPlus style={{ width: 18, height: 18 }} />
              </Button>
              <Button size="icon" variant="primary" onClick={() => alert("Prototype list button")} title="List">
                <IconList style={{ width: 18, height: 18 }} />
              </Button>
            </div>
          </div>

          <div style={{ width: 340 }}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}> </div>
            <div className="stack" style={{ gap: 10, marginTop: 26 }}>
              <Field label="উপকরণের মোট মূল্য">
                <input className="input" value={costs.totalMaterial.toFixed(2)} disabled />
              </Field>
              <Field label="প্রাপ্তিসহ প্রাকৃতিক মূল্য">
                <input className="input" value={costs.existingMaterial.toFixed(2)} disabled />
              </Field>
              <Field label="উপকরণের অতিরিক্ত মূল্য">
                <input className="input" value={costs.extraMaterial.toFixed(2)} disabled />
              </Field>
              <Field label="প্রাপ্তিসহ অতিরিক্ত মূল্য">
                <input className="input" value={costs.existingTech.toFixed(2)} disabled />
              </Field>
              <Field label="মোট মূল্য">
                <input className="input" value={costs.total.toFixed(2)} disabled />
              </Field>
            </div>
          </div>
        </div>

        <div style={{ height: 14 }} />
        <div className="rowBetween" style={{ alignItems: "flex-start" }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Creation Details</div>
            <Field label="File(If any)">
              <input className="input" type="file" />
            </Field>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, marginBottom: 8, visibility: "hidden" }}>.</div>
            <Field label="Additional Description">
              <textarea className="textarea" value={description} onChange={(e) => setDescription(e.target.value)} />
            </Field>
          </div>
        </div>

        <div className="rowBetween" style={{ marginTop: 16 }}>
          <Button variant="danger" onClick={() => navigate("/work-orders")}>
            Cancel
          </Button>
          <Button
            variant="primary"
            className="btnSmall"
            onClick={() => {
              const nextLines = wo.lines.map((l, idx) =>
                idx === 0 ? { ...l, state: lineState ?? "Select", completionDate: toISOFromMDY(completionMDY) } : l
              );
              update(
                {
                  ...wo,
                  assignedTo,
                  status,
                  lines: nextLines,
                  materials,
                  additionalDescription: description
                },
                currentUser?.displayName ?? "Admin",
                "Work order status has been changed"
              );
              navigate(`/work-orders/${wo.id}/review`);
            }}
          >
            Save
          </Button>
        </div>
      </Panel>
    </div>
  );
}
