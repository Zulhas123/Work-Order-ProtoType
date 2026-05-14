import { useMemo, useState } from "react";
import { useSettings } from "../store/settings";
import { Button, Field, Panel } from "../ui/controls";

export default function SmsConfigPage() {
  const { state, setSms, notify } = useSettings();
  const [enabled, setEnabled] = useState(state.sms.enabled ? "yes" : "no");
  const [providerName, setProviderName] = useState(state.sms.providerName);
  const [senderId, setSenderId] = useState(state.sms.senderId);
  const [apiKeyMasked, setApiKeyMasked] = useState(state.sms.apiKeyMasked);

  const [testTo, setTestTo] = useState(state.sms.lastTestTo ?? "");
  const [testMsg, setTestMsg] = useState("Work Order test message");

  const canSave = providerName.trim() && senderId.trim();
  const canTest = enabled === "yes" && testTo.trim() && testMsg.trim();

  const statusLabel = useMemo(() => {
    if (!state.sms.lastTestAt) return "No test sent yet.";
    const s = state.sms.lastTestStatus === "success" ? "Success" : "Failed";
    return `${s} — ${state.sms.lastTestAt} → ${state.sms.lastTestTo ?? ""}`;
  }, [state.sms.lastTestAt, state.sms.lastTestStatus, state.sms.lastTestTo]);

  return (
    <div>
      <div className="pageTitle">SMS Config</div>
      <Panel>
        <div className="rowBetween" style={{ alignItems: "flex-start" }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, marginBottom: 10 }}>Provider Settings</div>
            <div className="formGrid">
              <Field label="Enabled">
                <select className="select" value={enabled} onChange={(e) => setEnabled(e.target.value)}>
                  <option value="no">Disabled</option>
                  <option value="yes">Enabled</option>
                </select>
              </Field>
              <Field label="Provider Name">
                <input className="input" value={providerName} onChange={(e) => setProviderName(e.target.value)} />
              </Field>
              <Field label="Sender ID">
                <input className="input" value={senderId} onChange={(e) => setSenderId(e.target.value)} />
              </Field>
              <Field label="API Key (masked)">
                <input className="input" value={apiKeyMasked} onChange={(e) => setApiKeyMasked(e.target.value)} />
              </Field>
            </div>
            <div className="row" style={{ justifyContent: "flex-end", marginTop: 14 }}>
              <Button
                variant="primary"
                disabled={!canSave}
                onClick={() => {
                  setSms({
                    ...state.sms,
                    enabled: enabled === "yes",
                    providerName: providerName.trim(),
                    senderId: senderId.trim(),
                    apiKeyMasked: apiKeyMasked.trim() || "••••••••••••••••"
                  });
                  notify("SMS config saved", "SMS provider settings have been updated.");
                  alert("Saved.");
                }}
              >
                Save
              </Button>
            </div>
          </div>
          <div style={{ width: 340 }}>
            <div style={{ fontWeight: 700, marginBottom: 10 }}>Test SMS</div>
            <div className="stack">
              <Field label="To (phone)">
                <input className="input" value={testTo} onChange={(e) => setTestTo(e.target.value)} placeholder="+88017..." />
              </Field>
              <Field label="Message">
                <textarea className="textarea" value={testMsg} onChange={(e) => setTestMsg(e.target.value)} style={{ height: 110 }} />
              </Field>
              <div className="muted">{statusLabel}</div>
              <Button
                variant="primary"
                disabled={!canTest}
                onClick={() => {
                  const ok = enabled === "yes";
                  setSms({
                    ...state.sms,
                    enabled: enabled === "yes",
                    providerName: providerName.trim(),
                    senderId: senderId.trim(),
                    apiKeyMasked: apiKeyMasked.trim() || "••••••••••••••••",
                    lastTestAt: new Date().toISOString(),
                    lastTestTo: testTo.trim(),
                    lastTestStatus: ok ? "success" : "failed"
                  });
                  notify("SMS test", ok ? `Sent test SMS to ${testTo.trim()}` : "SMS is disabled.");
                  alert(ok ? "Test sent (mock)." : "Disabled.");
                }}
              >
                Send Test
              </Button>
            </div>
          </div>
        </div>
      </Panel>
    </div>
  );
}

