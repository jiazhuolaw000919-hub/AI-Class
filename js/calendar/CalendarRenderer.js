// js/calendar/CalendarRenderer.js
// Part 104: Calendar Renderer
// 只做呈现，不计算智能

window.LawAIApp = window.LawAIApp || {};

LawAIApp.CalendarRenderer = {

    _rendered: false,

    /**
     * 渲染 Calendar
     * @param {Object} viewModel - CalendarViewModel 输出
     * @param {HTMLElement} container - 渲染容器
     */
    render: function(viewModel, container) {
        if (!container) {
            container = document.getElementById('calendar-root');
        }

        if (!container) {
            console.warn('[CalendarRenderer] Container not found');
            return;
        }

        if (!viewModel) {
            viewModel = LawAIApp.CalendarViewModel
                ? LawAIApp.CalendarViewModel.toRenderModel(null)
                : { isEmpty: true };
        }

        var html = this._buildHTML(viewModel);
        container.innerHTML = html;
        this._rendered = true;
    },

    _buildHTML: function(viewModel) {
        if (viewModel.isEmpty) {
            return this._renderEmptyState();
        }

        var html = '';

        // Header
        html += this._renderHeader(viewModel);

        // Learning Options（来自 Core）
        if (viewModel.learningOptions && viewModel.learningOptions.length > 0) {
            html += this._renderLearningOptions(viewModel.learningOptions);
        }

        // Current Journey
        if (viewModel.currentJourney && viewModel.currentJourney.available) {
            html += this._renderCurrentJourney(viewModel.currentJourney);
        }

        // Suggested Schedule
        if (viewModel.suggestedSchedule) {
            html += this._renderSuggestedSchedule(viewModel.suggestedSchedule);
        }

        // Events
        if (viewModel.events && viewModel.events.length > 0) {
            html += this._renderEvents(viewModel.events);
        }

        // Conflicts
        if (viewModel.conflicts && viewModel.conflicts.length > 0) {
            html += this._renderConflicts(viewModel.conflicts);
        }

        // System Status
        if (viewModel.system && viewModel.system.freshness === 'stale') {
            html += this._renderStaleWarning();
        }

        return html;
    },

    _renderHeader: function(viewModel) {
        return `
            <div style="display:flex;justify-content:space-between;align-items:center;padding:16px 20px;border-bottom:1px solid rgba(255,255,255,0.06);">
                <h2 style="font-size:20px;font-weight:600;margin:0;">📅 Calendar</h2>
                <div style="display:flex;gap:8px;">
                    <button onclick="LawAIApp.CalendarRenderer.switchView('day')" style="padding:4px 14px;background:${viewModel.viewMode === 'day' ? 'rgba(74,158,255,0.12)' : 'rgba(255,255,255,0.03)'};border:1px solid ${viewModel.viewMode === 'day' ? 'rgba(74,158,255,0.2)' : 'rgba(255,255,255,0.06)'};border-radius:6px;color:${viewModel.viewMode === 'day' ? '#4a9eff' : '#94a3b8'};font-size:12px;cursor:pointer;font-family:inherit;">Day</button>
                    <button onclick="LawAIApp.CalendarRenderer.switchView('week')" style="padding:4px 14px;background:${viewModel.viewMode === 'week' ? 'rgba(74,158,255,0.12)' : 'rgba(255,255,255,0.03)'};border:1px solid ${viewModel.viewMode === 'week' ? 'rgba(74,158,255,0.2)' : 'rgba(255,255,255,0.06)'};border-radius:6px;color:${viewModel.viewMode === 'week' ? '#4a9eff' : '#94a3b8'};font-size:12px;cursor:pointer;font-family:inherit;">Week</button>
                    <button onclick="LawAIApp.CalendarRenderer.switchView('month')" style="padding:4px 14px;background:${viewModel.viewMode === 'month' ? 'rgba(74,158,255,0.12)' : 'rgba(255,255,255,0.03)'};border:1px solid ${viewModel.viewMode === 'month' ? 'rgba(74,158,255,0.2)' : 'rgba(255,255,255,0.06)'};border-radius:6px;color:${viewModel.viewMode === 'month' ? '#4a9eff' : '#94a3b8'};font-size:12px;cursor:pointer;font-family:inherit;">Month</button>
                </div>
            </div>
            <div style="padding:8px 20px;font-size:13px;color:#64748b;border-bottom:1px solid rgba(255,255,255,0.03);">
                ${viewModel.dateRange?.label || 'No date range'}
            </div>
        `;
    },

    _renderLearningOptions: function(options) {
        var html = `
            <div style="padding:16px 20px;border-bottom:1px solid rgba(255,255,255,0.04);">
                <div style="font-size:11px;color:#64748b;font-weight:500;letter-spacing:0.6px;margin-bottom:10px;">
                    📖 RECOMMENDED LEARNING OPTIONS
                </div>
                <div style="display:flex;flex-direction:column;gap:6px;">
        `;

        for (var i = 0; i < Math.min(options.length, 4); i++) {
            var opt = options[i];
            var priorityColor = opt.priority === 'high' ? '#4a9eff' :
                               opt.priority === 'medium' ? '#f59e0b' : '#64748b';
            var isPrimary = opt.status === 'primary';

            html += `
                <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 12px;background:${isPrimary ? 'rgba(74,158,255,0.04)' : 'rgba(255,255,255,0.02)'};border-radius:8px;border-left:3px solid ${isPrimary ? '#4a9eff' : priorityColor};">
                    <div>
                        <div style="font-size:13px;font-weight:500;color:#e2e8f0;">
                            ${isPrimary ? '⭐ ' : ''}${opt.title}
                        </div>
                        <div style="font-size:11px;color:#94a3b8;">
                            ${opt.formattedDuration || '30 min'} · ${opt.confidence || 'Moderate'} confidence
                            ${opt.reason ? ' · ' + opt.reason : ''}
                        </div>
                    </div>
                    <button onclick="LawAIApp.CalendarRenderer.scheduleOption('${opt.id}')" style="
                        padding:4px 14px;
                        background:${isPrimary ? '#4a9eff' : 'rgba(255,255,255,0.04)'};
                        border:1px solid ${isPrimary ? 'rgba(74,158,255,0.3)' : 'rgba(255,255,255,0.06)'};
                        border-radius:100px;
                        color:${isPrimary ? 'white' : '#94a3b8'};
                        font-size:11px;
                        cursor:pointer;
                        font-family:inherit;
                    ">Schedule</button>
                </div>
            `;
        }

        html += `
                </div>
            </div>
        `;

        return html;
    },

    _renderCurrentJourney: function(journey) {
        return `
            <div style="padding:12px 20px;border-bottom:1px solid rgba(255,255,255,0.04);background:rgba(74,158,255,0.02);">
                <div style="font-size:11px;color:#64748b;font-weight:500;letter-spacing:0.6px;">
                    📍 CURRENT JOURNEY
                </div>
                <div style="font-size:14px;color:#e2e8f0;font-weight:500;margin-top:2px;">
                    ${journey.title}
                </div>
                <div style="font-size:11px;color:#94a3b8;">
                    Progress: ${journey.progress || 0}%
                </div>
            </div>
        `;
    },

    _renderSuggestedSchedule: function(suggested) {
        return `
            <div style="padding:16px 20px;border-bottom:1px solid rgba(255,255,255,0.04);background:rgba(16,185,129,0.03);">
                <div style="font-size:11px;color:#10b981;font-weight:500;letter-spacing:0.6px;">
                    ✓ SUGGESTED SCHEDULE
                </div>
                <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-top:4px;">
                    <div>
                        <div style="font-size:14px;font-weight:500;color:#e2e8f0;">
                            ${suggested.title}
                        </div>
                        <div style="font-size:12px;color:#94a3b8;">
                            ${suggested.formattedTime || 'Time TBD'} · ${suggested.duration || 30} min
                            ${suggested.reason ? ' · ' + suggested.reason : ''}
                        </div>
                    </div>
                    <button onclick="LawAIApp.CalendarRenderer.confirmSchedule('${suggested.itemId}')" style="
                        padding:6px 20px;
                        background:#10b981;
                        border:none;
                        border-radius:100px;
                        color:white;
                        font-size:12px;
                        font-weight:500;
                        cursor:pointer;
                        font-family:inherit;
                    ">Confirm →</button>
                </div>
            </div>
        `;
    },

    _renderEvents: function(events) {
        var html = `
            <div style="padding:16px 20px;border-bottom:1px solid rgba(255,255,255,0.04);">
                <div style="font-size:11px;color:#64748b;font-weight:500;letter-spacing:0.6px;margin-bottom:10px;">
                    📋 SCHEDULED EVENTS
                </div>
                <div style="display:flex;flex-direction:column;gap:6px;">
        `;

        for (var i = 0; i < Math.min(events.length, 10); i++) {
            var evt = events[i];
            var statusColor = evt.status === 'completed' ? '#10b981' :
                             evt.status === 'cancelled' ? '#ef4444' :
                             evt.status === 'missed' ? '#f59e0b' : '#4a9eff';

            html += `
                <div style="display:flex;justify-content:space-between;align-items:center;padding:6px 12px;background:rgba(255,255,255,0.02);border-radius:6px;border-left:2px solid ${statusColor};">
                    <div>
                        <div style="font-size:13px;color:#e2e8f0;">
                            ${evt.title}
                        </div>
                        <div style="font-size:11px;color:#64748b;">
                            ${evt.formattedTime || 'Time TBD'}
                            ${evt.status !== 'scheduled' ? ' · ' + evt.status : ''}
                        </div>
                    </div>
                    <div style="display:flex;gap:4px;">
                        <button onclick="LawAIApp.CalendarRenderer.editEvent('${evt.id}')" style="
                            padding:2px 10px;
                            background:rgba(255,255,255,0.03);
                            border:1px solid rgba(255,255,255,0.06);
                            border-radius:100px;
                            color:#64748b;
                            font-size:9px;
                            cursor:pointer;
                            font-family:inherit;
                        ">✎</button>
                        <button onclick="LawAIApp.CalendarRenderer.cancelEvent('${evt.id}')" style="
                            padding:2px 10px;
                            background:rgba(239,68,68,0.06);
                            border:1px solid rgba(239,68,68,0.08);
                            border-radius:100px;
                            color:#ef4444;
                            font-size:9px;
                            cursor:pointer;
                            font-family:inherit;
                        ">✕</button>
                    </div>
                </div>
            `;
        }

        html += `
                </div>
            </div>
        `;

        return html;
    },

    _renderConflicts: function(conflicts) {
        var html = `
            <div style="padding:12px 20px;border-bottom:1px solid rgba(239,68,68,0.08);background:rgba(239,68,68,0.03);">
                <div style="font-size:11px;color:#ef4444;font-weight:500;letter-spacing:0.6px;">
                    ⚠️ CONFLICTS
                </div>
        `;

        for (var i = 0; i < conflicts.length; i++) {
            var c = conflicts[i];
            html += `
                <div style="font-size:12px;color:#fca5a5;padding:2px 0;">
                    ${c.description || 'Schedule conflict detected'}
                </div>
            `;
        }

        html += `</div>`;
        return html;
    },

    _renderStaleWarning: function() {
        return `
            <div style="padding:8px 20px;background:rgba(245,158,11,0.06);border-top:1px solid rgba(245,158,11,0.08);">
                <div style="font-size:11px;color:#f59e0b;">
                    ⚡ Some recommendations may be outdated. Refresh for latest.
                </div>
            </div>
        `;
    },

    _renderEmptyState: function() {
        return `
            <div style="text-align:center;padding:60px 20px;color:#94a3b8;">
                <div style="font-size:48px;margin-bottom:16px;">📅</div>
                <h3 style="font-size:20px;font-weight:600;margin:0 0 8px 0;color:#e2e8f0;">No Schedule Yet</h3>
                <p style="font-size:15px;margin:0 0 16px;">Schedule a learning session to get started.</p>
                <button onclick="LawAIApp.CalendarRenderer.showRecommendations()" style="
                    padding:8px 24px;
                    background:#4a9eff;
                    border:none;
                    border-radius:100px;
                    color:white;
                    font-size:14px;
                    font-weight:500;
                    cursor:pointer;
                    font-family:inherit;
                ">View Recommendations</button>
            </div>
        `;
    },

    // ============================================================
    // 交互方法（只发送事件，不计算智能）
    // ============================================================

    switchView: function(viewMode) {
        var eventAdapter = LawAIApp.CalendarEventAdapter;
        if (eventAdapter) {
            eventAdapter.sendCalendarViewed(viewMode);
        }
        // 重新渲染
        var container = document.getElementById('calendar-root');
        if (container) {
            var surfaceData = LawAIApp.CalendarSurfaceAdapter
                ? LawAIApp.CalendarSurfaceAdapter.adapt(
                    LawAIApp.LearningJourneyAdapter?.getJourneyContext() || null,
                    { events: [] }
                )
                : null;
            var viewModel = LawAIApp.CalendarViewModel
                ? LawAIApp.CalendarViewModel.toRenderModel(surfaceData)
                : null;
            viewModel.viewMode = viewMode;
            this.render(viewModel, container);
        }
    },

    scheduleOption: function(optionId) {
        var eventAdapter = LawAIApp.CalendarEventAdapter;
        if (eventAdapter) {
            eventAdapter.sendScheduleCreated({
                itemId: optionId,
                title: 'Learning Session',
                duration: 30,
                source: 'calendar'
            });
        }
        // Toast 反馈
        if (window.LawAIApp?.Toast) {
            LawAIApp.Toast.success('📅 Session scheduled');
        }
    },

    confirmSchedule: function(itemId) {
        var eventAdapter = LawAIApp.CalendarEventAdapter;
        if (eventAdapter) {
            eventAdapter.sendScheduleCreated({
                itemId: itemId,
                title: 'Learning Session',
                duration: 30,
                source: 'calendar'
            });
        }
        if (window.LawAIApp?.Toast) {
            LawAIApp.Toast.success('✅ Schedule confirmed');
        }
    },

    editEvent: function(eventId) {
        // 打开编辑对话框（简化版）
        if (window.LawAIApp?.Toast) {
            LawAIApp.Toast.info('✎ Edit event: ' + eventId);
        }
    },

    cancelEvent: function(eventId) {
        var eventAdapter = LawAIApp.CalendarEventAdapter;
        if (eventAdapter) {
            eventAdapter.sendScheduleCancelled(eventId, 'User cancelled');
        }
        if (window.LawAIApp?.Toast) {
            LawAIApp.Toast.info('✕ Event cancelled');
        }
        // 重新渲染
        this.switchView('week');
    },

    showRecommendations: function() {
        // 导航到 Academy
        window.location.href = '/pages/academy.html';
    }
};

console.log('📅 CalendarRenderer loaded (Part 104)');
