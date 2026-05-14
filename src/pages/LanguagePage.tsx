import { Button, Panel } from "../ui/controls";
import { Language, useSettings } from "../store/settings";

const LANGS: Language[] = ["English", "Bangla"];

export default function LanguagePage() {
  const { state, setLanguage, notify } = useSettings();

  return (
    <div>
      <div className="pageTitle">{state.language}</div>
      <Panel>
        <div className="muted" style={{ marginBottom: 12 }}>
          Select UI language (prototype toggle).
        </div>
        <div className="row">
          {LANGS.map((l) => (
            <Button
              key={l}
              variant={state.language === l ? "primary" : "ghost"}
              onClick={() => {
                setLanguage(l);
                notify("Language changed", `Language set to ${l}.`);
              }}
            >
              {l}
            </Button>
          ))}
        </div>
      </Panel>
    </div>
  );
}

