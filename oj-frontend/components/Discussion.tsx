"use client";
import { useState, useEffect, useCallback } from "react";
import { fetchDiscussion, postComment, updateComment, fetchAuthStatus } from "@/lib/api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Comment = {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    username: string;
    rating: number;
    createdAt: string;
  };
};

export default function Discussion({ questionId }: { questionId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const loadDiscussion = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchDiscussion(questionId);
      setComments(data.comments);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [questionId])
  
  useEffect(() => {
    fetchAuthStatus().then((res) => {
      setIsLoggedIn(!!res);
      if (res) setCurrentUserId(res.id);
    });
    loadDiscussion();
  }, [questionId, loadDiscussion]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !isLoggedIn) return;

    try {
      setIsSubmitting(true);
      await postComment(questionId, newComment);
      setNewComment("");
      await loadDiscussion();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (commentId: string) => {
    if (!editContent.trim()) return;
    try {
      setIsUpdating(true);
      await updateComment(commentId, editContent);
      setEditingCommentId(null);
      setEditContent("");
      await loadDiscussion();
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      {isLoggedIn ? (
        <form onSubmit={handleSubmit} className="mb-8">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Share your approach or ask a question..."
            className="w-full rounded-lg border border-neutral-800 bg-neutral-900/50 p-4 text-sm text-neutral-300 placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 min-h-[120px] resize-y"
            disabled={isSubmitting}
          />
          <div className="mt-3 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting || !newComment.trim()}
              className="rounded bg-emerald-600 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
            >
              {isSubmitting ? "Posting..." : "Post Comment"}
            </button>
          </div>
        </form>
      ) : (
        <div className="rounded-lg border border-neutral-800 bg-neutral-900/50 p-6 text-center mb-8">
          <p className="text-sm text-neutral-400">
            Please log in to participate in the discussion.
          </p>
        </div>
      )}

      {loading ? (
        <div className="flex h-32 items-center justify-center">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-neutral-700 border-t-neutral-300" />
        </div>
      ) : comments.length === 0 ? (
        <div className="rounded-lg border border-neutral-800/50 p-8 text-center text-sm text-neutral-500">
          No discussion yet. Be the first to share your thoughts!
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="rounded-lg border border-neutral-800 bg-neutral-900/30 p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-800 text-xs font-bold text-neutral-300">
                    {comment.user.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-neutral-200">
                        {comment.user.username}
                      </span>
                      <span className="text-[10px] text-neutral-500 bg-neutral-800 px-1.5 py-0.5 rounded">
                        Rating: {comment.user.rating}
                      </span>
                    </div>
                    <span className="text-xs text-neutral-600">
                      {new Date(comment.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
                {currentUserId === comment.user.id && editingCommentId !== comment.id && (
                  <button
                    onClick={() => {
                      setEditingCommentId(comment.id);
                      setEditContent(comment.content);
                    }}
                    className="text-xs font-medium text-neutral-500 hover:text-neutral-300 transition-colors"
                  >
                    Edit
                  </button>
                )}
              </div>
              
              {editingCommentId === comment.id ? (
                <div className="mt-2">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full rounded-lg border border-neutral-800 bg-neutral-900/50 p-3 text-sm text-neutral-300 placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 min-h-[80px] resize-y mb-2"
                    disabled={isUpdating}
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => {
                        setEditingCommentId(null);
                        setEditContent("");
                      }}
                      disabled={isUpdating}
                      className="rounded px-3 py-1.5 text-xs font-medium text-neutral-400 hover:text-neutral-200 transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleUpdate(comment.id)}
                      disabled={isUpdating || !editContent.trim()}
                      className="rounded bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
                    >
                      {isUpdating ? "Saving..." : "Save"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="prose prose-sm prose-invert max-w-none prose-p:text-neutral-300 prose-pre:bg-neutral-950 prose-pre:border prose-pre:border-neutral-800">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{comment.content}</ReactMarkdown>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
