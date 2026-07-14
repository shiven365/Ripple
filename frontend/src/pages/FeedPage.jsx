import React, { useEffect, useState, useRef, useCallback } from 'react';
import { getFeed } from '../api/feed';
import { PostCard } from '../components/feed/PostCard';
import { StoriesBar } from '../components/feed/StoriesBar';
import { useAuth } from '../hooks/useAuth';
import { PostComposerModal } from '../components/feed/PostComposerModal';
import { motion, AnimatePresence } from 'framer-motion';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
export const FeedPage = () => {
  const [posts, setPosts] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [newPostsCount, setNewPostsCount] = useState(0);
  const { user } = useAuth();
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const observer = useRef();

  const fetchFeed = async (overrideCursor = null) => {
    if (loading || (!hasMore && overrideCursor !== null)) return;
    
    try {
      setLoading(true);
      const data = await getFeed(overrideCursor || cursor, 20);
      
      if (overrideCursor === null && !cursor) {
        setPosts(data.items || []);
        setNewPostsCount(0);
      } else {
        setPosts(prev => [...prev, ...(data.items || [])]);
      }
      
      if (data.nextCursor) {
        setCursor(data.nextCursor);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error('Failed to fetch feed', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      if (posts.length === 0) return;
      try {
        const data = await getFeed(null, 20);
        if (data.items && data.items.length > 0) {
          const currentTopId = posts[0].id;
          const newIndex = data.items.findIndex(p => p.id === currentTopId);
          if (newIndex > 0) {
            setNewPostsCount(newIndex);
          } else if (newIndex === -1 && data.items[0].id !== currentTopId) {
            setNewPostsCount(20);
          }
        }
      } catch (err) {}
    }, 10000);
    return () => clearInterval(interval);
  }, [posts]);

  const lastElementRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        fetchFeed();
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  useEffect(() => {
    const handlePostCreated = () => {
      setCursor(null);
      setHasMore(true);
      fetchFeed(null); 
    };
    window.addEventListener('post-created', handlePostCreated);
    return () => window.removeEventListener('post-created', handlePostCreated);
  }, []);

  return (
    <div className="w-full bg-bg-surface min-h-screen pb-16 relative">
      <StoriesBar />
      
      <AnimatePresence>
        {newPostsCount > 0 && (
          <motion.div 
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="fixed top-20 left-0 right-0 z-40 flex justify-center pointer-events-none"
          >
            <button 
              onClick={() => {
                setNewPostsCount(0);
                window.scrollTo({ top: 0, behavior: 'smooth' });
                setCursor(null);
                setHasMore(true);
                fetchFeed(null);
              }}
              className="bg-gradient-brand pointer-events-auto px-6 py-2 rounded-full font-semibold text-[14px] shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-150 cursor-pointer"
            >
              ↑ Show {newPostsCount} new posts
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      
      {posts.length === 0 && !loading ? (
        <div className="p-6 mt-4">
          <EmptyState 
            title="No posts yet" 
            description="Follow people to see their ripples here." 
          />
        </div>
      ) : (
        <div className="flex flex-col">
          {posts.map((post, index) => {
            if (posts.length === index + 1) {
              return <div ref={lastElementRef} key={post.id}><PostCard post={post} /></div>;
            } else {
              return <PostCard key={post.id} post={post} />;
            }
          })}
          
          {loading && (
            <div className="p-6 flex flex-col gap-6">
              <Skeleton className="w-full h-32" />
              <Skeleton className="w-full h-48" />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
