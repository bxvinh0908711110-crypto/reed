# System Specification: Contextual Vocabulary Enhancement App (v3 - Comprehensive)

> **Document compiled from source audio notes**: 
> - "Câu lạc bộ TDTT Rạch Miễu.m4a"
> - "Câu lạc bộ TDTT Rạch Miễu 2.m4a"
> - "Câu lạc bộ TDTT Rạch Miễu 3.m4a"
> - "Highlands Coffee.m4a"

---

## 1. Executive Summary & Product Vision

* **Product Name (Working Title)**: Adaptive Language Learning via Contextual Vocabulary Enhancement
* **Core Value Proposition**: A lightweight, non-intimidating micro-learning web app offering short contextual reading passages (~50 words) based on daily life scenarios [1, 4, 10]. Users can dynamically upgrade basic vocabulary (A1–A2) to more natural, native-like expressions (B1–B2) through smooth interactive UI mechanisms (Mouse Wheel Scroll / Click / Tap) without altering the underlying sentence context [2, 7, 10].
* **Core Strategy**: Eliminate learning friction by replacing complex news articles (BBC, News in Levels) and unstructured AI prompting with curated 1-minute daily passages, AI-generated scene illustrations, dual-voice TTS audio with speed controls, and a context-aware personal vocabulary notebook [1, 4, 8, 10, 12].

---

## 2. Target Audience & Problem Statement

### Target Users
* Beginner to Intermediate English Learners (CEFR A1, A2 progressing to B1, B2) [2, 5, 8, 10].
* Focus: Practical, everyday conversational English (lifestyle, coffee shops, cinema, sports, city life, technology) rather than academic/test-prep English (IELTS/TOEFL) [5, 8, 13].
* Demographics: Working professionals, students, and adult learners who lack an immersive English environment and are intimidated by formal speaking/reading platforms [6, 8, 14].

### Key Pain Points Solved
1. **Content & Reading Overwhelm**: News articles (BBC/CNN) and tech blogs contain long paragraphs and overly advanced vocabulary; existing apps (like News in Levels) show wall-of-text paragraphs that intimidate beginners [1, 8, 9, 10].
2. **AI Prompt Fatigue & Quality Issues**: Learners do not know how to prompt ChatGPT effectively, and raw AI output lacks curated visual engagement, dual audio, and context preservation [4, 5, 8].
3. **Complex UI & Rigid Barrier**: Formal academic apps force users into long placement tests or rigid level locks before allowing them to read [2, 7, 12, 14].

---

## 3. Core Features & UX Workflow

### Feature 1: Micro-Learning Passages (~50 Words / 1-Minute Read)
* Passages are ~50 words long based on relatable daily scenarios (e.g., meeting friends at Highlands Coffee, sports, weekend movie) [1, 4, 10, 13].
* Badge indicator: Clear `⏱️ 1-min read` tag on each passage card [14].
* Tone & Style: Bright, friendly, relatable, and neutral-modern (neither childish nor dry academic) [7, 14].

### Feature 2: Category Navigation via Horizontal Scroll Bar
* **Horizontal Scroll Bar Layout**: Topics are arranged horizontally (e.g., `Coffee & Lifestyle`, `Sports`, `City Life`, `Technology`) to prevent vertical clutter [13].
* **Card Design**: Each topic card features a thumbnail image + concise title + reading time indicator for smooth browsing [13, 14].

### Feature 3: Interactive Vocabulary Elevation (Scroll-to-Upgrade / Tap Mechanism)
* **Initial Sentence (A1/A2 Base)**: Highlighted base phrases (e.g., `go out with` [A1]) [2, 10].
* **Single-Option Focus**: Interacting with a phrase reveals/swaps to **exactly 1 optimal upgraded alternative** (e.g., `hang out with` [B1]) to avoid decision fatigue and cognitive overload [2, 10].
* **4-Level Color-Coding System**: Distinct visual color codes for vocabulary levels (A1, A2, B1, B2) allowing learners to visually track expression upgrades instantly [7].
* **Desktop UX**: Hovering + Mouse Wheel Scroll (or trackpad gesture) smoothly slides the phrase up/down in-line without pop-up overlays covering the text [10].
* **Mobile UX**: Tap/Click toggles phrase levels with smooth inline color and text transitions.
* **Density Rule**: Strictly 3 to 4 key target phrases per 50-word passage.

