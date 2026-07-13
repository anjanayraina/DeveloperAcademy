import React, { useState, useEffect } from 'react';
import type { ForumThread } from '../../types';
import { fetchForumThreads, fetchForumThread, postForumThread, postForumComment } from '../../api/client';
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
  }, [activeCategory, searchQuery, subPage]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Re-triggering via state dependency happens naturally
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
        <div className="forum-layout">
          <div className="forum-main">
            {/* Header */}
            <div className="forum-header">
              <div>
                <h2 className="forum-title">Community Forum</h2>
                <p className="forum-subtitle">Ask questions, share knowledge, and grow with fellow developers.</p>
              </div>
              <button className="btn btn--primary" onClick={() => setSubPage('create')}>
                + New Post
              </button>
            </div>

            {/* Navigation & Search */}
            <div className="forum-nav-bar glass">
              <div className="forum-categories">
                {['All Topics', 'Question', 'Discussion', 'Showcase', 'Help', 'Announcement'].map((cat) => (
                  <button
                    key={cat}
                    className={`forum-cat-btn ${activeCategory === cat ? 'forum-cat-btn--active' : ''}`}
                    onClick={() => setActiveCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <form className="forum-search-form" onSubmit={handleSearchSubmit}>
                <input
                  type="text"
                  placeholder="Search discussions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="forum-search-input"
                />
              </form>
            </div>

            {/* Threads List */}
            {loading ? (
              <div className="forum-loading">
                <div className="spinner" />
                <p>Loading discussions...</p>
              </div>
            ) : threads.length === 0 ? (
              <div className="forum-empty glass">
                <p>No threads found in this category. Be the first to start a discussion!</p>
              </div>
            ) : (
              <div className="forum-threads-list">
                {threads.map((thread) => (
                  <div key={thread.thread_id} className="thread-item glass" onClick={() => handleSelectThread(thread.thread_id)}>
                    <div className="thread-item__main">
                      <div className="thread-item__title-row">
                        <span 
                          className="thread-item__badge" 
                          style={{ backgroundColor: getCategoryColor(thread.category) }}
                        >
                          {thread.category}
                        </span>
                        <h4 className="thread-item__title">{thread.title}</h4>
                      </div>
                      <p className="thread-item__preview">
                        {thread.content.slice(0, 140)}{thread.content.length > 140 ? '...' : ''}
                      </p>
                      <div className="thread-item__meta">
                        <span className="thread-item__author">By {formatAuthor(thread.author)}</span>
                        <span className="thread-item__dot">•</span>
                        <span>{new Date(thread.created_at).toLocaleDateString()}</span>
                        <div className="thread-item__tags">
                          {thread.tags.map(t => (
                            <span key={t} className="thread-tag">#{t}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="thread-item__stats">
                      <div className="thread-stat">
                        <span className="thread-stat__val">{thread.replies_count}</span>
                        <span className="thread-stat__lbl">replies</span>
                      </div>
                      <div className="thread-stat">
                        <span className="thread-stat__val">{thread.views_count}</span>
                        <span className="thread-stat__lbl">views</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar Panels */}
          <div className="forum-sidebar">
            {/* Trending topics */}
            <div className="forum-panel glass">
              <h3 className="forum-panel__title">Trending Topics</h3>
              <div className="trending-tags">
                <span className="trending-tag">#solidity <span className="trending-tag__count">24 posts</span></span>
                <span className="trending-tag">#gas <span className="trending-tag__count">12 posts</span></span>
                <span className="trending-tag">#defi <span className="trending-tag__count">18 posts</span></span>
                <span className="trending-tag">#security <span className="trending-tag__count">10 posts</span></span>
                <span className="trending-tag">#dao <span className="trending-tag__count">6 posts</span></span>
              </div>
            </div>

            {/* Top Contributors */}
            <div className="forum-panel glass">
              <h3 className="forum-panel__title">Top Contributors</h3>
              <div className="contributors-list">
                <div className="contributor-item">
                  <div className="contributor-avatar">BM</div>
                  <div>
                    <div className="contributor-name">BlockMaster</div>
                    <div className="contributor-xp">1,250 points</div>
                  </div>
                </div>
                <div className="contributor-item">
                  <div className="contributor-avatar">AD</div>
                  <div>
                    <div className="contributor-name">AliceDev</div>
                    <div className="contributor-xp">980 points</div>
                  </div>
                </div>
                <div className="contributor-item">
                  <div className="contributor-avatar">SB</div>
                  <div>
                    <div className="contributor-name">SmartBuilder</div>
                    <div className="contributor-xp">820 points</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {subPage === 'thread' && selectedThread && (
        <div className="thread-view-container">
          <div className="thread-view-header">
            <button className="btn btn--text back-btn" onClick={() => setSubPage('home')}>
              ← Back to Forum
            </button>
          </div>

          <div className="thread-main-card glass">
            <div className="thread-card-header">
              <span 
                className="thread-item__badge" 
                style={{ backgroundColor: getCategoryColor(selectedThread.category) }}
              >
                {selectedThread.category}
              </span>
              <h1 className="thread-detail-title">{selectedThread.title}</h1>
              <div className="thread-meta-info">
                <span>Posted by <strong>{formatAuthor(selectedThread.author)}</strong></span>
                <span>•</span>
                <span>{new Date(selectedThread.created_at).toLocaleString()}</span>
              </div>
            </div>

            <div className="thread-detail-content">
              {selectedThread.content}
            </div>

            <div className="thread-detail-tags">
              {selectedThread.tags.map(t => (
                <span key={t} className="thread-tag">#{t}</span>
              ))}
            </div>
          </div>

          {/* Comments list */}
          <div className="comments-section">
            <h3 className="comments-title">Replies ({selectedThread.replies_count})</h3>
            
            <div className="comments-list">
              {selectedThread.comments.map((comment) => (
                <div key={comment.comment_id} className="comment-card glass">
                  <div className="comment-header">
                    <span className="comment-author">{formatAuthor(comment.author)}</span>
                    <span className="comment-date">{new Date(comment.created_at).toLocaleString()}</span>
                  </div>
                  <div className="comment-body">
                    {comment.content}
                  </div>
                </div>
              ))}
            </div>

            {/* Post comment reply */}
            <form className="comment-reply-form glass" onSubmit={handlePostReply}>
              <h4 className="reply-form-title">Reply to this thread</h4>
              <textarea
                placeholder="Write your reply here..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                className="reply-textarea"
                rows={4}
                required
              />
              <button type="submit" className="btn btn--primary reply-submit-btn">
                Reply
              </button>
            </form>
          </div>
        </div>
      )}

      {subPage === 'create' && (
        <div className="create-post-container glass">
          <div className="create-post-header">
            <h2>Create a New Post</h2>
            <p>Share your question, idea, or project with the community.</p>
          </div>

          <form onSubmit={handleCreatePost} className="create-post-form">
            <div className="form-group">
              <label className="form-label">Title</label>
              <input
                type="text"
                placeholder="What is your post about?"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Category</label>
              <div className="category-select-grid">
                {[
                  { id: 'Question', label: '❓ Question', desc: 'Ask a technical query or request code review' },
                  { id: 'Discussion', label: '💬 Discussion', desc: 'Discuss Web3 trends, ideas, or architectural patterns' },
                  { id: 'Showcase', label: '🚀 Showcase', desc: 'Share your completed project, dApp, or smart contract' },
                  { id: 'Help', label: '🚨 Help', desc: 'Get assistance with compiling errors, setups, or bugs' },
                  { id: 'Announcement', label: '📢 Announcement', desc: 'Broadcast platform updates, releases, or news' }
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    className={`category-select-card ${newCategory === cat.id ? 'category-select-card--active' : ''}`}
                    onClick={() => setNewCategory(cat.id as any)}
                  >
                    <div className="category-select-card__label">{cat.label}</div>
                    <div className="category-select-card__desc">{cat.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Content</label>
              <textarea
                placeholder="Write your post content here..."
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                className="form-textarea"
                rows={10}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Tags (comma-separated)</label>
              <input
                type="text"
                placeholder="e.g. solidity, gas, defi"
                value={newTags}
                onChange={(e) => setNewTags(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="create-post-actions">
              <button type="button" className="btn btn--secondary" onClick={() => setSubPage('home')}>
                Cancel
              </button>
              <button type="submit" className="btn btn--primary">
                Publish Post
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ForumView;
