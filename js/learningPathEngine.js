// ===========================================
// learningPathEngine.js
// 学习路径引擎 - 个性化学习路径（Phase 25 完善版）
// ===========================================

window.LawAIApp = window.LawAIApp || {};

LawAIApp.LearningPathEngine = {
    _initialized: false,

    init: function() {
        if (this._initialized) return;
        this._initialized = true;

        // 如果没有路径，生成默认
        try {
            var existing = LawAIApp.StorageEngine?.get?.('current_path');
            if (!existing) {
                this.generateDefaultPath();
            }
        } catch (e) {
            this.generateDefaultPath();
        }

        console.log('🗺️ LearningPathEngine initialized');
    },

    // ===========================================
    // 路径管理
    // ===========================================
    getCurrentPath: function() {
        try {
            return LawAIApp.StorageEngine?.get?.('current_path') || null;
        } catch (e) {
            return null;
        }
    },

    generateDefaultPath: function(academyId) {
        academyId = academyId || 'academy_ai';
        var path = {
            id: 'path_' + Date.now(),
            academyId: academyId,
            name: 'AI Learning Path',
            description: 'Master AI from foundation to expert',
            requiredLessons: [],
            optionalLessons: [],
            milestones: [
                { at: 10, label: 'Foundation Complete' },
                { at: 30, label: 'Prompt Engineering Master' },
                { at: 70, label: 'AI Tools Expert' },
                { at: 120, label: 'AI Developer' },
                { at: 220, label: 'Project Builder' },
                { at: 300, label: 'AI Business Strategist' },
                { at: 365, label: 'AI Master' }
            ],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        // 生成必修课（前 30 课为必修）
        for (var i = 1; i <= 30; i++) {
            path.requiredLessons.push('day-' + i);
        }

        // 选修课（31-365）
        for (var j = 31; j <= 365; j++) {
            path.optionalLessons.push('day-' + j);
        }

        try {
            LawAIApp.StorageEngine?.set?.('current_path', path);
        } catch (e) {}

        LawAIApp.EventBus?.emit?.('PathGenerated', { path: path });
        return path;
    },

    generateNewPath: function(academyId) {
        return this.generateDefaultPath(academyId);
    },

    getCareerRecommendation: function() {
        var progress = LawAIApp.ProgressEngine?.getProgress?.() || {};
        var completed = progress.completedLessons || [];
        var total = progress.totalLessons || 365;
        var pct = total > 0 ? (completed.length / total) * 100 : 0;

        var roles = [
            { name: 'AI Enthusiast', minProgress: 0, icon: '🌱' },
            { name: 'AI Practitioner', minProgress: 15, icon: '📘' },
            { name: 'AI Specialist', minProgress: 35, icon: '📚' },
            { name: 'AI Expert', minProgress: 55, icon: '🧠' },
            { name: 'AI Master', minProgress: 75, icon: '🏆' },
            { name: 'AI Architect', minProgress: 90, icon: '👑' }
        ];

        var current = roles[0];
        for (var i = roles.length - 1; i >= 0; i--) {
            if (pct >= roles[i].minProgress) {
                current = roles[i];
                break;
            }
        }

        return {
            currentRole: current,
            progress: Math.round(pct),
            nextRole: roles[roles.indexOf(current) + 1] || null
        };
    },

    getJourneySummary: function() {
        var progress = LawAIApp.ProgressEngine?.getProgress?.() || {};
        var path = this.getCurrentPath();
        var completed = progress.completedLessons || [];
        var total = progress
