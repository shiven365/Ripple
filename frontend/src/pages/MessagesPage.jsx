import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useLocation } from 'react-router-dom';
import { useSocket } from '../hooks/useSocket';
import { getConversations, getMessages, sendMessage } from '../api/messages';
import { getProfile, searchUsers } from '../api/users';
import { getOnlineUsers } from '../api/notifications';
import { Avatar } from '../components/ui/Avatar';
import { Search, Video, Phone, MoreVertical, Plus, Smile, Mic, MessageSquare } from 'lucide-react';

export const MessagesPage = () => {
  const { user } = useAuth();
  const location = useLocation();
  const { lastMessage } = useSocket(user?.id);
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null); // { otherUserId, profile, messages }
  const [inputText, setInputText] = useState('');
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const messagesEndRef = useRef(null);

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toLowerCase();
  };

  useEffect(() => {
    if (user?.id) loadConversations();
  }, [user?.id]);

  useEffect(() => {
    if (location.state?.openChatWith) {
      const p = location.state.openChatWith;
      openChat(p.id, p);
      // Clear state to prevent reopening on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

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

  useEffect(() => {
    // Check if the notification is a new chat message
    if (lastMessage && lastMessage.sender_id && lastMessage.receiver_id) { 
      setActiveChat(prev => {
        if (!prev) return prev;
        
        const isChatOpen = 
          (lastMessage.sender_id === prev.otherUserId && lastMessage.receiver_id === user?.id) || 
          (lastMessage.sender_id === user?.id && lastMessage.receiver_id === prev.otherUserId);
          
        if (isChatOpen) {
          if (prev.messages.find(m => m.id === lastMessage.id)) return prev;
          return { ...prev, messages: [...prev.messages, lastMessage] };
        }
        
        return prev;
      });
      
      loadConversations();
    }
  }, [lastMessage, user?.id]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await searchUsers(searchQuery);
        setSearchResults(results.filter(r => r.id !== user?.id));
      } catch (err) {
        console.error('Search failed', err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, user?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChat?.messages]);

  const loadConversations = async () => {
    try {
      const convos = await getConversations();
      const enriched = await Promise.all(convos.map(async (c) => {
        const otherUserId = c.sender_id === user.id ? c.receiver_id : c.sender_id;
        try {
          const profile = await getProfile(otherUserId);
          return { ...c, profile, otherUserId };
        } catch(e) {
          return { ...c, profile: { display_name: 'Unknown', avatar_url: null }, otherUserId };
        }
      }));
      // Sort conversations by latest message first
      enriched.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
      setConversations(enriched);
    } catch (err) {
      console.error(err);
    }
  };

  const openChat = async (otherUserId, profile) => {
    try {
      const msgs = await getMessages(otherUserId);
      setActiveChat({ otherUserId, profile, messages: msgs });
    } catch (err) {
      console.error(err);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activeChat) return;
    try {
      await sendMessage(activeChat.otherUserId, inputText);
      setInputText('');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-1 w-full h-[calc(100vh-3.5rem)] md:h-screen bg-bg-primary">
      {/* Conversations List */}
      <div className={`w-full md:w-[380px] shrink-0 border-r border-border-subtle bg-bg-surface overflow-y-auto ${activeChat ? 'hidden md:flex flex-col' : 'flex flex-col'}`}>
        <div className="flex items-center justify-between p-4 sticky top-0 bg-bg-surface z-10">
          <h2 className="font-bold text-[22px]">Chats</h2>
          <div className="flex gap-4 text-text-secondary">
            <MessageSquare className="w-5 h-5 cursor-pointer hover:text-text-primary" />
            <MoreVertical className="w-5 h-5 cursor-pointer hover:text-text-primary" />
          </div>
        </div>
        
        <div className="px-4 pb-2">
          <div className="bg-bg-primary rounded-lg flex items-center px-3 py-1.5 mb-3">
            <Search className="w-4 h-4 text-text-secondary mr-3" />
            <input 
              type="text" 
              placeholder="Search or start a new chat" 
              className="bg-transparent border-none outline-none text-sm w-full" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto mt-2">
          {searchQuery.trim() ? (
            searchResults.length > 0 ? searchResults.map(profile => (
              <div 
                key={profile.id} 
                onClick={() => {
                  openChat(profile.id, profile);
                  setSearchQuery('');
                }}
                className="flex items-center py-3 px-4 cursor-pointer hover:bg-bg-primary transition-colors"
              >
                <Avatar 
                  src={profile.avatar_url} 
                  initials={profile.display_name} 
                  size="md" 
                  isOnline={onlineUsers.has(profile.id)}
                />
                <div className="ml-3 flex-1 min-w-0 flex flex-col justify-center border-b border-border-subtle pb-3 pt-1">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <p className="font-semibold text-[16px] text-text-primary truncate pr-2">
                      {profile.display_name}
                    </p>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-[14px] truncate pr-2 text-text-secondary">
                      {profile.bio || 'Start chatting...'}
                    </p>
                  </div>
                </div>
              </div>
            )) : (
              <p className="text-center text-text-secondary mt-10 text-sm">
                {isSearching ? 'Searching...' : 'No users found.'}
              </p>
            )
          ) : (
            conversations.map(c => {
              const isUnread = c.sender_id !== user.id && !c.is_read;
              return (
                <div 
                  key={c.id} 
                  onClick={() => openChat(c.otherUserId, c.profile)}
                  className={`flex items-center py-3 px-4 cursor-pointer hover:bg-bg-primary transition-colors ${activeChat?.otherUserId === c.otherUserId ? 'bg-bg-primary' : ''}`}
                >
                  <Avatar 
                    src={c.profile.avatar_url} 
                    initials={c.profile.display_name} 
                    size="md" 
                    isOnline={onlineUsers.has(c.otherUserId)}
                  />
                  <div className="ml-3 flex-1 min-w-0 flex flex-col justify-center border-b border-border-subtle pb-3 pt-1">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <p className="font-semibold text-[16px] text-text-primary truncate pr-2">
                        {c.profile.display_name}
                      </p>
                      <span className={`text-[12px] whitespace-nowrap ${isUnread ? 'text-[#00a884]' : 'text-text-secondary'}`}>
                        {formatTime(c.created_at) || 'Now'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className={`text-[14px] truncate pr-2 ${isUnread ? 'text-text-primary font-semibold' : 'text-text-secondary'}`}>
                        {c.sender_id === user.id ? '✓✓ ' : ''}{c.content}
                      </p>
                      {isUnread && (
                        <div className="shrink-0 flex items-center justify-end ml-2">
                          <div className="bg-[#00a884] text-bg-primary text-[11px] font-bold w-5 h-5 flex items-center justify-center rounded-full">
                            1
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          {!searchQuery.trim() && conversations.length === 0 && (
            <p className="text-center text-text-secondary mt-10 text-sm">No messages yet.</p>
          )}
        </div>
      </div>

      {/* Active Chat Window */}
      <div className={`flex-1 flex-col relative ${activeChat ? 'flex' : 'hidden md:flex'} bg-[#0b141a]`}>
        {activeChat ? (
          <>
            <div className="py-2.5 px-4 border-b border-border-subtle flex items-center bg-bg-surface sticky top-0 z-20">
              <button 
                className="md:hidden mr-3 text-text-secondary hover:text-text-primary transition-colors" 
                onClick={() => setActiveChat(null)}
              >
                <span className="text-2xl leading-none">←</span>
              </button>
              <Avatar src={activeChat.profile.avatar_url} initials={activeChat.profile.display_name} size="md" isOnline={onlineUsers.has(activeChat.otherUserId)} />
              <div className="ml-4 flex-1">
                <h3 className="font-semibold text-[16px] leading-tight text-[#e9edef]">{activeChat.profile.display_name}</h3>
                {onlineUsers.has(activeChat.otherUserId) ? <p className="text-[13px] text-text-secondary">online</p> : <p className="text-[13px] text-text-secondary">click here for contact info</p>}
              </div>

            </div>
            
            <div className="flex-1 overflow-y-auto p-4 flex flex-col space-y-2 pb-24" style={{ backgroundImage: "url('https://i.pinimg.com/736x/8c/98/99/8c98994518b575bfd8c949e91d20548b.jpg')", backgroundSize: 'cover', backgroundBlendMode: 'overlay', backgroundColor: 'rgba(11, 20, 26, 0.95)' }}>
              {activeChat.messages.map(m => {
                const isMine = m.sender_id === user.id;
                return (
                  <div key={m.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`relative max-w-[65%] px-2.5 py-1.5 text-[14.5px] shadow-sm ${isMine ? 'bg-[#005c4b] text-[#e9edef] rounded-lg rounded-tr-none' : 'bg-[#202c33] text-[#e9edef] rounded-lg rounded-tl-none'}`}>
                      <span className="mr-12">{m.content}</span>
                      <span className="text-[11px] text-white/60 absolute bottom-1 right-2">
                        {formatTime(m.created_at)}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <div className="absolute bottom-0 left-0 right-0 py-2.5 px-4 bg-bg-surface flex items-center gap-3">
              <Plus className="w-6 h-6 text-[#aebac1] cursor-pointer hover:text-[#d1d7db]" />
              <div className="flex-1 bg-[#2a3942] rounded-lg flex items-center px-4 py-2.5">
                <Smile className="w-6 h-6 text-[#aebac1] cursor-pointer hover:text-[#d1d7db] mr-3" />
                <form onSubmit={handleSend} className="flex-1 flex">
                  <input 
                    type="text" 
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Type a message"
                    className="flex-1 bg-transparent border-none outline-none text-[#e9edef] text-[15px] placeholder-[#aebac1]"
                  />
                  <button type="submit" disabled={!inputText.trim()} className="hidden">Send</button>
                </form>
              </div>
              {inputText.trim() && (
                <button onClick={handleSend} className="w-10 h-10 rounded-full bg-[#00a884] flex items-center justify-center text-white shrink-0">
                  <svg viewBox="0 0 24 24" height="24" width="24" preserveAspectRatio="xMidYMid meet" className="ml-1" fill="currentColor"><path d="M1.101,21.757L23.8,12.028L1.101,2.3l0.011,7.912l13.623,1.816L1.112,13.845 L1.101,21.757z"></path></svg>
                </button>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-[#8696a0] flex-col" style={{ borderBottom: '6px solid #00a884' }}>
            <div className="w-24 h-24 mb-6 text-7xl flex items-center justify-center grayscale opacity-80">
              💬
            </div>
            <h1 className="text-3xl font-light text-[#e9edef] mb-4">Ripple Web</h1>
            <p className="text-[14px]">Send and receive messages without keeping your phone online.</p>
            <p className="text-[14px]">Use Ripple on up to 4 linked devices and 1 phone at the same time.</p>
          </div>
        )}
      </div>
    </div>
  );
};
