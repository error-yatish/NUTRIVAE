import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Users,
  CalendarDays,
  Target,
  WalletCards,
  Settings,
  Search,
  Bell,
  ChevronDown,
  Menu,
  Sprout,
  HelpCircle,
  LogOut,
  UserRound,
  FolderKanban,
  Moon,
  Sun,
  ReceiptIndianRupee,
  ListChecks,
  Network,
  UserRoundCog
} from "lucide-react";
import { useState } from "react";
import { clsx } from "clsx";
import { Avatar } from "@/components";
import { useAuth } from "@/lib/auth";
import { Select } from "@/components/forms";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { navigationItems } from "@/common/constants/navigation";
import { useTheme } from "@/lib/theme";

const navigation = navigationItems;

export function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const { user, logout, switchCompany } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const visibleNavigation =
    user?.role === "EMPLOYEE"
      ? [
          { label: "Overview", path: "/", icon: UserRoundCog },
          { label: "My records", path: "/profile", icon: Users },
          { label: "Time off", path: "/leave", icon: CalendarDays },
          { label: "Performance", path: "/performance", icon: Target },
          { label: "Salary", path: "/payroll", icon: WalletCards },
          { label: "Taxation", path: "/taxation", icon: ReceiptIndianRupee },
          { label: "Quick info", path: "/quick-info", icon: ListChecks },
          { label: "Workflow", path: "/workflow", icon: Network },
          { label: "Projects", path: "/projects", icon: FolderKanban }
        ]
      : navigation;
  const title = visibleNavigation.find((item) => item.path === location.pathname)?.label ?? "Nutrivae";
  const notifications = useQuery({
    queryKey: ["notifications", user?.companyId],
    queryFn: () =>
      api.get<Array<{ id: string; title: string; message: string; href: string; createdAt: string }>>(
        "/notifications"
      ),
    enabled: Boolean(user)
  });
  const sidebar = (
    <aside className="flex h-full w-[248px] flex-col border-r border-base-300 bg-brand-50 px-3.5 py-5 text-base-content">
      <div className="mb-5 flex items-center gap-2.5 px-2.5">
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-content shadow-sm">
          <Sprout size={20} strokeWidth={2.4} />
        </span>
        <div>
          <div className="font-display text-[17px] font-extrabold leading-tight">Nutrivae</div>
          <div className="text-[10px] font-semibold uppercase tracking-[.16em] text-muted">People OS</div>
        </div>
      </div>
      <div className="mb-5 px-1">
        <span className="mb-1 block px-2 text-[9px] font-bold uppercase tracking-wider text-muted">
          Selected company
        </span>
        <Select
          variant="sidebar"
          value={user?.companyId}
          options={(user?.companies ?? []).map((company) => ({
            value: company.id,
            label: company.name,
            description: company.id === user?.companyId ? "Current workspace" : undefined
          }))}
          onChange={(companyId) => void switchCompany(companyId)}
        />
      </div>
      <nav className="scrollbar-none min-h-0 flex-1 space-y-1 overflow-y-auto">
        {visibleNavigation.map(({ label, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              clsx(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                isActive
                  ? "bg-primary text-primary-content shadow-sm"
                  : "text-base-content/70 hover:bg-brand-100 hover:text-base-content"
              )
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="shrink-0 space-y-1 border-t border-base-300 pt-4">
        <a
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-base-content/65 hover:bg-brand-100 hover:text-base-content"
          href="#"
        >
          <HelpCircle size={18} />
          Help center
        </a>
        {user?.role === "ADMIN" && (
          <NavLink
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-base-content/65 hover:bg-brand-100 hover:text-base-content"
            to="/settings"
          >
            <Settings size={18} />
            Settings
          </NavLink>
        )}
        <div className="relative">
          <button
            onClick={() => setAccountOpen((current) => !current)}
            className="mt-3 flex w-full items-center gap-3 rounded-lg border border-base-300 bg-base-200 p-2.5 text-left hover:bg-brand-100"
          >
            <Avatar name={user?.name ?? "User"} size="sm" />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-xs font-semibold">{user?.name}</span>
              <span className="block truncate text-[10px] text-muted">{user?.role.replace("_", " ")}</span>
            </span>
            <ChevronDown size={14} className={clsx("text-muted transition", accountOpen && "rotate-180")} />
          </button>
          {accountOpen && (
            <div className="absolute bottom-full left-0 mb-2 w-full rounded-field border border-line bg-base-200 p-1.5 text-base-content shadow-float">
              <button
                onClick={() => navigate("/profile")}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-canvas"
              >
                <UserRound size={16} />
                My profile
              </button>
              <button
                onClick={() => void logout()}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-error hover:bg-base-100"
              >
                <LogOut size={16} />
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
  return (
    <div className="flex min-h-screen">
      <div className="fixed inset-y-0 left-0 z-40 hidden lg:block">{sidebar}</div>
      {mobileOpen && (
        <div className="fixed inset-0 z-50 bg-black/30 lg:hidden" onClick={() => setMobileOpen(false)}>
          <div onClick={(e) => e.stopPropagation()}>{sidebar}</div>
        </div>
      )}
      <div className="min-w-0 flex-1 lg:pl-[248px]">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-line bg-base-200 px-4 backdrop-blur-xl sm:px-7">
          <button className="rounded-lg p-2 lg:hidden" onClick={() => setMobileOpen(true)}>
            <Menu />
          </button>
          <h1 className="font-display text-lg font-bold lg:hidden">{title}</h1>
          <form
            className="relative hidden w-full max-w-md md:block"
            onSubmit={(event) => {
              event.preventDefault();
              if (globalSearch.trim()) navigate(`/employees?q=${encodeURIComponent(globalSearch.trim())}`);
            }}
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={17} />
            <input
              value={globalSearch}
              onChange={(event) => setGlobalSearch(event.target.value)}
              className="h-10 w-full rounded-field border border-line bg-base-200 pl-10 pr-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary"
              placeholder="Search people..."
            />
          </form>
          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
              title={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
              onClick={toggleTheme}
              className="theme-toggle"
            >
              {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            <div className="relative">
              <button
                aria-label="Notifications"
                onClick={() => setNotificationsOpen((current) => !current)}
                className="relative grid h-10 w-10 place-items-center rounded-field border border-line bg-base-200 text-muted transition hover:bg-canvas hover:text-ink"
              >
                <Bell size={18} />
                {(notifications.data?.data.length ?? 0) > 0 && (
                  <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-coral ring-2 ring-base-100" />
                )}
              </button>
              {notificationsOpen && (
                <div className="absolute right-0 top-12 z-50 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-field border border-line bg-base-200 shadow-float animate-in">
                  <div className="border-b border-line px-4 py-3">
                    <h3 className="font-display font-bold">Notifications</h3>
                    <p className="text-xs text-muted">{notifications.data?.data.length ?? 0} updates</p>
                  </div>
                  <div className="max-h-96 divide-y divide-line overflow-y-auto">
                    {notifications.data?.data.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          navigate(item.href);
                          setNotificationsOpen(false);
                        }}
                        className="block w-full px-4 py-3 text-left hover:bg-canvas"
                      >
                        <span className="block text-sm font-semibold">{item.title}</span>
                        <span className="mt-0.5 block text-xs text-muted">{item.message}</span>
                      </button>
                    ))}
                    {!notifications.data?.data.length && (
                      <p className="p-6 text-center text-sm text-muted">You are all caught up.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="hidden items-center gap-2 border-l border-line pl-3 sm:flex">
              <Avatar name={user?.name ?? "User"} size="sm" />
              <div className="leading-tight">
                <div className="text-xs font-semibold">{user?.name}</div>
                <div className="text-[10px] capitalize text-muted">
                  {user?.role.toLowerCase().replace("_", " ")}
                </div>
              </div>
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-[1500px] p-4 sm:p-7 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
