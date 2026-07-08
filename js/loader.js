window.LawAIApp = window.LawAIApp || {};

/**
 * =========================
 * ENGINE REGISTRY（扩展版）
 * =========================
 */

// 核心引擎（必须优先加载）
const CORE_ENGINES = [
    "storageEngine.js",
    "eventBus.js",
    "profileEngine.js",
    "systemComposer.js",
    "app.js"
];

// 学习相关
const LEARNING_ENGINES = [
    "levelEngine.js",
    "experienceEngine.js",
    "learningIntelligence.js",
    "learningStateManager.js",
    "learningAnalytics.js",
    "learningGraphEngine.js",
    "learningJourneyEngine.js",
    "learningLoopEngine.js",
    "learningPack.js",
    "learningPathEngine.js",
    "learningPathGenerator.js",
    "learningRadar.js",
    "learningRhythm.js",
    "learningRightsEngine.js",
    "learningSocietyController.js",
    "liveLearningGraph.js",
    "lessonEngine.js",
    "lessonGenerator.js",
    "lessonMemory.js",
    "lessonModel.js",
    "lessonModuleFactory.js",
    "lessonNavigator.js",
    "lessonPipelineEngine.js",
    "lessonStorage.js",
    "lessonValidator.js",
    "lessonView.js"
];

// 工作区相关
const WORKSPACE_ENGINES = [
    "workspaceEngine.js",
    "workspaceState.js",
    "workspaceLayout.js",
    "workspaceWidgets.js",
    "workspaceSearch.js"
];

// 导师系统
const MENTOR_ENGINES = [
    "mentorAgent.js",
    "mentorAnalytics.js",
    "mentorBrain.js",
    "mentorConversation.js",
    "mentorEngine.js",
    "mentorGoals.js",
    "mentorMemory.js",
    "mentorMessages.js",
    "mentorPersonalityEngine.js",
    "mentorPlanner.js",
    "mentorProfile.js",
    "mentorProfiles.js",
    "mentorPromptBuilder.js",
    "mentorRecommendations.js",
    "mentorReflection.js",
    "mentorSelector.js"
];

// 技能系统
const SKILL_ENGINES = [
    "skillAnalytics.js",
    "skillApi.js",
    "skillAssessmentEngine.js",
    "skillClusterProcessor.js",
    "skillDeploymentEngine.js",
    "skillEngine.js",
    "skillRadar.js",
    "skillScoringSystem.js",
    "skillTaskMatcher.js",
    "skillTracker.js",
    "skillTreeBuilder.js",
    "skillTrustLayer.js",
    "skillValidationEngine.js",
    "skillWorkMatchingEngine.js",
    "universalSkillGraph.js"
];

// 目标系统
const GOAL_ENGINES = [
    "goalAdjuster.js",
    "goalAnalytics.js",
    "goalDashboard.js",
    "goalEngine.js",
    "goalForecast.js",
    "goalHealth.js",
    "goalIntelligenceEngine.js",
    "goalPlanner.js",
    "goalRoadmap.js",
    "goalTimeline.js",
    "goalTracker.js"
];

// 知识系统
const KNOWLEDGE_ENGINES = [
    "knowledgeAnalytics.js",
    "knowledgeAssetGraph.js",
    "knowledgeCapture.js",
    "knowledgeCard.js",
    "knowledgeConfidence.js",
    "knowledgeDashboard.js",
    "knowledgeEconomyEngine.js",
    "knowledgeEditor.js",
    "knowledgeEvolution.js",
    "knowledgeExport.js",
    "knowledgeGraph.js",
    "knowledgeIntegrityValidator.js",
    "knowledgeLinker.js",
    "knowledgeNavigator.js",
    "knowledgeNetwork.js",
    "pkosEngine.js",
    "pkosKnowledgeGraph.js"
];

// AI 相关
const AI_ENGINES = [
    "academyAI.js",
    "academyAIData.js",
    "academyAIRouter.js",
    "academyAIView.js",
    "aiAgentComplianceLayer.js",
    "aiCivilizationKernel.js",
    "aiConsciousnessLayer.js",
    "aiEthicsController.js",
    "aiFacultyManager.js",
    "aiGovernanceEngine.js",
    "aiLayer.js",
    "aiProfessorEngine.js",
    "agentConsensusEngine.js",
    "agentContentGenerator.js",
    "agentCore.js",
    "agentCurriculumConsensus.js",
    "agentEvaluationCore.js",
    "agentMotivationSync.js",
    "agentOrchestrator.js",
    "agentTaskCoordinator.js",
    "agentValidationNetwork.js"
];

