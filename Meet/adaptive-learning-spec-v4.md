# System Specification: Contextual Vocabulary Enhancement App (v4 - Master Spec)

> **Document compiled from source audio notes**: 
> - "Câu lạc bộ TDTT Rạch Miễu.m4a"
> - "Câu lạc bộ TDTT Rạch Miễu 2.m4a"
> - "Câu lạc bộ TDTT Rạch Miễu 3.m4a"
> - "Highlands Coffee.m4a"
> - "Nguyễn Văn Trỗi.m4a"

---

## 1. Executive Summary & Product Vision

* **Product Name (Working Title)**: Adaptive Language Learning via Contextual Vocabulary Enhancement
* **Core Slogan & Animated Headline**: `"You read to..."` ➔ animated transition to `speak better`, `write better`, `listen better`, `learn better` [5, 6].
* **Core Value Proposition**: A lightweight, non-intimidating micro-learning web app offering short contextual reading passages (~50 words) based on daily life scenarios [1, 4, 10]. Users can dynamically upgrade basic vocabulary (A1–A2) to more natural, native-like expressions (B1–B2) through smooth interactive UI mechanisms (Mouse Wheel Scroll / Click / Tap) without altering the underlying sentence context [2, 7, 10, 18].
* **Core Strategy**: Eliminate learning friction by replacing complex news articles (BBC, News in Levels) and unstructured AI prompting with curated 1-minute daily passages, AI-generated scene illustrations, dual-voice TTS audio with speed controls, and a context-aware personal vocabulary notebook [1, 4, 8, 10, 12].

---

## 2. Target Audience & Problem Statement

### Target Users
* Beginner to Intermediate English Learners (CEFR A1, A2 progressing to B1, B2) [2, 5, 8, 10].
* Focus: Practical, everyday conversational English (lifestyle, coffee shops, cinema, sports, city life, technology) rather than academic/test-prep English (IELTS/TOEFL) [5, 8, 13].
* Demographics: Working professionals, students, and adult learners who lack an immersive English environment and are intimidated by formal speaking/reading platforms [6, 8, 14, 17].

### Key Pain Points Solved
1. **Content & Reading Overwhelm**: News articles (BBC/CNN) and tech blogs contain long paragraphs and overly advanced vocabulary; existing apps show wall-of-text paragraphs that intimidate beginners [1, 8, 9, 10].
2. **AI Prompt Fatigue & Quality Issues**: Learners do not know how to prompt ChatGPT effectively, and raw AI output lacks curated visual engagement, dual audio, and context preservation [4, 5, 8, 20].
3. **Complex UI & Rigid Barrier**: Formal academic apps force users into long placement tests or rigid level locks before allowing them to read [2, 7, 12, 14, 16].
4. **Dropdown & Menu Clutter**: Traditional educational sites use heavy drop-down menus that cover visuals and overload the user with choices [9].

---

## 3. Core Features & UX Workflow

### Feature 1: Minimalist Hero Section & Animated Slogan
* **Animated Headline**: `"You read to..."` with smooth text transitions (`speak better`, `write better`, `listen better`, `learn better`) to inspire reading-driven acquisition [5, 6].
* **Interactive Demo Card**: The homepage Hero section displays **1 single interactive sample passage** (with live scroll/tap vocabulary upgrade) so visitors instantly understand the concept within 3 seconds without navigating away [2, 6, 7].

### Feature 2: Micro-Learning Passages (~50 Words / 1-Minute Read)
* Passages are ~50 words long based on relatable daily scenarios (e.g., meeting friends at Highlands Coffee, sports, weekend movie) [1, 4, 10, 13].
* Badge indicator: Clear `⏱️ 1-min read` tag on each passage card [14].
* Tone & Style: Bright, friendly, relatable, and neutral-modern (neither childish nor dry academic) [5, 7, 14].

### Feature 3: YouTube-Style Category Navigation (No Dropdown Menus)
* **No Dropdown Clutter**: Strictly avoids drop-down menus that overlap image cards or hide UI elements [9].
* **YouTube-Style Category Tabs**: Clean horizontal scrollbar/tabs (`Coffee & Lifestyle`, `School`, `Sports`, `City Life`, `Technology`) with pre-loaded content [1, 9, 13]. Clicking a topic instantly renders lesson cards without page reloads or layout shifts [9].

### Feature 4: Interactive Vocabulary Elevation (Scroll-to-Upgrade / Tap)
* **Initial Sentence (A1/A2 Base)**: Highlighted base phrases (e.g., `go out with` [A1]) [2, 10].
* **Single-Option Focus**: Interacting with a phrase reveals/swaps to **exactly 1 optimal upgraded alternative** (e.g., `hang out with` [B1]) to avoid decision fatigue [2, 10].
* **Highlighter Color Coding (Bút Dạ Quang)**: Uses vibrant, textbook-style highlighter background colors (Highlighter Yellow for A1/A2, Lime Green for B1, Orange/Red for B2) making upgraded expressions pop clearly without eye strain [7, 14, 16].
* **Desktop UX**: Hovering + Mouse Wheel Scroll (or trackpad gesture) smoothly slides the phrase up/down in-line without pop-up overlays covering the text [10].
* **Mobile UX**: Tap/Click toggles phrase levels with smooth inline color and text transitions [4].
* **Density Rule**: Strictly 3 to 4 key target phrases per 50-word passage.

