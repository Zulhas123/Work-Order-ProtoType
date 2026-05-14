import { useMemo } from "react";
import { useWorkOrders } from "../store/workOrders";

export default function DashboardPage() {
  const { workOrders } = useWorkOrders();
  const stats = useMemo(() => {
    const total = workOrders.length;
    const pending = workOrders.filter((w) => w.status === "Open" || w.status === "Accepted" || w.status === "Work Undergoing").length;
    const completed = workOrders.filter((w) => w.status === "Completed & Waiting for Acceptance").length;
    const closed = workOrders.filter((w) => w.status === "Close" || w.status === "Closed").length;
    return { total, pending, completed, closed };
  }, [workOrders]);

  return (
    <div>
      <div className="pageTitle">Dashboard</div>
      <div className="gridCards">
        <div className="statCard">
          <div className="statValue" style={{ color: "#4f46e5" }}>
            {stats.total}
          </div>
          <div className="statSub">Total</div>
          <div className="statLabel">TOTAL WO NUMBER</div>
        </div>
        <div className="statCard">
          <div className="statValue" style={{ color: "#22c55e" }}>
            {stats.pending}
          </div>
          <div className="statSub">Pending</div>
          <div className="statLabel">PENDING WO</div>
        </div>
        <div className="statCard">
          <div className="statValue" style={{ color: "#f59e0b" }}>
            {stats.completed}
          </div>
          <div className="statSub">Completed</div>
          <div className="statLabel">COMPLETED WO</div>
        </div>
        <div className="statCard">
          <div className="statValue" style={{ color: "#fb7185" }}>
            {stats.closed}
          </div>
          <div className="statSub">Closed</div>
          <div className="statLabel">WO CLOSED</div>
        </div>
      </div>
    </div>
  );
}

