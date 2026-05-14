import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { WorkOrderStatus, useWorkOrders } from "../store/workOrders";
import { useSettings } from "../store/settings";
import { useUsers } from "../store/users";
import { Button, Field, Panel } from "../ui/controls";

function toMDY(iso: string) {
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${m}/${d}/${y}`;
}

const STATUSES: WorkOrderStatus[] = ["Open", "Accepted", "Work Undergoing", "Completed & Waiting for Acceptance", "Close", "Closed"];

export default function WorkOrderReviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getById, update } = useWorkOrders();
  const { state: settingsState } = useSettings();
  const { getById: getUserById } = useUsers();
  const wo = id ? getById(id) : undefined;
  const currentUser = settingsState.currentUserId ? getUserById(settingsState.currentUserId) : undefined;

  const line0 = useMemo(() => wo?.lines[0], [wo]);

  if (!wo) {
    return (
      <div>
        <div className="pageTitle">Work Order&gt;Status</div>
        <div className="panel">Not found.</div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ color: "#3b5bfd", fontWeight: 800, marginBottom: 10 }}>Work Order&gt;Status</div>

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
              <Field label="কার্যনির্বাহী">
                <select className="select" value={wo.assignedTo ?? ""} disabled>
                  <option>{wo.assignedTo ?? ""}</option>
                </select>
              </Field>
              <Field label="অবস্থা">
                <select
                  className="select"
                  value={wo.status}
                  onChange={(e) =>
                    update({ ...wo, status: e.target.value as WorkOrderStatus }, currentUser?.displayName ?? "Admin", "Work order status has been changed")
                  }
                >
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
                <td>{`${line0?.item ?? ""} : ${line0?.issue ?? ""}`}</td>
                <td>{line0?.location ?? ""}</td>
                <td>{line0?.priority ?? ""}</td>
                <td>
                  <div style={{ display: "inline-block", background: "#111827", color: "#fff", padding: "4px 10px", borderRadius: 2, fontSize: 12 }}>
                    {wo.status === "Completed & Waiting for Acceptance" ? "Completed & Waiting for Acceptance" : line0?.state ?? "Select"}
                  </div>
                </td>
                <td>
                  <input className="input" value={toMDY(line0?.completionDate ?? wo.submissionDate)} disabled />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style={{ height: 10 }} />
        <div className="rowBetween" style={{ alignItems: "flex-start" }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Creation Details</div>
            <Field label="Additional Description">
              <textarea className="textarea" value={wo.additionalDescription ?? ""} disabled />
            </Field>

            <div style={{ fontWeight: 700, margin: "10px 0 6px" }}>কার্যঅগ্রগতির বিবরণ</div>
            <div style={{ fontSize: 12, lineHeight: 1.6 }}>
              {wo.history.slice(0, 8).map((h, idx) => (
                <div key={idx}>
                  ({h.at}) --&gt; <b>{h.by}</b> : {h.message}
                </div>
              ))}
            </div>
          </div>

          <div style={{ width: 340 }}>
            <div style={{ height: 28 }} />
            <div className="stack" style={{ gap: 10 }}>
              <Field label="উপকরণের মোট মূল্য">
                <input className="input" value={(wo.materials ?? []).reduce((s, m) => s + (m.quantity || 0) * (m.unitPrice || 0), 0).toFixed(2)} disabled />
              </Field>
              <Field label="প্রাপ্তিসহ প্রাকৃতিক মূল্য">
                <input className="input" value="0.00" disabled />
              </Field>
              <Field label="মোট মূল্য">
                <input
                  className="input"
                  value={(wo.materials ?? []).reduce((s, m) => s + (m.quantity || 0) * (m.unitPrice || 0), 0).toFixed(2)}
                  disabled
                />
              </Field>
            </div>
          </div>
        </div>

        <div className="rowBetween" style={{ marginTop: 16 }}>
          <Button variant="danger" onClick={() => navigate("/work-orders")}>
            Cancel
          </Button>
          <div className="row">
            <Button variant="ghost" onClick={() => navigate(`/work-orders/${wo.id}/payslip`)}>
              Print Payslip
            </Button>
            <Button variant="primary" className="btnSmall" onClick={() => navigate(`/work-orders/${wo.id}/execution`)}>
              Save
            </Button>
          </div>
        </div>
      </Panel>
    </div>
  );
}
