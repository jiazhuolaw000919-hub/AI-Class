// ============================================================
// debugActions.js
// Part 49.8.6 — Extract Debug Actions
// Version: v4.9.8.6
// Status: Architecture Refactoring
// Module: Developer Experience Layer — Actions
// ============================================================

window.LawAIApp = window.LawAIApp || {};
LawAIApp.Debug = LawAIApp.Debug || {};
LawAIApp.Debug.Actions = LawAIApp.Debug.Actions || {};

/**
 * Debug Actions Registry
 * 
 * 职责：
 * - 注册所有 Debug Actions
 * - 通过 Governance 检查危险操作
 * - 记录 Audit 日志
 * 
 * 规则：
 * - Action 必须通过 Registry 注册
 * - Action 不直接修改 Runtime
 * - Dangerous Action 必须经过 Governance
 * - 所有 Action 必须记录 Audit
 */
LawAIApp.Debug.Actions.Registry = {
    _actions: {},
    _auditLog: [],

    /**
     * 注册 Action
     * @param {string} id - Action ID
     * @param {Object} config - Action 配置
     * @param {string} config.label - 显示名称
     * @param {string} config.icon - 图标
     * @param {string} config.category - 分类 (debug, data, system, dangerous)
     * @param {Function} config.handler - 执行函数
     * @param {boolean} config.dangerous - 是否为危险操作
     * @param {string} config.confirmMessage - 确认消息 (危险操作必填)
     */
    register: function(id, config) {
        if (this._actions[id]) {
            console.warn('[ActionRegistry] Action "' + id + '" already registered, overwriting.');
        }
        
        this._actions[id] = {
            id: id,
            label: config.label || id,
            icon: config.icon || '⚡',
            category: config.category || 'debug',
            handler: config.handler || function() { console.warn('[Action] No handler for ' + id); },
            dangerous: config.dangerous || false,
            confirmMessage: config.confirmMessage || null,
            requiresGovernance: config.dangerous || false
        };
        
        console.log('✅ [ActionRegistry] Registered: ' + id);
    },

    /**
     * 执行 Action
     * @param {string} id - Action ID
     * @param {Object} context - 执行上下文
     * @returns {Promise} 执行结果
     */
    execute: function(id, context) {
        var action = this._actions[id];
        if (!action) {
            console.warn('[ActionRegistry] Action not found: ' + id);
            return Promise.reject(new Error('Action not found: ' + id));
        }

        // ── 危险操作：需要确认 ──
        if (action.dangerous && action.confirmMessage) {
            if (!confirm(action.confirmMessage)) {
                this._logAudit(id, 'cancelled', context);
                return Promise.resolve({ status: 'cancelled', action: id });
            }
        }

        // ── 危险操作：需要 Governance 检查 ──
        if (action.requiresGovernance) {
            var govCheck = this._checkGovernance(id);
            if (!govCheck.allowed) {
                this._logAudit(id, 'blocked_by_governance', context);
                alert('🚫 Action blocked by Governance: ' + govCheck.reason);
                return Promise.resolve({ status: 'blocked', action: id, reason: govCheck.reason });
            }
        }

        try {
            this._logAudit(id, 'executed', context);
            var result = action.handler(context);
            return Promise.resolve({ status: 'success', action: id, result: result });
        } catch (err) {
            this._logAudit(id, 'error', context, err.message);
            console.error('[ActionRegistry] Error executing ' + id + ':', err);
            return Promise.reject(err);
        }
    },

    /**
     * 获取所有 Actions
     * @param {string} category - 可选，按分类筛选
     * @returns {Array} Action 列表
     */
    getActions: function(category) {
        var result = [];
        for (var id in this._actions) {
            if (this._actions.hasOwnProperty(id)) {
                var action = this._actions[id];
                if (!category || action.category === category) {
                    result.push(action);
                }
            }
        }
        return result;
    },

    /**
     * 获取 Action 按钮 HTML
     * @param {string} category - 可选，按分类筛选
     * @returns {string} HTML 字符串
     */
    renderButtons: function(category) {
        var actions = this.getActions(category);
        if (actions.length === 0) return '';

        var html = '';
        for (var i = 0; i < actions.length; i++) {
            var a = actions[i];
            var dangerClass = a.dangerous ? 'dangerous' : '';
            var color = a.dangerous ? '#ef4444' : (a.category === 'data' ? '#4a9eff' : (a.category === 'system' ? '#22c55e' : '#94a3b8'));
            var bgColor = a.dangerous ? 'rgba(239,68,68,0.15)' : (a.category === 'data' ? 'rgba(74,158,255,0.1)' : (a.category === 'system' ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.05)'));
            
            html += `
                <button class="debug-action-btn" 
                        data-action="${a.id}"
                        data-dangerous="${a.dangerous}"
                        onclick="LawAIApp.Debug.Actions.Registry.execute('${a.id}')"
                        style="padding:6px 14px;background:${bgColor};border:1px solid rgba(255,255,255,0.08);border-radius:8px;color:${color};font-size:12px;cursor:pointer;transition:all 0.2s;">
                    ${a.icon} ${a.label}
                </button>
            `;
        }
        return html;
    },

    /**
     * Governance 检查
     * @private
     */
    _checkGovernance: function(actionId) {
        try {
            var policy = window.LawAIApp?.Policy;
            if (policy && typeof policy.isAllowed === 'function') {
                var result = policy.isAllowed('debug.action.' + actionId);
                if (result && result.allowed === false) {
                    return { allowed: false, reason: result.reason || 'Policy denied' };
                }
            }
        } catch (e) { /* ignore */ }
        return { allowed: true };
    },

    /**
     * 记录 Audit 日志
     * @private
     */
    _logAudit: function(actionId, status, context, error) {
        var entry = {
            timestamp: Date.now(),
            action: actionId,
            status: status,
            context: context || {},
            error: error || null
        };
        this._auditLog.push(entry);
        
        // 保留最近 100 条
        if (this._auditLog.length > 100) {
            this._auditLog.shift();
        }
        
        console.log('[Audit] ' + actionId + ' → ' + status);
    },

    /**
     * 获取 Audit 日志
     * @param {number} limit - 返回条数
     * @returns {Array} 日志条目
     */
    getAuditLog: function(limit) {
        if (limit) {
            return this._auditLog.slice(-limit);
        }
        return this._auditLog;
    },

    /**
     * 清空 Audit 日志
     */
    clearAuditLog: function() {
        this._auditLog = [];
    }
};

// ============================================================
// 注册内置 Actions
// ============================================================

// ── System Actions ──
LawAIApp.Debug.Actions.Registry.register('reload', {
    label: 'Reload',
    icon: '🔄',
    category: 'system',
    handler: function() {
        location.reload();
    }
});

// ── Debug Actions ──
LawAIApp.Debug.Actions.Registry.register('log_storage', {
    label: 'Log',
    icon: '📋',
    category: 'debug',
    handler: function() {
        console.log('📋 Storage:', JSON.stringify(localStorage, null, 2));
        alert('Check console for storage dump');
    }
});

LawAIApp.Debug.Actions.Registry.register('toggle_devpanel', {
    label: 'DevPanel',
    icon: '🛠️',
    category: 'debug',
    handler: function() {
        if (window.LawAIApp?.Debug?.DevPanel) {
            window.LawAIApp.Debug.DevPanel.toggle();
        }
    }
});

// ── Data Actions ──
LawAIApp.Debug.Actions.Registry.register('export_backup', {
    label: 'Export',
    icon: '💾',
    category: 'data',
    handler: function() {
        if (window.LawAIApp?.FactoryReset?.exportBackup) {
            window.LawAIApp.FactoryReset.exportBackup();
        } else if (window.LawAIApp?.Debug?.StorageAudit?.exportAll) {
            window.LawAIApp.Debug.StorageAudit.exportAll();
        } else {
            alert('Export function not available');
        }
    }
});

LawAIApp.Debug.Actions.Registry.register('import_backup', {
    label: 'Import',
    icon: '📥',
    category: 'data',
    handler: function() {
        var input = document.getElementById('dev-import-input');
        if (input) {
            input.click();
        } else {
            // 创建临时 input
            var tempInput = document.createElement('input');
            tempInput.type = 'file';
            tempInput.accept = '.json';
            tempInput.style.display = 'none';
            tempInput.onchange = function(e) {
                var file = e.target.files[0];
                if (file) {
                    LawAIApp.Debug.Actions.ImportBackup.import(file);
                }
                tempInput.remove();
            };
            document.body.appendChild(tempInput);
            tempInput.click();
        }
    }
});

LawAIApp.Debug.Actions.Registry.register('clean_orphans', {
    label: 'Clean',
    icon: '🧹',
    category: 'data',
    handler: function() {
        var r = null;
        if (window.LawAIApp?.Debug?.StorageAudit?.cleanOrphans) {
            r = window.LawAIApp.Debug.StorageAudit.cleanOrphans();
        }
        if (r !== undefined && r !== null) {
            alert('Removed ' + r + ' orphan keys');
        } else {
            alert('StorageAudit not available');
        }
    }
});

// ── Dangerous Actions ──
LawAIApp.Debug.Actions.Registry.register('reset_all', {
    label: 'Reset',
    icon: '🗑️',
    category: 'dangerous',
    dangerous: true,
    confirmMessage: '⚠️ Delete ALL data? This cannot be undone!',
    handler: function() {
        if (window.LawAIApp?.FactoryReset?.resetAll) {
            window.LawAIApp.FactoryReset.resetAll();
        } else if (window.LawAIApp?.FactoryReset?.execute) {
            window.LawAIApp.FactoryReset.execute();
        } else {
            alert('Reset function not available');
        }
    }
});

console.log('✅ [Part 49.8.6] Debug Actions Registry initialized');
console.log('   📋 Registered actions:', Object.keys(LawAIApp.Debug.Actions.Registry._actions).join(', '));
