// ===========================================
// promotionEngine.js
// 晋升引擎 - 根据绩效自动调整职业级别（Phase 68 升级版）
// ===========================================

window.LawAIApp = window.LawAIApp || {};

LawAIApp.PromotionEngine = {
    levels: [
        'Intern Learner',
        'Junior Practitioner',
        'Skilled Operator',
        'Advanced Specialist',
        'Expert Performer',
        'Elite Master'
    ],

    _currentLevelKey: 'career_level',
    _initialized: false,

    init: function() {
        if (this._initialized) return;
        this._initialized = true;
        console.log('📈 PromotionEngine initialized');
    },

    getCurrentLevel: function() {
        try {
            if (LawAIApp.StorageEngine && typeof LawAIApp.StorageEngine.get === 'function') {
                return LawAIApp.StorageEngine.get(this._currentLevelKey, 0);
            }
        } catch (e) {}
        var val = localStorage.getItem('lawai_' + this._currentLevelKey);
        return val ? parseInt(val) || 0 : 0;
    },

    setLevel: function(index) {
        var clamped = Math.min(this.levels.length - 1, Math.max(0, index));
        try {
            if (LawAIApp.StorageEngine && typeof LawAIApp.StorageEngine.set === 'function') {
                LawAIApp.StorageEngine.set(this._currentLevelKey, clamped);
            }
        } catch (e) {
            localStorage.setItem('lawai_' + this._currentLevelKey, String(clamped));
        }
        return this.levels[clamped];
    },

    evaluatePromotion: async function() {
        console.log('📈 Evaluating promotion...');

        var overallScore = await this._calculateOverallPerformanceScore();
        var currentIndex = this.getCurrentLevel();
        var newIndex = currentIndex;
        var action = 'maintain';
        var message = '';

        if (overallScore >= 85 && currentIndex < this.levels.length - 1) {
            newIndex = currentIndex + 1;
            action = 'promote';
            message = '🎉 Congratulations! You\'ve been promoted to ' + this.levels[newIndex] + '!';
        } else if (overallScore < 40 && currentIndex > 0) {
            newIndex = currentIndex - 1;
            action = 'demote';
            message = '📉 Your performance has declined. You\'ve been moved to ' + this.levels[newIndex] + '.';
        } else if (overallScore < 55 && currentIndex > 0) {
            action = 'retrain';
            message = '📚 Your performance needs improvement. Consider retraining on core concepts.';
        } else {
            message = '✅ You\'re performing well at your current level. Keep it up!';
        }

        var newLevel = this.setLevel(newIndex);

        LawAIApp.EventBus?.emit?.('PromotionEvaluated', {
            oldLevel: this.levels[currentIndex],
            newLevel: newLevel,
            action: action,
            overallScore: overallScore,
            message: message
        });

        console.log('📈 Promotion evaluated:', action, newLevel);
        return { action: action, level: newLevel, overallScore: overallScore, message: message };
    },

    _calculateOverallPerformanceScore: async function() {
        var skillScores = [];
        try {
            var skills = LawAIApp.SkillTracker?._getStore?.() || {};
            var skillIds = Object.keys(skills);
            for (var i = 0; i < skillIds.length; i++) {
                var id = skillIds[i];
                if (LawAIApp.SkillScoringSystem && typeof LawAIApp.SkillScoringSystem.calculateSkillScore === 'function') {
                    skillScores.push(LawAIApp.SkillScoringSystem.calculateSkillScore(id));
                }
            }
        } catch (e) {}

        var avgSkillScore = skillScores.length > 0 ? skillScores.reduce(function(a, b) { return a + b; }, 0) / skillScores.length : 50;

        var reliability = 70;
        var consistency = 75;
        var agentEval = 70;

        try {
            if (LawAIApp.SkillScoringSystem && typeof LawAIApp.SkillScoringSystem.calculateReliabilityScore === 'function') {
                reliability = LawAIApp.SkillScoringSystem.calculateReliabilityScore() || 70;
            }
            if (LawAIApp.SkillScoringSystem && typeof LawAIApp.SkillScoringSystem.calculateConsistencyIndex === 'function') {
                consistency = LawAIApp.SkillScoringSystem.calculateConsistencyIndex() || 75;
            }
            if (LawAIApp.AgentEvaluationCore && typeof LawAIApp.AgentEvaluationCore.evaluateOverallPerformance === 'function') {
                var evalResult = await LawAIApp.AgentEvaluationCore.evaluateOverallPerformance();
                agentEval = evalResult.average || 70;
            }
        } catch (e) {}

        // 最终绩效分
        return Math.round(
            avgSkillScore * 0.3 + reliability * 0.2 + consistency * 0.2 + agentEval * 0.3
        );
    },

    getCareerPath: function() {
        var current = this.getCurrentLevel();
        return {
            currentLevel: this.levels[current],
            currentIndex: current,
            nextLevel: current < this.levels.length - 1 ? this.levels[current + 1] : null,
            maxLevel: this.levels.length - 1,
            progress: this.levels.length > 1 ? Math.round((current / (this.levels.length - 1)) * 100) : 100
        };
    },

    getStatus: function() {
        return {
            initialized: this._initialized,
            careerPath: this.getCareerPath()
        };
    }
};

// 自动初始化
setTimeout(function() {
    if (LawAIApp.PromotionEngine && typeof LawAIApp.PromotionEngine.init === 'function') {
        LawAIApp.PromotionEngine.init();
    }
}, 600);

console.log('📈 PromotionEngine V2.0 ready');
