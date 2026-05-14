import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./styles/global.css";
import { WorkOrdersProvider } from "./store/workOrders";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <WorkOrdersProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </WorkOrdersProvider>
  </React.StrictMode>
);

