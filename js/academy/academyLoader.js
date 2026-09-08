// js/academy/academyLoader.js
// Part 57.4-57.6 REBUILD — AcademyLoader Architecture Reset
// v2.1.0 — 添加 Calendar/Settings/CalendarAuthority 懒加载支持

(function() {
  'use strict';

  if (window.LawAIApp && window.LawAIApp.AcademyLoader) {
    console.warn('[AcademyLoader] Already exists, skipping...');
    return;
  }

  class AcademyLoader {
    constructor() {
      this.version = '2.1.0';
      this.status = 'idle';
      this.health = 'pending';

      this.modules = [];
      this.failedModules = [];
      this.loadedModules = [];

      this.started = false;
      this.startTime = null;
      this.endTime = null;
      this.startPromise = null;

      this._manifest = null;

      this._lazyLoaded = {
          calendar: false,
          settings: false,
          calendarAuthority: false,
          notesAuthority: false  // Part 164
      };
      this._lazyLoading = {
          calendar: false,
          settings: false,
          calendarAuthority: false,
          notesAuthority: false  // Part 164
      };
    
      this._moduleChecks = {
        academyExperienceManager: function() { return !!(window.LawAIApp && window.LawAIApp.AcademyExperienceManager); },
        academyView: function() { return !!(window.LawAIApp && window.LawAIApp.AcademyView); },
        schoolRegistry: function() { return !!(window.LawAIApp && window.LawAIApp.SchoolRegistry); },
        programRegistry: function() { return !!(window.LawAIApp && window.LawAIApp.ProgramRegistry); },
        courseRegistry: function() { return !!(window.LawAIApp && window.LawAIApp.CourseRegistry); },
        curriculumRegistry: function() { return !!(window.LawAIApp && window.LawAIApp.CurriculumRegistry); },
        curriculumSeed: function() { return !!(window.LawAIApp && window.LawAIApp.CurriculumSeed); },
        contentLoader: function() { return !!(window.LawAIApp && window.LawAIApp.ContentLoader); },
        contentRegistry: function() { return !!(window.LawAIApp && window.LawAIApp.ContentRegistry); },
        contentAdapter: function() { return !!(window.LawAIApp && window.LawAIApp.ContentAdapter); },
        subjectRegistry: function() { return !!(window.LawAIApp && window.LawAIApp.SubjectRegistry); },
        contentValidator: function() { return !!(window.LawAIApp && window.LawAIApp.ContentValidator); },
        practiceEngine: function() { return !!(window.LawAIApp && window.LawAIApp.PracticeEngine); },
        practiceModule: function() { return !!(window.LawAIApp && window.LawAIApp.PracticeModule); },
        practiceProgress: function() { return !!(window.LawAIApp && window.LawAIApp.PracticeProgress); },
        knowledgeCapture: function() { return !!(window.LawAIApp && window.LawAIApp.KnowledgeCapture); },
        knowledgeEditor: function() { return !!(window.LawAIApp && window.LawAIApp.KnowledgeEditor); },
        knowledgeLinker: function() { return !!(window.LawAIApp && window.LawAIApp.KnowledgeLinker); },
        knowledgeCard: function() { return !!(window.LawAIApp && window.LawAIApp.KnowledgeCard); },
        secondBrain: function() { return !!(window.LawAIApp && window.LawAIApp.SecondBrain); },
        notes: function() { return !!(window.LawAIApp && window.LawAIApp.Notes); }
      };
    }

    // ============================================================
    // 1. PUBLIC API
    // ============================================================

    async start() {
      if (this.status === 'ready') {
        console.log('[AcademyLoader] Already ready');
        return this.getStatus();
      }
      if (this.started && this.startPromise) {
        console.log('[AcademyLoader] Already starting, returning existing promise');
        return this.startPromise;
      }
      this.started = true;
      this.startPromise = this._doStart();
      return this.startPromise;
    }

    getStatus() {
      return {
        version: this.version,
        status: this.status,
        health: this.health,
        loadedModules: this.loadedModules,
        failedModules: this.failedModules,
        started: this.started,
        startTime: this.startTime,
        endTime: this.endTime,
        duration: this.endTime ? this.endTime - this.startTime : null
      };
    }

    async restart() {
      console.log('[AcademyLoader] 🔄 Restarting...');
      this.status = 'idle';
      this.health = 'pending';
      this.started = false;
      this.startPromise = null;
      this.modules = [];
      this.failedModules = [];
      this.loadedModules = [];
      this.startTime = null;
      this.endTime = null;
      this._manifest = null;
      return this.start();
    }

    // ============================================================
    // 🔥 Calendar 懒加载（依赖 CalendarAuthority）
    // ============================================================

    loadCalendarLazy(onReady, onFail) {
        var moduleName = 'calendar';
        if (this._lazyLoaded[moduleName]) {
            console.log('[AcademyLoader] ⏭️ Calendar already lazy-loaded');
            if (onReady) onReady(window.LawAIApp?.Calendar);
            return;
        }
        if (this._lazyLoading[moduleName]) {
            console.log('[AcademyLoader] ⏳ Calendar already loading...');
            return;
        }
        this.loadCalendarAuthority(function(auth) {
            console.log('[AcademyLoader] ✅ CalendarAuthority ready, loading Calendar UI...');
            this._loadCalendarUI(onReady, onFail);
        }.bind(this), function(error) {
            console.warn('[AcademyLoader] ⚠️ CalendarAuthority failed, loading Calendar anyway...');
            this._loadCalendarUI(onReady, onFail);
        }.bind(this));
    }

    _loadCalendarUI(onReady, onFail) {
        var moduleName = 'calendar';
        if (this._lazyLoaded[moduleName]) {
            if (onReady) onReady(window.LawAIApp?.Calendar);
            return;
        }
        if (this._lazyLoading[moduleName]) return;
        this._lazyLoading[moduleName] = true;
        console.log('[AcademyLoader] 🔄 Loading Calendar UI...');

        var files = [
            '/js/calendarEngine.js',
            '/js/calendarPlanner.js',
            '/js/calendarTimeline.js',
            '/js/calendarEngineAdapter.js',
            '/js/calendar/CalendarSurfaceAdapter.js',
            '/js/calendar/CalendarViewModel.js',
            '/js/calendar/CalendarEventAdapter.js',
            '/js/calendar/CalendarRenderer.js',
            '/js/calendar.js'
        ];

        this._loadScriptsSequentially(files, function(success) {
            this._lazyLoading[moduleName] = false;
            if (success && window.LawAIApp?.Calendar) {
                this._lazyLoaded[moduleName] = true;
                console.log('[AcademyLoader] ✅ Calendar UI loaded');
                if (onReady) onReady(window.LawAIApp.Calendar);
            } else {
                console.warn('[AcademyLoader] ⚠️ Calendar UI load incomplete');
                if (onFail) onFail('Calendar UI load failed');
            }
        }.bind(this));
    }

    loadSettingsLazy(onReady, onFail) {
      var moduleName = 'settings';
      if (this._lazyLoaded[moduleName]) {
        console.log('[AcademyLoader] ⏭️ Settings already lazy-loaded');
        if (onReady) onReady(window.LawAIApp?.Settings);
        return;
      }
      if (this._lazyLoading[moduleName]) {
        console.log('[AcademyLoader] ⏳ Settings already loading...');
        return;
      }
      this._lazyLoading[moduleName] = true;
      console.log('[AcademyLoader] 🔄 Lazy loading Settings...');

      var files = ['/js/settings.js'];

      this._loadScriptsSequentially(files, function(success) {
        this._lazyLoading[moduleName] = false;
        if (success && window.LawAIApp?.Settings) {
          this._lazyLoaded[moduleName] = true;
          console.log('[AcademyLoader] ✅ Settings lazy-loaded');
          if (onReady) onReady(window.LawAIApp.Settings);
        } else {
          console.warn('[AcademyLoader] ⚠️ Settings lazy-load incomplete');
          if (onFail) onFail('Settings load incomplete');
        }
      }.bind(this));
    }

    // ============================================================
    // 🔥 Part 163: CalendarAuthority 懒加载
    // ============================================================
    loadCalendarAuthority(onReady, onFail) {
        var moduleName = 'calendarAuthority';
        if (this._lazyLoaded[moduleName]) {
            console.log('[AcademyLoader] ⏭️ CalendarAuthority already lazy-loaded');
            if (onReady) onReady(window.LawAIApp?.CalendarAuthority);
            return;
        }
        if (this._lazyLoading[moduleName]) {
            console.log('[AcademyLoader] ⏳ CalendarAuthority already loading...');
            this._waitForCalendarAuthority(onReady, onFail);
            return;
        }
        this._lazyLoading[moduleName] = true;
        console.log('[AcademyLoader] 🔄 Lazy loading CalendarAuthority...');

        var files = ['/js/calendar/CalendarAuthority.js'];

        this._loadScriptsSequentially(files, function(success) {
            this._lazyLoading[moduleName] = false;
            if (success && window.LawAIApp?.CalendarAuthority) {
                this._lazyLoaded[moduleName] = true;
                console.log('[AcademyLoader] ✅ CalendarAuthority loaded');

                var auth = window.LawAIApp.CalendarAuthority;
                if (auth.initialized) {
                    if (onReady) onReady(auth);
                } else {
                    auth.onReady(function(readyAuth) {
                        if (onReady) onReady(readyAuth);
                    });
                }
            } else {
                console.warn('[AcademyLoader] ⚠️ CalendarAuthority load failed');
                if (onFail) onFail('CalendarAuthority load failed');
            }
        }.bind(this));
    }

    _waitForCalendarAuthority(onReady, onFail) {
        var attempts = 0;
        var maxAttempts = 50;
        var interval = setInterval(function() {
            attempts++;
            var auth = window.LawAIApp?.CalendarAuthority;
            if (auth && auth.initialized) {
                clearInterval(interval);
                if (onReady) onReady(auth);
                return;
            }
            if (attempts >= maxAttempts) {
                clearInterval(interval);
                console.warn('[AcademyLoader] ⏰ CalendarAuthority wait timeout');
                if (onFail) onFail('Timeout waiting for CalendarAuthority');
            }
        }, 100);
    }

    // ============================================================
    // Part 164: NotesAuthority 懒加载
    // ============================================================
    
    loadNotesAuthority: function(onReady, onFail) {
        var moduleName = 'notesAuthority';
        if (this._lazyLoaded[moduleName]) {
            console.log('[AcademyLoader] ⏭️ NotesAuthority already lazy-loaded');
            if (onReady) onReady(window.LawAIApp?.NotesAuthority);
            return;
        }
        if (this._lazyLoading[moduleName]) {
            console.log('[AcademyLoader] ⏳ NotesAuthority already loading...');
            this._waitForNotesAuthority(onReady, onFail);
            return;
        }
        this._lazyLoading[moduleName] = true;
        console.log('[AcademyLoader] 🔄 Lazy loading NotesAuthority...');
    
        var files = ['/js/notes/NotesAuthority.js'];
    
        this._loadScriptsSequentially(files, function(success) {
            this._lazyLoading[moduleName] = false;
            if (success && window.LawAIApp?.NotesAuthority) {
                this._lazyLoaded[moduleName] = true;
                console.log('[AcademyLoader] ✅ NotesAuthority loaded');
    
                var auth = window.LawAIApp.NotesAuthority;
                if (auth.initialized) {
                    if (onReady) onReady(auth);
                } else {
                    auth.onReady(function(readyAuth) {
                        if (onReady) onReady(readyAuth);
                    });
                }
            } else {
                console.warn('[AcademyLoader] ⚠️ NotesAuthority load failed');
                if (onFail) onFail('NotesAuthority load failed');
            }
        }.bind(this));
    },
    
    _waitForNotesAuthority: function(onReady, onFail) {
        var attempts = 0;
        var maxAttempts = 50;
        var interval = setInterval(function() {
            attempts++;
            var auth = window.LawAIApp?.NotesAuthority;
            if (auth && auth.initialized) {
                clearInterval(interval);
                if (onReady) onReady(auth);
                return;
            }
            if (attempts >= maxAttempts) {
                clearInterval(interval);
                console.warn('[AcademyLoader] ⏰ NotesAuthority wait timeout');
                if (onFail) onFail('Timeout waiting for NotesAuthority');
            }
        }, 100);
    },

    isLazyLoaded(moduleName) {
      return !!this._lazyLoaded[moduleName];
    }

    // ============================================================
    // 🔥 内部：顺序加载脚本
    // ============================================================

    _loadScriptsSequentially(files, callback) {
      var loaded = 0;
      var failed = [];
      files.forEach(function(file) {
        var script = document.createElement('script');
        script.src = file + '?v=' + Date.now();
        script.async = true;
        script.onload = function() {
          loaded++;
          console.log('[AcademyLoader] ✅ Loaded:', file);
          checkComplete();
        };
        script.onerror = function() {
          loaded++;
          failed.push(file);
          console.warn('[AcademyLoader] ❌ Failed:', file);
          checkComplete();
        };
        document.head.appendChild(script);
      });
      function checkComplete() {
        if (loaded < files.length) return;
        var success = failed.length === 0;
        if (success) {
          console.log('[AcademyLoader] ✅ All files loaded');
        } else {
          console.warn('[AcademyLoader] ⚠️ Some files failed:', failed);
        }
        callback(success);
      }
    }

    // ============================================================
    // Part 164: Academy UI Helpers (从 academy.html 移入)
    // ============================================================
    
    /**
     * 创建内联 Calendar (Fallback)
     */
    _createInlineCalendar: function() {
        return {
            currentYear: new Date().getFullYear(),
            currentMonth: new Date().getMonth(),
    
            render: function(container) {
                if (!container) container = document.getElementById('academy-root');
                if (!container) return;
    
                var monthName = new Date(this.currentYear, this.currentMonth).toLocaleString('default', { month: 'long' });
                var daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();
                var firstDay = new Date(this.currentYear, this.currentMonth, 1).getDay();
    
                var gridHTML = '';
                for (var i = 0; i < firstDay; i++) gridHTML += '<div></div>';
                for (var d = 1; d <= daysInMonth; d++) {
                    var isToday = d === new Date().getDate() && 
                                    this.currentMonth === new Date().getMonth() && 
                                    this.currentYear === new Date().getFullYear();
                    gridHTML += '<div style="padding:12px 6px;text-align:center;border-radius:8px;background:' + 
                        (isToday ? 'rgba(74,158,255,0.15)' : 'rgba(255,255,255,0.03)') + 
                        ';border:1px solid ' + (isToday ? 'rgba(74,158,255,0.3)' : 'rgba(255,255,255,0.04)') + 
                        ';color:' + (isToday ? '#4a9eff' : '#e2e8f0') + 
                        ';font-size:14px;cursor:pointer;font-family:inherit;" onclick="LawAIApp.AcademyLoader._onDayClick(' + d + ')">' + d + '</div>';
                }
    
                container.innerHTML = `
                    <div style="max-width:900px;margin:0 auto;padding:20px;color:#e2e8f0;font-family:'Inter',sans-serif;">
                        <div style="display:flex;justify-content:space-between;margin-bottom:16px;gap:12px;flex-wrap:wrap;">
                            <button onclick="window.location.href='/pages/academy.html'" style="background:rgba(74,158,255,0.08);border:1px solid rgba(74,158,255,0.15);color:#4a9eff;padding:8px 16px;border-radius:100px;cursor:pointer;font-family:inherit;font-size:13px;">← Back to Academy</button>
                            <button onclick="history.back()" style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.06);color:#94a3b8;padding:8px 16px;border-radius:100px;cursor:pointer;font-family:inherit;font-size:13px;">⬅️ 返回上一页</button>
                        </div>
                        <h2 style="margin:0 0 4px;font-size:24px;font-weight:700;">📅 Calendar</h2>
                        <p style="color:#94a3b8;margin:0 0 20px;">${monthName} ${this.currentYear}</p>
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
                            <button onclick="LawAIApp.AcademyLoader._inlineCalendarChangeMonth(-1)" style="padding:8px 20px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.06);border-radius:100px;color:#94a3b8;cursor:pointer;font-family:inherit;">←</button>
                            <span style="font-weight:600;font-size:18px;">${monthName} ${this.currentYear}</span>
                            <button onclick="LawAIApp.AcademyLoader._inlineCalendarChangeMonth(1)" style="padding:8px 20px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.06);border-radius:100px;color:#94a3b8;cursor:pointer;font-family:inherit;">→</button>
                        </div>
                        <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:6px;text-align:center;font-size:12px;color:#64748b;margin-bottom:8px;">
                            <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
                        </div>
                        <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:6px;">${gridHTML}</div>
                    </div>
                `;
            },
    
            changeMonth: function(delta) {
                this.currentMonth += delta;
                if (this.currentMonth > 11) { this.currentMonth = 0; this.currentYear++; }
                if (this.currentMonth < 0) { this.currentMonth = 11; this.currentYear--; }
                this.render();
            },
    
            _onDayClick: function(day) {
                if (window.LawAIApp?.Toast?.info) {
                    LawAIApp.Toast.info('📅 Day ' + day + ' selected');
                }
            }
        };
    },
    
    _inlineCalendarChangeMonth: function(delta) {
        var cal = window.LawAIApp?.AcademyLoader?._inlineCalendar;
        if (cal) {
            cal.changeMonth(delta);
        }
    },
    
    _onDayClick: function(day) {
        if (window.LawAIApp?.Toast?.info) {
            LawAIApp.Toast.info('📅 Day ' + day + ' selected');
        }
    },
    
    /**
     * 创建内联 Settings (Fallback)
     */
    _createInlineSettings: function() {
        return {
            render: function(container) {
                if (!container) container = document.getElementById('academy-root');
                if (!container) return;
    
                container.innerHTML = `
                    <div style="max-width:700px;margin:0 auto;padding:20px;color:#e2e8f0;font-family:'Inter',sans-serif;">
                        <div style="display:flex;justify-content:space-between;margin-bottom:16px;">
                            <button onclick="window.location.href='/pages/academy.html'" style="background:rgba(74,158,255,0.08);border:1px solid rgba(74,158,255,0.15);color:#4a9eff;padding:8px 16px;border-radius:100px;cursor:pointer;font-family:inherit;font-size:13px;">← Back to Academy</button>
                        </div>
                        <h2 style="margin:0 0 20px;font-size:24px;font-weight:700;">⚙️ Settings</h2>
                        <div style="display:flex;flex-direction:column;gap:12px;">
                            <div style="background:rgba(255,255,255,0.03);border-radius:12px;padding:16px;border:1px solid rgba(255,255,255,0.04);">
                                <h3 style="margin:0 0 8px;font-size:14px;font-weight:600;">👤 Profile</h3>
                                <p style="margin:0;color:#94a3b8;font-size:13px;">Manage your profile settings</p>
                            </div>
                            <div style="background:rgba(255,255,255,0.03);border-radius:12px;padding:16px;border:1px solid rgba(255,255,255,0.04);">
                                <h3 style="margin:0 0 8px;font-size:14px;font-weight:600;">🎯 Learning Preferences</h3>
                                <p style="margin:0;color:#94a3b8;font-size:13px;">Adjust your learning preferences</p>
                            </div>
                            <div style="background:rgba(255,255,255,0.03);border-radius:12px;padding:16px;border:1px solid rgba(255,255,255,0.04);">
                                <h3 style="margin:0 0 8px;font-size:14px;font-weight:600;">🔔 Notifications</h3>
                                <p style="margin:0;color:#94a3b8;font-size:13px;">Manage notification settings</p>
                            </div>
                        </div>
                    </div>
                `;
            }
        };
    },
    
    /**
     * 渲染 Calendar (主入口)
     */
    renderCalendar: function(container, onReady, onError) {
        if (!container) container = document.getElementById('academy-root');
        if (!container) {
            if (onError) onError('Container not found');
            return;
        }
    
        // 显示加载状态
        container.innerHTML = `
            <div class="calendar-loader" style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px 20px;color:#94a3b8;text-align:center;">
                <div style="font-size:48px;margin-bottom:16px;animation:pulse 2s ease-in-out infinite;">📅</div>
                <div style="width:40px;height:40px;border:3px solid rgba(74,158,255,0.12);border-top-color:#4a9eff;border-radius:50%;animation:spin 1s linear infinite;margin-bottom:16px;"></div>
                <p>Loading Calendar...</p>
            </div>
        `;
    
        var self = this;
    
        // 使用 AcademyLoader 加载 Calendar
        if (this.loadCalendarLazy) {
            this.loadCalendarLazy(function(calendar) {
                if (container) {
                    calendar._root = container;
                    calendar.render();
                    if (onReady) onReady(calendar);
                }
            }, function(error) {
                console.warn('[AcademyLoader] Calendar load failed:', error);
                // Fallback: 内联 Calendar
                var inlineCal = self._createInlineCalendar();
                self._inlineCalendar = inlineCal;
                inlineCal.render(container);
                if (onError) onError(error);
            });
        } else {
            // Fallback
            var inlineCal = this._createInlineCalendar();
            this._inlineCalendar = inlineCal;
            inlineCal.render(container);
            if (onReady) onReady(inlineCal);
        }
    },
    
    /**
     * 渲染 Settings (主入口)
     */
    renderSettings: function(container, onReady, onError) {
        if (!container) container = document.getElementById('academy-root');
        if (!container) {
            if (onError) onError('Container not found');
            return;
        }
    
        // 如果 Settings 已加载
        if (window.LawAIApp?.Settings && typeof window.LawAIApp.Settings.render === 'function') {
            try {
                window.LawAIApp.Settings.render();
                if (onReady) onReady(window.LawAIApp.Settings);
                return;
            } catch (e) {
                console.warn('[AcademyLoader] Settings render error:', e);
            }
        }
    
        container.innerHTML = '<div style="text-align:center;padding:60px;color:#94a3b8;">⏳ Loading Settings...</div>';
    
        var self = this;
    
        if (this.loadSettingsLazy) {
            this.loadSettingsLazy(function(settings) {
                if (container) {
                    try { settings.render(); if (onReady) onReady(settings); } catch (e) {}
                }
            }, function(error) {
                console.warn('[AcademyLoader] Settings load failed:', error);
                // Fallback
                var inlineSettings = self._createInlineSettings();
                inlineSettings.render(container);
                if (onError) onError(error);
            });
        } else {
            // Fallback
            var inlineSettings = this._createInlineSettings();
            inlineSettings.render(container);
            if (onReady) onReady(inlineSettings);
        }
    },
    
    /**
     * 更新导航高亮
     */
    updateNavHighlight: function(activeTab) {
        document.querySelectorAll('.nav-item').forEach(function(nav) {
            if (nav.dataset.tab === activeTab) {
                nav.style.color = '#4a9eff';
                nav.classList.add('active');
            } else {
                nav.style.color = '#64748b';
                nav.classList.remove('active');
            }
        });
    },

    // ============================================================
    // PRIVATE — 启动逻辑
    // ============================================================

    async _doStart() {
      this.startTime = Date.now();
      this.status = 'loading';
      this.health = 'pending';
      console.log('[AcademyLoader] 🚀 Starting Academy Loader v' + this.version);
      try {
        await this._loadManifest();
        await this._loadModules();
        this.status = 'ready';
        this.health = 'healthy';
        this.endTime = Date.now();
        this._broadcast('ACADEMY_READY', { status: this.status, version: this.version, loaded: this.loadedModules, failed: this.failedModules, duration: this.endTime - this.startTime });
        console.log('[AcademyLoader] ✅ Academy ready in', this.endTime - this.startTime, 'ms');
        console.log('[AcademyLoader] 📦 Loaded:', this.loadedModules.length, 'modules');
        return this.getStatus();
      } catch (error) {
        this.status = 'failed';
        this.health = 'unhealthy';
        console.error('[AcademyLoader] ❌ Startup failed:', error);
        this._broadcast('ACADEMY_FAILED', { error: error.message, loaded: this.loadedModules, failed: this.failedModules });
        throw error;
      }
    }

    async _loadManifest() {
      console.log('[AcademyLoader] 📋 Loading Manifest...');
      const manifest = window.LawAIApp?.AcademyManifest;
      if (!manifest) {
        console.warn('[AcademyLoader] Manifest not found, using default modules');
        this._manifest = this._getDefaultManifest();
        return;
      }
      this._manifest = manifest;
      console.log('[AcademyLoader] ✅ Manifest loaded (v' + manifest.version + ')');
      console.log('[AcademyLoader] 📦 Modules defined:', manifest.modules?.length || 0);
    }

    async _loadModules() {
      const modules = this._manifest?.modules || [];
      if (modules.length === 0) {
        console.warn('[AcademyLoader] No modules to load');
        return;
      }
      console.log('[AcademyLoader] 📦 Loading', modules.length, 'modules...');
      for (let i = 0; i < modules.length; i++) {
        const module = modules[i];
        if (!module || !module.id) continue;
        const result = await this._loadSingleModule(module);
        if (result.success) {
          this.loadedModules.push(module.id);
        } else {
          this.failedModules.push(module.id);
        }
      }
      this._broadcast('ACADEMY_MODULES_READY', { loaded: this.loadedModules, failed: this.failedModules, total: modules.length });
    }

    async _loadSingleModule(module) {
      if (!module || !module.id) return { success: false, error: 'Invalid module: missing id' };
      const exists = this._checkModuleExists(module.id);
      if (exists) return { success: true };
      if (!module.path) return { success: false, error: 'No path specified' };
      return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = module.path;
        script.async = false;
        let resolved = false;
        const timeout = setTimeout(() => { if (resolved) return; resolved = true; resolve({ success: false, error: 'Timeout' }); }, 10000);
        script.onload = function() {
          if (resolved) return;
          resolved = true;
          clearTimeout(timeout);
          const existsAfter = this._checkModuleExists(module.id);
          resolve(existsAfter ? { success: true } : { success: false, error: 'Not registered' });
        }.bind(this);
        script.onerror = function() { if (resolved) return; resolved = true; clearTimeout(timeout); resolve({ success: false, error: 'Load error' }); }.bind(this);
        document.head.appendChild(script);
      });
    }

    _checkModuleExists(moduleId) {
      if (!moduleId || typeof moduleId !== 'string') return false;
      if (this.loadedModules.includes(moduleId)) return true;
      const check = this._moduleChecks[moduleId];
      if (check && typeof check === 'function') return check();
      const propName = moduleId.charAt(0).toUpperCase() + moduleId.slice(1);
      if (window.LawAIApp && window.LawAIApp[propName]) return true;
      return false;
    }

    _getDefaultManifest() {
      return {
        version: '1.0.0',
        modules: [
          { id: 'schoolRegistry', path: '/js/academy/schoolRegistry.js' },
          { id: 'programRegistry', path: '/js/academy/programRegistry.js' },
          { id: 'courseRegistry', path: '/js/academy/courseRegistry.js' },
          { id: 'curriculumRegistry', path: '/js/academy/curriculumRegistry.js' },
          { id: 'curriculumSeed', path: '/js/academy/curriculumSeed.js' },
          { id: 'academyView', path: '/js/academy/academyView.js' },
          { id: 'academyExperienceManager', path: '/js/academy/academyExperienceManager.js' },
          { id: 'contentLoader', path: '/js/academy/contentLoader.js' },
          { id: 'contentRegistry', path: '/js/academy/contentRegistry.js' },
          { id: 'contentAdapter', path: '/js/academy/contentAdapter.js' },
          { id: 'subjectRegistry', path: '/js/academy/subjectRegistry.js' },
          { id: 'contentValidator', path: '/js/academy/contentValidator.js' },
          { id: 'practiceEngine', path: '/js/academy/practiceEngine.js' },
          { id: 'practiceModule', path: '/js/academy/practice.js' },
          { id: 'practiceProgress', path: '/js/academy/practiceProgress.js' },
          { id: 'knowledgeCapture', path: '/js/academy/knowledgeCapture.js' },
          { id: 'knowledgeEditor', path: '/js/academy/knowledgeEditor.js' },
          { id: 'knowledgeLinker', path: '/js/academy/knowledgeLinker.js' },
          { id: 'knowledgeCard', path: '/js/academy/knowledgeCard.js' },
          { id: 'secondBrain', path: '/js/academy/secondBrain.js' },
          { id: 'notes', path: '/js/academy/notes.js' },
          { id: 'decisionOptionModel', path: '/js/academy/decisionOptionModel.js' },
          { id: 'decisionAuthority', path: '/js/academy/decisionAuthority.js' },
          { id: 'decisionPrimacy', path: '/js/academy/decisionPrimacy.js' },
          { id: 'optionNormalizer', path: '/js/academy/optionNormalizer.js' },
          { id: 'decisionExperience', path: '/js/academy/decisionExperience.js' },
          { id: 'decisionPanel', path: '/js/debug/panels/decisionPanel.js' },
          { id: 'actionTracker', path: '/js/academy/actionTracker.js' },
          { id: 'outcomeNormalizer', path: '/js/academy/outcomeNormalizer.js' },
          { id: 'outcomeLinker', path: '/js/academy/outcomeLinker.js' },
          { id: 'adaptationSignal', path: '/js/academy/adaptationSignal.js' },
          { id: 'outcomePanel', path: '/js/debug/panels/outcomePanel.js' },
          { id: 'adaptationRecord', path: '/js/academy/adaptationRecord.js' },
          { id: 'adaptationExplainer', path: '/js/academy/adaptationExplainer.js' },
          { id: 'adaptationGovernance', path: '/js/academy/adaptationGovernance.js' },
          { id: 'adaptationPanel', path: '/js/debug/panels/adaptationPanel.js' },
          { id: 'learningLoopValidator', path: '/js/academy/learningLoopValidator.js' },
          { id: 'learnerControl', path: '/js/academy/learnerControl.js' },
          { id: 'metacognitiveExperience', path: '/js/academy/metacognitiveExperience.js' },
          { id: 'metacognitivePanel', path: '/js/debug/panels/metacognitivePanel.js' },
          { id: 'learningPatternModel', path: '/js/academy/learningPatternModel.js' },
          { id: 'patternDetector', path: '/js/academy/patternDetector.js' },
          { id: 'patternExplainer', path: '/js/academy/patternExplainer.js' },
          { id: 'patternPanel', path: '/js/debug/panels/patternPanel.js' },
          { id: 'epistemicStatus', path: '/js/academy/epistemicStatus.js' },
          { id: 'sourceDistinguisher', path: '/js/academy/sourceDistinguisher.js' },
          { id: 'aiLiteracyHelper', path: '/js/academy/aiLiteracyHelper.js' },
          { id: 'epistemicPanel', path: '/js/debug/panels/epistemicPanel.js' },
          { id: 'transferModel', path: '/js/academy/transferModel.js' },
          { id: 'transferObserver', path: '/js/academy/transferObserver.js' },
          { id: 'transferRecommender', path: '/js/academy/transferRecommender.js' },
          { id: 'transferPanel', path: '/js/debug/panels/transferPanel.js' },
          { id: 'calibrationModel', path: '/js/academy/calibrationModel.js' },
          { id: 'calibrationObserver', path: '/js/academy/calibrationObserver.js' },
          { id: 'calibrationRecommender', path: '/js/academy/calibrationRecommender.js' },
          { id: 'calibrationPanel', path: '/js/debug/panels/calibrationPanel.js' },
          { id: 'journeyOrchestrator', path: '/js/academy/journeyOrchestrator.js' },
          { id: 'journeyPanel', path: '/js/debug/panels/journeyPanel.js' },
          { id: 'agencySupport', path: '/js/academy/agencySupport.js' },
          { id: 'agencyPanel', path: '/js/debug/panels/agencyPanel.js' },
          { id: 'experienceContract', path: '/js/academy/experienceContract.js' },
          { id: 'calendarAuthority', path: '/js/calendar/CalendarAuthority.js' },
          { id: 'surfaceIntegration', path: '/js/academy/surfaceIntegration.js' }
        ]
      };
    }

    _broadcast(event, data) {
      const eventName = 'academy:' + event.toLowerCase();
      try { const e = new CustomEvent(eventName, { detail: data || {} }); document.dispatchEvent(e); window.dispatchEvent(e); } catch (err) {}
      try { if (window.LawAIApp?.EventBus?.emit) window.LawAIApp.EventBus.emit(eventName, data); } catch (err) {}
      console.log('[AcademyLoader] 📡 Event:', event);
    }

    healthCheck() {
        var auth = window.LawAIApp?.CalendarAuthority;
        return {
            status: this.status,
            health: this.health,
            version: this.version,
            loadedModules: this.loadedModules,
            failedModules: this.failedModules,
            lazyLoaded: this._lazyLoaded,
            lazyLoading: this._lazyLoading,
            calendarAuthority: {
                initialized: auth ? auth.initialized : false,
                loading: auth ? auth.loading : false,
                isReady: auth ? auth.isReady : false,
                scheduleCount: auth && auth.isReady ? auth.getAllSchedules().length : 0
            }
        };
    }

    async recover() {
      console.log('[AcademyLoader] 🔧 Attempting recovery...');
      if (this.status === 'ready') {
        console.log('[AcademyLoader] Already ready, no recovery needed');
        return this.getStatus();
      }
      this.status = 'idle';
      this.health = 'pending';
      this.started = false;
      this.startPromise = null;
      return this.start();
    }
  }

  // ============================================================
  // Export
  // ============================================================
  if (!window.LawAIApp) window.LawAIApp = {};
  const academyLoader = new AcademyLoader();
  window.LawAIApp.AcademyLoader = academyLoader;
  if (!window.LawAIApp.Academy) window.LawAIApp.Academy = {};
  if (typeof window.LawAIApp.Academy.status === 'undefined') {
    Object.defineProperty(window.LawAIApp.Academy, 'status', { value: 'pending', writable: true, enumerable: true, configurable: true });
  }
  console.log('[AcademyLoader] ✅ Module loaded (v' + academyLoader.version + ')');

  // ============================================================
  // Auto-start
  // ============================================================
  function autoStartAcademy() {
    if (academyLoader.status === 'ready' || academyLoader.status === 'loading') return;
    console.log('[AcademyLoader] 🔥 Auto-starting...');
    academyLoader.start().catch(function(e) { console.warn('[AcademyLoader] Auto-start failed:', e); });
  }
  var scheduleFn = window.requestIdleCallback || function(cb) { setTimeout(cb, 300); };
  scheduleFn(function() { autoStartAcademy(); });
  document.addEventListener('RUNTIME_READY', function() { autoStartAcademy(); });
  window.addEventListener('RUNTIME_READY', function() { autoStartAcademy(); });

})();
