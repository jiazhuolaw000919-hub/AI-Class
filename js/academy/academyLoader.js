// js/academy/academyLoader.js
// Part 57.4-57.6 REBUILD — AcademyLoader Architecture Reset
// v2.1.0 — 添加 Calendar/Settings/CalendarAuthority/NotesAuthority 懒加载支持

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
          notesAuthority: false,
          settingsAuthority: false,
          curriculumAuthority: false
      };
      this._lazyLoading = {
          calendar: false,
          settings: false,
          calendarAuthority: false,
          notesAuthority: false,
          settingsAuthority: false,
          curriculumAuthority: false
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

    loadNotesAuthority(onReady, onFail) {
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

    // ============================================================
    // Part 165: SettingsAuthority 懒加载
    // ============================================================
    
    loadSettingsAuthority: function(onReady, onFail) {
        var moduleName = 'settingsAuthority';
        if (this._lazyLoaded[moduleName]) {
            console.log('[AcademyLoader] ⏭️ SettingsAuthority already lazy-loaded');
            if (onReady) onReady(window.LawAIApp?.SettingsAuthority);
            return;
        }
        if (this._lazyLoading[moduleName]) {
            console.log('[AcademyLoader] ⏳ SettingsAuthority already loading...');
            this._waitForSettingsAuthority(onReady, onFail);
            return;
        }
        this._lazyLoading[moduleName] = true;
        console.log('[AcademyLoader] 🔄 Lazy loading SettingsAuthority...');
    
        var files = ['/js/settings/SettingsAuthority.js'];
    
        this._loadScriptsSequentially(files, function(success) {
            this._lazyLoading[moduleName] = false;
            if (success && window.LawAIApp?.SettingsAuthority) {
                this._lazyLoaded[moduleName] = true;
                console.log('[AcademyLoader] ✅ SettingsAuthority loaded');
    
                var auth = window.LawAIApp.SettingsAuthority;
                if (auth.initialized) {
                    if (onReady) onReady(auth);
                } else {
                    auth.onReady(function(readyAuth) {
                        if (onReady) onReady(readyAuth);
                    });
                }
            } else {
                console.warn('[AcademyLoader] ⚠️ SettingsAuthority load failed');
                if (onFail) onFail('SettingsAuthority load failed');
            }
        }.bind(this));
    },

    // ============================================================
    // Part 166: CurriculumAuthority 懒加载
    // ============================================================
    
    loadCurriculumAuthority: function(onReady, onFail) {
        var moduleName = 'curriculumAuthority';
        if (this._lazyLoaded[moduleName]) {
            if (onReady) onReady(window.LawAIApp?.CurriculumAuthority);
            return;
        }
        if (this._lazyLoading[moduleName]) {
            this._waitForCurriculumAuthority(onReady, onFail);
            return;
        }
        this._lazyLoading[moduleName] = true;
    
        var files = [
            '/js/curriculum/CurriculumAuthority.js',
            '/js/school/SchoolViewModel.js'
        ];
    
        this._loadScriptsSequentially(files, function(success) {
            this._lazyLoading[moduleName] = false;
            if (success && window.LawAIApp?.CurriculumAuthority) {
                this._lazyLoaded[moduleName] = true;
                var auth = window.LawAIApp.CurriculumAuthority;
                if (auth.initialized) {
                    if (onReady) onReady(auth);
                } else {
                    auth.onReady(function(a) { if (onReady) onReady(a); });
                }
            } else {
                if (onFail) onFail('CurriculumAuthority load failed');
            }
        }.bind(this));
    },
    
    _waitForCurriculumAuthority: function(onReady, onFail) {
        var attempts = 0;
        var interval = setInterval(function() {
            attempts++;
            var auth = window.LawAIApp?.CurriculumAuthority;
            if (auth && auth.initialized) {
                clearInterval(interval);
                if (onReady) onReady(auth);
                return;
            }
            if (attempts >= 50) {
                clearInterval(interval);
                if (onFail) onFail('Timeout');
            }
        }, 100);
    },

    // ============================================================
    // Part 170: Video Activity 懒加载
    // ============================================================

    loadVideoActivity: function(onReady, onFail) {
        var moduleName = 'videoActivity';
        if (this._lazyLoaded[moduleName]) {
            console.log('[AcademyLoader] ⏭️ VideoActivity already lazy-loaded');
            if (onReady) onReady(true);
            return;
        }
        if (this._lazyLoading[moduleName]) {
            console.log('[AcademyLoader] ⏳ VideoActivity already loading...');
            this._waitForVideoActivity(onReady, onFail);
            return;
        }
        this._lazyLoading[moduleName] = true;
        console.log('[AcademyLoader] 🔄 Lazy loading VideoActivity...');

        var files = [
            '/js/experience/videoEvidenceContract.js',
            '/js/experience/renderers/videoRenderer.js'
        ];

        this._loadScriptsSequentially(files, function(success) {
            this._lazyLoading[moduleName] = false;
            if (success && window.LawAIApp?.VideoRenderer) {
                this._lazyLoaded[moduleName] = true;
                console.log('[AcademyLoader] ✅ VideoActivity loaded');
                if (onReady) onReady(true);
            } else {
                console.warn('[AcademyLoader] ⚠️ VideoActivity load failed');
                if (onFail) onFail('VideoActivity load failed');
            }
        }.bind(this));
    },

    _waitForVideoActivity: function(onReady, onFail) {
        var attempts = 0;
        var maxAttempts = 50;
        var interval = setInterval(function() {
            attempts++;
            var renderer = window.LawAIApp?.VideoRenderer;
            if (renderer) {
                clearInterval(interval);
                if (onReady) onReady(true);
                return;
            }
            if (attempts >= maxAttempts) {
                clearInterval(interval);
                console.warn('[AcademyLoader] ⏰ VideoActivity wait timeout');
                if (onFail) onFail('Timeout waiting for VideoActivity');
            }
        }, 100);
    },
    
    _waitForSettingsAuthority: function(onReady, onFail) {
        var attempts = 0;
        var maxAttempts = 50;
        var interval = setInterval(function() {
            attempts++;
            var auth = window.LawAIApp?.SettingsAuthority;
            if (auth && auth.initialized) {
                clearInterval(interval);
                if (onReady) onReady(auth);
                return;
            }
            if (attempts >= maxAttempts) {
                clearInterval(interval);
                console.warn('[AcademyLoader] ⏰ SettingsAuthority wait timeout');
                if (onFail) onFail('Timeout waiting for SettingsAuthority');
            }
        }, 100);
    }
    
    _waitForNotesAuthority(onReady, onFail) {
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
    }

    isLazyLoaded(moduleName) {
      return !!this._lazyLoaded[moduleName];
    }

    _createInlineCalendar() {
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
                        ';font-size:14px;cursor:pointer;font-family:inherit;">' + d + '</div>';
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
            }
        };
    }
    
    _inlineCalendarChangeMonth(delta) {
        var cal = window.LawAIApp?.AcademyLoader?._inlineCalendar;
        if (cal) cal.changeMonth(delta);
    }
    
    _onDayClick(day) {
        if (window.LawAIApp?.Toast?.info) LawAIApp.Toast.info('📅 Day ' + day + ' selected');
    }
    
    _createInlineSettings() {
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
    }
    
    renderCalendar(container, onReady, onError) {
        if (!container) container = document.getElementById('academy-root');
        if (!container) { if (onError) onError('Container not found'); return; }
    
        container.innerHTML = '<div style="text-align:center;padding:60px;color:#94a3b8;">⏳ Loading Calendar...</div>';
    
        var self = this;
    
        if (this.loadCalendarLazy) {
            this.loadCalendarLazy(function(calendar) {
                if (container) {
                    calendar._root = container;
                    calendar.render();
                    if (onReady) onReady(calendar);
                }
            }, function(error) {
                var inlineCal = self._createInlineCalendar();
                self._inlineCalendar = inlineCal;
                inlineCal.render(container);
                if (onError) onError(error);
            });
        } else {
            var inlineCal = this._createInlineCalendar();
            this._inlineCalendar = inlineCal;
            inlineCal.render(container);
            if (onReady) onReady(inlineCal);
        }
    }
    
    renderSettings: function(container, onReady, onError) {
        if (!container) container = document.getElementById('academy-root');
        if (!container) {
            if (onError) onError('Container not found');
            return;
        }
    
        container.innerHTML = '<div style="text-align:center;padding:60px;color:#94a3b8;">⏳ Loading Settings...</div>';
    
        var self = this;
    
        // 🔥 Part 165: 先确保 SettingsAuthority 就绪
        this.loadSettingsAuthority(function(auth) {
            console.log('[AcademyLoader] ✅ SettingsAuthority ready, loading Settings UI...');
            self._loadSettingsUI(container, onReady, onError);
        }, function(error) {
            console.warn('[AcademyLoader] ⚠️ SettingsAuthority failed, loading Settings anyway...');
            self._loadSettingsUI(container, onReady, onError);
        });
    },
    
    _loadSettingsUI: function(container, onReady, onError) {
        if (window.LawAIApp?.Settings && typeof window.LawAIApp.Settings.render === 'function') {
            try {
                window.LawAIApp.Settings._root = container;
                window.LawAIApp.Settings.render();
                if (onReady) onReady(window.LawAIApp.Settings);
                return;
            } catch (e) {
                console.warn('[AcademyLoader] Settings render error:', e);
            }
        }
    
        var self = this;
        this.loadSettingsLazy(function(settings) {
            if (container) {
                try { settings.render(); if (onReady) onReady(settings); } catch (e) {}
            }
        }, function(error) {
            console.warn('[AcademyLoader] Settings load failed:', error);
            var inlineSettings = self._createInlineSettings();
            inlineSettings.render(container);
            if (onError) onError(error);
        });
    }
    
    updateNavHighlight(activeTab) {
        document.querySelectorAll('.nav-item').forEach(function(nav) {
            if (nav.dataset.tab === activeTab) {
                nav.style.color = '#4a9eff';
                nav.classList.add('active');
            } else {
                nav.style.color = '#64748b';
                nav.classList.remove('active');
            }
        });
    }

    _loadScriptsSequentially(files, callback) {
      var loaded = 0;
      var failed = [];
      files.forEach(function(file) {
        var script = document.createElement('script');
        script.src = file + '?v=' + Date.now();
        script.async = true;
        script.onload = function() { loaded++; checkComplete(); };
        script.onerror = function() { loaded++; failed.push(file); checkComplete(); };
        document.head.appendChild(script);
      });
      function checkComplete() {
        if (loaded < files.length) return;
        callback(failed.length === 0);
      }
    }

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
        console.log('[AcademyLoader] ✅ Academy ready');
        return this.getStatus();
      } catch (error) {
        this.status = 'failed';
        this.health = 'unhealthy';
        console.error('[AcademyLoader] ❌ Startup failed:', error);
        this._broadcast('ACADEMY_FAILED', { error: error.message });
        throw error;
      }
    }

    async _loadManifest() {
      const manifest = window.LawAIApp?.AcademyManifest;
      if (!manifest) {
        this._manifest = this._getDefaultManifest();
        return;
      }
      this._manifest = manifest;
    }

    async _loadModules() {
      const modules = this._manifest?.modules || [];
      for (let i = 0; i < modules.length; i++) {
        const module = modules[i];
        if (!module || !module.id) continue;
        const result = await this._loadSingleModule(module);
        if (result.success) this.loadedModules.push(module.id);
        else this.failedModules.push(module.id);
      }
      this._broadcast('ACADEMY_MODULES_READY', { loaded: this.loadedModules, failed: this.failedModules, total: modules.length });
    }

    async _loadSingleModule(module) {
      if (!module || !module.id) return { success: false, error: 'Invalid module' };
      if (this._checkModuleExists(module.id)) return { success: true };
      if (!module.path) return { success: false, error: 'No path' };
      return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = module.path;
        script.async = false;
        let resolved = false;
        const timeout = setTimeout(() => { if (!resolved) { resolved = true; resolve({ success: false, error: 'Timeout' }); } }, 10000);
        script.onload = function() {
          if (resolved) return;
          resolved = true;
          clearTimeout(timeout);
          resolve(this._checkModuleExists(module.id) ? { success: true } : { success: false, error: 'Not registered' });
        }.bind(this);
        script.onerror = function() { if (!resolved) { resolved = true; clearTimeout(timeout); resolve({ success: false, error: 'Load error' }); } };
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
          { id: 'notesAuthority', path: '/js/notes/NotesAuthority.js' },
          { id: 'videoEvidenceContract', path: '/js/experience/videoEvidenceContract.js' }
          { id: 'videoRenderer', path: '/js/experience/renderers/videoRenderer.js' },
          { id: 'surfaceIntegration', path: '/js/academy/surfaceIntegration.js' }
        ]
      };
    }

    _broadcast(event, data) {
      const eventName = 'academy:' + event.toLowerCase();
      try { const e = new CustomEvent(eventName, { detail: data || {} }); document.dispatchEvent(e); window.dispatchEvent(e); } catch (err) {}
      try { if (window.LawAIApp?.EventBus?.emit) window.LawAIApp.EventBus.emit(eventName, data); } catch (err) {}
    }

    healthCheck() {
        var auth = window.LawAIApp?.CalendarAuthority;
        var notesAuth = window.LawAIApp?.NotesAuthority;
        var settingsAuth = window.LawAIApp?.SettingsAuthority;
        var curriculumAuth = window.LawAIApp?.CurriculumAuthority;
        var videoRenderer = window.LawAIApp?.VideoRenderer;
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
            },
            notesAuthority: {
                initialized: notesAuth ? notesAuth.initialized : false,
                loading: notesAuth ? notesAuth.loading : false,
                isReady: notesAuth ? notesAuth.isReady : false,
                noteCount: notesAuth && notesAuth.isReady ? notesAuth.getAllNotes().length : 0
            },
            settingsAuthority: {  // 🆕
                initialized: settingsAuth ? settingsAuth.initialized : false,
                loading: settingsAuth ? settingsAuth.loading : false,
                isReady: settingsAuth ? settingsAuth.isReady : false,
                settingsCount: settingsAuth && settingsAuth.isReady ? Object.keys(settingsAuth.getAll()).length : 0
            },
            curriculumAuthority: {
                initialized: curriculumAuth ? curriculumAuth.initialized : false,
                loading: curriculumAuth ? curriculumAuth.loading : false,
                isReady: curriculumAuth ? curriculumAuth.isReady : false,
                schoolCount: curriculumAuth && curriculumAuth.isReady ? curriculumAuth.getAllSchools().length : 0
            },
            videoActivity: {  // 🆕 Part 170
              initialized: videoRenderer ? true : false,
              isReady: videoRenderer ? true : false,
              evidenceContract: !!(window.LawAIApp?.VideoEvidenceContract)
          }
        };
    }

    async recover() {
      if (this.status === 'ready') return this.getStatus();
      this.status = 'idle';
      this.health = 'pending';
      this.started = false;
      this.startPromise = null;
      return this.start();
    }
  }

  if (!window.LawAIApp) window.LawAIApp = {};
  const academyLoader = new AcademyLoader();
  window.LawAIApp.AcademyLoader = academyLoader;
  if (!window.LawAIApp.Academy) window.LawAIApp.Academy = {};
  if (typeof window.LawAIApp.Academy.status === 'undefined') {
    Object.defineProperty(window.LawAIApp.Academy, 'status', { value: 'pending', writable: true, enumerable: true, configurable: true });
  }
  console.log('[AcademyLoader] ✅ Module loaded (v' + academyLoader.version + ')');

  function autoStartAcademy() {
    if (academyLoader.status === 'ready' || academyLoader.status === 'loading') return;
    academyLoader.start().catch(function(e) { console.warn('[AcademyLoader] Auto-start failed:', e); });
  }
  var scheduleFn = window.requestIdleCallback || function(cb) { setTimeout(cb, 300); };
  scheduleFn(function() { autoStartAcademy(); });
  document.addEventListener('RUNTIME_READY', function() { autoStartAcademy(); });
  window.addEventListener('RUNTIME_READY', function() { autoStartAcademy(); });

})();
