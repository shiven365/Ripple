import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProfile, getMe, followUser, unfollowUser, getFollowers, getFollowing, updateProfile } from '../api/users';
import { useAuth } from '../hooks/useAuth';
import { Avatar } from '../components/ui/Avatar';
import { RippleEffect } from '../components/ui/RippleEffect';
import { motion, AnimatePresence } from 'framer-motion';
import { getUserPosts, uploadMedia } from '../api/posts';
import { Camera, X, Image as ImageIcon } from 'lucide-react';
import { PostCard } from '../components/feed/PostCard';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';

export const ProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editProfileData, setEditProfileData] = useState({ display_name: '', bio: '' });
  const fileInputRef = useRef(null);

  const handleAvatarClick = () => {
    if (user?.id === profile?.id) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const uploadResult = await uploadMedia(file);
      const mediaUrl = uploadResult.url;
      
      const updatedProfile = await updateProfile(profile.id, { avatar_url: mediaUrl });
      setProfile(updatedProfile);
    } catch (err) {
      console.error('Failed to update avatar', err);
      alert('Failed to update profile photo');
    } finally {
      setIsUploading(false);
      e.target.value = null;
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = id ? await getProfile(id) : await getMe();
        setProfile(data);
        if (data?.id) {
          const [userPosts, userFollowers, userFollowing] = await Promise.all([
            getUserPosts(data.id),
            getFollowers(data.id),
            getFollowing(data.id)
          ]);
          setPosts(userPosts);
          setFollowersCount(userFollowers.length);
          setFollowingCount(userFollowing.length);
          setFollowers(userFollowers);
          setFollowing(userFollowing);
          if (user && user.id !== data.id) {
            setIsFollowing(userFollowers.some(f => f.id === user.id));
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (user?.id) fetchProfile();
  }, [user, id]);

  const toggleFollow = async () => {
    try {
      if (isFollowing) {
        await unfollowUser(profile.id);
        setFollowersCount(prev => Math.max(0, prev - 1));
        setFollowers(prev => prev.filter(f => f.id !== user.id));
      } else {
        await followUser(profile.id);
        setFollowersCount(prev => prev + 1);
        setFollowers(prev => [...prev, user]);
      }
      setIsFollowing(!isFollowing);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return (
    <div className="flex flex-col p-6 gap-6">
      <Skeleton className="w-full h-32 rounded-2xl" />
      <Skeleton className="w-full h-48 rounded-2xl" />
    </div>
  );
  
  if (!profile) return (
    <div className="p-8 mt-4">
      <EmptyState title="Profile not found" description="This user doesn't exist or failed to load." />
    </div>
  );

  return (
    <div className="bg-bg-primary min-h-screen pb-16">
      {/* Header */}
      <div className="p-6 border-b border-border-subtle flex flex-col md:flex-row items-center md:items-start gap-6">
        <div className="relative group" onClick={handleAvatarClick} style={{ cursor: user?.id === profile?.id ? 'pointer' : 'default' }}>
          <RippleEffect className="rounded-full !overflow-visible">
            <div className={`transition-opacity ${isUploading ? 'opacity-50' : ''}`}>
              <Avatar src={profile?.avatar_url} initials={profile?.display_name || profile?.email || 'User'} size="xl" hasStory={true} className="border-4 border-bg-primary" />
            </div>
          </RippleEffect>
          {user?.id === profile?.id && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="w-8 h-8 text-white" />
            </div>
          )}
          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/jpeg, image/png" 
            className="hidden" 
          />
        </div>
        
        <div className="flex-1 text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-center gap-3 mb-6 justify-center md:justify-start flex-wrap">
            <h1 className="text-2xl font-bold w-full md:w-auto md:mr-2 text-center md:text-left">{profile?.display_name || 'ripple_user'}</h1>
            {user?.id !== profile?.id && (
              <RippleEffect className="rounded-full !overflow-visible">
                <motion.button
                  onClick={toggleFollow}
                  whileTap={{ scale: 0.95 }}
                  className={`relative min-w-[110px] px-4 py-1.5 rounded-full font-semibold text-[14px] whitespace-nowrap transition-all duration-300 overflow-hidden cursor-pointer flex items-center justify-center ${
                    isFollowing
                      ? 'border border-border-subtle text-text-primary bg-transparent hover:bg-bg-primary'
                      : 'text-white border border-transparent hover:shadow-lg'
                  }`}
                >
                  {!isFollowing && (
                    <div className="absolute inset-0 bg-gradient-brand" />
                  )}
                  <span className="relative z-10 flex items-center justify-center">
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
            )}
            
            {user?.id !== profile?.id && (
              <RippleEffect className="rounded-full !overflow-visible">
                <motion.button
                  onClick={() => navigate('/messages', { state: { openChatWith: profile } })}
                  whileTap={{ scale: 0.95 }}
                  className="min-w-[110px] px-4 py-1.5 rounded-full font-semibold text-[14px] whitespace-nowrap border border-border-subtle text-text-primary hover:bg-bg-secondary transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span className="text-[14px]">💬</span> Message
                </motion.button>
              </RippleEffect>
            )}

            {(user?.id === profile?.id) && (
              <RippleEffect className="rounded-full !overflow-visible">
                <motion.button
                  onClick={() => {
                    setEditProfileData({ display_name: profile.display_name || '', bio: profile.bio || '' });
                    setIsEditingProfile(true);
                  }}
                  whileTap={{ scale: 0.95 }}
                  className="min-w-[110px] px-4 py-1.5 rounded-full font-semibold text-[14px] whitespace-nowrap border border-border-subtle text-text-primary hover:bg-bg-secondary transition-all cursor-pointer flex items-center justify-center"
                >
                  Edit Profile
                </motion.button>
              </RippleEffect>
            )}

          </div>
          
          <div className="flex justify-center md:justify-start gap-10 mb-8 mt-4">
            <div className="flex flex-col items-center">
              <span className="font-bold text-[22px] leading-tight">{posts.length}</span>
              <span className="text-[13px] text-text-secondary uppercase tracking-wide">posts</span>
            </div>
            <div className="flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setShowFollowers(true)}>
              <span className="font-bold text-[22px] leading-tight">{followersCount}</span>
              <span className="text-[13px] text-text-secondary uppercase tracking-wide">followers</span>
            </div>
            <div className="flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setShowFollowing(true)}>
              <span className="font-bold text-[22px] leading-tight">{followingCount}</span>
              <span className="text-[13px] text-text-secondary uppercase tracking-wide">following</span>
            </div>
          </div>
          
          <div className="text-[14px] text-center md:text-left mb-2">
            <p className="font-semibold text-[15px]">{profile?.display_name || 'Ripple User'}</p>
            <p className="text-text-secondary mt-1">{profile?.bio || 'Making waves everyday 🌊'}</p>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-3 gap-1 p-1">
        {posts.length > 0 ? posts.map(p => (
          <div key={p.id} onClick={() => setSelectedPost(p)} className="aspect-square bg-bg-surface hover:opacity-80 transition-opacity cursor-pointer flex items-center justify-center overflow-hidden relative">
            {p.media_url ? (
              <img src={p.media_url} alt="Post media" className="w-full h-full object-cover" />
            ) : (
              <span className="text-text-primary/70 text-[13px] p-2 text-center line-clamp-3 break-words overflow-hidden">{p.content}</span>
            )}
          </div>
        )) : (
          <div className="col-span-3 py-12 px-4 mt-4">
            <EmptyState icon={ImageIcon} title="No posts yet" description="This user hasn't posted anything." />
          </div>
        )}
      </div>

      {/* Post Modal */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80" onClick={() => setSelectedPost(null)}>
          <button 
            onClick={() => setSelectedPost(null)}
            className="absolute top-4 right-4 p-2 bg-black/40 hover:bg-black/60 rounded-full text-white z-50 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="w-full max-w-2xl bg-bg-primary rounded-xl overflow-hidden relative max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <PostCard 
              post={selectedPost} 
              onDelete={(id) => {
                setPosts(prev => prev.filter(post => post.id !== id));
                setSelectedPost(null);
              }}
              onUpdate={(updatedPost) => {
                setPosts(prev => prev.map(post => post.id === updatedPost.id ? updatedPost : post));
              }}
            />
          </div>
        </div>
      )}
      {/* Edit Profile Modal */}
      {isEditingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80" onClick={() => setIsEditingProfile(false)}>
          <div className="w-full max-w-md bg-bg-primary rounded-xl overflow-hidden p-6 relative" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4">Edit Profile</h2>
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-1 text-text-secondary">Display Name</label>
              <input 
                type="text" 
                value={editProfileData.display_name} 
                onChange={e => setEditProfileData({ ...editProfileData, display_name: e.target.value })}
                className="w-full bg-bg-secondary text-text-primary p-2 rounded-md border border-border-subtle focus:border-brand-base focus:outline-none"
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-1 text-text-secondary">Bio</label>
              <textarea 
                value={editProfileData.bio} 
                onChange={e => setEditProfileData({ ...editProfileData, bio: e.target.value })}
                className="w-full bg-bg-secondary text-text-primary p-2 rounded-md border border-border-subtle resize-none h-24 focus:border-brand-base focus:outline-none"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setIsEditingProfile(false)}
                className="px-4 py-2 font-semibold text-text-secondary hover:text-text-primary transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={async () => {
                  try {
                    const updatedProfile = await updateProfile(profile.id, editProfileData);
                    setProfile(updatedProfile);
                    setIsEditingProfile(false);
                  } catch (err) {
                    console.error('Failed to update profile', err);
                  }
                }}
                className="px-4 py-2 bg-brand-base text-white font-bold rounded-md hover:bg-brand-dark transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Followers Modal */}
      {showFollowers && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80" onClick={() => setShowFollowers(false)}>
          <div className="w-full max-w-md bg-bg-primary rounded-xl overflow-hidden relative max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-border-subtle flex items-center justify-between">
              <h2 className="font-bold text-lg">Followers</h2>
              <button onClick={() => setShowFollowers(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="overflow-y-auto p-2">
              {followers.map(f => (
                <div key={f.id} className="flex items-center gap-3 p-2 hover:bg-bg-secondary rounded-lg cursor-pointer transition-colors" onClick={() => { setShowFollowers(false); navigate(`/profile/${f.id}`); }}>
                  <Avatar src={f.avatar_url} initials={f.display_name || f.email} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[15px] truncate">{f.display_name}</p>
                    <p className="text-[13px] text-text-secondary truncate">{f.bio}</p>
                  </div>
                </div>
              ))}
              {followers.length === 0 && <div className="p-4 text-center text-text-secondary">No followers yet.</div>}
            </div>
          </div>
        </div>
      )}

      {/* Following Modal */}
      {showFollowing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80" onClick={() => setShowFollowing(false)}>
          <div className="w-full max-w-md bg-bg-primary rounded-xl overflow-hidden relative max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-border-subtle flex items-center justify-between">
              <h2 className="font-bold text-lg">Following</h2>
              <button onClick={() => setShowFollowing(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="overflow-y-auto p-2">
              {following.map(f => (
                <div key={f.id} className="flex items-center gap-3 p-2 hover:bg-bg-secondary rounded-lg cursor-pointer transition-colors" onClick={() => { setShowFollowing(false); navigate(`/profile/${f.id}`); }}>
                  <Avatar src={f.avatar_url} initials={f.display_name || f.email} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[15px] truncate">{f.display_name}</p>
                    <p className="text-[13px] text-text-secondary truncate">{f.bio}</p>
                  </div>
                </div>
              ))}
              {following.length === 0 && <div className="p-4 text-center text-text-secondary">Not following anyone yet.</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
