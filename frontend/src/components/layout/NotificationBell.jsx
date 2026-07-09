import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import * as api from "../../lib/mockApi";
import { useAuth } from "../../context/AuthContext";

function timeAgo(ts) {
  const mins = Math.round((Date.now() - ts) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}

export default function NotificationBell() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const ref = useRef(null);

  const load = async () => {
    if (!user) return;
    const list = await api.getNotifications(user.id);
    setItems(list);
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 4000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  useEffect(() => {
    function onClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const unread = items.filter((n) => !n.read).length;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative grid h-9 w-9 place-items-center rounded-full text-ink-500 transition-colors hover:bg-paper-100 hover:text-ink-900"
        aria-label="Notifications"
      >
        <Bell size={18} strokeWidth={1.75} />
        {unread > 0 && (
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-coral-500 ring-2 ring-white" />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 z-30 mt-2 w-80 overflow-hidden rounded-2xl border border-paper-200 bg-white shadow-swing"
          >
            <div className="border-b border-paper-200 px-4 py-3">
              <p className="font-display text-sm font-semibold text-ink-900">Notifications</p>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {items.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-ink-500">Nothing here yet.</p>
              ) : (
                items.map((n) => (
                  <button
                    key={n.id}
                    onClick={async () => {
                      await api.markNotificationRead(n.id);
                      load();
                    }}
                    className="flex w-full flex-col items-start gap-1 border-b border-paper-100 px-4 py-3 text-left transition-colors last:border-0 hover:bg-paper-50"
                  >
                    <span className="flex items-center gap-2 text-sm text-ink-900">
                      {!n.read && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />}
                      {n.message}
                    </span>
                    <span className="pl-3.5 text-xs text-ink-300">{timeAgo(n.createdAt)}</span>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
