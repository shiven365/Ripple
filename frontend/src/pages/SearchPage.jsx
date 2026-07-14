import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { searchUsers, getFollowing } from '../api/users';
import { Avatar } from '../components/ui/Avatar';
import { FollowButton } from '../components/ui/FollowButton';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export const SearchPage = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [followingIds, setFollowingIds] = useState(new Set());
  const { user: currentUser } = useAuth();

  useEffect(() => {
    if (currentUser?.id) {
      getFollowing(currentUser.id)
        .then(data => {
          const ids = new Set(data.map(f => f.id || f.followee_id));
          setFollowingIds(ids);
        })
        .catch(err => console.error('Failed to fetch following', err));
    }
  }, [currentUser]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (query.trim().length > 0) {
        setLoading(true);
        searchUsers(query)
          .then(data => setResults(data))
          .catch(err => console.error(err))
          .finally(() => setLoading(false));
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  return (
    <div className="bg-bg-primary min-h-screen pb-16">
      <div className="p-4 border-b border-border-subtle sticky top-0 bg-bg-primary/90 backdrop-blur-md z-10">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
          <input 
            type="text" 
            placeholder="Search users..." 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-bg-secondary text-text-primary pl-10 pr-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-brand-base transition-shadow"
            autoFocus
          />
        </div>
      </div>
      
      <div className="p-4">
        {loading && (
          <div className="flex flex-col gap-4">
            <Skeleton className="w-full h-[72px]" />
            <Skeleton className="w-full h-[72px]" />
            <Skeleton className="w-full h-[72px]" />
          </div>
        )}
        
        {!loading && query.length > 0 && results.length === 0 && (
          <div className="mt-4">
            <EmptyState title="No users found" description={`We couldn't find anyone matching "${query}".`} />
          </div>
        )}

        {!loading && results.map(user => (
          <div 
            key={user.id} 
            onClick={() => navigate(`/profile/${user.id}`)}
            className="flex items-center justify-between p-4 mb-3 bg-bg-surface hover:bg-bg-primary hover:shadow-sm border border-border-subtle rounded-2xl transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <Avatar src={user.avatar_url} initials={user.display_name} size="md" />
              <div>
                <p className="font-semibold text-[15px] text-text-primary group-hover:text-brand-start transition-colors">{user.display_name}</p>
                {user.bio && <p className="text-[14px] text-text-secondary line-clamp-1">{user.bio}</p>}
              </div>
            </div>
            {currentUser?.id !== user.id && (
               <FollowButton 
                 key={`${user.id}-${followingIds.has(user.id)}`} 
                 userId={user.id} 
                 initialIsFollowing={followingIds.has(user.id)} 
               />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
