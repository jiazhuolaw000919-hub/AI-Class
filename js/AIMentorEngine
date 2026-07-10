// ================================================================
// ENGINE: AIMentorEngine
// LAYER: AI Layer
// DOMAIN: AI Mentorship & Learning Support
// RECOVERY STATUS: 🟢 Canon Locked
// VERSION: 1.0.0
// ================================================================
//
// PURPOSE
// ================================================================
//   Provides AI-powered mentorship and learning support.
//   Acts as Teacher, Mentor, Coach, Reviewer, Companion, and Navigator.
//   Helps learners think, understand, practice, and grow.
//   Creates independent learners, not dependent users.
//
// PUBLIC API
// ================================================================
//   getMentorMessage(context, type)     -> string
//   explainConcept(concept, level)      -> string
//   getEncouragement(progress)          -> string
//   askReflectionQuestion(lessonId)     -> string
//   reviewAnswer(question, answer)      -> object
//   suggestNextAction(lessonId)         -> string
//   getPersonalizedGreeting()           -> string
//   getStatus()                         -> Status object
//
// AI ROLES
// ================================================================
//   - Teacher   : Explains concepts clearly
//   - Mentor    : Provides guidance and wisdom
//   - Coach     : Encourages improvement
//   - Reviewer  : Evaluates understanding
//   - Companion : Maintains engagement
//   - Navigator : Suggests learning paths
//
// DEPENDENCIES
// ================================================================
//   - ProgressEngine (optional) : For progress data
//   - LessonEngine (optional)   : For lesson data
//   - MemoryEngine (optional)   : For memory data
//
// STORAGE
// ================================================================
//   - None (stateless engine)
//   - All AI responses are generated on-demand
//
// EVENTS
// ================================================================
//   - None (passive engine)
//
// FUTURE COMPATIBILITY
// ================================================================
//   - Can integrate with external AI APIs
//   - Can support voice interaction
//   - Can learn from learner feedback
//   - Can personalize responses over time
//
// ================================================================

window.LawAIApp = window.LawAIApp || {};

