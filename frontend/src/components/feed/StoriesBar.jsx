import React, { useEffect, useState, useRef } from 'react';
import { Avatar } from '../ui/Avatar';
import { useAuth } from '../../hooks/useAuth';
import { getFollowing } from '../../api/users';
import { getStories, createStory, uploadMedia } from '../../api/posts';
import { getOnlineUsers } from '../../api/notifications';
import { useNavigate } from 'react-router-dom';
import { StoryViewerModal } from './StoryViewerModal';

export const StoriesBar = () => {
  const { user } = useAuth();
  const [following, setFollowing] = useState([]);
  const [activeStories, setActiveStories] = useState({}); // { authorId: [stories] }
  const [viewingStory, setViewingStory] = useState(null); // { story, author }
  const [isUploading, setIsUploading] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFollowingAndStories = async () => {
      if (!user?.id) return;
      try {
        const friends = await getFollowing(user.id);
        setFollowing(friends);

        // Fetch their stories
        if (friends.length > 0) {
          const friendIds = friends.map(f => f.id);
          const stories = await getStories([...friendIds, user.id]);
          
          // Group by author_id
          const grouped = {};
          stories.forEach(s => {
            if (!grouped[s.author_id]) grouped[s.author_id] = [];
            grouped[s.author_id].push(s);
          });
          setActiveStories(grouped);
        }
      } catch (err) {
        console.error('Failed to fetch following for stories', err);
      }
    };
    fetchFollowingAndStories();
  }, [user]);

  // Poll online users
  useEffect(() => {
    const poll = async () => {
      try {
        const users = await getOnlineUsers();
        setOnlineUsers(new Set(users));
      } catch (err) {}
    };
    poll();
    const intv = setInterval(poll, 10000);
    return () => clearInterval(intv);
  }, []);

  const handleStoryUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const media = await uploadMedia(file);
      await createStory(media.url);
      alert('Story posted successfully! It will disappear in 24 hours.');
      // Refresh page to show it
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert('Failed to upload story');
    } finally {
      setIsUploading(false);
    }
  };

  const handleAvatarClick = (friend) => {
    const stories = activeStories[friend.id];
    if (stories && stories.length > 0) {
      // View latest story
      setViewingStory({ story: stories[stories.length - 1], author: friend });
    } else {
      // Go to profile
      navigate(`/profile/${friend.id}`);
    }
  };

  if (!following || following.length === 0) {
    return null;
  }

  return (
    <>
      <div className="w-full border-b border-border-subtle py-4 bg-bg-surface overflow-hidden">
        <div className="flex space-x-4 overflow-x-auto pb-2 scrollbar-hide px-4 snap-x">
          
          {/* Your Story Upload */}
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center space-y-1 flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity relative snap-start"
          >
            <div className="relative">
              <Avatar 
                src={user?.avatar_url} 
                initials={user?.display_name} 
                size="lg" 
                hasStory={activeStories[user?.id]?.length > 0} 
              />
              <div className="absolute bottom-0 right-0 bg-gradient-brand text-white rounded-full w-[22px] h-[22px] flex items-center justify-center text-sm font-bold border-2 border-bg-surface shadow-sm">
                +
              </div>
            </div>
            <span className="text-[13px] text-text-secondary w-16 truncate text-center font-medium mt-1">
              {isUploading ? 'Uploading...' : 'Your story'}
            </span>
          </div>

          {/* Friends Stories */}
          {following.map((friend) => (
            <div 
              key={friend.id} 
              onClick={() => handleAvatarClick(friend)}
              className="flex flex-col items-center space-y-1 flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity snap-start"
            >
              <Avatar 
                src={friend.avatar_url} 
                initials={friend.display_name || 'U'} 
                size="lg" 
                hasStory={activeStories[friend.id]?.length > 0}
                isOnline={onlineUsers.has(friend.id)}
              />
              <span className="text-[13px] text-text-secondary w-16 truncate text-center mt-1">
                {friend.display_name?.split(' ')[0] || 'User'}
              </span>
            </div>
          ))}
        </div>
      </div>

      <input 
        type="file" 
        accept="image/*,video/*" 
        className="hidden" 
        ref={fileInputRef}
        onChange={handleStoryUpload}
      />

      <StoryViewerModal 
        isOpen={!!viewingStory}
        onClose={() => setViewingStory(null)}
        story={viewingStory?.story}
        author={viewingStory?.author}
      />
    </>
  );
};
