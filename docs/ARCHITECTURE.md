# Law AI Academy - Architecture Documentation

## Architecture Hierarchy

### App Layer
- Entry point (`index.html`, `app.js`)
- Routing (`router.js`)
- Global state management (`storage.js`)
- Theme management (`theme.js`)
- Bootstrapping (`bootstrap.js`, `bootManager.js`)

### Core Layer
- Event Bus (`eventBus.js`, `eventRegistry.js`)
- Core Learning Engine (`coreLearningEngine.js`)
- Progress Engine (`progressEngine.js`, `progressStorage.js`)
- XP Engine (`xpEngine.js`, `levelSystem.js`)
- Domain Registry (`domainRegistry.js`)
- Layer Registry (`layerRegistry.js`)
- Architecture Validator (`architectureValidator.js`)
- Runtime Health (`runtimeHealth.js`)
- Architecture Constants (`architectureConstants.js`)

### Feature Layer
- Academy (`academy.js`, `academyData.js`, `academyStorage.js`)
- Course (`courseEngine.js`, `courseData.js`, `courseStorage.js`)
- Module (`moduleEngine.js`, `moduleData.js`, `moduleStorage.js`)
- Lesson (`lessonEngine.js`, `lessonModel.js`, `lessonStorage.js`)
- Quiz (`quiz.js`, `quizAnalytics.js`, etc.)
- Practice (`practiceEngine.js`, `practiceEvaluator.js`, etc.)
- Mentor (`mentorEngine.js`, `mentorMemory.js`, etc.)
- Memory (`memoryEngine.js`, `memoryTracker.js`, `forgettingCurve.js`)
- Goal (`goalEngine.js`, `goalPlanner.js`, `goalTracker.js`)
- Project (`projectEngine.js`, `projectPlanner.js`, `projectTracker.js`)
- Career (`careerEngine.js`, `careerRoadmap.js`, `careerGapAnalyzer.js`)
- Skill (`skillEngine.js`, `skillTracker.js`, `skillAnalytics.js`)
- Habit (`habitEngine.js`, `habitTracker.js`, `habitScore.js`)
- Recommendation (`recommendationEngine.js`, `recommendationRules.js`)
- Learning Path (`learningPathEngine.js`, `pathPlanner.js`)

### Content Layer
- Academy Packs (`packEngine.js`, `packInstaller.js`, `packRegistry.js`)
- Learning Packs (`learningPack.js`, `packLoader.js`, `packValidator.js`)
- Content Platform (`contentPlatform.js`, `contentRegistry.js`, `contentValidator.js`)
- Knowledge Resources (`resourceEngine.js`, `resourceRegistry.js`, `resourceRanker.js`)

### UI Layer
- Dashboard (`dashboard.js`, `dashboardStatistics.js`)
- Learning Page (`learning.js`, `lesson.js`)
- Calendar (`calendar.js`, `calendarEngine.js`)
- Notes (`notes.js`, `notebook.js`)
- Settings (`settings.js`)
- Academy Home (`academy.js`, `academyUI.js`)
- Workspace (`workspaceEngine.js`, `workspaceLayout.js`, `workspaceWidgets.js`)
- Components (reusable UI components)

### AI Layer
- AI Abstraction Layer (`aiLayer.js`, `providerRegistry.js`, `promptManager.js`)
- AI Mentor (`mentorEngine.js`, `mentorConversation.js`, `mentorReflection.js`)
- AI Civilization (`aiCivilizationKernel.js`, `aiConsciousnessLayer.js`, etc.)
- Agent Systems (`agentOrchestrator.js`, `agentConsensusEngine.js`, etc.)
- Analytics & Intelligence (`analyticsEngine.js`, `statisticsEngine.js`, `predictionEngine.js`)

## Layer Dependencies
- **App Layer** depends on Core, UI, Feature, AI, Content
- **Core Layer** depends only on itself
- **Feature Layer** depends on Core and Content
- **Content Layer** depends on Core
- **UI Layer** depends on Core and Feature
- **AI Layer** depends on Core and Feature

## Recovery Architecture
- Domain Registry: central registration of all domains (Academy, Lesson, etc.)
- Layer Registry: mapping of each engine to its architectural layer
- Architecture Validator: detects misplacements and duplicates (warnings only)
- Runtime Health: monitors loaded engines, domains, and dependencies
- SystemComposer: placeholder for future layout composition
