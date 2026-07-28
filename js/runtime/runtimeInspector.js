// ============================================================
// runtimeInspector.js
// Part 49.9.3 — Runtime Inspector Engine
// Version: v4.9.9.3
// Status: Architecture Implementation
// Module: Runtime Explorer Layer — Inspector
// ============================================================

window.LawAIApp = window.LawAIApp || {};
LawAIApp.Runtime = LawAIApp.Runtime || {};
LawAIApp.Runtime.Inspector = LawAIApp.Runtime.Inspector || {};

/**
 * Runtime Inspector Engine
 * 
 * 职责：
 * - Component Lookup — 查找 Component
 * - Metadata Reading — 读取元数据
 * - Dependency Analysis — 依赖分析
 * - API Discovery — API 发现
 * - Status Inspection — 状态检查
 * - Snapshot Generation — 快照生成
 * 
 * 安全规则：
 * - Inspector 只能读取
 * - 禁止调用 Component Function
 * - 禁止修改 Runtime State
 * - Snapshot 必须安全隔离
 */
LawAIApp.Runtime.Inspector = {
    _initialized: false,
    _snapshotCache: {},
    _maxSnapshots: 50,

    // ============================================================
    // INITIALIZATION
    // ============================================================

    init: function() {
        if (this._initialized) return;
        this._initialized = true;
        console.log('🔬 [RuntimeInspector] Initialized v4.9.9.3');
        return this;
    },

    isInitialized: function() {
        return this._initialized;
    },

    // ============================================================
    // CORE API — Component Lookup & Inspection
    // ============================================================

    /**
     * 检查 Component
     * @param {string} id - Component ID
     * @returns {Object|null} Inspector Result
     */
    inspect: function(id) {
        if (!this._initialized) this.init();

        try {
            // ── 1. 查找 Component ──
            var component = this._lookupComponent(id);
            if (!component) {
                return this._createNotFoundResult(id);
            }

            // ── 2. 构建 Inspector Result ──
            var result = {
                identity: this._inspectIdentity(component),
                status: this._inspectStatus(component),
                metadata: this._inspectMetadata(component),
                dependencies: this._inspectDependencies(component),
                apis: this._inspectAPIs(component),
                events: this._inspectEvents(component),
                metrics: this._inspectMetrics(component),
                snapshot: this._createSnapshot(component),
                inspectedAt: Date.now()
            };

            return result;

        } catch (err) {
            console.warn('[RuntimeInspector] Inspection failed for ' + id + ':', err);
            return this._createErrorResult(id, err.message);
        }
    },

    /**
     * 深度检查 Component (包括嵌套属性)
     * @param {string} id - Component ID
     * @param {number} depth - 递归深度
     * @returns {Object|null} 深度检查结果
     */
    inspectDeep: function(id, depth) {
        if (!this._initialized) this.init();

        depth = depth || 2;
        var result = this.inspect(id);
        if (!result || result.status === 'not_found') return result;

        // ── 递归检查依赖 ──
        if (depth > 0 && result.dependencies && result.dependencies.list) {
            var deps = result.dependencies.list;
            result.dependencies.details = [];
            for (var i = 0; i < Math.min(deps.length, 5); i++) {
                var depResult = this.inspectDeep(deps[i], depth - 1);
                if (depResult) {
                    result.dependencies.details.push({
                        id: deps[i],
                        status: depResult.status,
                        identity: depResult.identity
                    });
                }
            }
        }

        return result;
    },

    /**
     * 批量检查 Components
     * @param {Array} ids - Component IDs
     * @returns {Object} 批量检查结果
     */
    inspectBatch: function(ids) {
        if (!this._initialized) this.init();

        if (!Array.isArray(ids)) {
            return { error: 'ids must be an array' };
        }

        var results = {};
        for (var i = 0; i < ids.length; i++) {
            results[ids[i]] = this.inspect(ids[i]);
        }
        return results;
    },

    // ============================================================
    // COMPONENT LOOKUP
    // ============================================================

    /**
     * 查找 Component
     * @private
     * @param {string} id - Component ID
     * @returns {Object|null} Component 对象
     */
    _lookupComponent: function(id) {
        // ── 1. 从 Registry 查找 ──
        var registry = LawAIApp.Runtime && LawAIApp.Runtime.Registry;
        if (registry && registry.get) {
            var entry = registry.get(id);
            if (entry) {
                return entry;
            }
        }

        // ── 2. 从 LawAIApp 查找 ──
        var app = window.LawAIApp || {};
        if (app[id] !== undefined) {
            return {
                id: id,
                source: 'LawAIApp',
                value: app[id],
                type: typeof app[id]
            };
        }

        // ── 3. 从 window 查找 ──
        if (window[id] !== undefined && id !== 'window' && id !== 'document') {
            return {
                id: id,
                source: 'window',
                value: window[id],
                type: typeof window[id]
            };
        }

        return null;
    },

    // ============================================================
    // INSPECTION METHODS
    // ============================================================

    /**
     * 检查 Identity
     * @private
     */
    _inspectIdentity: function(component) {
        var identity = {
            id: component.id || 'unknown',
            name: component.name || component.id || 'unknown',
            type: component.type || 'unknown',
            category: component.category || 'unknown',
            version: component.version || 'N/A',
            owner: component.owner || 'system'
        };

        // ── 如果是 Registry Entry ──
        if (component.id && component.metadata) {
            identity.source = 'registry';
            identity.registeredAt = component.registeredAt;
            identity.updatedAt = component.updatedAt;
        }

        // ── 如果是直接对象 ──
        if (component.value && typeof component.value === 'object') {
            var val = component.value;
            if (val._version || val.version) {
                identity.version = val._version || val.version;
            }
            if (val.__type || val._type) {
                identity.type = val.__type || val._type;
            }
        }

        return identity;
    },

    /**
     * 检查 Status
     * @private
     */
    _inspectStatus: function(component) {
        var status = {
            state: 'unknown',
            health: 'unknown',
            healthScore: 0,
            lastUpdate: null,
            errors: 0,
            warnings: 0,
            uptime: 0
        };

        // ── 从 Registry Entry ──
        if (component.status) {
            status.state = component.status;
        }

        // ── 从对象值 ──
        if (component.value && typeof component.value === 'object') {
            var val = component.value;
            if (val._booted === true) {
                status.state = 'active';
                status.health = 'healthy';
                status.healthScore = 100;
            } else if (val._booting === true) {
                status.state = 'loading';
                status.health = 'loading';
                status.healthScore = 50;
            } else if (val._error) {
                status.state = 'error';
                status.health = 'unhealthy';
                status.healthScore = 0;
                status.errors = 1;
            }

            if (val._bootTimestamp) {
                status.uptime = Date.now() - val._bootTimestamp;
            }

            if (val._warnings && Array.isArray(val._warnings)) {
                status.warnings = val._warnings.length;
            }
        }

        // ── 从 Health API ──
        if (component.value && typeof component.value.getHealth === 'function') {
            try {
                var health = component.value.getHealth();
                if (health) {
                    status.health = health.status || status.health;
                    status.healthScore = health.healthScore || health.score || status.healthScore;
                    status.errors = health.errors || status.errors;
                    status.warnings = health.warnings || status.warnings;
                }
            } catch(e) { /* ignore */ }
        }

        return status;
    },

    /**
     * 检查 Metadata
     * @private
     */
    _inspectMetadata: function(component) {
        var metadata = {
            keys: [],
            size: 0,
            hasData: false,
            details: {}
        };

        // ── 从 Registry Entry ──
        if (component.metadata) {
            metadata.details = component.metadata;
            metadata.hasData = true;
            metadata.keys = Object.keys(component.metadata);
            metadata.size = metadata.keys.length;
        }

        // ── 从对象值 ──
        if (component.value && typeof component.value === 'object') {
            var val = component.value;
            var keys = Object.keys(val);
            metadata.keys = metadata.keys.concat(keys);
            metadata.size = metadata.keys.length;
            metadata.hasData = true;

            // 提取重要字段
            var important = {};
            var importantKeys = ['version', '_version', '__version', 'status', '_status', 'config', '_config', 'options', '_options'];
            for (var i = 0; i < importantKeys.length; i++) {
                var key = importantKeys[i];
                if (val[key] !== undefined) {
                    important[key] = val[key];
                }
            }
            if (Object.keys(important).length > 0) {
                metadata.important = important;
            }
        }

        return metadata;
    },

    /**
     * 检查 Dependencies
     * @private
     */
    _inspectDependencies: function(component) {
        var deps = {
            list: [],
            count: 0,
            graph: null,
            circular: false
        };

        // ── 从 Registry Entry ──
        if (component.dependencies && Array.isArray(component.dependencies)) {
            deps.list = component.dependencies;
            deps.count = component.dependencies.length;
        }

        // ── 从对象值 ──
        if (component.value && typeof component.value === 'object') {
            var val = component.value;
            if (val.dependencies && Array.isArray(val.dependencies)) {
                deps.list = deps.list.concat(val.dependencies);
                deps.count = deps.list.length;
            }
            if (val._dependencies && Array.isArray(val._dependencies)) {
                deps.list = deps.list.concat(val._dependencies);
                deps.count = deps.list.length;
            }
        }

        // ── 去重 ──
        if (deps.list.length > 0) {
            deps.list = deps.list.filter(function(v, i, a) {
                return a.indexOf(v) === i;
            });
            deps.count = deps.list.length;
        }

        // ── 检查循环依赖 ──
        if (deps.count > 0) {
            deps.graph = this._buildDependencyGraph(deps.list, component.id);
            deps.circular = this._hasCircularDependency(deps.graph);
        }

        return deps;
    },

    /**
     * 检查 APIs
     * @private
     */
    _inspectAPIs: function(component) {
        var apis = {
            methods: [],
            properties: [],
            count: 0,
            hasAPIs: false
        };

        if (!component.value || typeof component.value !== 'object') {
            return apis;
        }

        var val = component.value;

        // ── 收集方法 ──
        for (var key in val) {
            if (!val.hasOwnProperty(key)) continue;
            if (typeof val[key] === 'function') {
                // 检查是否是公开方法 (不以 _ 开头)
                if (key.charAt(0) !== '_') {
                    apis.methods.push({
                        name: key,
                        type: 'method',
                        params: this._getFunctionParams(val[key])
                    });
                }
            } else if (typeof val[key] !== 'function' && key.charAt(0) !== '_') {
                // 公开属性
                apis.properties.push({
                    name: key,
                    type: typeof val[key],
                    value: this._safeStringify(val[key])
                });
            }
        }

        apis.count = apis.methods.length + apis.properties.length;
        apis.hasAPIs = apis.count > 0;

        return apis;
    },

    /**
     * 检查 Events
     * @private
     */
    _inspectEvents: function(component) {
        var events = {
            emits: [],
            consumes: [],
            count: 0,
            hasEvents: false
        };

        // ── 从对象值 ──
        if (component.value && typeof component.value === 'object') {
            var val = component.value;

            // 检查 _events (自定义)
            if (val._events && Array.isArray(val._events)) {
                events.emits = val._events;
                events.count += val._events.length;
            }

            // 检查 _listens (自定义)
            if (val._listens && Array.isArray(val._listens)) {
                events.consumes = val._listens;
                events.count += val._listens.length;
            }

            // 检查 EventBus 方法
            if (val.emit && typeof val.emit === 'function') {
                events.emits.push('(dynamic via .emit)');
                events.count++;
            }
            if (val.on && typeof val.on === 'function') {
                events.consumes.push('(dynamic via .on)');
                events.count++;
            }
        }

        // ── 从 Registry Entry ──
        if (component.metadata && component.metadata.events) {
            var metaEvents = component.metadata.events;
            if (metaEvents.emits) {
                events.emits = events.emits.concat(metaEvents.emits);
                events.count += metaEvents.emits.length;
            }
            if (metaEvents.consumes) {
                events.consumes = events.consumes.concat(metaEvents.consumes);
                events.count += metaEvents.consumes.length;
            }
        }

        // ── 去重 ──
        events.emits = events.emits.filter(function(v, i, a) { return a.indexOf(v) === i; });
        events.consumes = events.consumes.filter(function(v, i, a) { return a.indexOf(v) === i; });
        events.count = events.emits.length + events.consumes.length;
        events.hasEvents = events.count > 0;

        return events;
    },

    /**
     * 检查 Metrics
     * @private
     */
    _inspectMetrics: function(component) {
        var metrics = {
            available: [],
            values: {},
            count: 0,
            hasMetrics: false
        };

        // ── 从 Performance API ──
        var perf = LawAIApp.Performance;
        if (perf && perf.report) {
            try {
                var report = perf.report();
                if (report && report.metrics) {
                    for (var key in report.metrics) {
                        if (report.metrics.hasOwnProperty(key)) {
                            metrics.available.push(key);
                            metrics.values[key] = report.metrics[key];
                        }
                    }
                }
            } catch(e) { /* ignore */ }
        }

        // ── 从 Metrics Collector ──
        var collector = LawAIApp.RuntimeMetricsCollector;
        if (collector && collector.getMetric) {
            try {
                // 获取特定 metric
                var prefix = component.id.toLowerCase();
                var metricValue = collector.getMetric(prefix + '.status');
                if (metricValue !== undefined) {
                    metrics.values[prefix + '.status'] = metricValue;
                    metrics.available.push(prefix + '.status');
                }
            } catch(e) { /* ignore */ }
        }

        metrics.count = metrics.available.length;
        metrics.hasMetrics = metrics.count > 0;

        return metrics;
    },

    // ============================================================
    // SNAPSHOT SYSTEM
    // ============================================================

    /**
     * 创建 Snapshot
     * @private
     */
    _createSnapshot: function(component) {
        var snapshot = {
            id: component.id || 'unknown',
            timestamp: Date.now(),
            readOnly: true,
            data: null
        };

        // ── 安全地获取数据 ──
        if (component.value && typeof component.value === 'object') {
            // 只提取可序列化的数据
            snapshot.data = this._safeExtract(component.value);
        } else if (component.value !== undefined) {
            snapshot.data = this._safeStringify(component.value);
        }

        // ── 存储 Snapshot ──
        this._storeSnapshot(component.id, snapshot);

        return snapshot;
    },

    /**
     * 获取 Component 的 Snapshot
     * @param {string} id - Component ID
     * @returns {Object|null} Snapshot
     */
    getSnapshot: function(id) {
        if (!this._initialized) this.init();

        var cache = this._snapshotCache[id];
        if (cache && cache.length > 0) {
            return cache[cache.length - 1];
        }

        // ── 如果没有，创建一个 ──
        var component = this._lookupComponent(id);
        if (component) {
            return this._createSnapshot(component);
        }

        return null;
    },

    /**
     * 获取 Snapshot 历史
     * @param {string} id - Component ID
     * @param {number} limit - 返回条数
     * @returns {Array} Snapshot 列表
     */
    getSnapshotHistory: function(id, limit) {
        if (!this._initialized) this.init();

        var cache = this._snapshotCache[id] || [];
        if (limit) {
            return cache.slice(-limit);
        }
        return cache;
    },

    /**
     * 存储 Snapshot
     * @private
     */
    _storeSnapshot: function(id, snapshot) {
        if (!this._snapshotCache[id]) {
            this._snapshotCache[id] = [];
        }

        this._snapshotCache[id].push(snapshot);

        // ── 限制数量 ──
        if (this._snapshotCache[id].length > this._maxSnapshots) {
            this._snapshotCache[id].shift();
        }
    },

    // ============================================================
    // DEPENDENCY GRAPH
    // ============================================================

    /**
     * 构建依赖图
     * @private
     */
    _buildDependencyGraph: function(deps, id) {
        var graph = {};
        for (var i = 0; i < deps.length; i++) {
            var dep = deps[i];
            graph[dep] = {
                type: 'dependency',
                source: id
            };
        }
        return graph;
    },

    /**
     * 检测循环依赖
     * @private
     */
    _hasCircularDependency: function(graph) {
        if (!graph || Object.keys(graph).length === 0) return false;

        // ── 简单检测：检查是否有自依赖 ──
        for (var key in graph) {
            if (graph.hasOwnProperty(key)) {
                // 递归检测 (简化版)
                var visited = {};
                if (this._detectCycle(graph, key, visited)) {
                    return true;
                }
            }
        }
        return false;
    },

    /**
     * 循环检测辅助
     * @private
     */
    _detectCycle: function(graph, node, visited) {
        if (visited[node]) return true;
        visited[node] = true;

        var deps = graph[node];
        if (deps && deps.dependencies) {
            for (var i = 0; i < deps.dependencies.length; i++) {
                if (this._detectCycle(graph, deps.dependencies[i], visited)) {
                    return true;
                }
            }
        }

        visited[node] = false;
        return false;
    },

    // ============================================================
    // UTILITY — 安全检查
    // ============================================================

    /**
     * 安全提取数据 (只提取可序列化的)
     * @private
     */
    _safeExtract: function(obj) {
        if (!obj || typeof obj !== 'object') return null;

        var result = {};
        var safeKeys = ['id', 'name', 'version', 'status', 'type', 'category', 'owner', 'config', 'options', 'metadata'];

        for (var i = 0; i < safeKeys.length; i++) {
            var key = safeKeys[i];
            if (obj[key] !== undefined) {
                result[key] = this._safeStringify(obj[key]);
            }
        }

        return result;
    },

    /**
     * 安全字符串化
     * @private
     */
    _safeStringify: function(value) {
        if (value === null || value === undefined) return null;
        if (typeof value === 'function') return '[Function]';
        if (typeof value === 'symbol') return '[Symbol]';
        if (typeof value === 'object') {
            try {
                return JSON.parse(JSON.stringify(value));
            } catch(e) {
                return '[Unserializable Object]';
            }
        }
        return value;
    },

    /**
     * 获取函数参数
     * @private
     */
    _getFunctionParams: function(func) {
        if (typeof func !== 'function') return [];
        var str = func.toString();
        var match = str.match(/\(([^)]*)\)/);
        if (!match) return [];
        return match[1].split(',').map(function(p) { return p.trim(); }).filter(function(p) { return p.length > 0; });
    },

    // ============================================================
    // RESULT BUILDERS
    // ============================================================

    /**
     * 创建 NotFound 结果
     * @private
     */
    _createNotFoundResult: function(id) {
        return {
            identity: { id: id, name: id, type: 'unknown', category: 'unknown', version: 'N/A', owner: 'unknown' },
            status: { state: 'not_found', health: 'unknown', healthScore: 0, errors: 0, warnings: 0 },
            metadata: { keys: [], size: 0, hasData: false, details: {} },
            dependencies: { list: [], count: 0, circular: false },
            apis: { methods: [], properties: [], count: 0, hasAPIs: false },
            events: { emits: [], consumes: [], count: 0, hasEvents: false },
            metrics: { available: [], values: {}, count: 0, hasMetrics: false },
            snapshot: null,
            inspectedAt: Date.now(),
            status: 'not_found'
        };
    },

    /**
     * 创建 Error 结果
     * @private
     */
    _createErrorResult: function(id, message) {
        return {
            identity: { id: id, name: id, type: 'error', category: 'error', version: 'N/A', owner: 'unknown' },
            status: { state: 'error', health: 'error', healthScore: 0, errors: 1, warnings: 0 },
            metadata: { keys: [], size: 0, hasData: false, details: {} },
            dependencies: { list: [], count: 0, circular: false },
            apis: { methods: [], properties: [], count: 0, hasAPIs: false },
            events: { emits: [], consumes: [], count: 0, hasEvents: false },
            metrics: { available: [], values: {}, count: 0, hasMetrics: false },
            snapshot: null,
            inspectedAt: Date.now(),
            status: 'error',
            error: message
        };
    },

    // ============================================================
    // METRICS
    // ============================================================

    /**
     * 获取 Inspector 统计
     * @returns {Object} 统计信息
     */
    getStats: function() {
        if (!this._initialized) this.init();

        var totalSnapshots = 0;
        for (var id in this._snapshotCache) {
            if (this._snapshotCache.hasOwnProperty(id)) {
                totalSnapshots += this._snapshotCache[id].length;
            }
        }

        return {
            snapshotCount: totalSnapshots,
            cachedComponents: Object.keys(this._snapshotCache).length,
            maxSnapshots: this._maxSnapshots,
            initialized: this._initialized
        };
    },

    /**
     * 重置 Inspector
     */
    reset: function() {
        this._snapshotCache = {};
        this._initialized = false;
        console.log('🔬 [RuntimeInspector] Reset');
        return this;
    }
};

// ============================================================
// AUTO-INIT
// ============================================================

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        LawAIApp.Runtime.Inspector.init();
    });
} else {
    LawAIApp.Runtime.Inspector.init();
}

console.log('🔬 [Part 49.9.3] Runtime Inspector Engine loaded');
console.log('   📋 API: inspect() | inspectDeep() | inspectBatch() | getSnapshot()');
console.log('   🔒 Read-only mode: ENABLED');
console.log('   📸 Snapshot support: ACTIVE');
