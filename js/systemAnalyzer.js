// ===========================================
// systemAnalyzer.js
// 系统分析器：检测瓶颈、低效路径
// ===========================================

// 确保 LawAIApp 存在
window.LawAIApp = window.LawAIApp || {};

LawAIApp.SystemAnalyzer = {
  initialized: false,

  init() {
    if (this.initialized) return;
    this.initialized = true;
    console.log('🔍 SystemAnalyzer initialized');
    return this;
  },

  analyze() {
    console.log('🔍 SystemAnalyzer analyzing system health...');
    
    try {
      const issues = [];
      
      // ===========================================
      // 防御性检查：确保依赖模块存在
      // ===========================================
      
      // 获取健康摘要（带默认值）
      let health = {};
      try {
        if (LawAIApp.SystemHealthMonitor && typeof LawAIApp.SystemHealthMonitor.getHealthSummary === 'function') {
          health = LawAIApp.SystemHealthMonitor.getHealthSummary() || {};
        } else {
          console.warn('⚠️ SystemHealthMonitor not ready, using default health values');
          health = {
            metrics: {
              learningEfficiency: 80,
              taskCompletionRate: 75,
              agentCoordinationEfficiency: 70,
              graphOptimizationScore: 65,
              retentionEffectiveness: 80
            }
          };
        }
      } catch (err) {
        console.warn('⚠️ Failed to get health summary:', err);
        health = {
          metrics: {
            learningEfficiency: 80,
            taskCompletionRate: 75,
            agentCoordinationEfficiency: 70,
            graphOptimizationScore: 65,
            retentionEffectiveness: 80
          }
        };
      }

      // 获取进度（带默认值）
      let progress = 0;
      try {
        if (LawAIApp.ProgressEngine && typeof LawAIApp.ProgressEngine.getProgress === 'function') {
          progress = LawAIApp.ProgressEngine.getProgress() || 0;
        } else {
          console.warn('⚠️ ProgressEngine not ready, using default progress');
          progress = 0;
        }
      } catch (err) {
        console.warn('⚠️ Failed to get progress:', err);
        progress = 0;
      }

      // 确保 metrics 存在
      const metrics = health.metrics || {};

      // ===========================================
      // 各项检查（带默认值）
      // ===========================================

      // 1. 检查学习效率
      const learningEfficiency = metrics.learningEfficiency ?? 80;
      if (learningEfficiency < 50) {
        issues.push({
          type: 'efficiency',
          severity: 'high',
          message: 'Learning efficiency is low. Consider adjusting curriculum difficulty or pacing.'
        });
      }

      // 2. 检查任务完成率
      const taskCompletionRate = metrics.taskCompletionRate ?? 75;
      if (taskCompletionRate < 40) {
        issues.push({
          type: 'engagement',
          severity: 'high',
          message: 'Task completion rate is low. Review task difficulty or provide more guidance.'
        });
      }

      // 3. 检查代理协调
      const agentCoordinationEfficiency = metrics.agentCoordinationEfficiency ?? 70;
      if (agentCoordinationEfficiency < 60) {
        issues.push({
          type: 'agent_coordination',
          severity: 'medium',
          message: 'Agent coordination could be improved. Consider rebalancing agent roles.'
        });
      }

      // 4. 检查图谱优化
      const graphOptimizationScore = metrics.graphOptimizationScore ?? 65;
      if (graphOptimizationScore < 50) {
        issues.push({
          type: 'graph_structure',
          severity: 'medium',
          message: 'Learning graph has many weak nodes. Consider restructure or reinforcement paths.'
        });
      }

      // 5. 检查记忆保持
      const retentionEffectiveness = metrics.retentionEffectiveness ?? 80;
      if (retentionEffectiveness < 70) {
        issues.push({
          type: 'memory',
          severity: 'high',
          message: 'Retention is declining. Increase review frequency or adjust memory scheduling.'
        });
      }

      // 6. 额外检查：进度是否过低
      if (progress < 10) {
        issues.push({
          type: 'progress',
          severity: 'medium',
          message: 'Progress is very low. Consider starting with foundational lessons.'
        });
      }

      // ===========================================
      // 存储分析结果（带防御）
      // ===========================================
      
      const result = {
        issues: issues,
        progress: progress,
        timestamp: new Date().toISOString(),
        health: {
          learningEfficiency: learningEfficiency,
          taskCompletionRate: taskCompletionRate,
          agentCoordinationEfficiency: agentCoordinationEfficiency,
          graphOptimizationScore: graphOptimizationScore,
          retentionEffectiveness: retentionEffectiveness
        }
      };

      try {
        if (LawAIApp.StorageEngine && typeof LawAIApp.StorageEngine.set === 'function') {
          LawAIApp.StorageEngine.set('system_analysis', result);
        } else {
          console.log('📊 Analysis result (storage not available):', result);
        }
      } catch (err) {
        console.warn('⚠️ Failed to store analysis:', err);
      }

      // 触发事件（带防御）
      try {
        if (LawAIApp.EventBus && typeof LawAIApp.EventBus.emit === 'function') {
          LawAIApp.EventBus.emit('SystemAnalysisCompleted', { issues, progress });
        } else {
          // 使用自定义事件
          window.dispatchEvent(new CustomEvent('SystemAnalysisCompleted', {
            detail: { issues, progress }
          }));
        }
      } catch (err) {
        console.warn('⚠️ Failed to emit event:', err);
      }

      console.log(`✅ SystemAnalysis completed: ${issues.length} issues found, progress: ${progress}`);
      return issues;

    } catch (err) {
      console.error('❌ SystemAnalyzer.analyze() failed:', err);
      // 返回空数组，避免调用方报错
      return [];
    }
  },

  // 便捷方法：获取最近的分析结果
  getLastAnalysis() {
    try {
      if (LawAIApp.StorageEngine && typeof LawAIApp.StorageEngine.get === 'function') {
        return LawAIApp.StorageEngine.get('system_analysis', null);
      }
      return null;
    } catch (err) {
      console.warn('⚠️ Failed to get last analysis:', err);
      return null;
    }
  },

  // 获取系统健康度评分 (0-100)
  getHealthScore() {
    try {
      const issues = this.analyze();
      if (!issues || issues.length === 0) return 100;
      
      // 根据问题和严重程度计算分数
      let score = 100;
      issues.forEach(issue => {
        if (issue.severity === 'high') score -= 15;
        else if (issue.severity === 'medium') score -= 8;
        else score -= 3;
      });
      
      return Math.max(0, Math.min(100, score));
    } catch (err) {
      console.warn('⚠️ Failed to get health score:', err);
      return 85; // 默认健康分
    }
  }
};

// 自动初始化
LawAIApp.SystemAnalyzer.init();

console.log('🔍 SystemAnalyzer V1.0 ready');
