// ===========================================
// storageAudit.js
// 本地存储审计 - 检查命名一致性、孤儿数据（Season 1.5 Part H 最终版）
// ===========================================

window.LawAIApp = window.LawAIApp || {};
LawAIApp.Debug = LawAIApp.Debug || {};

LawAIApp.Debug.StorageAudit = {
    /**
     * 审计所有 LocalStorage 键
     */
    audit: function() {
        var report = [];
        var knownPrefixes = [
            'lawai_progress', 'lawai_completedLessons', 'lawai_streakData',
            'lawai_allLessons', 'lawai_secondBrain', 'lawai_reviewQueue',
            'lawai_achievements', 'lawai_favorites', 'lawai_bookmarks',
            'lawai_xp_data', 'lawai_xp_history', 'lawai_skill_',
            'lawai_goals', 'lawai_projects', 'lawai_portfolio',
            'lawai_content_', 'lawai_career_', 'lawai_learning_',
            'lawai_workspace_', 'lawai_daily_plan', 'lawai_memory_',
            'lawai_practice_', 'lawai_resource_', 'lawai_pack_',
            'lawai_boot_report', 'lawai_current_theme', 'lawai_darkMode',
            'lawai_identity_profile', 'lawai_current_session',
            'lawai_mentor_', 'lawai_habit_', 'lawai_analytics_',
            'lawai_insights', 'lawai_recommendations'
        ];

        for (var i = 0; i < localStorage.length; i++) {
            var key = localStorage.key(i);
            if (key && key.startsWith('lawai_')) {
                var isKnown = knownPrefixes.some(function(prefix) {
                    return key.startsWith(prefix);
                });
                report.push({ key: key, known: isKnown });
            }
        }

        var orphanKeys = report.filter(function(r) { return !r.known; }).map(function(r) { return r.key; });
        return {
            totalKeys: report.length,
            orphanKeys: orphanKeys,
            clean: orphanKeys.length === 0,
            keys: report
        };
    },

    /**
     * 清理孤儿数据
     */
    cleanOrphans: function() {
        var result = this.audit();
        var removed = 0;
        result.orphanKeys.forEach(function(key) {
            try {
                localStorage.removeItem(key);
                removed++;
            } catch (e) {
                console.warn('Failed to remove:', key, e);
            }
        });
        console.log('🧹 Removed ' + removed + ' orphan keys');
        return removed;
    },

    /**
     * 获取存储大小
     */
    getSize: function() {
        var total = 0;
        for (var i = 0; i < localStorage.length; i++) {
            var key = localStorage.key(i);
            if (key && key.startsWith('lawai_')) {
                total += localStorage.getItem(key)?.length || 0;
            }
        }
        return this._formatSize(total);
    },

    _formatSize: function(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    },

    /**
     * 导出所有数据
     */
    exportAll: function() {
        var data = {};
        for (var i = 0; i < localStorage.length; i++) {
            var key = localStorage.key(i);
            if (key && key.startsWith('lawai_')) {
                try {
                    data[key] = JSON.parse(localStorage.getItem(key));
                } catch (e) {
                    data[key] = localStorage.getItem(key);
                }
            }
        }
        var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'lawai-storage-backup-' + new Date().toISOString().slice(0,10) + '.json';
        a.click();
        URL.revokeObjectURL(url);
        return data;
    },

    /**
     * 打印审计报告（控制台）
     */
    printReport: function() {
        var report = this.audit();
        console.log('📊 ===== STORAGE AUDIT =====');
        console.log('📁 Total keys:', report.totalKeys);
        console.log('🗑️ Orphan keys:', report.orphanKeys.length);
        console.log('📦 Size:', this.getSize());
        if (report.orphanKeys.length > 0) {
            console.log('🔍 Orphan keys:', report.orphanKeys);
        }
        console.log('============================');
        return report;
    }
};

// 兼容别名（DevPanel 可以直接调用）
LawAIApp.StorageAudit = LawAIApp.Debug.StorageAudit;

console.log('🔍 StorageAudit ready');
