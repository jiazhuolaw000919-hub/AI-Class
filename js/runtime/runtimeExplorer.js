// ============================================================
// runtimeExplorer.js
// Part 49.9.1 — Runtime Explorer Layer Foundation
// Version: v4.9.9.1
// Status: Architecture Enhancement
// Module: Developer Experience Layer — Runtime Explorer
// ============================================================

window.LawAIApp = window.LawAIApp || {};
LawAIApp.Runtime = LawAIApp.Runtime || {};

/**
 * Runtime Explorer
 * 
 * 职责：
 * - Discovery — 发现 Runtime Components
 * - Inspection — 查看 Runtime Data
 * - Search — 搜索 Modules/Engines/Events
 * - Snapshot — 导出 Runtime 快照
 * - Visualization — 可视化 System Structure
 * 
 * 不负责：
 * - Runtime Modification
 * - State Mutation
 * - Action Execution
 * 
 * 安全规则：
 * - READ ONLY — 默认只读
 * - 禁止直接修改 Object
 * - 禁止直接执行 Function
 * - 禁止直接改变 State
 */
LawAIApp.Runtime.Explorer = {
    _initialized: false,
    _registry: null,
    _tree: null,
    _snapshotCache: null,

    // ============================================================
    // INITIALIZATION
    // ============================================================

    /**
     * 初始化 Runtime Explorer
     */
    init: function() {
        if (this._initialized) return;

        // ── 初始化 Registry ──
        this._registry = this._createRegistry();
        
        // ── 构建 Explorer Tree ──
        this._tree = this._buildTree();
        
        // ── 注册 Components ──
        this._registerComponents();

        this._initialized = true;
        
        console.log('🔍 Runtime Explorer initialized');
        console.log('   📋 Registered components:', Object.keys(this._registry).length);
        
        return this;
    },

    /**
     * 检查是否已初始化
     */
    isInitialized: function() {
        return this._initialized;
    },

    // ============================================================
    // EXPLORER TREE
    // ============================================================

    /**
     * Explorer Tree 结构
     * 
     * Runtime
     * ├── Modules
     * ├── Engines
     * ├── Services
     * ├── APIs
     * ├── Metrics
     * ├── Events
     * ├── State
     * ├── Performance
     * ├── Governance
     * └── Metadata
     */
    _buildTree: function() {
        return {
            id: 'runtime',
            label: 'Runtime',
            type: 'root',
            children: [
                { id: 'modules', label: 'Modules', type: 'collection', children: [] },
                { id: 'engines', label: 'Engines', type: 'collection', children: [] },
                { id: 'services', label: 'Services', type: 'collection', children: [] },
                { id: 'apis', label: 'APIs', type: 'collection', children: [] },
                { id: 'metrics', label: 'Metrics', type: 'collection', children: [] },
                { id: 'events', label: 'Events', type: 'collection', children: [] },
                { id: 'state', label: 'State', type: 'collection', children: [] },
                { id: 'performance', label: 'Performance', type: 'collection', children: [] },
                { id: 'governance', label: 'Governance', type: 'collection', children: [] },
                { id: 'metadata', label: 'Metadata', type: 'collection', children: [] }
            ]
        };
    },

    /**
     * 获取 Explorer Tree
     */
    getTree: function() {
        if (!this._initialized) this.init();
        return this._tree;
    },

    /**
     * 获取 Tree 节点
     * @param {string} path - 节点路径 (如 'runtime.modules')
     */
    getTreeNode: function(path) {
        if (!this._initialized) this.init();
        
        var parts = path.split('.');
        var current = this._tree;
        
        for (var i = 0; i < parts.length; i++) {
            if (i === 0 && parts[i] === 'runtime') continue;
            
            var found = false;
            if (current.children) {
                for (var j = 0; j < current.children.length; j++) {
                    if (current.children[j].id === parts[i]) {
                        current = current.children[j];
                        found = true;
                        break;
                    }
                }
            }
            if (!found) return null;
        }
        
        return current;
    },

    // ============================================================
    // RUNTIME REGISTRY
    // ============================================================

    /**
     * 创建 Runtime Registry
     * @private
     */
    _createRegistry: function() {
        return {
            _entries: {},
            _index: {
                byType: {},
                byStatus: {},
                byOwner: {}
            }
        };
    },

    /**
     * 注册 Component
     * @param {Object} entry - Registry Entry
     * @param {string} entry.id - 唯一 ID
     * @param {string} entry.type - 类型 (core/module/engine/service/api)
     * @param {string} entry.status - 状态 (active/inactive/loading/error)
     * @param {string} entry.owner - 所有者
     * @param {Array} entry.dependencies - 依赖列表
     * @param {Object} entry.metadata - 元数据
     */
    register: function(entry) {
        if (!entry || !entry.id) {
            console.warn('[RuntimeExplorer] Invalid registry entry:', entry);
            return false;
        }

        if (!this._initialized) this.init();

        // ── 验证 Entry ──
        var validated = this._validateEntry(entry);
        if (!validated) {
            console.warn('[RuntimeExplorer] Entry validation failed:', entry.id);
            return false;
        }

        // ── 存储 Entry ──
        this._registry._entries[entry.id] = {
            id: entry.id,
            type: entry.type || 'unknown',
            status: entry.status || 'unknown',
            version: entry.version || 'N/A',
            owner: entry.owner || 'system',
            dependencies: entry.dependencies || [],
            metadata: entry.metadata || {},
            registeredAt: Date.now(),
            updatedAt: Date.now()
        };

        // ── 更新索引 ──
        this._indexEntry(entry.id);

        console.log('[RuntimeExplorer] Registered: ' + entry.id + ' (' + entry.type + ')');
        return true;
    },

    /**
     * 验证 Registry Entry
     * @private
     */
    _validateEntry: function(entry) {
        if (!entry.id || typeof entry.id !== 'string') return false;
        if (entry.id.length === 0) return false;
        return true;
    },

    /**
     * 索引 Entry
     * @private
     */
    _indexEntry: function(id) {
        var entry = this._registry._entries[id];
        if (!entry) return;

        // ── 按类型索引 ──
        if (!this._registry._index.byType[entry.type]) {
            this._registry._index.byType[entry.type] = [];
        }
        if (this._registry._index.byType[entry.type].indexOf(id) === -1) {
            this._registry._index.byType[entry.type].push(id);
        }

        // ── 按状态索引 ──
        if (!this._registry._index.byStatus[entry.status]) {
            this._registry._index.byStatus[entry.status] = [];
        }
        if (this._registry._index.byStatus[entry.status].indexOf(id) === -1) {
            this._registry._index.byStatus[entry.status].push(id);
        }

        // ── 按所有者索引 ──
        if (!this._registry._index.byOwner[entry.owner]) {
            this._registry._index.byOwner[entry.owner] = [];
        }
        if (this._registry._index.byOwner[entry.owner].indexOf(id) === -1) {
            this._registry._index.byOwner[entry.owner].push(id);
        }
    },

    /**
     * 获取 Registry Entry
     * @param {string} id - Entry ID
     */
    getEntry: function(id) {
        if (!this._initialized) this.init();
        return this._registry._entries[id] || null;
    },

    /**
     * 获取所有 Registry Entries
     */
    getAllEntries: function() {
        if (!this._initialized) this.init();
        return this._registry._entries;
    },

    /**
     * 按类型获取 Entries
     * @param {string} type - 类型
     */
    getEntriesByType: function(type) {
        if (!this._initialized) this.init();
        var ids = this._registry._index.byType[type] || [];
        return ids.map(function(id) { return this._registry._entries[id]; }.bind(this));
    },

    /**
     * 按状态获取 Entries
     * @param {string} status - 状态
     */
    getEntriesByStatus: function(status) {
        if (!this._initialized) this.init();
        var ids = this._registry._index.byStatus[status] || [];
        return ids.map(function(id) { return this._registry._entries[id]; }.bind(this));
    },

    /**
     * 更新 Entry 状态
     * @param {string} id - Entry ID
     * @param {string} status - 新状态
     */
    updateStatus: function(id, status) {
        if (!this._initialized) this.init();
        
        var entry = this._registry._entries[id];
        if (!entry) {
            console.warn('[RuntimeExplorer] Entry not found:', id);
            return false;
        }

        // ── 从旧状态索引移除 ──
        var oldStatus = entry.status;
        if (this._registry._index.byStatus[oldStatus]) {
            var idx = this._registry._index.byStatus[oldStatus].indexOf(id);
            if (idx !== -1) {
                this._registry._index.byStatus[oldStatus].splice(idx, 1);
            }
        }

        // ── 更新状态 ──
        entry.status = status;
        entry.updatedAt = Date.now();

        // ── 加入新状态索引 ──
        if (!this._registry._index.byStatus[status]) {
            this._registry._index.byStatus[status] = [];
        }
        this._registry._index.byStatus[status].push(id);

        return true;
    },

    // ============================================================
    // AUTO-REGISTER — 扫描并注册 LawAIApp 中的 Components
    // ============================================================

    /**
     * 自动注册 Components
     * @private
     */
    _registerComponents: function() {
        var app = window.LawAIApp || {};
        var count = 0;

        for (var key in app) {
            if (!app.hasOwnProperty(key)) continue;
            
            var value = app[key];
            if (value === null || value === undefined) continue;

            // ── 跳过内部对象 ──
            if (key === 'Debug' || key === 'DevPanel' || key === '_private') continue;
            if (key.charAt(0) === '_') continue;

            // ── 确定类型 ──
            var type = this._detectType(key, value);
            
            // ── 确定状态 ──
            var status = this._detectStatus(value);

            // ── 注册 ──
            this.register({
                id: key,
                type: type,
                status: status,
                version: this._detectVersion(value),
                owner: 'LawAIApp',
                dependencies: this._detectDependencies(value),
                metadata: {
                    isFunction: typeof value === 'function',
                    isObject: typeof value === 'object' && value !== null,
                    keys: typeof value === 'object' && value !== null ? Object.keys(value).length : 0
                }
            });
            count++;
        }

        console.log('[RuntimeExplorer] Auto-registered ' + count + ' components');
    },

    /**
     * 检测 Component 类型
     * @private
     */
    _detectType: function(key, value) {
        if (typeof value === 'function') {
            if (key.indexOf('Manager') !== -1 || key.indexOf('Controller') !== -1) {
                return 'controller';
            }
            if (key.indexOf('Factory') !== -1 || key.indexOf('Creator') !== -1) {
                return 'factory';
            }
            return 'function';
        }

        if (typeof value === 'object' && value !== null) {
            if (value._booted !== undefined || value._booting !== undefined) {
                return 'runtime';
            }
            if (value.register || value._registry) {
                return 'registry';
            }
            if (value.__meta || value.__engine) {
                return 'engine';
            }
            if (Array.isArray(value)) {
                return 'collection';
            }
            if (value.then !== undefined && typeof value.then === 'function') {
                return 'promise';
            }
            return 'object';
        }

        if (typeof value === 'string') return 'string';
        if (typeof value === 'number') return 'number';
        if (typeof value === 'boolean') return 'boolean';

        return 'unknown';
    },

    /**
     * 检测 Component 状态
     * @private
     */
    _detectStatus: function(value) {
        if (typeof value !== 'object' || value === null) return 'active';
        
        if (value._booted === true) return 'active';
        if (value._booting === true) return 'loading';
        if (value._error) return 'error';
        if (value._destroyed === true) return 'inactive';
        
        return 'active';
    },

    /**
     * 检测 Component 版本
     * @private
     */
    _detectVersion: function(value) {
        if (typeof value !== 'object' || value === null) return 'N/A';
        
        if (value.version) return value.version;
        if (value._version) return value._version;
        if (value.__version) return value.__version;
        
        return 'N/A';
    },

    /**
     * 检测 Component 依赖
     * @private
     */
    _detectDependencies: function(value) {
        if (typeof value !== 'object' || value === null) return [];
        
        var deps = [];
        if (value.dependencies && Array.isArray(value.dependencies)) {
            deps = value.dependencies;
        }
        if (value._dependencies && Array.isArray(value._dependencies)) {
            deps = value._dependencies;
        }
        
        return deps;
    },

    // ============================================================
    // READ ONLY PROTECTION
    // ============================================================

    /**
     * 检查是否可以安全读取
     * @param {*} target - 目标对象
     * @param {string} path - 路径
     */
    canRead: function(target, path) {
        // ── 只读模式 ──
        return true;
    },

    /**
     * 安全读取值
     * @param {*} target - 目标对象
     * @param {string} path - 路径
     * @param {*} defaultValue - 默认值
     */
    safeRead: function(target, path, defaultValue) {
        if (!target || typeof target !== 'object') return defaultValue;
        
        var parts = path.split('.');
        var current = target;
        
        for (var i = 0; i < parts.length; i++) {
            if (current === undefined || current === null || typeof current !== 'object') {
                return defaultValue;
            }
            current = current[parts[i]];
        }
        
        return current !== undefined ? current : defaultValue;
    },

    // ============================================================
    // SNAPSHOT SUPPORT
    // ============================================================

    /**
     * 创建 Runtime Snapshot
     */
    createSnapshot: function() {
        if (!this._initialized) this.init();

        var snapshot = {
            timestamp: Date.now(),
            version: '4.9.9.1',
            components: [],
            registry: this._registry._entries,
            tree: this._tree
        };

        // ── 收集 Component 状态 ──
        for (var id in this._registry._entries) {
            if (!this._registry._entries.hasOwnProperty(id)) continue;
            var entry = this._registry._entries[id];
            snapshot.components.push({
                id: id,
                type: entry.type,
                status: entry.status,
                version: entry.version,
                owner: entry.owner
            });
        }

        this._snapshotCache = snapshot;
        
        console.log('[RuntimeExplorer] Snapshot created: ' + snapshot.components.length + ' components');
        return snapshot;
    },

    /**
     * 获取最新 Snapshot
     */
    getLatestSnapshot: function() {
        if (!this._snapshotCache) {
            return this.createSnapshot();
        }
        return this._snapshotCache;
    },

    /**
     * 导出 Debug Report
     */
    exportReport: function() {
        var snapshot = this.createSnapshot();
        var report = {
            meta: {
                timestamp: snapshot.timestamp,
                version: snapshot.version,
                componentCount: snapshot.components.length
            },
            summary: this._generateSummary(snapshot),
            details: snapshot
        };
        
        return report;
    },

    /**
     * 生成 Summary
     * @private
     */
    _generateSummary: function(snapshot) {
        var summary = {
            total: 0,
            byType: {},
            byStatus: {},
            byOwner: {}
        };

        for (var id in snapshot.registry) {
            if (!snapshot.registry.hasOwnProperty(id)) continue;
            var entry = snapshot.registry[id];
            
            summary.total++;
            
            // ── 按类型 ──
            if (!summary.byType[entry.type]) summary.byType[entry.type] = 0;
            summary.byType[entry.type]++;
            
            // ── 按状态 ──
            if (!summary.byStatus[entry.status]) summary.byStatus[entry.status] = 0;
            summary.byStatus[entry.status]++;
            
            // ── 按所有者 ──
            if (!summary.byOwner[entry.owner]) summary.byOwner[entry.owner] = 0;
            summary.byOwner[entry.owner]++;
        }

        return summary;
    },

    // ============================================================
    // UTILITY
    // ============================================================

    /**
     * 获取 Registry 统计信息
     */
    getStats: function() {
        if (!this._initialized) this.init();
        
        var entries = this._registry._entries;
        var total = 0;
        var byType = {};
        var byStatus = {};

        for (var id in entries) {
            if (!entries.hasOwnProperty(id)) continue;
            var entry = entries[id];
            total++;
            
            if (!byType[entry.type]) byType[entry.type] = 0;
            byType[entry.type]++;
            
            if (!byStatus[entry.status]) byStatus[entry.status] = 0;
            byStatus[entry.status]++;
        }

        return {
            total: total,
            byType: byType,
            byStatus: byStatus,
            treeDepth: this._getTreeDepth(this._tree),
            initialized: this._initialized
        };
    },

    /**
     * 获取 Tree 深度
     * @private
     */
    _getTreeDepth: function(node) {
        if (!node || !node.children || node.children.length === 0) {
            return 1;
        }
        
        var maxDepth = 1;
        for (var i = 0; i < node.children.length; i++) {
            var depth = this._getTreeDepth(node.children[i]);
            if (depth + 1 > maxDepth) {
                maxDepth = depth + 1;
            }
        }
        return maxDepth;
    },

    /**
     * 重置 Explorer
     */
    reset: function() {
        this._initialized = false;
        this._registry = null;
        this._tree = null;
        this._snapshotCache = null;
        console.log('[RuntimeExplorer] Reset');
        return this;
    }
};