### Feature 5: In-App Voice Recording (Tự Ghi Âm Trực Tiếp)
* **1-Tap Microphone**: Integrated audio recorder allows learners to record themselves reading the passage aloud directly in the app [10].
* **Self-Listening**: Learners can play back their recorded voice to self-evaluate pronunciation without switching to external recording apps [10].

### Feature 6: Audio Controls (Avatar Toggles & Dual-Speed Adjustment)
* **Avatar Toggles**: Minimalist Male/Female avatar icons for instant voice switching (no text-heavy buttons) [1, 8, 10].
* **Speed Adjuster**: 2-speed toggle button (`1.0x Normal` / `0.85x Slow`) allowing learners to listen at their preferred pace [1].

### Feature 7: Toggle Full-Passage Vietnamese Translation
* **Optional Bilingual Toggle**: A subtle switch allowing learners to display/hide a sentence-by-sentence Vietnamese translation underneath the passage [11, 12].
* **Default State**: OFF (100% English environment maintained by default) [11, 12].

### Feature 8: Personal Notebook & Contextual Review Engine
* **1-Click Save & Bookmark**: Users can bookmark entire passages ("My Favorites") or save individual target phrases [8, 10].
* **Auto-Categorization**: Automatically sorts saved items into 3 structured tabs:
  1. *Words* (Single vocabulary terms)
  2. *Collocations* (Natural word pairings)
  3. *Phrases / Idioms* (Multi-word expressions)
* **Contextual Re-entry**: When reviewing saved items, the system generates **new example sentences** containing the saved phrases to reinforce natural application [3, 5, 8].

### Feature 9: Smart AI Reminders & Wellness Break Alert
* **Smart Content Reminders**: AI-driven notifications suggesting new reading passages based on user's favorite topics [11].
* **Wellness Break Alert**: After 30 minutes of continuous reading, displays a friendly human-like reminder (e.g., *"You've been reading for 30 minutes! Take a short break and grab a glass of water 💧"*) [12].

---

## 4. Business Model, Growth & Creator Marketplace Roadmap

1. **Freemium MVP Rollout**:
   * Initial launch with **10 to 30 curated sample passages** free for testing and community feedback [2, 8, 12, 13, 19].
2. **Micro-Subscription Model**:
   * **$1 / month (~25,000 VND)** or **$10 / year** for unlimited access and ~30 new monthly passages (1 lesson/day) [4, 5, 7, 10, 19].
3. **Local Payment Integration**:
   * Ingest **Momo Wallet** and domestic payment gateways alongside international credit cards [7, 12].
4. **Admin CMS Dashboard (Phase 2)**:
   * Web-based admin dashboard allowing internal creators to upload passages, target phrases, AI image prompts, and TTS links without editing code [18, 19].
5. **Creator Marketplace (Phase 3)**:
   * Canva-style marketplace enabling external ESL teachers and creators to publish custom topic packs and monetize through revenue sharing [12, 20].

---

## 5. Technical Architecture & Data Schema for Claude Code

### Sample Passage JSON Schema
```json
{
  "id": "passage_001",
  "topic": "Coffee & Lifestyle",
  "title": "Weekend Coffee Ritual",
  "read_time": "1 min",
  "cefr_base": "A1",
  "base_text": "On weekends, I usually go out with my friends, watch a movie, or have coffee.",
  "vietnamese_translation": "Vào cuối tuần, tôi thường đi chơi với bạn bè, xem phim hoặc uống cà phê.",
  "word_count": 15,
  "image_prompt": "Warm ambient lighting inside a modern coffee shop with friends chatting over coffee, realistic digital art style",
  "phrases": [
    {
      "id": "p1",
      "a1_phrase": "go out with",
      "a1_highlighter_color": "#FEF3C7",
      "upgraded_phrase": "hang out with",
      "target_level": "B1",
      "level_highlighter_color": "#D1FAE5",
      "explanation": "More natural conversational phrasal verb for social gatherings."
    },
    {
      "id": "p2",
      "a1_phrase": "watch a movie",
      "a1_highlighter_color": "#FEF3C7",
      "upgraded_phrase": "enjoy a good film",
      "target_level": "B1",
      "level_highlighter_color": "#D1FAE5",
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

### Key Front-End Components Hierarchy
1. **`AnimatedHeroHeader`**: Renders `"You read to..."` headline with smooth text animation and 1-card interactive demo.
2. **`YouTubeCategoryBar`**: Horizontal category switcher with zero dropdowns and pre-loaded category states.
3. **`PassageCard`**: Lesson card showing thumbnail, title, `⏱️ 1-min read` badge, and favorite bookmark icon.
4. **`InteractivePassage`**: Paragraph component hosting inline `ScrollVocab` elements.
5. **`ScrollVocab`**: Handles wheel/touch events with highlighter color transitions (#FEF3C7 A1/A2, #D1FAE5 B1, #FFEDD5 B2).
6. **`InAppVoiceRecorder`**: Simple 1-tap mic button with audio recording and playback state.
7. **`BilingualToggleSwitch`**: Toggles sentence-by-sentence Vietnamese translation visibility.
8. **`AudioControlPanel`**: Minimalist bar with Male/Female avatars and 1.0x / 0.85x speed toggle.
9. **`WellnessNotificationModal`**: Friendly 30-minute break popup notification.
10. **`NotebookDrawer`**: Categorized tabs (*Words*, *Collocations*, *Phrases*) with 1-click save and contextual sentence generator.
