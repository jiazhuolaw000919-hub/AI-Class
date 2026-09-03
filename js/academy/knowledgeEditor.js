// knowledgeEditor.js — S4 升级版 (Part 34)
// Part 113: 容器适配 + 返回逻辑修复

window.LawAIApp = window.LawAIApp || {};

LawAIApp.KnowledgeEditor = {
    /**
     * 获取容器 (与 Notes 保持一致)
     */
    _getContainer: function() {
        return document.getElementById('academy-root') || 
               document.getElementById('app') ||
               document.getElementById('law-runtime-root');
    },

    /**
     * 返回 Notes (不依赖 Router)
     */
    goBack: function() {
        console.log('[KnowledgeEditor] 📝 Back to Notes');
        var router = window.LawAIApp?.Router;
        if (router && typeof router.navigate === 'function') {
            router.navigate('notes');
        } else {
            // fallback: 重新渲染 Notes
            if (window.LawAIApp?.Notes) {
                window.LawAIApp.Notes.render();
            } else {
                window.history.back();
            }
        }
    },

    /**
     * 渲染编辑器
     */
    render: function(params) {
        var noteId = params.noteId;
        var isNew = noteId === 'new';
        var note = isNew ? null : LawAIApp.KnowledgeCapture.getById(noteId);
        var title = note ? note.title : '';
        var content = note ? note.content : '';
        var tags = note && note.tags ? note.tags.join(', ') : '';
        var type = note ? note.type : 'KEY_POINT';

        var typeOptions = [
            'KEY_POINT', 'DEFINITION', 'EXAMPLE', 'SUMMARY',
            'PERSONAL_NOTE', 'QUESTION', 'MISTAKE', 'INSIGHT', 'BOOKMARK'
        ];

        var html = `
            <div class="page" style="max-width:900px;margin:0 auto;padding:20px;color:#e2e8f0;font-family:'Inter',sans-serif;">

                <!-- 返回按钮 -->
                <button onclick="LawAIApp.KnowledgeEditor.goBack()" style="
                    background:rgba(74,158,255,0.08);
                    border:1px solid rgba(74,158,255,0.15);
                    color:#4a9eff;
                    padding:10px 16px;
                    border-radius:10px;
                    cursor:pointer;
                    font-family:inherit;
                    font-size:14px;
                    margin-bottom:16px;
                    transition:all 0.2s;
                " onmouseover="this.style.background='rgba(74,158,255,0.15)'" onmouseout="this.style.background='rgba(74,158,255,0.08)'">
                    ← Back to Notes
                </button>

                <h2 style="margin:0 0 16px;font-size:24px;font-weight:700;">${isNew ? '📝 New Note' : '✏️ Edit Note'}</h2>

                <!-- Type -->
                <div style="margin-bottom:12px;">
                    <label style="font-size:12px;color:#94a3b8;display:block;margin-bottom:4px;">Type</label>
                    <select id="note-type" style="
                        width:100%;
                        padding:10px 14px;
                        background:rgba(255,255,255,0.04);
                        border:1px solid rgba(255,255,255,0.06);
                        border-radius:8px;
                        color:#e2e8f0;
                        font-family:inherit;
                        font-size:14px;
                    ">
                        ${typeOptions.map(function(t) {
                            return `<option value="${t}" ${t === type ? 'selected' : ''}>${t.replace('_', ' ')}</option>`;
                        }).join('')}
                    </select>
                </div>

                <!-- Title -->
                <div style="margin-bottom:12px;">
                    <label style="font-size:12px;color:#94a3b8;display:block;margin-bottom:4px;">Title</label>
                    <input id="note-title" placeholder="Note title..." value="${title.replace(/"/g, '&quot;')}" style="
                        width:100%;
                        padding:10px 14px;
                        background:rgba(255,255,255,0.04);
                        border:1px solid rgba(255,255,255,0.06);
                        border-radius:8px;
                        color:#e2e8f0;
                        font-family:inherit;
                        font-size:14px;
                        box-sizing:border-box;
                    ">
                </div>

                <!-- Content -->
                <div style="margin-bottom:12px;">
                    <label style="font-size:12px;color:#94a3b8;display:block;margin-bottom:4px;">Content</label>
                    <textarea id="note-content" placeholder="Start writing..." style="
                        width:100%;
                        min-height:200px;
                        padding:12px 14px;
                        background:rgba(255,255,255,0.04);
                        border:1px solid rgba(255,255,255,0.06);
                        border-radius:8px;
                        color:#e2e8f0;
                        font-family:inherit;
                        font-size:14px;
                        resize:vertical;
                        box-sizing:border-box;
                    ">${content}</textarea>
                </div>

                <!-- Tags -->
                <div style="margin-bottom:16px;">
                    <label style="font-size:12px;color:#94a3b8;display:block;margin-bottom:4px;">Tags (comma separated)</label>
                    <input id="note-tags" placeholder="e.g. ai, prompt, fundamentals" value="${tags}" style="
                        width:100%;
                        padding:10px 14px;
                        background:rgba(255,255,255,0.04);
                        border:1px solid rgba(255,255,255,0.06);
                        border-radius:8px;
                        color:#e2e8f0;
                        font-family:inherit;
                        font-size:14px;
                        box-sizing:border-box;
                    ">
                </div>

                <!-- Actions -->
                <div style="display:flex;gap:8px;margin-bottom:16px;">
                    <button id="save-note-btn" style="
                        flex:1;
                        padding:12px;
                        background:#4a9eff;
                        border:none;
                        border-radius:8px;
                        color:white;
                        font-size:14px;
                        font-weight:600;
                        cursor:pointer;
                        font-family:inherit;
                        transition:all 0.2s;
                    " onmouseover="this.style.background='#3b82f6'" onmouseout="this.style.background='#4a9eff'">
                        💾 Save Note
                    </button>
                    ${!isNew ? `
                        <button id="delete-note-btn" style="
                            padding:12px 20px;
                            background:rgba(239,68,68,0.1);
                            border:1px solid rgba(239,68,68,0.2);
                            border-radius:8px;
                            color:#ef4444;
                            font-size:14px;
                            cursor:pointer;
                            font-family:inherit;
                            transition:all 0.2s;
                        " onmouseover="this.style.background='rgba(239,68,68,0.2)'" onmouseout="this.style.background='rgba(239,68,68,0.1)'">
                            🗑️ Delete
                        </button>
                    ` : ''}
                </div>

                <!-- Metadata (existing notes only) -->
                ${!isNew ? `
                    <div style="
                        background:rgba(255,255,255,0.02);
                        border-radius:8px;
                        padding:14px 16px;
                        border:1px solid rgba(255,255,255,0.04);
                    ">
                        <h3 style="margin:0 0 8px;font-size:13px;color:#94a3b8;">🔗 Source</h3>
                        <div style="font-size:13px;color:#64748b;">
                            ${note ? (note.lessonId ? `📖 Lesson: ${note.lessonId}` : 'No linked lesson') : ''}
                        </div>
                        ${note && note.createdAt ? `<div style="font-size:11px;color:#475569;margin-top:4px;">Created: ${new Date(note.createdAt).toLocaleString()}</div>` : ''}
                        ${note && note.updatedAt ? `<div style="font-size:11px;color:#475569;">Updated: ${new Date(note.updatedAt).toLocaleString()}</div>` : ''}
                        <div style="font-size:10px;color:#475569;margin-top:6px;border-top:1px solid rgba(255,255,255,0.03);padding-top:6px;">
                            🔒 Note Authority · Learner-created knowledge
                        </div>
                    </div>
                ` : ''}
            </div>
        `;

        // 🔥 使用多容器适配
        var container = this._getContainer();
        if (!container) {
            console.warn('[KnowledgeEditor] No container found');
            return;
        }
        container.innerHTML = html;

        // ============================================================
        // 事件绑定
        // ============================================================

        // Save
        var saveBtn = document.getElementById('save-note-btn');
        if (saveBtn) {
            saveBtn.addEventListener('click', function() {
                var title = document.getElementById('note-title').value.trim();
                var content = document.getElementById('note-content').value.trim();
                var tagsInput = document.getElementById('note-tags').value.trim();
                var type = document.getElementById('note-type').value;
                var tags = tagsInput ? tagsInput.split(',').map(function(t) { return t.trim(); }).filter(function(t) { return t; }) : [];

                if (!title && !content) {
                    alert('Please add a title or content.');
                    return;
                }

                if (isNew) {
                    LawAIApp.KnowledgeCapture.create({
                        title: title || 'Untitled',
                        content: content || '',
                        tags: tags,
                        type: type
                    });
                } else {
                    LawAIApp.KnowledgeCapture.update(noteId, {
                        title: title || 'Untitled',
                        content: content || '',
                        tags: tags,
                        type: type
                    });
                }

                // 返回 Notes
                LawAIApp.KnowledgeEditor.goBack();
            });
        }

        // Delete (existing notes only)
        var deleteBtn = document.getElementById('delete-note-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', function() {
                if (confirm('Delete this note permanently?')) {
                    LawAIApp.KnowledgeCapture.remove(noteId);
                    LawAIApp.KnowledgeEditor.goBack();
                }
            });
        }

        console.log('[KnowledgeEditor] ✅ Rendered');
    }
};

console.log('✏️ KnowledgeEditor module loaded (Part 113)');
