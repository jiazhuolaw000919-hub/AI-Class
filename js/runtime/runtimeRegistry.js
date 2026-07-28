// ============================================================
// runtimeRegistry.js
// Part 49.9.2 — Runtime Registry Foundation
// Version: v4.9.9.2
// Status: Architecture Implementation
// Module: Runtime Explorer Layer — Registry
// ============================================================

window.LawAIApp = window.LawAIApp || {};
LawAIApp.Runtime = LawAIApp.Runtime || {};

/**
 * Runtime Registry
 * 
 * 职责：
 * - Register — 注册 Component
 * - Unregister — 注销 Component
 * - Discover — 发现 Components
 * - Query — 查询 Components
 * - Metadata Storage — 存储元数据
 * 
 * 安全规则：
 * - Registry 只记录 Metadata
 * - Registry 不拥有 Component
 * - Registry 不改变 Runtime Lifecycle
 * - Component Failure 不能破坏 Registry
 * 
 * 性能规则：
 * - Registry 必须轻量
 * - 禁止 Heavy Calculation
 * - 禁止 Runtime Processing
 * - 禁止 Data Collection
 */
LawAIApp.Runtime.Registry = {
    _components: {},
    _index: {
        byType: {},
        byCategory: {},
        byStatus: {},
        byVersion: {}
    },
    _initialized: false,
    _version: '4.9.9.2',

    // ============================================================
    // INITIALIZATION
    // ============================================================

    /**
     * 初始化 Registry
     */
    init: function() {
        if (this._initialized) return;
        this._initialized = true;
        console.log('📋 [RuntimeRegistry] Initialized v' + this._version);
        return this;
    },

    /**
     * 检查是否已初始化
     */
    isInitialized: function() {
        return this._initialized;
    },

    // ============================================================
    // COMPONENT TYPES
    // ============================================================

    /**
     * 支持的 Component Types
     */
    TYPES: {
        CORE: 'core',
        ENGINE: 'engine',
        SERVICE: 'service',
        API: 'api',
        PLUGIN: 'plugin',
        FRAMEWORK: 'framework',
        UTILITY: 'utility',
        CONTROLLER: 'controller'
    },

    /**
     * 支持的 Component Categories
     */
    CATEGORIES: {
        RUNTIME: 'runtime',
        GOVERNANCE: 'governance',
        PERFORMANCE: 'performance',
        INTELLIGENCE: 'intelligence',
        STATE: 'state',
        EVENT: 'event',
        TRACE: 'trace',
        KNOWLEDGE: 'knowledge',
        COGNITIVE: 'cognitive',
        SECURITY: 'security'
    },

    /**
     * 支持的 Component Status
     */
    STATUS: {
        ACTIVE: 'active',
        INACTIVE: 'inactive',
        LOADING: 'loading',
        ERROR: 'error',
        DEPRECATED: 'deprecated',
        INITIALIZING: 'initializing',
        DESTROYED: 'destroyed'
    },

    // ============================================================
    // REGISTRATION API
    // ============================================================

    /**
     * 注册 Component
     * 
     * @param {Object} component - Component 定义
     * @param {string} component.id - 唯一 ID (必需)
     * @param {string} component.name - 显示名称
     * @param {string} component.type - 类型 (TYPES)
     * @param {string} component.category - 分类 (CATEGORIES)
     * @param {string} component.version - 版本
     * @param {string} component.status - 状态 (STATUS)
     * @param {Array} component.dependencies - 依赖列表
     * @param {Object} component.api - API 接口描述
     * @param {Object} component.metadata - 额外元数据
     * @param {Function} component.lifecycle - 生命周期钩子 (可选)
     * @returns {boolean} 注册是否成功
     */
    register: function(component) {
        if (!this._initialized) this.init();

        // ── 验证 ──
        if (!component || !component.id) {
            console.warn('[RuntimeRegistry] Invalid component:', component);
            return false;
        }

        // ── 检查重复 ──
        if (this._components[component.id]) {
            console.warn('[RuntimeRegistry] Component already registered:', component.id);
            return false;
        }

        // ── 构建 Registry Entry ──
        var entry = {
            id: component.id,
            name: component.name || component.id,
            type: this._validateType(component.type),
            category: this._validateCategory(component.category),
            version: component.version || '1.0.0',
            status: this._validateStatus(component.status) || 'active',
            dependencies: component.dependencies || [],
            api: component.api || null,
            metadata: component.metadata || {},
            lifecycle: component.lifecycle || null,
            registeredAt: Date.now(),
            updatedAt: Date.now(),
            source: component.source || 'manual'
        };

        // ── 存储 ──
        this._components[component.id] = entry;

        // ── 索引 ──
        this._indexComponent(entry);

        console.log('[RuntimeRegistry] Registered: ' + entry.id + ' (' + entry.type + ' | ' + entry.category + ')');
        return true;
    },

    /**
     * 批量注册 Components
     * @param {Array} components - Component 列表
     * @returns {Object} { success: [], failed: [] }
     */
    registerAll: function(components) {
        if (!Array.isArray(components)) {
            console.warn('[RuntimeRegistry] registerAll expects array');
            return { success: [], failed: [] };
        }

        var result = { success: [], failed: [] };
        for (var i = 0; i < components.length; i++) {
            var success = this.register(components[i]);
            if (success) {
                result.success.push(components[i].id);
            } else {
                result.failed.push(components[i].id || 'unknown');
            }
        }
        return result;
    },

    /**
     * 注销 Component
     * @param {string} id - Component ID
     * @returns {boolean} 是否成功
     */
    unregister: function(id) {
        if (!this._initialized) this.init();

        var entry = this._components[id];
        if (!entry) {
            console.warn('[RuntimeRegistry] Component not found:', id);
            return false;
        }

        // ── 从索引移除 ──
        this._unindexComponent(id);

        // ── 删除 ──
        delete this._components[id];

        console.log('[RuntimeRegistry] Unregistered: ' + id);
        return true;
    },

    /**
     * 更新 Component 状态
     * @param {string} id - Component ID
     * @param {string} status - 新状态
     * @returns {boolean} 是否成功
     */
    updateStatus: function(id, status) {
        if (!this._initialized) this.init();

        var entry = this._components[id];
        if (!entry) {
            console.warn('[RuntimeRegistry] Component not found:', id);
            return false;
        }

        var newStatus = this._validateStatus(status);
        if (!newStatus) {
            console.warn('[RuntimeRegistry] Invalid status:', status);
            return false;
        }

        // ── 从旧状态索引移除 ──
        var oldStatus = entry.status;
        if (this._index.byStatus[oldStatus]) {
            var idx = this._index.byStatus[oldStatus].indexOf(id);
            if (idx !== -1) {
                this._index.byStatus[oldStatus].splice(idx, 1);
            }
        }

        // ── 更新 ──
        entry.status = newStatus;
        entry.updatedAt = Date.now();

        // ── 加入新状态索引 ──
        if (!this._index.byStatus[newStatus]) {
            this._index.byStatus[newStatus] = [];
        }
        this._index.byStatus[newStatus].push(id);

        return true;
    },

    /**
     * 更新 Component 元数据
     * @param {string} id - Component ID
     * @param {Object} metadata - 新元数据 (合并)
     * @returns {boolean} 是否成功
     */
    updateMetadata: function(id, metadata) {
        if (!this._initialized) this.init();

        var entry = this._components[id];
        if (!entry) {
            console.warn('[RuntimeRegistry] Component not found:', id);
            return false;
        }

        for (var key in metadata) {
            if (metadata.hasOwnProperty(key)) {
                entry.metadata[key] = metadata[key];
            }
        }
        entry.updatedAt = Date.now();

        return true;
    },

    // ============================================================
    // QUERY API
    // ============================================================

    /**
     * 获取 Component
     * @param {string} id - Component ID
     * @returns {Object|null} Component Entry
     */
    get: function(id) {
        if (!this._initialized) this.init();
        return this._components[id] || null;
    },

    /**
     * 获取所有 Components
     * @returns {Object} 所有 Component Entries
     */
    getAll: function() {
        if (!this._initialized) this.init();
        return this._components;
    },

    /**
     * 获取所有 Components (数组形式)
     * @returns {Array} Component 列表
     */
    getAllAsArray: function() {
        if (!this._initialized) this.init();
        var result = [];
        for (var id in this._components) {
            if (this._components.hasOwnProperty(id)) {
                result.push(this._components[id]);
            }
        }
        return result;
    },

    /**
     * 按类型查找
     * @param {string} type - Component Type
     * @returns {Array} Component 列表
     */
    findByType: function(type) {
        if (!this._initialized) this.init();
        var ids = this._index.byType[type] || [];
        return ids.map(function(id) { return this._components[id]; }.bind(this));
    },

    /**
     * 按分类查找
     * @param {string} category - Component Category
     * @returns {Array} Component 列表
     */
    findByCategory: function(category) {
        if (!this._initialized) this.init();
        var ids = this._index.byCategory[category] || [];
        return ids.map(function(id) { return this._components[id]; }.bind(this));
    },

    /**
     * 按状态查找
     * @param {string} status - Component Status
     * @returns {Array} Component 列表
     */
    findByStatus: function(status) {
        if (!this._initialized) this.init();
        var ids = this._index.byStatus[status] || [];
        return ids.map(function(id) { return this._components[id]; }.bind(this));
    },

    /**
     * 搜索 Components
     * @param {string} keyword - 搜索关键词
     * @returns {Array} 匹配的 Component 列表
     */
    search: function(keyword) {
        if (!this._initialized) this.init();
        if (!keyword || typeof keyword !== 'string') return [];

        var lowerKeyword = keyword.toLowerCase();
        var result = [];

        for (var id in this._components) {
            if (!this._components.hasOwnProperty(id)) continue;
            var entry = this._components[id];
            
            // ── 搜索 ID ──
            if (entry.id.toLowerCase().indexOf(lowerKeyword) !== -1) {
                result.push(entry);
                continue;
            }
            
            // ── 搜索 Name ──
            if (entry.name.toLowerCase().indexOf(lowerKeyword) !== -1) {
                result.push(entry);
                continue;
            }
            
            // ── 搜索 Type ──
            if (entry.type.toLowerCase().indexOf(lowerKeyword) !== -1) {
                result.push(entry);
                continue;
            }
            
            // ── 搜索 Category ──
            if (entry.category && entry.category.toLowerCase().indexOf(lowerKeyword) !== -1) {
                result.push(entry);
                continue;
            }
        }

        return result;
    },

    /**
     * 获取 Registry 统计
     * @returns {Object} 统计信息
     */
    getStats: function() {
        if (!this._initialized) this.init();

        var stats = {
            total: 0,
            byType: {},
            byCategory: {},
            byStatus: {},
            byVersion: {}
        };

        for (var id in this._components) {
            if (!this._components.hasOwnProperty(id)) continue;
            var entry = this._components[id];
            stats.total++;

            // ── 按类型 ──
            if (!stats.byType[entry.type]) stats.byType[entry.type] = 0;
            stats.byType[entry.type]++;

            // ── 按分类 ──
            if (!stats.byCategory[entry.category]) stats.byCategory[entry.category] = 0;
            stats.byCategory[entry.category]++;

            // ── 按状态 ──
            if (!stats.byStatus[entry.status]) stats.byStatus[entry.status] = 0;
            stats.byStatus[entry.status]++;

            // ── 按版本 ──
            if (!stats.byVersion[entry.version]) stats.byVersion[entry.version] = 0;
            stats.byVersion[entry.version]++;
        }

        return stats;
    },

    /**
     * 获取依赖关系图
     * @param {string} id - Component ID (可选)
     * @returns {Object} 依赖关系
     */
    getDependencyGraph: function(id) {
        if (!this._initialized) this.init();

        if (id) {
            var entry = this._components[id];
            if (!entry) return null;

            return {
                id: id,
                dependencies: entry.dependencies,
                dependents: this._findDependents(id)
            };
        }

        // ── 完整依赖图 ──
        var graph = {};
        for (var compId in this._components) {
            if (!this._components.hasOwnProperty(compId)) continue;
            var entry = this._components[compId];
            graph[compId] = {
                dependencies: entry.dependencies,
                dependents: this._findDependents(compId)
            };
        }
        return graph;
    },

    /**
     * 查找依赖者
     * @private
     */
    _findDependents: function(id) {
        var dependents = [];
        for (var compId in this._components) {
            if (!this._components.hasOwnProperty(compId)) continue;
            var entry = this._components[compId];
            if (entry.dependencies && entry.dependencies.indexOf(id) !== -1) {
                dependents.push(compId);
            }
        }
        return dependents;
    },

    // ============================================================
    // INDEX MANAGEMENT
    // ============================================================

    /**
     * 索引 Component
     * @private
     */
    _indexComponent: function(entry) {
        var id = entry.id;

        // ── 按类型 ──
        if (!this._index.byType[entry.type]) {
            this._index.byType[entry.type] = [];
        }
        if (this._index.byType[entry.type].indexOf(id) === -1) {
            this._index.byType[entry.type].push(id);
        }

        // ── 按分类 ──
        if (entry.category) {
            if (!this._index.byCategory[entry.category]) {
                this._index.byCategory[entry.category] = [];
            }
            if (this._index.byCategory[entry.category].indexOf(id) === -1) {
                this._index.byCategory[entry.category].push(id);
            }
        }

        // ── 按状态 ──
        if (!this._index.byStatus[entry.status]) {
            this._index.byStatus[entry.status] = [];
        }
        if (this._index.byStatus[entry.status].indexOf(id) === -1) {
            this._index.byStatus[entry.status].push(id);
        }

        // ── 按版本 ──
        if (!this._index.byVersion[entry.version]) {
            this._index.byVersion[entry.version] = [];
        }
        if (this._index.byVersion[entry.version].indexOf(id) === -1) {
            this._index.byVersion[entry.version].push(id);
        }
    },

    /**
     * 移除索引
     * @private
     */
    _unindexComponent: function(id) {
        for (var indexName in this._index) {
            if (!this._index.hasOwnProperty(indexName)) continue;
            var index = this._index[indexName];
            for (var key in index) {
                if (!index.hasOwnProperty(key)) continue;
                var idx = index[key].indexOf(id);
                if (idx !== -1) {
                    index[key].splice(idx, 1);
                }
            }
        }
    },

    // ============================================================
    // VALIDATORS
    // ============================================================

    /**
     * 验证 Type
     * @private
     */
    _validateType: function(type) {
        var validTypes = Object.values(this.TYPES);
        return validTypes.indexOf(type) !== -1 ? type : 'utility';
    },

    /**
     * 验证 Category
     * @private
     */
    _validateCategory: function(category) {
        var validCategories = Object.values(this.CATEGORIES);
        return validCategories.indexOf(category) !== -1 ? category : 'runtime';
    },

    /**
     * 验证 Status
     * @private
     */
    _validateStatus: function(status) {
        var validStatus = Object.values(this.STATUS);
        return validStatus.indexOf(status) !== -1 ? status : 'active';
    },

    // ============================================================
    // REGISTRY EXPORT
    // ============================================================

    /**
     * 导出 Registry 数据
     * @returns {Object} Registry 数据
     */
    export: function() {
        if (!this._initialized) this.init();

        return {
            version: this._version,
            exportedAt: Date.now(),
            components: this._components,
            stats: this.getStats()
        };
    },

    /**
     * 导入 Registry 数据 (合并)
     * @param {Object} data - Registry 数据
     * @returns {Object} 导入结果
     */
    import: function(data) {
        if (!data || !data.components) {
            console.warn('[RuntimeRegistry] Invalid import data');
            return { success: 0, failed: 0 };
        }

        var success = 0;
        var failed = 0;

        for (var id in data.components) {
            if (!data.components.hasOwnProperty(id)) continue;
            var entry = data.components[id];
            
            // ── 转换格式 ──
            var component = {
                id: entry.id,
                name: entry.name,
                type: entry.type,
                category: entry.category,
                version: entry.version,
                status: entry.status,
                dependencies: entry.dependencies || [],
                api: entry.api || null,
                metadata: entry.metadata || {},
                source: 'import'
            };

            if (this.register(component)) {
                success++;
            } else {
                failed++;
            }
        }

        console.log('[RuntimeRegistry] Imported: ' + success + ' components, ' + failed + ' failed');
        return { success: success, failed: failed };
    },

    // ============================================================
    // RESET
    // ============================================================

    /**
     * 重置 Registry
     */
    reset: function() {
        this._components = {};
        this._index = {
            byType: {},
            byCategory: {},
            byStatus: {},
            byVersion: {}
        };
        this._initialized = false;
        console.log('[RuntimeRegistry] Reset');
        return this;
    }
};

// ============================================================
// AUTO-INIT
// ============================================================

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        LawAIApp.Runtime.Registry.init();
    });
} else {
    LawAIApp.Runtime.Registry.init();
}

console.log('📋 [Part 49.9.2] Runtime Registry loaded');
console.log('   📋 API: register() | get() | getAll() | findByType() | search()');
console.log('   📊 Component Types:', Object.values(LawAIApp.Runtime.Registry.TYPES).join(', '));
console.log('   📂 Categories:', Object.values(LawAIApp.Runtime.Registry.CATEGORIES).join(', '));
