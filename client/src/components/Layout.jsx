import { Link, useLocation } from 'react-router-dom';
import { Activity, Plus, HelpCircle, LayoutDashboard } from 'lucide-react';

const NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/triggers/new', label: 'Add Trigger', icon: Plus },
  { to: '/how-it-works', label: 'How It Works', icon: HelpCircle },
];

export default function Layout({ children }) {
  const { pathname } = useLocation();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-surface-1/90 backdrop-blur border-b border-surface-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2.5 text-gray-100 hover:text-white transition-colors">
            <div className="w-7 h-7 bg-brand rounded-lg flex items-center justify-center flex-shrink-0">
              <Activity size={15} strokeWidth={2.5} className="text-white" />
            </div>
            <div className="leading-none">
              <div className="text-sm font-semibold tracking-tight">Pharma BD Monitor</div>
              <div className="text-[10px] text-gray-500 font-mono mt-0.5">Ipsos Healthcare Belgium</div>
            </div>
          </Link>

          <nav className="flex items-center gap-1 ml-auto">
            {NAV.map(({ to, label, icon: Icon }) => {
              const active = to === '/' ? pathname === '/' : pathname.startsWith(to);
              return (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    active
                      ? 'bg-surface-3 text-gray-100'
                      : 'text-gray-400 hover:text-gray-100 hover:bg-surface-2'
                  }`}
                >
                  <Icon size={14} />
                  <span className="hidden sm:inline">{label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-surface-3 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <span className="text-xs text-gray-600">Ipsos Healthcare Belgium — Confidential</span>
          <span className="text-xs text-gray-600 font-mono">v1.0 MVP</span>
        </div>
      </footer>
    </div>
  );
}
