// ===========================================
// resourceEngine.js
// 知识资源引擎 - 统一资源管理（Phase 26 完善版）
// ===========================================

window.LawAIApp = window.LawAIApp || {};

LawAIApp.ResourceEngine = (function() {
    var _initialized = false;
    var _resources = [];

    // ===========================================
    // 资源注册
    // ===========================================
    function getAll(lessonId) {
        var resources = _getResources();
        if (lessonId) {
            return resources.filter(function(r) { return r.lessonId === lessonId; });
        }
        return resources;
    }

    function getResource(id) {
        var resources = _getResources();
        return resources.find(function(r) { return r.id === id; }) || null;
    }

    function add(resource) {
        if (!resource.id) {
            resource.id = 'res_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
        }
        if (!resource.createdAt) {
            resource.createdAt = new Date().toISOString();
        }
        resource.status = resource.status || 'active';
        
        var resources = _getResources();
        resources.push(resource);
        _saveResources(resources);
        return resource;
    }

    function update(id, updates) {
        var resources = _getResources();
        var index = resources.findIndex(function(r) { return r.id === id; });
        if (index === -1) return null;
        
        resources[index] = { ...resources[index], ...updates, updatedAt: new Date().toISOString() };
        _saveResources(resources);
        return resources[index];
    }

    function deprecate(id) {
        return update(id, { status: 'deprecated' });
    }

    // ===========================================
    // 资源搜索
    // ===========================================
    function search(query, filters) {
        filters = filters || {};
        var resources = _getResources();
        var q = query.toLowerCase();
        
        var results = resources.filter(function(r) {
            if (r.status === 'deprecated') return false;
            if (filters.type && r.type !== filters.type) return false;
            if (filters.difficulty && r.difficulty !== filters.difficulty) return false;
            if (filters.lessonId && r.lessonId !== filters.lessonId) return false;
            if (!q) return true;
            
            var match = r.title.toLowerCase().indexOf(q) !== -1 ||
                       r.description.toLowerCase().indexOf(q) !== -1 ||
                       (r.keywords && r.keywords.some(function(k) { return k.toLowerCase().indexOf(q) !== -1; }));
            return match;
        });
        
        return results;
    }

    function recommendForLesson(lessonId) {
        var resources = getAll(lessonId);
        if (resources.length === 0) {
            // 如果没有匹配的资源，返回通用推荐
            return {
                best: null,
                alternatives: []
            };
        }
        
        // 按质量排序
        var sorted = resources.sort(function(a, b) {
            var qualityA = a.qualityScore === 'official' ? 100 : 
                          a.qualityScore === 'professional' ? 70 : 50;
            var qualityB = b.qualityScore === 'official' ? 100 : 
                          b.qualityScore === 'professional' ? 70 : 50;
            return qualityB - qualityA;
        });
        
        return {
            best: sorted[0] || null,
            alternatives: sorted.slice(1, 4)
        };
    }

    function getHealthReport() {
        var resources = _getResources();
        var active = resources.filter(function(r) { return r.status === 'active'; });
        var deprecated = resources.filter(function(r) { return r.status === 'deprecated'; });
        
        return {
            total: resources.length,
            active: active.length,
            deprecated: deprecated.length,
            byType: resources.reduce(function(acc, r) {
                acc[r.type] = (acc[r.type] || 0) + 1;
                return acc;
            }, {})
        };
    }

    // ===========================================
    // 初始化默认资源
    // ===========================================
    function seedDefaultResources() {
        var resources = _getResources();
        if (resources.length > 0) return;

        var sampleResources = [
            {
                id: 'res_1',
                lessonId: 'day-1',
                title: 'Official AI Guide',
                description: 'A comprehensive introduction to AI concepts.',
                type: 'article',
                provider: 'OpenAI',
                url: 'https://example.com/ai-guide',
                difficulty: 'Beginner',
                estimatedMinutes: 10,
                qualityScore: 'official',
                status: 'active',
                keywords: ['AI', 'introduction']
            },
            {
                id: 'res_2',
                lessonId: 'day-2',
                title: 'Prompt Engineering Basics',
                description: 'Learn how to craft effective prompts.',
                type: 'video',
                provider: 'YouTube',
                url: 'https://example.com/prompt-video',
                difficulty: 'Beginner',
                estimatedMinutes: 15,
                qualityScore: 'professional',
                status: 'active',
                keywords: ['prompt', 'ChatGPT']
            },
            {
                id: 'res_3',
                lessonId: 'day-10',
                title: 'AI Ethics 101',
                description: 'Understanding the ethical implications of AI.',
                type: 'article',
                provider: 'AI Ethics Board',
                url: 'https://example.com/ai-ethics',
                difficulty: 'Intermediate',
                estimatedMinutes: 20,
                qualityScore: 'official',
                status: 'active',
                keywords: ['ethics', 'AI']
            }
        ];

        sampleResources.forEach(function(r) {
            _resources.push(r);
        });
        _saveResources(_resources);
    }

    // ===========================================
    // 私有方法
    // ===========================================
    function _getResources() {
        try {
            var stored = LawAIApp.StorageEngine?.get?.('resources') || [];
            if (stored.length > 0) {
                _resources = stored;
            }
            return _resources;
        } catch (e) {
            return _resources;
        }
    }

    function _saveResources(resources) {
        _resources = resources;
        try {
            LawAIApp.StorageEngine?.set?.('resources', resources);
        } catch (e) {}
    }

    // ===========================================
    // 初始化
    // ===========================================
    function init() {
        if (_initialized) return;
        _initialized = true;

        seedDefaultResources();

        // 监听课程完成，触发资源推荐
        LawAIApp.EventBus?.on?.('LessonCompleted', function(data) {
            var recommendation = recommendForLesson(data.lessonId);
            if (recommendation.best) {
                LawAIApp.EventBus?.emit?.('ResourceRecommended', { 
                    lessonId: data.lessonId, 
                    recommendation: recommendation 
                });
            }
        });

        // 定期健康检查
        setInterval(function() {
            // 自动过时：将旧资源标记为 deprecated
            var resources = _getResources();
            var now = Date.now();
            resources.forEach(function(r) {
                if (r.status === 'active' && r.createdAt) {
                    var age = now - new Date(r.createdAt).getTime();
                    if (age > 365 * 24 * 60 * 60 * 1000) { // 1年
                        // 不自动过时，只是记录
                    }
                }
            });
        }, 86400000);

        console.log('📚 ResourceEngine initialized');
    }

    setTimeout(init, 300);

    return {
        init: init,
        search: search,
        getRecommendation: recommendForLesson,
        addResource: add,
        updateResource: update,
        deprecateResource: deprecate,
        getHealthReport: getHealthReport,
        getAllResources: getAll,
        getResource: getResource
    };
})();

console.log('📚 ResourceEngine V2.0 ready');