// 其他功能模块（按需加载）
const OPTIONAL_ENGINES = [
    "academy.js",
    "academyData.js",
    "academyModel.js",
    "academyStorage.js",
    "achievementEngine.js",
    "adaptiveCourseEngine.js",
    "adaptiveLearning.js",
    "adaptiveMemory.js",
    "adaptivePathEngine.js",
    "adaptiveRecommendation.js",
    "ambientEngine.js",
    "analyticsCollector.js",
    "analyticsEngine.js",
    "analyticsEvents.js",
    "analyticsProcessor.js",
    "analyticsStorage.js",
    "apiClient.js",
    "architectureOptimizer.js",
    "assessmentFactory.js",
    "authService.js",
    "authUI.js",
    "autoRefactorEngine.js",
    "avatarEngine.js",
    "bookmark.js",
    "bootManager.js",
    "bootReport.js",
    "bootstrap.js",
    "calendar.js",
    "calendarEngine.js",
    "careerAnalytics.js",
    "careerEngine.js",
    "careerGapAnalyzer.js",
    "careerMappingEngine.js",
    "careerPathGenerator.js",
    "careerProfile.js",
    "careerProgressionEngine.js",
    "careerRoadmap.js",
    "careerStory.js",
    "categoryData.js",
    "categoryModel.js",
    "categoryStorage.js",
    "celebrationEngine.js",
    "certificationGenerator.js",
    "certificationStandardsEngine.js",
    "challengeSystem.js",
    "civilizationAwarenessMonitor.js",
    "civilizationConstitution.js",
    "civilizationCoreEngine.js",
    "civilizationCoreOS.js",
    "civilizationEventBus.js",
    "civilizationIdentityCore.js",
    "civilizationMotivationCore.js",
    "civilizationRuntime.js",
    "collectionEngine.js",
    "collectiveLearningProcessor.js",
    "collectiveMemorySystem.js",
    "commandCenter.js",
    "companionEngine.js",
    "completion.js",
    "components.js",
    "conflictResolutionSystem.js",
    "constitutionalEvolutionEngine.js",
    "contentFactoryEngine.js",
    "contentGeneratorCore.js",
    "contentLoader.js",
    "contentPipeline.js",
    "contentPlatform.js",
    "contentRegistry.js",
    "contentValidator.js",
    "contentVersion.js",
    "conversationActions.js",
    "conversationContext.js",
    "conversationEngine.js",
    "conversationMemory.js",
    "conversationUI.js",
    "coreLearningEngine.js",
    "courseAIFundamentals.js",
    "courseAIFundamentalsData.js",
    "courseAIFundamentalsView.js",
    "courseApi.js",
    "courseData.js",
    "courseExperienceEngine.js",
    "courseGenerator.js",
    "courseModel.js",
    "courseRankingSystem.js",
    "courseStorage.js",
    "credentialFormatter.js",
    "crossUniversityCreditSystem.js",
    "curriculumContentSeeder.js",
    "curriculumFactoryEngine.js",
    "curriculumGenerator.js",
    "curriculumPackagingSystem.js",
    "curriculumPolicyEngine.js",
    "dailyAnimation.js",
    "dailyBriefingCard.js",
    "dailyBriefingEngine.js",
    "dailyFocusEngine.js",
    "dailyGreeting.js",
    "dailyPlanner.js",
    "dailyPromptExperience.js",
    "dailyQuoteEngine.js",
    "dashboard.js",
    "dashboardStatistics.js",
    "data.js",
    "databaseLayer.js",
    "dependencyValidator.js",
    "diffAnalyzer.js",
    "difficultyManager.js",
    "domainBootstrapEngine.js",
    "domainInitializer.js",
    "educationConsensusEngine.js",
    "educationGovernanceAuthority.js",
    "engineActivationSystem.js",
    "engineAutoStub.js",
    "engineBinder.js",
    "engineDashboard.js",
    "engineDependency.js",
    "engineHealth.js",
    "engineRegistry.js",
    "engineSafe.js",
    "engineSafeV2.js",
    "eventRegistry.js",
    "evolutionDriveEngine.js",
    "executionEngine.js",
    "experienceComposer.js",
    "experienceEngine.js",
    "fallbackManager.js",
    "feedbackEngine.js",
    "feedbackLoopStabilizer.js",
    "forecastEngine.js",
    "forgettingCurve.js",
    "gapDetector.js",
    "globalCurriculumSyncEngine.js",
    "globalEducationNetworkEngine.js",
    "globalEducationRuntime.js",
    "globalKnowledgeGraph.js",
    "globalLearningMetrics.js",
    "globalStandardEngine.js",
    "graphBuilder.js",
    "graphEdgeManager.js",
    "graphNavigator.js",
    "graphNodeManager.js",
    "graphPathResolver.js",
    "graphRenderer.js",
    "graphSignalProcessor.js",
    "graphTraversalEngine.js",
    "graphVisualizationEngine.js",
    "habitEngine.js",
    "habitScore.js",
    "habitTracker.js",
    "healthScore.js",
    "heatmap.js",
    "history.js",
    "identityAlignmentEngine.js",
    "identityEngine.js",
    "infiniteLearningEngine.js",
    "institutionalCurriculumEngine.js",
    "intelligenceEngine.js",
    "intelligenceHealth.js",
    "intelligenceProfile.js",
    "intelligenceRecommendations.js",
    "intelligenceSignals.js",
    "journeyTracker.js",
    "kreEngine.js",
    "kreRegistry.js",
    "layoutEngineV2.js",
    "learning.js",
    "learningAssetManager.js",
    "learningBalancer.js",
    "learningHealth.js",
    "learningHub.js",
    "lpsLoader.js",
    "lpsRegistry.js",
    "lpsValidator.js",
    "manifestReader.js",
    "marketplaceEngine.js",
    "massCurriculumGenerator.js",
    "masteryEngine.js",
    "memoryAgent.js",
    "memoryAnalytics.js",
    "memoryDashboard.js",
    "memoryEngine.js",
    "memoryHeatmap.js",
    "memoryReview.js",
    "memoryScheduler.js",
    "memoryTracker.js",
    "metaLearningEngine.js",
    "migrationEngine.js",
    "milestoneEngine.js",
    "missionFlowEngine.js",
    "moduleData.js",
    "moduleModel.js",
    "moduleProgress.js",
    "moduleStorage.js",
    "moduleView.js",
    "motionSystem.js",
    "motivationEngine.js",
    "nodeRegistry.js",
    "notebook.js",
    "notes.js",
    "onboardingEngine.js",
    "packEngine.js",
    "packInstaller.js",
    "packManager.js",
    "packRegistry.js",
    "packValidator.js",
    "pathPlanner.js",
    "patternDetector.js",
    "performanceEvaluationEngine.js",
    "performanceFeedbackLoop.js",
    "personalityEngine.js",
    "personalityMemory.js",
    "personalityProfile.js",
    "personalitySwitch.js",
    "plannerAgent.js",
    "plannerCalendar.js",
    "plannerDashboard.js",
    "plannerEngine.js",
    "plannerPriority.js",
    "plannerTimeline.js",
    "portfolioEngine.js",
    "portfolioGenerator.js",
    "portfolioShowcase.js",
    "practice.js",
    "practiceData.js",
    "practiceEngine.js",
    "practiceEvaluator.js",
    "practiceHistory.js",
    "practiceProgress.js",
    "practiceView.js",
    "predictionEngine.js",
    "progressApi.js",
    "progressEvents.js",
    "progressStorage.js",
    "progressValidator.js",
    "projectEngine.js",
    "projectPlanner.js",
    "projectReflection.js",
    "projectTracker.js",
    "promotionEngine.js",
    "promptManager.js",
    "providerRegistry.js",
    "providerRouter.js",
    "purposeLockSystem.js",
    "quiz.js",
    "quizAnalytics.js",
    "quizCharts.js",
    "quizHeatmap.js",
    "quizInsightDashboard.js",
    "quizMentorInsight.js",
    "realTimeLearningCompiler.js",
    "recallEngine.js",
    "recommendationEngine.js",
    "recommendationHistory.js",
    "recommendationRules.js",
    "reflectionEngine.js",
    "registryBuilder.js",
    "relationshipEngine.js",
    "reportGenerator.js",
    "resourceBookmarks.js",
    "resourceEngine.js",
    "resourceHealth.js",
    "resourceLibrary.js",
    "resourceRanker.js",
    "resourceRecommendation.js",
    "resourceRegistry.js",
    "resourceSearch.js",
    "responseNormalizer.js",
    "responseStyleEngine.js",
    "reviewQueue.js",
    "reviewScheduler.js",
    "reviewerAgent.js",
    "router.js",
    "runtimeInjector.js",
    "runtimeManager.js",
    "runtimeRegistry.js",
    "runtimeScanner.js",
    "secondBrain.js",
    "secondBrainEngine.js",
    "selfHealingSystem.js",
    "selfImprovementEngine.js",
    "semanticSearch.js",
    "sessionManager.js",
    "settings.js",
    "showcaseDashboard.js",
    "singularityBootstrap.js",
    "smartProjectData.js",
    "smartProjectProgress.js",
    "smartProjectView.js",
    "smartSummaryEngine.js",
    "startupValidator.js",
    "statistics.js",
    "statisticsEngine.js",
    "storage.js",
    "storageEngine.js",
    "strategyAgent.js",
    "studentTrackingSystem.js",
    "summary.js",
    "systemAnalyzer.js",
    "systemBootstrapper.js",
    "systemHealthMonitor.js",
    "systemOrchestrator.js",
    "systemState.js",
    "taskGenerationEngine.js",
    "theme.js",
    "themeEngine.js",
    "themeExperience.js",
    "timeline.js",
    "uiBridgeSystem.js",
    "uiComposer.js",
    "uiRootEngine.js",
    "universityDeploymentEngine.js",
    "universityInterconnectLayer.js",
    "universityOSCore.js",
    "unlockEngine.js",
    "updateNotifier.js",
    "userApi.js",
    "userContributionEngine.js",
    "userInitializer.js",
    "versionHistory.js",
    "workAssignmentEngine.js",
    "workforceSimulationEngine.js",
    "xpCalculator.js",
    "xpEngine.js",
    "xpHistory.js",
    "xpRewardEngine.js"
];

