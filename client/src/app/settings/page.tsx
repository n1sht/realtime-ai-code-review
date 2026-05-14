"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../AuthContext";
import NavBar from "../NavBar";
import Alert from "../Alert";
import { useRouter } from "next/navigation";

type Model = {
  id: string;
  name: string;
};

export default function SettingsPage() {
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();
  const [endpoint, setEndpoint] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("");
  const [models, setModels] = useState<Model[]>([]);
  const [fetchingModels, setFetchingModels] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState<{ type: "error" | "success"; message: string } | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/");
      return;
    }

    axios
      .get("http://localhost:3001/settings", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setEndpoint(res.data.customEndpoint || "");
        setApiKey(res.data.customApiKey || "");
        setModel(res.data.customModel || "");
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [authLoading, user, token, router]);

  const handleFetchModels = async () => {
    if (!endpoint || !apiKey) {
      setAlert({ type: "error", message: "Endpoint and API key are required to fetch models." });
      return;
    }

    setFetchingModels(true);
    setModels([]);
    try {
      const res = await axios.post(
        "http://localhost:3001/settings/fetch-models",
        { endpoint, apiKey },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setModels(res.data.models);
      if (res.data.models.length === 0) {
        setAlert({ type: "error", message: "No models found at this endpoint." });
      }
    } catch (error: any) {
      const msg = error.response?.data?.error || "Failed to fetch models.";
      setAlert({ type: "error", message: msg });
    }
    setFetchingModels(false);
  };

  const handleUpgrade = async () => {
    setSaving(true);
    try {
      await axios.post(
        "http://localhost:3001/settings/upgrade",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAlert({ type: "success", message: "Upgraded to Pro! (Simulation)" });
      setTimeout(() => window.location.reload(), 1500);
    } catch (error: any) {
      const msg = error.response?.data?.error || "Failed to upgrade.";
      setAlert({ type: "error", message: msg });
      setSaving(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put(
        "http://localhost:3001/settings",
        { customEndpoint: endpoint, customApiKey: apiKey, customModel: model },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setAlert({ type: "success", message: "Settings saved." });
    } catch (error: any) {
      const msg = error.response?.data?.error || "Failed to save settings.";
      setAlert({ type: "error", message: msg });
    }
    setSaving(false);
  };

  const handleClear = async () => {
    setSaving(true);
    try {
      await axios.put(
        "http://localhost:3001/settings",
        { customEndpoint: "", customApiKey: "", customModel: "" },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setEndpoint("");
      setApiKey("");
      setModel("");
      setModels([]);
      setAlert({ type: "success", message: "Settings cleared. Using server defaults." });
    } catch {
      setAlert({ type: "error", message: "Failed to clear settings." });
    }
    setSaving(false);
  };

  if (authLoading || loading) {
    return <div className="loader">Loading...</div>;
  }

  return (
    <div className="app-shell">
      <NavBar />
      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      <div className="card section-gap">
        <div className="card-header">
          <div>
            <h1 className="card-title">AI Configuration</h1>
            <p className="card-desc">Use your own OpenAI-compatible endpoint, or leave empty for defaults</p>
          </div>
        </div>

        <div className="input-group">
          <label className="input-label" htmlFor="settings-endpoint">API Endpoint</label>
          <input
            id="settings-endpoint"
            type="text"
            className="input"
            value={endpoint}
            onChange={(e) => setEndpoint(e.target.value)}
            placeholder="https://api.openai.com/v1/chat/completions"
          />
        </div>

        <div className="input-group">
          <label className="input-label" htmlFor="settings-apikey">API Key</label>
          <input
            id="settings-apikey"
            type="password"
            className="input"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-..."
          />
        </div>

        <div className="input-group">
          <label className="input-label" htmlFor="settings-model">Model</label>
          <div className="row">
            <input
              id="settings-model"
              type="text"
              className="input"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="gpt-4o"
              style={{ flex: 1 }}
            />
            <button
              type="button"
              className="btn btn-sm"
              disabled={fetchingModels}
              onClick={handleFetchModels}
              style={{ whiteSpace: "nowrap" }}
            >
              {fetchingModels ? "Fetching..." : "Fetch models"}
            </button>
          </div>
        </div>

        {models.length > 0 && (
          <div className="input-group">
            <label className="input-label">Available models ({models.length})</label>
            <div className="model-list">
              {models.map((m) => (
                <button
                  key={m.id}
                  className={`model-item ${model === m.id ? "selected" : ""}`}
                  onClick={() => setModel(m.id)}
                >
                  {m.id}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="row" style={{ marginTop: "1rem" }}>
          <button
            className="btn btn-primary"
            disabled={saving}
            onClick={handleSave}
          >
            {saving ? "Saving..." : "Save settings"}
          </button>
          <button
            className="btn btn-danger"
            disabled={saving}
            onClick={handleClear}
          >
            Clear all
          </button>
        </div>

        {!user?.isPro && (
          <div className="card" style={{ marginTop: "1.5rem", borderStyle: "dashed" }}>
            <h3 style={{ fontSize: "0.85rem", marginBottom: "0.5rem" }}>Upgrade to Pro</h3>
            <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: "1rem" }}>
              Get unlimited code reviews using our default AI models.
            </p>
            <button
              className="btn btn-primary"
              disabled={saving}
              onClick={handleUpgrade}
            >
              Upgrade for $9/mo (Test)
            </button>
          </div>
        )}
      </div>

      <div className="settings-hint">
        <p className="settings-hint-title">How it works</p>
        <p className="settings-hint-text">
          Your endpoint must be OpenAI-compatible (accepts /v1/chat/completions).
          The &quot;Fetch models&quot; button queries /v1/models on your endpoint.
          If left empty, the server&apos;s default provider is used.
        </p>
      </div>
    </div>
  );
}
