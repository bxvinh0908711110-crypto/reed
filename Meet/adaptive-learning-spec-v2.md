# Technical Specification: Adaptive Contextual Vocabulary Enhancement App

> **Document Version**: v2.0 (Updated with insights from *Câu lạc bộ TDTT Rạch Miễu 2.m4a* & *Câu lạc bộ TDTT Rạch Miễu 3.m4a*)  
> **Target Engineering Agent**: Claude Code  
> **Core Objective**: Build a modern, frictionless, micro-learning web application for A1–A2 English learners transitioning to B1–B2 through contextual vocabulary elevation.

---

## 1. Overview & Product Vision

* **Product Concept**: A minimalist web app delivering short (~50 words) daily reading passages based on real-life scenarios (coffee with friends, work routines, weekend hangouts) [1, 4, 13].
* **Core Value Proposition**: Instead of intimidating news articles or unstructured AI prompts, learners read simple A1–A2 English and dynamically upgrade key expressions to natural B1–B2 alternatives directly within the sentence context [2, 6, 8, 13].
* **Design Philosophy**: Extremely simple, fresh, and friendly. Zero cognitive overload, zero complex setup, and no mandatory level tests [8, 10, 13].

---

## 2. Pedagogical Principles & Scope Rules

### 1. Pure English Immersion (No Vietnamese Translation)
* **Rule**: The UI must **NOT** display Vietnamese translations alongside passages [14].
* **Rationale**: Force learners into an English-thinking environment. Avoid turning the app into a "Google Translate" tool [14].

### 2. Strict Constraint on Upgraded Phrases (3–4 per Passage)
* **Rule**: Each ~50-word passage contains at most **3 to 4 target phrases** for elevation [9].
* **Rationale**: Prevents learner overwhelm and maintains high retention [9].

### 3. Single-Option Focused Upgrade (Minimalist Choice)
* **Rule**: When interacting with a highlighted phrase, present **only 1 primary high-quality upgraded phrase** (A1/A2 → B1/B2) by default [6].
* **Rationale**: Giving 2–3 options simultaneously creates decision fatigue for beginners ("không cần ra 2–3 cái, 1 cái thôi để người ta dễ nhớ") [6]. An option to customize/select an alternate phrase remains accessible if desired [2].

### 4. Focused Scope for MVP
* **In-Scope**: Reading short daily passages, interactive vocabulary swapping, personal vocabulary notebook with contextual practice, dual-voice TTS audio [2, 9, 10, 15].
* **Out-of-Scope for MVP**: Complex grammar drills, speaking/pronunciation recording, or academic test-prep (IELTS/TOEFL) [9].

---

## 3. Core UX/UI & Interactive Mechanics

### Desktop vs. Mobile Interaction Matrix

| Platform | Primary Interaction | Behavior |
| :--- | :--- | :--- |
| **Desktop** | **Hover / Mouse Wheel Scroll** [5, 6] | Hovering shows the single upgraded phrase tooltip; scrolling the wheel slides/swaps the phrase in-line with smooth vertical animation [6]. |
| **Mobile** | **Tap / Click to Swap** [7] | Tapping a highlighted phrase directly toggles/swaps it to the upgraded version with a distinct color shift (e.g., Yellow A1 → Green B1/B2) [7]. |

### Visual Design System
* **Theme & Tone**: Fresh, friendly, vibrant, and modern (e.g., bright orange/warm green accents) [3, 8, 10].
* **Anti-Patterns**: Avoid dark/depressing themes, dated 2000s layouts, overly childish visuals, or hyper-complex "hi-tech" clutter [3, 8, 10].

---

## 4. Personal Vocabulary Notebook (Sổ Tay Từ Vựng)

A dedicated personal space for learners to save, organize, and review vocabulary collected while reading [2, 9, 10].

