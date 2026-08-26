// js/academy/notesView.js
// Part 34 Finalization — 独立 Notes 视图
// 被 Dashboard 和 Academy 共享

(function() {
    'use strict';

    if (window.LawAIApp && window.LawAIApp.NotesView) {
        console.log('[NotesView] Already exists, skipping...');
        return;
    }

    window.LawAIApp = window.LawAIApp || {};

    var NotesView = {
        version: '1.0.0',

        /**
         * 渲染 Notes 视图
         * @param {HTMLElement} container - 渲染容器
         * @param {Object} options - 配置选项
         */
        render: function(container, options) {
            if (!container) {
                console.warn('[NotesView] Container not found');
                return;
            }

            console.log('[NotesView] 🎨 Rendering Notes...');

            // 获取 Notes 数据
            var notesData = this._getNotesData();
            
            if (!notesData || notesData.length === 0) {
                container.innerHTML = this._renderEmptyState();
                return;
            }

            container.innerHTML = this._renderNotesList(notesData);
        },

        /**
         * 获取 Notes 数据
         */
        _getNotesData: function() {
            var notesData = [];

            // 尝试从 Notes 模块获取数据
            var notesModule = window.LawAIApp?.Notes || window.LawAIApp?.KnowledgeCapture;
            if (notesModule && typeof notesModule.getNotes === 'function') {
                notesData = notesModule.getNotes() || [];
            }

            // 如果没有 Notes 模块，从 LearningJourneyAdapter 获取已完成的 Lessons
            if (!notesData || notesData.length === 0) {
                var adapter = window.LawAIApp?.LearningJourneyAdapter;
                if (adapter && typeof adapter.getState === 'function') {
                    var state = adapter.getState();
                    var completedLessons = state?.completedLessons || [];
                    
                    if (completedLessons && completedLessons.length > 0) {
                        notesData = completedLessons.map(function(lessonId) {
                            return {
                                id: lessonId,
                                title: 'Lesson ' + lessonId,
                                content: 'Knowledge from this lesson will appear here',
                                lessonId: lessonId,
                                createdAt: new Date().toISOString()
                            };
                        });
                    }
                }
            }

            return notesData;
        },

        /**
         * 渲染空状态
         */
        _renderEmptyState: function() {
            return `
                <div style="padding: 60px 20px; text-align: center; color: #94a3b8; max-width: 1200px; margin: 0 auto;">
                    <div style="font-size: 48px; margin-bottom: 16px;">📝</div>
                    <h3 style="font-size: 20px; font-weight: 600; margin: 0 0 8px 0; color: #e2e8f0;">No Notes Yet</h3>
                    <p style="font-size: 15px; margin: 0;">Complete a lesson to start building your personal knowledge library.</p>
                    <button onclick="window.location.href='/pages/academy.html'" 
                            style="margin-top: 16px; padding: 10px 24px; background: #4a9eff; border: none; border-radius: 8px; color: white; font-weight: 600; cursor: pointer; font-family: inherit;">
                        📖 Start Learning
                    </button>
                </div>
            `;
        },

        /**
         * 渲染 Notes 列表
         */
        _renderNotesList: function(notesData) {
            var html = '';

            html += `
                <div style="padding: 0 16px 32px; max-width: 1200px; margin: 0 auto;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 12px;">
                        <div>
                            <h2 style="font-size: 24px; font-weight: 700; margin: 0 0 4px 0; color: #e2e8f0;">📝 Your Notes</h2>
                            <p style="color: #94a3b8; font-size: 14px; margin: 0;">${notesData.length} knowledge assets captured</p>
                        </div>
                        <button onclick="window.location.href='/pages/academy.html'" 
                                style="padding: 8px 18px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; color: #94a3b8; cursor: pointer; font-family: inherit;">
                            ← Back to Academy
                        </button>
                    </div>
                    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px;">
            `;

            for (var i = 0; i < notesData.length; i++) {
                var note = notesData[i];
                var title = note.title || 'Untitled Note';
                var content = note.content || note.summary || 'No content';
                var date = note.createdAt ? new Date(note.createdAt).toLocaleDateString() : 'Recently';
                var lessonId = note.lessonId || '';

                html += `
                    <div style="background: rgba(255,255,255,0.04); border-radius: 12px; padding: 16px; border: 1px solid rgba(255,255,255,0.06);">
                        <div style="font-size: 14px; font-weight: 600; color: #e2e8f0; margin-bottom: 6px;">${title}</div>
                        <p style="color: #94a3b8; font-size: 13px; margin: 0 0 8px 0; line-height: 1.5;">${content}</p>
                        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: #64748b;">
                            <span>📖 ${lessonId || 'No lesson'}</span>
                            <span>${date}</span>
                        </div>
                    </div>
                `;
            }

            html += `
                    </div>
                </div>
            `;

            return html;
        }
    };

    window.LawAIApp.NotesView = NotesView;
    console.log('[NotesView] ✅ Module loaded (v' + NotesView.version + ')');
})();
