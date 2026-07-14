import React from 'react';
import type { ForumThread } from '../../types';

const getAuthorBadge = (author: string) => {
  const name = author.toLowerCase();
  if (name.includes('mentor') || name.includes('openclaw') || name.includes('hermes')) {
    return { text: 'Mentor', color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)' };
  }
  if (name.includes('alex') || name.includes('core')) {
    return { text: 'Core Contributor', color: '#a855f7', bg: 'rgba(168, 85, 247, 0.1)', border: '1px solid rgba(168, 85, 247, 0.2)' };
  }
  if (name.includes('lucas') || name.includes('top') || name.includes('dev')) {
    return { text: 'Top Builder', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)' };
  }
  return { text: 'New Member', color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.1)', border: '1px solid rgba(148, 163, 184, 0.2)' };
};

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
  getCategoryColor,
}) => {
  return (
    <div className="forum-layout">
      <div className="forum-main">
        {/* Header */}
        <div className="forum-header">
          <div>
            <h2 className="forum-title">Community Forum</h2>
            <p className="forum-subtitle">Ask questions, share knowledge, and grow with fellow developers.</p>
          </div>
          <button className="btn btn--primary" onClick={onCreatePostClick}>
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
                    <span className="thread-item__author" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                      By {formatAuthor(thread.author)}
                      {(() => {
                        const badge = getAuthorBadge(thread.author);
                        return (
                          <span style={{
                            fontSize: '0.55rem',
                            fontWeight: 800,
                            color: badge.color,
                            backgroundColor: badge.bg,
                            border: badge.border,
                            padding: '1px 6px',
                            borderRadius: '4px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                          }}>
                            {badge.text}
                          </span>
                        );
                      })()}
                    </span>
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
                    <span className="thread-stat__val">{thread.likes_count ?? (thread.views_count % 7 + 1)}</span>
                    <span className="thread-stat__lbl">likes</span>
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

        {/* Trending Discussions */}
        <div className="forum-panel glass">
          <h3 className="forum-panel__title">🔥 Trending Discussions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '10px' }}>
            {threads.slice().sort((a,b) => (b.views_count + b.replies_count) - (a.views_count + a.replies_count)).slice(0, 3).map(t => (
              <div key={t.thread_id} style={{ cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '10px' }} onClick={() => handleSelectThread(t.thread_id)}>
                <span style={{ fontSize: '0.65rem', color: 'var(--clr-text-muted)', display: 'block', marginBottom: '2px' }}>{t.category} • {t.views_count} views</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff', display: 'block' }}>{t.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Latest Posts */}
        <div className="forum-panel glass">
          <h3 className="forum-panel__title">✨ Latest Posts</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '10px' }}>
            {threads.slice().sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 3).map(t => (
              <div key={t.thread_id} style={{ cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '10px' }} onClick={() => handleSelectThread(t.thread_id)}>
                <span style={{ fontSize: '0.65rem', color: 'var(--clr-text-muted)', display: 'block', marginBottom: '2px' }}>By {formatAuthor(t.author)} • {new Date(t.created_at).toLocaleDateString()}</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff', display: 'block' }}>{t.title}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