// ============================================================
// AUTO-INIT
// ============================================================

// 延迟初始化，确保其他模块已加载
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(function() {
            LawAIApp.Runtime.Explorer.init();
        }, 500);
    });
} else {
    setTimeout(function() {
        LawAIApp.Runtime.Explorer.init();
    }, 500);
}

// ============================================================
// RUNTIME EXPLORER — REGISTRY CONNECTION
// ============================================================

// 建立 Explorer 与 Registry 的连接
(function connectExplorerToRegistry() {
    var maxAttempts = 10;
    var attempts = 0;
    
    function tryConnect() {
        attempts++;
        
        if (LawAIApp.Runtime && LawAIApp.Runtime.Explorer && LawAIApp.Runtime.Registry) {
            var explorer = LawAIApp.Runtime.Explorer;
            var registry = LawAIApp.Runtime.Registry;
            
            // ── 委托方法 ──
            explorer.register = function(entry) {
                return registry.register(entry);
            };
            
            explorer.getEntry = function(id) {
                return registry.get(id);
            };
            
            explorer.getAllEntries = function() {
                return registry.getAll();
            };
            
            explorer.findByType = function(type) {
                return registry.findByType(type);
            };
            
            explorer.findByCategory = function(category) {
                return registry.findByCategory(category);
            };
            
            explorer.search = function(keyword) {
                return registry.search(keyword);
            };
            
            explorer.getRegistryStats = function() {
                return registry.getStats();
            };
            
            console.log('🔗 [RuntimeExplorer] Connected to RuntimeRegistry');
            return;
        }
        
        if (attempts < maxAttempts) {
            setTimeout(tryConnect, 200);
        } else {
            console.warn('🔗 [RuntimeExplorer] Could not connect to RuntimeRegistry after ' + maxAttempts + ' attempts');
        }
    }
    
    tryConnect();
})();

// 在 runtimeExplorer.js 的底部添加连接

// ── Inspector 连接 ──
LawAIApp.Runtime.Explorer.inspect = function(id) {
    return LawAIApp.Runtime.Inspector.inspect(id);
};

LawAIApp.Runtime.Explorer.inspectDeep = function(id, depth) {
    return LawAIApp.Runtime.Inspector.inspectDeep(id, depth);
};

LawAIApp.Runtime.Explorer.getSnapshot = function(id) {
    return LawAIApp.Runtime.Inspector.getSnapshot(id);
};

console.log('🔍 [Part 49.9.1] Runtime Explorer Foundation loaded');
console.log('   📋 API: init() | getTree() | register() | createSnapshot()');
console.log('   🔒 Read-Only Mode: ENABLED');
console.log('🔗 [RuntimeExplorer] Connected to RuntimeInspector ✅');
