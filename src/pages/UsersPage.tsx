import { useMemo, useState } from "react";
import { Button, Field, Modal, Panel } from "../ui/controls";
import { User, UserRole, useUsers } from "../store/users";

const ROLES: UserRole[] = ["Admin", "Supervisor", "Technician", "Requester"];

function emptyUser(): Omit<User, "id"> {
  return {
    username: "",
    displayName: "",
    deptCode: "",
    role: "Requester",
    phone: "",
    email: "",
    active: true
  };
}

export default function UsersPage() {
  const { users, create, update, remove } = useUsers();
  const [query, setQuery] = useState("");
  const [show, setShow] = useState<null | { mode: "create" } | { mode: "edit"; id: string }>(null);

  const editing = show?.mode === "edit" ? users.find((u) => u.id === show.id) : null;
  const [draft, setDraft] = useState<Omit<User, "id">>(emptyUser());

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => {
      return (
        u.username.toLowerCase().includes(q) ||
        u.displayName.toLowerCase().includes(q) ||
        u.deptCode.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q) ||
        (u.phone ?? "").toLowerCase().includes(q) ||
        (u.email ?? "").toLowerCase().includes(q)
      );
    });
  }, [query, users]);

  function openCreate() {
    setDraft(emptyUser());
    setShow({ mode: "create" });
  }

  function openEdit(id: string) {
    const u = users.find((x) => x.id === id);
    if (!u) return;
    const { id: _, ...rest } = u;
    setDraft(rest);
    setShow({ mode: "edit", id });
  }

  const canSave = draft.username.trim() && draft.displayName.trim() && draft.deptCode.trim();

  return (
    <div>
      <div className="rowBetween">
        <div className="pageTitle" style={{ marginBottom: 8 }}>
          User
        </div>
        <Button variant="primary" className="btnSmall" onClick={openCreate}>
          New User
        </Button>
      </div>

      <Panel>
        <div className="tableControls">
          <div className="muted">Manage users (local prototype data).</div>
          <div className="row">
            <div className="muted">Search:</div>
            <input className="pillInput" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
        </div>

        <div className="tableWrap">
          <table>
            <thead>
              <tr>
                <th>Username</th>
                <th>Display Name</th>
                <th>Dept Code</th>
                <th>Role</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id}>
                  <td>{u.username}</td>
                  <td style={{ fontWeight: 700 }}>{u.displayName}</td>
                  <td>{u.deptCode}</td>
                  <td>{u.role}</td>
                  <td>{u.phone ?? ""}</td>
                  <td>{u.email ?? ""}</td>
                  <td>{u.active ? "Active" : "Inactive"}</td>
                  <td style={{ textAlign: "right" }}>
                    <div className="row" style={{ justifyContent: "flex-end" }}>
                      <Button size="sm" variant="primary" onClick={() => openEdit(u.id)}>
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => {
                          if (confirm(`Delete ${u.displayName}?`)) remove(u.id);
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="muted">
                    No users found.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </Panel>

      {show ? (
        <Modal
          title={show.mode === "create" ? "Create User" : "Edit User"}
          onClose={() => {
            setShow(null);
          }}
        >
          <div className="formGrid">
            <Field label="Username">
              <input className="input" value={draft.username} onChange={(e) => setDraft((p) => ({ ...p, username: e.target.value }))} />
            </Field>
            <Field label="Display Name">
              <input
                className="input"
                value={draft.displayName}
                onChange={(e) => setDraft((p) => ({ ...p, displayName: e.target.value }))}
              />
            </Field>
            <Field label="Dept Code">
              <input className="input" value={draft.deptCode} onChange={(e) => setDraft((p) => ({ ...p, deptCode: e.target.value }))} />
            </Field>
            <Field label="Role">
              <select className="select" value={draft.role} onChange={(e) => setDraft((p) => ({ ...p, role: e.target.value as UserRole }))}>
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Phone">
              <input className="input" value={draft.phone ?? ""} onChange={(e) => setDraft((p) => ({ ...p, phone: e.target.value }))} />
            </Field>
            <Field label="Email">
              <input className="input" value={draft.email ?? ""} onChange={(e) => setDraft((p) => ({ ...p, email: e.target.value }))} />
            </Field>
            <Field label="Active">
              <select className="select" value={draft.active ? "yes" : "no"} onChange={(e) => setDraft((p) => ({ ...p, active: e.target.value === "yes" }))}>
                <option value="yes">Active</option>
                <option value="no">Inactive</option>
              </select>
            </Field>
          </div>

          <div className="row" style={{ justifyContent: "flex-end", marginTop: 14 }}>
            <Button variant="ghost" onClick={() => setShow(null)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              disabled={!canSave}
              onClick={() => {
                if (show.mode === "create") {
                  create(draft);
                  setShow(null);
                  return;
                }
                if (!editing) return;
                update({ ...editing, ...draft });
                setShow(null);
              }}
            >
              Save
            </Button>
          </div>
        </Modal>
      ) : null}
    </div>
  );
}