### Feature 4: Audio Controls (Avatar Toggles & Dual-Speed Adjustment)
* **Avatar Toggles**: Minimalist Male/Female avatar icons for instant voice switching (no text-heavy buttons) [1, 8].
* **Speed Adjuster**: 2-speed toggle button (`1.0x Normal` / `0.85x Slow`) allowing learners to listen at their preferred pace [1].

### Feature 5: AI Visual Context Association
* Each passage includes a custom AI-generated scene illustration (e.g., cozy coffee shop visual) to enhance memory through visual-context pairing [4, 5, 7].

### Feature 6: Personal Notebook & Contextual Review Engine
* **1-Click Save**: Users can bookmark phrases directly from any passage.
* **Auto-Categorization**: Automatically sorts saved items into 3 structured tabs:
  1. *Words* (Single vocabulary terms)
  2. *Collocations* (Natural word pairings)
  3. *Phrases / Idioms* (Multi-word expressions)
* **Contextual Re-entry**: When reviewing saved items in the notebook, the system generates **new example sentences** containing the saved phrases to reinforce natural application [3, 5].

### Feature 7: Study Stats & Engagement Tracking
* Simple daily stats counter: Tracks reading time (e.g., *"You practiced 20 mins today"*) and total accumulated phrases [14].

---

## 4. Business Model & Growth Strategy

1. **Freemium MVP Rollout**:
   * Initial launch with **10 to 30 curated sample passages** free for testing and community feedback [2, 8, 12].
2. **Micro-Subscription Model**:
   * **$1 / month (~25,000 VND)** or **$10 / year** for unlimited access and ~30 new monthly passages (1 lesson/day) [4, 5, 7, 10].
   * Strategic rationale: Extremely low price point eliminates purchasing hesitation compared to formal English centers (~3–4 million VND/month) or expensive apps [7, 10].
3. **Local Payment Integration**:
   * Ingest **Momo Wallet** and domestic payment gateways alongside international credit cards to maximize conversion in Vietnam and Southeast Asia [7, 12].
4. **Future Expansion - Content Marketplace (Phase 3)**:
   * Open platform for ESL teachers and content creators to publish custom lesson packages following this micro-learning concept, earning revenue share/commissions [12].

---

## 5. Technical Architecture & Data Schema for Claude Code

### Sample Passage JSON Schema
```json
{
  "id": "passage_highlands_001",
  "topic": "Coffee & Lifestyle",
  "title": "Weekend Coffee Ritual",
  "read_time": "1 min",
  "cefr_base": "A1",
  "base_text": "On weekends, I usually go out with my friends, watch a movie, or have coffee.",
  "word_count": 15,
  "image_prompt": "Warm ambient lighting inside a modern coffee shop with friends chatting over coffee, realistic digital art style",
  "phrases": [
    {
      "id": "p1",
      "a1_phrase": "go out with",
      "a1_color": "#FEF3C7",
      "upgraded_phrase": "hang out with",
      "target_level": "B1",
      "level_color": "#D1FAE5",
      "explanation": "More natural conversational phrasal verb for social gatherings."
    },
    {
      "id": "p2",
      "a1_phrase": "watch a movie",
      "a1_color": "#FEF3C7",
      "upgraded_phrase": "enjoy a good film",
      "target_level": "B1",
      "level_color": "#D1FAE5",
      "explanation": "Adds expressive depth and native nuance."
    }
  ],
  "audio": {
    "male_avatar_url": "/avatars/male.svg",
    "female_avatar_url": "/avatars/female.svg",
    "tracks": {
      "male": { "normal": "/audio/p001_m_1x.mp3", "slow": "/audio/p001_m_08x.mp3" },
      "female": { "normal": "/audio/p001_f_1x.mp3", "slow": "/audio/p001_f_08x.mp3" }
    }
  }
}
```

### Key Front-End Components to Implement
1. **`HorizontalCategoryBar`**: Horizontal scrollable container rendering topic filters.
2. **`PassageCard`**: Card UI with thumbnail, title, 1-min badge, and A1-B2 level indicators.
3. **`InteractivePassage`**: Renders text with inline `ScrollVocab` components.
4. **`ScrollVocab`**: Handles wheel/touch events to smoothly slide between A1 and B1/B2 phrases with 4-level color coding.
5. **`AudioControlPanel`**: Minimalist bar with Male/Female avatar buttons and 1.0x / 0.85x speed toggle.
6. **`NotebookDrawer`**: Categorized tabs (*Words*, *Collocations*, *Phrases*) with 1-click save and contextual sentence generator.
7. **`StudyStatsWidget`**: Displays daily time spent and saved phrase metrics.
