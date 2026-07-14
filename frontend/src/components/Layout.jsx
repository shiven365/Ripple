import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './layout/Sidebar';
import { ThemeToggle } from './ui/ThemeToggle';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { PostComposerModal } from './feed/PostComposerModal';
import { useAuth } from '../hooks/useAuth';
import { useSocket } from '../hooks/useSocket';

const Layout = () => {
  const location = useLocation();
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const { user } = useAuth();
  const { lastNotification } = useSocket(user?.id);
  const [toastNotification, setToastNotification] = useState(null);

  useEffect(() => {
    if (lastNotification) {
      const enrichNotification = async () => {
        let actorId = null;
        let actionText = 'interacted with you.';
        
        if (lastNotification.type === 'NEW_FOLLOWER') {
          actorId = lastNotification.payload?.followerId;
          actionText = 'started following you.';
        } else if (lastNotification.type === 'POST_LIKED') {
          actorId = lastNotification.payload?.likedBy;
          actionText = 'liked your post.';
        } else if (lastNotification.type === 'COMMENT_ADDED') {
          actorId = lastNotification.payload?.commenterId;
          actionText = 'commented on your post.';
        }
        
        let profile = { display_name: 'Someone', avatar_url: null };
        if (actorId) {
          try {
            const { getProfile } = await import('../api/users');
            profile = await getProfile(actorId);
          } catch(e) {}
        }
        
        setToastNotification({ ...lastNotification, profile, actionText });
        setTimeout(() => setToastNotification(null), 4000);
      };
      enrichNotification();
    }
  }, [lastNotification]);

  useEffect(() => {
    const handleOpenComposer = () => setIsComposerOpen(true);
    window.addEventListener('open-composer', handleOpenComposer);
    return () => window.removeEventListener('open-composer', handleOpenComposer);
  }, []);

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary font-sans flex">
      <Sidebar />
      
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-bg-surface border-b border-border-subtle flex items-center justify-between px-4 z-40">
        <span className="font-bold text-[20px] text-gradient">Ripple</span>
        <ThemeToggle />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 pb-16 md:pb-0 pt-14 md:pt-0 min-h-screen relative bg-bg-primary">
        <div className="hidden md:block fixed top-6 right-6 z-50">
          <ThemeToggle />
        </div>
        
        <div className={`${location.pathname === '/messages' ? 'w-full border-r' : 'max-w-[470px] mx-auto border-x'} w-full min-h-screen border-border-subtle bg-bg-surface shadow-sm shadow-black/5 flex flex-col`}>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className={location.pathname === '/messages' ? "h-full w-full flex-1 flex" : "h-full"}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <PostComposerModal 
        isOpen={isComposerOpen} 
        onClose={() => setIsComposerOpen(false)} 
        onPostCreated={() => window.dispatchEvent(new Event('post-created'))}
      />

      {/* Real-time Notification Toast */}
      <AnimatePresence>
        {toastNotification && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className="fixed bottom-20 md:bottom-6 right-6 z-50 bg-bg-surface border border-border-subtle p-4 rounded-2xl shadow-xl flex items-center gap-3 w-80 cursor-pointer"
            onClick={() => setToastNotification(null)}
          >
            <div className="w-10 h-10 rounded-full bg-brand-start/10 flex items-center justify-center flex-shrink-0 text-brand-start overflow-hidden">
              {toastNotification.profile?.avatar_url ? (
                <img src={toastNotification.profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span>🔔</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-[15px] text-text-primary truncate">New Notification</p>
              <p className="text-[14px] text-text-secondary line-clamp-2">
                <span className="font-semibold text-text-primary">{toastNotification.profile?.display_name || 'Someone'}</span> {toastNotification.actionText}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Layout;
