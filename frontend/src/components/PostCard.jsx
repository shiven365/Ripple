import React from 'react';

const PostCard = ({ post }) => {
  return (
    <div className="bg-white p-4 rounded shadow-sm border border-gray-100 mb-4">
      <div className="flex items-center mb-2">
        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-800 font-bold mr-3">
          {post.authorId?.charAt(0).toUpperCase() || '?'}
        </div>
        <div>
          <h4 className="font-semibold text-gray-900">{post.authorId}</h4>
          <span className="text-xs text-gray-500">{new Date(post.createdAt).toLocaleString()}</span>
        </div>
      </div>
      <p className="text-gray-800 mt-2">{post.content}</p>
    </div>
  );
};

export default PostCard;
