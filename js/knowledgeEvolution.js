// ===========================================
// knowledgeEvolution.js
// 知识进化引擎 - 内容版本演变（Phase 39 完善版）
// ===========================================

window.LawAIApp = window.LawAIApp || {};

LawAIApp.KnowledgeEvolution = (function() {
    var _initialized = false;
    var _history = {};
    var _migrations = [];
    var _notifications = [];

    // ===========================================
    // 版本历史
    // ===========================================
    function getHistory(contentId) {
        _syncHistory();
        return _history[contentId] || [];
    }

    function recordVersion(contentId, fromVersion, toVersion, type, summary, isBreaking) {
        var entry = {
            contentId: contentId,
            fromVersion: fromVersion,
            toVersion: toVersion,
            type: type || 'minor_update',
            summary: summary || 'Version update',
            isBreaking: isBreaking || false,
            snapshot: { timestamp: new Date().toISOString() },
            createdAt: new Date().toISOString()
        };
        
        if (!_history[contentId]) _history[contentId] = [];
        _history[contentId].push(entry);
        _saveHistory();
        
        LawAIApp.EventBus?.emit?.('VersionRecorded', { entry: entry });
        return entry;
    }

    // ===========================================
    // 迁移管理
    // ===========================================
    function generateMigrationPlan(contentId, fromVersion, toVersion, summary) {
        var plan = {
            planId: 'migration_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
            contentId: contentId,
            fromVersion: fromVersion,
            toVersion: toVersion,
            summary: summary || 'Migration required',
            steps: generateMigrationSteps(fromVersion, toVersion),
            status: 'pending',
            createdAt: new Date().toISOString(),
            completedAt: null
        };
        
        _migrations.push(plan);
        _saveMigrations();
        return plan;
    }

    function generateMigrationSteps(fromVersion, toVersion) {
        var steps = [];
        var fromParts = fromVersion.split('.').map(Number);
        var toParts = toVersion.split('.').map(Number);
        
        if (toParts[0] > fromParts[0]) {
            steps.push('Major version upgrade: ' + fromVersion + ' → ' + toVersion);
        }
        if (toParts[1] > fromParts[1]) {
            steps.push('Minor version upgrade: ' + fromVersion + ' → ' + toVersion);
        }
        if (toParts[2] > fromParts[2]) {
            steps.push('Patch update: ' + fromVersion + ' → ' + toVersion);
        }
        
        if (steps.length === 0) {
            steps.push('No changes required');
        }
        
        return steps;
    }

    function getPendingMigrations() {
        _syncMigrations();
        return _migrations.filter(function(m) { return m.status === 'pending'; });
    }

    function completeMigration(planId) {
        var plan = _migrations.find(function(m) { return m.planId === planId; });
        if (!plan) return null;
        plan.status = 'completed';
        plan.completedAt = new Date().toISOString();
        _saveMigrations();
        LawAIApp.EventBus?.emit?.('MigrationCompleted', { planId: planId });
        return plan;
    }

    // ===========================================
    // 通知管理
    // ===========================================
    function notifyUpdate(entry, plan) {
        var notification = {
            id: 'notify_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
            contentId: entry.contentId,
            version: entry.toVersion,
            summary: entry.summary,
            isBreaking: entry.isBreaking,
            migrationPlan: plan,
            createdAt: new Date().toISOString(),
            acknowledged: false
        };
        
        _notifications.push(notification);
        _saveNotifications();
        LawAIApp.EventBus?.emit?.('KnowledgeUpdated', { notification: notification });
        return notification;
    }

    function acknowledgeUpdate(notificationId) {
        var notification = _notifications.find(function(n) { return n.id === notificationId; });
        if (!notification) return null;
        notification.acknowledged = true;
        _saveNotifications();
        return notification;
    }

    function getUnacknowledgedNotifications() {
        _syncNotifications();
        return _notifications.filter(function(n) { return !n.acknowledged; });
    }

    function getNotifications() {
        _syncNotifications();
        return _notifications;
    }

    // ===========================================
    // 私有方法
    // ===========================================
    function _syncHistory() {
        try {
            var stored = LawAIApp.StorageEngine?.get?.('version_history');
            if (stored) _history = stored;
        } catch (e) {}
    }

    function _saveHistory() {
        try {
            LawAIApp.StorageEngine?.set?.('version_history', _history);
        } catch (e) {}
    }

    function _syncMigrations() {
        try {
            var stored = LawAIApp.StorageEngine?.get?.('migrations');
            if (stored) _migrations = stored;
        } catch (e) {}
    }

    function _saveMigrations() {
        try {
            LawAIApp.StorageEngine?.set?.('migrations', _migrations);
        } catch (e) {}
    }

    function _syncNotifications() {
        try {
            var stored = LawAIApp.StorageEngine?.get?.('knowledge_notifications');
            if (stored) _notifications = stored;
        } catch (e) {}
    }

    function _saveNotifications() {
        try {
            LawAIApp.StorageEngine?.set?.('knowledge_notifications', _notifications);
        } catch (e) {}
    }

    // ===========================================
    // 初始化
    // ===========================================
    function init() {
        if (_initialized) return;
        _initialized = true;
        
        _syncHistory();
        _syncMigrations();
        _syncNotifications();
        
        // 监听内容发布
        LawAIApp.EventBus?.on?.('ContentPublished', function(data) {
            var contentId = data.contentId;
            var content = data.content;
            if (!content) {
                try {
                    if (LawAIApp.ContentPlatform && typeof LawAIApp.ContentPlatform.get === 'function') {
                        content = LawAIApp.ContentPlatform.get(contentId);
                    }
                } catch (e) {}
            }
            
            if (!content) return;
            
            var history = getHistory(contentId);
            var lastVersion = history.length > 0 ? history[history.length - 1] : null;
            var fromVersion = lastVersion ? lastVersion.toVersion : '0.0.0';
            var toVersion = content.version || '1.0.0';
            
            if (fromVersion !== toVersion && lastVersion) {
                var diff = compareVersions(fromVersion, toVersion);
                var summary = 'Version update: ' + fromVersion + ' → ' + toVersion;
                var isBreaking = diff.major > 0;
                
                var entry = recordVersion(contentId, fromVersion, toVersion, 
                    isBreaking ? 'major_update' : 'minor_update', summary, isBreaking);
                
                var plan = generateMigrationPlan(contentId, fromVersion, toVersion, summary);
                var notification = notifyUpdate(entry, plan);
                
                if (isBreaking) {
                    LawAIApp.EventBus?.emit?.('KnowledgeUpdated', { 
                        contentId: contentId, 
                        breaking: true,
                        notification: notification 
                    });
                }
            }
        });
        
        console.log('📈 KnowledgeEvolution initialized');
    }

    function compareVersions(from, to) {
        var fromParts = from.split('.').map(Number);
        var toParts = to.split('.').map(Number);
        
        return {
            major: toParts[0] - fromParts[0],
            minor: toParts[1] - fromParts[1],
            patch: toParts[2] - fromParts[2]
        };
    }

    setTimeout(init, 400);

    return {
        init: init,
        getHistory: getHistory,
        getMigrations: getPendingMigrations,
        acknowledgeUpdate: acknowledgeUpdate,
        getNotifications: getNotifications,
        getUnacknowledged: getUnacknowledgedNotifications,
        generateMigration: generateMigrationPlan,
        completeMigration: completeMigration,
        notifyUpdate: notifyUpdate,
        recordVersion: recordVersion
    };
})();

console.log('📈 KnowledgeEvolution V2.0 ready');
