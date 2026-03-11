import { useState } from "react";

const SYSTEM_PROMPT = `You are Tony — a sharp career advisor helping a Product Designer evaluate companies for job applications.

Given a company name, LinkedIn URL, and website URL, analyze and return ONLY a JSON object (no markdown, no explanation) with this exact structure:

{
  "rating": <number 0-10>,
  "tier": <"Tier 1" | "Tier 2" | "Tier 3">,
  "type": <"MNC" | "Large Startup" | "Mid Startup" | "Small Startup" | "Agency">,
  "stability": <"High" | "Medium" | "Low">,
  "designCulture": <"Excellent" | "Good" | "Average" | "Unknown">,
  "salaryRange": <string like "₹8–14 LPA">,
  "location": <primary India location>,
  "verdict": <one punchy sentence — honest, no fluff>,
  "pros": [<3 short pros>],
  "cons": [<2 short cons>],
  "applyPriority": <"Apply First" | "Apply Parallel" | "Reach Shot">
}

Tier logic:
- Tier 1: MNCs, large established companies (Google, Microsoft, Adobe, Razorpay, CRED, Swiggy, Flipkart etc) — rating 8-10
- Tier 2: Mid-size funded startups with proven product (Postman, Chargebee, Groww, Zepto etc) — rating 5-7
- Tier 3: Small startups, early stage, agencies — rating 2-5

Rating logic (for a fresher Product Designer):
- 9-10: Dream company, strong design culture, top pay, high brand value
- 7-8: Great opportunity, good design team, solid pay
- 5-6: Decent, okay design culture, average pay
- 3-4: Small/unknown, low pay, uncertain future
- 1-2: Risky, very early stage or poor reputation

Be honest. Don't sugarcoat. If a company is risky say so.`;

