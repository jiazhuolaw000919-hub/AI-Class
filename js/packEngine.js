// ===========================================
// packEngine.js
// Academy 包引擎 - 知识包管理（Phase 29 完善版）
// ===========================================

window.LawAIApp = window.LawAIApp || {};

LawAIApp.PackEngine = (function() {
    var _initialized = false;
    var _installedPacks = [];
    var _availablePacks = [];

    // ===========================================
    // 包定义
    // ===========================================
    var BUILT_IN_PACKS = [
        {
            packId: 'pack_ai_foundation',
            name: 'AI Foundation',
            description: 'Essential AI concepts for beginners',
            version: '1.0.0',
            author: 'Law AI Academy',
            lessons: ['day-1', 'day-2', 'day-3', 'day-4', 'day-5'],
            requiredXP: 0,
            category: 'foundation',
            icon: '🏛️'
        },
        {
            packId: 'pack_prompt_engineering',
            name: 'Prompt Engineering',
            description: 'Master the art of crafting prompts',
            version: '1.0.0',
            author: 'Law AI Academy',
            lessons: ['day-31', 'day-32', 'day-33', 'day-34', 'day-35'],
            requiredXP: 200,
            category: 'prompt',
            icon: '✍️'
        },
        {
            packId: 'pack_ai_tools',
            name: 'AI Tools Mastery',
            description: 'Hands-on with leading AI tools',
            version: '1.0.0',
            author: 'Law AI Academy',
            lessons: ['day-71', 'day-72', 'day-73', 'day-74', 'day-75'],
            requiredXP: 500,
            category: 'tools',
            icon: '🛠️'
        }
    ];

    // ===========================================
    // 包管理
    // ===========================================
    function getAvailablePacks() {
        _sync();
        return _availablePacks;
    }

    function getInstalledPacks() {
        _sync();
        return _installedPacks;
    }

    function isInstalled(packId) {
        _sync();
        return _installedPacks.some(function(p) { return p.packId === packId; });
    }

    function getPack(packId) {
        _sync();
        var all = _availablePacks.concat(_installedPacks);
        return all.find(function(p) { return p.packId === packId; }) || null;
    }

    function installPack(packId) {
        var pack = getPack(packId);
        if (!pack) return null;
        if (isInstalled(packId)) return pack;
        
        // 检查前置条件
        var xp = LawAIApp.XPEngine?.getCurrentXP?.() || 0;
        if (xp < (pack.requiredXP || 0)) {
            console.warn('⚠️ Not enough XP to install pack:', packId);
            return null;
        }
        
        _installedPacks.push({ ...pack, installedAt: new Date().toISOString() });
        _save();
        
        LawAIApp.EventBus?.emit?.('PackInstalled', { packId: packId, pack: pack });
        console.log('📦 Pack installed:', packId);
        return pack;
    }

    function uninstallPack(packId) {
        if (!isInstalled(packId)) return false;
        _installedPacks = _installedPacks.filter(function(p) { return p.packId !== packId; });
        _save();
        LawAIApp.EventBus?.emit?.('PackUninstalled', { packId: packId });
        return true;
    }

    function updatePack(packId) {
        // 模拟更新：检查是否有新版本
        var installed = _installedPacks.find(function(p) { return p.packId === packId; });
        if (!installed) return null;
        
        var available = _availablePacks.find(function(p) { return p.packId === packId; });
        if (!available) return installed;
        
        if (available.version !== installed.version) {
            installed.version = available.version;
            installed.updatedAt = new Date().toISOString();
            _save();
            LawAIApp.EventBus?.emit?.('PackUpdated', { packId: packId, pack: installed });
            return installed;
        }
        
        return installed;
    }

    function validateManifest(manifest) {
        if (!manifest) return { valid: false, errors: ['No manifest provided'] };
        var errors = [];
        
        if (!manifest.packId) errors.push('Missing packId');
        if (!manifest.name) errors.push('Missing name');
        if (!manifest.version) errors.push('Missing version');
        if (!manifest.lessons || !Array.isArray(manifest.lessons)) {
            errors.push('Missing or invalid lessons array');
        }
        
        return { valid: errors.length === 0, errors: errors };
    }

    // ===========================================
    // 私有方法
    // ===========================================
    function _sync() {
        try {
            var installed = LawAIApp.StorageEngine?.get?.('installed_packs');
            if (installed) _installedPacks = installed;
            
            // 始终从内置包同步可用包
            _availablePacks = BUILT_IN_PACKS.slice();
            
            // 自动安装内置包（如果还没安装）
            BUILT_IN_PACKS.forEach(function(pack) {
                if (!isInstalled(pack.packId)) {
                    installPack(pack.packId);
                }
            });
        } catch (e) {}
    }

    function _save() {
        try {
            LawAIApp.StorageEngine?.set?.('installed_packs', _installedPacks);
        } catch (e) {}
    }

    // ===========================================
    // 初始化
    // ===========================================
    function init() {
        if (_initialized) return;
        _initialized = true;
        
        _sync();
        console.log('📦 PackEngine initialized');
    }

    setTimeout(init, 300);

    return {
        init: init,
        getAvailable: getAvailablePacks,
        getInstalled: getInstalledPacks,
        isInstalled: isInstalled,
        getPack: getPack,
        install: installPack,
        uninstall: uninstallPack,
        update: updatePack,
        validate: validateManifest
    };
})();

console.log('📦 PackEngine V2.0 ready');
