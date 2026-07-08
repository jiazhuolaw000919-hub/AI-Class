// ===========================================
// contentPlatform.js
// 知识内容平台 - 统一内容基础设施（Phase 36 完善版）
// ===========================================

window.LawAIApp = window.LawAIApp || {};

LawAIApp.ContentPlatform = (function() {
    var _initialized = false;
    var _content = {};
    var _versions = {};
    var _pipeline = [];

    // ===========================================
    // 内容注册
    // ===========================================
    function registerContent(contentDef) {
        if (!contentDef.contentId) {
            contentDef.contentId = 'content_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
        }
        
        var content = {
            contentId: contentDef.contentId,
            academyId: contentDef.academyId || 'academy_ai',
            courseId: contentDef.courseId || null,
            moduleId: contentDef.moduleId || null,
            lessonId: contentDef.lessonId || null,
            type: contentDef.type || 'lesson',
            status: contentDef.status || 'draft',
            version: contentDef.version || '1.0.0',
            author: contentDef.author || 'Law Academy',
            data: contentDef.data || {},
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            publishedAt: contentDef.publishedAt || null
        };
        
        _content[content.contentId] = content;
        _saveContent();
        LawAIApp.EventBus?.emit?.('ContentRegistered', { content: content });
        return content;
    }

    function getContent(contentId) {
        _sync();
        return _content[contentId] || null;
    }

    function getAllContent() {
        _sync();
        return Object.values(_content);
    }

    function filterContent(filters) {
        var all = getAllContent();
        return all.filter(function(c) {
            for (var key in filters) {
                if (c[key] !== filters[key]) return false;
            }
            return true;
        });
    }

    function archiveContent(contentId) {
        var content = getContent(contentId);
        if (!content) return null;
        content.status = 'archived';
        content.updatedAt = new Date().toISOString();
        _saveContent();
        LawAIApp.EventBus?.emit?.('ContentArchived', { contentId: contentId });
        return content;
    }

    // ===========================================
    // 版本管理
    // ===========================================
    function createVersion(contentId, newVersion) {
        var content = getContent(contentId);
        if (!content) return null;
        
        var oldVersion = content.version;
        content.version = newVersion || incrementVersion(oldVersion);
        content.updatedAt = new Date().toISOString();
        
        if (!_versions[contentId]) _versions[contentId] = [];
        _versions[contentId].push({
            fromVersion: oldVersion,
            toVersion: content.version,
            snapshot: { ...content },
            createdAt: new Date().toISOString()
        });
        
        _saveContent();
        _saveVersions();
        LawAIApp.EventBus?.emit?.('VersionCreated', { contentId: contentId, version: content.version });
        return content;
    }

    function getVersionHistory(contentId) {
        _syncVersions();
        return _versions[contentId] || [];
    }

    function incrementVersion(version) {
        var parts = version.split('.');
        if (parts.length === 3) {
            parts[2] = String(parseInt(parts[2]) + 1);
            return parts.join('.');
        }
        return '1.0.1';
    }

    // ===========================================
    // 内容验证
    // ===========================================
    function fullCheck(contentId) {
        var content = getContent(contentId);
        if (!content) return { valid: false, errors: ['Content not found'] };
        
        var errors = [];
        if (!content.contentId) errors.push('Missing contentId');
        if (!content.type) errors.push('Missing type');
        if (content.status !== 'draft' && content.status !== 'published' && content.status !== 'archived') {
            errors.push('Invalid status');
        }
        
        return { valid: errors.length === 0, errors: errors };
    }

    // ===========================================
    // 发布流水线
    // ===========================================
    function advance(contentId, action) {
        var content = getContent(contentId);
        if (!content) return null;
        
        var statusFlow = {
            'draft': ['review', 'publish'],
            'review': ['publish', 'reject'],
            'publish': ['archive', 'update'],
            'archive': ['restore']
        };
        
        var actions = statusFlow[content.status] || [];
        if (actions.indexOf(action) === -1) {
            console.warn('Invalid action:', action, 'for status:', content.status);
            return null;
        }
        
        if (action === 'publish') {
            content.status = 'published';
            content.publishedAt = new Date().toISOString();
            LawAIApp.EventBus?.emit?.('ContentPublished', { contentId: contentId, content: content });
        } else if (action === 'archive') {
            content.status = 'archived';
        } else if (action === 'review') {
            content.status = 'review';
        } else if (action === 'reject') {
            content.status = 'draft';
        } else if (action === 'restore') {
            content.status = 'draft';
        } else if (action === 'update') {
            content.status = 'draft';
        }
        
        content.updatedAt = new Date().toISOString();
        _saveContent();
        LawAIApp.EventBus?.emit?.('ContentAdvanced', { contentId: contentId, action: action });
        return content;
    }

    // ===========================================
    // 私有方法
    // ===========================================
    function _sync() {
        try {
            var stored = LawAIApp.StorageEngine?.get?.('content_platform');
            if (stored) _content = stored;
        } catch (e) {}
    }

    function _saveContent() {
        try {
            LawAIApp.StorageEngine?.set?.('content_platform', _content);
        } catch (e) {}
    }

    function _syncVersions() {
        try {
            var stored = LawAIApp.StorageEngine?.get?.('content_versions');
            if (stored) _versions = stored;
        } catch (e) {}
    }

    function _saveVersions() {
        try {
            LawAIApp.StorageEngine?.set?.('content_versions', _versions);
        } catch (e) {}
    }

    // ===========================================
    // 初始化
    // ===========================================
    function init() {
        if (_initialized) return;
        _initialized = true;
        
        _sync();
        _syncVersions();
        
        // 从 LessonEngine 种子内容
        try {
            if (LawAIApp.LessonEngine && typeof LawAIApp.LessonEngine.getAllLessons === 'function') {
                var lessons = LawAIApp.LessonEngine.getAllLessons();
                var existing = getAllContent();
                var existingIds = existing.map(function(c) { return c.lessonId; });
                
                lessons.slice(0, 10).forEach(function(lesson) {
                    if (lesson && lesson.lessonId && existingIds.indexOf(lesson.lessonId) === -1) {
                        registerContent({
                            lessonId: lesson.lessonId,
                            type: 'lesson',
                            status: 'published',
                            author: 'Law Academy',
                            data: { title: lesson.title, category: lesson.category }
                        });
                    }
                });
            }
        } catch (e) {}
        
        console.log('📚 ContentPlatform initialized');
    }

    setTimeout(init, 400);

    return {
        init: init,
        register: registerContent,
        get: getContent,
        getAll: getAllContent,
        filter: filterContent,
        archive: archiveContent,
        validate: fullCheck,
        advance: advance,
        createVersion: createVersion,
        getHistory: getVersionHistory
    };
})();

console.log('📚 ContentPlatform V2.0 ready');
