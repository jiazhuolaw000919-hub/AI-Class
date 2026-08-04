// js/academy/academyProgressView.js
// Part 57.4 — Academy Progress View
// Law AI Academy Developer Bible
//
// PURPOSE: Display XP, Level, completed lessons, learning streak, achievements
// INTEGRATES: progressEngine, achievementEngine, xpEngine

(function() {
    'use strict';

    if (window.LawAIApp && window.LawAIApp.AcademyProgressView) {
        console.log('[AcademyProgressView] Already exists, skipping...');
        return;
    }

    const AcademyProgressView = {
        version: '1.0.0',
        initialized: false,

        // ============================================================
        // PUBLIC API
        // ============================================================

        init: function() {
            if (this.initialized) {
                console.log('[AcademyProgressView] Already initialized');
                return this;
            }

            console.log('[AcademyProgressView] Initializing...');
            this.initialized = true;
            this._bindEvents();
            return this;
        },

        /**
         * 获取完整进度数据
         * @returns {Object}
         */
        getProgressData: function() {
            const data = {
                xp: 0,
                level: 1,
                completedLessons: 0,
                totalLessons: 0,
                streak: 0,
                achievements: [],
                nextMilestone: 100
            };

            // 1. 从 XP Engine 获取
            const xpEngine = window.LawAIApp?.ExperienceEngine || window.LawAIApp?.XpEngine;
            if (xpEngine) {
                if (typeof xpEngine.getXP === 'function') {
                    data.xp = xpEngine.getXP() || 0;
                } else if (typeof xpEngine.getExperienceLevel === 'function') {
                    data.xp = xpEngine.getExperienceLevel() || 0;
                }
                if (typeof xpEngine.getLevel === 'function') {
                    data.level = xpEngine.getLevel() || 1;
                }
            }

            // 2. 从 Progress Engine 获取
            const progressEngine = window.LawAIApp?.ProgressEngine;
            if (progressEngine) {
                if (typeof progressEngine.getCompletedLessons === 'function') {
                    data.completedLessons = progressEngine.getCompletedLessons().length || 0;
                } else if (typeof progressEngine.getProgress === 'function') {
                    const prog = progressEngine.getProgress();
                    if (prog) {
                        data.completedLessons = prog.completedLessons?.length || 0;
                        data.totalLessons = prog.totalLessons || 0;
                        data.streak = prog.streak || 0;
                    }
                }
            }

            // 3. 从 Achievement Engine 获取
            const achievementEngine = window.LawAIApp?.AchievementEngine;
            if (achievementEngine && typeof achievementEngine.getAchievements === 'function') {
                data.achievements = achievementEngine.getAchievements() || [];
            }

            // 4. 计算下一个里程碑
            const milestones = [100, 250, 500, 750, 1000, 1500, 2000];
            for (let i = 0; i < milestones.length; i++) {
                if (data.xp < milestones[i]) {
                    data.nextMilestone = milestones[i];
                    break;
                }
            }

            return data;
        },

        /**
         * 渲染进度视图
         * @param {string} containerId
         */
        render: function(containerId) {
            const container = document.getElementById(containerId || 'academy-root');
            if (!container) {
                console.warn('[AcademyProgressView] Container not found');
                return;
            }

            const data = this.getProgressData();
            container.innerHTML = this._renderView(data);
        },

        /**
         * 刷新进度
         */
        refresh: function() {
            console.log('[AcademyProgressView] Refreshing...');
            this.render('academy-root');
            return this;
        },

        // ============================================================
        // PRIVATE — Rendering
        // ============================================================

        _renderView: function(data) {
            const xpPercent = Math.min(100, (data.xp / data.nextMilestone) * 100);

            return `
                <div style="background: rgba(255,255,255,0.04); border-radius: 12px; padding: 18px 20px; 
                            border: 1px solid rgba(255,255,255,0.06);">
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 12px;">
                        
                        <!-- XP -->
                        <div style="text-align: center;">
                            <div style="font-size: 24px; font-weight: 700; color: #4a9eff;">${data.xp}</div>
                            <div style="font-size: 12px; color: #94a3b8;">XP</div>
                        </div>
                        
                        <!-- Level -->
                        <div style="text-align: center;">
                            <div style="font-size: 24px; font-weight: 700; color: #f59e0b;">${data.level}</div>
                            <div style="font-size: 12px; color: #94a3b8;">Level</div>
                        </div>
                        
                        <!-- Completed Lessons -->
                        <div style="text-align: center;">
                            <div style="font-size: 24px; font-weight: 700; color: #10b981;">${data.completedLessons}</div>
                            <div style="font-size: 12px; color: #94a3b8;">Lessons Done</div>
                        </div>
                        
                        <!-- Streak -->
                        <div style="text-align: center;">
                            <div style="font-size: 24px; font-weight: 700; color: #ec4899;">${data.streak || 0}</div>
                            <div style="font-size: 12px; color: #94a3b8;">🔥 Day Streak</div>
                        </div>
                    </div>
                    
                    <!-- XP Progress Bar -->
                    <div style="margin-top: 12px;">
                        <div style="display: flex; justify-content: space-between; font-size: 12px; color: #94a3b8;">
                            <span>Progress to ${data.nextMilestone} XP</span>
                            <span>${Math.round(xpPercent)}%</span>
                        </div>
                        <div style="margin-top: 4px; background: rgba(255,255,255,0.06); border-radius: 4px; height: 4px; overflow: hidden;">
                            <div style="background: linear-gradient(90deg, #4a9eff, #10b981); height: 100%; width: ${Math.min(100, xpPercent)}%; transition: width 0.3s;"></div>
                        </div>
                    </div>
                    
                    <!-- Achievements -->
                    ${data.achievements && data.achievements.length > 0 ? `
                        <div style="margin-top: 12px; display: flex; gap: 8px; flex-wrap: wrap;">
                            ${data.achievements.slice(0, 5).map(function(a) {
                                return `<span style="background: rgba(74,158,255,0.12); padding: 2px 10px; border-radius: 12px; font-size: 12px; color: #4a9eff;">🏆 ${a.name || a}</span>`;
                            }).join('')}
                            ${data.achievements.length > 5 ? `<span style="font-size: 12px; color: #64748b;">+${data.achievements.length - 5} more</span>` : ''}
                        </div>
                    ` : ''}
                </div>
            `;
        },

        // ============================================================
        // PRIVATE — Events
        // ============================================================

        _bindEvents: function() {
            document.addEventListener('ExperienceMilestone', function() {
                this.refresh();
            }.bind(this));

            document.addEventListener('LEARNING_STATE_UPDATED', function() {
                this.refresh();
            }.bind(this));

            document.addEventListener('ACADEMY_REFRESH', function() {
                this.refresh();
            }.bind(this));

            console.log('[AcademyProgressView] Events bound');
        }
    };

    // ============================================================
    // Export
    // ============================================================

    if (!window.LawAIApp) {
        window.LawAIApp = {};
    }

    window.LawAIApp.AcademyProgressView = AcademyProgressView;

    console.log('[AcademyProgressView] Module loaded (Part 57.4)');

})();
