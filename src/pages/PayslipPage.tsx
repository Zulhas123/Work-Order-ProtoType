import { useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useWorkOrders } from "../store/workOrders";
import { Button } from "../ui/controls";

function fmtDMY(iso: string) {
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${d}-${m}-${y}`;
}

export default function PayslipPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getById } = useWorkOrders();
  const wo = id ? getById(id) : undefined;

  const totals = useMemo(() => {
    const material = (wo?.materials ?? []).reduce((s, m) => s + (m.quantity || 0) * (m.unitPrice || 0), 0);
    const total = material;
    return { material, total };
  }, [wo]);

  useEffect(() => {
    // keep the page white like the screenshot
    const prev = document.body.style.background;
    document.body.style.background = "#ffffff";
    return () => {
      document.body.style.background = prev;
    };
  }, []);

  if (!wo) {
    return (
      <div style={{ padding: 22 }}>
        <div style={{ fontWeight: 700 }}>Payslip</div>
        <div>Not found.</div>
        <Button variant="primary" onClick={() => navigate("/work-orders")}>
          Back
        </Button>
      </div>
    );
  }

  return (
    <div style={{ padding: 26, maxWidth: 820, margin: "0 auto", color: "#111827" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ fontSize: 12, lineHeight: 1.6 }}>
          <div>প্রাপকঃ&nbsp;&nbsp; {wo.submittedBy}</div>
          <div>প্রেরকঃ&nbsp;&nbsp; {wo.createdByDeptCode ?? "M(EMT)"}</div>
        </div>
        <div style={{ textAlign: "center", flex: 1 }}>
          <div style={{ fontSize: 18, fontWeight: 700 }}>অভ্যন্তরীণ কাজের নির্দেশনা</div>
        </div>
        <div style={{ fontSize: 12, lineHeight: 1.6, textAlign: "right" }}>
          <div>তারিখ</div>
          <div style={{ fontWeight: 700 }}>{fmtDMY(wo.submissionDate)}</div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, fontSize: 12 }}>
        <div>
          <b>কাজের বিবরণী</b>
          <div style={{ marginTop: 6 }}>{`${wo.lines[0]?.item ?? ""} - ${wo.lines[0]?.issue ?? ""}`}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <b>অবস্থান</b>
          <div style={{ marginTop: 6 }}>{wo.lines[0]?.location ?? ""}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <b>প্রাধান্য</b>
          <div style={{ marginTop: 6 }}>{wo.priority}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <b>অবস্থা</b>
          <div style={{ marginTop: 6 }}>{wo.status}</div>
        </div>
      </div>

      <div style={{ marginTop: 12, borderTop: "1px solid #111827", paddingTop: 10 }}>
        <div style={{ textAlign: "center", fontWeight: 700, marginBottom: 10 }}>শুধুমাত্র কর্ম সম্পাদনকারী বিভাগ/শাখা পূরণ করিবে</div>

        <div style={{ display: "flex", gap: 28, justifyContent: "space-between" }}>
          <div style={{ flex: 1, fontSize: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div>উপকরণের প্রাক্কলিত মূল্য</div>
              <div>{totals.material.toFixed(2)}</div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div>মোট মূল্য</div>
              <div style={{ fontWeight: 700 }}>{totals.total.toFixed(2)}</div>
            </div>
          </div>
          <div style={{ flex: 1, fontSize: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div>প্রাপ্তিসহ প্রাক্কলিত মূল্য</div>
              <div>0.00</div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div>প্রকল্প মূল্য</div>
              <div>0.00</div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div>উপকরণের মোট মূল্য</div>
              <div>{totals.material.toFixed(2)}</div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div>প্রাপ্তিসহ মোট মূল্য</div>
              <div>{totals.total.toFixed(2)}</div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 10, fontSize: 11, lineHeight: 1.6 }}>
          {wo.history.slice(0, 12).map((h, idx) => (
            <div key={idx}>
              ({h.at}) --&gt; <b>{h.by}</b> : {h.message}
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 18, display: "flex", justifyContent: "space-between" }} className="noPrint">
        <Button variant="ghost" onClick={() => navigate(`/work-orders/${wo.id}/review`)}>
          Back
        </Button>
        <Button variant="primary" onClick={() => window.print()}>
          Print
        </Button>
      </div>

      <style>{`
        @media print {
          .noPrint { display: none !important; }
          body { background: #fff !important; }
        }
      `}</style>
    </div>
  );
}

