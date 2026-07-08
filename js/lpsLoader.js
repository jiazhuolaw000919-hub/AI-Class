// ===========================================
// lpsLoader.js
// 学习包系统 - 标准化知识包加载（Phase 37 完善版）
// ===========================================

window.LawAIApp = window.LawAIApp || {};

LawAIApp.LPSLoader = (function() {
    var _initialized = false;
    var _loadedPacks = {};

    // ===========================================
    // 包加载
    // ===========================================
    async function loadPack(academyId) {
        academyId = academyId || 'academy_ai';
        
        // 尝试从缓存加载
        var cached = getCachedPack(academyId);
        if (cached) return cached;
        
        // 尝试从 Storage 加载
        try {
            var stored = LawAIApp.StorageEngine?.get?.('lps_pack_' + academyId);
            if (stored) {
                _loadedPacks[academyId] = stored;
                return stored;
            }
        } catch (e) {}
        
        // 尝试从 ContentLoader 加载
        try {
            if (LawAIApp.ContentLoader && typeof LawAIApp.ContentLoader.fetchPack === 'function') {
                var fetched = await LawAIApp.ContentLoader.fetchPack(academyId);
                if (fetched && fetched.manifest) {
                    var manifest = parseManifest(fetched.manifest);
                    _loadedPacks[academyId] = manifest;
                    cachePack(academyId, manifest);
                    return manifest;
                }
            }
        } catch (e) {
            console.warn('⚠️ ContentLoader fetch failed:', e);
        }
        
        // 如果都失败，生成默认包
        return generateDefaultPack(academyId);
    }

    function getCachedPack(academyId) {
        return _loadedPacks[academyId] || null;
    }

    function cachePack(academyId, manifest) {
        _loadedPacks[academyId] = manifest;
        try {
            LawAIApp.StorageEngine?.set?.('lps_pack_' + academyId, manifest);
        } catch (e) {}
    }

    // ===========================================
    // 包安装
    // ===========================================
    async function installPack(academyId) {
        var manifest = await loadPack(academyId);
        if (!manifest) {
            return { success: false, error: 'Pack not found' };
        }
        
        var validation = validatePack(manifest);
        if (!validation.valid) {
            LawAIApp.EventBus?.emit?.('PackValidated', { packId: manifest.packId, errors: validation.errors });
            return { success: false, errors: validation.errors };
        }
        
        // 注册到 LPSRegistry
        try {
            if (LawAIApp.LPSRegistry && typeof LawAIApp.LPSRegistry.register === 'function') {
                LawAIApp.LPSRegistry.register(manifest);
            }
        } catch (e) {
            console.warn('⚠️ LPSRegistry not available');
        }
        
        LawAIApp.EventBus?.emit?.('PackLoaded', { packId: manifest.packId, manifest: manifest });
        return { success: true, manifest: manifest };
    }

    // ===========================================
    // 包验证
    // ===========================================
    function validatePack(manifest) {
        var errors = [];
        
        if (!manifest) {
            return { valid: false, errors: ['No manifest provided'] };
        }
        
        if (!manifest.packId) errors.push('Missing packId');
        if (!manifest.name) errors.push('Missing name');
        if (!manifest.version) errors.push('Missing version');
        if (!manifest.lessons || !Array.isArray(manifest.lessons)) {
            errors.push('Missing or invalid lessons array');
        }
        
        return { valid: errors.length === 0, errors: errors };
    }

    // ===========================================
    // 包解析
    // ===========================================
    function parseManifest(data) {
        var manifest = {
            packId: data.packId || data.id || 'pack_' + Date.now(),
            name: data.name || 'Learning Pack',
            description: data.description || '',
            version: data.version || '1.0.0',
            academyId: data.academyId || 'academy_ai',
            lessons: data.lessons || [],
            courses: data.courses || [],
            modules: data.modules || [],
            metadata: data.metadata || {},
            createdAt: new Date().toISOString()
        };
        
        return manifest;
    }

    // ===========================================
    // 默认包
    // ===========================================
    function generateDefaultPack(academyId) {
        var lessons = [];
        for (var i = 1; i <= 30; i++) {
            lessons.push('day-' + i);
        }
        
        return {
            packId: 'pack_' + academyId + '_default',
            name: 'AI Foundation Pack',
            description: 'Essential AI learning pack',
            version: '1.0.0',
            academyId: academyId,
            lessons: lessons,
            courses: [],
            modules: [],
            metadata: { type: 'default', generated: true },
            createdAt: new Date().toISOString()
        };
    }

    // ===========================================
    // 从 LocalStorage 加载
    // ===========================================
    function loadFromLocalStorage(academyId) {
        try {
            var stored = LawAIApp.StorageEngine?.get?.('lps_pack_' + academyId);
            if (stored) return stored;
            
            var raw = localStorage.getItem('lps_pack_' + academyId);
            if (raw) {
                var parsed = JSON.parse(raw);
                _loadedPacks[academyId] = parsed;
                return parsed;
            }
        } catch (e) {}
        return null;
    }

    // ===========================================
    // 初始化
    // ===========================================
    function init() {
        if (_initialized) return;
        _initialized = true;
        
        // 预加载默认包
        setTimeout(function() {
            loadPack('academy_ai').then(function(manifest) {
                if (manifest) {
                    console.log('📦 LPSLoader: Default pack loaded');
                }
            });
        }, 500);
        
        console.log('📦 LPSLoader initialized');
    }

    setTimeout(init, 300);

    return {
        init: init,
        loadPack: loadPack,
        installPack: installPack,
        validate: validatePack,
        parse: parseManifest,
        loadFromLocalStorage: loadFromLocalStorage,
        getCached: getCachedPack
    };
})();

console.log('📦 LPSLoader V2.0 ready');
