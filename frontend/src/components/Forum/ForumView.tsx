// ─── ForumView — modular communities router component ─────────────────────────
import React, { useState, useEffect } from 'react';
import type { ForumThread } from '../../types';
import { fetchForumThreads, fetchForumThread, postForumThread, postForumComment, fetchForumStats } from '../../api/client';
import { ForumList } from './ForumList';
import { ThreadDetail } from './ThreadDetail';
import { CreateThread } from './CreateThread';
import './ForumView.css';

interface ForumViewProps {
  userId: string;
  token: string;
}

type ForumSubPage = 'home' | 'thread' | 'create';

export const ForumView: React.FC<ForumViewProps> = ({ userId, token }) => {
  const [subPage, setSubPage] = useState<ForumSubPage>('home');
  const [threads, setThreads] = useState<ForumThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('All Topics');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Active Thread Detail state
  const [selectedThread, setSelectedThread] = useState<ForumThread | null>(null);
  const [replyContent, setReplyContent] = useState('');
  
  // New Post Form state
  const [newTitle, setNewTitle] = useState('');
  const [trendingTags, setTrendingTags] = useState<{ tag: string; count: number }[]>([]);
  const [topContributors, setTopContributors] = useState<{ username: string; avatar: string; xp: number }[]>([]);
  const [newCategory, setNewCategory] = useState<'Question' | 'Discussion' | 'Showcase' | 'Help' | 'Announcement'>('Question');
  const [newContent, setNewContent] = useState('');
  const [newTags, setNewTags] = useState('');

  // Sync threads on filter changes
  useEffect(() => {
    setLoading(true);
    fetchForumThreads(
      activeCategory === 'All Topics' ? undefined : activeCategory,
      searchQuery.trim() || undefined
    )
      .then(setThreads)
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));

    fetchForumStats()
      .then((res) => {
        setTrendingTags(res.trending_tags);
        setTopContributors(res.top_contributors);
      })
      .catch((err) => console.error("Error loading forum stats:", err));
  }, [activeCategory, searchQuery, subPage]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handleSelectThread = async (threadId: string) => {
    try {
      setLoading(true);
      const thread = await fetchForumThread(threadId);
      setSelectedThread(thread);
      setSubPage('thread');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePostReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim() || !selectedThread) return;
    try {
      const authorName = userId.startsWith("wallet-") 
        ? `${userId.replace("wallet-", "").slice(0, 6)}...`
        : `@${userId.replace("gh-", "")}`;
      await postForumComment(selectedThread.thread_id, authorName, replyContent.trim(), token);
      setReplyContent('');
      // Reload thread
      const thread = await fetchForumThread(selectedThread.thread_id);
      setSelectedThread(thread);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;
    try {
      setLoading(true);
      const authorName = userId.startsWith("wallet-") 
        ? `${userId.replace("wallet-", "").slice(0, 6)}...`
        : `@${userId.replace("gh-", "")}`;
      const tagsArray = newTags.split(',').map(t => t.trim()).filter(Boolean);
      await postForumThread(newTitle.trim(), authorName, newCategory, newContent.trim(), tagsArray, token);
      
      // Reset form
      setNewTitle('');
      setNewContent('');
      setNewTags('');
      setNewCategory('Question');
      setSubPage('home');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatAuthor = (author: string) => {
    if (author.startsWith("wallet-")) {
      return `${author.replace("wallet-", "").slice(0, 6)}...${author.replace("wallet-", "").slice(-4)}`;
    }
    return author;
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'Question': return '#f59e0b';
      case 'Discussion': return '#7c3aed';
      case 'Showcase': return '#10b981';
      case 'Help': return '#ef4444';
      default: return '#3b82f6';
    }
  };

  return (
    <div className="forum-view animate-fade-up">
      {subPage === 'home' && (
        <ForumList
          threads={threads}
          loading={loading}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          handleSearchSubmit={handleSearchSubmit}
          handleSelectThread={handleSelectThread}
          trendingTags={trendingTags}
          topContributors={topContributors}
          onCreatePostClick={() => setSubPage('create')}
          formatAuthor={formatAuthor}
          getCategoryColor={getCategoryColor}
        />
      )}

      {subPage === 'thread' && selectedThread && (
        <ThreadDetail
          thread={selectedThread}
          replyContent={replyContent}
          setReplyContent={setReplyContent}
          handlePostReply={handlePostReply}
          onBack={() => setSubPage('home')}
          formatAuthor={formatAuthor}
          getCategoryColor={getCategoryColor}
        />
      )}

      {subPage === 'create' && (
        <CreateThread
          newTitle={newTitle}
          setNewTitle={setNewTitle}
          newCategory={newCategory}
          setNewCategory={setNewCategory}
          newContent={newContent}
          setNewContent={setNewContent}
          newTags={newTags}
          setNewTags={setNewTags}
          handleCreatePost={handleCreatePost}
          onCancel={() => setSubPage('home')}
        />
      )}
    </div>
  );
};

export default ForumView;
