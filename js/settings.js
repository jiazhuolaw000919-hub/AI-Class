// settings.js — Part 177 产品化版
// Settings = 学习者偏好权威
// 所有改动走 SettingsAuthority
// 不暴露没有 consumer 的 toggle

window.LawAIApp = window.LawAIApp || {};

LawAIApp.Settings = {
    version: '2.0.0',
    _initialized: false,
    _root: null,

    // ============================================================
    // 容器获取
    // ============================================================
    _getContainer: function() {
        if (this._root) return this._root;
        return document.getElementById('academy-root') ||
               document.getElementById('app') ||
               document.getElementById('law-runtime-root');
    },

    init: function() {
        if (this._initialized) return;
        this._initialized = true;
        console.log('[Settings] ✅ Initialized');
    },

    // ============================================================
    // 🏠 Home — 强制回 dashboard（无论从哪进来）
    // ============================================================
    goToDashboard: function() {
        console.log('[Settings] 🏠 Home → dashboard');
        
        // 如果不在首页 → 直接跳首页
        if (window.location.pathname !== '/' && window.location.pathname !== '/index.html') {
            window.location.href = '/';
            return;
        }
        
        // 已经在首页 → 直接重渲染 dashboard
        var container = this._getContainer();
        if (container) container.innerHTML = '';
        if (window.LawAIApp?.Dashboard) {
            // 🔥 绕过 5 秒防抖
            window.LawAIApp.Dashboard._lastRenderAt = 0;
            window.LawAIApp.Dashboard._rendered = false;
            window.LawAIApp.Dashboard.render();
        }
    },

    // ============================================================
    // ← Back — 返回上一页
    // ============================================================
    goBack: function() {
        console.log('[Settings] ← Back');
        
        var source = sessionStorage.getItem('settings_source');
        sessionStorage.removeItem('settings_source');
        
        if (source === 'academy') {
            window.location.href = '/pages/academy.html';
            return;
        }
        
        if (source === 'dashboard') {
            // 已经在 dashboard 页 → 重渲染 dashboard
            var container = this._getContainer();
            if (container) container.innerHTML = '';
            if (window.LawAIApp?.Dashboard) {
                window.LawAIApp.Dashboard._lastRenderAt = 0;
                window.LawAIApp.Dashboard._rendered = false;
                window.LawAIApp.Dashboard.render();
            }
            return;
        }
        
        // 兜底：history.back()
        if (window.history.length > 1) {
            window.history.back();
        } else {
            window.location.href = '/';
        }
    },

    // ============================================================
    // 主渲染
    // ============================================================
    render: function() {
        var container = this._getContainer();
        if (!container) {
            console.warn('[Settings] No container found');
            return;
        }

        this.init();
        this._root = container;

        var auth = window.LawAIApp?.SettingsAuthority;

        // Authority 未就绪 → loading state
        if (!auth || !auth.isReady) {
            container.innerHTML = this._renderLoadingState();
            var self = this;
            if (auth && auth.onReady) {
                auth.onReady(function() { self.render(); });
            }
            return;
        }

        // 渲染主体
        container.innerHTML = this._renderHTML();
        this._bindEvents();
        this._applyConsumers();
    },

    // ============================================================
    // State 渲染
    // ============================================================
    _renderLoadingState: function() {
        return `
            <div style="max-width:900px;margin:0 auto;padding:60px 20px;text-align:center;color:#94a3b8;">
                <div style="width:36px;height:36px;border:3px solid rgba(74,158,255,0.12);border-top-color:#4a9eff;border-radius:50%;animation:spin 0.8s linear infinite;margin:0 auto 12px;"></div>
                <p>Loading settings...</p>
            </div>
        `;
    },

    _renderErrorState: function(message) {
        return `
            <div style="max-width:900px;margin:0 auto;padding:60px 20px;text-align:center;color:#94a3b8;">
                <div style="font-size:48px;margin-bottom:12px;">⚠️</div>
                <h3 style="color:#e2e8f0;margin:0 0 8px;">Couldn't load settings</h3>
                <p>${message || 'Please try again.'}</p>
                <button onclick="LawAIApp.Settings.render()" style="padding:8px 20px;background:#4a9eff;border:none;border-radius:100px;color:white;font-size:13px;cursor:pointer;font-family:inherit;">Retry</button>
            </div>
        `;
    },

    // ============================================================
    // 渲染 HTML
    // ============================================================
    _renderHTML: function() {
        var auth = window.LawAIApp.SettingsAuthority;
        var meta = auth.getPreferenceMetadata();
        var exposed = auth.getUiExposedPreferences();

        var html = `
            <div class="settings-container">
                <div style="display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap;">
                    <button onclick="LawAIApp.Settings.goBack()" style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);color:#94a3b8;padding:10px 16px;border-radius:10px;cursor:pointer;font-family:inherit;font-size:14px;">← Back</button>
                    <button onclick="LawAIApp.Settings.goToDashboard()" style="background:rgba(74,158,255,0.08);border:1px solid rgba(74,158,255,0.15);color:#4a9eff;padding:10px 16px;border-radius:10px;cursor:pointer;font-family:inherit;font-size:14px;">🏠 Home</button>
                </div>

                <h2 style="margin:0 0 20px;font-size:24px;font-weight:700;">⚙️ Settings</h2>

                ${this._renderCategory('Appearance', exposed.appearance, meta)}
                ${this._renderCategory('Learning', exposed.learning, meta)}
                ${this._renderCategory('Calendar', exposed.calendar, meta)}
                ${this._renderCategory('Accessibility', exposed.accessibility, meta)}

                <!-- Account / Data -->
                <div class="settings-category">
                    <h3 class="settings-category-title">Account / Data</h3>
                    <div class="settings-group">
                        <div class="settings-item settings-item-action" data-action="export-backup">
                            <span class="settings-item-label">💾 Export Backup</span>
                            <span class="settings-item-value">Download</span>
                        </div>
                        <div class="settings-item settings-item-action" data-action="reset-notes">
                            <span class="settings-item-label" style="color:#f59e0b;">📝 Reset Notes</span>
                            <span class="settings-item-value" style="color:#f59e0b;">Reset</span>
                        </div>
                        <div class="settings-item settings-item-action" data-action="reset-calendar">
                            <span class="settings-item-label" style="color:#f59e0b;">📅 Reset Calendar</span>
                            <span class="settings-item-value" style="color:#f59e0b;">Reset</span>
                        </div>
                        <div class="settings-item settings-item-action" data-action="reset-preferences">
                            <span class="settings-item-label" style="color:#f59e0b;">⚙️ Reset Preferences</span>
                            <span class="settings-item-value" style="color:#f59e0b;">Reset</span>
                        </div>
                        <div class="settings-item settings-item-action" data-action="reset-progress">
                            <span class="settings-item-label" style="color:#ef4444;">⚠️ Reset All Progress</span>
                            <span class="settings-item-value" style="color:#ef4444;">Reset</span>
                        </div>
                    </div>
                </div>

                <!-- About -->
                <div class="settings-category">
                    <h3 class="settings-category-title">About</h3>
                    <div class="settings-group">
                        <div class="settings-item">
                            <span class="settings-item-label">Version</span>
                            <span class="settings-item-value">Season 4 — Part 177</span>
                        </div>
                        <div class="settings-item">
                            <span class="settings-item-label">Settings Authority</span>
                            <span class="settings-item-value">v${auth.version}</span>
                        </div>
                    </div>
                </div>

                <div style="margin-top:20px;padding:8px 14px;background:rgba(255,255,255,0.02);border-radius:8px;border:1px solid rgba(255,255,255,0.03);display:flex;justify-content:space-between;font-size:10px;color:#475569;">
                    <span>🔒 Settings Authority</span>
                    <span>Preference Authority</span>
                </div>
            </div>
        `;

        return html;
    },

    _renderCategory: function(title, keys, meta) {
        if (!keys || keys.length === 0) return '';
        var auth = window.LawAIApp.SettingsAuthority;

        var html = `
            <div class="settings-category">
                <h3 class="settings-category-title">${title}</h3>
                <div class="settings-group">
        `;

        for (var i = 0; i < keys.length; i++) {
            html += this._renderPreference(keys[i], meta[keys[i]], auth);
        }

        html += `</div></div>`;
        return html;
    },

    _renderPreference: function(key, m, auth) {
        if (!m) return '';
        var current = auth.get(key);

        if (m.type === 'toggle') {
            return `
                <div class="settings-item" data-pref-key="${key}">
                    <div class="settings-item-info">
                        <span class="settings-item-label">${m.label}</span>
                        ${m.description ? `<span class="settings-item-desc">${m.description}</span>` : ''}
                    </div>
                    <div class="settings-toggle ${current ? 'active' : ''}" data-toggle-key="${key}">
                        <div class="settings-toggle-knob"></div>
                    </div>
                </div>
            `;
        }

        if (m.type === 'select') {
            var opts = m.options.map(function(o) {
                var sel = o.value === current ? 'selected' : '';
                return `<option value="${o.value}" ${sel}>${o.label}</option>`;
            }).join('');
            return `
                <div class="settings-item" data-pref-key="${key}">
                    <div class="settings-item-info">
                        <span class="settings-item-label">${m.label}</span>
                        ${m.description ? `<span class="settings-item-desc">${m.description}</span>` : ''}
                    </div>
                    <select class="settings-select" data-select-key="${key}">${opts}</select>
                </div>
            `;
        }

        if (m.type === 'time') {
            return `
                <div class="settings-item" data-pref-key="${key}">
                    <div class="settings-item-info">
                        <span class="settings-item-label">${m.label}</span>
                        ${m.description ? `<span class="settings-item-desc">${m.description}</span>` : ''}
                    </div>
                    <input type="time" class="settings-time" data-time-key="${key}" value="${current || '19:00'}">
                </div>
            `;
        }

        if (m.type === 'days') {
            var days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            var selected = current || [];
            return `
                <div class="settings-item settings-item-days" data-pref-key="${key}">
                    <div class="settings-item-info">
                        <span class="settings-item-label">${m.label}</span>
                        ${m.description ? `<span class="settings-item-desc">${m.description}</span>` : ''}
                    </div>
                    <div class="settings-days">
                        ${days.map(function(d, i) {
                            var active = selected.indexOf(i) !== -1;
                            return `<button class="settings-day ${active ? 'active' : ''}" data-day-index="${i}" data-day-parent="${key}">${d}</button>`;
                        }).join('')}
                    </div>
                </div>
            `;
        }

        return '';
    },

    // ============================================================
    // 事件绑定
    // ============================================================
    _bindEvents: function() {
        var self = this;
        var auth = window.LawAIApp.SettingsAuthority;

        // Toggle
        document.querySelectorAll('[data-toggle-key]').forEach(function(el) {
            el.addEventListener('click', function() {
                var key = this.getAttribute('data-toggle-key');
                var current = auth.get(key);
                var result = auth.set(key, !current);
                if (result.success) {
                    this.classList.toggle('active');
                    self._applyConsumers();
                    if (window.LawAIApp?.Toast?.success) LawAIApp.Toast.success('Saved');
                } else {
                    if (window.LawAIApp?.Toast?.error) LawAIApp.Toast.error('Couldn\'t save this preference.');
                }
            });
        });

        // Select
        document.querySelectorAll('[data-select-key]').forEach(function(el) {
            el.addEventListener('change', function() {
                var key = this.getAttribute('data-select-key');
                var value = this.value;

                // 数字类型的偏好
                if (key === 'preferredSessionDuration' || key === 'defaultReminderMinutes') {
                    value = parseInt(value, 10);
                }

                var result = auth.set(key, value);
                if (result.success) {
                    self._applyConsumers();
                    if (window.LawAIApp?.Toast?.success) LawAIApp.Toast.success('Saved');
                } else {
                    if (window.LawAIApp?.Toast?.error) LawAIApp.Toast.error('Couldn\'t save this preference.');
                }
            });
        });

        // Time
        document.querySelectorAll('[data-time-key]').forEach(function(el) {
            el.addEventListener('change', function() {
                var key = this.getAttribute('data-time-key');
                var value = this.value;
                var result = auth.set(key, value);
                if (result.success) {
                    if (window.LawAIApp?.Toast?.success) LawAIApp.Toast.success('Saved');
                }
            });
        });

        // Days
        document.querySelectorAll('[data-day-parent]').forEach(function(el) {
            el.addEventListener('click', function() {
                var key = this.getAttribute('data-day-parent');
                var idx = parseInt(this.getAttribute('data-day-index'), 10);
                var current = auth.get(key) || [];
                var next;
                if (current.indexOf(idx) !== -1) {
                    next = current.filter(function(d) { return d !== idx; });
                } else {
                    next = current.concat([idx]).sort();
                }
                var result = auth.set(key, next);
                if (result.success) {
                    this.classList.toggle('active');
                    if (window.LawAIApp?.Toast?.success) LawAIApp.Toast.success('Saved');
                }
            });
        });

        // Actions
        document.querySelectorAll('[data-action]').forEach(function(el) {
            el.addEventListener('click', function() {
                var action = this.getAttribute('data-action');
                self._handleAction(action);
            });
        });
    },

    // ============================================================
    // Actions
    // ============================================================
    _handleAction: function(action) {
        var auth = window.LawAIApp.SettingsAuthority;

        if (action === 'export-backup') {
            try {
                var data = {};
                for (var i = 0; i < localStorage.length; i++) {
                    var key = localStorage.key(i);
                    if (key && (key.indexOf('lawai_') === 0 || key.indexOf('notesAuthority') === 0 || key.indexOf('calendarAuthority') === 0 || key.indexOf('settingsAuthority') === 0)) {
                        data[key] = localStorage.getItem(key);
                    }
                }
                var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                var url = URL.createObjectURL(blob);
                var a = document.createElement('a');
                a.href = url;
                a.download = 'lawai_backup_' + new Date().toISOString().split('T')[0] + '.json';
                a.click();
                URL.revokeObjectURL(url);
                if (window.LawAIApp?.Toast?.success) LawAIApp.Toast.success('💾 Backup downloaded');
            } catch (e) {
                if (window.LawAIApp?.Toast?.error) LawAIApp.Toast.error('Export failed.');
            }
            return;
        }

        if (action === 'reset-notes') {
            if (!confirm('Reset all notes? This cannot be undone.')) return;
            var notesAuth = window.LawAIApp.NotesAuthority;
            if (notesAuth && notesAuth.reset) {
                notesAuth.reset();
                if (window.LawAIApp?.Toast?.success) LawAIApp.Toast.success('📝 Notes reset');
            }
            return;
        }

        if (action === 'reset-calendar') {
            if (!confirm('Reset all calendar schedules? This cannot be undone.')) return;
            var calAuth = window.LawAIApp.CalendarAuthority;
            if (calAuth && calAuth.reset) {
                calAuth.reset();
                if (window.LawAIApp?.Toast?.success) LawAIApp.Toast.success('📅 Calendar reset');
            }
            return;
        }

        if (action === 'reset-preferences') {
            if (!confirm('Reset all preferences to defaults?')) return;
            var r = auth.resetAll();
            if (r.success) {
                if (window.LawAIApp?.Toast?.success) LawAIApp.Toast.success('⚙️ Preferences reset');
                this.render();
            }
            return;
        }

        if (action === 'reset-progress') {
            if (!confirm('⚠️ Reset ALL progress? This cannot be undone.\n\nNotes, Calendar, and Preferences will be preserved.')) return;
            if (window.LawAIApp?.FactoryReset?.execute) {
                window.LawAIApp.FactoryReset.execute();
            } else {
                // 安全 fallback: 只清学习数据
                var preserved = {};
                ['settingsAuthority_v1', 'notesAuthority_v1', 'calendarAuthority_schedules_v2'].forEach(function(k) {
                    var v = localStorage.getItem(k);
                    if (v) preserved[k] = v;
                });
                localStorage.clear();
                for (var k in preserved) {
                    if (preserved.hasOwnProperty(k)) localStorage.setItem(k, preserved[k]);
                }
                location.reload();
            }
            return;
        }
    },

    // ============================================================
    // Consumers — 把偏好应用到实际 UI
    // ============================================================
    _applyConsumers: function() {
        var auth = window.LawAIApp.SettingsAuthority;
        if (!auth || !auth.isReady) return;

        var theme = auth.get('theme');
        var layout = auth.get('layout');
        var density = auth.get('density');
        var reducedMotion = auth.get('reducedMotion');
        var highContrast = auth.get('highContrast');
        var fontSize = auth.get('fontSize');

        var body = document.body;

        // Theme
        body.classList.remove('theme-light', 'theme-dark', 'theme-system');
        body.classList.add('theme-' + theme);

        // 兼容旧逻辑
        if (theme === 'light') {
            body.classList.add('light-mode');
        } else {
            body.classList.remove('light-mode');
        }

        // Layout
        body.classList.remove('layout-compact', 'layout-comfortable');
        body.classList.add('layout-' + layout);

        // Density
        body.classList.remove('density-compact', 'density-normal', 'density-spacious');
        body.classList.add('density-' + density);

        // Reduced Motion
        if (reducedMotion) body.classList.add('reduce-motion');
        else body.classList.remove('reduce-motion');

        // High Contrast
        if (highContrast) body.classList.add('high-contrast');
        else body.classList.remove('high-contrast');

        // Font Size
        var fontScale = fontSize === 'small' ? 0.9 : fontSize === 'large' ? 1.15 : 1.0;
        document.documentElement.style.setProperty('--font-scale', fontScale);
    }
};

console.log('[Settings] ✅ Module loaded (v2.0.0 — Part 177)');
