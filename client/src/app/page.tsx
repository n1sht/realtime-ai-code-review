"use client";

import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function Home() {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("java");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!code) {
      alert("Code field is required.");
      return;
    }
    try {
      setLoading(true);
      const response = await axios.post("http://localhost:3001/reviews", {
        code,
        language,
      });
      router.push(`/reviews/${response.data._id}`);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  return (
    <main style={{ maxWidth: "860px", margin: "0 auto" }}>
      <div
        className="nes-container with-title is-dark"
        style={{ marginBottom: "2rem" }}
      >
        <p className="title" style={{ fontSize: "10px" }}>
          CODE REVIEW AI
        </p>
        <p
          style={{ fontSize: "8px", color: "#92cc41", marginBottom: "1.5rem" }}
        >
          PASTE YOUR CODE. GET AN AI REVIEW.<span className="blink">_</span>
        </p>

        <form onSubmit={handleSubmit}>
          <div className="nes-field" style={{ marginBottom: "1.5rem" }}>
            <label htmlFor="language" style={{ fontSize: "8px" }}>
              LANGUAGE
            </label>
            <div className="nes-select is-dark">
              <select
                id="language"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                style={{ fontSize: "8px" }}
              >
                <option value="java">JAVA</option>
                <option value="javascript">JAVASCRIPT</option>
                <option value="python">PYTHON</option>
              </select>
            </div>
          </div>

          <div className="nes-field" style={{ marginBottom: "1.5rem" }}>
            <label htmlFor="code" style={{ fontSize: "8px" }}>
              CODE
            </label>
            <textarea
              id="code"
              className="nes-textarea is-dark"
              rows={14}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="// paste your code here"
              style={{
                fontSize: "10px",
                fontFamily: "monospace",
                resize: "none",
              }}
            />
          </div>

          <button
            type="submit"
            className={`nes-btn is-success ${loading ? "is-disabled" : ""}`}
            disabled={loading}
            style={{ fontSize: "8px" }}
          >
            {loading ? "ANALYZING..." : "SUBMIT FOR REVIEW"}
          </button>
        </form>
      </div>
    </main>
  );
}
