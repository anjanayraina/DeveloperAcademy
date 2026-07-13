import React from 'react';
import type { ForumThread } from '../../types';

interface ThreadDetailProps {
  thread: ForumThread;
  replyContent: string;
  setReplyContent: (content: string) => void;
  handlePostReply: (e: React.FormEvent) => void;
  onBack: () => void;
  formatAuthor: (author: string) => string;
  getCategoryColor: (cat: string) => string;
}

export const ThreadDetail: React.FC<ThreadDetailProps> = ({
  thread,
  replyContent,
  setReplyContent,
  handlePostReply,
  onBack,
  formatAuthor,
  getCategoryColor,
}) => {
  return (
    <div className="thread-view-container">
      <div className="thread-view-header">
        <button className="btn btn--text back-btn" onClick={onBack}>
          ← Back to Forum
        </button>
      </div>

      <div className="thread-main-card glass">
        <div className="thread-card-header">
          <span
            className="thread-item__badge"
            style={{ backgroundColor: getCategoryColor(thread.category) }}
          >
            {thread.category}
          </span>
          <h1 className="thread-detail-title">{thread.title}</h1>
          <div className="thread-meta-info">
            <span>Posted by <strong>{formatAuthor(thread.author)}</strong></span>
            <span>•</span>
            <span>{new Date(thread.created_at).toLocaleString()}</span>
          </div>
        </div>

        <div className="thread-detail-content">
          {thread.content}
        </div>

        <div className="thread-detail-tags">
          {thread.tags.map(t => (
            <span key={t} className="thread-tag">#{t}</span>
          ))}
        </div>
      </div>

      {/* Comments list */}
      <div className="comments-section">
        <h3 className="comments-title">Replies ({thread.replies_count})</h3>

        <div className="comments-list">
          {thread.comments.map((comment) => (
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
  );
};
