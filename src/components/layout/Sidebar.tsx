"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useUIStore } from "@/store/useUIStore";
import { LayoutDashboard, Focus, CheckSquare, Clock, Activity, Settings, ChevronLeft, ChevronRight, Zap } from "lucide-react";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Focus Mode", href: "/focus", icon: Focus },
  { name: "Tasks", href: "/tasks", icon: CheckSquare },
  { name: "Sessions", href: "/sessions", icon: Clock },
  { name: "Heatmap", href: "/heatmap", icon: Activity },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const { data: session } = useSession();

  return (
    <motion.div
      animate={{ width: sidebarCollapsed ? 64 : 240 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="h-full bg-surface border-r border-border flex flex-col relative shrink-0 z-40 overflow-visible"
    >
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-6 bg-surface border border-border rounded-full p-1 text-muted hover:text-text hover:bg-surface2 transition-colors z-50 shadow-md"
      >
        {sidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      <div className="p-4 flex items-center h-16 border-b border-border/50 shrink-0 overflow-hidden">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center font-syne font-bold text-white shrink-0">
            F
          </div>
          {!sidebarCollapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="font-syne font-bold text-lg tracking-tight whitespace-nowrap"
            >
              FlowDesk
            </motion.span>
          )}
        </div>
      </div>

      <div className="p-4 flex items-center gap-3 border-b border-border/50 shrink-0 overflow-hidden">
        {session?.user?.image ? (
          <img src={session.user.image} alt="Avatar" className="w-8 h-8 rounded-full shrink-0" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-surface2 shrink-0" />
        )}
        {!sidebarCollapsed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col min-w-0">
            <span className="text-sm font-medium truncate">{session?.user?.name}</span>
            <span className="text-xs text-muted truncate">@github</span>
          </motion.div>
        )}
      </div>

      <nav className="flex-1 py-4 flex flex-col gap-1 px-2 overflow-y-auto overflow-x-hidden">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link key={item.name} href={item.href} className="relative group outline-none">
              {isActive && (
                <motion.div
                  layoutId="activeNavPill"
                  className="absolute inset-0 bg-surface2 rounded-lg border border-border"
                  initial={false}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <div
                className={cn(
                  "relative flex items-center px-3 py-2.5 rounded-lg transition-colors group-hover:bg-surface2/50",
                  isActive ? "text-accent" : "text-text2 group-hover:text-text",
                  sidebarCollapsed ? "justify-center" : "gap-3"
                )}
                title={sidebarCollapsed ? item.name : undefined}
              >
                <Icon size={18} className={cn("shrink-0", isActive && "text-accent drop-shadow-[0_0_8px_var(--glow)]")} />
                {!sidebarCollapsed && <span className="text-sm font-medium whitespace-nowrap">{item.name}</span>}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border/50 flex flex-col gap-3 shrink-0 overflow-hidden">
        <div className={cn("flex items-center gap-2", sidebarCollapsed && "justify-center")}>
          <Clock size={16} className="text-accent2" />
          {!sidebarCollapsed && <span className="text-sm text-text2 whitespace-nowrap">2h 34m today</span>}
        </div>
        <div className={cn("flex items-center gap-2", sidebarCollapsed && "justify-center")}>
          <motion.div whileTap={{ scale: 0.9, y: -2 }} transition={{ type: "spring" }}>
            <span className="text-lg leading-none select-none">🔥</span>
          </motion.div>
          {!sidebarCollapsed && <span className="text-sm font-medium text-warning whitespace-nowrap">7 days</span>}
        </div>
        {!sidebarCollapsed && <div className="text-[10px] text-muted text-center mt-2 font-mono">v1.0</div>}
      </div>
    </motion.div>
  );
}
