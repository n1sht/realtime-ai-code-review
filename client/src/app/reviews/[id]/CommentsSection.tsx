"use client";

import axios from "axios";
import { io } from "socket.io-client";
import { useEffect, useState } from "react";

type Comment = {
  _id: string;
  name: string;
  comment: string;
  reviewId: string;
  createdAt: string;
};

export default function CommentsSection({ reviewId }: { reviewId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");

  useEffect(() => {
    const loadComments = async () => {
      const response = await axios.get(
        `http://localhost:3001/reviews/${reviewId}/comments`,
      );
      setComments(response.data);
    };
    loadComments();
  }, []);

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
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await axios.post(`http://localhost:3001/reviews/${reviewId}/comments`, {
        name,
        comment,
      });
      setName("");
      setComment("");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="nes-container with-title is-dark">
      <p className="title" style={{ fontSize: "8px" }}>
        COMMENTS ({comments.length})
      </p>

      <div
        style={{
          marginBottom: "2rem",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        {comments.length === 0 ? (
          <p style={{ fontSize: "8px", color: "#666" }}>NO COMMENTS YET.</p>
        ) : (
          comments.map((c) => (
            <div
              key={c._id}
              className="nes-container is-rounded is-dark fade-in"
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "0.5rem",
                }}
              >
                <span style={{ fontSize: "8px", color: "#92cc41" }}>
                  {c.name.toUpperCase()}
                </span>
                <span style={{ fontSize: "6px", color: "#666" }}>
                  {new Date(c.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p style={{ fontSize: "8px", margin: 0 }}>{c.comment}</p>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="nes-field" style={{ marginBottom: "1rem" }}>
          <label style={{ fontSize: "8px" }}>NAME</label>
          <input
            type="text"
            className="nes-input is-dark"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="your name"
            style={{ fontSize: "8px" }}
          />
        </div>

        <div className="nes-field" style={{ marginBottom: "1rem" }}>
          <label style={{ fontSize: "8px" }}>COMMENT</label>
          <textarea
            className="nes-textarea is-dark"
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="your comment"
            style={{ fontSize: "8px", resize: "none" }}
          />
        </div>

        <button
          type="submit"
          className="nes-btn is-warning"
          style={{ fontSize: "8px" }}
        >
          POST
        </button>
      </form>
    </div>
  );
}
