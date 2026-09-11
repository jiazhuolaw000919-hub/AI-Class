// /js/experience/renderers/videoRenderer.js
// Part 170 — Video Activity Renderer
// 纯渲染器 + Evidence 观察者

window.LawAIApp = window.LawAIApp || {};

LawAIApp.VideoRenderer = {
    version: '1.0.0',
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
    // Actions
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
            tags: ['video', 'note']
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

console.log('[VideoRenderer] Module loaded (Part 170)');
