"use client";

import axios from "axios";
import { io } from "socket.io-client";
import { useEffect, useState } from "react";
import { useAuth } from "../../AuthContext";

type Comment = {
  _id: string;
  name: string;
  comment: string;
  reviewId: string;
  createdAt: string;
};

export default function CommentsSection({ reviewId }: { reviewId: string }) {
  const { user, token } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [comment, setComment] = useState("");

  useEffect(() => {
    const loadComments = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3001/reviews/${reviewId}/comments`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setComments(response.data);
      } catch (error) {
        console.error("Error loading comments", error);
      }
    };
    loadComments();
  }, [reviewId, token]);

  useEffect(() => {
    const socket = io("http://localhost:3001/");
    socket.emit("join-review", reviewId);
    socket.on("new-comment", (data) => {
      setComments((prev) => [...prev, data]);
    });
    return () => {
      socket.emit("leave-review", reviewId);
      socket.disconnect();
    };
  }, [reviewId]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!comment.trim()) return;
    
    const commenterName = user ? user.name : "Anonymous";
    
    try {
      await axios.post(
        `http://localhost:3001/reviews/${reviewId}/comments`,
        { name: commenterName, comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComment("");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="card section-gap">
      <div className="card-header">
        <h2 className="card-title">Comments ({comments.length})</h2>
      </div>

      <div className="stack" style={{ marginBottom: "1.5rem" }}>
        {comments.length === 0 ? (
          <div className="empty-state">No comments yet.</div>
        ) : (
          comments.map((c) => (
            <div key={c._id} className="comment-card">
              <div className="comment-header">
                <span className="comment-author">{c.name}</span>
                <span className="comment-date">
                  {new Date(c.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="comment-body">{c.comment}</p>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label className="input-label">Comment</label>
          <textarea
            className="input"
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Leave a comment..."
            style={{ resize: "none" }}
          />
        </div>

        <button type="submit" className="btn btn-primary btn-sm">
          Post comment
        </button>
      </form>
    </div>
  );
}
