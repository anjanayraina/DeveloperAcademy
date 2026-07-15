import React from 'react';
import type { ForumThread } from '../../types';

interface ForumListProps {
  threads: ForumThread[];
  loading: boolean;
  activeCategory: string;
  setActiveCategory: (cat: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  handleSearchSubmit: (e: React.FormEvent) => void;
  handleSelectThread: (threadId: string) => void;
  trendingTags: { tag: string; count: number }[];
  topContributors: { username: string; avatar: string; xp: number }[];
  onCreatePostClick: () => void;
  formatAuthor: (author: string) => string;
  getCategoryColor: (cat: string) => string;
}

export const ForumList: React.FC<ForumListProps> = ({
  threads,
  loading,
  activeCategory,
  setActiveCategory,
  searchQuery,
  setSearchQuery,
  handleSearchSubmit,
  handleSelectThread,
  trendingTags,
  topContributors,
  onCreatePostClick,
  formatAuthor,
}) => {
  return (
    <div className="forum-layout">
      <div className="forum-main">
        {/* Header Row */}
        <div className="forum-header-row">
          <div className="forum-header-row__left">
            <h2 className="forum-title">Connect with the MOR Developer Community</h2>
            <p className="forum-subtitle">Share ideas, ask questions, and build together.</p>
          </div>
          <div className="forum-header-row__right">
            <form className="forum-header-row__search-container" onSubmit={handleSearchSubmit}>
              <span className="forum-header-row__search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search discussions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="forum-header-row__search-input"
              />
            </form>
            <button className="btn btn--primary" onClick={onCreatePostClick}>
              + New Post
            </button>
          </div>
        </div>

        {/* Navigation & Search Pills */}
        <div className="forum-nav-bar glass">
          <div className="forum-categories">
            {[
              { id: 'All Topics', label: 'All Discussions' },
              { id: 'Discussion', label: 'Web3 Development' },
              { id: 'Question', label: 'Smart Contracts' },
              { id: 'Showcase', label: 'DeFi & DAOs' },
              { id: 'Help', label: 'Ecosystem & Grants' }
            ].map((cat) => (
              <button
                key={cat.id}
                className={`forum-cat-btn ${activeCategory === cat.id ? 'forum-cat-btn--active' : ''}`}
                onClick={() => setActiveCategory(cat.id)}
              >
                {cat.label}
              </button>
            ))}
          </div>
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
              <div
                key={thread.thread_id}
                className="thread-row-card glass"
                onClick={() => handleSelectThread(thread.thread_id)}
              >
                <div className="thread-row-card__avatar">
                  {thread.author.replace('gh-', '').replace('wallet-', '').slice(0, 2).toUpperCase()}
                </div>
                
                <div className="thread-row-card__content">
                  <h4 className="thread-row-card__title">{thread.title}</h4>
                  
                  <div className="thread-row-card__tags">
                    <span className="thread-row-card__tag-item thread-row-card__tag-item--blue">
                      {thread.category}
                    </span>
                    {thread.tags.slice(0, 2).map((t, idx) => (
                      <span
                        key={idx}
                        className={`thread-row-card__tag-item ${
                          idx === 0 ? 'thread-row-card__tag-item--green' : 'thread-row-card__tag-item--purple'
                        }`}
                      >
                        #{t}
                      </span>
                    ))}
                  </div>

                  <div className="thread-row-card__meta">
                    <span>{formatAuthor(thread.author)}</span>
                    <span>•</span>
                    <span>{new Date(thread.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="thread-row-card__metrics">
                  <span className="thread-row-card__metric-item">
                    💬 {thread.replies_count}
                  </span>
                  <span className="thread-row-card__metric-item">
                    ❤️ {thread.likes_count}
                  </span>
                  <span className="thread-row-card__metric-item">
                    👁️ {thread.views_count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sidebar Panels */}
      <div className="forum-sidebar">
        {/* Academy Guidelines */}
        <div className="forum-panel glass">
          <h3 className="forum-panel__title">Academy Guidelines</h3>
          <div style={{ marginTop: 12 }}>
            {[
              { emoji: '🤝', text: 'Be respectful and helpful.' },
              { emoji: '🔍', text: 'Search before creating a thread.' },
              { emoji: '📝', text: 'Format code blocks with syntax highlighting.' },
              { emoji: '🚫', text: 'Do not post spam or referral links.' }
            ].map((g, idx) => (
              <div key={idx} className="guideline-bullet">
                <span>{g.emoji}</span>
                <span>{g.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Online Status */}
        <div className="forum-panel glass" style={{ padding: '16px 20px' }}>
          <div className="online-status-indicator">
            <span className="online-dot" />
            <span>142 developers online</span>
          </div>
        </div>

        {/* Trending topics */}
        <div className="forum-panel glass">
          <h3 className="forum-panel__title">Trending Topics</h3>
          <div className="trending-tags">
            {trendingTags.map((tagObj, idx) => (
              <span
                key={idx}
                className="trending-tag"
                style={{ cursor: 'pointer' }}
                onClick={() => setSearchQuery(tagObj.tag)}
              >
                #{tagObj.tag}{' '}
                <span className="trending-tag__count">
                  {tagObj.count} {tagObj.count === 1 ? 'post' : 'posts'}
                </span>
              </span>
            ))}
          </div>
        </div>

        {/* Top Contributors */}
        <div className="forum-panel glass">
          <h3 className="forum-panel__title">Top Contributors</h3>
          <div className="contributors-list">
            {topContributors.map((c, idx) => (
              <div key={idx} className="contributor-item">
                <div className="contributor-avatar">{c.avatar}</div>
                <div>
                  <div className="contributor-name">{c.username}</div>
                  <div className="contributor-xp">{c.xp.toLocaleString()} points</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
