// /js/experience/renderers/videoRenderer.js
// Part 170 — Video Activity Renderer
// Part 173 — Enhanced with Active Learning Experience

window.LawAIApp = window.LawAIApp || {};

LawAIApp.VideoRenderer = {
    version: '1.1.0',
    _currentObserver: null,

    /**
     * 注册到 ActivityRegistry
     */
    register: function() {
        var registry = window.LawAIApp?.ActivityRegistry;
        if (!registry) {
            console.warn('[VideoRenderer] ActivityRegistry not available');
            return;
        }

        registry.register('video', {
            renderer: this.render.bind(this),
            unmount: this.unmount.bind(this)
        });

        console.log('[VideoRenderer] Registered to ActivityRegistry');
    },

    /**
     * 渲染 Video Activity
     */
    render: function(container, activity, context) {
        if (!container) return;

        var videoSource = this._resolveSource(activity, context);

        if (!videoSource || !videoSource.url) {
            container.innerHTML = this._renderUnavailable(activity);
            return;
        }

        var html = this._buildHTML(activity, videoSource, context);
        container.innerHTML = html;

        // 绑定 video element
        var videoEl = container.querySelector('video[data-role="activity-video"]');
        if (videoEl && window.LawAIApp?.VideoEvidenceContract) {
            this._currentObserver = window.LawAIApp.VideoEvidenceContract.observeVideoElement(videoEl, {
                activityId: activity.activityId || activity.id,
                videoId: videoSource.videoId,
                lessonId: context && context.lessonId
            });
        }
    },

    /**
     * 卸载
     */
    unmount: function() {
        if (this._currentObserver && this._currentObserver.cleanup) {
            this._currentObserver.cleanup();
        }
        this._currentObserver = null;
    },

    // ============================================================
    // Private
    // ============================================================

    _resolveSource: function(activity, context) {
        // 从 activity 或 context 解析视频源
        if (activity.video && activity.video.url) {
            return {
                videoId: activity.video.id || activity.activityId,
                url: activity.video.url,
                type: activity.video.type || 'embed',
                duration: activity.video.duration || null,
                title: activity.video.title || activity.title || 'Video'
            };
        }

        if (activity.source && activity.source.url) {
            return {
                videoId: activity.source.id || activity.activityId,
                url: activity.source.url,
                type: activity.source.type || 'embed',
                duration: activity.source.duration || null,
                title: activity.title || 'Video'
            };
        }

        return null;
    },

    _buildHTML: function(activity, source, context) {
        var title = source.title;
        var isEmbed = source.type === 'embed' || source.type === 'youtube' || source.type === 'vimeo';

        // 判断是否是 iframe 嵌入
        var playerHTML = '';
        if (isEmbed) {
            playerHTML = `
                <div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; border-radius: 12px; background: #000;">
                    <iframe src="${source.url}" 
                            style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none;" 
                            allowfullscreen
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture">
                    </iframe>
                </div>
            `;
        } else {
            // 原生 HTML5 video
            playerHTML = `
                <div style="position: relative; border-radius: 12px; overflow: hidden; background: #000;">
                    <video data-role="activity-video" 
                           controls
                           style="width: 100%; display: block;"
                           preload="metadata">
                        <source src="${source.url}" type="video/mp4">
                        Your browser does not support the video tag.
                    </video>
                </div>
            `;
        }

        // 🔥 Part 173: Active Learning (Optional)
        var activeLearningHTML = this._buildActiveLearning(source);

        return `
            <div style="padding: 0 16px 32px; color: #e2e8f0; font-family: 'Inter', -apple-system, sans-serif; max-width: 1200px; margin: 0 auto;">
                <!-- Video Header -->
                <div style="margin-bottom: 16px;">
                    <h2 style="font-size: 20px; font-weight: 600; margin: 0 0 4px 0;">🎬 ${title}</h2>
                    ${activity.description ? `<p style="color: #94a3b8; font-size: 14px; margin: 0;">${activity.description}</p>` : ''}
                </div>

                <!-- Player -->
                ${playerHTML}

                <!-- Metadata -->
                <div style="margin-top: 16px; display: flex; gap: 12px; flex-wrap: wrap;">
                    <span style="color: #64748b; font-size: 12px; background: rgba(255,255,255,0.04); padding: 4px 12px; border-radius: 100px;">📹 Video Activity</span>
                    ${source.duration ? `<span style="color: #64748b; font-size: 12px; background: rgba(255,255,255,0.04); padding: 4px 12px; border-radius: 100px;">⏱️ ${Math.floor(source.duration / 60)} min</span>` : ''}
                </div>

                <!-- Actions -->
                <div style="margin-top: 20px; display: flex; gap: 8px; flex-wrap: wrap;">
                    <button onclick="LawAIApp.VideoRenderer._takeNote('${source.videoId}')" 
                            style="padding: 8px 20px; background: rgba(139,92,246,0.08); border: 1px solid rgba(139,92,246,0.12); border-radius: 100px; color: #8b5cf6; font-size: 13px; cursor: pointer; font-family: inherit;">
                        📓 Take Note
                    </button>
                    <button onclick="LawAIApp.VideoRenderer._scheduleActivity('${source.videoId}')" 
                            style="padding: 8px 20px; background: rgba(74,158,255,0.08); border: 1px solid rgba(74,158,255,0.12); border-radius: 100px; color: #4a9eff; font-size: 13px; cursor: pointer; font-family: inherit;">
                        📅 Schedule
                    </button>
                </div>

                <!-- 🔥 Part 173: Active Learning (Optional) -->
                ${activeLearningHTML}
            </div>
        `;
    },

    // ============================================================
    // Part 173: Active Learning Block
    // ============================================================

    _buildActiveLearning: function(source) {
        return `
            <div style="margin-top: 24px; padding: 16px 20px; background: rgba(139,92,246,0.04); border-radius: 12px; border: 1px solid rgba(139,92,246,0.08);">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
                    <span style="font-size: 14px;">💡</span>
                    <span style="font-size: 11px; color: #8b5cf6; font-weight: 500; letter-spacing: 0.5px; text-transform: uppercase;">Active Learning</span>
                </div>

                <div style="display: flex; flex-direction: column; gap: 8px;">
                    <button onclick="LawAIApp.VideoRenderer._promptReflection('${source.videoId}')" 
                            style="padding: 10px 16px; background: rgba(139,92,246,0.06); border: 1px solid rgba(139,92,246,0.12); border-radius: 8px; color: #c4b5fd; font-size: 13px; cursor: pointer; font-family: inherit; text-align: left; display: flex; align-items: center; gap: 8px; transition: all 0.2s;"
                            onmouseover="this.style.background='rgba(139,92,246,0.12)'"
                            onmouseout="this.style.background='rgba(139,92,246,0.06)'">
                        <span style="font-size: 16px;">💭</span>
                        <div>
                            <div style="font-weight: 500;">What did you notice?</div>
                            <div style="font-size: 11px; color: #94a3b8; margin-top: 2px;">Reflect on a key idea from this video</div>
                        </div>
                    </button>

                    <button onclick="LawAIApp.VideoRenderer._relatedPractice('${source.videoId}')" 
                            style="padding: 10px 16px; background: rgba(74,158,255,0.06); border: 1px solid rgba(74,158,255,0.12); border-radius: 8px; color: #93c5fd; font-size: 13px; cursor: pointer; font-family: inherit; text-align: left; display: flex; align-items: center; gap: 8px; transition: all 0.2s;"
                            onmouseover="this.style.background='rgba(74,158,255,0.12)'"
                            onmouseout="this.style.background='rgba(74,158,255,0.06)'">
                        <span style="font-size: 16px;">✏️</span>
                        <div>
                            <div style="font-weight: 500;">Try related practice</div>
                            <div style="font-size: 11px; color: #94a3b8; margin-top: 2px;">Apply what you just watched</div>
                        </div>
                    </button>
                </div>

                <div style="margin-top: 10px; font-size: 10px; color: #64748b; opacity: 0.7;">
                    Optional — skip if you prefer
                </div>
            </div>
        `;
    },

    _renderUnavailable: function(activity) {
        return `
            <div style="padding: 60px 20px; text-align: center; color: #94a3b8;">
                <div style="font-size: 48px; margin-bottom: 16px;">🎬</div>
                <h3 style="color: #e2e8f0; font-weight: 600; margin: 0 0 8px 0;">Video unavailable</h3>
                <p style="margin: 0;">This video activity cannot be loaded right now.</p>
            </div>
        `;
    },

    // ============================================================
    // Actions (Part 170)
    // ============================================================

    _takeNote: function(videoId) {
        // 🔥 Part 170: 通过 NotesAuthority 创建笔记
        var notesAuth = window.LawAIApp?.NotesAuthority;
        if (!notesAuth || !notesAuth.isReady) {
            if (window.LawAIApp?.Toast?.info) {
                LawAIApp.Toast.info('📓 Notes loading...');
            }
            return;
        }

        var note = notesAuth.create({
            title: 'Video Note',
            content: 'Note from video ' + videoId,
            noteType: 'GENERAL',
            source: 'video-activity',
            createdBy: 'learner',
            tags: ['video', 'note'],
            relatedActivityRef: videoId
        });

        if (note.success && window.LawAIApp?.Toast?.success) {
            LawAIApp.Toast.success('📓 Note created');
        }
    },

    _scheduleActivity: function(videoId) {
        // 🔥 Part 170: 通过 CalendarAuthority 调度
        var calAuth = window.LawAIApp?.CalendarAuthority;
        if (!calAuth || !calAuth.isReady) {
            if (window.LawAIApp?.Toast?.info) {
                LawAIApp.Toast.info('📅 Calendar loading...');
            }
            return;
        }

        var tomorrow = new Date(Date.now() + 86400000);
        tomorrow.setHours(19, 0, 0, 0);

        var result = calAuth.create({
            title: 'Watch: Video',
            activityRef: 'video_' + videoId,
            startAt: tomorrow.toISOString(),
            duration: 30,
            source: 'video-activity'
        });

        if (result.success && window.LawAIApp?.Toast?.success) {
            LawAIApp.Toast.success('📅 Scheduled for tomorrow');
        }
    },

    // ============================================================
    // 🔥 Part 173: Active Learning Actions
    // ============================================================

    _promptReflection: function(videoId) {
        var reflection = prompt('💭 What did you notice in this video?\n\n(Your reflection will be saved to Notes)');
        if (!reflection || !reflection.trim()) return;

        // 🔥 Part 173: 通过 NotesAuthority 保存反思
        var notesAuth = window.LawAIApp?.NotesAuthority;
        if (!notesAuth || !notesAuth.isReady) {
            if (window.LawAIApp?.Toast?.info) {
                LawAIApp.Toast.info('📓 Notes loading, please retry');
            }
            return;
        }

        var result = notesAuth.create({
            title: 'Video Reflection',
            content: reflection,
            noteType: 'REFLECTION',
            source: 'video-activity',
            createdBy: 'learner',
            tags: ['video', 'reflection'],
            relatedActivityRef: videoId
        });

        if (result.success && window.LawAIApp?.Toast?.success) {
            LawAIApp.Toast.success('💭 Reflection saved to Notes');
        }
    },

    _relatedPractice: function(videoId) {
        // 🔥 Part 173: 通过事件请求相关 practice
        // 让 Lesson/Dashboard 响应，不由 Video 自己决定
        try {
            var eventBus = window.LawAIApp?.EventBus || window.EventBus;
            var payload = {
                videoId: videoId,
                source: 'video-activity',
                requestType: 'RELATED_PRACTICE',
                timestamp: new Date().toISOString()
            };

            if (eventBus && typeof eventBus.emit === 'function') {
                eventBus.emit('REQUEST_RELATED_PRACTICE', payload);
            } else {
                var event = new CustomEvent('REQUEST_RELATED_PRACTICE', { detail: payload });
                document.dispatchEvent(event);
                window.dispatchEvent(event);
            }

            if (window.LawAIApp?.Toast?.info) {
                LawAIApp.Toast.info('✏️ Finding related practice...');
            }
        } catch (e) {
            console.warn('[VideoRenderer] Failed to emit REQUEST_RELATED_PRACTICE:', e);
        }
    }
};

// Auto-register
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(function() {
        LawAIApp.VideoRenderer.register();
    }, 500);
} else {
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(function() {
            LawAIApp.VideoRenderer.register();
        }, 500);
    });
}

console.log('[VideoRenderer] Module loaded (Part 170 + Part 173)');