// ===========================================
// 合并所有引擎（按优先级分组）
// ===========================================
const ENGINE_REGISTRY = {
    core: CORE_ENGINES,
    learning: LEARNING_ENGINES,
    workspace: WORKSPACE_ENGINES,
    mentor: MENTOR_ENGINES,
    skill: SKILL_ENGINES,
    goal: GOAL_ENGINES,
    knowledge: KNOWLEDGE_ENGINES,
    ai: AI_ENGINES,
    optional: OPTIONAL_ENGINES
};

// 按优先级排序的加载顺序
const LOAD_ORDER = ['core', 'learning', 'workspace', 'mentor', 'skill', 'goal', 'knowledge', 'ai', 'optional'];

/**
 * =========================
 * BOOT STATE
 * =========================
 */

window.__ENGINE_STATUS__ = {
    loaded: [],
    missing: [],
    active: [],
    total: 0,
    booted: false,
    safeMode: false
};

const CRITICAL_ENGINES = [
    "profileEngine.js",
    "levelEngine.js",
    "experienceEngine.js",
    "learningIntelligence.js",
    "systemComposer.js",
    "app.js"
];

/**
 * =========================
 * STUB
 * =========================
 */

function createStub(name) {
    const stub = {
        __stub: true,
        name,
        init: function() {},
        start: function() {}
    };
    window.LawAIApp[name] = stub;
    window.LawAIApp.EngineRegistry?.register?.(name, stub);
}

