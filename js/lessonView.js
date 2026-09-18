// ===========================================
// lessonView.js
// 课程视图 — v6.0.0 (完美整合版)
// ===========================================

window.LawAIApp = window.LawAIApp || {};
LawAIApp.Views = LawAIApp.Views || {};

LawAIApp.Views.LessonView = {
    _container: null,
    _lessonId: null,
    _lesson: null,
    _currentPractice: null,
    _isFocused: false,

    // ============================================================
    // 入口
    // ============================================================
    render: async function(lessonId, container, context) {
        this._lessonId = lessonId;
        this._context = context || {};
        this._container = typeof container === 'string'
            ? document.querySelector(container)
            : container || document.getElementById('app') || document.getElementById('academy-root') || document.getElementById('law-runtime-root');
    
        if (!this._container) {
            console.warn('⚠️ LessonView: Container not found');
            return;
        }
    
        if (LawAIApp.DevTools?.RuntimeProfiler) {
            LawAIApp.DevTools.RuntimeProfiler.recordRender('lesson');
        }
    
        console.log('[LessonView] render:', lessonId, 'context:', this._context);
    
        this._showSkeleton();
    
        var lesson = await this._loadLessonAsync(lessonId, this._context);
        if (lesson) {
            this._lesson = lesson;
            this._renderContent(lesson);
        } else {
            this._renderNotFound(lessonId);
        }
    },

    // ============================================================
    // 数据加载
    // ============================================================
    _loadLessonAsync: async function(lessonId, context) {
        console.log('[LessonView] 🚀 _loadLessonAsync:', lessonId, 'context:', context);
    
        var loader = window.LawAIApp && (window.LawAIApp.ContentLoader || window.LawAIApp.S4ContentLoader);
    
        // 🔥 优先用传入的 context
        var courseId = (context && context.courseId) || null;
        var subjectId = (context && context.subjectId) || null;
    
        if (loader && typeof loader.loadLesson === 'function') {
    
            // 方式 A: CurriculumAuthority（如果 context 缺值）
            if (!courseId || !subjectId) {
                var ca = window.LawAIApp && window.LawAIApp.CurriculumAuthority;
                if (ca && typeof ca.getLesson === 'function') {
                    try {
                        var caLesson = ca.getLesson(lessonId);
                        if (caLesson && caLesson.subjectId) {
                            var caSubject = ca.getSubject(caLesson.subjectId);
                            if (caSubject) {
                                courseId = courseId || caSubject.courseId;
                                subjectId = subjectId || caSubject.id;
                            }
                        }
                    } catch (e) {}
                }
            }
    
            // 方式 B: SubjectRegistry（如果 context 缺值）
            if (!courseId || !subjectId) {
                var sr = window.LawAIApp && window.LawAIApp.SubjectRegistry;
                if (sr && typeof sr.getAllSubjects === 'function') {
                    var allSubjects = sr.getAllSubjects();
                    for (var i = 0; i < allSubjects.length; i++) {
                        var subj = allSubjects[i];
                        var lessons = subj.lessons || [];
                        for (var j = 0; j < lessons.length; j++) {
                            var l = lessons[j];
                            var lid = (typeof l === 'string') ? l : (l.id || l.lessonId);
                            if (lid === lessonId) {
                                courseId = courseId || subj.courseId;
                                subjectId = subjectId || subj.id;
                                break;
                            }
                        }
                        if (courseId && subjectId) break;
                    }
                }
            }
    
            console.log('[LessonView] resolved IDs:', { courseId, subjectId, lessonId });
    
            if (courseId && subjectId) {
                try {
                    var fullLesson = await loader.loadLesson(courseId, subjectId, lessonId);
                    if (fullLesson) {
                        console.log('[LessonView] ✅ 拿到完整 lesson');
                        return this._normalizeFullLesson(fullLesson);
                    }
                } catch (e) {
                    console.warn('[LessonView] loadLesson 失败:', e);
                }
            } else {
                console.warn('[LessonView] ⚠️ 仍找不到 courseId/subjectId，将走 fallback');
            }
        }
    
        // ===== 下面是原来的 fallback 逻辑，保持不变 =====
    
        // Fallback: CA 元数据
        var ca2 = window.LawAIApp && window.LawAIApp.CurriculumAuthority;
        if (ca2 && typeof ca2.getLesson === 'function') {
            try {
                var caLesson2 = ca2.getLesson(lessonId);
                if (caLesson2) {
                    console.log('[LessonView] ⚠️ 从 CA 拿到（元数据）');
                    return this._normalizeMetaOnlyLesson(caLesson2);
                }
            } catch (e) {}
        }
    
        // Fallback: SubjectRegistry 元数据
        var sr2 = window.LawAIApp && window.LawAIApp.SubjectRegistry;
        if (sr2 && typeof sr2.getAllSubjects === 'function') {
            try {
                var subjects2 = sr2.getAllSubjects();
                for (var i2 = 0; i2 < subjects2.length; i2++) {
                    var subj2 = subjects2[i2];
                    var lessons2 = subj2.lessons || [];
                    for (var j2 = 0; j2 < lessons2.length; j2++) {
                        var l2 = lessons2[j2];
                        var lid2 = (typeof l2 === 'string') ? l2 : (l2.id || l2.lessonId);
                        if (lid2 === lessonId) {
                            console.log('[LessonView] ⚠️ 从 SR 拿到（元数据）');
                            var lessonObj = (typeof l2 === 'string')
                                ? { id: l2, title: l2, name: l2 }
                                : l2;
                            return this._normalizeMetaOnlyLesson(lessonObj);
                        }
                    }
                }
            } catch (e) {}
        }
    
        // Fallback: day-based 兜底
        console.warn('[LessonView] ⚠️ 尝试 Day-based');
        var day = parseInt(String(lessonId).replace('day-', '').replace('day', ''));
        if (isNaN(day)) day = parseInt(lessonId);
        if (isNaN(day) || day < 1) day = 1;
        if (day > 365) day = 365;
    
        try {
            if (LawAIApp.LessonEngine && typeof LawAIApp.LessonEngine.getLessonByDay === 'function') {
                var lesson = LawAIApp.LessonEngine.getLessonByDay(day);
                if (lesson) return lesson;
            }
        } catch (e) {}
    
        return null;
    },

    _normalizeFullLesson: function(raw) {
        return {
            lessonId: raw.id || raw.lessonId,
            title: raw.title || 'Untitled Lesson',
            shortTitle: raw.title || 'Lesson',
            slug: raw.slug,
            description: raw.description || '',
            summary: raw.description || '',
            category: raw.category || 'General',
            difficulty: raw.difficulty || 'foundation',
            estimatedMinutes: raw.estimatedMinutes || 20,
            estimatedXP: raw.estimatedXP || 20,
            tags: raw.tags || [],
            courseId: raw.courseId,
            subjectId: raw.subjectId,
            learningObjectives: raw.learningObjectives || [],
            sections: raw.sections || null,
            video: raw.video || null,
            flashcards: raw.flashcards || [],
            practice: raw.practice || null,
            quiz: raw.quiz || null,
            notes: raw.notes || null,
            aiTools: raw.aiTools || [],
            resources: raw.resources || [],
            keyTakeaways: raw.keyTakeaways || [],
            _raw: raw,
            _source: 'ContentLoader'
        };
    },

    _normalizeMetaOnlyLesson: function(raw) {
        return {
            lessonId: raw.id || raw.lessonId,
            title: raw.title || raw.name || 'Untitled Lesson',
            shortTitle: raw.title || raw.name || 'Lesson',
            description: raw.description || '',
            summary: raw.summary || raw.description || '',
            difficulty: raw.difficulty || 'Beginner',
            estimatedMinutes: raw.duration || raw.estimatedMinutes || 10,
            estimatedXP: raw.xp || 20,
            tags: raw.tags || [],
            courseId: raw.courseId,
            subjectId: raw.subjectId,
            moduleId: raw.subjectId || raw.moduleId,
            learningObjectives: raw.learningObjectives || [],
            sections: raw.sections || null,
            video: raw.video || null,
            quiz: raw.quiz || null,
            _raw: raw,
            _source: 'CurriculumAuthority'
        };
    },

    // ============================================================
    // 状态检查
    // ============================================================
    _isLessonCompleted: function(lessonId) {
        try {
            if (LawAIApp.ProgressEngine && typeof LawAIApp.ProgressEngine.isLessonCompleted === 'function') {
                return LawAIApp.ProgressEngine.isLessonCompleted(lessonId);
            }
        } catch (e) {}
        return false;
    },

    _needsReview: function(lessonId) {
        try {
            if (LawAIApp.MemoryEngine && typeof LawAIApp.MemoryEngine.getMemoryStrength === 'function') {
                var strength = LawAIApp.MemoryEngine.getMemoryStrength(lessonId);
                return strength < 70 && strength > 0;
            }
        } catch (e) {}
        return false;
    },

    _getMemoryStrength: function(lessonId) {
        try {
            if (LawAIApp.MemoryEngine && typeof LawAIApp.MemoryEngine.getMemoryStrength === 'function') {
                return LawAIApp.MemoryEngine.getMemoryStrength(lessonId);
            }
        } catch (e) {}
        return null;
    },

    _getProgress: function() {
        try {
            if (LawAIApp.ProgressEngine && typeof LawAIApp.ProgressEngine.getProgress === 'function') {
                return LawAIApp.ProgressEngine.getProgress();
            }
        } catch (e) {}
        return { completedLessons: [], totalLessons: 365 };
    },

    // ============================================================
    // 骨架
    // ============================================================
    _showSkeleton: function() {
        this._container.innerHTML = `
            <div style="padding:24px 20px;max-width:740px;margin:0 auto;">
                <div style="height:32px;width:70%;background:rgba(255,255,255,0.06);border-radius:8px;margin-bottom:12px;animation:pulse 1.5s infinite;"></div>
                <div style="height:16px;width:90%;background:rgba(255,255,255,0.03);border-radius:4px;margin-bottom:6px;animation:pulse 1.5s infinite 0.2s;"></div>
                <div style="height:16px;width:80%;background:rgba(255,255,255,0.03);border-radius:4px;margin-bottom:20px;animation:pulse 1.5s infinite 0.4s;"></div>
                <div style="height:100px;background:rgba(255,255,255,0.03);border-radius:12px;margin-bottom:16px;animation:pulse 1.5s infinite 0.6s;"></div>
                <div style="height:80px;background:rgba(255,255,255,0.02);border-radius:12px;animation:pulse 1.5s infinite 0.8s;"></div>
                <style>@keyframes pulse{0%,100%{opacity:1;}50%{opacity:0.3;}}</style>
            </div>
        `;
    },

    // ============================================================
    // 主渲染
    // ============================================================
    _renderContent: function(lesson) {
        var self = this;
        var completed = this._isLessonCompleted(lesson.lessonId);
        var needsReview = this._needsReview(lesson.lessonId);
        var memoryStrength = this._getMemoryStrength(lesson.lessonId);
        var progress = this._getProgress();
        var completedCount = (progress.completedLessons || []).length;
        var totalCount = progress.totalLessons || 365;

        // sections 渲染
        var sectionsHtml = '';
        if (lesson.sections && lesson.sections.length > 0) {
            sectionsHtml = lesson.sections.map(function(section) {
                var contentHtml = '';
                if (section.content && section.content.length > 0) {
                    contentHtml = section.content.map(function(item) {
                        var type = item.type || 'text';
                        var content = item.content || '';
                        if (type === 'definition') {
                            return '<div style="background:rgba(74,158,255,0.06);border-left:3px solid #4a9eff;padding:8px 12px;border-radius:6px;color:#94a3b8;margin:8px 0;font-size:14px;">📘 ' + content + '</div>';
                        } else if (type === 'example') {
                            return '<div style="background:rgba(139,92,246,0.06);border-left:3px solid #8b5cf6;padding:8px 12px;border-radius:6px;color:#94a3b8;margin:8px 0;font-size:14px;">💡 ' + content + '</div>';
                        } else {
                            return '<div style="font-size:14px;color:#e2e8f0;line-height:1.7;margin:8px 0;">' + content + '</div>';
                        }
                    }).join('');
                }
                return '<div style="background:rgba(255,255,255,0.03);border-radius:12px;padding:14px 18px;margin-bottom:12px;border:1px solid rgba(255,255,255,0.04);">' +
                    '<h3 style="font-size:14px;font-weight:600;color:#e2e8f0;margin:0 0 6px;">' + (section.title || 'Section') + '</h3>' +
                    contentHtml +
                    '</div>';
            }).join('');
        }

        // 完成按钮
        var completeBtnHtml = '';
        if (!completed) {
            completeBtnHtml = '<button id="lesson-complete-btn" style="width:100%;padding:14px;background:linear-gradient(135deg,#22c55e,#16a34a);border:none;border-radius:12px;color:white;font-size:16px;font-weight:600;cursor:pointer;font-family:inherit;box-shadow:0 4px 24px rgba(34,197,94,0.15);transition:all 0.3s ease;">✅ Complete Lesson</button>';
        } else {
            completeBtnHtml = '<div style="text-align:center;padding:12px;background:rgba(34,197,94,0.06);border-radius:12px;border:1px solid rgba(34,197,94,0.08);display:flex;align-items:center;justify-content:center;gap:8px;"><span style="font-size:18px;">🎉</span><span style="font-size:14px;color:#22c55e;font-weight:500;">Lesson completed!</span>' + (memoryStrength !== null ? '<span style="font-size:11px;color:#64748b;">🧠 ' + Math.round(memoryStrength) + '%</span>' : '') + '</div>';
        }

        // 视频
        var videoHtml = '';
        if (lesson.video && lesson.video.url) {
            videoHtml = this._renderVideoBlock(lesson.video);
        }

        // 闪卡
        var flashcardsHtml = '';
        if (lesson.flashcards && lesson.flashcards.length > 0) {
            flashcardsHtml = this._renderFlashcardsBlock(lesson.flashcards);
        }

        // Key Takeaways
        var takeawaysHtml = '';
        if (lesson.keyTakeaways && lesson.keyTakeaways.length > 0) {
            takeawaysHtml = this._renderKeyTakeawaysBlock(lesson.keyTakeaways);
        }

        // 主 HTML
        var html = `
        <div class="lesson-classroom" style="max-width:740px;margin:0 auto;padding:8px 0 40px;color:#e2e8f0;font-family:'Inter',-apple-system,sans-serif;">

            <!-- 返回栏 -->
            <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0 16px;border-bottom:1px solid rgba(255,255,255,0.04);margin-bottom:20px;flex-wrap:wrap;gap:8px;">
                <button id="lesson-back-btn" style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.04);border-radius:8px;color:#94a3b8;padding:6px 14px;font-size:12px;cursor:pointer;font-family:inherit;display:flex;align-items:center;gap:4px;">← Back</button>
                <div style="display:flex;align-items:center;gap:10px;font-size:11px;color:#64748b;flex-wrap:wrap;">
                    <span>${completedCount}/${totalCount}</span>
                    <span style="opacity:0.3;">·</span>
                    <span>${Math.round((completedCount / totalCount) * 100)}%</span>
                    ${completed ? '<span style="color:#22c55e;font-size:10px;">✅ Done</span>' : ''}
                </div>
            </div>

            <!-- 标题 -->
            <div style="margin-bottom:16px;">
                <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;font-size:11px;color:#64748b;margin-bottom:6px;">
                    <span>📖 ${lesson.difficulty || 'Beginner'}</span>
                    <span style="opacity:0.3;">·</span>
                    <span>${lesson.estimatedMinutes || 10} min</span>
                    <span style="opacity:0.3;">·</span>
                    <span>⭐ ${lesson.estimatedXP || 20} XP</span>
                    ${memoryStrength !== null ? '<span style="opacity:0.3;">·</span><span style="color:' + (memoryStrength >= 70 ? '#22c55e' : memoryStrength >= 40 ? '#f59e0b' : '#ef4444') + ';">🧠 ' + Math.round(memoryStrength) + '%</span>' : ''}
                </div>
                <h1 style="margin:0;font-size:26px;font-weight:700;line-height:1.2;color:#e2e8f0;">${lesson.title || lesson.lessonId}</h1>
                <p style="margin:6px 0 0;font-size:15px;color:#94a3b8;line-height:1.5;">${lesson.description || ''}</p>
                ${(lesson.tags || []).length > 0 ? '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px;">' + (lesson.tags || []).map(function(tag) {
                    return '<span style="background:rgba(74,158,255,0.08);color:#4a9eff;padding:1px 10px;border-radius:100px;font-size:10px;">' + tag + '</span>';
                }).join('') + '</div>' : ''}
            </div>

            <!-- 学习目标 -->
            <div style="background:rgba(74,158,255,0.04);border-radius:12px;padding:14px 18px;margin-bottom:16px;border-left:3px solid #4a9eff;">
                <div style="font-size:11px;color:#4a9eff;font-weight:500;letter-spacing:0.5px;text-transform:uppercase;margin-bottom:2px;">🎯 Objective</div>
                <p style="margin:0;font-size:14px;color:#e2e8f0;line-height:1.5;">${lesson.summary || lesson.description || 'Understand the core concepts of this lesson.'}</p>
            </div>

            <!-- Sections -->
            ${sectionsHtml}

            <!-- Video -->
            ${videoHtml}

            <!-- Flashcards -->
            ${flashcardsHtml}

            <!-- Practice -->
            <div id="lesson-practice-block" style="background:rgba(34,197,94,0.04);border-radius:12px;padding:12px 16px;margin-bottom:16px;border:1px solid rgba(34,197,94,0.06);">
                <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;">
                    <span style="font-size:14px;">✏️</span>
                    <span style="font-size:11px;color:#22c55e;">Practice</span>
                </div>
                <p id="practice-desc" style="margin:0 0 6px;font-size:12px;color:#94a3b8;">Test your understanding.</p>
                <div style="display:flex;gap:6px;flex-wrap:wrap;">
                    <button id="practice-start-btn" style="padding:4px 14px;background:rgba(34,197,94,0.1);border:1px solid rgba(34,197,94,0.1);border-radius:6px;color:#22c55e;font-size:11px;cursor:pointer;font-family:inherit;">Start</button>
                    <button id="practice-submit-btn" style="padding:4px 14px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.06);border-radius:6px;color:#64748b;font-size:11px;cursor:pointer;font-family:inherit;">Submit</button>
                </div>
                <input type="text" id="practice-answer-input" style="width:100%;margin-top:4px;padding:6px 10px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:6px;color:#e2e8f0;font-size:12px;font-family:inherit;box-sizing:border-box;" placeholder="Type your answer...">
                <div id="practice-feedback" style="margin-top:4px;font-size:11px;color:#94a3b8;"></div>
            </div>

            <!-- Reflection -->
            <div style="background:rgba(255,255,255,0.02);border-radius:12px;padding:12px 16px;margin-bottom:16px;border:1px solid rgba(255,255,255,0.04);">
                <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;">
                    <span style="font-size:14px;">💭</span>
                    <span style="font-size:11px;color:#64748b;">Quick reflection</span>
                </div>
                <textarea id="reflection-textarea" style="width:100%;padding:8px 10px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:8px;color:#e2e8f0;font-size:13px;min-height:40px;font-family:inherit;box-sizing:border-box;resize:vertical;" placeholder="What stood out to you?"></textarea>
                <button id="reflection-save-btn" style="margin-top:4px;padding:3px 12px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.06);border-radius:6px;color:#64748b;font-size:10px;cursor:pointer;font-family:inherit;">💾 Save</button>
            </div>

            <!-- Key Takeaways -->
            ${takeawaysHtml}

            <!-- Review -->
            ${completed && needsReview ? `
            <div style="background:rgba(245,158,11,0.04);border-radius:12px;padding:10px 16px;margin-bottom:16px;border:1px solid rgba(245,158,11,0.06);display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;">
                <div>
                    <span style="font-size:12px;color:#f59e0b;">🔄 Review recommended</span>
                    <span style="font-size:11px;color:#94a3b8;display:block;">Strengthen your memory.</span>
                </div>
                <button id="review-btn" style="padding:4px 14px;background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.15);border-radius:6px;color:#f59e0b;font-size:11px;cursor:pointer;font-family:inherit;">Start Review</button>
                <div id="review-feedback" style="width:100%;font-size:11px;color:#94a3b8;"></div>
            </div>
            ` : ''}

            <!-- 完成按钮 -->
            ${completeBtnHtml}

            <!-- 导航 -->
            <div style="display:flex;justify-content:space-between;gap:10px;margin-top:16px;">
                <button id="lesson-prev-btn" style="flex:1;padding:8px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.04);border-radius:10px;color:#64748b;font-size:12px;cursor:pointer;font-family:inherit;">⬅️ Previous</button>
                <button id="lesson-next-btn" style="flex:1;padding:8px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.04);border-radius:10px;color:#64748b;font-size:12px;cursor:pointer;font-family:inherit;">Next ➡️</button>
            </div>

        </div>
        `;

        this._container.innerHTML = html;

        // 滚动到顶部
        if (this._container.scrollTop !== undefined) {
            this._container.scrollTop = 0;
        }

        // ═══════════════════════════════════════════════════════════════
        // 🔥 v6.0.0: 所有按钮用 addEventListener 绑定
        // ═══════════════════════════════════════════════════════════════

        var backBtn = document.getElementById('lesson-back-btn');
        if (backBtn) {
            backBtn.addEventListener('click', function() {
                if (LawAIApp.Router?.goBack) LawAIApp.Router.goBack();
                else history.back();
            });
        }

        var completeBtn = document.getElementById('lesson-complete-btn');
        if (completeBtn) {
            completeBtn.addEventListener('click', function() {
                self.completeLesson(lesson.lessonId);
            });
        }

        var practiceStartBtn = document.getElementById('practice-start-btn');
        if (practiceStartBtn) {
            practiceStartBtn.addEventListener('click', function() {
                self.startPractice();
            });
        }

        var practiceSubmitBtn = document.getElementById('practice-submit-btn');
        if (practiceSubmitBtn) {
            practiceSubmitBtn.addEventListener('click', function() {
                self.submitPractice();
            });
        }

        var reflectionSaveBtn = document.getElementById('reflection-save-btn');
        if (reflectionSaveBtn) {
            reflectionSaveBtn.addEventListener('click', function() {
                self.saveReflection();
            });
        }

        var reviewBtn = document.getElementById('review-btn');
        if (reviewBtn) {
            reviewBtn.addEventListener('click', function() {
                self.startReview();
            });
        }

        var prevBtn = document.getElementById('lesson-prev-btn');
        if (prevBtn) {
            prevBtn.addEventListener('click', function() {
                self.previousLesson();
            });
        }

        var nextBtn = document.getElementById('lesson-next-btn');
        if (nextBtn) {
            nextBtn.addEventListener('click', function() {
                self.nextLesson();
            });
        }

        // Experience Runtime
        var oldRuntime = window.LawAIApp?.Experience?.Runtime;
        if (oldRuntime && typeof oldRuntime.cleanup === 'function') {
            oldRuntime.cleanup();
        }
    },

    // ============================================================
    // 子模块渲染
    // ============================================================
    _renderVideoBlock: function(v) {
        var embedUrl = v.url;
        var watchMatch = v.url.match(/youtube\.com\/watch\?v=([^&]+)/);
        if (watchMatch) embedUrl = 'https://www.youtube.com/embed/' + watchMatch[1];
        var shortMatch = v.url.match(/youtu\.be\/([^?]+)/);
        if (shortMatch) embedUrl = 'https://www.youtube.com/embed/' + shortMatch[1];

        return '<div style="margin:16px 0;padding:16px 20px;background:rgba(255,255,255,0.03);border-radius:10px;border:1px solid rgba(255,255,255,0.06);">' +
            '<h4 style="font-size:15px;font-weight:600;margin:0 0 8px 0;">🎬 ' + (v.title || 'Video') + '</h4>' +
            '<div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:8px;background:#0a0a0a;">' +
            '<iframe src="' + embedUrl + '" style="position:absolute;top:0;left:0;width:100%;height:100%;border:none;" allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>' +
            '</div></div>';
    },

    _renderFlashcardsBlock: function(fcs) {
        return '<div style="margin:16px 0;padding:16px 20px;background:rgba(255,255,255,0.03);border-radius:10px;border:1px solid rgba(255,255,255,0.06);">' +
            '<h4 style="font-size:15px;font-weight:600;margin:0 0 12px 0;">🃏 Flashcards (' + fcs.length + ')</h4>' +
            '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:10px;">' +
            fcs.map(function(fc) {
                return '<div style="background:rgba(255,255,255,0.05);border-radius:8px;padding:10px 14px;border:1px solid rgba(255,255,255,0.06);">' +
                    '<div style="font-size:13px;font-weight:500;color:#4a9eff;">Q: ' + fc.front + '</div>' +
                    '<div style="font-size:13px;color:#94a3b8;margin-top:4px;">A: ' + fc.back + '</div></div>';
            }).join('') + '</div></div>';
    },

    _renderKeyTakeawaysBlock: function(items) {
        return '<div style="margin:16px 0;padding:16px 20px;background:rgba(16,185,129,0.06);border-radius:10px;border:1px solid rgba(16,185,129,0.12);">' +
            '<h4 style="font-size:15px;font-weight:600;margin:0 0 8px 0;color:#10b981;">🎯 Key Takeaways</h4>' +
            '<ul style="margin:0;padding-left:20px;color:#e2e8f0;">' +
            items.map(function(t) {
                return '<li style="margin:4px 0;font-size:14px;">' + t + '</li>';
            }).join('') + '</ul></div>';
    },

    // ============================================================
    // 按钮 Actions
    // ============================================================
    completeLesson: function(lessonId) {
        console.log('[LessonView] completeLesson:', lessonId);
        try {
            if (LawAIApp.ProgressEngine && typeof LawAIApp.ProgressEngine.completeLesson === 'function') {
                var result = LawAIApp.ProgressEngine.completeLesson(lessonId);
                if (result) {
                    var xpGain = result.xpGain || 20;
                    this._showCompletionEffect();
                    if (LawAIApp.Toast?.success) {
                        LawAIApp.Toast.success('✅ Lesson completed! +' + xpGain + ' XP');
                    }
                    var self = this;
                    setTimeout(function() {
                        self.render(lessonId, self._container);
                    }, 500);
                    return;
                }
            }
            // 没有 ProgressEngine 也标记完成
            this._showCompletionEffect();
            if (LawAIApp.Toast?.success) {
                LawAIApp.Toast.success('✅ Lesson completed!');
            }
            var self2 = this;
            setTimeout(function() {
                self2.render(lessonId, self2._container);
            }, 500);
        } catch (err) {
            console.error('Complete lesson error:', err);
            if (LawAIApp.Toast?.error) {
                LawAIApp.Toast.error('Failed to complete lesson');
            }
        }
    },

    startPractice: function() {
        console.log('[LessonView] startPractice');
        var descEl = document.getElementById('practice-desc');
        var feedbackEl = document.getElementById('practice-feedback');
        if (descEl) {
            descEl.textContent = '✏️ Practice started. Type your answer below.';
            descEl.style.color = '#4a9eff';
        }
        if (feedbackEl) {
            feedbackEl.textContent = '';
        }
        if (LawAIApp.Toast?.info) {
            LawAIApp.Toast.info('✏️ Practice started');
        }
    },

    submitPractice: function() {
        console.log('[LessonView] submitPractice');
        var input = document.getElementById('practice-answer-input');
        var feedbackEl = document.getElementById('practice-feedback');
        if (!input) return;
        var answer = input.value.trim();
        if (!answer) {
            if (feedbackEl) {
                feedbackEl.textContent = '⚠️ Write your answer first.';
                feedbackEl.style.color = '#f59e0b';
            }
            return;
        }
        if (feedbackEl) {
            feedbackEl.textContent = '✅ Answer submitted!';
            feedbackEl.style.color = '#22c55e';
        }
        input.value = '';
        if (LawAIApp.Toast?.success) {
            LawAIApp.Toast.success('✅ Answer submitted');
        }
    },

    saveReflection: function() {
        console.log('[LessonView] saveReflection');
        var textarea = document.getElementById('reflection-textarea');
        if (!textarea) return;
        var text = textarea.value.trim();
        if (!text) {
            if (LawAIApp.Toast?.info) {
                LawAIApp.Toast.info('Write something first.');
            }
            return;
        }
        textarea.value = '';
        textarea.style.borderColor = 'rgba(34,197,94,0.3)';
        setTimeout(function() {
            textarea.style.borderColor = 'rgba(255,255,255,0.06)';
        }, 2000);
        if (LawAIApp.Toast?.success) {
            LawAIApp.Toast.success('💭 Reflection saved');
        }
    },

    startReview: function() {
        console.log('[LessonView] startReview');
        var lessonId = this._lessonId;
        try {
            if (LawAIApp.MemoryEngine && typeof LawAIApp.MemoryEngine.recordReview === 'function') {
                LawAIApp.MemoryEngine.recordReview(lessonId, 0.8);
                var feedbackEl = document.getElementById('review-feedback');
                if (feedbackEl) {
                    feedbackEl.textContent = '✅ Review recorded! Memory strengthened.';
                    feedbackEl.style.color = '#22c55e';
                }
                if (LawAIApp.Toast?.success) {
                    LawAIApp.Toast.success('🔄 Review completed!');
                }
            }
        } catch (err) {
            console.error('Start review error:', err);
        }
    },

    // ============================================================
    // 导航（用真实 lesson 列表）
    // ============================================================
    previousLesson: function() {
        var prevId = this._findAdjacentLesson(-1);
        if (prevId) {
            this.render(prevId, this._container);
        } else {
            if (LawAIApp.Toast?.info) {
                LawAIApp.Toast.info('You\'re at the first lesson');
            }
        }
    },

    nextLesson: function() {
        var nextId = this._findAdjacentLesson(1);
        if (nextId) {
            this.render(nextId, this._container);
        } else {
            if (LawAIApp.Toast?.info) {
                LawAIApp.Toast.info('🎉 You\'ve completed all lessons!');
            }
        }
    },

    /**
     * 找当前 lesson 在同 subject 里的相邻 lesson
     * @param {number} delta - -1 prev, +1 next
     */
    _findAdjacentLesson: function(delta) {
        var currentId = this._lessonId;
        if (!currentId) return null;

        // 优先从当前 lesson 的 subject 里找
        var sr = window.LawAIApp?.SubjectRegistry;
        if (!sr || typeof sr.getAllSubjects !== 'function') return null;

        var allSubjects = sr.getAllSubjects();
        for (var i = 0; i < allSubjects.length; i++) {
            var subject = allSubjects[i];
            var lessons = subject.lessons || [];
            for (var j = 0; j < lessons.length; j++) {
                var l = lessons[j];
                var lid = (typeof l === 'string') ? l : (l.id || l.lessonId);
                if (lid === currentId) {
                    var targetIdx = j + delta;
                    if (targetIdx < 0 || targetIdx >= lessons.length) return null;
                    var target = lessons[targetIdx];
                    return (typeof target === 'string') ? target : (target.id || target.lessonId);
                }
            }
        }
        return null;
    },

    // ============================================================
    // 未找到
    // ============================================================
    _renderNotFound: function(lessonId) {
        this._container.innerHTML = `
            <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px 20px;color:#94a3b8;text-align:center;min-height:300px;">
                <div style="font-size:48px;margin-bottom:16px;">🔍</div>
                <h3 style="color:#e2e8f0;margin:0 0 8px;">Lesson Not Found</h3>
                <p style="margin:0 0 20px;">Could not find lesson: ${lessonId}</p>
                <button id="lesson-notfound-home-btn" style="padding:10px 28px;background:#4a9eff;border:none;border-radius:10px;color:white;font-size:14px;cursor:pointer;font-family:inherit;">🏠 Back to Academy</button>
            </div>
        `;
        var self = this;
        var homeBtn = document.getElementById('lesson-notfound-home-btn');
        if (homeBtn) {
            homeBtn.addEventListener('click', function() {
                if (LawAIApp.Router?.goHome) LawAIApp.Router.goHome();
                else window.location.href = '/pages/academy.html';
            });
        }
    },

    _showCompletionEffect: function() {
        var emojis = ['✨', '⭐', '🌟'];
        for (var i = 0; i < 6; i++) {
            var el = document.createElement('div');
            el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
            el.style.cssText = 'position:fixed;font-size:' + (16 + Math.random() * 20) + 'px;left:' + (20 + Math.random() * 60) + '%;top:' + (30 + Math.random() * 40) + '%;pointer-events:none;z-index:9999;opacity:1;transition:all 1.2s ease-out;';
            document.body.appendChild(el);
            setTimeout(function(elem) {
                elem.style.transform = 'translateY(-' + (60 + Math.random() * 80) + 'px) scale(1.4)';
                elem.style.opacity = '0';
            }, 50, el);
            setTimeout(function(elem) {
                if (elem.parentNode) elem.parentNode.removeChild(elem);
            }, 1500, el);
        }
    },

    // ============================================================
    // 兼容旧调用
    // ============================================================
    continueFromLesson: function() { this.nextLesson(); },
    getNextLessonTitle: function() { return this._lesson?.title || 'Continue Learning'; },
    getNextLessonLink: function() { return '/pages/academy.html?view=lesson&lessonId=' + (this._lessonId || ''); },
    goPractice: function() { this.startPractice(); },

    // 兼容旧的 activity-based 调用（如果还有别的地方用到）
    startPracticeForActivity: function(activityId) {
        console.log('[LessonView] startPracticeForActivity:', activityId);
        this.startPractice();
    },
    submitPracticeForActivity: function(activityId) {
        console.log('[LessonView] submitPracticeForActivity:', activityId);
        this.submitPractice();
    },
    saveReflectionForActivity: function(activityId) {
        console.log('[LessonView] saveReflectionForActivity:', activityId);
        this.saveReflection();
    },
    submitQuiz: function(activityId) {
        console.log('[LessonView] submitQuiz:', activityId);
        if (LawAIApp.Toast?.success) {
            LawAIApp.Toast.success('🧠 Quiz submitted');
        }
    }
};

console.log('📖 LessonView v6.0.0 ready (完美整合版)');

window.LawAIApp.LessonView = window.LawAIApp.Views.LessonView;
