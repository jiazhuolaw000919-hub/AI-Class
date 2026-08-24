// ===========================================
// practice.js
// Practice Module — S4 集成版 (Part 33)
// ===========================================

window.LawAIApp = window.LawAIApp || {};

LawAIApp.PracticeModule = {
    /**
     * 生成 Practice HTML（兼容旧版）
     */
    generateHTML: function(lesson) {
        if (!lesson) {
            return '<p>No practice available.</p>';
        }
        return `
            <div class="section-card">
                <h3>⚡ Practice</h3>
                <div class="practice-box">
                    <p>Use <strong>${lesson.category || lesson.title || 'this lesson'}</strong> to complete a task.</p>
                    <p><em>Example: Apply what you learned to a real-world scenario.</em></p>
                </div>
                <p style="margin-top:0.5rem; font-size:0.8rem; color:var(--text-secondary);">AI feedback will appear here.</p>
            </div>
        `;
    },

    /**
     * ═══ S4: 从 Lesson 获取 Practice 问题 ═══
     */
    getPracticeQuestions: async function(lessonId) {
        var engine = window.LawAIApp?.PracticeEngine;
        if (engine && typeof engine.loadPracticeFromLesson === 'function') {
            return await engine.loadPracticeFromLesson(lessonId);
        }
        return [];
    },

    /**
     * ═══ S4: 开始 Practice 会话 ═══
     */
    startPractice: async function(lessonId, type) {
        var engine = window.LawAIApp?.PracticeEngine;
        if (engine && typeof engine.startS4Practice === 'function') {
            return await engine.startS4Practice(lessonId, type);
        }
        return null;
    },

    /**
     * ═══ S4: 提交答案 ═══
     */
    submitAnswer: function(practice, userAnswer, questionIndex) {
        var engine = window.LawAIApp?.PracticeEngine;
        if (engine && typeof engine.submitS4Answer === 'function') {
            return engine.submitS4Answer(practice, userAnswer, questionIndex);
        }
        return { correct: false, explanation: 'Practice engine not available.' };
    },

    /**
     * ═══ S4: 获取 Practice 状态 ═══
     */
    getStatus: function(practice) {
        var engine = window.LawAIApp?.PracticeEngine;
        if (engine && typeof engine.getS4PracticeStatus === 'function') {
            return engine.getS4PracticeStatus(practice);
        }
        return { exists: false, progress: 0, completed: false };
    },

    /**
     * ═══ S4: 获取诊断信息 ═══
     */
    getDiagnostics: function() {
        var engine = window.LawAIApp?.PracticeEngine;
        if (engine && typeof engine.getPracticeDiagnostics === 'function') {
            return engine.getPracticeDiagnostics();
        }
        return { totalPractices: 0, correctPractices: 0, accuracy: 0 };
    }
};

console.log('✏️ PracticeModule (S4) loaded');
