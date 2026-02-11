# Earnings Call Claim Verifier — Claude Artifact Guide

## Overview

This tool can be run as a **Claude.ai Artifact** — an interactive AI-powered React application that runs directly inside Claude. No installation, no deployment, no API keys required. Just open, interact, and share.

---

## 🚀 How to Create the Artifact

### Step 1: Open Claude.ai

Go to [claude.ai](https://claude.ai) and start a new conversation.

### Step 2: Request the Artifact

Copy and paste this prompt into Claude:

```
Create a React artifact for an Earnings Call Claim Verifier with the following features:

1. **Dashboard View**
   - Display 10 S&P 500 companies (AAPL, NVDA, MSFT, GOOGL, AMZN, META, TSLA, JPM, JNJ, WMT)
   - Show quarterly financial data (Q1-Q4 2025) from SEC EDGAR
   - Interactive cards with company metrics and trends

2. **Company Detail View**
   - Detailed financial metrics for selected company
   - Quarter-over-quarter comparisons
   - Revenue, net income, operating margin, gross margin charts
   - Navigation back to dashboard

3. **Claims Explorer**
   - AI-powered claim extraction from earnings call transcripts
   - Verify claims against SEC EDGAR XBRL data
   - Display verification results with accuracy scores
   - Filter by severity, metric type, and speaker
   - Show discrepancies and flags (optimistic/pessimistic)

4. **About Page**
   - Methodology documentation
   - Data sources explanation
   - Verification algorithm details

Use modern UI with Tailwind CSS, Lucide icons, and a dark theme. Include sample data for all 10 companies across 4 quarters.
```

### Step 3: Claude Creates the Artifact

Claude will generate a complete, interactive React application that runs directly in the chat interface.

---

## 📤 Sharing Your Artifact

### How to Share

1. **Open** the conversation containing the artifact on claude.ai
2. **Click** the Share button (top-right corner of the conversation)
3. **Copy** the generated shareable link
4. **Send** the link to anyone — email, Slack, social media, documentation, etc.

### Who Can Access It

| Viewer Type | Can Access? | Cost |
|------------|-------------|------|
| Free Claude.ai account | ✅ Yes | $0 |
| Pro plan ($20/mo) | ✅ Yes | Included |
| Max plan ($100/mo) | ✅ Yes | Included |
| Team plan | ✅ Yes | Included |
| Enterprise plan | ✅ Yes | Included |
| No account (anonymous) | ❌ No | Must create a free account |

**Bottom line:** Anyone with a free Claude.ai account can view and fully interact with shared artifacts. No paid plan is required.

---

## 🌍 Publishing to the Claude Community

Claude.ai allows users to publish artifacts to the broader community, making them discoverable and remixable by anyone on the platform.

### How to Publish

1. Open the artifact in your conversation
2. Click the **Publish** option on the artifact
3. Your artifact becomes publicly listed and discoverable within Claude.ai

### What Publishing Enables

- 🌍 **Discovery** — Other Claude users can find your artifact
- 🔄 **Remixing** — Anyone can create their own copy and modify it
- 🤝 **Collaboration** — Others can build on your work, extend features, or adapt it for different use cases
- 📈 **Reach** — Your artifact can be used by 10 or 10,000 people at no cost to you

### Who Can Publish

- Users on Free and Pro plans can publish and remix artifacts

### Who Can Remix

- Any Claude.ai user (Free, Pro, Max, Team, Enterprise)
- Remixing creates an independent copy — your original stays untouched
- The remixer can modify, extend, or completely rework the artifact

---

## 💰 AI-Powered Artifacts — How Cost Works

This tool includes AI-powered verification — the Claims Explorer uses Claude's API internally to extract and verify earnings call claims.

### Key Economics

| Scenario | Who Pays | Cost |
|----------|----------|------|
| You use your own artifact | Your plan usage | Included in your plan |
| Someone views your shared artifact | Their plan usage | Included in their plan |
| Someone remixes your artifact | Their plan usage | Included in their plan |
| 100 people use your shared artifact | Each person's own plan | Free to you |

**You are never charged for other people using your shared or published artifacts.** Each viewer's AI usage counts against their own Claude plan limits.

### What This Means

- ✅ You can share this Earnings Verifier with your entire team, class, or community
- ✅ Everyone gets full AI-powered functionality
- ✅ Zero API keys, zero infrastructure, zero hosting costs
- ✅ Claude handles all the scaling

---

## ✨ What Viewers Can Do

### ✅ Full Access (No Restrictions)

- View the interactive dashboard with 10 S&P 500 companies
- Browse quarterly financial data (Q1–Q4 2025) from SEC EDGAR XBRL
- Click into individual company detail views with QoQ comparisons
- Use the Claims Explorer to run AI-powered verification
- Filter, sort, and search verified claims by severity, metric, and speaker
- View the About page with methodology documentation

### ✅ Remix & Modify

- Create their own copy of the artifact
- Modify the code, add companies, change quarters
- Extend with new features
- Publish their remixed version back to the community

### ❌ Cannot Do

- Edit your original artifact (only their remix)

---

## 👥 Sharing Within Teams

### Team & Enterprise Plans

- Share artifacts within **Projects** for team-wide access
- Organization-level artifact management
- Team members can browse work-focused artifacts shared within the org
- Administrators can manage artifact settings at the organization level

### How Teams Can Use This Tool

- **Analysts** — Verify claims before/after earnings calls
- **Portfolio Managers** — Cross-reference executive statements with SEC filings
- **Compliance Teams** — Flag misleading financial communications
- **Students / Educators** — Learn financial analysis and data verification

---

## 📱 Accessing on Mobile

Artifacts work on Claude's **iOS and Android apps**. Viewers can:

- Open shared artifact links on mobile
- Interact with the full dashboard
- Run AI-powered verification
- All the same functionality as desktop

---

## 📊 Quick Reference

| Feature | Supported |
|---------|-----------|
| Share via link | ✅ Yes |
| Free account access | ✅ Yes |
| AI-powered features on free plan | ✅ Yes |
| Publish to community | ✅ Yes (Free & Pro) |
| Remix by others | ✅ Yes (all plans) |
| Mobile access (iOS/Android) | ✅ Yes |
| Team/Enterprise sharing | ✅ Yes (via Projects) |
| No API key needed | ✅ Correct |
| No deployment needed | ✅ Correct |
| Cost to share | **Free** |
| Cost to viewers | **Free** (uses their plan) |
| Public access without any account | ❌ Requires free Claude.ai account |

---

## 🛠️ Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | React (single-file JSX artifact) |
| Data Source | SEC EDGAR XBRL API (preloaded — 10 companies × 4 quarters) |
| AI Engine | Claude Sonnet 4 (claim extraction & verification) |
| Hosting | Claude.ai (zero infrastructure) |
| Companies | AAPL, NVDA, MSFT, GOOGL, AMZN, META, TSLA, JPM, JNJ, WMT |
| Quarters | Q1–Q4 2025 |

---

## ❓ FAQ

### Q: Does the viewer need a paid (Pro) account?

**A:** No. A free Claude.ai account is sufficient to view, interact with, and even remix shared artifacts — including AI-powered ones.

### Q: Does sharing cost me anything?

**A:** No. AI usage in shared artifacts counts against each viewer's own plan limits, not yours. Sharing is free whether 1 person or 10,000 people use it.

### Q: Can someone use it without any Claude account at all?

**A:** No. Viewers must have at least a free Claude.ai account and be signed in. There is no fully anonymous/public access.

### Q: Can viewers modify my artifact?

**A:** Not your original. They can remix it to create their own independent copy and modify that freely.

### Q: Does the AI verification work on the free plan?

**A:** Yes. AI-powered artifacts work on all plans including free. Usage is subject to the plan's rate limits.

### Q: Can I share this within my company's Team plan?

**A:** Yes. Team and Enterprise plans support sharing artifacts within organizational Projects, with admin-level controls.

### Q: Does it work on mobile?

**A:** Yes. Claude artifacts are fully supported on the iOS and Android apps.

---

## 🎯 Use Cases

### Financial Analysts
- Verify executive claims in real-time during earnings calls
- Cross-reference statements with official SEC filings
- Identify discrepancies before making investment decisions

### Compliance Teams
- Flag potentially misleading financial communications
- Audit earnings call transcripts for accuracy
- Generate compliance reports with verification data

### Educators & Students
- Learn financial analysis techniques
- Understand SEC EDGAR data structure
- Practice data verification methodologies

### Journalists
- Fact-check executive statements
- Identify optimistic or pessimistic bias in earnings communications
- Support investigative financial reporting

---

## 🔗 Alternative: Self-Hosted Deployment

If you prefer to run this as a traditional web application instead of a Claude Artifact, see the main [README.md](./README.md) for:

- Local development setup
- Vercel deployment instructions
- API integration (Finnhub + SEC EDGAR)
- SOLID architecture backend

The Claude Artifact version is ideal for quick sharing and collaboration, while the self-hosted version offers full customization and production-grade infrastructure.

---

## 📝 License

MIT License - See [LICENSE](./LICENSE) for details.

---

**Created with Claude.ai** | [Share this artifact](https://claude.ai) | [Learn more about Claude Artifacts](https://support.anthropic.com/en/articles/9487310-what-are-artifacts-and-how-do-i-use-them)
