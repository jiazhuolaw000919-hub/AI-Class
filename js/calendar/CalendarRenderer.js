// js/calendar/CalendarRenderer.js
// Part 177: Calendar Renderer
// 只做呈现 + 交互，不计算智能
// 所有 CRUD 通过 CalendarAuthority

window.LawAIApp = window.LawAIApp || {};

LawAIApp.CalendarRenderer = {

    _viewYear: null,
    _viewMonth: null,
    _selectedDay: null,
    _rendered: false,
    _container: null,
    _viewModel: null,

    render: function(viewModel, container) {
        if (!container) container = document.getElementById('academy-root');
        if (!container) {
            console.warn('[CalendarRenderer] Container not found');
            return;
        }

        if (!viewModel) {
            viewModel = LawAIApp.CalendarViewModel
                ? LawAIApp.CalendarViewModel.toRenderModel(null)
                : { isEmpty: true };
        }

        this._container = container;
        this._viewModel = viewModel;

        // 初始化视图年月（如果尚未设置）
        if (typeof this._viewYear !== 'number') {
            var now = new Date();
            this._viewYear = now.getFullYear();
            this._viewMonth = now.getMonth();
        }

        var html = this._buildHTML(viewModel);
        container.innerHTML = html;
        this._bindEvents();
        this._rendered = true;
    },

    // ============================================================
    // HTML 构建
    // ============================================================
    _buildHTML: function(viewModel) {
        var html = '';

        // Header
        html += this._renderHeader(viewModel);

        // Month Grid（恢复月历）
        html += this._renderMonthGrid(viewModel);

        // 如果选中了某天，显示当天事件（优先）
        if (this._selectedDay !== null && typeof this._selectedDay === 'number') {
            html += this._renderSelectedDayEvents(viewModel);
        } else {
            // 否则显示所有事件
            if (viewModel.currentJourney && viewModel.currentJourney.available) {
                html += this._renderCurrentJourney(viewModel.currentJourney);
            }
            if (viewModel.events && viewModel.events.length > 0) {
                html += this._renderEvents(viewModel.events);
            } else {
                html += this._renderEmptyEventsHint();
            }
        }

        // Stale Warning
        if (viewModel.system && viewModel.system.freshness === 'stale') {
            html += this._renderStaleWarning();
        }

        return html;
    },

    // ============================================================
    // Part 177: 选中日期的事件
    // ============================================================
    _renderSelectedDayEvents: function(viewModel) {
        var selectedDate = new Date(this._viewYear, this._viewMonth, this._selectedDay);
        var events = (viewModel && viewModel.events) || [];
        var dayEvents = events.filter(function(e) {
            if (!e.start) return false;
            var d = new Date(e.start);
            return d.getFullYear() === selectedDate.getFullYear() &&
                   d.getMonth() === selectedDate.getMonth() &&
                   d.getDate() === selectedDate.getDate();
        });

        var dateLabel = selectedDate.toLocaleDateString('en-US', {
            weekday: 'long', month: 'long', day: 'numeric'
        });

        var html = `
            <div class="cal-selected-day-section">
                <div class="cal-selected-day-header">
                    <div class="cal-section-label">📅 ${dateLabel}</div>
                    <button class="cal-clear-selection" data-action="clear-selection">Show all events</button>
                </div>
        `;

        if (dayEvents.length === 0) {
            html += `
                <div class="cal-events-empty">
                    No events on this day.
                    <button class="cal-new-event-inline" data-action="new-event-inline">+ Add event</button>
                </div>
            `;
        } else {
            html += `<div class="cal-events-list">`;
            for (var i = 0; i < dayEvents.length; i++) {
                html += this._renderEventCard(dayEvents[i]);
            }
            html += `</div>`;
        }

        html += `</div>`;
        return html;
    },

    // ============================================================
    // Part 177 修复: 恢复月历视图
    // ============================================================
    _renderMonthGrid: function(viewModel) {
        var now = new Date();
        var year = this._viewYear || now.getFullYear();
        var month = (typeof this._viewMonth === 'number') ? this._viewMonth : now.getMonth();

        var monthName = new Date(year, month).toLocaleString('default', { month: 'long' });
        var daysInMonth = new Date(year, month + 1, 0).getDate();
        var firstDay = new Date(year, month, 1).getDay();

        // 这个月的事件日期集合
        var eventDays = {};
        var events = (viewModel && viewModel.events) || [];
        events.forEach(function(evt) {
            if (!evt.start) return;
            var d = new Date(evt.start);
            if (d.getFullYear() === year && d.getMonth() === month) {
                eventDays[d.getDate()] = true;
            }
        });

        var gridHTML = '';
        // 前导空格
        for (var i = 0; i < firstDay; i++) {
            gridHTML += '<div class="cal-day-cell empty"></div>';
        }
        // 日期
        var today = new Date();
        for (var d = 1; d <= daysInMonth; d++) {
            var isToday = d === today.getDate() &&
                          month === today.getMonth() &&
                          year === today.getFullYear();
            var hasEvent = !!eventDays[d];
            var isSelected = (this._selectedDay === d) &&
                             (this._viewMonth === month) &&
                             (this._viewYear === year);
            gridHTML += `
                <div class="cal-day-cell ${isToday ? 'today' : ''} ${hasEvent ? 'has-event' : ''} ${isSelected ? 'selected' : ''}"
                     data-day="${d}">
                    <span class="cal-day-number">${d}</span>
                    ${hasEvent ? '<span class="cal-day-dot"></span>' : ''}
                </div>
            `;
        }

        return `
            <div class="cal-month-section">
                <div class="cal-month-nav">
                    <button class="cal-month-nav-btn" data-month-nav="-1">←</button>
                    <span class="cal-month-label">${monthName} ${year}</span>
                    <button class="cal-month-nav-btn" data-month-nav="1">→</button>
                </div>
                <div class="cal-weekday-row">
                    <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
                </div>
                <div class="cal-month-grid">
                    ${gridHTML}
                </div>
                <div class="cal-month-actions">
                    <button class="cal-today-btn" data-month-today="1">Today</button>
                </div>
            </div>
        `;
    },

    _renderEmptyEventsHint: function() {
        return `
            <div class="cal-events-section">
                <div class="cal-section-label">📋 SCHEDULED EVENTS</div>
                <div class="cal-events-empty">
                    No scheduled events yet. Click "New Event" to add one.
                </div>
            </div>
        `;
    },

    _renderHeader: function(viewModel) {
        return `
            <div class="cal-header">
                <div class="cal-header-top">
                    <button onclick="LawAIApp.Calendar.goToAcademy()" class="cal-back-btn">← Back to Academy</button>
                    <button onclick="LawAIApp.CalendarRenderer.openNewEventModal()" class="cal-new-btn">➕ New Event</button>
                </div>
                <div class="cal-header-title">
                    <h2>📅 Calendar</h2>
                    <span class="cal-date-range">${viewModel.dateRange?.label || ''}</span>
                </div>
                <div class="cal-view-switcher">
                    <button class="cal-view-btn ${viewModel.viewMode === 'day' ? 'active' : ''}" data-view="day">Day</button>
                    <button class="cal-view-btn ${viewModel.viewMode === 'week' ? 'active' : ''}" data-view="week">Week</button>
                    <button class="cal-view-btn ${viewModel.viewMode === 'month' ? 'active' : ''}" data-view="month">Month</button>
                </div>
            </div>
        `;
    },

    _renderCurrentJourney: function(journey) {
        return `
            <div class="cal-current-journey">
                <div class="cal-section-label">📍 CURRENT JOURNEY</div>
                <div class="cal-journey-title">${journey.title}</div>
                <div class="cal-journey-progress">Progress: ${journey.progress || 0}%</div>
            </div>
        `;
    },

    _renderEvents: function(events) {
        var html = `
            <div class="cal-events-section">
                <div class="cal-section-label">📋 SCHEDULED EVENTS</div>
                <div class="cal-events-list">
        `;

        for (var i = 0; i < events.length; i++) {
            html += this._renderEventCard(events[i]);
        }

        html += `</div></div>`;
        return html;
    },

    _renderEventCard: function(evt) {
        var actions = [];

        if (evt.canOpen) {
            actions.push(`<button class="cal-action-btn cal-open-btn" data-action="open" data-id="${evt.id}" data-ref="${evt.activityRef || ''}">📖 Open</button>`);
        }
        if (evt.canReschedule) {
            actions.push(`<button class="cal-action-btn cal-reschedule-btn" data-action="reschedule" data-id="${evt.id}">🔄 Reschedule</button>`);
        }
        if (evt.canReschedule) {
            actions.push(`<button class="cal-action-btn cal-edit-btn" data-action="edit" data-id="${evt.id}">✏️ Edit</button>`);
        }
        if (evt.canCancel) {
            actions.push(`<button class="cal-action-btn cal-cancel-btn" data-action="cancel" data-id="${evt.id}">✕</button>`);
        }

        return `
            <div class="cal-event-card ${evt.isOverdue ? 'overdue' : ''}" style="border-left-color:${evt.statusColor};">
                <div class="cal-event-main">
                    <div class="cal-event-title">${evt.title}</div>
                    <div class="cal-event-meta">
                        <span>${evt.formattedTime}</span>
                        <span class="cal-event-status" style="color:${evt.statusColor};">${evt.statusLabel}</span>
                    </div>
                    ${evt.description ? `<div class="cal-event-desc">${evt.description}</div>` : ''}
                </div>
                <div class="cal-event-actions">
                    ${actions.join('')}
                </div>
            </div>
        `;
    },

    _renderEmptyState: function() {
        return `
            <div class="cal-empty">
                <div class="cal-empty-icon">📅</div>
                <h3>Nothing scheduled yet</h3>
                <p>Plan a learning session when you're ready.</p>
                <button class="cal-empty-btn" onclick="LawAIApp.CalendarRenderer.openNewEventModal()">
                    Schedule something
                </button>
            </div>
        `;
    },

    _renderStaleWarning: function() {
        return `
            <div class="cal-stale-warning">
                ⚡ Some recommendations may be outdated.
            </div>
        `;
    },

    // ============================================================
    // 事件绑定
    // ============================================================
    _bindEvents: function() {
        var self = this;

        // View switcher
        document.querySelectorAll('.cal-view-btn').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var mode = this.getAttribute('data-view');
                self.switchView(mode);
            });
        });

        // Month nav
        document.querySelectorAll('[data-month-nav]').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var delta = parseInt(this.getAttribute('data-month-nav'), 10);
                self._changeMonth(delta);
            });
        });

        // Month today
        document.querySelectorAll('[data-month-today]').forEach(function(btn) {
            btn.addEventListener('click', function() {
                self._goToday();
            });
        });

        // Day cell 点击
        document.querySelectorAll('.cal-day-cell[data-day]').forEach(function(cell) {
            cell.addEventListener('click', function() {
                var d = parseInt(this.getAttribute('data-day'), 10);
                self._onDayClick(d);
            });
        });

        // Action buttons
        document.querySelectorAll('.cal-action-btn').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var action = this.getAttribute('data-action');
                var id = this.getAttribute('data-id');
                var ref = this.getAttribute('data-ref') || null;

                if (action === 'open') self.openActivity(id, ref);
                else if (action === 'reschedule') self.openRescheduleModal(id);
                else if (action === 'edit') self.openEditModal(id);
                else if (action === 'cancel') self.cancelEvent(id);
            });
        });

        // Part 177: clear selection
        document.querySelectorAll('[data-action="clear-selection"]').forEach(function(btn) {
            btn.addEventListener('click', function() {
                self._selectedDay = null;
                self.render(self._viewModel, self._container);
            });
        });

        // Part 177: new event inline（当天新建）
        document.querySelectorAll('[data-action="new-event-inline"]').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var dateStr = '';
                if (self._selectedDay !== null) {
                    var d = new Date(self._viewYear, self._viewMonth, self._selectedDay);
                    dateStr = d.toISOString().split('T')[0];
                } else {
                    dateStr = new Date().toISOString().split('T')[0];
                }
                self._openEventModal({
                    mode: 'create',
                    title: '',
                    date: dateStr,
                    startTime: '09:00',
                    endTime: '10:00',
                    description: ''
                });
            });
        });
    },

    // ============================================================
    // 月历导航
    // ============================================================
    _changeMonth: function(delta) {
        var now = new Date();
        var y = this._viewYear || now.getFullYear();
        var m = (typeof this._viewMonth === 'number') ? this._viewMonth : now.getMonth();
        m += delta;
        if (m > 11) { m = 0; y++; }
        if (m < 0) { m = 11; y--; }
        this._viewYear = y;
        this._viewMonth = m;
        this._selectedDay = null;   // 切换月份时清掉选中
        this.render(this._viewModel, this._container);
    },

    _goToday: function() {
        var now = new Date();
        this._viewYear = now.getFullYear();
        this._viewMonth = now.getMonth();
        this._selectedDay = now.getDate();   // 今天默认选中
        this.render(this._viewModel, this._container);
    },

    _onDayClick: function(day) {
        // Part 177: 真正选中日期
        this._selectedDay = day;

        // 如果选中的是其他月份的日期，切到当前显示月
        var now = new Date();
        if (typeof this._viewYear !== 'number') this._viewYear = now.getFullYear();
        if (typeof this._viewMonth !== 'number') this._viewMonth = now.getMonth();

        // 找到当天的事件
        var selectedDate = new Date(this._viewYear, this._viewMonth, day);
        var events = (this._viewModel && this._viewModel.events) || [];
        var dayEvents = events.filter(function(e) {
            if (!e.start) return false;
            var d = new Date(e.start);
            return d.getFullYear() === selectedDate.getFullYear() &&
                   d.getMonth() === selectedDate.getMonth() &&
                   d.getDate() === selectedDate.getDate();
        });

        // 重渲染（高亮选中 + 显示当天事件）
        this.render(this._viewModel, this._container);

        // Toast 反馈
        if (window.LawAIApp?.Toast?.info) {
            var msg = '📅 ' + selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            msg += dayEvents.length > 0 ? ' · ' + dayEvents.length + ' event(s)' : ' · No events';
            LawAIApp.Toast.info(msg);
        }
    },

    // ============================================================
    // 交互 — 全部走 CalendarAuthority
    // ============================================================
    switchView: function(viewMode) {
        var eventAdapter = LawAIApp.CalendarEventAdapter;
        if (eventAdapter) eventAdapter.sendCalendarViewed(viewMode);

        // 重新渲染，保留事件
        var auth = window.LawAIApp?.CalendarAuthority;
        var schedules = auth && auth.isReady ? auth.getAllSchedules() : [];

        var events = schedules.map(function(s) {
            return {
                id: s.scheduleId,
                title: s.title,
                type: s.activityRef ? 'learning' : 'personal',
                start: s.startAt,
                end: s.endAt,
                duration: s.duration,
                status: s.status,
                activityRef: s.activityRef,
                description: s.description || null
            };
        });

        // 重新构建 ViewModel
        var surfaceData = LawAIApp.CalendarSurfaceAdapter
            ? LawAIApp.CalendarSurfaceAdapter.adapt(
                LawAIApp.LearningJourneyAdapter?.getJourneyContextSafe() || null,
                { events: events, hasSchedule: events.length > 0 }
            )
            : null;

        var vm = LawAIApp.CalendarViewModel
            ? LawAIApp.CalendarViewModel.toRenderModel(surfaceData)
            : null;

        if (vm) {
            vm.viewMode = viewMode;
            // 重新计算 dateRange
            if (LawAIApp.CalendarViewModel._buildDateRange) {
                vm.dateRange = LawAIApp.CalendarViewModel._buildDateRange(viewMode, new Date());
            }
            this.render(vm, this._container);
        }
    },

    openActivity: function(scheduleId, activityRef) {
        var eventAdapter = LawAIApp.CalendarEventAdapter;
        if (eventAdapter) eventAdapter.sendActivityOpened(scheduleId, activityRef);

        // 标记开始（≠ 完成）
        var auth = window.LawAIApp?.CalendarAuthority;
        if (auth && auth.isReady && scheduleId) {
            auth.markStarted(scheduleId);
        }

        // 导航
        if (activityRef) {
            // 尝试 lesson
            if (activityRef.indexOf('lesson-') === 0 || activityRef.indexOf('lesson_') === 0) {
                var lessonId = activityRef.replace('lesson-', '').replace('lesson_', '');
                window.location.href = '/pages/academy.html?view=lesson&id=' + encodeURIComponent(activityRef);
                return;
            }
            // 其他 activity 类型
            if (window.LawAIApp?.Router?.navigate) {
                window.LawAIApp.Router.navigate(activityRef);
                return;
            }
        }

        if (window.LawAIApp?.Toast?.info) {
            LawAIApp.Toast.info('No linked activity');
        }
    },

    cancelEvent: function(scheduleId) {
        if (!confirm('Cancel this scheduled session?')) return;

        var auth = window.LawAIApp?.CalendarAuthority;
        if (!auth || !auth.isReady) {
            if (window.LawAIApp?.Toast?.error) LawAIApp.Toast.error('Calendar not ready');
            return;
        }

        var result = auth.cancel(scheduleId, 'User cancelled from Calendar');
        if (result.success) {
            var eventAdapter = LawAIApp.CalendarEventAdapter;
            if (eventAdapter) eventAdapter.sendScheduleCancelled(scheduleId, 'User cancelled');
            if (window.LawAIApp?.Toast?.success) LawAIApp.Toast.success('✓ Event cancelled');
            this.switchView(this._viewModel?.viewMode || 'week');
        } else {
            if (window.LawAIApp?.Toast?.error) LawAIApp.Toast.error('Couldn\'t cancel event.');
        }
    },

    // ============================================================
    // Modals
    // ============================================================
    openNewEventModal: function() {
        this._openEventModal({
            mode: 'create',
            title: '',
            date: new Date().toISOString().split('T')[0],
            startTime: '09:00',
            endTime: '10:00',
            description: ''
        });
    },

    openEditModal: function(scheduleId) {
        var auth = window.LawAIApp?.CalendarAuthority;
        if (!auth || !auth.isReady) return;
        var schedule = auth.getSchedule(scheduleId);
        if (!schedule) return;

        var startDate = new Date(schedule.startAt);
        var endDate = new Date(schedule.endAt || schedule.startAt);
        var date = startDate.toISOString().split('T')[0];
        var startTime = String(startDate.getHours()).padStart(2, '0') + ':' + String(startDate.getMinutes()).padStart(2, '0');
        var endTime = String(endDate.getHours()).padStart(2, '0') + ':' + String(endDate.getMinutes()).padStart(2, '0');

        this._openEventModal({
            mode: 'edit',
            scheduleId: scheduleId,
            title: schedule.title || '',
            date: date,
            startTime: startTime,
            endTime: endTime,
            description: schedule.description || ''
        });
    },

    openRescheduleModal: function(scheduleId) {
        this.openEditModal(scheduleId);
    },

    _openEventModal: function(opts) {
        var self = this;

        // 移除旧 modal
        var oldModal = document.getElementById('cal-event-modal');
        if (oldModal) oldModal.remove();

        var isCreate = opts.mode === 'create';

        var modalHtml = `
            <div id="cal-event-modal" class="cal-modal-backdrop">
                <div class="cal-modal">
                    <h3 class="cal-modal-title">${isCreate ? '📅 New Learning Event' : '✏️ Edit Event'}</h3>

                    <div class="cal-modal-field">
                        <label>Title *</label>
                        <input id="cal-modal-title" type="text" placeholder="e.g. Review AI Fundamentals" value="${(opts.title || '').replace(/"/g, '&quot;')}">
                    </div>

                    <div class="cal-modal-field">
                        <label>Date *</label>
                        <input id="cal-modal-date" type="date" value="${opts.date}">
                    </div>

                    <div class="cal-modal-row">
                        <div class="cal-modal-field">
                            <label>Start</label>
                            <input id="cal-modal-start" type="time" value="${opts.startTime}">
                        </div>
                        <div class="cal-modal-field">
                            <label>End</label>
                            <input id="cal-modal-end" type="time" value="${opts.endTime}">
                        </div>
                    </div>

                    <div class="cal-modal-field">
                        <label>Description (optional)</label>
                        <textarea id="cal-modal-desc" placeholder="What will you do?" rows="2">${opts.description || ''}</textarea>
                    </div>

                    <div id="cal-modal-status" class="cal-modal-status"></div>

                    <div class="cal-modal-actions">
                        <button id="cal-modal-save" class="cal-modal-save">${isCreate ? 'Create' : 'Save'}</button>
                        <button id="cal-modal-cancel" class="cal-modal-cancel">Cancel</button>
                    </div>
                </div>
            </div>
        `;

        // 关键：用 document.body.appendChild 保证挂载
        var wrapper = document.createElement('div');
        wrapper.innerHTML = modalHtml;
        var modalEl = wrapper.firstElementChild;
        // Part 177 修复：挂到 academy-root
        // 因为 academy.html 里有 body > *:not(#academy-root) { display: none } 规则
        var modalContainer = document.getElementById('academy-root') ||
                             document.getElementById('app') ||
                             document.body;
        modalContainer.appendChild(modalEl);

        // Part 177 保险：如果 CSS 未加载，注入 inline 样式
        if (!document.getElementById('cal-modal-inline-style')) {
            var styleEl = document.createElement('style');
            styleEl.id = 'cal-modal-inline-style';
            styleEl.textContent = `
                .cal-modal-backdrop {
                    position: fixed !important;
                    top: 0 !important; left: 0 !important; right: 0 !important; bottom: 0 !important;
                    background: rgba(0,0,0,0.6) !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    z-index: 99999 !important;
                    padding: 20px !important;
                }
                .cal-modal {
                    background: #1a2639 !important;
                    border-radius: 16px !important;
                    padding: 24px !important;
                    max-width: 420px !important;
                    width: 100% !important;
                    border: 1px solid rgba(255,255,255,0.06) !important;
                    color: #e2e8f0 !important;
                }
            `;
            document.head.appendChild(styleEl);
        }

        console.log('[CalendarRenderer] Modal opened, mode:', opts.mode);

        // 绑定按钮
        var cancelBtn = document.getElementById('cal-modal-cancel');
        var saveBtn = document.getElementById('cal-modal-save');

        if (cancelBtn) {
            cancelBtn.addEventListener('click', function(e) {
                e.preventDefault();
                self._closeModal();
            });
        } else {
            console.warn('[CalendarRenderer] cancel button not found');
        }

        if (saveBtn) {
            saveBtn.addEventListener('click', function(e) {
                e.preventDefault();
                self._handleSave(opts, isCreate);
            });
        } else {
            console.warn('[CalendarRenderer] save button not found');
        }

        // 点 backdrop 关闭
        modalEl.addEventListener('click', function(e) {
            if (e.target === modalEl) self._closeModal();
        });

        // ESC 关闭
        var escHandler = function(e) {
            if (e.key === 'Escape') {
                self._closeModal();
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);

        // Focus
        setTimeout(function() {
            var t = document.getElementById('cal-modal-title');
            if (t) t.focus();
        }, 100);
    },

    _closeModal: function() {
        var m = document.getElementById('cal-event-modal');
        if (m) m.remove();
    },

    _setModalStatus: function(text, kind) {
        var el = document.getElementById('cal-modal-status');
        if (!el) return;
        var colors = { info: '#94a3b8', success: '#10b981', error: '#ef4444' };
        el.style.color = colors[kind] || '#94a3b8';
        el.textContent = text;
    },

    _handleSave: function(opts, isCreate) {
        console.log('[CalendarRenderer] _handleSave called', { opts: opts, isCreate: isCreate });

        var auth = window.LawAIApp?.CalendarAuthority;
        if (!auth) {
            this._setModalStatus('CalendarAuthority not loaded.', 'error');
            console.error('[CalendarRenderer] CalendarAuthority missing');
            return;
        }
        if (!auth.isReady) {
            this._setModalStatus('Calendar still loading. Please wait...', 'error');
            console.warn('[CalendarRenderer] CalendarAuthority not ready');
            // 尝试等 ready
            var self = this;
            auth.onReady(function() {
                console.log('[CalendarRenderer] Authority became ready, retrying save');
                self._handleSave(opts, isCreate);
            });
            return;
        }

        var titleEl = document.getElementById('cal-modal-title');
        var dateEl = document.getElementById('cal-modal-date');
        var startEl = document.getElementById('cal-modal-start');
        var endEl = document.getElementById('cal-modal-end');
        var descEl = document.getElementById('cal-modal-desc');

        var title = (titleEl?.value || '').trim();
        var date = dateEl?.value || '';
        var start = startEl?.value || '';
        var end = endEl?.value || '';
        var desc = (descEl?.value || '').trim();

        console.log('[CalendarRenderer] Form values:', { title, date, start, end });

        if (!title) { this._setModalStatus('Title is required.', 'error'); return; }
        if (!date) { this._setModalStatus('Date is required.', 'error'); return; }
        if (!start || !end) { this._setModalStatus('Start and end times are required.', 'error'); return; }

        var startAt = date + 'T' + start + ':00';
        var endAt = date + 'T' + end + ':00';
        var duration = this._calcDuration(start, end);

        console.log('[CalendarRenderer] Computed:', { startAt, endAt, duration });

        if (duration <= 0) {
            this._setModalStatus('End time must be after start time.', 'error');
            return;
        }

        this._setModalStatus('Saving...', 'info');

        var result;
        if (isCreate) {
            result = auth.create({
                title: title,
                startAt: startAt,
                duration: duration,
                description: desc,
                source: 'calendar-ui'
            });
        } else {
            result = auth.reschedule(opts.scheduleId, startAt, duration);
            if (result.success && auth.updateMetadata) {
                auth.updateMetadata(opts.scheduleId, {
                    title: title,
                    description: desc
                });
            }
        }

        console.log('[CalendarRenderer] Save result:', result);

        if (result && result.success) {
            this._setModalStatus('Saved', 'success');
            var eventAdapter = LawAIApp.CalendarEventAdapter;
            if (eventAdapter) {
                if (isCreate) {
                    eventAdapter.sendScheduleCreated({
                        scheduleId: result.schedule.scheduleId,
                        title: title,
                        startAt: startAt,
                        duration: duration
                    });
                } else {
                    eventAdapter.sendScheduleEdited(opts.scheduleId, { title: title, description: desc });
                }
            }
            if (window.LawAIApp?.Toast?.success) {
                LawAIApp.Toast.success(isCreate ? '✅ Event created' : '✅ Event updated');
            }
            var self = this;
            setTimeout(function() {
                self._closeModal();
                self.switchView(self._viewModel?.viewMode || 'week');
            }, 300);
        } else {
            var errMsg = (result && result.error) ? result.error : 'Unknown error';
            this._setModalStatus('Couldn\'t save: ' + errMsg, 'error');
            console.error('[CalendarRenderer] Save failed:', result);
        }
    },

    _calcDuration: function(startTime, endTime) {
        var s = startTime.split(':').map(Number);
        var e = endTime.split(':').map(Number);
        return (e[0] - s[0]) * 60 + (e[1] - s[1]);
    }
};

console.log('[CalendarRenderer] ✅ Loaded (Part 177)');
