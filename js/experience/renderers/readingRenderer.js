// js/experience/renderers/readingRenderer.js
// Part 128: Reading Activity Renderer

window.LawAIApp = window.LawAIApp || {};
window.LawAIApp.Experience = window.LawAIApp.Experience || {};
window.LawAIApp.Experience.Renderers = window.LawAIApp.Experience.Renderers || {};

LawAIApp.Experience.Renderers.ReadingRenderer = {
    /**
     * 创建 Reading Renderer 实例
     * @param {Object} activity - Activity 对象
     * @param {HTMLElement} container - 渲染容器
     * @returns {Object} Renderer 接口 { mount, unmount, update, getStatus }
     */
    create: function(activity, container) {
        var _container = container;
        var _activity = activity;
        var _status = 'idle';
        var _scrollListener = null;
        var _sectionObservers = [];
        var _seenSections = {};
        var _progress = 0;
        var _isMounted = false;
        var _startEmitted = false;

        // 解析内容
        var _content = _activity.content || '';
        var _sections = _parseSections(_content);

        // ============================================================
        // 私有方法
        // ============================================================

        function _parseSections(content) {
            if (!content) return [{ id: 'section-1', title: 'Content', content: content }];
            
            // 尝试按标题分割
            var lines = content.split('\n');
            var sections = [];
            var currentSection = { id: 'section-1', title: 'Introduction', content: [] };
            var sectionCounter = 1;

            for (var i = 0; i < lines.length; i++) {
                var line = lines[i].trim();
                if (!line) continue;

                // 检测标题 (以 # 或 数字. 开头)
                if (line.match(/^#{1,3}\s/) || line.match(/^\d+\.\s/)) {
                    if (currentSection.content.length > 0) {
                        currentSection.content = currentSection.content.join('\n');
                        sections.push(currentSection);
                        sectionCounter++;
                    }
                    currentSection = {
                        id: 'section-' + sectionCounter,
                        title: line.replace(/^#{1,3}\s/, '').replace(/^\d+\.\s/, ''),
                        content: []
                    };
                } else {
                    currentSection.content.push(line);
                }
            }

            if (currentSection.content.length > 0) {
                currentSection.content = currentSection.content.join('\n');
                sections.push(currentSection);
            }

            // 如果没有 sections，创建一个默认的
            if (sections.length === 0) {
                sections.push({
                    id: 'section-1',
                    title: 'Content',
                    content: content
                });
            }

            return sections;
        }

        function _getProgress() {
            if (_sections.length === 0) return 0;
            var seen = Object.keys(_seenSections).length;
            return Math.min(100, Math.round((seen / _sections.length) * 100));
        }

        function _emitSignal(signalType, data) {
            try {
                var runtime = window.LawAIApp?.Experience?.Runtime;
                if (runtime && typeof runtime._emit === 'function') {
                    runtime._emit(signalType, {
                        activityId: _activity.id,
                        lessonId: _activity.metadata?.lessonId || _activity.id?.split(':')[0],
                        sectionId: data?.sectionId || null,
                        progress: _progress,
                        ...data
                    });
                } else {
                    // Fallback: 直接 dispatch
                    var event = new CustomEvent(signalType, {
                        detail: {
                            activityId: _activity.id,
                            lessonId: _activity.metadata?.lessonId || null,
                            sectionId: data?.sectionId || null,
                            progress: _progress,
                            source: 'reading-renderer',
                            timestamp: new Date().toISOString(),
                            ...data
                        }
                    });
                    document.dispatchEvent(event);
                    window.dispatchEvent(event);
                }
            } catch (e) {
                // 忽略
            }
        }

        function _handleSectionView(sectionId) {
            if (_seenSections[sectionId]) return;
            _seenSections[sectionId] = true;
            _progress = _getProgress();

            _emitSignal('READING_SECTION_VIEWED', {
                sectionId: sectionId,
                progress: _progress,
                totalSections: _sections.length,
                seenSections: Object.keys(_seenSections).length
            });

            // 如果看到 50% 以上 sections，发射进度信号
            if (_progress >= 25 && _progress < 50) {
                _emitSignal('READING_PROGRESS', { progress: 25 });
            } else if (_progress >= 50 && _progress < 75) {
                _emitSignal('READING_PROGRESS', { progress: 50 });
            } else if (_progress >= 75 && _progress < 100) {
                _emitSignal('READING_PROGRESS', { progress: 75 });
            }
        }

        function _setupSectionObservers() {
            var sections = _container.querySelectorAll('.reading-section');
            if (sections.length === 0) return;

            if (typeof IntersectionObserver === 'undefined') {
                // Fallback: 全部标记为已看
                for (var i = 0; i < sections.length; i++) {
                    var sectionId = sections[i].dataset.sectionId;
                    if (sectionId) _handleSectionView(sectionId);
                }
                return;
            }

            var observer = new IntersectionObserver(function(entries) {
                for (var i = 0; i < entries.length; i++) {
                    var entry = entries[i];
                    if (entry.isIntersecting) {
                        var sectionId = entry.target.dataset.sectionId;
                        if (sectionId) _handleSectionView(sectionId);
                    }
                }
            }, {
                threshold: 0.3,
                rootMargin: '0px 0px -50px 0px'
            });

            for (var j = 0; j < sections.length; j++) {
                observer.observe(sections[j]);
            }

            _sectionObservers.push(observer);
        }

        function _renderHTML() {
            if (_sections.length === 0) {
                return `
                    <div class="reading-empty" style="color:#64748b;padding:20px;text-align:center;">
                        <p>No content available for this reading activity.</p>
                    </div>
                `;
            }

            var html = '';
            html += `<div class="reading-activity" style="font-family:'Inter',sans-serif;color:#e2e8f0;line-height:1.7;font-size:15px;">`;

            for (var i = 0; i < _sections.length; i++) {
                var section = _sections[i];
                var isFirst = i === 0;
                html += `
                    <div class="reading-section" data-section-id="${section.id}" 
                         style="margin-bottom:${isFirst ? '0' : '24'}px;padding:${isFirst ? '0' : '16px 0 0'};border-top:${isFirst ? 'none' : '1px solid rgba(255,255,255,0.04)'};">
                        ${section.title && !isFirst ? `<h4 style="font-size:16px;font-weight:600;color:#e2e8f0;margin:0 0 8px;">${section.title}</h4>` : ''}
                        <div style="color:#c8d0d8;font-size:14px;line-height:1.8;white-space:pre-wrap;">${section.content}</div>
                    </div>
                `;
            }

            // 进度指示器
            html += `
                <div class="reading-progress" style="margin-top:24px;padding-top:16px;border-top:1px solid rgba(255,255,255,0.04);">
                    <div style="display:flex;justify-content:space-between;align-items:center;font-size:11px;color:#64748b;">
                        <span>Progress</span>
                        <span id="reading-progress-text">0%</span>
                    </div>
                    <div style="margin-top:4px;background:rgba(255,255,255,0.06);border-radius:4px;height:4px;overflow:hidden;">
                        <div id="reading-progress-bar" style="background:#4a9eff;height:100%;width:0%;transition:width 0.3s;"></div>
                    </div>
                </div>
            `;

            html += `</div>`;
            return html;
        }

        function _updateProgressUI() {
            var bar = _container.querySelector('#reading-progress-bar');
            var text = _container.querySelector('#reading-progress-text');
            if (bar) bar.style.width = _progress + '%';
            if (text) text.textContent = _progress + '%';
        }

        // ============================================================
        // 公共接口
        // ============================================================

        return {
            /**
             * 挂载渲染器
             */
            mount: function() {
                if (_isMounted) return;
                _isMounted = true;

                _container.innerHTML = _renderHTML();

                // 设置 section observers
                _setupSectionObservers();

                // 更新进度 UI
                _updateProgressUI();

                // 发射 START 信号（只有真正看到内容时）
                if (!_startEmitted) {
                    _startEmitted = true;
                    _emitSignal('READING_STARTED', {
                        totalSections: _sections.length,
                        contentLength: _content.length
                    });
                    // 也发射 ACTIVITY_STARTED（通用生命周期）
                    var runtime = window.LawAIApp?.Experience?.Runtime;
                    if (runtime && typeof runtime._emitLifecycle === 'function') {
                        runtime._emitLifecycle('start', _activity.id);
                    }
                }

                _status = 'active';
                console.log('[ReadingRenderer] ✅ Mounted:', _activity.id);
            },

            /**
             * 卸载渲染器
             */
            unmount: function() {
                if (!_isMounted) return;

                // 清理 IntersectionObserver
                for (var i = 0; i < _sectionObservers.length; i++) {
                    try {
                        _sectionObservers[i].disconnect();
                    } catch (e) {}
                }
                _sectionObservers = [];

                // 清理滚动监听器
                if (_scrollListener) {
                    window.removeEventListener('scroll', _scrollListener);
                    _scrollListener = null;
                }

                // 清理容器
                _container.innerHTML = '';

                _isMounted = false;
                _status = 'idle';

                // 发射 UNMOUNT 信号
                var runtime = window.LawAIApp?.Experience?.Runtime;
                if (runtime && typeof runtime._emitLifecycle === 'function') {
                    runtime._emitLifecycle('unmount', _activity.id);
                }

                console.log('[ReadingRenderer] ✅ Unmounted:', _activity.id);
            },

            /**
             * 更新内容
             */
            update: function(newData) {
                if (newData && newData.content) {
                    _content = newData.content;
                    _sections = _parseSections(_content);
                    _seenSections = {};
                    _progress = 0;
                    if (_isMounted) {
                        this.mount(); // re-mount with new content
                    }
                }
            },

            /**
             * 获取状态
             */
            getStatus: function() {
                return {
                    status: _status,
                    progress: _progress,
                    isMounted: _isMounted,
                    totalSections: _sections.length,
                    seenSections: Object.keys(_seenSections).length
                };
            },

            /**
             * 获取进度 (用于完成判断)
             */
            getProgress: function() {
                return _progress;
            },

            /**
             * 检查是否完成 (阈值 80%)
             */
            isComplete: function() {
                return _progress >= 80;
            }
        };
    }
};

// 注册到 ActivityRegistry
(function registerReadingRenderer() {
    var registry = window.LawAIApp?.Experience?.ActivityRegistry;
    if (!registry) {
        console.warn('[ReadingRenderer] ActivityRegistry not available, will register later');
        document.addEventListener('ACTIVITY_REGISTRY_READY', registerReadingRenderer);
        return;
    }

    // 注册 READING 类型的渲染器
    registry.register('READING', function(activity, container) {
        var renderer = LawAIApp.Experience.Renderers.ReadingRenderer.create(activity, container);
        renderer.mount();
        return renderer;
    });

    console.log('📖 ReadingRenderer registered (Part 128)');
})();

console.log('📖 ReadingRenderer loaded (Part 128)');
