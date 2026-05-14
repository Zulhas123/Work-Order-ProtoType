import React, { createContext, PropsWithChildren, useContext, useEffect, useMemo, useReducer } from "react";

export type Language = "English" | "Bangla";

export type SmsConfig = {
  enabled: boolean;
  providerName: string;
  senderId: string;
  apiKeyMasked: string;
  lastTestAt?: string;
  lastTestTo?: string;
  lastTestStatus?: "success" | "failed";
};

export type MasterData = {
  departments: string[];
  workOrderTypes: string[];
};

export type AppNotification = {
  id: string;
  at: string; // yyyy-mm-dd hh:mm:ss
  title: string;
  message: string;
  read: boolean;
};

export type SettingsState = {
  currentUserId: string | null;
  language: Language;
  sms: SmsConfig;
  master: MasterData;
  notifications: AppNotification[];
};

type Action =
  | { type: "seed"; payload: SettingsState }
  | { type: "setLanguage"; payload: Language }
  | { type: "setCurrentUser"; payload: string | null }
  | { type: "setMaster"; payload: MasterData }
  | { type: "setSms"; payload: SmsConfig }
  | { type: "notify"; payload: AppNotification }
  | { type: "markRead"; payload: { id: string } }
  | { type: "markAllRead" };

const LS_KEY = "wo_settings_v1";

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

function nowStamp() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
}

function reducer(state: SettingsState, action: Action): SettingsState {
  switch (action.type) {
    case "seed":
      return action.payload;
    case "setLanguage":
      return { ...state, language: action.payload };
    case "setCurrentUser":
      return { ...state, currentUserId: action.payload };
    case "setMaster":
      return { ...state, master: action.payload };
    case "setSms":
      return { ...state, sms: action.payload };
    case "notify":
      return { ...state, notifications: [action.payload, ...state.notifications].slice(0, 50) };
    case "markRead":
      return { ...state, notifications: state.notifications.map((n) => (n.id === action.payload.id ? { ...n, read: true } : n)) };
    case "markAllRead":
      return { ...state, notifications: state.notifications.map((n) => ({ ...n, read: true })) };
    default:
      return state;
  }
}

function load(): SettingsState | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SettingsState;
    if (!parsed || typeof parsed !== "object") return null;
    return parsed;
  } catch {
    return null;
  }
}

function save(state: SettingsState) {
  localStorage.setItem(LS_KEY, JSON.stringify(state));
}

function seedSettings(): SettingsState {
  return {
    currentUserId: null,
    language: "English",
    sms: {
      enabled: false,
      providerName: "MockSMS",
      senderId: "WORKORDER",
      apiKeyMasked: "••••••••••••••••"
    },
    master: {
      departments: ["M(EMT)", "M(CEMT)T-S", "JABA", "HQ"],
      workOrderTypes: ["Electrical Maintenance - Inside", "Electrical Maintenance - Outside", "Mechanical Maintenance", "Civil Works", "IT/Network"]
    },
    notifications: [
      { id: uid("ntf"), at: nowStamp(), title: "Prototype ready", message: "Menu features are now functional with realistic local data.", read: false }
    ]
  };
}

type Ctx = {
  state: SettingsState;
  setLanguage: (lang: Language) => void;
  setCurrentUser: (id: string | null) => void;
  setMaster: (master: MasterData) => void;
  setSms: (sms: SmsConfig) => void;
  notify: (title: string, message: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  uid: (prefix: string) => string;
  nowStamp: () => string;
};

const SettingsContext = createContext<Ctx | null>(null);

export function SettingsProvider({ children }: PropsWithChildren) {
  const [state, dispatch] = useReducer(reducer, seedSettings());

  useEffect(() => {
    const loaded = load();
    if (loaded) dispatch({ type: "seed", payload: loaded });
  }, []);

  useEffect(() => {
    save(state);
  }, [state]);

  const value = useMemo<Ctx>(() => {
    return {
      state,
      setLanguage: (lang) => dispatch({ type: "setLanguage", payload: lang }),
      setCurrentUser: (id) => dispatch({ type: "setCurrentUser", payload: id }),
      setMaster: (master) => dispatch({ type: "setMaster", payload: master }),
      setSms: (sms) => dispatch({ type: "setSms", payload: sms }),
      notify: (title, message) =>
        dispatch({
          type: "notify",
          payload: { id: uid("ntf"), at: nowStamp(), title, message, read: false }
        }),
      markNotificationRead: (id) => dispatch({ type: "markRead", payload: { id } }),
      markAllNotificationsRead: () => dispatch({ type: "markAllRead" }),
      uid,
      nowStamp
    };
  }, [state]);

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}

