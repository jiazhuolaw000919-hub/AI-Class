// content/courses/course-ai/subjects/subject-ai-fundamentals/lessons/lesson-ai-fundamentals-003.js
// AI Fundamentals — Lesson 003

window.LawAIApp = window.LawAIApp || {};
window.LawAIApp.ContentLessons = window.LawAIApp.ContentLessons || {};

window.LawAIApp.ContentLessons['lesson-ai-fundamentals-003'] = {
  "id": "lesson-ai-fundamentals-003",
  "version": "1.0.0",
  "title": "AI in Daily Life",
  "slug": "ai-in-daily-life",
  "subjectId": "subject-ai-fundamentals",
  "moduleId": null,
  "order": 3,
  "estimatedMinutes": 20,
  "difficulty": "foundation",
  "status": "published",
  "description": "Discover the AI systems you already interact with every day—often without realizing it.",
  "learningObjectives": [
    "Identify AI systems in everyday tools",
    "Explain how recommendation systems work at a high level",
    "Recognize AI in search, maps, email, and social media"
  ],
  "sections": [
    {
      "id": "section-01",
      "type": "foundation",
      "title": "AI Is Already Everywhere",
      "content": [
        {
          "type": "text",
          "content": "Most people interact with AI dozens of times per day without realizing it. Every search, every recommendation, every autocorrect is powered by machine learning."
        },
        {
          "type": "example",
          "content": "Google Search: Ranks billions of pages using ML. YouTube: Recommends videos using deep learning. Gmail: Filters spam using classification models."
        }
      ]
    },
    {
      "id": "section-02",
      "type": "core",
      "title": "How Recommendation Systems Work",
      "content": [
        {
          "type": "text",
          "content": "Recommendation systems learn patterns from millions of user interactions: what you click, what you skip, how long you watch. They then predict what you'll engage with next."
        },
        {
          "type": "text",
          "content": "The core idea: if users similar to you liked X, you probably will too. This is called collaborative filtering."
        },
        {
          "type": "example",
          "content": "Netflix, Spotify, TikTok, Amazon — all use variations of this approach, refined by deep learning."
        }
      ]
    },
    {
      "id": "section-03",
      "type": "advanced",
      "title": "The Attention Economy",
      "content": [
        {
          "type": "text",
          "content": "AI systems are not neutral — they optimize for engagement, because engagement drives revenue. This is why feeds feel addictive: they are literally designed to be."
        },
        {
          "type": "text",
          "content": "Understanding this changes how you interact with these systems. You are not just a user — you are a training signal."
        }
      ]
    }
  ],
  "video": {
    "provider": "youtube",
    "url": "https://www.youtube.com/watch?v=2ePf9rue1Ao",
    "title": "How AI Powers Your Daily Apps",
    "durationMinutes": 9
  },
  "flashcards": [
    {
      "id": "fc-301",
      "front": "How do recommendation systems predict what you'll like?",
      "back": "By learning patterns from users with similar behavior — collaborative filtering.",
      "difficulty": "core",
      "tags": ["recommendation"]
    },
    {
      "id": "fc-302",
      "front": "Give three everyday apps that use AI.",
      "back": "Google Search, YouTube, Gmail (also: Netflix, Spotify, Maps, autocorrect).",
      "difficulty": "foundation",
      "tags": ["examples"]
    },
    {
      "id": "fc-303",
      "front": "What do recommendation systems optimize for?",
      "back": "Engagement — clicks, watch time, interaction.",
      "difficulty": "core",
      "tags": ["attention"]
    }
  ],
  "practice": {
    "enabled": true,
    "type": "mixed",
    "items": [
      {
        "id": "practice-301",
        "type": "multipleChoice",
        "question": "What is collaborative filtering?",
        "options": [
          "Filtering spam from emails",
          "Predicting what you'll like based on similar users",
          "Encrypting user data",
          "Sorting files alphabetically"
        ],
        "answer": 1,
        "explanation": "Collaborative filtering predicts your preferences based on the behavior of similar users."
      },
      {
        "id": "practice-302",
        "type": "shortAnswer",
        "question": "Name three apps you use daily that rely on AI.",
        "answer": "Examples: Google Search, YouTube, Gmail, Instagram, Spotify, Netflix, Google Maps, autocorrect on your phone.",
        "explanation": "Almost any app that recommends, ranks, filters, or predicts uses AI."
      }
    ]
  },
  "notes": {
    "summary": "AI is embedded in everyday tools—search, recommendations, email filtering. Recommendation systems learn from user behavior.",
    "keyPoints": [
      "AI is everywhere: search, video, email, maps, social",
      "Recommendation systems use collaborative filtering",
      "They optimize for engagement, not your wellbeing"
    ],
    "importantTerms": [
      { "term": "Collaborative Filtering", "definition": "Predicting preferences based on similar users." },
      { "term": "Recommendation System", "definition": "AI that suggests content based on learned patterns." }
    ]
  },
  "aiTools": [
    {
      "provider": "chatgpt",
      "role": "reasoning",
      "recommendedFor": ["exploring examples", "comparing apps"]
    }
  ],
  "resources": [
    {
      "id": "resource-301",
      "title": "How Recommendation Systems Work",
      "type": "article",
      "url": "https://example.com/recommendation-systems",
      "provider": "official"
    }
  ],
  "news": [],
  "relatedLessons": [
    "lesson-ai-fundamentals-001",
    "lesson-ai-fundamentals-002"
  ],
  "keyTakeaways": [
    "You already interact with AI dozens of times per day.",
    "Recommendation systems learn from patterns in user behavior.",
    "These systems optimize for engagement, not learning or wellbeing."
  ],
  "metadata": {
    "author": "Law AI Academy",
    "language": "en"
  },
  "createdAt": "2026-09-11T00:00:00Z",
  "updatedAt": "2026-09-11T00:00:00Z"
};

console.log('[ContentLesson] lesson-ai-fundamentals-003 loaded');