/**
 * =========================
 * ACTIVATE ENGINE
 * =========================
 */

function activateEngine(name) {
    const engine = window.LawAIApp[name];
    if (!engine) return;

    try {
        engine.init?.();
        engine.start?.();
        if (!window.__ENGINE_STATUS__.active.includes(name)) {
            window.__ENGINE_STATUS__.active.push(name);
        }
        if (!window.LawAIApp.RuntimeManager?.engines?.[name]) {
            window.LawAIApp.RuntimeManager?.registerEngine?.(name, engine);
        }
    } catch (err) {
        console.warn("activation failed", name, err);
    }
}

/**
 * =========================
 * LOAD SCRIPT（带重试）
 * =========================
 */

function loadScript(src, retries) {
    retries = retries || 2;
    return new Promise(function(resolve) {
        // 检查是否已加载
        var existing = document.querySelector('script[src="js/' + src + '"]');
        if (existing) {
            resolve({ file: src, status: "ok", cached: true });
            return;
        }

        var script = document.createElement("script");
        script.src = "js/" + src;

        script.onload = function() {
            var name = src.replace(".js", "");
            var engine = window.LawAIApp[name];
            if (engine) {
                window.LawAIApp.EngineRegistry?.register?.(name, engine);
                activateEngine(name);
            }
            resolve({ file: src, status: "ok" });
        };

        script.onerror = function() {
            if (retries > 0) {
                console.warn("⚠️ Retrying " + src + " (" + retries + " attempts left)");
                setTimeout(function() {
                    loadScript(src, retries - 1).then(resolve);
                }, 500);
            } else {
                createStub(src.replace(".js", ""));
                resolve({ file: src, status: "missing" });
            }
        };

        document.head.appendChild(script);
    });
}

