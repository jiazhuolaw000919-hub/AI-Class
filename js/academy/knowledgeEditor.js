// knowledgeEditor.js — Part 177 产品化版
// 所有 CRUD 走 NotesAuthority

window.LawAIApp = window.LawAIApp || {};

LawAIApp.KnowledgeEditor = {
    version: '2.0.0',

    _getContainer: function() {
        return document.getElementById('academy-root') ||
               document.getElementById('app') ||
               document.getElementById('law-runtime-root');
    },

    goBack: function() {
        if (window.LawAIApp?.Notes?.render) {
            window.LawAIApp.Notes.render();
        } else {
            window.history.back();
        }
    },

    render: function(params) {
        params = params || {};
        var noteId = params.noteId;
        var isNew = noteId === 'new';
        var auth = window.LawAIApp?.NotesAuthority;

        if (!auth || !auth.isReady) {
            var container = this._getContainer();
            if (container) {
                container.innerHTML = '<div style="padding:40px;text-align:center;color:#94a3b8;">Loading editor...</div>';
            }
            if (auth && auth.onReady) {
                var self = this;
                auth.onReady(function() { self.render(params); });
            }
            return;
        }

        var note = isNew ? null : auth.getNote(noteId);

        var context = params.context || {};
        if (note) {
            context.lessonId = note.relatedLessonRef || context.lessonId;
            context.subjectId = note.relatedSubjectRef || context.subjectId;
            context.courseId = note.relatedCourseRef || context.courseId;
            context.schoolId = note.relatedSchoolRef || context.schoolId;
        }

        var title = note ? (note.title || '') : '';
        var content = note ? (note.content || '') : '';
        var tags = note && note.tags ? note.tags.join(', ') : '';
        var type = note ? (note.noteType || 'KEY_POINT') : 'KEY_POINT';

        var typeOptions = [
            'KEY_POINT', 'DEFINITION', 'EXAMPLE', 'SUMMARY',
            'PERSONAL_NOTE', 'QUESTION', 'MISTAKE', 'INSIGHT', 'BOOKMARK'
        ];

        // Context display
        var contextDisplayHTML = '';
        var hasContext = context.lessonId || context.courseId || context.subjectId;
        if (hasContext) {
            var parts = [];
            if (context.schoolId) parts.push('🏫 ' + context.schoolId);
            if (context.courseId) parts.push('📚 ' + context.courseId);
            if (context.subjectId) parts.push('📖 ' + context.subjectId);
            if (context.lessonId) parts.push('📝 ' + context.lessonId);
            contextDisplayHTML = `
                <div style="padding:8px 12px;background:rgba(74,158,255,0.04);border-radius:6px;border-left:2px solid #4a9eff;margin-bottom:12px;">
                    <span style="font-size:12px;color:#94a3b8;">🔗 ${parts.join(' → ')}</span>
                </div>
            `;
        }

        var html = `
            <div class="page" style="max-width:900px;margin:0 auto;padding:20px;color:#e2e8f0;font-family:'Inter',sans-serif;">
                <button onclick="LawAIApp.KnowledgeEditor.goBack()" style="background:rgba(74,158,255,0.08);border:1px solid rgba(74,158,255,0.15);color:#4a9eff;padding:10px 16px;border-radius:10px;cursor:pointer;font-family:inherit;font-size:14px;margin-bottom:16px;">← Back to Notes</button>

                <h2 style="margin:0 0 16px;font-size:24px;font-weight:700;">${isNew ? '📝 New Note' : '✏️ Edit Note'}</h2>

                ${contextDisplayHTML}

                <div style="margin-bottom:12px;">
                    <label style="font-size:12px;color:#94a3b8;display:block;margin-bottom:4px;">Type</label>
                    <select id="note-type" style="width:100%;padding:10px 14px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.06);border-radius:8px;color:#e2e8f0;font-family:inherit;font-size:14px;">
                        ${typeOptions.map(function(t) {
                            return `<option value="${t}" ${t === type ? 'selected' : ''}>${t.replace('_', ' ')}</option>`;
                        }).join('')}
                    </select>
                </div>

                <div style="margin-bottom:12px;">
                    <label style="font-size:12px;color:#94a3b8;display:block;margin-bottom:4px;">Title</label>
                    <input id="note-title" placeholder="Note title..." value="${title.replace(/"/g, '&quot;')}" style="width:100%;padding:10px 14px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.06);border-radius:8px;color:#e2e8f0;font-family:inherit;font-size:14px;box-sizing:border-box;">
                </div>

                <div style="margin-bottom:12px;">
                    <label style="font-size:12px;color:#94a3b8;display:block;margin-bottom:4px;">Content</label>
                    <textarea id="note-content" placeholder="Start writing..." style="width:100%;min-height:200px;padding:12px 14px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.06);border-radius:8px;color:#e2e8f0;font-family:inherit;font-size:14px;resize:vertical;box-sizing:border-box;">${content}</textarea>
                </div>

                <div style="margin-bottom:16px;">
                    <label style="font-size:12px;color:#94a3b8;display:block;margin-bottom:4px;">Tags (comma separated)</label>
                    <input id="note-tags" placeholder="e.g. ai, prompt, fundamentals" value="${tags}" style="width:100%;padding:10px 14px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.06);border-radius:8px;color:#e2e8f0;font-family:inherit;font-size:14px;box-sizing:border-box;">
                </div>

                <div id="save-status" style="margin-bottom:12px;font-size:13px;color:#94a3b8;min-height:20px;"></div>

                <div style="display:flex;gap:8px;margin-bottom:16px;">
                    <button id="save-note-btn" style="flex:1;padding:12px;background:#4a9eff;border:none;border-radius:8px;color:white;font-size:14px;font-weight:600;cursor:pointer;font-family:inherit;">💾 Save Note</button>
                    ${!isNew ? `<button id="delete-note-btn" style="padding:12px 20px;background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.2);border-radius:8px;color:#ef4444;font-size:14px;cursor:pointer;font-family:inherit;">🗑️ Delete</button>` : ''}
                </div>

                ${!isNew ? `
                    <div style="background:rgba(255,255,255,0.02);border-radius:8px;padding:14px 16px;border:1px solid rgba(255,255,255,0.04);">
                        <h3 style="margin:0 0 8px;font-size:13px;color:#94a3b8;">🔗 Source</h3>
                        <div style="font-size:13px;color:#64748b;">
                            ${note && note.relatedLessonRef ? `📖 Lesson: ${note.relatedLessonRef}` : 'No linked lesson'}
                        </div>
                        ${note && note.createdAt ? `<div style="font-size:11px;color:#475569;margin-top:4px;">Created: ${new Date(note.createdAt).toLocaleString()}</div>` : ''}
                        ${note && note.updatedAt ? `<div style="font-size:11px;color:#475569;">Updated: ${new Date(note.updatedAt).toLocaleString()}</div>` : ''}
                    </div>
                ` : ''}
            </div>
        `;

        var container = this._getContainer();
        if (!container) return;
        container.innerHTML = html;

        // Save
        var saveBtn = document.getElementById('save-note-btn');
        if (saveBtn) {
            saveBtn.addEventListener('click', function() {
                var t = document.getElementById('note-title').value.trim();
                var c = document.getElementById('note-content').value.trim();
                var tagsInput = document.getElementById('note-tags').value.trim();
                var tp = document.getElementById('note-type').value;
                var tg = tagsInput ? tagsInput.split(',').map(function(x) { return x.trim(); }).filter(function(x) { return x; }) : [];

                if (!t && !c) {
                    LawAIApp.KnowledgeEditor._setStatus('Please add a title or content.', 'error');
                    return;
                }

                LawAIApp.KnowledgeEditor._setStatus('Saving...', 'info');

                var result;
                if (isNew) {
                    result = auth.create({
                        title: t || 'Untitled',
                        content: c || '',
                        tags: tg,
                        noteType: tp,
                        relatedLessonRef: context.lessonId || null,
                        relatedSubjectRef: context.subjectId || null,
                        relatedCourseRef: context.courseId || null,
                        relatedSchoolRef: context.schoolId || null,
                        source: 'knowledge-editor'
                    });
                } else {
                    result = auth.update(noteId, {
                        title: t || 'Untitled',
                        content: c || '',
                        tags: tg,
                        noteType: tp,
                        relatedLessonRef: context.lessonId || null,
                        relatedSubjectRef: context.subjectId || null,
                        relatedCourseRef: context.courseId || null,
                        relatedSchoolRef: context.schoolId || null
                    });
                }

                if (result.success) {
                    LawAIApp.KnowledgeEditor._setStatus('Saved', 'success');
                    if (window.LawAIApp?.Toast?.success) LawAIApp.Toast.success('✅ Note saved');
                    setTimeout(function() {
                        LawAIApp.KnowledgeEditor.goBack();
                    }, 300);
                } else {
                    LawAIApp.KnowledgeEditor._setStatus('Couldn\'t save. Your changes are still here. Try again.', 'error');
                    if (window.LawAIApp?.Toast?.error) LawAIApp.Toast.error('Couldn\'t save note.');
                }
            });
        }

        // Delete
        var deleteBtn = document.getElementById('delete-note-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', function() {
                if (!confirm('Delete this note?')) return;
                var r = auth.delete(noteId);
                if (r.success) {
                    if (window.LawAIApp?.Toast?.success) LawAIApp.Toast.success('🗑️ Note deleted');
                    LawAIApp.KnowledgeEditor.goBack();
                } else {
                    LawAIApp.KnowledgeEditor._setStatus('Couldn\'t delete. Try again.', 'error');
                }
            });
        }
    },

    _setStatus: function(text, kind) {
        var el = document.getElementById('save-status');
        if (!el) return;
        var colors = { info: '#94a3b8', success: '#10b981', error: '#ef4444' };
        el.style.color = colors[kind] || '#94a3b8';
        el.textContent = text;
    }
};

console.log('[KnowledgeEditor] ✅ Module loaded (v2.0.0 — Part 177)');
