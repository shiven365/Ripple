import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Search, Bell, PlusSquare, User, LogOut, MessageCircle } from 'lucide-react';
import { Logo } from '../ui/Logo';
import { useAuth } from '../../hooks/useAuth';

export const Sidebar = () => {
  const { logout } = useAuth();

  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Search', path: '/search', icon: Search },
    { name: 'Messages', path: '/messages', icon: MessageCircle },
    { name: 'Notifications', path: '/notifications', icon: Bell, badge: true },
    { name: 'Create', isButton: true, icon: PlusSquare },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 border-r border-border-subtle p-6 justify-between bg-bg-surface z-40">
        <div>
          <div className="mb-8 pl-2">
            <Logo size="sm" showRipple={false} />
          </div>
          <nav className="space-y-2">
            {navItems.map((item) => 
              item.isButton ? (
                <button
                  key={item.name}
                  onClick={() => window.dispatchEvent(new Event('open-composer'))}
                  className="flex items-center space-x-4 p-3 rounded-xl transition-all duration-150 group text-text-secondary hover:bg-bg-primary hover:text-text-primary w-full text-left cursor-pointer"
                >
                  <div className="relative">
                    <item.icon className="w-[22px] h-[22px] transition-transform group-hover:scale-105 stroke-[2px]" />
                  </div>
                  <span className="text-[15px] font-semibold">{item.name}</span>
                </button>
              ) : (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-4 p-3 rounded-xl transition-all duration-150 group ${
                    isActive 
                      ? 'bg-blue-500/10 text-brand-start' 
                      : 'text-text-secondary hover:bg-bg-primary hover:text-text-primary'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="relative">
                      <item.icon className={`w-[22px] h-[22px] transition-transform group-hover:scale-105 ${isActive ? 'stroke-[2.5px]' : 'stroke-[2px]'}`} />
                      {item.badge && (
                        <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-brand-start rounded-full border-2 border-bg-surface" />
                      )}
                    </div>
                    <span className="text-[15px] font-semibold">{item.name}</span>
                  </>
                )}
              </NavLink>
            )
            )}
          </nav>
        </div>
        <button 
          onClick={logout}
          className="flex items-center space-x-4 p-3 text-text-secondary hover:bg-red-500/10 hover:text-red-500 rounded-xl transition-colors cursor-pointer group w-full text-left"
        >
          <LogOut className="w-[22px] h-[22px] transition-colors stroke-[2px]" />
          <span className="text-[15px] font-semibold transition-colors">Logout</span>
        </button>
      </div>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-bg-surface border-t border-border-subtle flex items-center justify-around z-40 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        {navItems.map((item) => 
          item.isButton ? (
            <button
              key={item.name}
              onClick={() => window.dispatchEvent(new Event('open-composer'))}
              className="p-3 transition-colors text-text-secondary"
            >
              <item.icon className="w-[22px] h-[22px] stroke-[2px]" />
            </button>
          ) : (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `p-3 transition-colors relative ${isActive ? 'text-brand-start' : 'text-text-secondary'}`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className={`w-[22px] h-[22px] ${isActive ? 'stroke-[2.5px]' : 'stroke-[2px]'}`} />
                {item.badge && (
                  <div className="absolute top-2 right-2 w-2 h-2 bg-brand-start rounded-full border-2 border-bg-surface" />
                )}
              </>
            )}
          </NavLink>
        )
        )}
      </div>
    </>
  );
};