/**
 * =========================
 * LOAD GROUP（按顺序加载）
 * =========================
 */

async function loadGroup(group, list, isCritical) {
    isCritical = isCritical || false;
    console.log("📦", group, "(" + list.length + " files)" + (isCritical ? " ⚡CRITICAL" : ""));

    var results = [];
    // 关键组用较小批次，保证快速加载
    var batchSize = isCritical ? 5 : 20;

    for (var i = 0; i < list.length; i += batchSize) {
        var batch = list.slice(i, i + batchSize);
        var batchResults = await Promise.all(batch.map(function(src) {
            return loadScript(src);
        }));
        results = results.concat(batchResults);
        console.log("   📊 " + group + ": " + Math.min(i + batchSize, list.length) + "/" + list.length + " loaded");
    }

    return results;
}

/**
 * =========================
 * BOOT（优化版）
 * =========================
 */

async function boot() {
    console.log("🚀 Loader V4.0 starting (optimized)");
    var totalModules = Object.values(ENGINE_REGISTRY).reduce(function(sum, arr) {
        return sum + arr.length;
    }, 0);
    console.log("📋 Total modules: " + totalModules);

    // Runtime Boot
    LawAIApp.RuntimeRegistry?.init?.();
    LawAIApp.RuntimeManager?.init?.();

    // =========================
    // 按优先级加载
    // =========================

    for (var g = 0; g < LOAD_ORDER.length; g++) {
        var groupName = LOAD_ORDER[g];
        var files = ENGINE_REGISTRY[groupName];
        if (!files || files.length === 0) continue;

        var isCritical = (groupName === 'core');
        var results = await loadGroup(groupName, files, isCritical);

        results.forEach(function(r) {
            if (r.status === "ok") {
                if (window.__ENGINE_STATUS__.loaded.indexOf(r.file) === -1) {
                    window.__ENGINE_STATUS__.loaded.push(r.file);
                }
            } else {
                if (window.__ENGINE_STATUS__.missing.indexOf(r.file) === -1) {
                    window.__ENGINE_STATUS__.missing.push(r.file);
                }
            }
        });

        // 核心组加载完成后，触发部分就绪事件（让 App 提前启动）
        if (groupName === 'core') {
            console.log("✅ Core modules loaded, App can start");
            window.dispatchEvent(new CustomEvent("CORE_LOADED", {
                detail: { status: window.__ENGINE_STATUS__ }
            }));
        }
    }

    var boot = window.__ENGINE_STATUS__;
    boot.total = boot.loaded.length + boot.missing.length;
    boot.booted = true;
    boot.safeMode = boot.missing.some(function(f) {
        return CRITICAL_ENGINES.indexOf(f) !== -1;
    });

    window.LawAIApp.bootStatus = boot;

    console.log("📊 Runtime Summary");
    console.log({
        loaded: boot.loaded.length,
        active: boot.active.length,
        missing: boot.missing.length,
        safeMode: boot.safeMode
    });

    window.LawAIApp.RuntimeManager?.boot?.({
        boot: boot,
        active: boot.active
    });

    // 初始化 SystemComposer（如果还没初始化）
    if (!LawAIApp.SystemComposer?.initialized) {
        LawAIApp.SystemComposer?.init?.();
    }

    if (!LawAIApp.LayoutEngineV2?.initialized) {
        LawAIApp.LayoutEngineV2?.init?.();
    }

    if (!LawAIApp.EngineBinder?.initialized) {
        LawAIApp.EngineBinder?.init?.();
    }

    // 触发系统就绪事件
    setTimeout(function() {
        window.dispatchEvent(new CustomEvent("SYSTEM_READY", {
            detail: {
                boot: boot,
                active: boot.active,
                timestamp: Date.now()
            }
        }));
        console.log("✅ System ready");
    }, 0);

    // 后台加载非核心模块（核心已加载完成，不影响用户体验）
    console.log("⏳ Loading remaining modules in background...");
}

/**
 * =========================
 * SELF HEALING
 * =========================
 */

window.LawAIApp.SelfHealingSystem?.init?.();

// =========================
// 启动
// =========================

// 如果 DOM 已加载，立即启动；否则等待
if (document.readyState === "complete" || document.readyState === "interactive") {
    setTimeout(boot, 50);
} else {
    document.addEventListener("DOMContentLoaded", function() {
        setTimeout(boot, 50);
    });
}

console.log("🚀 Loader V4.0 optimized ready");
