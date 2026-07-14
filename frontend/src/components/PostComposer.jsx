import React, { useState } from 'react';
import { createPost } from '../api/posts';

const PostComposer = ({ onPostCreated }) => {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      setIsSubmitting(true);
      await createPost({ content });
      setContent('');
      if (onPostCreated) onPostCreated();
    } catch (error) {
      console.error('Failed to create post', error);
      alert('Failed to post. Try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded shadow-sm border border-gray-100 mb-6">
      <form onSubmit={handleSubmit}>
        <textarea
          className="w-full border border-gray-200 rounded p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          rows="3"
          placeholder="What's happening?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={isSubmitting}
        />
        <div className="flex justify-end mt-2">
          <button
            type="submit"
            disabled={isSubmitting || !content.trim()}
            className="bg-indigo-600 text-white px-4 py-2 rounded font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {isSubmitting ? 'Posting...' : 'Post'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PostComposer;
