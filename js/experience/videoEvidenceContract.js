// /js/experience/videoEvidenceContract.js
// Part 170 — Video Evidence Contract
// Video 观察交互，不解释含义

window.LawAIApp = window.LawAIApp || {};

LawAIApp.VideoEvidenceContract = {
    version: '1.0.0',

    /**
     * 创建 Video Evidence
     */
    create: function(input) {
        if (!input.activityId) return null;
        if (!input.videoId) return null;

        return {
            evidenceId: 'vid_evt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
            learnerId: input.learnerId || 'default',
            activityId: input.activityId,
            activityType: 'video',
            videoId: input.videoId,
            lessonId: input.lessonId || null,
            observationType: input.observationType || 'INTERACTION',
            observedAt: new Date().toISOString(),
            payload: {
                eventType: input.eventType || 'UNKNOWN',
                position: input.position || null,
                duration: input.duration || null,
                segment: input.segment || null,
                metadata: input.metadata || {}
            },
            provenance: {
                source: 'VideoActivity',
                version: this.version,
                playerType: input.playerType || 'html5'
            }
        };
    },

    /**
     * 发送 evidence 到合适的域
     * ⚠️ 只发给现有的 Authority，不直接修改
     */
    emit: function(evidence) {
        if (!evidence) return;

        var event = new CustomEvent('VIDEO_EVIDENCE_EMITTED', {
            detail: {
                evidence: evidence,
                source: 'video-activity',
                timestamp: new Date().toISOString()
            }
        });
        document.dispatchEvent(event);

        if (window.LawAIApp?.EventBus?.emit) {
            window.LawAIApp.EventBus.emit('VIDEO_EVIDENCE_EMITTED', event.detail);
        }

        console.log('[VideoEvidenceContract] Evidence emitted:', evidence.payload.eventType);
    },

    /**
     * 从 HTML5 Video 元素观察
     */
    observeVideoElement: function(videoEl, context) {
        if (!videoEl) return null;

        var self = this;
        var observations = [];

        function record(eventType, extra) {
            var ev = self.create({
                activityId: context.activityId,
                videoId: context.videoId,
                lessonId: context.lessonId,
                eventType: eventType,
                position: videoEl.currentTime,
                duration: videoEl.duration,
                playerType: 'html5',
                metadata: extra || {}
            });
            if (ev) {
                self.emit(ev);
                observations.push(ev);
            }
        }

        // 绑定事件
        videoEl.addEventListener('play', function() {
            record('PLAY_STARTED');
        });

        videoEl.addEventListener('pause', function() {
            record('PLAY_PAUSED');
        });

        videoEl.addEventListener('seeking', function() {
            record('SEEKING', { seekTarget: videoEl.currentTime });
        });

        videoEl.addEventListener('ended', function() {
            record('VIDEO_COMPLETED', { completed: true });
        });

        // 跟踪重播（可选）
        var watchedSegments = {};
        videoEl.addEventListener('timeupdate', function() {
            var bucket = Math.floor(videoEl.currentTime / 10) * 10;
            if (!watchedSegments[bucket]) {
                watchedSegments[bucket] = 1;
            } else {
                watchedSegments[bucket]++;
                if (watchedSegments[bucket] === 3) {
                    record('SEGMENT_REWATCHED', { segment: bucket });
                }
            }
        });

        return {
            observations: observations,
            cleanup: function() {
                // 事件会被 videoEl 垃圾回收时清除
            }
        };
    }
};

console.log('[VideoEvidenceContract] Module loaded (Part 170)');