LawAIApp.AIMentorEngine = {
    // ============================================================
    // ENGINE METADATA
    // ============================================================
    _engineName: 'AIMentorEngine',
    _engineVersion: '1.0.0',
    _recoveryStatus: '🟢 Canon Locked',
    _layer: 'AI Layer',
    _domain: 'AI Mentorship & Learning Support',

    // ============================================================
    // MENTOR PERSONALITIES
    // ============================================================
    _personalities: {
        teacher: {
            name: 'Teacher',
            emoji: '👨‍🏫',
            style: 'Clear, structured, patient',
            tone: 'Educational and supportive'
        },
        mentor: {
            name: 'Mentor',
            emoji: '🧠',
            style: 'Wise, encouraging, reflective',
            tone: 'Guiding and inspiring'
        },
        coach: {
            name: 'Coach',
            emoji: '💪',
            style: 'Motivating, energetic, focused',
            tone: 'Encouraging and challenging'
        },
        companion: {
            name: 'Companion',
            emoji: '🤝',
            style: 'Friendly, warm, approachable',
            tone: 'Supportive and engaging'
        }
    },

    // ============================================================
    // PUBLIC API
    // ============================================================

    /**
     * getMentorMessage(context, type)
     * 
     * Gets a personalized mentor message based on context.
     * 
     * @param {Object} context - Learning context
     * @param {string} type - Message type: 'greeting' | 'encouragement' | 'guidance' | 'challenge'
     * @returns {string} Personalized mentor message
     */
    getMentorMessage: function(context, type) {
        context = context || {};
        type = type || 'greeting';

        var progress = context.progress || {};
        var lessonId = context.lessonId || null;
        var completedCount = progress.completedLessons?.length || 0;
        var streak = progress.streak || 0;
        var level = progress.level || 1;

        var messages = {
            greeting: this._getGreeting(completedCount, streak),
            encouragement: this._getEncouragement(completedCount, streak, level),
            guidance: this._getGuidance(lessonId, completedCount),
            challenge: this._getChallenge(completedCount, level)
        };

        return messages[type] || messages.greeting;
    },

    /**
     * explainConcept(concept, level)
     * 
     * Explains a concept at the appropriate level.
     * 
     * @param {string} concept - Concept to explain
     * @param {string} level - 'beginner' | 'intermediate' | 'advanced'
     * @returns {string} Explanation of the concept
     */
    explainConcept: function(concept, level) {
        level = level || 'beginner';
        var explanations = this._getConceptExplanations();
        var explanation = explanations[concept] || 'I\'ll help you understand ' + concept + '.';

        if (level === 'beginner') {
            return this._simplify(explanation);
        } else if (level === 'advanced') {
            return this._deepen(explanation);
        }
        return explanation;
    },

    /**
     * getEncouragement(progress)
     * 
     * Gets encouragement based on progress.
     * 
     * @param {Object} progress - Progress object
     * @returns {string} Encouragement message
     */
    getEncouragement: function(progress) {
        progress = progress || {};
        var completed = progress.completedLessons?.length || 0;
        var streak = progress.streak || 0;
        var level = progress.level || 1;

        if (completed >= 365) {
            return '🏆 You have completed all 365 lessons! You are a true AI master!';
        }
        if (streak >= 30) {
            return '🔥 ' + streak + ' days! You are unstoppable! Keep going!';
        }
        if (streak >= 7) {
            return '💪 ' + streak + ' days streak! You\'re building an incredible habit!';
        }
        if (completed >= 10) {
            return '🌟 You\'ve completed ' + completed + ' lessons! Every step counts!';
        }
        if (completed > 0) {
            return '🌱 You\'re on your way! Every lesson brings you closer to mastery.';
        }
        return '🚀 Welcome! Your first lesson is the beginning of an amazing journey!';
    },

    /**
     * askReflectionQuestion(lessonId)
     * 
     * Gets a reflection question for a lesson.
     * 
     * @param {string} lessonId - Lesson identifier
     * @returns {string} Reflection question
     */
    askReflectionQuestion: function(lessonId) {
        var questions = [
            'What is the most important idea from this lesson?',
            'How does this concept connect to something you already know?',
            'What questions do you still have about this topic?',
            'How could you apply this idea in your daily life?',
            'What surprised you most about this lesson?',
            'What would you explain to someone else about this topic?'
        ];
        var index = Math.floor(Math.random() * questions.length);
        return '💭 ' + questions[index];
    },

    /**
     * reviewAnswer(question, answer)
     * 
     * Reviews a learner's answer and provides feedback.
     * 
     * @param {string} question - The question asked
     * @param {string} answer - The learner's answer
     * @returns {Object} Review result with feedback
     */
    reviewAnswer: function(question, answer) {
        if (!answer || answer.length < 3) {
            return {
                feedback: '🤔 Try writing a bit more. I want to understand your thinking.',
                score: 0.3,
                suggestion: 'Think about the key concepts and write what you remember.'
            };
        }

        var words = answer.split(/\s+/).length;
        var hasKeyConcepts = this._containsKeyConcepts(answer);

        if (words >= 20 && hasKeyConcepts) {
            return {
                feedback: '🌟 Excellent! You\'ve demonstrated a strong understanding of the topic!',
                score: 0.9,
                suggestion: 'Try applying this concept to a new situation.'
            };
        } else if (words >= 10) {
            return {
                feedback: '📝 Good effort! You\'re on the right track. Could you add more detail?',
                score: 0.6,
                suggestion: 'Consider including an example to illustrate your point.'
            };
        } else {
            return {
                feedback: '🌱 Keep going! Every answer helps you learn. Try to expand your thinking.',
                score: 0.4,
                suggestion: 'Review the lesson again and think about the main ideas.'
            };
        }
    },

    /**
     * suggestNextAction(lessonId)
     * 
     * Suggests the next learning action.
     * 
     * @param {string} lessonId - Current lesson identifier
     * @returns {string} Suggestion for next action
     */
    suggestNextAction: function(lessonId) {
        var day = parseInt(lessonId.replace('day-', ''));
        if (isNaN(day)) day = 1;

        // Get memory strength if available
        var memoryStrength = null;
        try {
            if (LawAIApp.MemoryEngine && typeof LawAIApp.MemoryEngine.getMemoryStrength === 'function') {
                memoryStrength = LawAIApp.MemoryEngine.getMemoryStrength(lessonId);
            }
        } catch (e) {}

        var suggestions = [
            '📖 Complete the lesson and reflect on what you learned.',
            '✏️ Try the practice exercise to reinforce your understanding.',
            '💭 Write a reflection about what you learned today.',
            '🔁 Review a previous lesson to strengthen your memory.',
            '🚀 Move to the next lesson to continue your journey.'
        ];

        if (memoryStrength !== null && memoryStrength < 50) {
            return '🔄 Your memory strength is ' + Math.round(memoryStrength) + '%. Time to review this lesson!';
        }

        if (day < 30) {
            return '🌟 You\'re in the Foundation stage. Focus on understanding the basics.';
        } else if (day < 70) {
            return '📚 You\'re in the Prompt Engineering stage. Practice writing prompts!';
        } else if (day < 120) {
            return '🛠️ You\'re in the AI Tools stage. Try using different AI tools.';
        } else if (day < 220) {
            return '💻 You\'re in the AI Development stage. Build something!';
        } else {
            return '🚀 You\'re in the Projects stage. Apply your skills to real projects!';
        }
    },

    /**
     * getPersonalizedGreeting()
     * 
     * Gets a personalized greeting based on time of day and learner progress.
     * 
     * @returns {string} Personalized greeting
     */
    getPersonalizedGreeting: function() {
        var hour = new Date().getHours();
        var timeGreeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

        // Get progress if available
        var progress = null;
        try {
            if (LawAIApp.ProgressEngine && typeof LawAIApp.ProgressEngine.getState === 'function') {
                progress = LawAIApp.ProgressEngine.getState();
            }
        } catch (e) {}

        var name = 'Learner';
        if (progress) {
            var completed = progress.completedLessons?.length || 0;
            if (completed > 0) {
                return timeGreeting + ', ' + name + '! You\'ve completed ' + completed + ' lessons. ' + 
                       'Ready to learn something new today?';
            }
        }

        return timeGreeting + ', ' + name + '! Ready to begin your AI journey?';
    },

    // ============================================================
    // ENGINE STATUS
    // ============================================================
    getStatus: function() {
        return {
            name: this._engineName,
            version: this._engineVersion,
            recoveryStatus: this._recoveryStatus,
            layer: this._layer,
            domain: this._domain,
            personalities: Object.keys(this._personalities),
            progressAvailable: !!(LawAIApp.ProgressEngine && typeof LawAIApp.ProgressEngine.getState === 'function'),
            memoryAvailable: !!(LawAIApp.MemoryEngine && typeof LawAIApp.MemoryEngine.getMemoryStrength === 'function'),
            lessonAvailable: !!(LawAIApp.LessonEngine && typeof LawAIApp.LessonEngine.getLessonByDay === 'function')
        };
    },

    // ============================================================
    // PRIVATE IMPLEMENTATION
    // ============================================================

    _getGreeting: function(completed, streak) {
        var greetings = [
            '🌱 Welcome to your AI learning journey!',
            '📚 Ready to expand your knowledge today?',
            '🚀 Let\'s build your AI skills together!',
            '💡 What will you discover today?',
            '🌟 Every lesson brings you closer to mastery!'
        ];

        if (completed > 0 && streak > 0) {
            return '🔥 ' + streak + '-day streak! You\'re on fire! Let\'s keep learning!';
        }
        if (completed > 0) {
            return '📖 You\'ve completed ' + completed + ' lessons. What\'s next?';
        }
        return greetings[Math.floor(Math.random() * greetings.length)];
    },

    _getEncouragement: function(completed, streak, level) {
        if (completed >= 365) {
            return '🏆 AMAZING! You\'ve completed all 365 lessons. You\'re an inspiration!';
        }
        if (streak >= 30) {
            return '🔥 ' + streak + ' days of learning! You\'re building a powerful habit!';
        }
        if (streak >= 7) {
            return '💪 ' + streak + ' days! Consistency is the key to mastery!';
        }
        if (completed >= 50) {
            return '🌟 You\'ve completed ' + completed + ' lessons! Level ' + level + '! Incredible progress!';
        }
        if (completed >= 10) {
            return '📈 ' + completed + ' lessons done! You\'re building real momentum!';
        }
        if (completed > 0) {
            return '🌱 You\'re on your way! Keep showing up every day!';
        }
        return '🚀 Your learning journey starts now! Take that first step!';
    },

    _getGuidance: function(lessonId, completed) {
        if (!lessonId) {
            return '📚 Start with the lesson that interests you most.';
        }
        var day = parseInt(lessonId.replace('day-', ''));
        if (isNaN(day)) day = 1;

        if (day <= 10) {
            return '🏛️ Focus on understanding the core concepts. Don\'t worry about being perfect.';
        } else if (day <= 30) {
            return '🌱 Keep building your foundation. Review previous lessons if needed.';
        } else if (day <= 70) {
            return '✍️ Try writing prompts and experimenting with different approaches.';
        } else if (day <= 120) {
            return '🛠️ Explore different AI tools and find what works best for you.';
        } else {
            return '💻 Apply your knowledge to real projects. Build something!';
        }
    },

    _getChallenge: function(completed, level) {
        if (completed >= 50) {
            return '🏆 Challenge: Can you explain AI to someone who has never heard of it?';
        }
        if (completed >= 20) {
            return '💪 Challenge: Build a simple AI project using what you\'ve learned!';
        }
        if (completed >= 5) {
            return '🧠 Challenge: Try to identify AI in your daily life. Where do you see it?';
        }
        return '🌟 Challenge: Complete your first lesson today!';
    },

    _getConceptExplanations: function() {
        return {
            'AI': 'Artificial Intelligence is the field of computer science that creates systems capable of performing tasks that normally require human intelligence.',
            'Machine Learning': 'Machine Learning is a subset of AI where systems learn from data instead of being explicitly programmed.',
            'Neural Network': 'A Neural Network is a computing system inspired by the brain that can learn patterns from data.',
            'Deep Learning': 'Deep Learning uses multiple layers of neural networks to learn complex patterns from data.',
            'Natural Language Processing': 'NLP is the field of AI that helps computers understand, interpret, and generate human language.',
            'Computer Vision': 'Computer Vision is the field of AI that enables computers to interpret and understand visual information.',
            'Reinforcement Learning': 'Reinforcement Learning is a type of machine learning where an agent learns by taking actions and receiving rewards or penalties.'
        };
    },

    _simplify: function(explanation) {
        // Simple simplification for beginner level
        return explanation.replace('computing system', 'system').replace('explicitly programmed', 'programmed');
    },

    _deepen: function(explanation) {
        // Add depth for advanced level
        return explanation + ' Consider the underlying mathematical principles and practical applications in industry.';
    },

    _containsKeyConcepts: function(answer) {
        var concepts = ['AI', 'machine', 'learning', 'data', 'neural', 'network', 'algorithm', 'model', 'train', 'predict'];
        var lower = answer.toLowerCase();
        for (var i = 0; i < concepts.length; i++) {
            if (lower.indexOf(concepts[i]) !== -1) {
                return true;
            }
        }
        return false;
    }
};

console.log('🧠 AIMentorEngine V1.0 ready');
