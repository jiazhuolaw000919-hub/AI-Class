// ================================================================
// ENGINE: ExperienceEngine
// LAYER: UI Layer
// DOMAIN: User Experience & Engagement
// RECOVERY STATUS: 🟢 Canon Locked
// VERSION: 1.0.0
// ================================================================
//
// PURPOSE
// ================================================================
//   Owns the user experience layer of the platform.
//   Manages micro-interactions, celebrations, themes, and focus mode.
//   Creates emotional engagement and makes learning feel rewarding.
//
// PUBLIC API
// ================================================================
//   celebrate(type, options)            -> void
//   showXPGain(amount, element)         -> void
//   setTheme(themeName)                 -> void
//   getTheme()                          -> string
//   toggleFocusMode()                   -> void
//   isFocusMode()                       -> boolean
//   getDailyGreeting(progress)          -> string
//   showAchievement(name, icon)         -> void
//   animateProgress(element, from, to)  -> void
//   getStatus()                         -> Status object
//
// THEMES
// ================================================================
//   - dark     : Default dark theme
//   - light    : Light theme
//   - midnight : Deep blue theme
//   - forest   : Green/nature theme
//   - ocean    : Blue/calm theme
//
// DEPENDENCIES
// ================================================================
//   - StorageEngine (optional) : For saving theme preference
//   - EventBus (optional)     : For emitting events
//
// STORAGE
// ================================================================
//   - Key: 'lawai_experience_settings'
//   - Format: JSON
//   - Schema: { theme, focusMode, animations }
//
// EVENTS
// ================================================================
//   EMITTED:
//   - 'ThemeChanged'      : When theme changes
//     Payload: { theme }
//   - 'FocusModeToggled'  : When focus mode toggles
//     Payload: { enabled }
//   - 'AchievementUnlocked' : When achievement is unlocked
//     Payload: { name, icon }
//
// ================================================================

window.LawAIApp = window.LawAIApp || {};

