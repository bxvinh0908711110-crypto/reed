# System Specification: Contextual Vocabulary Enhancement App (for Claude Code)

> Document compiled from source audio notes: "Câu lạc bộ TDTT Rạch Miễu.m4a"

---

## 1. Overview & Product Vision

* **Product Name (Working Title)**: Adaptive Language Learning via Contextual Vocabulary Enhancement
* **Core Value Proposition**: A lightweight, non-intimidating web app offering short contextual reading passages (~50 words) based on daily life scenarios [4, 12]. Users can dynamically upgrade basic vocabulary (A1–A2) to more natural expressions (B1–B2) through interactive hover/pop-up UI mechanisms without changing the underlying context [2, 11, 12, 18].
* **Core Strategy**: Eliminate learning friction by replacing complex news articles and unstructured AI prompting with curated, daily 50-word passages and AI-assisted visual/auditory memory aids [1, 5, 8, 20].

---

## 2. Target Audience & Problem Statement

### Target Users
* Beginner to Intermediate English Learners (CEFR A1, A2 progressing to B1, B2) [8, 14, 15].
* Focus: Practical, everyday conversational English (hanging out, coffee shops, movie weekends) rather than academic/test-prep English (IELTS/TOEFL) [8, 10, 15].

### Key Pain Points Solved
1. **Content Overwhelm**: Mainstream news (BBC/CNN) or tech blogs are too complex for beginners; TikTok/YouTube lack structured reading practice [1, 8].
2. **AI Prompt Fatigue**: Beginners don't know how to prompt ChatGPT effectively to generate level-appropriate, curated material [8, 20].
3. **Complex UI Intimidation**: Formal academic platforms require rigid placement tests and level selections before users can read [16, 17].

---

## 3. Core Features & UX Workflow

### Feature 1: Short Contextual Reading Passages
* Passages are ~50 words long based on everyday scenarios (e.g., meeting friends at a coffee shop, going to the cinema) [4, 10, 12].
* Writing style: Relatable, conversational English accessible to Vietnamese learners [10, 12, 15].

### Feature 2: Interactive Vocabulary Elevation (Hover/Click Pop-up)
* **Initial View**: Displays a basic A1/A2 sentence structure (e.g., `"On weekends, I usually go out with my friends, watch a movie, and have some coffee."`) [10, 12].
* **Interactive Element**: Key terms/phrases are highlighted (e.g., `go out`, `watch a movie`) [2, 12].
* **Hover / Click Trigger**: Triggers a pop-up or roll-over suggesting natural B1/B2 alternative phrases (e.g., `go out` → `hang out with friends`; `watch a movie` → `enjoy a good movie` / `check out a movie`) [2, 4, 12, 18].
* **Context Preservation**: Alternative terms upgrade vocabulary depth without changing the original story context [3, 11, 18].

### Feature 3: AI Visual Context Association
* Each passage features an AI-generated scene illustration (e.g., coffee shop visual) to enhance cognitive retention through mental image association [5, 7].

### Feature 4: Dual-Voice Text-to-Speech (TTS)
* Audio playback toggle supporting both **Male** and **Female** AI voices [8, 12].
* Benefit: Allows learners to listen twice with natural phonetic variety [8, 12].

### Feature 5: Frictionless Navigation & Access
* No mandatory level locking; users get open access to explore passages across levels (A1 to B2) [16, 17].

---

## 4. Future Roadmap / Phase 2 Scope

1. **Interactive Translation Exercises**: Vietnamese-to-English translation prompts with real-time AI feedback and correction [13].
2. **Pronunciation & Speaking Practice**: Microphone button allowing users to read aloud and practice speech output [12, 13].

---

## 5. Technical Requirements & Architecture Hints for Claude Code

### Data Schema (Sample Passage Object)
```json
{
  "id": "passage_001",
  "topic": "Weekend Coffee with Friends",
  "cefr_base": "A1-A2",
  "base_text": "On weekends, I usually go out with my friends. We watch a movie and have some coffee.",
  "word_count": 22,
  "image_prompt": "A warm, cozy coffee shop setting with friends laughing over coffee cups, digital art style",
  "highlights": [
    {
      "original_phrase": "go out",
      "upgraded_phrase": "hang out",
      "level": "B1",
      "explanation": "More natural phrase for social outings with friends"
    },
    {
      "original_phrase": "watch a movie",
      "upgraded_phrase": "enjoy a good movie",
      "level": "B1",
      "explanation": "Adds depth and expressive emotion"
    }
  ],
  "audio": {
    "male_voice_url": "/audio/p001_male.mp3",
    "female_voice_url": "/audio/p001_female.mp3"
  }
}
```

### Key UI Components
1. **PassageViewer Component**: Renders the 50-word paragraph with inline interactive phrase tags.
2. **VocabPopover Component**: Lightweight tooltips triggered on hover/tap showing expression upgrades and usage notes.
3. **AudioPlayer Component**: Switcher between Male and Female voice tracks.
4. **SceneImage Component**: Displays AI-generated contextual artwork.

---

## 6. Business Model & Scale

* **Launch Target**: ~100 curated passages for MVP rollout [19].
* **Pricing Model**: $1/month (~30 new lessons/month, 1–2 passages/day) or $10/year [13, 19].
* **Value Positioning**: Micro-subscription offering ready-made daily practice at a fraction of alternative learning platforms [19, 20].