export default function CompanyRater() {
  const [companyName, setCompanyName] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const rateCompany = async () => {
    if (!companyName.trim()) {
      setError("Company name toh daal bhai 😅");
      return;
    }
    setError("");
    setLoading(true);
    setResult(null);

    const prompt = `Analyze this company for a fresher Product Designer job hunt in India:

Company Name: ${companyName}
LinkedIn: ${linkedinUrl || "Not provided"}
Website: ${websiteUrl || "Not provided"}

Rate it and return the JSON.`;

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      const data = await res.json();
      const text = data.content?.[0]?.text || "";
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setResult(parsed);
    } catch (e) {
      setError("Kuch toh gadbad hai. Try again karo.");
    }
    setLoading(false);
  };

  const getRatingColor = (r) => {
    if (r >= 8) return "#22c55e";
    if (r >= 5) return "#f59e0b";
    return "#ef4444";
  };

  const getTierColor = (t) => {
    if (t === "Tier 1") return "#ef4444";
    if (t === "Tier 2") return "#f59e0b";
    return "#22c55e";
  };

  const getStabilityColor = (s) => {
    if (s === "High") return "#22c55e";
    if (s === "Medium") return "#f59e0b";
    return "#ef4444";
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0a0a",
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      padding: "40px 20px",
      color: "#e2e2e2"
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        input { outline: none; }
        input::placeholder { color: #444; }
        .input-field {
          width: 100%;
          background: #111;
          border: 1px solid #222;
          border-radius: 10px;
          padding: 12px 16px;
          color: #e2e2e2;
          font-size: 14px;
          font-family: 'DM Sans', sans-serif;
          transition: border-color 0.2s;
        }
        .input-field:focus { border-color: #f59e0b; }
        .rate-btn {
          width: 100%;
          padding: 14px;
          background: #f59e0b;
          color: #0a0a0a;
          border: none;
          border-radius: 10px;
          font-size: 15px;
          font-weight: 700;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          letter-spacing: 0.5px;
          transition: all 0.2s;
        }
        .rate-btn:hover { background: #fbbf24; transform: translateY(-1px); }
        .rate-btn:disabled { background: #333; color: #666; cursor: not-allowed; transform: none; }
        .tag {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.5px;
          font-family: 'DM Mono', monospace;
        }
        .pro-item { color: #22c55e; font-size: 13px; margin-bottom: 6px; }
        .con-item { color: #ef4444; font-size: 13px; margin-bottom: 6px; }
        .pulse {
          animation: pulse 1.5s ease-in-out infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        .result-card {
          animation: slideUp 0.4s ease;
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Header */}
      <div style={{ maxWidth: 560, margin: "0 auto 32px" }}>
        <div style={{ marginBottom: 4 }}>
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#f59e0b", letterSpacing: 2 }}>TONY.AI</span>
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: "#fff", margin: "0 0 6px", lineHeight: 1.2 }}>
          Company Rater
        </h1>
        <p style={{ color: "#555", fontSize: 14, margin: 0 }}>
          Daal company ka naam — main batata hoon worth it hai ya nahi. 🎯
        </p>
      </div>

      {/* Input Card */}
      <div style={{
        maxWidth: 560,
        margin: "0 auto 24px",
        background: "#111",
        border: "1px solid #1e1e1e",
        borderRadius: 16,
        padding: 24
      }}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, color: "#666", display: "block", marginBottom: 8, fontWeight: 500 }}>
            COMPANY NAME *
          </label>
          <input
            className="input-field"
            placeholder="e.g. Razorpay"
            value={companyName}
            onChange={e => setCompanyName(e.target.value)}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, color: "#666", display: "block", marginBottom: 8, fontWeight: 500 }}>
            LINKEDIN URL
          </label>
          <input
            className="input-field"
            placeholder="https://linkedin.com/company/razorpay"
            value={linkedinUrl}
            onChange={e => setLinkedinUrl(e.target.value)}
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 12, color: "#666", display: "block", marginBottom: 8, fontWeight: 500 }}>
            WEBSITE
          </label>
          <input
            className="input-field"
            placeholder="https://razorpay.com"
            value={websiteUrl}
            onChange={e => setWebsiteUrl(e.target.value)}
          />
        </div>

        {error && (
          <p style={{ color: "#ef4444", fontSize: 13, marginBottom: 12 }}>{error}</p>
        )}

        <button
          className="rate-btn"
          onClick={rateCompany}
          disabled={loading}
        >
          {loading ? "Analyzing... 🔍" : "Rate This Company →"}
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ maxWidth: 560, margin: "0 auto", textAlign: "center", padding: 20 }}>
          <div className="pulse" style={{ color: "#f59e0b", fontSize: 13, fontFamily: "'DM Mono', monospace" }}>
            Tony is researching {companyName}...
          </div>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="result-card" style={{ maxWidth: 560, margin: "0 auto" }}>

          {/* Rating Hero */}
          <div style={{
            background: "#111",
            border: "1px solid #1e1e1e",
            borderRadius: 16,
            padding: 24,
            marginBottom: 16,
            display: "flex",
            alignItems: "center",
            gap: 20
          }}>
            <div style={{ textAlign: "center", minWidth: 80 }}>
              <div style={{
                fontSize: 52,
                fontWeight: 800,
                color: getRatingColor(result.rating),
                lineHeight: 1,
                fontFamily: "'DM Mono', monospace"
              }}>
                {result.rating}
              </div>
              <div style={{ fontSize: 11, color: "#444", marginTop: 4 }}>/10</div>
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#fff", marginBottom: 6 }}>
                {companyName}
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
                <span className="tag" style={{ background: getTierColor(result.tier) + "22", color: getTierColor(result.tier), border: `1px solid ${getTierColor(result.tier)}33` }}>
                  {result.tier}
                </span>
                <span className="tag" style={{ background: "#ffffff11", color: "#aaa", border: "1px solid #333" }}>
                  {result.type}
                </span>
                <span className="tag" style={{ background: getStabilityColor(result.stability) + "22", color: getStabilityColor(result.stability), border: `1px solid ${getStabilityColor(result.stability)}33` }}>
                  {result.stability} Stability
                </span>
              </div>
              <p style={{ color: "#aaa", fontSize: 13, margin: 0, lineHeight: 1.5 }}>
                {result.verdict}
              </p>
            </div>
          </div>

          {/* Stats Row */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 12,
            marginBottom: 16
          }}>
            {[
              { label: "Salary", value: result.salaryRange },
              { label: "Location", value: result.location },
              { label: "Design Culture", value: result.designCulture },
            ].map((item, i) => (
              <div key={i} style={{
                background: "#111",
                border: "1px solid #1e1e1e",
                borderRadius: 12,
                padding: "14px 16px"
              }}>
                <div style={{ fontSize: 10, color: "#555", marginBottom: 4, fontWeight: 600, letterSpacing: 0.5 }}>
                  {item.label.toUpperCase()}
                </div>
                <div style={{ fontSize: 13, color: "#e2e2e2", fontWeight: 600 }}>
                  {item.value}
                </div>
              </div>
            ))}
          </div>

          {/* Pros & Cons */}
          <div style={{
            background: "#111",
            border: "1px solid #1e1e1e",
            borderRadius: 16,
            padding: 20,
            marginBottom: 16,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 20
          }}>
            <div>
              <div style={{ fontSize: 11, color: "#22c55e", fontWeight: 700, marginBottom: 10, letterSpacing: 0.5 }}>
                ✓ PROS
              </div>
              {result.pros.map((p, i) => (
                <div key={i} className="pro-item">→ {p}</div>
              ))}
            </div>
            <div>
              <div style={{ fontSize: 11, color: "#ef4444", fontWeight: 700, marginBottom: 10, letterSpacing: 0.5 }}>
                ✗ CONS
              </div>
              {result.cons.map((c, i) => (
                <div key={i} className="con-item">→ {c}</div>
              ))}
            </div>
          </div>

          {/* Apply Priority */}
          <div style={{
            background: "#f59e0b11",
            border: "1px solid #f59e0b33",
            borderRadius: 12,
            padding: "14px 18px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}>
            <span style={{ fontSize: 12, color: "#888" }}>APPLY PRIORITY</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#f59e0b" }}>
              {result.applyPriority} →
            </span>
          </div>

          {/* Links */}
          {(linkedinUrl || websiteUrl) && (
            <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
              {linkedinUrl && (
                <a href={linkedinUrl} target="_blank" rel="noreferrer" style={{
                  flex: 1, textAlign: "center", padding: "10px",
                  background: "#111", border: "1px solid #1e1e1e",
                  borderRadius: 10, color: "#aaa", fontSize: 12,
                  textDecoration: "none", fontWeight: 500
                }}>
                  LinkedIn →
                </a>
              )}
              {websiteUrl && (
                <a href={websiteUrl} target="_blank" rel="noreferrer" style={{
                  flex: 1, textAlign: "center", padding: "10px",
                  background: "#111", border: "1px solid #1e1e1e",
                  borderRadius: 10, color: "#aaa", fontSize: 12,
                  textDecoration: "none", fontWeight: 500
                }}>
                  Website →
                </a>
              )}
            </div>
          )}

          {/* Rate Another */}
          <button
            onClick={() => { setResult(null); setCompanyName(""); setLinkedinUrl(""); setWebsiteUrl(""); }}
            style={{
              width: "100%", marginTop: 16, padding: "12px",
              background: "transparent", border: "1px solid #222",
              borderRadius: 10, color: "#555", fontSize: 13,
              cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
              transition: "all 0.2s"
            }}
            onMouseEnter={e => e.target.style.borderColor = "#444"}
            onMouseLeave={e => e.target.style.borderColor = "#222"}
          >
            Rate another company
          </button>
        </div>
      )}
    </div>
  );
}
