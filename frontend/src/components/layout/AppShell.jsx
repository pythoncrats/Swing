import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { LogOut, Menu, X } from "lucide-react";
import Logo from "../ui/Logo";
import NotificationBell from "./NotificationBell";
import { useAuth } from "../../context/AuthContext";

const ROLE_LABEL = {
  trainee: "Trainee",
  trainer: "Trainer",
  admin: "Administrator",
};

export default function AppShell({ navItems, children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const initials = (user?.name || "?")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const SidebarContent = (
    <div className="flex h-full flex-col">
      <div className="px-5 pb-6 pt-6">
        <Logo dark />
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-amber-500 text-navy-950"
                  : "text-paper-200/80 hover:bg-white/5 hover:text-paper-50"
              }`
            }
          >
            <item.icon size={17} strokeWidth={1.85} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-white/10 px-3 py-4">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-paper-200/70 transition-colors hover:bg-coral-500/10 hover:text-coral-400"
        >
          <LogOut size={17} strokeWidth={1.85} />
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-paper-50 lg:flex">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 bg-navy-900 lg:block">{SidebarContent}</aside>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-navy-950/60" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-64 bg-navy-900">{SidebarContent}</aside>
        </div>
      )}

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-paper-200 bg-paper-50/90 px-5 py-3.5 backdrop-blur">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="grid h-9 w-9 place-items-center rounded-full text-ink-500 hover:bg-paper-100 lg:hidden"
              aria-label="Open menu"
            >
              <Menu size={18} />
            </button>
            <div className="lg:hidden">
              <Logo />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <NotificationBell />
            <div className="flex items-center gap-2.5 border-l border-paper-200 pl-3">
              <div className="grid h-8 w-8 place-items-center rounded-full bg-navy-900 text-xs font-semibold text-paper-50">
                {initials}
              </div>
              <div className="hidden text-left sm:block">
                <p className="text-sm font-medium leading-none text-ink-900">{user?.name}</p>
                <p className="mt-0.5 text-xs leading-none text-ink-500">{ROLE_LABEL[user?.role]}</p>
              </div>
            </div>
          </div>
        </header>

        {mobileOpen && (
          <button
            onClick={() => setMobileOpen(false)}
            className="fixed right-4 top-4 z-50 grid h-9 w-9 place-items-center rounded-full bg-navy-900 text-paper-50 lg:hidden"
          >
            <X size={16} />
          </button>
        )}

        <main className="flex-1 px-5 py-6 sm:px-8 sm:py-8">{children}</main>
      </div>
    </div>
  );
}