LawAIApp.ExperienceEngine = {
    // ============================================================
    // ENGINE METADATA
    // ============================================================
    _engineName: 'ExperienceEngine',
    _engineVersion: '1.0.0',
    _recoveryStatus: '🟢 Canon Locked',
    _layer: 'UI Layer',
    _domain: 'User Experience & Engagement',

    // ============================================================
    // STATE
    // ============================================================
    _settings: {
        theme: 'dark',
        focusMode: false,
        animations: true,
        celebrations: true,
        soundEnabled: false
    },

    _themes: {
        dark: {
            name: 'Dark',
            background: '#0b1220',
            surface: '#1a1a2e',
            card: 'rgba(255,255,255,0.04)',
            text: '#e2e8f0',
            textMuted: '#94a3b8',
            primary: '#4a9eff',
            border: 'rgba(255,255,255,0.06)'
        },
        light: {
            name: 'Light',
            background: '#f8fafc',
            surface: '#ffffff',
            card: 'rgba(0,0,0,0.04)',
            text: '#0b1220',
            textMuted: '#64748b',
            primary: '#4a9eff',
            border: 'rgba(0,0,0,0.06)'
        },
        midnight: {
            name: 'Midnight',
            background: '#0f172a',
            surface: '#1e293b',
            card: 'rgba(255,255,255,0.04)',
            text: '#e2e8f0',
            textMuted: '#94a3b8',
            primary: '#818cf8',
            border: 'rgba(255,255,255,0.06)'
        },
        forest: {
            name: 'Forest',
            background: '#0a1f0a',
            surface: '#162b16',
            card: 'rgba(255,255,255,0.04)',
            text: '#e2e8f0',
            textMuted: '#94a3b8',
            primary: '#22c55e',
            border: 'rgba(255,255,255,0.06)'
        },
        ocean: {
            name: 'Ocean',
            background: '#0a1628',
            surface: '#162a40',
            card: 'rgba(255,255,255,0.04)',
            text: '#e2e8f0',
            textMuted: '#94a3b8',
            primary: '#38bdf8',
            border: 'rgba(255,255,255,0.06)'
        }
    },

    // ============================================================
    // PUBLIC API
    // ============================================================

    /**
     * celebrate(type, options)
     * 
     * Triggers a celebration effect.
     * 
     * @param {string} type - 'lesson_complete' | 'streak_milestone' | 'achievement' | 'level_up'
     * @param {Object} options - Additional options
     */
    celebrate: function(type, options) {
        options = options || {};
        
        if (!this._settings.celebrations) return;

        var effects = {
            'lesson_complete': {
                emojis: ['🎉', '⭐', '🌟', '✨', '🎊', '💪'],
                count: 20,
                duration: 2500
            },
            'streak_milestone': {
                emojis: ['🔥', '💪', '🏆', '⭐', '🌟'],
                count: 15,
                duration: 2000
            },
            'achievement': {
                emojis: ['🏆', '🎖️', '⭐', '🌟', '👑'],
                count: 12,
                duration: 2000
            },
            'level_up': {
                emojis: ['⬆️', '⭐', '🌟', '🎉', '💪'],
                count: 18,
                duration: 2500
            }
        };

        var effect = effects[type] || effects['achievement'];
        var emojis = options.emojis || effect.emojis;
        var count = options.count || effect.count;
        var duration = options.duration || effect.duration;

        this._createFloatingEmojis(emojis, count, duration);
        
        // 触发事件
        LawAIApp.EventBus?.emit?.('CelebrationTriggered', { type: type, options: options });
    },

    /**
     * showXPGain(amount, element)
     * 
     * Shows XP gain animation on an element.
     * 
     * @param {number} amount - XP amount to show
     * @param {HTMLElement} element - Element to animate on
     */
    showXPGain: function(amount, element) {
        if (!element) return;

        var xpEl = document.createElement('div');
        xpEl.style.cssText = `
            position: absolute;
            color: #fbbf24;
            font-size: 18px;
            font-weight: 700;
            pointer-events: none;
            z-index: 1000;
            opacity: 1;
            transition: all 1.5s ease-out;
        `;
        xpEl.textContent = '+' + amount + ' XP';

        var rect = element.getBoundingClientRect();
        xpEl.style.left = (rect.left + rect.width / 2 - 30) + 'px';
        xpEl.style.top = (rect.top - 10) + 'px';

        document.body.appendChild(xpEl);

        requestAnimationFrame(function() {
            xpEl.style.transform = 'translateY(-80px) scale(1.3)';
            xpEl.style.opacity = '0';
        });

        setTimeout(function() {
            if (xpEl.parentNode) xpEl.parentNode.removeChild(xpEl);
        }, 2000);
    },

    /**
     * setTheme(themeName)
     * 
     * Sets the current theme.
     * 
     * @param {string} themeName - 'dark' | 'light' | 'midnight' | 'forest' | 'ocean'
     */
    setTheme: function(themeName) {
        var theme = this._themes[themeName];
        if (!theme) {
            console.warn('⚠️ Theme not found:', themeName);
            return;
        }

        this._settings.theme = themeName;
        this._applyTheme(theme);
        this._saveSettings();

        LawAIApp.EventBus?.emit?.('ThemeChanged', { theme: themeName });
        console.log('🎨 Theme set to:', themeName);
    },

    /**
     * getTheme()
     * 
     * @returns {string} Current theme name
     */
    getTheme: function() {
        return this._settings.theme;
    },

    /**
     * toggleFocusMode()
     * 
     * Toggles focus mode on/off.
     */
    toggleFocusMode: function() {
        this._settings.focusMode = !this._settings.focusMode;
        this._applyFocusMode(this._settings.focusMode);
        this._saveSettings();

        LawAIApp.EventBus?.emit?.('FocusModeToggled', { enabled: this._settings.focusMode });
        
        if (LawAIApp.Toast && typeof LawAIApp.Toast.info === 'function') {
            LawAIApp.Toast.info(this._settings.focusMode ? '🧘 Focus Mode enabled' : 'Focus Mode disabled');
        }
    },

    /**
     * isFocusMode()
     * 
     * @returns {boolean} Whether focus mode is enabled
     */
    isFocusMode: function() {
        return this._settings.focusMode;
    },

    /**
     * getDailyGreeting(progress)
     * 
     * Gets a daily greeting based on time and progress.
     * 
     * @param {Object} progress - Progress object
     * @returns {string} Personalized greeting
     */
    getDailyGreeting: function(progress) {
        var hour = new Date().getHours();
        var timeGreeting = hour < 12 ? '🌅 Good morning' : hour < 17 ? '☀️ Good afternoon' : '🌇 Good evening';

        var completed = progress?.completedLessons?.length || 0;
        var streak = progress?.streak || 0;

        var name = 'Learner';

        if (completed >= 365) {
            return timeGreeting + ', ' + name + '! 🏆 You are a true master!';
        }
        if (streak >= 30) {
            return timeGreeting + ', ' + name + '! 🔥 ' + streak + ' days! You\'re unstoppable!';
        }
        if (streak >= 7) {
            return timeGreeting + ', ' + name + '! 💪 ' + streak + ' days streak! Keep going!';
        }
        if (completed >= 10) {
            return timeGreeting + ', ' + name + '! 🌟 You\'ve completed ' + completed + ' lessons!';
        }
        if (completed > 0) {
            return timeGreeting + ', ' + name + '! 📖 Ready for your next lesson?';
        }
        return timeGreeting + ', ' + name + '! 🚀 Ready to start your AI journey?';
    },

    /**
     * showAchievement(name, icon)
     * 
     * Shows an achievement unlock notification.
     * 
     * @param {string} name - Achievement name
     * @param {string} icon - Achievement icon
     */
    showAchievement: function(name, icon) {
        if (!this._settings.celebrations) return;

        var container = document.createElement('div');
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(20,20,40,0.95);
            border: 1px solid rgba(74,158,255,0.2);
            border-radius: 12px;
            padding: 16px 24px;
            color: #e2e8f0;
            font-family: 'Inter', sans-serif;
            z-index: 10000;
            display: flex;
            align-items: center;
            gap: 12px;
            transform: translateX(120%);
            transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
            box-shadow: 0 8px 32px rgba(0,0,0,0.4);
            max-width: 400px;
        `;
        container.innerHTML = `
            <div style="font-size: 32px;">${icon || '🏆'}</div>
            <div>
                <div style="font-size: 12px; color: #94a3b8;">Achievement Unlocked!</div>
                <div style="font-size: 16px; font-weight: 600;">${name}</div>
            </div>
        `;

        document.body.appendChild(container);

        // 进入动画
        requestAnimationFrame(function() {
            container.style.transform = 'translateX(0)';
        });

        // 3秒后淡出
        setTimeout(function() {
            container.style.transform = 'translateX(120%)';
            setTimeout(function() {
                if (container.parentNode) container.parentNode.removeChild(container);
            }, 500);
        }, 3500);

        LawAIApp.EventBus?.emit?.('AchievementUnlocked', { name: name, icon: icon });
    },

    /**
     * animateProgress(element, from, to)
     * 
     * Animates a progress bar from one value to another.
     * 
     * @param {HTMLElement} element - Progress bar element
     * @param {number} from - Starting value (0-100)
     * @param {number} to - Ending value (0-100)
     */
    animateProgress: function(element, from, to) {
        if (!element) return;

        from = from || 0;
        to = to || 0;
        var duration = 800;
        var startTime = Date.now();

        function update() {
            var elapsed = Date.now() - startTime;
            var progress = Math.min(elapsed / duration, 1);
            var value = from + (to - from) * progress;
            element.style.width = Math.round(value) + '%';
            
            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }

        requestAnimationFrame(update);
    },

    // ============================================================
    // ENGINE STATUS
    // ============================================================
    getStatus: function() {
        return {
            name: this._engineName,
            version: this._engineVersion,
            recoveryStatus: this._recoveryStatus,
            layer: this._layer,
            domain: this._domain,
            currentTheme: this._settings.theme,
            availableThemes: Object.keys(this._themes),
            focusMode: this._settings.focusMode,
            animations: this._settings.animations,
            celebrations: this._settings.celebrations,
            storageAvailable: !!(LawAIApp.StorageEngine && typeof LawAIApp.StorageEngine.get === 'function'),
            eventBusAvailable: !!(LawAIApp.EventBus && typeof LawAIApp.EventBus.emit === 'function')
        };
    },

    // ============================================================
    // PRIVATE IMPLEMENTATION
    // ============================================================

    _createFloatingEmojis: function(emojis, count, duration) {
        for (var i = 0; i < count; i++) {
            var el = document.createElement('div');
            var emoji = emojis[Math.floor(Math.random() * emojis.length)];
            var size = 20 + Math.random() * 30;
            var left = 10 + Math.random() * 80;
            var delay = Math.random() * 0.5;

            el.textContent = emoji;
            el.style.cssText = `
                position: fixed;
                font-size: ${size}px;
                left: ${left}%;
                top: ${30 + Math.random() * 40}%;
                pointer-events: none;
                z-index: 9999;
                opacity: 1;
                transition: all ${duration / 1000}s ease-out;
                transition-delay: ${delay}s;
                transform: translateY(0) rotate(0deg) scale(1);
            `;

            document.body.appendChild(el);

            setTimeout(function(elem) {
                elem.style.transform = `translateY(-${150 + Math.random() * 150}px) rotate(${Math.random() * 360}deg) scale(1.5)`;
                elem.style.opacity = '0';
            }, delay * 1000, el);

            setTimeout(function(elem) {
                if (elem.parentNode) elem.parentNode.removeChild(elem);
            }, duration + 500 + delay * 1000, el);
        }
    },

    _applyTheme: function(theme) {
        var root = document.documentElement;
        root.style.setProperty('--bg-color', theme.background);
        root.style.setProperty('--surface-color', theme.surface);
        root.style.setProperty('--card-color', theme.card);
        root.style.setProperty('--text-color', theme.text);
        root.style.setProperty('--text-muted', theme.textMuted);
        root.style.setProperty('--primary-color', theme.primary);
        root.style.setProperty('--border-color', theme.border);
    },

    _applyFocusMode: function(enabled) {
        var root = document.getElementById('law-runtime-root') || document.body;
        if (enabled) {
            root.classList.add('focus-mode');
            // 隐藏非核心元素
            var nav = document.querySelector('.bottom-nav');
            if (nav) nav.style.display = 'none';
        } else {
            root.classList.remove('focus-mode');
            var nav = document.querySelector('.bottom-nav');
            if (nav) nav.style.display = '';
        }
    },

    _saveSettings: function() {
        try {
            if (LawAIApp.StorageEngine && typeof LawAIApp.StorageEngine.set === 'function') {
                LawAIApp.StorageEngine.set('experience_settings', this._settings);
            }
        } catch (e) {}
    },

    _loadSettings: function() {
        try {
            if (LawAIApp.StorageEngine && typeof LawAIApp.StorageEngine.get === 'function') {
                var saved = LawAIApp.StorageEngine.get('experience_settings');
                if (saved) {
                    this._settings = { ...this._settings, ...saved };
                    // 应用主题
                    this._applyTheme(this._themes[this._settings.theme] || this._themes.dark);
                    if (this._settings.focusMode) {
                        this._applyFocusMode(true);
                    }
                }
            }
        } catch (e) {}
    }
};

// ============================================================
// AUTO-INIT
// ============================================================
setTimeout(function() {
    LawAIApp.ExperienceEngine._loadSettings();
    console.log('✨ ExperienceEngine initialized, theme:', LawAIApp.ExperienceEngine.getTheme());
}, 200);

console.log('✨ ExperienceEngine V1.0 ready');
