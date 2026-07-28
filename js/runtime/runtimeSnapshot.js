// ============================================================
// runtimeSnapshot.js
// Part 49.9.5 — Runtime Snapshot & Export System
// Version: v4.9.9.5
// Status: Architecture Completion
// Module: Runtime Explorer Layer — Snapshot
// ============================================================

window.LawAIApp = window.LawAIApp || {};
LawAIApp.Runtime = LawAIApp.Runtime || {};
LawAIApp.Runtime.Snapshot = LawAIApp.Runtime.Snapshot || {};

/**
 * Runtime Snapshot & Export System
 * 
 * 职责：
 * - Snapshot Collector — 收集 Runtime 数据
 * - Snapshot Builder — 构建 Snapshot
 * - Export Manager — 导出 Snapshot (JSON/Markdown)
 * 
 * 安全规则：
 * - Snapshot Read Only
 * - Sensitive Runtime Data must be filtered
 * - Export cannot modify system
 */
LawAIApp.Runtime.Snapshot = {
    _initialized: false,
    _snapshots: [],
    _maxSnapshots: 20,
    _exportFormats: ['json', 'markdown', 'debug'],

    // ============================================================
    // INITIALIZATION
    // ============================================================

    init: function() {
        if (this._initialized) return;
        this._initialized = true;
        console.log('📸 [RuntimeSnapshot] Initialized v4.9.9.5');
        console.log('   📋 Formats: ' + this._exportFormats.join(', '));
        return this;
    },

    isInitialized: function() {
        return this._initialized;
    },

    // ============================================================
    // SNAPSHOT COLLECTOR
    // ============================================================

    /**
     * 收集 Runtime 数据
     * @param {Object} options - 收集选项
     * @param {boolean} options.includeMetrics - 是否包含 Metrics
     * @param {boolean} options.includeEvents - 是否包含 Events
     * @param {boolean} options.includeState - 是否包含 State
     * @param {boolean} options.includeGovernance - 是否包含 Governance
     * @param {boolean} options.filterSensitive - 是否过滤敏感数据
     * @returns {Object} 收集的数据
     */
    collect: function(options) {
        if (!this._initialized) this.init();

        options = options || {};
        var data = {
            timestamp: Date.now(),
            runtimeVersion: this._getRuntimeVersion(),
            components: this._collectComponents(),
            metrics: options.includeMetrics !== false ? this._collectMetrics() : null,
            events: options.includeEvents !== false ? this._collectEvents() : null,
            state: options.includeState !== false ? this._collectState() : null,
            governance: options.includeGovernance !== false ? this._collectGovernance() : null,
            performance: this._collectPerformance(),
            health: this._collectHealth()
        };

        // ── 过滤敏感数据 ──
        if (options.filterSensitive !== false) {
            data = this._filterSensitive(data);
        }

        return data;
    },

    /**
     * 构建 Snapshot
     * @param {Object} options - 构建选项
     * @returns {Object} Snapshot
     */
    build: function(options) {
        if (!this._initialized) this.init();

        var collected = this.collect(options);

        var snapshot = {
            id: this._generateSnapshotId(),
            timestamp: collected.timestamp,
            version: '4.9.9.5',
            runtimeVersion: collected.runtimeVersion,
            summary: this._buildSummary(collected),
            data: collected,
            metadata: {
                exportedBy: 'Runtime Explorer',
                format: 'snapshot',
                includes: this._getIncludesList(options)
            }
        };

        // ── 验证 Snapshot ──
        if (!this._validateSnapshot(snapshot)) {
            console.warn('[RuntimeSnapshot] Snapshot validation failed');
            return null;
        }

        // ── 存储 Snapshot ──
        this._storeSnapshot(snapshot);

        console.log('[RuntimeSnapshot] Snapshot built: ' + snapshot.id);
        console.log('   📋 Components: ' + snapshot.summary.componentCount);
        console.log('   📊 Health Score: ' + snapshot.summary.healthScore + '%');

        return snapshot;
    },

    // ============================================================
    // COLLECTORS — 各模块数据收集
    // ============================================================

    /**
     * 收集 Components
     * @private
     */
    _collectComponents: function() {
        var components = [];
        var registry = LawAIApp.Runtime && LawAIApp.Runtime.Registry;

        if (registry && registry.getAll) {
            var all = registry.getAll();
            for (var id in all) {
                if (!all.hasOwnProperty(id)) continue;
                var entry = all[id];
                components.push({
                    id: entry.id,
                    name: entry.name,
                    type: entry.type,
                    category: entry.category,
                    version: entry.version,
                    status: entry.status,
                    dependencies: entry.dependencies || [],
                    owner: entry.owner || 'system'
                });
            }
        }

        return components;
    },

    /**
     * 收集 Metrics
     * @private
     */
    _collectMetrics: function() {
        var metrics = {
            collected: [],
            values: {},
            count: 0
        };

        try {
            var perf = LawAIApp.Performance;
            if (perf && perf.report) {
                var report = perf.report();
                if (report && report.metrics) {
                    for (var key in report.metrics) {
                        if (report.metrics.hasOwnProperty(key)) {
                            metrics.values[key] = report.metrics[key];
                            metrics.collected.push(key);
                        }
                    }
                }
                if (report && report.health) {
                    metrics.healthScore = report.health.score || 0;
                }
            }
        } catch(e) { /* ignore */ }

        // ── 从 Metrics Health ──
        try {
            var health = LawAIApp.RuntimeMetricsHealth;
            if (health && health.getHealth) {
                var data = health.getHealth();
                if (data) {
                    metrics.totalMetrics = data.totalMetrics || 0;
                    metrics.collectedMetrics = data.collectedMetrics || 0;
                    metrics.coverage = data.coverageScore || 0;
                }
            }
        } catch(e) { /* ignore */ }

        metrics.count = metrics.collected.length;
        return metrics;
    },

    /**
     * 收集 Events
     * @private
     */
    _collectEvents: function() {
        var events = {
            total: 0,
            recent: [],
            insights: [],
            categories: {}
        };

        try {
            var eventSystem = LawAIApp.Events;
            if (eventSystem) {
                if (typeof eventSystem.getEventCount === 'function') {
                    events.total = eventSystem.getEventCount() || 0;
                }
                if (typeof eventSystem.getTimelineEntries === 'function') {
                    var entries = eventSystem.getTimelineEntries();
                    if (entries && entries.length > 0) {
                        events.recent = entries.slice(-10).reverse();
                    }
                }
                if (typeof eventSystem.getInsights === 'function') {
                    var insights = eventSystem.getInsights();
                    if (insights && insights.length > 0) {
                        events.insights = insights.slice(0, 5);
                    }
                }
                if (typeof eventSystem.getStatistics === 'function') {
                    var stats = eventSystem.getStatistics();
                    if (stats && stats.categories) {
                        events.categories = stats.categories;
                    }
                }
            }
        } catch(e) { /* ignore */ }

        return events;
    },

    /**
     * 收集 State
     * @private
     */
    _collectState: function() {
        var state = {
            states: [],
            count: 0,
            syncStatus: 'unknown',
            conflicts: 0
        };

        try {
            var registry = LawAIApp.StateRegistry;
            if (registry && typeof registry.getAll === 'function') {
                var all = registry.getAll();
                if (all && all.length > 0) {
                    state.states = all.slice(0, 20);
                    state.count = all.length;
                }
            }

            var engine = LawAIApp.StateSyncEngine;
            if (engine && typeof engine.getAll === 'function') {
                var allStates = engine.getAll();
                if (allStates) {
                    state.syncStatus = Object.keys(allStates).length > 0 ? 'active' : 'idle';
                }
            }

            var resolver = LawAIApp.StateConflictResolver;
            if (resolver && typeof resolver.getConflictCount === 'function') {
                state.conflicts = resolver.getConflictCount() || 0;
            }
        } catch(e) { /* ignore */ }

        return state;
    },

    /**
     * 收集 Governance
     * @private
     */
    _collectGovernance: function() {
        var governance = {
            policies: 0,
            permissions: 0,
            validators: 0,
            safetyLocks: 0,
            aiLevel: 'N/A',
            violations: 0,
            healthScore: 0
        };

        try {
            var policy = LawAIApp.Policy;
            if (policy && typeof policy.getHealth === 'function') {
                var ph = policy.getHealth();
                governance.policies = ph.activePolicies || 0;
                governance.healthScore = Math.max(governance.healthScore, ph.healthScore || 0);
            }

            var perm = LawAIApp.Permissions;
            if (perm && typeof perm.getHealth === 'function') {
                var pmh = perm.getHealth();
                governance.permissions = pmh.activePermissions || 0;
                governance.healthScore = Math.max(governance.healthScore, pmh.healthScore || 0);
            }

            var valid = LawAIApp.Validation;
            if (valid && typeof valid.getHealth === 'function') {
                var vh = valid.getHealth();
                governance.validators = vh.validators || 0;
                governance.healthScore = Math.max(governance.healthScore, vh.healthScore || 0);
            }

            var safety = LawAIApp.Safety;
            if (safety && typeof safety.getHealth === 'function') {
                var sh = safety.getHealth();
                governance.safetyLocks = sh.activeLocks || 0;
                governance.healthScore = Math.max(governance.healthScore, sh.healthScore || 0);
            }

            var aiGov = LawAIApp.AIGovernance;
            if (aiGov && typeof aiGov.getAILevel === 'function') {
                var ai = aiGov.getAILevel();
                governance.aiLevel = ai.name || 'N/A';
            }

            if (policy && typeof policy.getViolations === 'function') {
                var violations = policy.getViolations();
                governance.violations = violations ? violations.length : 0;
            }
        } catch(e) { /* ignore */ }

        return governance;
    },

    /**
     * 收集 Performance
     * @private
     */
    _collectPerformance: function() {
        var performance = {
            score: 0,
            status: 'unknown',
            bootDuration: 'N/A',
            totalModules: 0,
            totalRecords: 0,
            averageDuration: 'N/A',
            slowestModule: 'N/A',
            fastestModule: 'N/A',
            hasData: false
        };

        try {
            var perf = LawAIApp.Performance;
            if (perf && typeof perf.report === 'function') {
                var report = perf.report();
                if (report) {
                    if (report.health) {
                        performance.score = report.health.score || 0;
                        performance.status = report.health.status || 'unknown';
                    }
                    if (report.summary) {
                        performance.bootDuration = report.summary.bootDuration || 'N/A';
                        performance.totalModules = report.summary.totalModules || 0;
                        performance.totalRecords = report.summary.totalRecords || 0;
                        performance.averageDuration = report.summary.averageDuration || 'N/A';
                        performance.slowestModule = report.summary.slowestModule || 'N/A';
                        performance.fastestModule = report.summary.fastestModule || 'N/A';
                        performance.hasData = !!report.summary.hasData;
                    }
                }
            }
        } catch(e) { /* ignore */ }

        return performance;
    },

    /**
     * 收集 Health
     * @private
     */
    _collectHealth: function() {
        var health = {
            overall: 0,
            components: 0,
            healthyComponents: 0,
            warningComponents: 0,
            errorComponents: 0,
            details: {}
        };

        try {
            var registry = LawAIApp.Runtime && LawAIApp.Runtime.Registry;
            if (registry && registry.getAll) {
                var all = registry.getAll();
                for (var id in all) {
                    if (!all.hasOwnProperty(id)) continue;
                    var entry = all[id];
                    health.components++;
                    
                    if (entry.status === 'active' || entry.status === 'healthy') {
                        health.healthyComponents++;
                    } else if (entry.status === 'error') {
                        health.errorComponents++;
                    } else {
                        health.warningComponents++;
                    }
                }
            }

            // ── 计算整体健康分 ──
            if (health.components > 0) {
                health.overall = Math.round((health.healthyComponents / health.components) * 100);
            }

            // ── Governance Health ──
            var governance = this._collectGovernance();
            health.details.governance = governance.healthScore;

            // ── Performance Health ──
            var perf = this._collectPerformance();
            health.details.performance = perf.score;

            // ── 综合健康 ──
            var scores = [
                health.overall,
                health.details.governance || 0,
                health.details.performance || 0
            ];
            var validScores = scores.filter(function(s) { return s > 0; });
            if (validScores.length > 0) {
                var total = validScores.reduce(function(a, b) { return a + b; }, 0);
                health.overall = Math.round(total / validScores.length);
            }

        } catch(e) { /* ignore */ }

        return health;
    },

    // ============================================================
    // SNAPSHOT BUILDER
    // ============================================================

    /**
     * 构建 Summary
     * @private
     */
    _buildSummary: function(data) {
        return {
            componentCount: data.components ? data.components.length : 0,
            metricCount: data.metrics ? data.metrics.count : 0,
            eventCount: data.events ? data.events.total : 0,
            stateCount: data.state ? data.state.count : 0,
            healthScore: data.health ? data.health.overall : 0,
            timestamp: data.timestamp
        };
    },

    /**
     * 验证 Snapshot
     * @private
     */
    _validateSnapshot: function(snapshot) {
        if (!snapshot) return false;
        if (!snapshot.id) return false;
        if (!snapshot.timestamp) return false;
        if (!snapshot.data) return false;
        if (!snapshot.summary) return false;
        return true;
    },

    /**
     * 生成 Snapshot ID
     * @private
     */
    _generateSnapshotId: function() {
        var now = new Date();
        var timestamp = now.getFullYear() +
            String(now.getMonth() + 1).padStart(2, '0') +
            String(now.getDate()).padStart(2, '0') + '_' +
            String(now.getHours()).padStart(2, '0') +
            String(now.getMinutes()).padStart(2, '0') +
            String(now.getSeconds()).padStart(2, '0');
        return 'snapshot_' + timestamp;
    },

    /**
     * 存储 Snapshot
     * @private
     */
    _storeSnapshot: function(snapshot) {
        this._snapshots.push(snapshot);
        if (this._snapshots.length > this._maxSnapshots) {
            this._snapshots.shift();
        }
    },

    /**
     * 获取 Includes 列表
     * @private
     */
    _getIncludesList: function(options) {
        var includes = ['components', 'performance', 'health'];
        if (options.includeMetrics !== false) includes.push('metrics');
        if (options.includeEvents !== false) includes.push('events');
        if (options.includeState !== false) includes.push('state');
        if (options.includeGovernance !== false) includes.push('governance');
        return includes;
    },

    /**
     * 获取 Runtime Version
     * @private
     */
    _getRuntimeVersion: function() {
        var composer = LawAIApp.SystemComposer;
        if (composer && composer.version) {
            return composer.version;
        }
        return 'N/A';
    },

    // ============================================================
    // SENSITIVE DATA FILTER
    // ============================================================

    /**
     * 过滤敏感数据
     * @private
     */
    _filterSensitive: function(data) {
        // ── 克隆数据 ──
        var filtered = JSON.parse(JSON.stringify(data));

        // ── 过滤敏感字段 ──
        var sensitiveKeys = ['password', 'token', 'secret', 'key', 'auth', 'credential', 'private'];

        function filterObj(obj) {
            if (!obj || typeof obj !== 'object') return;
            for (var key in obj) {
                if (!obj.hasOwnProperty(key)) continue;
                var lowerKey = key.toLowerCase();
                for (var i = 0; i < sensitiveKeys.length; i++) {
                    if (lowerKey.indexOf(sensitiveKeys[i]) !== -1) {
                        obj[key] = '[FILTERED]';
                        break;
                    }
                }
                if (typeof obj[key] === 'object') {
                    filterObj(obj[key]);
                }
            }
        }

        filterObj(filtered);
        return filtered;
    },

    // ============================================================
    // EXPORT MANAGER
    // ============================================================

    /**
     * 导出 Snapshot
     * @param {Object} options - 导出选项
     * @param {string} options.format - 格式 (json | markdown | debug)
     * @param {Object} options.snapshot - 自定义 Snapshot (可选)
     * @param {boolean} options.download - 是否自动下载
     * @returns {string|Object} 导出的内容
     */
    export: function(options) {
        if (!this._initialized) this.init();

        options = options || {};
        var format = options.format || 'json';
        var snapshot = options.snapshot || this.build(options);
        var result = null;

        if (!snapshot) {
            console.warn('[RuntimeSnapshot] No snapshot to export');
            return null;
        }

        switch(format) {
            case 'json':
                result = this._exportJSON(snapshot);
                break;
            case 'markdown':
                result = this._exportMarkdown(snapshot);
                break;
            case 'debug':
                result = this._exportDebug(snapshot);
                break;
            default:
                console.warn('[RuntimeSnapshot] Unknown format: ' + format);
                return null;
        }

        // ── 自动下载 ──
        if (options.download !== false) {
            this._download(result, format, snapshot.id);
        }

        return result;
    },

    /**
     * 导出 JSON
     * @private
     */
    _exportJSON: function(snapshot) {
        return JSON.stringify(snapshot, null, 2);
    },

    /**
     * 导出 Markdown
     * @private
     */
    _exportMarkdown: function(snapshot) {
        var lines = [];
        var s = snapshot;

        // ── Header ──
        lines.push('# Runtime Snapshot Report');
        lines.push('');
        lines.push('**Generated:** ' + new Date(s.timestamp).toISOString());
        lines.push('**Snapshot ID:** `' + s.id + '`');
        lines.push('**Runtime Version:** ' + s.runtimeVersion);
        lines.push('');

        // ── Summary ──
        lines.push('## 📊 Summary');
        lines.push('');
        lines.push('| Metric | Value |');
        lines.push('|--------|-------|');
        lines.push('| Components | ' + s.summary.componentCount + ' |');
        lines.push('| Metrics | ' + s.summary.metricCount + ' |');
        lines.push('| Events | ' + s.summary.eventCount + ' |');
        lines.push('| State Entries | ' + s.summary.stateCount + ' |');
        lines.push('| Health Score | ' + s.summary.healthScore + '% |');
        lines.push('');

        // ── Health ──
        if (s.data.health) {
            lines.push('## 🏥 Health Status');
            lines.push('');
            lines.push('| Status | Count |');
            lines.push('|--------|-------|');
            lines.push('| ✅ Healthy | ' + s.data.health.healthyComponents + ' |');
            lines.push('| ⚠️ Warning | ' + s.data.health.warningComponents + ' |');
            lines.push('| ❌ Error | ' + s.data.health.errorComponents + ' |');
            lines.push('| **Overall** | **' + s.data.health.overall + '%** |');
            lines.push('');
        }

        // ── Components ──
        if (s.data.components && s.data.components.length > 0) {
            lines.push('## 🧩 Components');
            lines.push('');
            lines.push('| ID | Type | Category | Status | Version |');
            lines.push('|----|------|----------|--------|---------|');
            for (var i = 0; i < s.data.components.length; i++) {
                var c = s.data.components[i];
                var statusIcon = c.status === 'active' || c.status === 'healthy' ? '✅' :
                               c.status === 'error' ? '❌' : '⚠️';
                lines.push('| `' + c.id + '` | ' + c.type + ' | ' + c.category + ' | ' + statusIcon + ' ' + c.status + ' | ' + c.version + ' |');
            }
            lines.push('');
        }

        // ── Performance ──
        if (s.data.performance && s.data.performance.hasData) {
            lines.push('## ⚡ Performance');
            lines.push('');
            lines.push('| Metric | Value |');
            lines.push('|--------|-------|');
            lines.push('| Score | ' + s.data.performance.score + '% |');
            lines.push('| Status | ' + s.data.performance.status + ' |');
            lines.push('| Boot Duration | ' + s.data.performance.bootDuration + ' |');
            lines.push('| Modules | ' + s.data.performance.totalModules + ' |');
            lines.push('| Records | ' + s.data.performance.totalRecords + ' |');
            lines.push('| Average | ' + s.data.performance.averageDuration + ' |');
            lines.push('| Slowest | ' + s.data.performance.slowestModule + ' |');
            lines.push('| Fastest | ' + s.data.performance.fastestModule + ' |');
            lines.push('');
        }

        // ── Governance ──
        if (s.data.governance) {
            lines.push('## 🏛️ Governance');
            lines.push('');
            lines.push('| Metric | Value |');
            lines.push('|--------|-------|');
            lines.push('| Policies | ' + s.data.governance.policies + ' |');
            lines.push('| Permissions | ' + s.data.governance.permissions + ' |');
            lines.push('| Validators | ' + s.data.governance.validators + ' |');
            lines.push('| Safety Locks | ' + s.data.governance.safetyLocks + ' |');
            lines.push('| AI Level | ' + s.data.governance.aiLevel + ' |');
            lines.push('| Violations | ' + (s.data.governance.violations > 0 ? '⚠️ ' + s.data.governance.violations : '✅ None') + ' |');
            lines.push('');

            if (s.data.governance.violations > 0) {
                lines.push('⚠️ **Violations Detected!** Please review governance status.');
                lines.push('');
            }
        }

        // ── Footer ──
        lines.push('---');
        lines.push('');
        lines.push('*Report generated by Runtime Explorer v4.9.9.5*');
        lines.push('*' + new Date().toISOString() + '*');

        return lines.join('\n');
    },

    /**
     * 导出 Debug Report
     * @private
     */
    _exportDebug: function(snapshot) {
        var debug = {
            meta: {
                id: snapshot.id,
                timestamp: snapshot.timestamp,
                version: snapshot.version,
                runtimeVersion: snapshot.runtimeVersion
            },
            summary: snapshot.summary,
            health: snapshot.data.health,
            componentCount: snapshot.data.components ? snapshot.data.components.length : 0,
            hasMetrics: !!snapshot.data.metrics,
            hasEvents: !!snapshot.data.events,
            hasState: !!snapshot.data.state,
            hasGovernance: !!snapshot.data.governance
        };

        // ── 添加组件状态分布 ──
        if (snapshot.data.components) {
            var statusMap = {};
            for (var i = 0; i < snapshot.data.components.length; i++) {
                var status = snapshot.data.components[i].status;
                if (!statusMap[status]) statusMap[status] = 0;
                statusMap[status]++;
            }
            debug.statusDistribution = statusMap;
        }

        return debug;
    },

    // ============================================================
    // DOWNLOAD
    // ============================================================

    /**
     * 下载 Snapshot
     * @private
     */
    _download: function(content, format, id) {
        var extension = format === 'json' ? 'json' : (format === 'markdown' ? 'md' : 'txt');
        var mimeType = format === 'json' ? 'application/json' : (format === 'markdown' ? 'text/markdown' : 'text/plain');
        var filename = id + '.' + extension;

        var blob = new Blob([content], { type: mimeType + ';charset=utf-8' });
        var url = URL.createObjectURL(blob);

        var link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setTimeout(function() {
            URL.revokeObjectURL(url);
        }, 1000);

        console.log('[RuntimeSnapshot] Downloaded: ' + filename);
    },

    // ============================================================
    // SNAPSHOT MANAGEMENT
    // ============================================================

    /**
     * 获取所有 Snapshots
     * @returns {Array} Snapshot 列表
     */
    getSnapshots: function() {
        if (!this._initialized) this.init();
        return this._snapshots;
    },

    /**
     * 获取最新的 Snapshot
     * @returns {Object|null} 最新 Snapshot
     */
    getLatestSnapshot: function() {
        if (!this._initialized) this.init();
        if (this._snapshots.length === 0) return null;
        return this._snapshots[this._snapshots.length - 1];
    },

    /**
     * 获取 Snapshot 详情
     * @param {string} id - Snapshot ID
     * @returns {Object|null} Snapshot
     */
    getSnapshot: function(id) {
        if (!this._initialized) this.init();
        for (var i = 0; i < this._snapshots.length; i++) {
            if (this._snapshots[i].id === id) {
                return this._snapshots[i];
            }
        }
        return null;
    },

    /**
     * 清除 Snapshots
     */
    clearSnapshots: function() {
        this._snapshots = [];
        console.log('[RuntimeSnapshot] Snapshots cleared');
        return this;
    },

    // ============================================================
    // STATS
    // ============================================================

    /**
     * 获取 Snapshot 统计
     * @returns {Object} 统计信息
     */
    getStats: function() {
        if (!this._initialized) this.init();

        return {
            totalSnapshots: this._snapshots.length,
            maxSnapshots: this._maxSnapshots,
            formats: this._exportFormats,
            initialized: this._initialized
        };
    },

    /**
     * 重置 Snapshot 系统
     */
    reset: function() {
        this._snapshots = [];
        this._initialized = false;
        console.log('📸 [RuntimeSnapshot] Reset');
        return this;
    }
};

// ============================================================
// AUTO-INIT
// ============================================================

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        LawAIApp.Runtime.Snapshot.init();
    });
} else {
    LawAIApp.Runtime.Snapshot.init();
}

console.log('📸 [Part 49.9.5] Runtime Snapshot & Export System loaded');
console.log('   📋 API: build() | export() | getSnapshots() | getLatestSnapshot()');
console.log('   📁 Formats: ' + LawAIApp.Runtime.Snapshot._exportFormats.join(', '));
console.log('   🔒 Read-only: ENABLED');
