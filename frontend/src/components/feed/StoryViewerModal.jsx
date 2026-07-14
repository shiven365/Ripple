import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar } from '../ui/Avatar';

export const StoryViewerModal = ({ isOpen, onClose, story, author }) => {
  useEffect(() => {
    if (!isOpen || !story) return;

    // Auto close after 5 seconds
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [isOpen, story, onClose]);

  if (!isOpen || !story) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center"
      >
        {/* Header */}
        <div className="absolute top-4 left-0 right-0 px-4 flex items-center justify-between z-10 max-w-[470px] mx-auto w-full">
          <div className="flex items-center space-x-3">
            <Avatar src={author.avatar_url} initials={author.display_name} size="sm" />
            <span className="text-white font-bold">{author.display_name}</span>
            <span className="text-white/60 text-sm">
              {new Date(story.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </span>
          </div>
          <button onClick={onClose} className="text-white text-3xl font-light hover:opacity-70">&times;</button>
        </div>

        {/* Progress Bar */}
        <div className="absolute top-2 left-2 right-2 max-w-[470px] mx-auto w-full flex space-x-1 z-10">
          <div className="h-1 bg-white/30 flex-1 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 5, ease: 'linear' }}
              className="h-full bg-white rounded-full"
            />
          </div>
        </div>

        {/* Image */}
        <img 
          src={story.media_url} 
          alt="Story" 
          className="max-w-full max-h-[90vh] object-contain rounded-lg"
        />
      </motion.div>
    </AnimatePresence>
  );
};
