import React, { createContext, PropsWithChildren, useContext, useEffect, useMemo, useReducer } from "react";

export type UserRole = "Admin" | "Supervisor" | "Technician" | "Requester";

export type User = {
  id: string;
  username: string;
  displayName: string;
  deptCode: string;
  role: UserRole;
  phone?: string;
  email?: string;
  active: boolean;
};

type State = { users: User[] };

type Action =
  | { type: "seed"; payload: User[] }
  | { type: "create"; payload: User }
  | { type: "update"; payload: User }
  | { type: "delete"; payload: { id: string } };

const LS_KEY = "wo_users_v1";

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "seed":
      return { users: action.payload };
    case "create":
      return { users: [action.payload, ...state.users] };
    case "update":
      return { users: state.users.map((u) => (u.id === action.payload.id ? action.payload : u)) };
    case "delete":
      return { users: state.users.filter((u) => u.id !== action.payload.id) };
    default:
      return state;
  }
}

function load(): User[] | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as User[];
    if (!Array.isArray(parsed)) return null;
    return parsed;
  } catch {
    return null;
  }
}

function save(users: User[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(users));
}

function seedUsers(): User[] {
  return [
    {
      id: uid("usr"),
      username: "admin",
      displayName: "Admin",
      deptCode: "HQ",
      role: "Admin",
      email: "admin@example.com",
      phone: "+8801700000000",
      active: true
    },
    {
      id: uid("usr"),
      username: "m_emt",
      displayName: "M(EMT)",
      deptCode: "M(EMT)",
      role: "Requester",
      phone: "+8801711111111",
      active: true
    },
    {
      id: uid("usr"),
      username: "m_cemt_ts",
      displayName: "M(CEMT)T-S",
      deptCode: "M(CEMT)T-S",
      role: "Supervisor",
      phone: "+8801722222222",
      active: true
    },
    {
      id: uid("usr"),
      username: "adnan_prerok",
      displayName: "ADNAN_PREROK(JABA)",
      deptCode: "JABA",
      role: "Technician",
      phone: "+8801733333333",
      active: true
    },
    {
      id: uid("usr"),
      username: "prapok_jaba",
      displayName: "PRAPOK(JABA)",
      deptCode: "JABA",
      role: "Technician",
      phone: "+8801744444444",
      active: true
    }
  ];
}

type Ctx = {
  users: User[];
  activeUsers: User[];
  create: (input: Omit<User, "id">) => string;
  update: (user: User) => void;
  remove: (id: string) => void;
  getById: (id: string) => User | undefined;
  findByUsername: (username: string) => User | undefined;
  uid: (prefix: string) => string;
};

const UsersContext = createContext<Ctx | null>(null);

export function UsersProvider({ children }: PropsWithChildren) {
  const [state, dispatch] = useReducer(reducer, { users: [] });

  useEffect(() => {
    const loaded = load();
    if (loaded && loaded.length) dispatch({ type: "seed", payload: loaded });
    else dispatch({ type: "seed", payload: seedUsers() });
  }, []);

  useEffect(() => {
    if (state.users.length) save(state.users);
  }, [state.users]);

  const value = useMemo<Ctx>(() => {
    return {
      users: state.users,
      activeUsers: state.users.filter((u) => u.active),
      create: (input) => {
        const id = uid("usr");
        dispatch({ type: "create", payload: { ...input, id } });
        return id;
      },
      update: (user) => dispatch({ type: "update", payload: user }),
      remove: (id) => dispatch({ type: "delete", payload: { id } }),
      getById: (id) => state.users.find((u) => u.id === id),
      findByUsername: (username) => state.users.find((u) => u.username.toLowerCase() === username.toLowerCase()),
      uid
    };
  }, [state.users]);

  return <UsersContext.Provider value={value}>{children}</UsersContext.Provider>;
}

export function useUsers() {
  const ctx = useContext(UsersContext);
  if (!ctx) throw new Error("useUsers must be used within UsersProvider");
  return ctx;
}

