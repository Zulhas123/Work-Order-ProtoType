import React, { createContext, PropsWithChildren, useContext, useEffect, useMemo, useReducer } from "react";

export type WorkOrderStatus =
  | "Open"
  | "Accepted"
  | "Work Undergoing"
  | "Completed & Waiting for Acceptance"
  | "Close"
  | "Closed";

export type Priority = "urgent" | "medium" | "low";

export type WorkOrderLine = {
  id: string;
  item: string;
  quantity: number;
  issue: string;
  location: string;
  priority: Priority;
  cftNote?: string;
  state?: "Select" | "Done" | "Pending";
  completionDate?: string; // yyyy-mm-dd
};

export type MaterialLine = {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
};

export type WorkOrder = {
  id: string;
  orderNo: string; // e.g. 492/2023
  submittedBy: string;
  submissionDate: string; // yyyy-mm-dd
  submittedTo: string;
  assignedTo?: string;
  type: string;
  dept: string;
  status: WorkOrderStatus;
  priority: Priority;
  lines: WorkOrderLine[];
  materials: MaterialLine[];
  additionalDescription?: string;
  createdByDeptCode?: string; // e.g. M(EMT)
  history: { at: string; by: string; message: string }[];
};

type State = { workOrders: WorkOrder[] };

type Action =
  | { type: "seed"; payload: WorkOrder[] }
  | { type: "create"; payload: WorkOrder }
  | { type: "update"; payload: WorkOrder }
  | { type: "delete"; payload: { id: string } };

const LS_KEY = "wo_prototype_v1";

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

function toISODate(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function nowStamp() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  return `${dd}-${mm}-${yyyy} ${hh}:${mi}:${ss}`;
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "seed":
      return { workOrders: action.payload };
    case "create":
      return { workOrders: [action.payload, ...state.workOrders] };
    case "update":
      return { workOrders: state.workOrders.map((w) => (w.id === action.payload.id ? action.payload : w)) };
    case "delete":
      return { workOrders: state.workOrders.filter((w) => w.id !== action.payload.id) };
    default:
      return state;
  }
}

function load(): WorkOrder[] | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as WorkOrder[];
    if (!Array.isArray(parsed)) return null;
    return parsed;
  } catch {
    return null;
  }
}

function save(workOrders: WorkOrder[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(workOrders));
}

function seedData(): WorkOrder[] {
  const base: Omit<WorkOrder, "id"> = {
    orderNo: "493/2026",
    submittedBy: "M(EMT)",
    submissionDate: toISODate(new Date()),
    submittedTo: "M(CEMT)T-S",
    assignedTo: "",
    type: "ইলেক্ট্রিক্যাল মেইনটেন্যান্স-ভিতর",
    dept: "",
    status: "Open",
    priority: "urgent",
    lines: [
      {
        id: uid("line"),
        item: "লাইট",
        quantity: 2,
        issue: "এনার্জি লাইট জ্বলবে না",
        location: "ভিতর-এ",
        priority: "urgent",
        state: "Select",
        completionDate: toISODate(new Date())
      }
    ],
    materials: [],
    additionalDescription: "",
    createdByDeptCode: "M(EMT)",
    history: [{ at: nowStamp(), by: "M(EMT)", message: "Work order created" }]
  };

  const samples: WorkOrder[] = [
    { ...base, id: uid("wo") },
    {
      ...base,
      id: uid("wo"),
      orderNo: "492/2023",
      submissionDate: "2023-11-11",
      submittedBy: "M(COPL-A)T",
      status: "Work Undergoing"
    },
    { ...base, id: uid("wo"), orderNo: "491/2023", submissionDate: "2023-11-09", submittedBy: "ATO(CMM)T", status: "Work Undergoing" },
    { ...base, id: uid("wo"), orderNo: "490/2023", submissionDate: "2023-11-09", submittedBy: "DGM(PGFM)", status: "Accepted" },
    { ...base, id: uid("wo"), orderNo: "489/2023", submissionDate: "2023-11-09", submittedBy: "DGM(PGFM)", status: "Open" },
    { ...base, id: uid("wo"), orderNo: "488/2023", submissionDate: "2023-11-06", submittedBy: "Test_Prerok_BGFCI", assignedTo: "ADNAN_PREROK(JABA)", status: "Completed & Waiting for Acceptance" },
    { ...base, id: uid("wo"), orderNo: "487/2023", submissionDate: "2023-08-17", submittedBy: "Admin", submittedTo: "DGM(EMT)", status: "Completed & Waiting for Acceptance" },
    { ...base, id: uid("wo"), orderNo: "486/2023", submissionDate: "2023-03-19", submittedBy: "Admin", submittedTo: "DGM(PGFM)", status: "Close" },
    { ...base, id: uid("wo"), orderNo: "485/2023", submissionDate: "2023-03-19", submittedBy: "DGM(PGFM)", submittedTo: "DGM(EMT)", status: "Open", priority: "urgent" }
  ];
  return samples;
}

type Ctx = {
  workOrders: WorkOrder[];
  create: (input: Omit<WorkOrder, "id" | "history"> & { history?: WorkOrder["history"] }) => string;
  update: (workOrder: WorkOrder, by?: string, message?: string) => void;
  remove: (id: string) => void;
  getById: (id: string) => WorkOrder | undefined;
  nextOrderNo: () => string;
  uid: (prefix: string) => string;
  nowStamp: () => string;
};

const WorkOrdersContext = createContext<Ctx | null>(null);

export function WorkOrdersProvider({ children }: PropsWithChildren) {
  const [state, dispatch] = useReducer(reducer, { workOrders: [] });

  useEffect(() => {
    const loaded = load();
    if (loaded && loaded.length) dispatch({ type: "seed", payload: loaded });
    else dispatch({ type: "seed", payload: seedData() });
  }, []);

  useEffect(() => {
    if (state.workOrders.length) save(state.workOrders);
  }, [state.workOrders]);

  const value = useMemo<Ctx>(() => {
    return {
      workOrders: state.workOrders,
      create: (input) => {
        const id = uid("wo");
        const wo: WorkOrder = {
          ...input,
          id,
          history: input.history ?? [{ at: nowStamp(), by: "Admin", message: "Work order created" }]
        };
        dispatch({ type: "create", payload: wo });
        return id;
      },
      update: (workOrder, by = "Admin", message = "Work order updated") => {
        const next: WorkOrder = {
          ...workOrder,
          history: [{ at: nowStamp(), by, message }, ...(workOrder.history ?? [])]
        };
        dispatch({ type: "update", payload: next });
      },
      remove: (id) => dispatch({ type: "delete", payload: { id } }),
      getById: (id) => state.workOrders.find((w) => w.id === id),
      nextOrderNo: () => {
        const year = new Date().getFullYear();
        const max = state.workOrders
          .map((w) => {
            const [n, y] = w.orderNo.split("/");
            if (Number(y) !== year) return 0;
            return Number(n) || 0;
          })
          .reduce((a, b) => Math.max(a, b), 0);
        return `${max + 1}/${year}`;
      },
      uid,
      nowStamp
    };
  }, [state.workOrders]);

  return <WorkOrdersContext.Provider value={value}>{children}</WorkOrdersContext.Provider>;
}

export function useWorkOrders() {
  const ctx = useContext(WorkOrdersContext);
  if (!ctx) throw new Error("useWorkOrders must be used within WorkOrdersProvider");
  return ctx;
}

