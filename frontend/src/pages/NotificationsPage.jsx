import React, { useEffect, useState } from 'react';
import { getNotifications, markNotificationRead } from '../api/notifications';
import { getProfile } from '../api/users';
import { Heart, MessageCircle, UserPlus, Bell as BellIcon } from 'lucide-react';
import { Avatar } from '../components/ui/Avatar';
import { RippleEffect } from '../components/ui/RippleEffect';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';

export const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const data = await getNotifications(20);
        
        const enriched = await Promise.all(
          (data || []).map(async (notif) => {
            let actorId = null;
            let actionText = '';
            
            if (notif.type === 'NEW_FOLLOWER') {
              actorId = notif.payload?.followerId;
              actionText = 'started following you.';
            } else if (notif.type === 'POST_LIKED') {
              actorId = notif.payload?.likedBy;
              actionText = 'liked your post.';
            } else if (notif.type === 'COMMENT_ADDED') {
              actorId = notif.payload?.commenterId;
              actionText = 'commented on your post.';
            }
            
            let profile = { display_name: 'Someone', avatar_url: null };
            if (actorId) {
              try {
                profile = await getProfile(actorId);
              } catch (e) {
                console.error('Error fetching profile', e);
              }
            }
            
            return { ...notif, profile, actionText };
          })
        );
        
        setNotifications(enriched);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifs();
  }, []);

  const handleRead = async (id) => {
    try {
      await markNotificationRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return (
    <div className="flex flex-col p-4 gap-4">
      <Skeleton className="w-full h-[76px]" />
      <Skeleton className="w-full h-[76px]" />
      <Skeleton className="w-full h-[76px]" />
    </div>
  );

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'POST_LIKED':
        return <Heart className="w-4 h-4 text-white fill-current" />;
      case 'COMMENT_ADDED':
        return <MessageCircle className="w-4 h-4 text-white fill-current" />;
      case 'NEW_FOLLOWER':
        return <UserPlus className="w-4 h-4 text-white" />;
      default:
        return <BellIcon className="w-4 h-4 text-white" />;
    }
  };

  const getBadgeColor = (type) => {
    switch (type) {
      case 'POST_LIKED':
        return 'bg-red-500';
      case 'COMMENT_ADDED':
        return 'bg-blue-500';
      case 'NEW_FOLLOWER':
        return 'bg-green-500';
      default:
        return 'bg-brand-start';
    }
  };

  const isRecent = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = (now - date) / (1000 * 60 * 60 * 24);
    return diffDays < 2; // "New" if less than 2 days old
  };

  const newNotifications = notifications.filter(n => isRecent(n.created_at || n.createdAt));
  const earlierNotifications = notifications.filter(n => !isRecent(n.created_at || n.createdAt));

  const renderNotificationGroup = (group, title) => {
    if (group.length === 0) return null;
    return (
      <div className="mb-4">
        <h2 className="px-4 py-2 text-[13px] font-semibold text-text-secondary uppercase tracking-wider">{title}</h2>
        {group.map(notif => (
          <RippleEffect key={notif.id} className="w-full">
            <div 
              onClick={() => !notif.isRead && handleRead(notif.id)}
              className={`p-4 border-b border-border-subtle flex items-center space-x-4 transition-colors cursor-pointer ${!notif.isRead ? 'bg-brand-start/5' : 'bg-bg-surface hover:bg-bg-primary'}`}
            >
              <div className="relative">
                <Avatar src={notif.profile?.avatar_url} initials={notif.profile?.display_name?.charAt(0) || notif.type.charAt(0)} size="md" />
                <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-bg-surface flex items-center justify-center ${getBadgeColor(notif.type)}`}>
                  {getNotificationIcon(notif.type)}
                </div>
              </div>
              <div className="flex-1">
                <p className="text-[14px]">
                  <span className="font-semibold text-text-primary">{notif.profile?.display_name || 'Someone'}</span>{' '}
                  <span className="text-text-secondary">{notif.actionText}</span>
                </p>
                <p className="text-[13px] text-text-secondary mt-1">{new Date(notif.created_at || notif.createdAt).toLocaleDateString()}</p>
              </div>
              {!notif.isRead && <div className="w-2.5 h-2.5 bg-gradient-brand rounded-full shrink-0" />}
            </div>
          </RippleEffect>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-bg-surface min-h-screen pb-16">
      <h1 className="p-4 font-semibold text-[20px] border-b border-border-subtle sticky top-0 bg-bg-surface/90 backdrop-blur-md z-10">Notifications</h1>
      <div className="flex flex-col pt-2">
        {notifications.length === 0 ? (
          <div className="p-8 mt-4">
            <EmptyState icon={BellIcon} title="No notifications yet" description="When people interact with you, it will show up here." />
          </div>
        ) : (
          <>
            {renderNotificationGroup(newNotifications, 'New')}
            {renderNotificationGroup(earlierNotifications, 'Earlier')}
          </>
        )}
      </div>
    </div>
  );
};
