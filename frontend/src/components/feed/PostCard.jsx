import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { RippleEffect } from '../ui/RippleEffect';
import { getProfile } from '../../api/users';
import { useAuth } from '../../hooks/useAuth';
import { updatePost, deletePost, likePost, unlikePost, addComment, getComments } from '../../api/posts';

const CommentItem = ({ comment }) => {
  const [author, setAuthor] = useState(null);
  useEffect(() => {
    if (comment.author_id) {
      getProfile(comment.author_id).then(setAuthor).catch(console.error);
    }
  }, [comment.author_id]);

  return (
    <div className="flex space-x-3 mb-3">
      <Avatar src={author?.avatar_url} initials={author?.display_name || '?'} size="sm" />
      <div className="flex-1 bg-bg-secondary p-2 py-1.5 rounded-xl">
        <p className="font-bold text-xs text-text-primary hover:underline cursor-pointer">{author?.display_name || 'Loading...'}</p>
        <p className="text-sm text-text-primary">{comment.content}</p>
      </div>
    </div>
  );
};

export const PostCard = ({ post, onDelete, onUpdate }) => {
  const [isLiked, setIsLiked] = useState(post.is_liked_by_user || false);
  const [likeCount, setLikeCount] = useState(post.likes || 0);
  const [author, setAuthor] = useState(null);
  
  const { user } = useAuth();
  const [isDeleted, setIsDeleted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [showMenu, setShowMenu] = useState(false);
  const [currentPost, setCurrentPost] = useState(post);
  const [commentText, setCommentText] = useState('');
  const [isCommenting, setIsCommenting] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [showComposer, setShowComposer] = useState(false);
  const commentInputRef = useRef(null);

  const handleCommentIconClick = () => {
    if (!showComposer) {
      setShowComposer(true);
      if (!showComments) toggleComments();
      setTimeout(() => commentInputRef.current?.focus(), 100);
    } else {
      setShowComposer(false);
    }
  };

  useEffect(() => {
    if (post.author_id) {
      getProfile(post.author_id)
        .then(data => setAuthor(data))
        .catch(err => console.error('Failed to fetch author for post', err));
    }
  }, [post.author_id]);

  useEffect(() => {
    setIsLiked(post.is_liked_by_user || false);
    setLikeCount(post.likes || 0);
  }, [post]);

  const handleLike = async () => {
    try {
      if (!isLiked) {
        setLikeCount(prev => prev + 1);
        setIsLiked(true);
        await likePost(currentPost.id);
      } else {
        setLikeCount(prev => prev - 1);
        setIsLiked(false);
        await unlikePost(currentPost.id);
      }
    } catch (err) {
      console.error('Failed to toggle like', err);
      // Revert if failed
      setLikeCount(prev => isLiked ? prev + 1 : prev - 1);
      setIsLiked(isLiked);
    }
  };

  const handleDoubleTap = () => {
    if (!isLiked) {
      handleLike();
    }
  };

  const submitComment = async () => {
    if (!commentText.trim() || isCommenting) return;
    setIsCommenting(true);
    try {
      const newComment = await addComment(currentPost.id, commentText);
      setCommentText('');
      if (showComments) {
        setComments(prev => [...prev, newComment]);
      }
    } catch (err) {
      console.error('Failed to add comment', err);
    } finally {
      setIsCommenting(false);
    }
  };

  const toggleComments = async () => {
    if (!showComments) {
      setLoadingComments(true);
      setShowComments(true);
      try {
        const data = await getComments(currentPost.id);
        setComments(data || []);
      } catch (err) {
        console.error('Failed to load comments', err);
      } finally {
        setLoadingComments(false);
      }
    } else {
      setShowComments(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setShowMenu(false);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await deletePost(currentPost.id);
        setIsDeleted(true);
        if (onDelete) onDelete(currentPost.id);
      } catch (err) {
        console.error('Failed to delete', err);
      }
    }
  };

  const saveEdit = async () => {
    try {
      const updated = await updatePost(currentPost.id, { content: editContent });
      setCurrentPost(updated);
      setIsEditing(false);
      if (onUpdate) onUpdate(updated);
    } catch (err) {
      console.error('Failed to update', err);
    }
  };

  if (isDeleted) return null;

  return (
    <div className="border border-border-subtle rounded-2xl hover:shadow-lg transition-shadow duration-200 bg-bg-surface mb-6 mx-4 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-3 cursor-pointer">
          <Avatar src={author?.avatar_url} initials={author?.display_name || '?'} size="sm" hasStory={Math.random() > 0.5} />
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-[15px] text-text-primary hover:underline">{author?.display_name || 'Loading...'}</span>
              <span className="text-text-secondary text-[13px]">• {new Date(currentPost.created_at || currentPost.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        <div className="relative">
          <button onClick={() => setShowMenu(!showMenu)} className="text-text-primary hover:text-text-secondary p-1 hover:bg-bg-primary rounded-full transition-colors">
            <MoreHorizontal className="w-5 h-5" />
          </button>
          {showMenu && user?.id === currentPost.author_id && (
            <div className="absolute right-0 mt-2 w-32 bg-bg-surface border border-border-subtle rounded-xl shadow-lg z-10 py-1">
              <button onClick={handleEdit} className="flex items-center w-full px-4 py-2 text-[14px] text-left hover:bg-bg-primary text-text-primary">
                <Pencil className="w-4 h-4 mr-2" /> Edit
              </button>
              <button onClick={handleDelete} className="flex items-center w-full px-4 py-2 text-[14px] text-left text-red-500 hover:bg-red-500/10">
                <Trash2 className="w-4 h-4 mr-2" /> Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Media / Content Area (Double tap to like) */}
      <RippleEffect className={`w-full bg-bg-primary ${currentPost.media_url ? '' : 'min-h-[250px] p-8'} flex items-center justify-center relative overflow-hidden`} onDoubleClick={handleDoubleTap}>
        {currentPost.media_url ? (
          <img src={currentPost.media_url} alt="Post media" className="w-full max-h-[500px] object-cover" />
        ) : (
          isEditing ? (
            <div className="w-full max-w-[90%] z-10 bg-bg-surface p-4 rounded-xl shadow-lg border border-border-subtle" onClick={e => e.stopPropagation()}>
              <textarea 
                value={editContent} 
                onChange={(e) => setEditContent(e.target.value)} 
                className="w-full bg-transparent text-text-primary text-[14px] p-2 border border-border-subtle rounded-xl resize-none h-32 focus:outline-none focus:border-brand-start"
              />
              <div className="flex justify-end mt-3 space-x-3">
                <button onClick={() => setIsEditing(false)} className="px-4 py-1.5 text-[14px] font-semibold text-text-secondary hover:text-text-primary transition-colors">Cancel</button>
                <button onClick={saveEdit} className="px-4 py-1.5 text-[14px] font-semibold bg-gradient-brand rounded-xl transition-colors shadow-sm">Save</button>
              </div>
            </div>
          ) : (
            <p className="text-[20px] text-text-primary font-medium text-center break-words max-w-[90%]">
              {currentPost.content}
            </p>
          )
        )}
      </RippleEffect>

      {/* Action Row */}
      <div className="p-4">
        <div className="flex justify-between items-center mb-3">
          <div className="flex space-x-4">
            <RippleEffect className="rounded-full !overflow-visible">
              <button 
                onClick={handleLike} 
                className="p-1 -ml-1 text-text-primary transition-transform hover:scale-110 active:scale-95 focus:outline-none group relative"
              >
                <AnimatePresence>
                  {isLiked && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                      className="absolute inset-0 p-1 flex items-center justify-center"
                    >
                      <Heart className="w-[26px] h-[26px] fill-brand-start text-brand-start" />
                    </motion.div>
                  )}
                </AnimatePresence>
                <Heart className={`w-[26px] h-[26px] transition-all duration-200 ${isLiked ? 'opacity-0' : 'opacity-100 hover:text-text-secondary'}`} />
              </button>
            </RippleEffect>
            <button onClick={handleCommentIconClick} className="p-1 text-text-primary hover:text-text-secondary transition-transform hover:scale-110 active:scale-95 cursor-pointer">
              <MessageCircle className="w-[26px] h-[26px]" />
            </button>
            <button className="p-1 text-text-primary hover:text-text-secondary transition-transform hover:scale-110 active:scale-95 cursor-pointer">
              <Send className="w-[26px] h-[26px]" />
            </button>
          </div>
          <button className="p-1 -mr-1 text-text-primary hover:text-text-secondary transition-transform hover:scale-110 active:scale-95 cursor-pointer">
            <Bookmark className="w-[26px] h-[26px]" />
          </button>
        </div>

        {/* Likes */}
        <div className="font-semibold text-[14px] text-text-primary mb-1">
          {likeCount.toLocaleString()} likes
        </div>

        {/* Caption */}
        <div className="text-[14px] text-text-primary mb-2">
          <span className="font-semibold mr-2 hover:underline cursor-pointer">{author?.display_name || 'Loading...'}</span>
          <span>{currentPost.content.length > 80 ? currentPost.content.substring(0, 80) + '...' : currentPost.content}</span>
        </div>

        {/* Comments Link & List */}
        <button onClick={toggleComments} className="text-[14px] text-text-secondary mb-3 hover:underline cursor-pointer">
          {showComments ? 'Hide comments' : 'View comments'}
        </button>

        {showComments && (
          <div className="mt-2 mb-4 max-h-60 overflow-y-auto pr-2">
            {loadingComments ? (
              <p className="text-[13px] text-text-secondary">Loading...</p>
            ) : comments.length === 0 ? (
              <p className="text-[13px] text-text-secondary">No comments yet.</p>
            ) : (
              comments.map(c => <CommentItem key={c.id} comment={c} />)
            )}
          </div>
        )}

        {/* Composer */}
        {showComposer && (
          <div className="flex items-center space-x-3 pt-3 border-t border-border-subtle mt-1">
            <Avatar src={user?.avatar_url} initials={user?.display_name || '?'} size="sm" className="w-8 h-8" />
            <input 
              ref={commentInputRef}
              type="text" 
              placeholder="Add a comment..." 
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && submitComment()}
              className="flex-1 bg-transparent text-[14px] outline-none text-text-primary placeholder:text-text-secondary"
            />
            <button 
              onClick={submitComment}
              disabled={!commentText.trim() || isCommenting}
              className="text-brand-start font-semibold text-[14px] disabled:opacity-50 hover:opacity-80 transition-colors"
            >
              Post
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
