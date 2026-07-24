/**
 * Governance Patch — Part 49 统一修复
 * 
 * 修复:
 * 1. RuntimeEventCollector.emit 不存在的问题
 * 2. export 语法错误（如果不支持 ES Module）
 * 
 * 加载顺序: 必须在 Part 49 所有文件之前
 */

(function() {
    'use strict';
    
    // ============================================================
    // 修复 1: 确保 RuntimeEventCollector 有 emit 方法
    // ============================================================
    if (window.LawAIApp?.RuntimeEventCollector) {
        const collector = window.LawAIApp.RuntimeEventCollector;
        
        // 如果没有 emit 方法，自动补充
        if (typeof collector.emit !== 'function') {
            // 尝试找到可用的事件方法
            const fallback = collector.emitEvent || collector.log || collector.track || collector.addEvent;
            
            if (typeof fallback === 'function') {
                collector.emit = function(event) {
                    return fallback.call(collector, event);
                };
            } else {
                // 完全没有事件方法，创建一个安全的空方法
                collector.emit = function(event) {
                    // 至少 console 记录，方便调试
                    console.debug('[RuntimeEventCollector]', event?.type || 'event', event?.data || '');
                };
            }
            console.log('[GovernancePatch] RuntimeEventCollector.emit patched ✅');
        }
    } else {
        // RuntimeEventCollector 完全不存在，创建一个全局安全的 fallback
        if (!window.LawAIApp) window.LawAIApp = {};
        window.LawAIApp.RuntimeEventCollector = {
            events: [],
            emit: function(event) {
                this.events.push({
                    ...event,
                    _timestamp: new Date().toISOString()
                });
                // 只保留最近 100 条
                if (this.events.length > 100) this.events = this.events.slice(-50);
                console.debug('[GovernancePatch] Event:', event?.type || 'unknown');
            },
            getEvents: function() { return this.events; },
            clear: function() { this.events = []; }
        };
        console.log('[GovernancePatch] RuntimeEventCollector created (fallback) ✅');
    }
    
    // ============================================================
    // 修复 2: 确保全局命名空间存在
    // ============================================================
    window.LawAIApp = window.LawAIApp || {};
    
    // ============================================================
    // 修复 3: 提供安全的 _emitEvent 辅助函数给所有模块使用
    // ============================================================
    window.LawAIApp._safeEmit = function(type, data, source) {
        try {
            const collector = window.LawAIApp?.RuntimeEventCollector;
            if (!collector) return;
            
            const emit = collector.emit || collector.emitEvent || collector.log;
            if (typeof emit === 'function') {
                emit.call(collector, {
                    type: type,
                    source: source || 'GovernanceLayer',
                    data: data || {},
                    timestamp: new Date().toISOString()
                });
            }
        } catch (e) {
            // 静默失败 — 事件发送不影响主流程
        }
    };
    
    console.log('[GovernancePatch] V1.0.0 applied — Event system + safe emit ready ✅');
})();
