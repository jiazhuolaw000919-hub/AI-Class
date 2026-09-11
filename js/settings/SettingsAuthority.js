// /js/settings/SettingsAuthority.js
// Part 165 — 唯一的 Settings 权威 (后台加载版)
// Settings = 学习者偏好权威
// 不是 Curriculum / Progress / Mastery / Recommendation / Calendar

(function() {
    'use strict';

    // ============================================================
    // 状态
    // ============================================================
    var _settings = {};
    var _defaults = {
        // Learning
        preferredSessionDuration: 30,
        preferredContentFormat: 'mixed',  // 'video' | 'reading' | 'practice' | 'mixed'
        recommendationsEnabled: true,
        recommendationFrequency: 'normal',  // 'low' | 'normal' | 'high'
        explanationDetail: 'moderate',  // 'brief' | 'moderate' | 'detailed'

        // Appearance
        theme: 'system',  // 'light' | 'dark' | 'system'
        layout: 'comfortable',  // 'compact' | 'comfortable'
        density: 'normal',  // 'compact' | 'normal' | 'spacious'

        // Notifications
        learningReminders: true,
        recommendationNotifications: false,
        calendarReminders: true,

        // Accessibility
        reducedMotion: false,
        highContrast: false,
        fontSize: 'medium',  // 'small' | 'medium' | 'large'
        captionsEnabled: true,

        // Calendar
        preferredStudyTime: '19:00',
        preferredStudyDays: [1, 2, 3, 4, 5],  // Mon-Fri
        defaultReminderMinutes: 15,

        // Privacy & Data
        analyticsEnabled: true,
        aiProcessingEnabled: true,
        localOnlyMode: false
    };

    var _initialized = false;
    var _loading = false;
    var _readyCallbacks = [];
    var _version = '1.0.0';
    var _storageKey = 'settingsAuthority_v1';
    var _schemaVersion = 1;

    // ============================================================
    // 核心 API
    // ============================================================
    var SettingsAuthority = {

        get initialized() { return _initialized; },
        get loading() { return _loading; },
        get isReady() { return _initialized && !_loading; },
        get version() { return _version; },

        // ---- 初始化（后台加载） ----
        init: function() {
            if (_initialized) {
                console.log('[SettingsAuthority] Already initialized');
                return this;
            }
            if (_loading) {
                console.log('[SettingsAuthority] Already loading...');
                return this;
            }

            console.log('[SettingsAuthority] 🚀 Starting background load...');
            _loading = true;
            this._loadFromStorageAsync();
            return this;
        },

        // ---- 就绪回调 ----
        onReady: function(callback) {
            if (_initialized) {
                callback(this);
                return;
            }
            _readyCallbacks.push(callback);
        },

        // ============================================================
        // 命令 — 所有写操作必须通过这些方法
        // ============================================================

        /**
         * SET — 设置一个偏好
         */
        set: function(key, value) {
            if (!_initialized) {
                return { success: false, error: 'SettingsAuthority not ready', code: 'NOT_READY' };
            }

            // 验证 key 存在
            if (!(key in _defaults)) {
                return { success: false, error: 'Unknown preference: ' + key, code: 'UNKNOWN_KEY' };
            }

            // 验证 value
            var validation = this._validateValue(key, value);
            if (!validation.valid) {
                return { success: false, error: validation.error, code: 'INVALID_VALUE' };
            }

            var previousValue = _settings[key];
            var isDefault = (previousValue === undefined);
            _settings[key] = value;

            this._saveToStorage();

            this._emit('PREFERENCE_CHANGED', {
                key: key,
                previousValue: previousValue,
                newValue: value,
                isFirstSet: isDefault
            });

            return { success: true, key: key, value: value };
        },

        /**
         * RESET — 重置单个偏好到默认值
         */
        reset: function(key) {
            if (!_initialized) {
                return { success: false, error: 'SettingsAuthority not ready', code: 'NOT_READY' };
            }

            if (!(key in _defaults)) {
                return { success: false, error: 'Unknown preference: ' + key, code: 'UNKNOWN_KEY' };
            }

            var previousValue = _settings[key];
            delete _settings[key];

            this._saveToStorage();

            this._emit('PREFERENCE_RESET', {
                key: key,
                previousValue: previousValue,
                newValue: _defaults[key]
            });

            return { success: true, key: key, value: _defaults[key] };
        },

        /**
         * RESET_CATEGORY — 重置一个类别的所有偏好
         */
        resetCategory: function(category) {
            if (!_initialized) {
                return { success: false, error: 'SettingsAuthority not ready', code: 'NOT_READY' };
            }

            var categoryKeys = this._getCategoryKeys(category);
            var resetKeys = [];

            for (var i = 0; i < categoryKeys.length; i++) {
                var key = categoryKeys[i];
                if (key in _settings) {
                    delete _settings[key];
                    resetKeys.push(key);
                }
            }

            this._saveToStorage();

            this._emit('PREFERENCE_CATEGORY_RESET', {
                category: category,
                keys: resetKeys
            });

            return { success: true, category: category, resetKeys: resetKeys };
        },

        /**
         * RESET_ALL — 重置所有偏好到默认值
         * ⚠️ 注意：这不影响 Progress / Mastery / Notes / Calendar
         */
        resetAll: function() {
            if (!_initialized) {
                return { success: false, error: 'SettingsAuthority not ready', code: 'NOT_READY' };
            }

            _settings = {};
            this._saveToStorage();

            this._emit('PREFERENCES_RESET_ALL', {
                timestamp: new Date().toISOString()
            });

            return { success: true };
        },

        // ============================================================
        // 读方法
        // ============================================================

        get: function(key) {
            if (!_initialized) {
                return _defaults[key];
            }
            if (key in _settings) {
                return _settings[key];
            }
            return _defaults[key];
        },

        /**
         * 获取带状态的偏好值（区分 SET / DEFAULT / UNKNOWN）
         */
        getWithStatus: function(key) {
            if (!_initialized) {
                return { value: _defaults[key], status: 'UNKNOWN' };
            }
            if (key in _settings) {
                return { value: _settings[key], status: 'SET' };
            }
            return { value: _defaults[key], status: 'DEFAULT' };
        },

        getAll: function() {
            if (!_initialized) {
                return Object.assign({}, _defaults);
            }
            var result = {};
            for (var key in _defaults) {
                if (_defaults.hasOwnProperty(key)) {
                    result[key] = (key in _settings) ? _settings[key] : _defaults[key];
                }
            }
            return result;
        },

        getCategory: function(category) {
            var categoryKeys = this._getCategoryKeys(category);
            var result = {};
            for (var i = 0; i < categoryKeys.length; i++) {
                var key = categoryKeys[i];
                result[key] = this.get(key);
            }
            return result;
        },

        getDefaults: function() {
            return Object.assign({}, _defaults);
        },

        getStatusSummary: function() {
            if (!_initialized) {
                return { initialized: false, total: 0, set: 0, default: 0 };
            }
            var set = 0;
            var def = 0;
            for (var key in _defaults) {
                if (_defaults.hasOwnProperty(key)) {
                    if (key in _settings) set++;
                    else def++;
                }
            }
            return {
                initialized: true,
                total: Object.keys(_defaults).length,
                set: set,
                default: def,
                version: _version,
                schemaVersion: _schemaVersion,
                lastUpdated: new Date().toISOString()
            };
        },

        // ============================================================
        // 迁移：从旧存储导入
        // ============================================================
        migrateFromLegacy: function() {
            try {
                var migrated = 0;
                var legacyKeys = [
                    'lawai_settings',
                    'settings',
                    'userPreferences',
                    'appPreferences',
                    'lawai_preferences'
                ];

                for (var i = 0; i < legacyKeys.length; i++) {
                    var legacyKey = legacyKeys[i];
                    var legacyData = localStorage.getItem(legacyKey);
                    if (legacyData) {
                        try {
                            var parsed = JSON.parse(legacyData);
                            for (var key in parsed) {
                                if (parsed.hasOwnProperty(key) && key in _defaults) {
                                    var validation = this._validateValue(key, parsed[key]);
                                    if (validation.valid) {
                                        _settings[key] = parsed[key];
                                        migrated++;
                                    }
                                }
                            }
                        } catch (e) {}
                    }
                }

                // 也尝试从 lawai_ 前缀的 key 迁移
                var allKeys = Object.keys(localStorage);
                for (var j = 0; j < allKeys.length; j++) {
                    var fullKey = allKeys[j];
                    if (fullKey.indexOf('lawai_') === 0) {
                        var shortKey = fullKey.replace('lawai_', '');
                        if (shortKey in _defaults && !(shortKey in _settings)) {
                            try {
                                var val = JSON.parse(localStorage.getItem(fullKey));
                                var v = this._validateValue(shortKey, val);
                                if (v.valid) {
                                    _settings[shortKey] = val;
                                    migrated++;
                                }
                            } catch (e) {}
                        }
                    }
                }

                this._saveToStorage();
                console.log('[SettingsAuthority] ✅ Migrated', migrated, 'preferences from legacy');

                return { success: true, migrated: migrated };
            } catch (e) {
                console.warn('[SettingsAuthority] Migration error:', e);
                return { success: false, error: e.message };
            }
        },

        // ============================================================
        // 私有方法
        // ============================================================

        _getCategoryKeys: function(category) {
            var categories = {
                learning: ['preferredSessionDuration', 'preferredContentFormat', 'recommendationsEnabled', 'recommendationFrequency', 'explanationDetail'],
                appearance: ['theme', 'layout', 'density'],
                notifications: ['learningReminders', 'recommendationNotifications', 'calendarReminders'],
                accessibility: ['reducedMotion', 'highContrast', 'fontSize', 'captionsEnabled'],
                calendar: ['preferredStudyTime', 'preferredStudyDays', 'defaultReminderMinutes'],
                privacy: ['analyticsEnabled', 'aiProcessingEnabled', 'localOnlyMode']
            };
            return categories[category] || [];
        },

        _validateValue: function(key, value) {
            // 简单验证
            var validators = {
                preferredSessionDuration: function(v) {
                    return typeof v === 'number' && v >= 5 && v <= 180;
                },
                preferredContentFormat: function(v) {
                    return ['video', 'reading', 'practice', 'mixed'].indexOf(v) !== -1;
                },
                recommendationsEnabled: function(v) { return typeof v === 'boolean'; },
                recommendationFrequency: function(v) {
                    return ['low', 'normal', 'high'].indexOf(v) !== -1;
                },
                explanationDetail: function(v) {
                    return ['brief', 'moderate', 'detailed'].indexOf(v) !== -1;
                },
                theme: function(v) {
                    return ['light', 'dark', 'system'].indexOf(v) !== -1;
                },
                layout: function(v) {
                    return ['compact', 'comfortable'].indexOf(v) !== -1;
                },
                density: function(v) {
                    return ['compact', 'normal', 'spacious'].indexOf(v) !== -1;
                },
                fontSize: function(v) {
                    return ['small', 'medium', 'large'].indexOf(v) !== -1;
                },
                preferredStudyTime: function(v) {
                    return typeof v === 'string' && /^\d{2}:\d{2}$/.test(v);
                },
                preferredStudyDays: function(v) {
                    return Array.isArray(v) && v.every(function(d) { return d >= 0 && d <= 6; });
                },
                defaultReminderMinutes: function(v) {
                    return typeof v === 'number' && v >= 0 && v <= 120;
                }
            };

            var validator = validators[key];
            if (validator) {
                return { valid: validator(value), error: validator(value) ? null : 'Invalid value for ' + key };
            }
            // 没有特定验证器的用类型检查
            var defaultVal = _defaults[key];
            if (typeof defaultVal === 'boolean' && typeof value !== 'boolean') {
                return { valid: false, error: 'Expected boolean for ' + key };
            }
            if (typeof defaultVal === 'number' && typeof value !== 'number') {
                return { valid: false, error: 'Expected number for ' + key };
            }
            if (typeof defaultVal === 'string' && typeof value !== 'string') {
                return { valid: false, error: 'Expected string for ' + key };
            }
            return { valid: true };
        },

        _loadFromStorageAsync: function() {
            var self = this;

            setTimeout(function() {
                try {
                    var stored = localStorage.getItem(_storageKey);
                    if (stored) {
                        var parsed = JSON.parse(stored);
                        if (parsed && parsed.data && parsed.schemaVersion === _schemaVersion) {
                            _settings = parsed.data;
                        } else if (parsed && typeof parsed === 'object') {
                            // 旧格式，尝试迁移
                            _settings = parsed;
                        }
                        console.log('[SettingsAuthority] ✅ Loaded', Object.keys(_settings).length, 'preferences');
                    } else {
                        // 尝试从旧存储迁移
                        self.migrateFromLegacy();
                    }
                } catch (e) {
                    console.warn('[SettingsAuthority] Load error:', e);
                    _settings = {};
                }

                _loading = false;
                _initialized = true;

                while (_readyCallbacks.length > 0) {
                    var cb = _readyCallbacks.shift();
                    try {
                        cb(self);
                    } catch (e) {
                        console.warn('[SettingsAuthority] Callback error:', e);
                    }
                }

                self._emit('SETTINGS_AUTHORITY_READY', {
                    settingsCount: Object.keys(_settings).length,
                    version: _version
                });

                console.log('[SettingsAuthority] ✅ Ready (' + Object.keys(_settings).length + ' set)');
            }, 0);
        },

        _saveToStorage: function() {
            try {
                var payload = {
                    schemaVersion: _schemaVersion,
                    data: _settings,
                    updatedAt: new Date().toISOString()
                };
                localStorage.setItem(_storageKey, JSON.stringify(payload));
            } catch (e) {
                console.warn('[SettingsAuthority] Save error:', e);
            }
        },

        _emit: function(eventName, data) {
            try {
                var event = new CustomEvent(eventName, {
                    detail: {
                        source: 'settings-authority',
                        version: _version,
                        timestamp: new Date().toISOString(),
                        data: data || {}
                    }
                });
                document.dispatchEvent(event);
                window.dispatchEvent(event);

                if (window.LawAIApp?.EventBus?.emit) {
                    window.LawAIApp.EventBus.emit(eventName, event.detail);
                }
            } catch (e) {}
        },

        _debug: function() {
            return {
                initialized: _initialized,
                loading: _loading,
                settingsCount: Object.keys(_settings).length,
                defaultsCount: Object.keys(_defaults).length,
                storageKey: _storageKey,
                version: _version,
                schemaVersion: _schemaVersion,
                readyCallbacks: _readyCallbacks.length
            };
        }
    };

    // ============================================================
    // 注册到全局
    // ============================================================

    window.LawAIApp = window.LawAIApp || {};
    window.LawAIApp.SettingsAuthority = SettingsAuthority;

    // ============================================================
    // 后台自动初始化
    // ============================================================

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        setTimeout(function() {
            if (!SettingsAuthority.initialized && !SettingsAuthority.loading) {
                SettingsAuthority.init();
            }
        }, 200);
    } else {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(function() {
                if (!SettingsAuthority.initialized && !SettingsAuthority.loading) {
                    SettingsAuthority.init();
                }
            }, 200);
        });
    }

    console.log('[SettingsAuthority] Module loaded (Part 165)');

})();
