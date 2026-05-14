import { PropsWithChildren, useMemo } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { IconBell, IconDashboard, IconDoc, IconGlobe, IconLogout, IconMenu, IconProfile, IconSettings, IconSms, IconUser } from "../ui/icons";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: IconDashboard },
  { to: "/users", label: "User", icon: IconUser },
  { to: "/work-orders", label: "Work Order", icon: IconDoc },
  { to: "/master", label: "Master Setting", icon: IconSettings, chevron: true },
  { to: "/profile", label: "Profile", icon: IconProfile },
  { to: "/language", label: "English", icon: IconGlobe, chevron: true },
  { to: "/report", label: "Report", icon: IconDashboard },
  { to: "/sms", label: "SMS Config", icon: IconSms }
];

export default function AppShell({ children }: PropsWithChildren) {
  const location = useLocation();
  const navigate = useNavigate();

  const activeTop = useMemo(() => {
    const match = NAV.find((n) => location.pathname.startsWith(n.to));
    return match?.label ?? "Work Order";
  }, [location.pathname]);

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">Work Order</div>
        <div className="menuTitle">Menu</div>
        <nav className="nav">
          {NAV.map(({ to, label, icon: Icon, chevron }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                ["navItem", isActive ? "navItemActive" : ""].filter(Boolean).join(" ")
              }
              end={to === "/dashboard"}
            >
              <Icon className="navIcon" />
              <div style={{ flex: 1 }}>{label}</div>
              {chevron ? <span style={{ opacity: 0.7 }}>{">"}</span> : null}
            </NavLink>
          ))}
        </nav>
        <div className="sidebarFooter">
          <div
            className="navItem"
            role="button"
            tabIndex={0}
            onClick={() => {
              // prototype: "logout" returns to dashboard
              navigate("/dashboard");
            }}
          >
            <IconLogout className="navIcon" />
            <div style={{ flex: 1 }}>Log Out</div>
          </div>
        </div>
      </aside>

      <section className="main">
        <header className="topbar">
          <div className="topLeft">
            <button className="hamburger" aria-label="Menu">
              <IconMenu style={{ width: 22, height: 22, opacity: 0.7 }} />
            </button>
            <div style={{ fontWeight: 600, color: "#111827" }}>{activeTop}</div>
          </div>
          <div className="topRight">
            <div className="topPill">
              <IconBell style={{ width: 18, height: 18, opacity: 0.65 }} />
            </div>
            <div className="topPill">
              <div>English</div>
            </div>
            <div className="topPill">
              <div style={{ fontWeight: 600 }}>{location.pathname.startsWith("/work-orders/") ? "M(EMT)" : "Admin"}</div>
              <div className="avatar" />
            </div>
          </div>
        </header>
        <main className="content">{children}</main>
      </section>
    </div>
  );
}

