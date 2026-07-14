import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { followUser, unfollowUser } from '../../api/users';
import { RippleEffect } from './RippleEffect';

export const FollowButton = ({ userId, initialIsFollowing = false }) => {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [loading, setLoading] = useState(false);

  const toggleFollow = async (e) => {
    e.stopPropagation();
    if (loading) return;
    setLoading(true);
    try {
      if (isFollowing) {
        await unfollowUser(userId);
      } else {
        await followUser(userId);
      }
      setIsFollowing(!isFollowing);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <RippleEffect className="rounded-full !overflow-visible">
      <motion.button
        onClick={toggleFollow}
        whileTap={{ scale: 0.95 }}
        disabled={loading}
        className={`relative px-6 py-1.5 rounded-full font-semibold transition-all duration-300 overflow-hidden cursor-pointer text-[14px] ${
          isFollowing
            ? 'border-2 border-border-subtle text-text-primary bg-transparent hover:bg-bg-primary'
            : 'text-white border-2 border-transparent hover:shadow-lg'
        } ${loading ? 'opacity-50' : ''}`}
      >
        {!isFollowing && (
          <div className="absolute inset-0 bg-gradient-brand" />
        )}
        <span className="relative z-10 flex items-center justify-center min-w-[80px]">
          <AnimatePresence mode="popLayout">
            <motion.span
              key={isFollowing ? 'following' : 'follow'}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute"
            >
              {isFollowing ? 'Following' : 'Follow'}
            </motion.span>
          </AnimatePresence>
          <span className="opacity-0">Following</span>
        </span>
      </motion.button>
    </RippleEffect>
  );
};
