import { NavLink } from "react-router-dom";
import "./BottomNav.css";

const tabs = [
  { path: "/dashboard", label: "Home", icon: "🏠" },
  { path: "/fare-compare", label: "Compare", icon: "📊" },
  { path: "/track/latest", label: "Trips", icon: "🗺️" },
  { path: "/profile", label: "Profile", icon: "👤" },
];

export default function BottomNav() {
  return (
    <nav className="bottom-nav" id="bottom-nav">
      {tabs.map((tab) => (
        <NavLink
          key={tab.path}
          to={tab.path}
          className={({ isActive }) =>
            `bottom-nav__tab ${isActive ? "bottom-nav__tab--active" : ""}`
          }
        >
          <span className="bottom-nav__icon">{tab.icon}</span>
          <span className="bottom-nav__label">{tab.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
