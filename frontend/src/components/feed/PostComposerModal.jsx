import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Image as ImageIcon } from 'lucide-react';
import { createPost, uploadMedia } from '../../api/posts';

export const PostComposerModal = ({ isOpen, onClose, onPostCreated }) => {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && !selectedFile) return;

    try {
      setIsSubmitting(true);
      
      let mediaUrl = null;
      if (selectedFile) {
        const uploadResult = await uploadMedia(selectedFile);
        mediaUrl = uploadResult.url;
      }

      await createPost({ content, mediaUrl });
      
      setContent('');
      removeImage();
      onPostCreated();
      onClose();
    } catch (error) {
      console.error('Failed to create post', error);
      alert('Failed to post. Try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={onClose}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={e => e.stopPropagation()}
              className="bg-bg-surface w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl border border-border-subtle flex flex-col max-h-[90vh]"
            >
              <div className="flex items-center justify-between p-4 border-b border-border-subtle shrink-0">
                <h2 className="font-semibold text-text-primary text-[20px]">Create new post</h2>
                <button onClick={onClose} className="p-2 text-text-secondary hover:text-text-primary transition-colors cursor-pointer rounded-full hover:bg-bg-primary">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-4 overflow-y-auto">
                <textarea
                  className="w-full h-32 bg-transparent text-text-primary placeholder:text-text-secondary resize-none outline-none text-[15px]"
                  placeholder="What's on your mind?"
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  autoFocus
                />
                
                {previewUrl && (
                  <div className="relative mt-2 rounded-xl overflow-hidden">
                    <img src={previewUrl} alt="Preview" className="w-full h-auto max-h-64 object-cover" />
                    <button 
                      onClick={removeImage}
                      className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                )}
                
                <div className="flex items-center justify-between mt-4 border-t border-border-subtle pt-4">
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                  />
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="text-brand-start hover:bg-brand-start/10 transition-colors p-2 rounded-full cursor-pointer"
                  >
                    <ImageIcon className="w-[22px] h-[22px]" />
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={(!content.trim() && !selectedFile) || isSubmitting}
                    className="bg-gradient-brand text-white px-6 py-2 rounded-full font-semibold text-[15px] transition-all duration-150 disabled:opacity-50 cursor-pointer flex items-center shadow-md hover:shadow-lg hover:-translate-y-0.5 active:scale-95"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin mr-2" />
                        Posting...
                      </>
                    ) : 'Share'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
