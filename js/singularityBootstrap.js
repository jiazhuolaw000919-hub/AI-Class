// ===========================================
// singularityBootstrap.js
// 奇点引导程序：整合所有系统，完成最终启动序列（Phase 80 升级版）
// ===========================================

window.LawAIApp = window.LawAIApp || {};

LawAIApp.SingularityBootstrap = {
    _booted: false,
    _initialized: false,

    init: function() {
        if (this._initialized) return;
        this._initialized = true;
        console.log('🌌 SingularityBootstrap initialized');
        return this;
    },

    execute: async function() {
        if (this._booted) {
            console.log('[Singularity] Already booted.');
            return;
        }

        console.log('[Singularity] Beginning final integration bootstrap...');

        try {
            // 1. 确保核心内容已生成
            if (LawAIApp.DomainBootstrapEngine && typeof LawAIApp.DomainBootstrapEngine.run === 'function') {
                var domainBootstrapped = LawAIApp.StorageEngine?.get?.('domain_bootstrapped');
                if (!domainBootstrapped) {
                    await LawAIApp.DomainBootstrapEngine.run();
                    LawAIApp.StorageEngine?.set?.('domain_bootstrapped', true);
                }
            }

            // 2. 确保课程工厂已启动
            if (LawAIApp.CurriculumFactoryEngine && typeof LawAIApp.CurriculumFactoryEngine.startProduction === 'function') {
                var factoryDone = LawAIApp.StorageEngine?.get?.('factory_production_done');
                if (!factoryDone) {
                    LawAIApp.CurriculumFactoryEngine.startProduction();
                    LawAIApp.StorageEngine?.set?.('factory_production_done', true);
                }
            }

            // 3. 确保大学已部署
            if (LawAIApp.UniversityDeploymentEngine && typeof LawAIApp.UniversityDeploymentEngine.getUniversities === 'function') {
                var unis = LawAIApp.UniversityDeploymentEngine.getUniversities();
                if (unis.length === 0 && typeof LawAIApp.UniversityDeploymentEngine.launchDefaultUniversity === 'function') {
                    LawAIApp.UniversityDeploymentEngine.launchDefaultUniversity();
                }
            }

            // 4. 确保全球网络已激活
            if (LawAIApp.GlobalEducationNetworkEngine && typeof LawAIApp.GlobalEducationNetworkEngine.init === 'function') {
                LawAIApp.GlobalEducationNetworkEngine.init();
                LawAIApp.EventBus?.emit?.('GlobalEducationNetworkActive');
            }

            // 5. 启动文明操作系统
            setTimeout(function() {
                if (LawAIApp.CivilizationCoreOS && typeof LawAIApp.CivilizationCoreOS.boot === 'function') {
                    LawAIApp.CivilizationCoreOS.boot();
                }
            }, 2000);

            // 6. 记录引导完成时间
            LawAIApp.StorageEngine?.set?.('singularity_boot_timestamp', new Date().toISOString());
            LawAIApp.EventBus?.emit?.('SingularityBootComplete');

            this._booted = true;
            console.log('[Singularity] Final integration complete. Civilization is now self-sustaining.');

            // 7. 触发文明完成宣告
            setTimeout(function() {
                if (LawAIApp.AICivilizationKernel && typeof LawAIApp.AICivilizationKernel.announceCompletion === 'function') {
                    LawAIApp.AICivilizationKernel.announceCompletion();
                }
            }, 3000);

        } catch (err) {
            console.error('[Singularity] Bootstrap failed:', err);
        }
    },

    getStatus: function() {
        return {
            initialized: this._initialized,
            booted: this._booted
        };
    }
};

// 页面加载后自动启动奇点引导
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(function() {
        if (LawAIApp.SingularityBootstrap && typeof LawAIApp.SingularityBootstrap.init === 'function') {
            LawAIApp.SingularityBootstrap.init();
            LawAIApp.SingularityBootstrap.execute();
        }
    }, 3000);
} else {
    document.addEventListener('load', function() {
        setTimeout(function() {
            if (LawAIApp.SingularityBootstrap && typeof LawAIApp.SingularityBootstrap.init === 'function') {
                LawAIApp.SingularityBootstrap.init();
                LawAIApp.SingularityBootstrap.execute();
            }
        }, 3000);
    });
}

console.log('🌌 SingularityBootstrap V2.0 ready');
