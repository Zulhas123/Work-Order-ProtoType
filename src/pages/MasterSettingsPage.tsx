import { useMemo, useState } from "react";
import { useSettings } from "../store/settings";
import { Button, Field, Panel } from "../ui/controls";

function uniqTrimmed(items: string[]) {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const it of items) {
    const v = it.trim();
    if (!v) continue;
    const k = v.toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(v);
  }
  return out;
}

export default function MasterSettingsPage() {
  const { state, setMaster, notify } = useSettings();
  const [deptText, setDeptText] = useState(state.master.departments.join("\n"));
  const [typeText, setTypeText] = useState(state.master.workOrderTypes.join("\n"));

  const next = useMemo(() => {
    return {
      departments: uniqTrimmed(deptText.split("\n")),
      workOrderTypes: uniqTrimmed(typeText.split("\n"))
    };
  }, [deptText, typeText]);

  return (
    <div>
      <div className="pageTitle">Master Setting</div>
      <Panel>
        <div className="muted" style={{ marginBottom: 12 }}>
          Configure lookup values used across the app (stored locally).
        </div>

        <div className="rowBetween" style={{ alignItems: "flex-start", gap: 18 }}>
          <div style={{ flex: 1 }}>
            <Field label="Departments (one per line)">
              <textarea className="textarea" value={deptText} onChange={(e) => setDeptText(e.target.value)} style={{ height: 220 }} />
            </Field>
          </div>
          <div style={{ flex: 1 }}>
            <Field label="Work Order Types (one per line)">
              <textarea className="textarea" value={typeText} onChange={(e) => setTypeText(e.target.value)} style={{ height: 220 }} />
            </Field>
          </div>
        </div>

        <div className="row" style={{ justifyContent: "flex-end", marginTop: 14 }}>
          <Button
            variant="primary"
            onClick={() => {
              setMaster(next);
              notify("Master settings saved", "Departments and work order types have been updated.");
              alert("Saved.");
            }}
          >
            Save
          </Button>
        </div>
      </Panel>
    </div>
  );
}

