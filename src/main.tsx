import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./styles/global.css";
import { WorkOrdersProvider } from "./store/workOrders";
import { UsersProvider } from "./store/users";
import { SettingsProvider } from "./store/settings";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <SettingsProvider>
      <UsersProvider>
        <WorkOrdersProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </WorkOrdersProvider>
      </UsersProvider>
    </SettingsProvider>
  </React.StrictMode>
);
