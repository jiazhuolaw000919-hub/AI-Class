// js/calendar/CalendarRenderer.js
// Part 177: Calendar Renderer
// 只做呈现 + 交互，不计算智能
// 所有 CRUD 通过 CalendarAuthority

window.LawAIApp = window.LawAIApp || {};

LawAIApp.CalendarRenderer = {

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

        // Empty State
        if (viewModel.isEmpty && (!viewModel.events || viewModel.events.length === 0)) {
            html += this._renderEmptyState();
            return html;
        }

        // Current Journey
        if (viewModel.currentJourney && viewModel.currentJourney.available) {
            html += this._renderCurrentJourney(viewModel.currentJourney);
        }

        // Events
        if (viewModel.events && viewModel.events.length > 0) {
            html += this._renderEvents(viewModel.events);
        }

        // Stale Warning
        if (viewModel.system && viewModel.system.freshness === 'stale') {
            html += this._renderStaleWarning();
        }

        return html;
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

        document.body.insertAdjacentHTML('beforeend', modalHtml);

        document.getElementById('cal-modal-cancel').addEventListener('click', function() {
            self._closeModal();
        });

        document.getElementById('cal-modal-save').addEventListener('click', function() {
            self._handleSave(opts, isCreate);
        });

        // ESC 关闭
        var escHandler = function(e) {
            if (e.key === 'Escape') {
                self._closeModal();
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);

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
        var auth = window.LawAIApp?.CalendarAuthority;
        if (!auth || !auth.isReady) {
            this._setModalStatus('Calendar not ready.', 'error');
            return;
        }

        var title = (document.getElementById('cal-modal-title').value || '').trim();
        var date = document.getElementById('cal-modal-date').value;
        var start = document.getElementById('cal-modal-start').value;
        var end = document.getElementById('cal-modal-end').value;
        var desc = (document.getElementById('cal-modal-desc').value || '').trim();

        if (!title) { this._setModalStatus('Title is required.', 'error'); return; }
        if (!date) { this._setModalStatus('Date is required.', 'error'); return; }
        if (!start || !end) { this._setModalStatus('Start and end times are required.', 'error'); return; }

        var startAt = date + 'T' + start + ':00';
        var endAt = date + 'T' + end + ':00';
        var duration = this._calcDuration(start, end);

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
            // edit: 先 reschedule，再 updateMetadata
            result = auth.reschedule(opts.scheduleId, startAt, duration);
            if (result.success) {
                auth.updateMetadata(opts.scheduleId, {
                    title: title,
                    description: desc
                });
            }
        }

        if (result.success) {
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
            this._setModalStatus('Couldn\'t save. Your changes are still here.', 'error');
        }
    },

    _calcDuration: function(startTime, endTime) {
        var s = startTime.split(':').map(Number);
        var e = endTime.split(':').map(Number);
        return (e[0] - s[0]) * 60 + (e[1] - s[1]);
    }
};

console.log('[CalendarRenderer] ✅ Loaded (Part 177)');
