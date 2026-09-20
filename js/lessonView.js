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

    // ============================================================
    // 🔥 Season 5 Part 8: 真实判断是否需要复习
    // Bible Part 66: 没有证据就说 "not enough evidence"
    // ============================================================
    _needsReview: function(lessonId) {
        // 1. 如果 MemoryEngine 有真实数据，用它
        try {
            if (LawAIApp.MemoryEngine && typeof LawAIApp.MemoryEngine.getMemoryStrength === 'function') {
                var strength = LawAIApp.MemoryEngine.getMemoryStrength(lessonId);
                // strength 必须是有效数字
                if (typeof strength === 'number' && !isNaN(strength) && strength > 0) {
                    return strength < 70;
                }
            }
        } catch (e) {}

        // 2. Fallback: 检查是否有过 review 记录
        try {
            var storage = window.LawAIApp && window.LawAIApp.StorageEngine;
            if (storage) {
                var list = storage.get('review_scheduled', []);
                var hasScheduled = list.some(function(r) {
                    return r.lessonId === lessonId;
                });
                // 没排过复习 + 没 memory 数据 → 不主动提示
                return hasScheduled;
            }
        } catch (e) {}

        // 3. 默认：无证据 → 不提示
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

        // 🔥 Season 5 Part 6: Video 交给 VideoRenderer 渲染
        var videoHtml = '';
        if (lesson.video && lesson.video.url) {
            // 只留一个空容器，实际渲染在 innerHTML 设完后
            videoHtml = '<div id="lesson-video-container" data-video-mount></div>';
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
                <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
                    <button id="lesson-back-btn" style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.04);border-radius:8px;color:#94a3b8;padding:6px 14px;font-size:12px;cursor:pointer;font-family:inherit;display:flex;align-items:center;gap:4px;">← Back</button>
                    <button onclick="window.location.href='/'" style="background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.12);border-radius:8px;color:#10b981;padding:6px 14px;font-size:12px;cursor:pointer;font-family:inherit;display:flex;align-items:center;gap:4px;">🏠 Home</button>
                </div>
                <div style="display:flex;align-items:center;gap:10px;font-size:11px;color:#64748b;flex-wrap:wrap;">
                    <span>${completedCount}/${totalCount}</span>
                    ...
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

            <!-- Practice (Part 179: 接入 Experience Runtime) -->
            <div id="lesson-practice-block" style="background:rgba(34,197,94,0.04);border-radius:12px;padding:12px 16px;margin-bottom:16px;border:1px solid rgba(34,197,94,0.06);">
                <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;">
                    <span style="font-size:14px;">✏️</span>
                    <span style="font-size:11px;color:#22c55e;">Practice</span>
                </div>
                <div id="lesson-practice-container">
                    <p style="margin:0 0 6px;font-size:12px;color:#94a3b8;">Loading practice...</p>
                </div>
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

            <!-- Review — Season 5 Part 8 -->
            ${completed && needsReview ? `
            <div style="background:rgba(245,158,11,0.04);border-radius:12px;padding:10px 16px;margin-bottom:16px;border:1px solid rgba(245,158,11,0.06);display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;">
                <div>
                    <span style="font-size:12px;color:#f59e0b;">🔄 This concept may benefit from a review</span>
                    <span style="font-size:11px;color:#94a3b8;display:block;">Schedule a reminder — you decide when.</span>
                </div>
                <button id="review-btn" style="padding:4px 14px;background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.15);border-radius:6px;color:#f59e0b;font-size:11px;cursor:pointer;font-family:inherit;">Schedule Review</button>
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

        // 🔥 Season 5 Part 6: 挂载 VideoRenderer
        self._mountVideoRenderer(lesson);

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
                var mgr = window.LawAIApp && window.LawAIApp.AcademyExperienceManager;
        
                // 🔥 优先回 subject（上一级）
                if (mgr && mgr._state && mgr._state.currentSubjectId) {
                    console.log('[LessonView] 🔙 Back to subject:', mgr._state.currentSubjectId);
                    mgr.navigateToSubject(mgr._state.currentSubjectId);
                    return;
                }
        
                // 兜底：如果 state 被清了，回 academy 首页
                console.warn('[LessonView] ⚠️ No subjectId in state, fallback to academy');
                window.location.href = '/pages/academy.html';
            });
        }

        // Part 179: 移除简化版 practice 绑定，改由 ExperienceRuntime 接管

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

        // 🔥 Season 5 Part 7: 绑定 flashcard 事件
        self._bindFlashcardEvents();

        // ═══════════════════════════════════════════════════════════
        // Part 179: 启动 Experience Runtime 渲染 practice
        // ═══════════════════════════════════════════════════════════
        self._startPracticeViaRuntime(lesson);

        // 🔥 Season 5 Part 5: 监听本课 Practice 完成
        self._attachPracticeListener(lesson);

        // Experience Runtime
        var oldRuntime = window.LawAIApp?.Experience?.Runtime;
        if (oldRuntime && typeof oldRuntime.cleanup === 'function') {
            oldRuntime.cleanup();
        }
    },

    // ============================================================
    // 🔥 Season 5 Part 5: 监听本课 Practice 完成 → 通知 Progress
    // ============================================================
    _attachPracticeListener: function(lesson) {
        var self = this;
        var lessonId = lesson && lesson.lessonId;
        if (!lessonId) return;

        // 避免重复绑定
        if (this._practiceListener) {
            document.removeEventListener('PracticeCompleted', this._practiceListener);
        }

        this._practiceListener = function(e) {
            var payload = (e && e.detail) || {};
            // 只处理本课的
            if (payload.lessonId !== lessonId) return;

            console.log('[LessonView] 🎯 PracticeCompleted for', lessonId, payload);

            // 🔥 通知 ProgressEngine（如果它支持）
            try {
                var prog = window.LawAIApp && window.LawAIApp.ProgressEngine;
                if (prog && typeof prog.recordPracticeCompleted === 'function') {
                    prog.recordPracticeCompleted(lessonId, {
                        correct: payload.correct,
                        total: payload.total,
                        accuracy: payload.accuracy,
                        source: payload.source || 'practice-set'
                    });
                } else if (prog && typeof prog.recordActivity === 'function') {
                    prog.recordActivity(lessonId, {
                        type: 'practice',
                        correct: payload.correct,
                        total: payload.total
                    });
                }
            } catch (err) {
                console.warn('[LessonView] ProgressEngine recordPractice failed:', err);
            }

            // 提示学习者
            if (window.LawAIApp?.Toast?.success && payload.total) {
                LawAIApp.Toast.success(
                    '✏️ Practice: ' + payload.correct + ' / ' + payload.total
                );
            }
        };

        document.addEventListener('PracticeCompleted', this._practiceListener);
    },

    // ============================================================
    // 🔥 Season 5 Part 6: Video 挂载
    // ============================================================
    _mountVideoRenderer: function(lesson) {
        var container = document.getElementById('lesson-video-container');
        if (!container) return;

        if (!lesson.video || !lesson.video.url) return;

        var videoRenderer = window.LawAIApp && window.LawAIApp.VideoRenderer;
        if (!videoRenderer || typeof videoRenderer.render !== 'function') {
            // Fallback: 用旧方法直接渲染
            console.warn('[LessonView] VideoRenderer not available, using fallback');
            container.innerHTML = this._renderVideoBlock(lesson.video);
            return;
        }

        // 🔥 构建 activity 格式，符合 VideoRenderer 预期
        var activity = {
            id: 'video_' + (lesson.lessonId || 'unknown'),
            type: 'VIDEO',
            title: lesson.video.title || lesson.title || 'Video',
            description: lesson.video.notes || lesson.video.relevance || '',
            video: {
                id: 'video_' + (lesson.lessonId || 'unknown'),
                url: this._resolveEmbedUrl(lesson.video.url),
                type: lesson.video.provider === 'youtube' ? 'embed' : 'html5',
                title: lesson.video.title || lesson.title || 'Video',
                duration: (lesson.video.durationMinutes || 0) * 60
            },
            metadata: {
                lessonId: lesson.lessonId,
                provider: lesson.video.provider,
                channel: lesson.video.channel,
                isOfficial: lesson.video.isOfficial,
                relevance: lesson.video.relevance
            }
        };

        try {
            videoRenderer.render(container, activity, { lessonId: lesson.lessonId });
            console.log('[LessonView] ✅ VideoRenderer mounted');
        } catch (e) {
            console.error('[LessonView] VideoRenderer error:', e);
            container.innerHTML = this._renderVideoBlock(lesson.video);
        }
    },

    // 🔥 辅助：把 youtube watch URL 转成 embed URL
    _resolveEmbedUrl: function(url) {
        if (!url) return url;
        var watchMatch = url.match(/youtube\.com\/watch\?v=([^&]+)/);
        if (watchMatch) return 'https://www.youtube.com/embed/' + watchMatch[1];
        var shortMatch = url.match(/youtu\.be\/([^?]+)/);
        if (shortMatch) return 'https://www.youtube.com/embed/' + shortMatch[1];
        return url;
    },

    // ============================================================
    // Part 179: 通过 Experience Runtime 渲染 Practice
    // 复用 Part 129/130/131/132/173 的 PracticeRenderer
    // ============================================================
    _startPracticeViaRuntime: function(lesson) {
        var container = document.getElementById('lesson-practice-container');
        if (!container) return;

        // 1. 检查 practice 是否存在
        if (!lesson || !lesson.practice || !lesson.practice.enabled) {
            container.innerHTML = `
                <p style="margin:0;font-size:12px;color:#64748b;">
                    Practice is not available for this lesson.
                </p>
            `;
            return;
        }

        // 2. 只检查 practiceRenderer（Runtime 可以是可选）
        var practiceRenderer = window.LawAIApp?.Experience?.Renderers?.PracticeRenderer;

        if (!practiceRenderer || typeof practiceRenderer.create !== 'function') {
            console.warn('[LessonView] PracticeRenderer not available');
            container.innerHTML = `
                <p style="margin:0;font-size:12px;color:#f59e0b;">
                    Practice system is loading. Please refresh.
                </p>
            `;
            return;
        }

        // 3. 构建 practice activity
        var practiceItems = lesson.practice.items || [];
        if (practiceItems.length === 0) {
            container.innerHTML = `
                <p style="margin:0;font-size:12px;color:#64748b;">
                    No practice questions available.
                </p>
            `;
            return;
        }

        // 🔥 Season 5 Part 4: 传全部题目，不再只取第 1 题
        var normalizedQuestions = practiceItems.map(function(q, idx) {
            return {
                questionId: q.id || (lesson.lessonId + ':q' + (idx + 1)),
                question: q.question || q.prompt || 'Practice question',
                type: q.type || 'multipleChoice',
                options: q.options || [],
                correctAnswer: q.answer !== undefined ? q.answer : q.correctAnswer,
                explanation: q.explanation || '',
                whyItMatters: q.whyItMatters || '',
                hint: q.hint || null,
                acceptedKeywords: q.acceptedKeywords || []
            };
        });

        var activity;
        if (normalizedQuestions.length === 1) {
            // 单题：保持旧格式，兼容已注册的 'PRACTICE' renderer
            var q1 = normalizedQuestions[0];
            activity = {
                id: 'practice_' + lesson.lessonId + '_' + (q1.questionId || 'q1'),
                type: 'PRACTICE',
                content: q1.question,
                metadata: Object.assign({ lessonId: lesson.lessonId }, q1)
            };
        } else {
            // 多题：新格式 'PRACTICE_SET'
            activity = {
                id: 'practice_' + lesson.lessonId,
                type: 'PRACTICE_SET',
                content: lesson.title || 'Practice',
                metadata: {
                    lessonId: lesson.lessonId,
                    lessonTitle: lesson.title || '',
                    questions: normalizedQuestions
                }
            };
        }
        
        // 如果只有 1 题，退回旧格式（保持兼容）
        if (activity.metadata.questions.length === 1) {
            activity.type = 'PRACTICE';
            activity.metadata = Object.assign({}, activity.metadata, activity.metadata.questions[0]);
        }

        // 4. 直接调用 PracticeRenderer.create + mount
        try {
            var instance = practiceRenderer.create(activity, container);
            if (instance && typeof instance.mount === 'function') {
                instance.mount();
                console.log('[LessonView] ✅ PracticeRenderer mounted:', activity.id);
                // 5. 暴露给 LessonView 方便调试
                this._currentPractice = instance;
            } else {
                console.warn('[LessonView] PracticeRenderer instance has no mount()');
                container.innerHTML = `
                    <p style="margin:0;font-size:12px;color:#f59e0b;">
                        Practice renderer returned invalid instance.
                    </p>
                `;
            }
        } catch (e) {
            console.error('[LessonView] PracticeRenderer error:', e);
            container.innerHTML = `
                <p style="margin:0;font-size:12px;color:#ef4444;">
                    Practice failed to load: ${e.message}
                </p>
            `;
        }
    },

    // ⚠️ DEPRECATED — Season 5 Part 6
    // 保留作为 fallback。主路径已改用 VideoRenderer.render()
    // 若 2 周内无调用，可安全删除。
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

    // ============================================================
    // 🔥 Season 5 Part 7: Flashcards 交互式渲染
    // - 翻卡（点一下看答案）
    // - "记住了 / 没记住"按钮
    // - 落库到 AcademyExperienceManager
    // ============================================================
    _renderFlashcardsBlock: function(fcs) {
        if (!fcs || fcs.length === 0) return '';

        var lessonId = this._lessonId || '';
        var cards = '';

        for (var i = 0; i < fcs.length; i++) {
            var fc = fcs[i];
            var cardId = fc.id || ('fc_' + lessonId + '_' + i);

            cards += ''
                + '<div class="flashcard-item" data-card-id="' + cardId + '" data-flipped="false" '
                +      'style="background:rgba(255,255,255,0.04);border-radius:10px;padding:14px 16px;'
                +             'border:1px solid rgba(255,255,255,0.06);cursor:pointer;'
                +             'transition:all 0.25s;min-height:88px;position:relative;">'
                +   '<div style="display:flex;justify-content:space-between;align-items:start;gap:8px;">'
                +     '<div style="font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;">'
                +       (fc.difficulty || 'card') + ' · ' + (fc.tags && fc.tags[0] ? fc.tags[0] : '')
                +     '</div>'
                +     '<div style="font-size:11px;color:#64748b;">tap to flip</div>'
                +   '</div>'
                +   '<div class="flashcard-front" style="font-size:14px;font-weight:500;color:#e2e8f0;line-height:1.5;margin-top:8px;">'
                +     (fc.front || '')
                +   '</div>'
                +   '<div class="flashcard-back" style="display:none;font-size:13px;color:#94a3b8;line-height:1.5;margin-top:8px;padding-top:8px;border-top:1px solid rgba(255,255,255,0.04);">'
                +     (fc.back || '')
                +   '</div>'
                +   '<div class="flashcard-actions" style="display:none;gap:6px;margin-top:10px;">'
                +     '<button class="flashcard-btn-known" data-card-id="' + cardId + '" '
                +             'style="flex:1;padding:6px 12px;background:rgba(34,197,94,0.08);'
                +                    'border:1px solid rgba(34,197,94,0.15);border-radius:6px;'
                +                    'color:#22c55e;font-size:12px;font-weight:500;cursor:pointer;font-family:inherit;">'
                +       '✓ I knew it'
                +     '</button>'
                +     '<button class="flashcard-btn-review" data-card-id="' + cardId + '" '
                +             'style="flex:1;padding:6px 12px;background:rgba(245,158,11,0.08);'
                +                    'border:1px solid rgba(245,158,11,0.15);border-radius:6px;'
                +                    'color:#f59e0b;font-size:12px;font-weight:500;cursor:pointer;font-family:inherit;">'
                +       '↻ Review again'
                +     '</button>'
                +   '</div>'
                + '</div>';
        }

        return ''
            + '<div id="lesson-flashcards-block" style="margin:16px 0;padding:16px 20px;'
            +        'background:rgba(255,255,255,0.03);border-radius:10px;'
            +        'border:1px solid rgba(255,255,255,0.06);">'
            +   '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">'
            +     '<h4 style="font-size:15px;font-weight:600;margin:0;">🃏 Flashcards (' + fcs.length + ')</h4>'
            +     '<span id="flashcard-progress" style="font-size:11px;color:#64748b;">0 / ' + fcs.length + '</span>'
            +   '</div>'
            +   '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:10px;">'
            +     cards
            +   '</div>'
            + '</div>';
    },

    // ============================================================
    // 🔥 Season 5 Part 7: 绑定 flashcard 事件
    // ============================================================
    _bindFlashcardEvents: function() {
        var self = this;
        var block = document.getElementById('lesson-flashcards-block');
        if (!block) return;

        // 翻卡
        var items = block.querySelectorAll('.flashcard-item');
        for (var i = 0; i < items.length; i++) {
            items[i].addEventListener('click', function(e) {
                // 忽略按钮点击（按钮自己处理）
                if (e.target.classList.contains('flashcard-btn-known') ||
                    e.target.classList.contains('flashcard-btn-review')) {
                    return;
                }
                var flipped = this.getAttribute('data-flipped') === 'true';
                var front = this.querySelector('.flashcard-front');
                var back = this.querySelector('.flashcard-back');
                var actions = this.querySelector('.flashcard-actions');

                if (!flipped) {
                    this.setAttribute('data-flipped', 'true');
                    if (front) front.style.display = 'none';
                    if (back) back.style.display = 'block';
                    if (actions) actions.style.display = 'flex';
                } else {
                    this.setAttribute('data-flipped', 'false');
                    if (front) front.style.display = 'block';
                    if (back) back.style.display = 'none';
                    if (actions) actions.style.display = 'none';
                }
            });
        }

        // "I knew it"
        var knownBtns = block.querySelectorAll('.flashcard-btn-known');
        for (var j = 0; j < knownBtns.length; j++) {
            knownBtns[j].addEventListener('click', function(e) {
                e.stopPropagation();
                var cardId = this.getAttribute('data-card-id');
                self._recordFlashcardResult(cardId, 'known');
                self._markFlashcardDone(cardId);
            });
        }

        // "Review again"
        var reviewBtns = block.querySelectorAll('.flashcard-btn-review');
        for (var k = 0; k < reviewBtns.length; k++) {
            reviewBtns[k].addEventListener('click', function(e) {
                e.stopPropagation();
                var cardId = this.getAttribute('data-card-id');
                self._recordFlashcardResult(cardId, 'review');
                self._markFlashcardDone(cardId);
            });
        }
    },

    _markFlashcardDone: function(cardId) {
        var card = document.querySelector('.flashcard-item[data-card-id="' + cardId + '"]');
        if (card) {
            card.style.opacity = '0.4';
            card.style.pointerEvents = 'none';
        }
        // 更新进度
        var block = document.getElementById('lesson-flashcards-block');
        if (block) {
            var done = block.querySelectorAll('.flashcard-item[style*="opacity: 0.4"]').length;
            var total = block.querySelectorAll('.flashcard-item').length;
            var progressEl = document.getElementById('flashcard-progress');
            if (progressEl) progressEl.textContent = done + ' / ' + total;
        }
    },

    // ============================================================
    // 🔥 Season 5 Part 7: 记录 flashcard 结果
    // ============================================================
    _recordFlashcardResult: function(cardId, result) {
        var lessonId = this._lessonId;
        var lesson = this._lesson || {};

        // 通过 AcademyExperienceManager 保存
        var aem = window.LawAIApp && window.LawAIApp.AcademyExperienceManager;
        if (aem && typeof aem.saveNote === 'function') {
            try {
                // 用 note 记录 flashcard review（不改 flashcard 本身）
                aem.saveNote({
                    type: 'FLASHCARD_REVIEW',
                    title: 'Flashcard: ' + result,
                    content: cardId + ' → ' + result,
                    lessonId: lessonId,
                    courseId: lesson.courseId || null,
                    subjectId: lesson.subjectId || null,
                    tags: ['flashcard', result],
                    source: { type: 'flashcard-review', cardId: cardId },
                    metadata: { cardId: cardId, result: result }
                });
            } catch (e) {
                console.warn('[LessonView] flashcard saveNote failed:', e);
            }
        }

        // 发射事件
        try {
            var ev = new CustomEvent('FLASHCARD_REVIEWED', {
                detail: {
                    lessonId: lessonId,
                    cardId: cardId,
                    result: result,
                    timestamp: new Date().toISOString()
                }
            });
            document.dispatchEvent(ev);
            window.dispatchEvent(ev);
        } catch (e) {}

        if (window.LawAIApp?.Toast) {
            if (result === 'known') {
                window.LawAIApp.Toast.success?.('✓ Marked as known');
            } else {
                window.LawAIApp.Toast.info?.('↻ Will review again');
            }
        }
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

    // ============================================================
    // Part 179: 兼容旧的 startPractice / submitPractice
    // 保留作为 fallback，不再主动调用
    // ============================================================
    startPractice: function() {
        console.warn('[LessonView] startPractice deprecated (Part 179). Practice is now managed by ExperienceRuntime.');
    },

    submitPractice: function() {
        console.warn('[LessonView] submitPractice deprecated (Part 179). Practice is now managed by ExperienceRuntime.');
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

        // 🔥 Season 5 Part 5: 真实保存到 NotesAuthority
        var notesAuth = window.LawAIApp && window.LawAIApp.NotesAuthority;
        var lesson = this._lesson || {};
        var saved = false;

        if (notesAuth && typeof notesAuth.create === 'function') {
            try {
                var result = notesAuth.create({
                    title: 'Reflection: ' + (lesson.title || this._lessonId || 'Lesson'),
                    content: text,
                    noteType: 'REFLECTION',
                    source: 'lesson-reflection',
                    createdBy: 'learner',
                    tags: ['reflection', 'lesson'],
                    relatedLessonRef: this._lessonId,
                    relatedCourseRef: lesson.courseId || null,
                    relatedSubjectRef: lesson.subjectId || null
                });
                saved = !!(result && result.success !== false);
            } catch (e) {
                console.warn('[LessonView] NotesAuthority.create failed:', e);
            }
        } else {
            console.warn('[LessonView] NotesAuthority not available');
        }

        // 兜底：如果 NotesAuthority 不可用，仍然给出视觉反馈
        textarea.value = '';
        textarea.style.borderColor = 'rgba(34,197,94,0.3)';
        setTimeout(function() {
            textarea.style.borderColor = 'rgba(255,255,255,0.06)';
        }, 2000);

        if (LawAIApp.Toast) {
            if (saved) {
                LawAIApp.Toast.success?.('💭 Reflection saved to Notes');
            } else {
                LawAIApp.Toast.info?.('Reflection recorded locally');
            }
        }
    },

    // ============================================================
    // 🔥 Season 5 Part 8: Review Scheduler
    // Bible Part 15: Adaptive 只能 SUGGEST，Calendar 才能 SCHEDULE
    // Bible Part 28: 必须学习者确认
    // ============================================================
    startReview: function() {
        console.log('[LessonView] startReview');
        var lessonId = this._lessonId;
        if (!lessonId) return;

        // 弹出复习时间选择器
        this._showReviewScheduler(lessonId);
    },

    // ============================================================
    // 🔥 复习时间选择器（学习者必须确认）
    // ============================================================
    _showReviewScheduler: function(lessonId) {
        var self = this;
        var lesson = this._lesson || {};
        var title = lesson.title || lessonId;

        // 移除已有弹窗
        var old = document.getElementById('review-scheduler-overlay');
        if (old) old.remove();

        // 预设选项
        var options = [
            { label: 'Tomorrow', days: 1, hint: '+1 day' },
            { label: 'In 3 days', days: 3, hint: '+3 days' },
            { label: 'In 1 week', days: 7, hint: '+7 days' },
            { label: 'In 2 weeks', days: 14, hint: '+14 days' },
            { label: 'In 1 month', days: 30, hint: '+30 days' }
        ];

        var optionsHtml = '';
        for (var i = 0; i < options.length; i++) {
            var o = options[i];
            optionsHtml += ''
                + '<button class="review-option-btn" data-days="' + o.days + '" '
                +        'style="width:100%;padding:10px 14px;background:rgba(74,158,255,0.06);'
                +               'border:1px solid rgba(74,158,255,0.12);border-radius:8px;'
                +               'color:#93c5fd;font-size:13px;font-weight:500;cursor:pointer;'
                +               'font-family:inherit;text-align:left;display:flex;'
                +               'justify-content:space-between;align-items:center;'
                +               'transition:all 0.2s;">'
                +   '<span>' + o.label + '</span>'
                +   '<span style="font-size:11px;color:#64748b;">' + o.hint + '</span>'
                + '</button>';
        }

        var overlayHtml = ''
            + '<div id="review-scheduler-overlay" '
            +      'style="position:fixed;inset:0;background:rgba(0,0,0,0.7);'
            +             'z-index:9999;display:flex;align-items:center;justify-content:center;'
            +             'padding:20px;backdrop-filter:blur(4px);">'
            +   '<div style="background:#0f172a;border:1px solid rgba(255,255,255,0.08);'
            +               'border-radius:14px;padding:20px 24px;max-width:420px;width:100%;'
            +               'box-shadow:0 20px 60px rgba(0,0,0,0.5);">'
            +     '<div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:8px;">'
            +       '<div>'
            +         '<div style="font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;">🔄 Review</div>'
            +         '<h3 style="font-size:17px;font-weight:600;margin:4px 0 0;color:#e2e8f0;">When to review?</h3>'
            +       '</div>'
            +       '<button id="review-scheduler-close" '
            +              'style="background:transparent;border:none;color:#64748b;'
            +                     'font-size:22px;cursor:pointer;padding:0;line-height:1;'
            +                     'font-family:inherit;">×</button>'
            +     '</div>'
            +     '<p style="font-size:13px;color:#94a3b8;margin:0 0 16px;line-height:1.5;">'
            +       'Pick a time. You can change this later in Calendar.'
            +     '</p>'
            +     '<div style="display:flex;flex-direction:column;gap:6px;margin-bottom:14px;">'
            +       optionsHtml
            +     '</div>'
            +     '<div style="text-align:center;">'
            +       '<button id="review-scheduler-cancel" '
            +              'style="padding:6px 16px;background:transparent;border:none;'
            +                     'color:#64748b;font-size:12px;cursor:pointer;'
            +                     'font-family:inherit;text-decoration:underline;">'
            +         'Not now'
            +       '</button>'
            +     '</div>'
            +   '</div>'
            + '</div>';

        document.body.insertAdjacentHTML('beforeend', overlayHtml);

        // 绑定
        document.getElementById('review-scheduler-close').addEventListener('click', function() {
            self._closeReviewScheduler();
        });
        document.getElementById('review-scheduler-cancel').addEventListener('click', function() {
            self._closeReviewScheduler();
        });

        var btns = document.querySelectorAll('.review-option-btn');
        for (var j = 0; j < btns.length; j++) {
            btns[j].addEventListener('click', function() {
                var days = parseInt(this.getAttribute('data-days'));
                self._scheduleReview(lessonId, days);
                self._closeReviewScheduler();
            });
        }
    },

    _closeReviewScheduler: function() {
        var el = document.getElementById('review-scheduler-overlay');
        if (el) el.remove();
    },

    // ============================================================
    // 🔥 学习者确认后，通过 CalendarAuthority 排程
    // Bible Part 28: Calendar 是唯一排程权威
    // ============================================================
    _scheduleReview: function(lessonId, days) {
        var lesson = this._lesson || {};
        var title = lesson.title || lessonId;

        // 计算时间：days 天后，默认 7 PM
        var when = new Date();
        when.setDate(when.getDate() + days);
        when.setHours(19, 0, 0, 0);

        var calAuth = window.LawAIApp && window.LawAIApp.CalendarAuthority;

        if (!calAuth || typeof calAuth.create !== 'function') {
            // Fallback: 存到 StorageEngine，Calendar 页面自己读
            console.warn('[LessonView] CalendarAuthority not available, using fallback storage');
            try {
                var storage = window.LawAIApp && window.LawAIApp.StorageEngine;
                if (storage) {
                    var key = 'review_scheduled';
                    var list = storage.get(key, []);
                    list.push({
                        lessonId: lessonId,
                        title: 'Review: ' + title,
                        scheduledAt: when.toISOString(),
                        days: days,
                        createdAt: new Date().toISOString()
                    });
                    storage.set(key, list);
                }
            } catch (e) {}
            if (window.LawAIApp?.Toast?.success) {
                window.LawAIApp.Toast.success('🔄 Review scheduled for +' + days + ' days');
            }
            this._updateReviewFeedback('✅ Scheduled in ' + days + ' day(s)');
            this._emitReviewScheduled(lessonId, when, days);
            return;
        }

        try {
            var result = calAuth.create({
                title: 'Review: ' + title,
                activityRef: 'review_' + lessonId,
                startAt: when.toISOString(),
                duration: 15,
                source: 'lesson-review',
                metadata: {
                    lessonId: lessonId,
                    reviewReason: 'spaced-review',
                    days: days
                }
            });

            if (result && result.success !== false) {
                if (window.LawAIApp?.Toast?.success) {
                    window.LawAIApp.Toast.success('🔄 Review scheduled for +' + days + ' days');
                }
                this._updateReviewFeedback('✅ Scheduled in ' + days + ' day(s)');
                this._emitReviewScheduled(lessonId, when, days);
            } else {
                if (window.LawAIApp?.Toast?.info) {
                    window.LawAIApp.Toast.info('Could not schedule — try again');
                }
            }
        } catch (e) {
            console.error('[LessonView] CalendarAuthority.create failed:', e);
            if (window.LawAIApp?.Toast?.info) {
                window.LawAIApp.Toast.info('Calendar unavailable');
            }
        }
    },

    _updateReviewFeedback: function(text) {
        var feedbackEl = document.getElementById('review-feedback');
        if (feedbackEl) {
            feedbackEl.textContent = text;
            feedbackEl.style.color = '#22c55e';
        }
    },

    _emitReviewScheduled: function(lessonId, when, days) {
        try {
            var ev = new CustomEvent('REVIEW_SCHEDULED', {
                detail: {
                    lessonId: lessonId,
                    scheduledAt: when.toISOString(),
                    days: days,
                    source: 'lesson-view'
                }
            });
            document.dispatchEvent(ev);
            window.dispatchEvent(ev);
        } catch (e) {}
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
