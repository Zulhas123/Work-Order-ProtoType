import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSettings } from "../store/settings";
import { useUsers } from "../store/users";
import { Button, Field, Panel } from "../ui/controls";

export default function ProfilePage() {
  const navigate = useNavigate();
  const { state, setCurrentUser, notify } = useSettings();
  const { users, activeUsers, getById, update } = useUsers();

  const current = useMemo(() => (state.currentUserId ? getById(state.currentUserId) : undefined), [getById, state.currentUserId]);
  const [displayName, setDisplayName] = useState(current?.displayName ?? "");
  const [phone, setPhone] = useState(current?.phone ?? "");
  const [email, setEmail] = useState(current?.email ?? "");

  const canSave = Boolean(current && displayName.trim());

  return (
    <div>
      <div className="pageTitle">Profile</div>
      <Panel>
        <div className="rowBetween" style={{ alignItems: "flex-start" }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, marginBottom: 10 }}>Current User</div>
            <Field label="Signed in as">
              <select
                className="select"
                value={state.currentUserId ?? ""}
                onChange={(e) => {
                  const id = e.target.value || null;
                  setCurrentUser(id);
                  const u = id ? users.find((x) => x.id === id) : undefined;
                  setDisplayName(u?.displayName ?? "");
                  setPhone(u?.phone ?? "");
                  setEmail(u?.email ?? "");
                }}
              >
                <option value="">(Not selected)</option>
                {activeUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.displayName} — {u.role}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <div style={{ width: 340 }}>
            <div style={{ fontWeight: 700, marginBottom: 10 }}>Quick Actions</div>
            <div className="stack">
              <Button
                variant="ghost"
                onClick={() => {
                  navigate("/users");
                }}
              >
                Manage Users
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  setCurrentUser(null);
                  notify("Logged out", "You have been signed out (prototype).");
                  navigate("/dashboard");
                }}
              >
                Log Out
              </Button>
            </div>
          </div>
        </div>

        <div style={{ height: 14 }} />

        {!current ? (
          <div className="muted">Select a user to edit profile details.</div>
        ) : (
          <>
            <div style={{ fontWeight: 700, marginBottom: 10 }}>Profile Details</div>
            <div className="formGrid">
              <Field label="Username">
                <input className="input" value={current.username} disabled />
              </Field>
              <Field label="Role">
                <input className="input" value={current.role} disabled />
              </Field>
              <Field label="Dept Code">
                <input className="input" value={current.deptCode} disabled />
              </Field>
              <Field label="Display Name">
                <input className="input" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
              </Field>
              <Field label="Phone">
                <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </Field>
              <Field label="Email">
                <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
              </Field>
            </div>

            <div className="row" style={{ justifyContent: "flex-end", marginTop: 14 }}>
              <Button
                variant="primary"
                disabled={!canSave}
                onClick={() => {
                  update({ ...current, displayName: displayName.trim(), phone: phone.trim(), email: email.trim() });
                  notify("Profile updated", "Profile details have been saved.");
                  alert("Saved.");
                }}
              >
                Save
              </Button>
            </div>
          </>
        )}
      </Panel>
    </div>
  );
}