### Key Features
1. **One-Click Save**: Every interactive phrase in a passage features a quick "Save" icon/button [2, 15].
2. **Automatic Categorization**: The system automatically classifies saved items into:
   * **Words** (Single vocabulary items) [9]
   * **Collocations** (Natural word pairings) [9]
   * **Phrases / Idioms** (Multi-word expressions) [9]
3. **Contextual Review Engine**:
   * When reviewing saved vocabulary, the notebook does not just show flashcards or definitions.
   * It dynamically generates **new example sentences** containing the saved phrase so learners practice applying the phrase in fresh contexts [10].

---

## 5. Content & Audio Guidelines

* **Passage Format**: ~50 words covering relatable daily topics (morning routines, coffee dates, cinema outings, casual workplace conversations) [1, 4, 13].
* **Dual-Voice TTS Player**:
  * Toggle between **Male** and **Female** AI voice tracks [15].
  * Adjustable, relaxed audio pace appropriate for A1–A2 learners [15].

---

## 6. Technical System Architecture & Data Schemas (For Claude Code)

### Data Schema 1: Passage Model
```typescript
interface HighlightedPhrase {
  id: string;
  original_phrase: string;  // A1-A2 Level (e.g., "go out with")
  upgraded_phrase: string;  // B1-B2 Level (e.g., "hang out with")
  cefr_level: 'B1' | 'B2';
  type: 'word' | 'collocation' | 'phrase';
  explanation_en: string;   // Pure English explanation
  custom_alternatives?: string[]; // Optional secondary alternatives
}

interface Passage {
  id: string;
  title: string;
  topic_category: 'daily_life' | 'work' | 'social' | 'entertainment';
  cefr_base: 'A1' | 'A2';
  base_text: string;        // ~50 words
  word_count: number;
  image_prompt: string;     // AI illustration prompt
  highlights: HighlightedPhrase[]; // Max 3-4 items
  audio: {
    male_voice_url: string;
    female_voice_url: string;
    speech_rate: number;    // e.g., 0.85
  };
}
```

### Data Schema 2: User Vocabulary Notebook Model
```typescript
interface SavedVocabItem {
  id: string;
  user_id: string;
  phrase: string;
  original_context_passage_id: string;
  category: 'word' | 'collocation' | 'phrase';
  saved_at: string;
  review_count: number;
  practice_sentences: string[]; // Dynamically generated practice examples
}
```

### Key React Components
1. **`PassageReader`**: Renders paragraph with embedded interactive phrase tags (Max 3-4).
2. **`VocabSlotWheel`**: Handles mouse wheel scroll on desktop and tap on mobile for in-line word swapping.
3. **`AudioControlPanel`**: Switcher for Male/Female voices and speed adjustment.
4. **`VocabNotebook`**: Filterable list by category (Word/Collocation/Phrase) with contextual sentence practice views.

---

## 7. Business Model & Payment Integration

* **Subscription Pricing**: $1/month or $10/year (encouraging annual subscription) [11, 12].
* **Local Payment Gateways**: Support local Vietnamese payment methods (**Momo e-wallet**, local cards) alongside standard credit card options to reduce payment friction [10, 11].
* **Content Scaling Plan**: Launch MVP with ~100 core passages, scaling to 1000+ daily passages over time [12, 16].

---

## 8. Implementation Checklist for Claude Code

- [ ] **Setup Project**: Next.js / React + Tailwind CSS with a fresh, friendly color palette.
- [ ] **Build `PassageReader` Component**: Render ~50-word passages with exactly 3–4 interactive phrase slots.
- [ ] **Implement Interaction Logic**:
  - Desktop: Mouse wheel scroll / hover slide animation for single-option upgrade.
  - Mobile: Clean tap-to-swap trigger.
- [ ] **Build `AudioControlPanel`**: Dual-voice (Male/Female) TTS player with speed control.
- [ ] **Build `VocabNotebook`**:
  - Save button on highlighted phrases.
  - Auto-categorization (Words, Collocations, Phrases).
  - Practice view displaying new contextual example sentences.
- [ ] **Ensure Pure English UI**: Verify no Vietnamese translation strings in passage view.
