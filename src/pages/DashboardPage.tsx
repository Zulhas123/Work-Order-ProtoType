import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSettings } from "../store/settings";
import { useUsers } from "../store/users";
import { useWorkOrders } from "../store/workOrders";
import { Button, Field, Modal, Panel } from "../ui/controls";

function tryParseWorkOrderId(raw: string) {
  const v = raw.trim();
  if (!v) return null;
  if (v.startsWith("workorder:")) return v.slice("workorder:".length).trim() || null;
  if (v.startsWith("wo:")) return v.slice("wo:".length).trim() || null;
  return v;
}

function fmtDMY(iso: string) {
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${d}-${m}-${y}`;
}

function isBarcodeDetectorSupported() {
  return typeof (window as any).BarcodeDetector === "function";
}

async function listCameras() {
  try {
    if (!navigator.mediaDevices?.enumerateDevices) return [];
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.filter((d) => d.kind === "videoinput");
  } catch {
    return [];
  }
}

function openTel(phone: string) {
  window.location.href = `tel:${phone}`;
}

function copyText(text: string) {
  navigator.clipboard?.writeText(text).catch(() => undefined);
}

function ScanQrModal({
  open,
  onClose,
  onDetected
}: {
  open: boolean;
  onClose: () => void;
  onDetected: (value: string) => void;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const [manual, setManual] = useState("");
  const [status, setStatus] = useState<string>("");
  const [cameraLabel, setCameraLabel] = useState<string>("");

  useEffect(() => {
    if (!open) return;
    setStatus("");
    setManual("");

    let cancelled = false;

    async function start() {
      if (!videoRef.current) return;
      if (!navigator.mediaDevices?.getUserMedia) {
        setStatus("Camera not supported in this browser.");
        return;
      }
      try {
        const cameras = await listCameras();
        const preferBack = cameras.find((c) => /back|rear|environment/i.test(c.label));
        const stream = await navigator.mediaDevices.getUserMedia({
          video: preferBack ? { deviceId: { exact: preferBack.deviceId } } : { facingMode: "environment" }
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        const track = stream.getVideoTracks()[0];
        const settings = track?.getSettings?.();
        setCameraLabel(preferBack?.label || (settings?.facingMode ? String(settings.facingMode) : "Camera"));
        videoRef.current.srcObject = stream;
        await videoRef.current.play();

        if (!isBarcodeDetectorSupported()) {
          setStatus("QR scanning not supported here. Use manual entry below.");
          return;
        }

        const detector = new (window as any).BarcodeDetector({ formats: ["qr_code"] });
        const tick = async () => {
          if (!videoRef.current) return;
          try {
            const res = await detector.detect(videoRef.current);
            if (res?.length) {
              const val = String(res[0].rawValue ?? "");
              if (val) {
                onDetected(val);
                onClose();
                return;
              }
            }
          } catch {
            // ignore per-frame errors
          }
          rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
      } catch (e: any) {
        setStatus(e?.message ? String(e.message) : "Unable to access camera.");
      }
    }

    start();

    return () => {
      cancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, [onClose, onDetected, open]);

  if (!open) return null;
  return (
    <Modal title="Scan QR" onClose={onClose}>
      <div className="rowBetween" style={{ alignItems: "flex-start", gap: 18 }}>
        <div style={{ flex: 1 }}>
          <div className="muted" style={{ marginBottom: 8 }}>
            Point your camera at a QR code containing a Work Order ID (e.g. <b>workorder:WO_ID</b>).
          </div>
          <div className="scanFrame">
            <video ref={videoRef} className="scanVideo" muted playsInline />
          </div>
          <div className="muted" style={{ marginTop: 8 }}>
            {cameraLabel ? `Camera: ${cameraLabel}` : ""} {status ? `• ${status}` : ""}
          </div>
        </div>

        <div style={{ width: 340 }}>
          <div style={{ fontWeight: 700, marginBottom: 10 }}>Manual Entry</div>
          <div className="stack">
            <Field label="QR / Work Order ID">
              <input className="input" value={manual} onChange={(e) => setManual(e.target.value)} placeholder="workorder:wo_..." />
            </Field>
            <Button
              variant="primary"
              disabled={!manual.trim()}
              onClick={() => {
                onDetected(manual.trim());
                onClose();
              }}
            >
              Open Work Order
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { workOrders } = useWorkOrders();
  const { state: settingsState, notify } = useSettings();
  const { getById: getUserById } = useUsers();
  const currentUser = settingsState.currentUserId ? getUserById(settingsState.currentUserId) : undefined;

  const [scanOpen, setScanOpen] = useState(false);

  const stats = useMemo(() => {
    const total = workOrders.length;
    const pending = workOrders.filter((w) => w.status === "Open" || w.status === "Accepted" || w.status === "Work Undergoing").length;
    const completed = workOrders.filter((w) => w.status === "Completed & Waiting for Acceptance").length;
    const closed = workOrders.filter((w) => w.status === "Close" || w.status === "Closed").length;
    return { total, pending, completed, closed };
  }, [workOrders]);

  const myAssigned = useMemo(() => {
    const me = currentUser?.displayName;
    if (!me) return [];
    return workOrders.filter((w) => (w.assignedTo ?? "").trim() === me).slice(0, 6);
  }, [currentUser?.displayName, workOrders]);

  const recent = useMemo(() => {
    return [...workOrders]
      .sort((a, b) => (a.submissionDate < b.submissionDate ? 1 : -1))
      .slice(0, 6);
  }, [workOrders]);

  const hotlines = useMemo(() => {
    return [
      { label: "Maintenance Control Room", phone: "+8801700000000" },
      { label: "Electrical Supervisor", phone: "+8801722222222" },
      { label: "Security Desk", phone: "+8801755555555" }
    ];
  }, []);

  return (
    <div>
      <div className="rowBetween" style={{ alignItems: "flex-end" }}>
        <div>
          <div className="pageTitle" style={{ marginBottom: 6 }}>
            Dashboard
          </div>
          <div className="muted">
            {currentUser ? (
              <>
                Signed in as <b>{currentUser.displayName}</b> • {currentUser.role} • {settingsState.language}
              </>
            ) : (
              <>
                No active user selected •{" "}
                <button className="linkBtn" onClick={() => navigate("/profile")}>
                  Select user
                </button>
              </>
            )}
          </div>
        </div>
        <div className="row">
          <Button variant="primary" className="btnSmall" onClick={() => navigate("/work-orders/create")}>
            New Work Order
          </Button>
          <Button variant="primary" className="btnSmall" onClick={() => setScanOpen(true)}>
            Scan QR
          </Button>
        </div>
      </div>

      <div className="gridCards" style={{ marginTop: 18 }}>
        <div className="statCard">
          <div className="statValue" style={{ color: "#4f46e5" }}>
            {stats.total}
          </div>
          <div className="statSub">Total</div>
          <div className="statLabel">TOTAL WORK ORDERS</div>
        </div>
        <div className="statCard">
          <div className="statValue" style={{ color: "#22c55e" }}>
            {stats.pending}
          </div>
          <div className="statSub">Pending</div>
          <div className="statLabel">OPEN / ACCEPTED / ONGOING</div>
        </div>
        <div className="statCard">
          <div className="statValue" style={{ color: "#f59e0b" }}>
            {stats.completed}
          </div>
          <div className="statSub">Completed</div>
          <div className="statLabel">WAITING FOR ACCEPTANCE</div>
        </div>
        <div className="statCard">
          <div className="statValue" style={{ color: "#fb7185" }}>
            {stats.closed}
          </div>
          <div className="statSub">Closed</div>
          <div className="statLabel">CLOSED / CLOSE</div>
        </div>
      </div>

      <div className="dashGrid">
        <Panel>
          <div className="dashHeader">
            <div>
              <div style={{ fontWeight: 800 }}>Hotline</div>
              <div className="muted">Quick call / copy numbers</div>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                const body = hotlines.map((h) => `${h.label}: ${h.phone}`).join("\n");
                copyText(body);
                notify("Hotline copied", "Hotline numbers copied to clipboard.");
                alert("Copied.");
              }}
            >
              Copy all
            </Button>
          </div>
          <div className="stack">
            {hotlines.map((h) => (
              <div key={h.phone} className="hotlineRow">
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700 }}>{h.label}</div>
                  <div className="muted">{h.phone}</div>
                </div>
                <div className="row" style={{ gap: 10 }}>
                  <Button size="sm" variant="ghost" onClick={() => copyText(h.phone)}>
                    Copy
                  </Button>
                  <Button size="sm" variant="primary" onClick={() => openTel(h.phone)}>
                    Call
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel>
          <div className="dashHeader">
            <div>
              <div style={{ fontWeight: 800 }}>My Assigned Work Orders</div>
              <div className="muted">Based on current user</div>
            </div>
            <Button size="sm" variant="ghost" onClick={() => navigate("/work-orders")}>
              View all
            </Button>
          </div>
          <div className="tableWrap">
            <table>
              <thead>
                <tr>
                  <th>Order No.</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Open</th>
                </tr>
              </thead>
              <tbody>
                {myAssigned.map((w) => (
                  <tr key={w.id}>
                    <td style={{ fontWeight: 700 }}>{w.orderNo}</td>
                    <td>{fmtDMY(w.submissionDate)}</td>
                    <td>{w.status}</td>
                    <td style={{ textAlign: "right" }}>
                      <Button size="sm" variant="primary" onClick={() => navigate(`/work-orders/${w.id}/review`)}>
                        Open
                      </Button>
                    </td>
                  </tr>
                ))}
                {myAssigned.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="muted">
                      {currentUser ? "No assigned work orders." : "Select a user to see assigned work orders."}
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel>
          <div className="dashHeader">
            <div>
              <div style={{ fontWeight: 800 }}>Recent Work Orders</div>
              <div className="muted">Latest submissions</div>
            </div>
          </div>
          <div className="tableWrap">
            <table>
              <thead>
                <tr>
                  <th>Order No.</th>
                  <th>Submitted By</th>
                  <th>Date</th>
                  <th style={{ textAlign: "right" }}>Open</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((w) => (
                  <tr key={w.id}>
                    <td style={{ fontWeight: 700 }}>{w.orderNo}</td>
                    <td>{w.submittedBy}</td>
                    <td>{fmtDMY(w.submissionDate)}</td>
                    <td style={{ textAlign: "right" }}>
                      <Button size="sm" variant="ghost" onClick={() => navigate(`/work-orders/${w.id}/review`)}>
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
                {recent.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="muted">
                      No work orders yet.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>

      <ScanQrModal
        open={scanOpen}
        onClose={() => setScanOpen(false)}
        onDetected={(raw) => {
          const id = tryParseWorkOrderId(raw);
          if (!id) return;
          const target = workOrders.find((w) => w.id === id);
          if (!target) {
            notify("QR scan", "Work order not found for scanned code.");
            alert("Work order not found for scanned code.");
            return;
          }
          notify("QR scan", `Opening ${target.orderNo}`);
          navigate(`/work-orders/${target.id}/review`);
        }}
      />
    </div>
  );
}
