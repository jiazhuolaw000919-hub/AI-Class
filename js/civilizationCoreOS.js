// ===========================================
// civilizationCoreOS.js
// 文明核心操作系统：统一启动入口，初始化所有子系统（Phase 71 升级版）
// ===========================================

window.LawAIApp = window.LawAIApp || {};

LawAIApp.CivilizationCoreOS = {
    _initialized: false,
    _booted: false,

    subsystems: [
        'LearningGraphEngine',
        'CurriculumFactoryEngine',
        'UniversityDeploymentEngine',
        'GlobalEducationNetworkEngine',
        'EducationGovernanceAuthority',
        'CivilizationIdentityCore',
        'CivilizationMotivationCore',
        'AIConsciousnessLayer',
        'PerformanceEvaluationEngine',
        'SelfImprovementEngine'
    ],

    init: function() {
        if (this._initialized) return;
        this._initialized = true;
        console.log('[CivOS] Core OS initialized');
        return this;
    },

    checkSubsystems: function() {
        var missing = [];
        for (var i = 0; i < this.subsystems.length; i++) {
            var name = this.subsystems[i];
            if (!LawAIApp[name]) {
                missing.push(name);
            }
        }
        if (missing.length > 0) {
            console.warn('[CivOS] Missing subsystems:', missing);
            return false;
        }
        console.log('[CivOS] All subsystems verified.');
        return true;
    },

    boot: function() {
        if (this._booted) return true;
        console.log('[CivOS] Booting AI Education Civilization...');

        if (!this.checkSubsystems()) {
            console.warn('[CivOS] Boot aborted due to missing subsystems.');
            return false;
        }

        try {
            // 1. 确保治理层已启动
            if (LawAIApp.EducationGovernanceAuthority && typeof LawAIApp.EducationGovernanceAuthority.init === 'function') {
                var aegaInit = LawAIApp.StorageEngine?.get?.('aega_initialized');
                if (!aegaInit) {
                    LawAIApp.EducationGovernanceAuthority.init();
                    LawAIApp.StorageEngine?.set?.('aega_initialized', true);
                }
            }

            // 2. 激活意识层
            if (LawAIApp.AIConsciousnessLayer && typeof LawAIApp.AIConsciousnessLayer.init === 'function') {
                var consciousActive = LawAIApp.StorageEngine?.get?.('consciousness_active');
                if (!consciousActive) {
                    LawAIApp.AIConsciousnessLayer.init();
                    LawAIApp.StorageEngine?.set?.('consciousness_active', true);
                }
            }

            // 3. 启动进化驱动引擎
            if (LawAIApp.EvolutionDriveEngine && typeof LawAIApp.EvolutionDriveEngine.start === 'function') {
                if (!LawAIApp.EvolutionDriveEngine._started) {
                    LawAIApp.EvolutionDriveEngine.start();
                    LawAIApp.EvolutionDriveEngine._started = true;
                }
            }

            // 4. 启动无限学习循环
            if (LawAIApp.InfiniteLearningEngine && typeof LawAIApp.InfiniteLearningEngine.start === 'function') {
                LawAIApp.InfiniteLearningEngine.start();
            }

            // 5. 启动全球运行时
            if (LawAIApp.GlobalEducationRuntime && typeof LawAIApp.GlobalEducationRuntime.start === 'function') {
                LawAIApp.GlobalEducationRuntime.start();
            }

            // 6. 标记系统为完全激活
            LawAIApp.StorageEngine?.set?.('civilization_mode', 'singularity');

            LawAIApp.EventBus?.emit?.('CivilizationBootComplete', {
                timestamp: new Date().toISOString(),
                mode: 'singularity'
            });

            this._booted = true;
            console.log('[CivOS] AI Education Civilization is now fully operational.');
            return true;

        } catch (err) {
            console.error('[CivOS] Boot failed:', err);
            return false;
        }
    },

    getSystemSnapshot: function() {
        var mode = LawAIApp.StorageEngine?.get?.('civilization_mode', 'initializing') || 'initializing';
        var subsystemStatus = [];
        for (var i = 0; i < this.subsystems.length; i++) {
            var name = this.subsystems[i];
            subsystemStatus.push({
                name: name,
                available: !!LawAIApp[name]
            });
        }
        return {
            mode: mode,
            subsystems: subsystemStatus,
            bootTimestamp: LawAIApp.StorageEngine?.get?.('boot_timestamp'),
            booted: this._booted
        };
    },

    getStatus: function() {
        return {
            initialized: this._initialized,
            booted: this._booted,
            subsystems: this.subsystems.length,
            available: this.subsystems.filter(function(s) { return !!LawAIApp[s]; }).length
        };
    }
};

// 自动初始化
setTimeout(function() {
    if (LawAIApp.CivilizationCoreOS && typeof LawAIApp.CivilizationCoreOS.init === 'function') {
        LawAIApp.CivilizationCoreOS.init();
    }
}, 300);

console.log('[CivOS] CivilizationCoreOS V2.0 ready');
