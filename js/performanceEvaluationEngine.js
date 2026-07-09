// ===========================================
// performanceEvaluationEngine.js
// AI 绩效评估与晋升引擎（Phase 68 升级版）
// ===========================================

window.LawAIApp = window.LawAIApp || {};

LawAIApp.PerformanceEvaluationEngine = {
    _initialized: false,

    init: function() {
        if (this._initialized) return;
        this._initialized = true;

        console.log('📊 Performance Evaluation Engine initializing...');

        // 每10节课评估一次
        LawAIApp.EventBus?.on?.('LessonCompleted', function() {
            try {
                var progress = LawAIApp.ProgressEngine?.getProgress?.() || {};
                var completed = progress.completedLessons?.length || 0;
                if (completed % 10 === 0 && completed > 0) {
                    if (LawAIApp.PromotionEngine && typeof LawAIApp.PromotionEngine.evaluatePromotion === 'function') {
                        LawAIApp.PromotionEngine.evaluatePromotion();
                    }
                }
            } catch (e) {}
        });

        // 项目完成时评估
        LawAIApp.EventBus?.on?.('ProjectFinished', function() {
            try {
                if (LawAIApp.PromotionEngine && typeof LawAIApp.PromotionEngine.evaluatePromotion === 'function') {
                    LawAIApp.PromotionEngine.evaluatePromotion();
                }
            } catch (e) {}
        });

        console.log('✅ Performance Evaluation Engine activated.');
    },

    getPerformanceReport: function() {
        var skillReports = [];
        var reliability = 70;
        var consistency = 75;
        var careerStatus = { level: 1, title: 'AI Learner' };

        try {
            var skills = LawAIApp.SkillTracker?.getAllSkills?.() || [];
            for (var i = 0; i < skills.length; i++) {
                var s = skills[i];
                var score = 60;
                if (LawAIApp.SkillScoringSystem && typeof LawAIApp.SkillScoringSystem.calculateSkillScore === 'function') {
                    score = LawAIApp.SkillScoringSystem.calculateSkillScore(s.skillId) || 60;
                }
                skillReports.push({
                    skill: s.title || s.name || 'Skill',
                    score: score
                });
            }
        } catch (e) {}

        try {
            if (LawAIApp.SkillScoringSystem && typeof LawAIApp.SkillScoringSystem.calculateReliabilityScore === 'function') {
                reliability = LawAIApp.SkillScoringSystem.calculateReliabilityScore() || 70;
            }
            if (LawAIApp.SkillScoringSystem && typeof LawAIApp.SkillScoringSystem.calculateConsistencyIndex === 'function') {
                consistency = LawAIApp.SkillScoringSystem.calculateConsistencyIndex() || 75;
            }
        } catch (e) {}

        try {
            if (LawAIApp.CareerProgressionEngine && typeof LawAIApp.CareerProgressionEngine.getCareerStatus === 'function') {
                careerStatus = LawAIApp.CareerProgressionEngine.getCareerStatus() || careerStatus;
            }
        } catch (e) {}

        return {
            skillScores: skillReports,
            reliability: reliability,
            consistency: consistency,
            career: careerStatus,
            timestamp: new Date().toISOString()
        };
    },

    triggerPromotionCheck: async function() {
        try {
            if (LawAIApp.PromotionEngine && typeof LawAIApp.PromotionEngine.evaluatePromotion === 'function') {
                return await LawAIApp.PromotionEngine.evaluatePromotion();
            }
        } catch (e) {}
        return { action: 'maintain', level: 'Current Level', overallScore: 70 };
    },

    getStatus: function() {
        var report = this.getPerformanceReport();
        return {
            initialized: this._initialized,
            skillsTracked: report.skillScores.length,
            reliability: report.reliability,
            consistency: report.consistency,
            careerLevel: report.career?.level || 1
        };
    }
};

// 自动初始化
setTimeout(function() {
    if (LawAIApp.PerformanceEvaluationEngine && typeof LawAIApp.PerformanceEvaluationEngine.init === 'function') {
        LawAIApp.PerformanceEvaluationEngine.init();
    }
}, 700);

console.log('📊 PerformanceEvaluationEngine V2.0 ready');
