// js/academy/renderers/motivationRenderer.js
// Part 63 — AcademyView Renderer Extraction · Phase A
// Law AI Academy Developer Bible
//
// PURPOSE: Pure Motivation UI rendering
// RESPONSIBILITY: DATA → HTML → DOM
// STATELESS: Does NOT own learning state, navigation, or events

(function() {
    'use strict';

    if (window.LawAIApp && window.LawAIApp.MotivationRenderer) {
        console.log('[MotivationRenderer] Already exists, skipping...');
        return;
    }

    /**
     * MotivationRenderer
     * 
     * 纯渲染器 — 接收准备好的数据，生成 Motivation UI
     * 
     * 数据契约:
     * {
     *     xp: number,
     *     level: number,
     *     streak: number,
     *     achievements: array,
     *     achievementCount: number,
     *     nextLevelXp: number,
     *     xpProgress: number
     * }
     */
    var MotivationRenderer = {
        version: '1.0.0',

        /**
         * 渲染 Motivation UI
         * @param {HTMLElement} container - DOM 容器
         * @param {Object} motivation - 准备好的动机数据
         * @param {Object} options - 可选配置 (保留扩展)
         */
        render: function(container, motivation, options) {
            if (!container) {
                console.warn('[MotivationRenderer] Container not provided');
                return;
            }

            // 安全处理空数据
            if (!motivation) {
                container.innerHTML = '';
                return;
            }

            var xp = motivation.xp || 0;
            var level = motivation.level || 1;
            var streak = motivation.streak || 0;
            var achievements = motivation.achievements || [];
            var achievementCount = motivation.achievementCount || 0;
            var xpProgress = motivation.xpProgress || 0;

            var html = this._renderHTML(xp, level, streak, achievements, achievementCount, xpProgress);
            container.innerHTML = html;
        },

        /**
         * 生成 Motivation HTML
         * @private
         */
        _renderHTML: function(xp, level, streak, achievements, achievementCount, xpProgress) {
            var html = '';

            html += `
                <div style="margin: 16px 0 24px 0;">
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(80px, 1fr)); gap: 12px; background: rgba(255,255,255,0.04); border-radius: 12px; padding: 14px 18px; border: 1px solid rgba(255,255,255,0.06);">
                        <div style="text-align: center;">
                            <div style="font-size: 20px; font-weight: 700; color: #4a9eff;">${xp}</div>
                            <div style="font-size: 11px; color: #94a3b8;">XP</div>
                        </div>
                        <div style="text-align: center;">
                            <div style="font-size: 20px; font-weight: 700; color: #f59e0b;">${level}</div>
                            <div style="font-size: 11px; color: #94a3b8;">Level</div>
                            <div style="font-size: 10px; color: #64748b; margin-top: 2px;">
                                <div style="background: rgba(255,255,255,0.06); border-radius: 2px; height: 2px; overflow: hidden; width: 60px; margin: 0 auto;">
                                    <div style="background: #f59e0b; height: 100%; width: ${Math.min(100, xpProgress)}%; transition: width 0.3s;"></div>
                                </div>
                            </div>
                        </div>
                        <div style="text-align: center;">
                            <div style="font-size: 20px; font-weight: 700; color: #ec4899;">${streak}</div>
                            <div style="font-size: 11px; color: #94a3b8;">🔥 Day Streak</div>
                        </div>
                        <div style="text-align: center;">
                            <div style="font-size: 20px; font-weight: 700; color: #10b981;">${achievementCount}</div>
                            <div style="font-size: 11px; color: #94a3b8;">🏆 Achievements</div>
                        </div>
                    </div>
                    ${achievements && achievements.length > 0 ? this._renderAchievements(achievements) : ''}
                </div>
            `;

            return html;
        },

        /**
         * 渲染成就列表
         * @private
         */
        _renderAchievements: function(achievements) {
            var items = [];
            var count = Math.min(3, achievements.length);

            for (var i = 0; i < count; i++) {
                var a = achievements[i];
                var name = a.name || a.title || a;
                var icon = a.icon || '🏆';
                items.push('<span style="background:rgba(74,158,255,0.08);padding:2px 10px;border-radius:12px;font-size:11px;color:#4a9eff;display:inline-flex;align-items:center;gap:4px;">' + icon + ' ' + name + '</span>');
            }

            var html = items.join('');
            if (achievements.length > 3) {
                html += '<span style="font-size:11px;color:#64748b;"> +' + (achievements.length - 3) + ' more</span>';
            }

            return `
                <div style="margin-top: 8px; display: flex; gap: 6px; flex-wrap: wrap; justify-content: center;">
                    ${html}
                </div>
            `;
        },

        /**
         * 获取渲染器状态 (诊断用)
         */
        getStatus: function() {
            return {
                version: this.version,
                name: 'MotivationRenderer',
                type: 'pure-renderer'
            };
        }
    };

    // ============================================================
    // Export
    // ============================================================

    if (!window.LawAIApp) {
        window.LawAIApp = {};
    }

    window.LawAIApp.MotivationRenderer = MotivationRenderer;

    console.log('[MotivationRenderer] Module loaded (Part 63)');

})();
