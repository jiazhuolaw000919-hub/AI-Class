// ============================================================
// debugUtils.js
// Part 49.8.6 — Extract Debug Utilities
// Version: v4.9.8.6
// Status: Architecture Refactoring
// Module: Developer Experience Layer — Utilities
// ============================================================

window.LawAIApp = window.LawAIApp || {};
LawAIApp.Debug = LawAIApp.Debug || {};
LawAIApp.Debug.Utils = LawAIApp.Debug.Utils || {};

/**
 * Debug Utilities
 * 
 * 职责：
 * - 格式化工具 (Formatting)
 * - DOM 辅助 (DOM Helpers)
 * - 通用函数 (Common Functions)
 * 
 * 规则：
 * - Utility 不保存 State
 * - Utility 不调用 Runtime Engine
 * - Utility 必须可独立测试
 */
LawAIApp.Debug.Utils = {

    // ============================================================
    // FORMATTING HELPERS
    // ============================================================

    /**
     * 格式化时长
     * @param {number} seconds - 秒数
     * @returns {string} 格式化后的时长
     */
    formatDuration: function(seconds) {
        if (typeof seconds !== 'number' || seconds < 0) {
            return 'N/A';
        }
        
        if (seconds < 60) {
            return seconds + 's';
        } else if (seconds < 3600) {
            var mins = Math.floor(seconds / 60);
            var secs = Math.floor(seconds % 60);
            return mins + 'm ' + secs + 's';
        } else {
            var hours = Math.floor(seconds / 3600);
            var mins = Math.floor((seconds % 3600) / 60);
            return hours + 'h ' + mins + 'm';
        }
    },

    /**
     * 格式化时间戳
     * @param {number} ts - 时间戳 (毫秒)
     * @returns {string} 格式化后的时间
     */
    formatTimestamp: function(ts) {
        if (typeof ts !== 'number' || ts <= 0) {
            return 'N/A';
        }
        
        var d = new Date(ts);
        return d.toLocaleTimeString('en-US', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    },

    /**
     * 格式化日期
     * @param {number} ts - 时间戳 (毫秒)
     * @returns {string} 格式化后的日期
     */
    formatDate: function(ts) {
        if (typeof ts !== 'number' || ts <= 0) {
            return 'N/A';
        }
        
        var d = new Date(ts);
        return d.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: '2-digit'
        });
    },

    /**
     * 格式化大小 (Bytes)
     * @param {number} bytes - 字节数
     * @returns {string} 格式化后的大小
     */
    formatBytes: function(bytes) {
        if (typeof bytes !== 'number' || bytes < 0) {
            return 'N/A';
        }
        
        if (bytes < 1024) {
            return bytes + ' B';
        } else if (bytes < 1024 * 1024) {
            return (bytes / 1024).toFixed(1) + ' KB';
        } else if (bytes < 1024 * 1024 * 1024) {
            return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
        } else {
            return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
        }
    },

    /**
     * 格式化百分比
     * @param {number} value - 0-100 的值
     * @param {number} decimals - 小数位数
     * @returns {string} 格式化后的百分比
     */
    formatPercentage: function(value, decimals) {
        if (typeof value !== 'number' || isNaN(value)) {
            return 'N/A';
        }
        
        decimals = decimals || 0;
        return value.toFixed(decimals) + '%';
    },

    /**
     * 格式化状态 (颜色 + 文本)
     * @param {string} status - 状态值
     * @returns {Object} { text, color, icon }
     */
    formatStatus: function(status) {
        var statusMap = {
            'running': { text: 'Running', color: '#22c55e', icon: '✅' },
            'ready': { text: 'Ready', color: '#22c55e', icon: '✅' },
            'active': { text: 'Active', color: '#22c55e', icon: '✅' },
            'completed': { text: 'Completed', color: '#22c55e', icon: '✅' },
            'healthy': { text: 'Healthy', color: '#22c55e', icon: '✅' },
            'booting': { text: 'Booting', color: '#f59e0b', icon: '⏳' },
            'loading': { text: 'Loading', color: '#f59e0b', icon: '⏳' },
            'idle': { text: 'Idle', color: '#64748b', icon: '⏸️' },
            'warning': { text: 'Warning', color: '#f59e0b', icon: '⚠️' },
            'error': { text: 'Error', color: '#ef4444', icon: '❌' },
            'failed': { text: 'Failed', color: '#ef4444', icon: '❌' },
            'unknown': { text: 'Unknown', color: '#64748b', icon: '❓' }
        };
        
        var key = (status || 'unknown').toLowerCase();
        return statusMap[key] || { text: status || 'Unknown', color: '#64748b', icon: '❓' };
    },

    /**
     * 截断文本
     * @param {string} text - 原始文本
     * @param {number} maxLength - 最大长度
     * @param {string} suffix - 后缀
     * @returns {string} 截断后的文本
     */
    truncate: function(text, maxLength, suffix) {
        if (typeof text !== 'string') return '';
        if (text.length <= maxLength) return text;
        
        suffix = suffix || '...';
        return text.slice(0, maxLength - suffix.length) + suffix;
    },

    /**
     * 首字母大写
     * @param {string} text - 原始文本
     * @returns {string} 首字母大写的文本
     */
    capitalize: function(text) {
        if (typeof text !== 'string' || text.length === 0) return '';
        return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    },

    // ============================================================
    // DOM HELPERS
    // ============================================================

    /**
     * 创建 DOM 元素
     * @param {string} tag - 标签名
     * @param {Object} attrs - 属性
     * @param {string|Array} children - 子元素
     * @returns {HTMLElement}
     */
    createElement: function(tag, attrs, children) {
        var el = document.createElement(tag);
        
        if (attrs) {
            for (var key in attrs) {
                if (attrs.hasOwnProperty(key)) {
                    if (key === 'style' && typeof attrs[key] === 'object') {
                        for (var styleKey in attrs[key]) {
                            if (attrs[key].hasOwnProperty(styleKey)) {
                                el.style[styleKey] = attrs[key][styleKey];
                            }
                        }
                    } else if (key === 'className') {
                        el.className = attrs[key];
                    } else if (key === 'textContent') {
                        el.textContent = attrs[key];
                    } else if (key === 'innerHTML') {
                        el.innerHTML = attrs[key];
                    } else {
                        el.setAttribute(key, attrs[key]);
                    }
                }
            }
        }
        
        if (children) {
            if (typeof children === 'string') {
                el.textContent = children;
            } else if (Array.isArray(children)) {
                for (var i = 0; i < children.length; i++) {
                    if (typeof children[i] === 'string') {
                        el.appendChild(document.createTextNode(children[i]));
                    } else if (children[i] instanceof HTMLElement) {
                        el.appendChild(children[i]);
                    }
                }
            } else if (children instanceof HTMLElement) {
                el.appendChild(children);
            }
        }
        
        return el;
    },

    /**
     * 创建卡片容器
     * @param {string} title - 标题
     * @param {string} content - 内容 HTML
     * @param {Object} options - 选项
     * @returns {HTMLElement}
     */
    createCard: function(title, content, options) {
        options = options || {};
        var color = options.color || '#4a9eff';
        var bgColor = options.bgColor || 'rgba(74,158,255,0.04)';
        
        var card = this.createElement('div', {
            style: {
                marginBottom: '8px',
                padding: '8px 12px',
                background: bgColor,
                borderRadius: '8px',
                borderLeft: '2px solid ' + color
            }
        });
        
        if (title) {
            var header = this.createElement('div', {
                style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }
            });
            header.innerHTML = '<span style="font-size:11px;color:#94a3b8;font-weight:600;">' + title + '</span>';
            card.appendChild(header);
        }
        
        if (content) {
            var body = this.createElement('div', {
                style: {
                    marginTop: '4px',
                    fontSize: '10px',
                    color: '#64748b'
                }
            });
            body.innerHTML = content;
            card.appendChild(body);
        }
        
        return card;
    },

    /**
     * 创建状态徽章
     * @param {string} status - 状态值
     * @param {Object} options - 选项
     * @returns {HTMLElement}
     */
    createStatusBadge: function(status, options) {
        options = options || {};
        var statusInfo = this.formatStatus(status);
        var color = options.color || statusInfo.color;
        
        var badge = this.createElement('span', {
            style: {
                padding: '2px 8px',
                borderRadius: '10px',
                background: color + '20',
                color: color,
                fontSize: options.fontSize || '10px',
                fontWeight: options.fontWeight || '500'
            }
        });
        badge.textContent = statusInfo.icon + ' ' + statusInfo.text;
        
        return badge;
    },

    /**
     * 安全获取嵌套对象属性
     * @param {Object} obj - 源对象
     * @param {string} path - 路径 (如 'a.b.c')
     * @param {*} defaultValue - 默认值
     * @returns {*} 属性值或默认值
     */
    safeGet: function(obj, path, defaultValue) {
        if (!obj || typeof obj !== 'object') return defaultValue;
        
        var keys = path.split('.');
        var result = obj;
        
        for (var i = 0; i < keys.length; i++) {
            if (result === undefined || result === null || typeof result !== 'object') {
                return defaultValue;
            }
            result = result[keys[i]];
        }
        
        return (result === undefined || result === null) ? defaultValue : result;
    },

    /**
     * 深拷贝对象
     * @param {*} obj - 要拷贝的对象
     * @returns {*} 拷贝后的对象
     */
    deepClone: function(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        
        if (Array.isArray(obj)) {
            var arr = [];
            for (var i = 0; i < obj.length; i++) {
                arr.push(this.deepClone(obj[i]));
            }
            return arr;
        }
        
        var cloned = {};
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                cloned[key] = this.deepClone(obj[key]);
            }
        }
        return cloned;
    },

    /**
     * 检查是否为纯对象
     * @param {*} obj - 要检查的对象
     * @returns {boolean}
     */
    isPlainObject: function(obj) {
        return obj !== null && typeof obj === 'object' && !Array.isArray(obj);
    },

    /**
     * 检查是否为空值
     * @param {*} value - 要检查的值
     * @returns {boolean}
     */
    isEmpty: function(value) {
        if (value === null || value === undefined) return true;
        if (typeof value === 'string') return value.trim() === '';
        if (Array.isArray(value)) return value.length === 0;
        if (typeof value === 'object') return Object.keys(value).length === 0;
        return false;
    }
};

console.log('✅ [Part 49.8.6] Debug Utilities loaded');
console.log('   📋 Available utils:', Object.keys(LawAIApp.Debug.Utils).filter(function(k) {
    return typeof LawAIApp.Debug.Utils[k] === 'function';
}).join(', '));
