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

    /**
     * 🔥 PART 127: Renderer 接口规范
     * 
     * 每个注册的 renderer 应该返回一个对象，包含以下方法：
     * 
     * {
     *   mount: function()     - 渲染到容器
     *   unmount: function()   - 清理 DOM 和事件
     *   update: function(data) - 更新内容 (可选)
     *   getStatus: function()  - 返回 'active'|'idle'|'completed' (可选)
     * }
     * 
     * 或者 renderer 可以是简单的函数：
     * function(activity, container) { ... }
     * 
     * 简单函数模式不支持 unmount 清理。
     */
    getRendererInterface: function() {
        return {
            mount: 'function(activity, container)',
            unmount: 'function()',
            update: 'function(data) [optional]',
            getStatus: 'function() [optional]'
        };
    },
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
