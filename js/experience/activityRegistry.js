// js/experience/activityRegistry.js
// Part 126: Activity Registry

window.LawAIApp = window.LawAIApp || {};
window.LawAIApp.Experience = window.LawAIApp.Experience || {};

LawAIApp.Experience.ActivityRegistry = {
    _renderers: {},
    _initialized: false,

    /**
     * 初始化注册表
     */
    init: function() {
        if (this._initialized) return;
        this._initialized = true;
        console.log('[ActivityRegistry] ✅ Initialized');
        return this;
    },

    /**
     * 注册渲染器
     * @param {string} type - Activity 类型
     * @param {Function} renderer - 渲染函数
     */
    register: function(type, renderer) {
        if (typeof renderer !== 'function') {
            console.warn('[ActivityRegistry] Renderer must be a function:', type);
            return;
        }
        this._renderers[type] = renderer;
        console.log('[ActivityRegistry] ✅ Registered:', type);
    },

    /**
     * 获取渲染器
     * @param {string} type - Activity 类型
     * @returns {Function|null} 渲染器函数
     */
    get: function(type) {
        return this._renderers[type] || null;
    },

    /**
     * 检查渲染器是否存在
     * @param {string} type - Activity 类型
     * @returns {boolean}
     */
    has: function(type) {
        return !!this._renderers[type];
    },

    /**
     * 获取所有已注册类型
     * @returns {Array} 类型列表
     */
    getTypes: function() {
        return Object.keys(this._renderers);
    },

    /**
     * 获取状态
     */
    getStatus: function() {
        return {
            initialized: this._initialized,
            registeredCount: Object.keys(this._renderers).length,
            types: this.getTypes()
        };
    }
};

// 自动初始化
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    LawAIApp.Experience.ActivityRegistry.init();
} else {
    document.addEventListener('DOMContentLoaded', function() {
        LawAIApp.Experience.ActivityRegistry.init();
    });
}

console.log('📦 ActivityRegistry loaded (Part 126)');
