// ============================================================
// runtimeSearch.js
// Part 49.9.4 — Runtime Search & Discovery Engine
// Version: v4.9.9.4
// Status: Architecture Implementation
// Module: Runtime Explorer Layer — Search
// ============================================================

window.LawAIApp = window.LawAIApp || {};
LawAIApp.Runtime = LawAIApp.Runtime || {};
LawAIApp.Runtime.Search = LawAIApp.Runtime.Search || {};

/**
 * Runtime Search & Discovery Engine
 * 
 * 职责：
 * - Index Creation — 创建索引
 * - Keyword Matching — 关键词匹配
 * - Filtering — 过滤
 * - Ranking — 排序
 * - Relationship Discovery — 关系发现
 * 
 * 安全规则：
 * - Search Only Read Metadata
 * - Search 不执行 Runtime Logic
 * - Search 不影响 Runtime Performance
 * 
 * 性能规则：
 * - Index 可以缓存
 * - Refresh 由 Registry 更新触发
 * - 禁止每次 Search 扫描全部 Runtime
 */
LawAIApp.Runtime.Search = {
    _initialized: false,
    _index: null,
    _lastIndexUpdate: 0,
    _indexVersion: 0,
    _cacheTTL: 30000, // 30 seconds
    _maxResults: 50,

    // ============================================================
    // INITIALIZATION
    // ============================================================

    init: function() {
        if (this._initialized) return;
        this._buildIndex();
        this._initialized = true;
        console.log('🔎 [RuntimeSearch] Initialized v4.9.9.4');
        console.log('   📋 Indexed ' + this._getIndexSize() + ' entries');
        return this;
    },

    isInitialized: function() {
        return this._initialized;
    },

    // ============================================================
    // SEARCH API
    // ============================================================

    /**
     * 搜索 Components
     * @param {string} keyword - 搜索关键词
     * @param {Object} options - 搜索选项
     * @param {string} options.type - 过滤类型
     * @param {string} options.category - 过滤分类
     * @param {number} options.limit - 返回数量限制
     * @param {boolean} options.fuzzy - 是否启用模糊搜索
     * @returns {Array} 搜索结果
     */
    search: function(keyword, options) {
        if (!this._initialized) this.init();

        if (!keyword || typeof keyword !== 'string' || keyword.trim().length === 0) {
            return [];
        }

        options = options || {};
        var limit = options.limit || this._maxResults;
        var fuzzy = options.fuzzy !== undefined ? options.fuzzy : true;

        // ── 刷新索引 (如果过期) ──
        this._refreshIndexIfNeeded();

        var keywordLower = keyword.toLowerCase().trim();
        var results = [];
        var indexData = this._index;

        // ── 遍历索引 ──
        for (var id in indexData) {
            if (!indexData.hasOwnProperty(id)) continue;
            var entry = indexData[id];

            // ── 类型过滤 ──
            if (options.type && entry.type !== options.type) continue;

            // ── 分类过滤 ──
            if (options.category && entry.category !== options.category) continue;

            // ── 计算匹配度 ──
            var score = this._calculateScore(entry, keywordLower, fuzzy);

            if (score > 0) {
                results.push({
                    id: id,
                    name: entry.name,
                    type: entry.type,
                    category: entry.category,
                    version: entry.version,
                    status: entry.status,
                    score: score,
                    matches: this._getMatches(entry, keywordLower)
                });
            }
        }

        // ── 按分数排序 ──
        results.sort(function(a, b) { return b.score - a.score; });

        // ── 限制数量 ──
        if (results.length > limit) {
            results = results.slice(0, limit);
        }

        return results;
    },

    /**
     * 按类型查找
     * @param {string} type - Component Type
     * @returns {Array} Component 列表
     */
    findByType: function(type) {
        if (!this._initialized) this.init();
        this._refreshIndexIfNeeded();

        var results = [];
        var indexData = this._index;

        for (var id in indexData) {
            if (!indexData.hasOwnProperty(id)) continue;
            var entry = indexData[id];
            if (entry.type === type) {
                results.push(this._enrichResult(entry));
            }
        }

        return results;
    },

    /**
     * 按分类查找
     * @param {string} category - Component Category
     * @returns {Array} Component 列表
     */
    findByCategory: function(category) {
        if (!this._initialized) this.init();
        this._refreshIndexIfNeeded();

        var results = [];
        var indexData = this._index;

        for (var id in indexData) {
            if (!indexData.hasOwnProperty(id)) continue;
            var entry = indexData[id];
            if (entry.category === category) {
                results.push(this._enrichResult(entry));
            }
        }

        return results;
    },

    /**
     * 查找相关 Components
     * @param {string} id - Component ID
     * @param {number} depth - 关系深度
     * @returns {Object} 关系图
     */
    findRelated: function(id, depth) {
        if (!this._initialized) this.init();
        this._refreshIndexIfNeeded();

        depth = depth || 1;
        var indexData = this._index;

        // ── 查找目标 ──
        var target = indexData[id];
        if (!target) {
            return { error: 'Component not found: ' + id };
        }

        var result = {
            id: id,
            name: target.name,
            type: target.type,
            status: target.status,
            relationships: {
                dependencies: [],
                dependents: [],
                related: []
            },
            depth: depth
        };

        // ── 查找依赖 ──
        if (target.dependencies && target.dependencies.length > 0) {
            for (var i = 0; i < target.dependencies.length; i++) {
                var depId = target.dependencies[i];
                var depEntry = indexData[depId];
                if (depEntry) {
                    result.relationships.dependencies.push({
                        id: depId,
                        name: depEntry.name,
                        type: depEntry.type,
                        status: depEntry.status
                    });
                }
            }
        }

        // ── 查找依赖者 ──
        var dependents = [];
        for (var key in indexData) {
            if (!indexData.hasOwnProperty(key)) continue;
            var entry = indexData[key];
            if (entry.dependencies && entry.dependencies.indexOf(id) !== -1) {
                dependents.push({
                    id: key,
                    name: entry.name,
                    type: entry.type,
                    status: entry.status
                });
            }
        }
        result.relationships.dependents = dependents;

        // ── 深度查找 ──
        if (depth > 1) {
            var related = [];
            for (var j = 0; j < dependents.length; j++) {
                var subRelations = this.findRelated(dependents[j].id, depth - 1);
                if (subRelations && !subRelations.error) {
                    related.push(subRelations);
                }
            }
            result.relationships.related = related;
        }

        return result;
    },

    /**
     * 查找依赖
     * @param {string} id - Component ID
     * @returns {Array} 依赖列表
     */
    findDependencies: function(id) {
        if (!this._initialized) this.init();
        this._refreshIndexIfNeeded();

        var indexData = this._index;
        var target = indexData[id];

        if (!target) {
            return { error: 'Component not found: ' + id };
        }

        var results = [];
        if (target.dependencies && target.dependencies.length > 0) {
            for (var i = 0; i < target.dependencies.length; i++) {
                var depId = target.dependencies[i];
                var depEntry = indexData[depId];
                if (depEntry) {
                    results.push(this._enrichResult(depEntry));
                } else {
                    results.push({
                        id: depId,
                        name: depId,
                        type: 'unknown',
                        status: 'not_found'
                    });
                }
            }
        }

        return results;
    },

    /**
     * 查找依赖者
     * @param {string} id - Component ID
     * @returns {Array} 依赖者列表
     */
    findDependents: function(id) {
        if (!this._initialized) this.init();
        this._refreshIndexIfNeeded();

        var indexData = this._index;
        var results = [];

        for (var key in indexData) {
            if (!indexData.hasOwnProperty(key)) continue;
            var entry = indexData[key];
            if (entry.dependencies && entry.dependencies.indexOf(id) !== -1) {
                results.push(this._enrichResult(entry));
            }
        }

        return results;
    },

    // ============================================================
    // SEARCH INDEX
    // ============================================================

    /**
     * 构建索引
     * @private
     */
    _buildIndex: function() {
        this._index = {};
        this._indexVersion++;

        var registry = LawAIApp.Runtime && LawAIApp.Runtime.Registry;
        if (!registry) {
            console.warn('[RuntimeSearch] Registry not available, index empty');
            return;
        }

        var components = registry.getAll ? registry.getAll() : {};
        var count = 0;

        for (var id in components) {
            if (!components.hasOwnProperty(id)) continue;
            var entry = components[id];

            this._index[id] = {
                id: id,
                name: entry.name || id,
                type: entry.type || 'unknown',
                category: entry.category || 'runtime',
                version: entry.version || 'N/A',
                status: entry.status || 'active',
                description: entry.metadata?.description || '',
                dependencies: entry.dependencies || [],
                apis: this._extractAPIs(entry),
                events: this._extractEvents(entry),
                metadata: entry.metadata || {},
                indexedAt: Date.now()
            };
            count++;
        }

        this._lastIndexUpdate = Date.now();

        console.log('[RuntimeSearch] Index built: ' + count + ' entries');
    },

    /**
     * 刷新索引 (如果过期)
     * @private
     */
    _refreshIndexIfNeeded: function() {
        var now = Date.now();
        if (now - this._lastIndexUpdate > this._cacheTTL) {
            this._buildIndex();
        }
    },

    /**
     * 获取索引大小
     * @private
     */
    _getIndexSize: function() {
        if (!this._index) return 0;
        return Object.keys(this._index).length;
    },

    // ============================================================
    // SCORING & MATCHING
    // ============================================================

    /**
     * 计算匹配分数
     * @private
     */
    _calculateScore: function(entry, keyword, fuzzy) {
        var score = 0;

        // ── 1. ID 完全匹配 (最高权重) ──
        if (entry.id.toLowerCase() === keyword) {
            score += 100;
        }

        // ── 2. ID 包含关键词 ──
        if (entry.id.toLowerCase().indexOf(keyword) !== -1) {
            score += 50;
        }

        // ── 3. Name 包含关键词 ──
        var nameLower = entry.name.toLowerCase();
        if (nameLower === keyword) {
            score += 80;
        } else if (nameLower.indexOf(keyword) !== -1) {
            score += 40;
        }

        // ── 4. Type 匹配 ──
        if (entry.type.toLowerCase().indexOf(keyword) !== -1) {
            score += 20;
        }

        // ── 5. Category 匹配 ──
        if (entry.category && entry.category.toLowerCase().indexOf(keyword) !== -1) {
            score += 15;
        }

        // ── 6. API 匹配 ──
        if (entry.apis && entry.apis.length > 0) {
            for (var i = 0; i < entry.apis.length; i++) {
                if (entry.apis[i].toLowerCase().indexOf(keyword) !== -1) {
                    score += 10;
                }
            }
        }

        // ── 7. Event 匹配 ──
        if (entry.events && entry.events.length > 0) {
            for (var j = 0; j < entry.events.length; j++) {
                if (entry.events[j].toLowerCase().indexOf(keyword) !== -1) {
                    score += 8;
                }
            }
        }

        // ── 8. 描述匹配 ──
        if (entry.description && entry.description.toLowerCase().indexOf(keyword) !== -1) {
            score += 12;
        }

        // ── 9. 依赖匹配 ──
        if (entry.dependencies && entry.dependencies.length > 0) {
            for (var k = 0; k < entry.dependencies.length; k++) {
                if (entry.dependencies[k].toLowerCase().indexOf(keyword) !== -1) {
                    score += 6;
                }
            }
        }

        // ── 模糊匹配 (降低权重) ──
        if (fuzzy && score === 0) {
            // 检查是否部分匹配
            var parts = keyword.split(' ');
            for (var p = 0; p < parts.length; p++) {
                if (parts[p].length > 2) {
                    if (entry.id.toLowerCase().indexOf(parts[p]) !== -1) {
                        score += 5;
                    }
                    if (entry.name.toLowerCase().indexOf(parts[p]) !== -1) {
                        score += 4;
                    }
                }
            }
        }

        return score;
    },

    /**
     * 获取匹配信息
     * @private
     */
    _getMatches: function(entry, keyword) {
        var matches = [];

        if (entry.id.toLowerCase().indexOf(keyword) !== -1) {
            matches.push('id');
        }
        if (entry.name.toLowerCase().indexOf(keyword) !== -1) {
            matches.push('name');
        }
        if (entry.type.toLowerCase().indexOf(keyword) !== -1) {
            matches.push('type');
        }
        if (entry.category && entry.category.toLowerCase().indexOf(keyword) !== -1) {
            matches.push('category');
        }
        if (entry.apis && entry.apis.length > 0) {
            for (var i = 0; i < entry.apis.length; i++) {
                if (entry.apis[i].toLowerCase().indexOf(keyword) !== -1) {
                    matches.push('api:' + entry.apis[i]);
                }
            }
        }
        if (entry.events && entry.events.length > 0) {
            for (var j = 0; j < entry.events.length; j++) {
                if (entry.events[j].toLowerCase().indexOf(keyword) !== -1) {
                    matches.push('event:' + entry.events[j]);
                }
            }
        }

        return matches;
    },

    /**
     * 提取 APIs
     * @private
     */
    _extractAPIs: function(entry) {
        var apis = [];

        // ── 从 metadata ──
        if (entry.metadata && entry.metadata.apis) {
            if (Array.isArray(entry.metadata.apis)) {
                return entry.metadata.apis;
            }
        }

        // ── 从 Registry entry ──
        if (entry.api) {
            if (typeof entry.api === 'object') {
                apis = Object.keys(entry.api);
            } else if (typeof entry.api === 'string') {
                apis = [entry.api];
            }
        }

        return apis;
    },

    /**
     * 提取 Events
     * @private
     */
    _extractEvents: function(entry) {
        var events = [];

        if (entry.metadata && entry.metadata.events) {
            if (Array.isArray(entry.metadata.events)) {
                return entry.metadata.events;
            }
        }

        return events;
    },

    /**
     * 丰富结果
     * @private
     */
    _enrichResult: function(entry) {
        return {
            id: entry.id,
            name: entry.name,
            type: entry.type,
            category: entry.category,
            version: entry.version,
            status: entry.status,
            description: entry.description,
            dependencies: entry.dependencies,
            apis: entry.apis,
            events: entry.events
        };
    },

    // ============================================================
    // DISCOVERY — 探索模式
    // ============================================================

    /**
     * 发现所有 Components (按类型分组)
     * @returns {Object} 分组结果
     */
    discoverAll: function() {
        if (!this._initialized) this.init();
        this._refreshIndexIfNeeded();

        var result = {
            byType: {},
            byCategory: {},
            byStatus: {},
            total: 0
        };

        var indexData = this._index;

        for (var id in indexData) {
            if (!indexData.hasOwnProperty(id)) continue;
            var entry = indexData[id];
            result.total++;

            // ── 按类型 ──
            if (!result.byType[entry.type]) {
                result.byType[entry.type] = [];
            }
            result.byType[entry.type].push(this._enrichResult(entry));

            // ── 按分类 ──
            if (entry.category) {
                if (!result.byCategory[entry.category]) {
                    result.byCategory[entry.category] = [];
                }
                result.byCategory[entry.category].push(this._enrichResult(entry));
            }

            // ── 按状态 ──
            if (!result.byStatus[entry.status]) {
                result.byStatus[entry.status] = [];
            }
            result.byStatus[entry.status].push(this._enrichResult(entry));
        }

        return result;
    },

    /**
     * 探索特定类型的所有 Components
     * @param {string} type - Component Type
     * @returns {Array} Component 列表
     */
    discoverByType: function(type) {
        return this.findByType(type);
    },

    /**
     * 探索特定分类的所有 Components
     * @param {string} category - Component Category
     * @returns {Array} Component 列表
     */
    discoverByCategory: function(category) {
        return this.findByCategory(category);
    },

    // ============================================================
    // SUGGESTIONS — 自动补全
    // ============================================================

    /**
     * 获取搜索建议
     * @param {string} prefix - 前缀
     * @param {number} limit - 返回数量
     * @returns {Array} 建议列表
     */
    getSuggestions: function(prefix, limit) {
        if (!this._initialized) this.init();
        this._refreshIndexIfNeeded();

        if (!prefix || prefix.length < 2) {
            return [];
        }

        limit = limit || 10;
        var prefixLower = prefix.toLowerCase();
        var suggestions = [];
        var indexData = this._index;

        for (var id in indexData) {
            if (!indexData.hasOwnProperty(id)) continue;
            var entry = indexData[id];

            if (entry.id.toLowerCase().indexOf(prefixLower) === 0) {
                suggestions.push({
                    id: entry.id,
                    name: entry.name,
                    type: entry.type,
                    category: entry.category,
                    score: 100
                });
            } else if (entry.name.toLowerCase().indexOf(prefixLower) === 0) {
                suggestions.push({
                    id: entry.id,
                    name: entry.name,
                    type: entry.type,
                    category: entry.category,
                    score: 80
                });
            }
        }

        suggestions.sort(function(a, b) { return b.score - a.score; });

        if (suggestions.length > limit) {
            suggestions = suggestions.slice(0, limit);
        }

        return suggestions;
    },

    // ============================================================
    // STATS
    // ============================================================

    /**
     * 获取 Search 统计
     * @returns {Object} 统计信息
     */
    getStats: function() {
        if (!this._initialized) this.init();

        return {
            indexSize: this._getIndexSize(),
            indexVersion: this._indexVersion,
            lastUpdate: this._lastIndexUpdate,
            cacheTTL: this._cacheTTL,
            maxResults: this._maxResults,
            initialized: this._initialized
        };
    },

    /**
     * 手动刷新索引
     */
    refreshIndex: function() {
        this._buildIndex();
        console.log('[RuntimeSearch] Index manually refreshed');
        return this;
    },

    /**
     * 重置 Search
     */
    reset: function() {
        this._index = null;
        this._initialized = false;
        this._indexVersion = 0;
        console.log('🔎 [RuntimeSearch] Reset');
        return this;
    }
};

// ============================================================
// AUTO-INIT
// ============================================================

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        LawAIApp.Runtime.Search.init();
    });
} else {
    LawAIApp.Runtime.Search.init();
}

console.log('🔎 [Part 49.9.4] Runtime Search & Discovery Engine loaded');
console.log('   📋 API: search() | findByType() | findRelated() | getSuggestions()');
console.log('   📊 Index ready: ' + LawAIApp.Runtime.Search._getIndexSize() + ' entries');
console.log('   ⚡ Cache TTL: ' + (LawAIApp.Runtime.Search._cacheTTL / 1000) + 's');
