// ===========================================
// skillRegistry.js
// Season 5 Part 43-44 — Skill System Authority
// Bible Part 43: Skills 独立于 Courses
// Bible Part 44: 状态从证据推导，不造假
// ===========================================

window.LawAIApp = window.LawAIApp || {};

LawAIApp.SkillRegistry = (function() {
  'use strict';

  // ============================================================
  // 🔥 Skill 状态定义（Bible Part 44）
  // ============================================================
  var SKILL_STATES = {
    DISCOVERED: { id: 'DISCOVERED', label: 'Discovered', icon: '👁️', color: '#64748b', order: 1 },
    LEARNING:   { id: 'LEARNING',   label: 'Learning',   icon: '📖', color: '#4a9eff', order: 2 },
    PRACTICING: { id: 'PRACTICING', label: 'Practicing', icon: '✏️', color: '#8b5cf6', order: 3 },
    FAMILIAR:   { id: 'FAMILIAR',   label: 'Familiar',   icon: '💪', color: '#22c55e', order: 4 },
    MASTERED:   { id: 'MASTERED',   label: 'Mastered',   icon: '🏆', color: '#f59e0b', order: 5 }
  };

  // ============================================================
  // 🔥 已知 Skill 定义（从 lesson tags 聚合）
  // 不硬编码具体 skill，从现有数据推导
  // ============================================================

  // ============================================================
  // 🔥 从 storage 收集证据
  // ============================================================
  function _collectEvidence(skillName) {
    var evidence = {
      lessons: [],        // 相关 lesson
      completedLessons: 0,
      practiceAttempts: 0,
      practiceCorrect: 0,
      flashcardReviews: 0,
      noteCount: 0
    };

    try {
      var storage = LawAIApp.StorageEngine;
      if (!storage) return evidence;

      var skillLower = String(skillName || '').toLowerCase();

      // 1. 找相关 lessons（tag 匹配）— 从多个数据源
      var relevantLessonIds = {};

      // 数据源 1: LessonEngine.getAllLessons()
      try {
        var engineLessons = [];
        if (LawAIApp.LessonEngine && typeof LawAIApp.LessonEngine.getAllLessons === 'function') {
          engineLessons = LawAIApp.LessonEngine.getAllLessons() || [];
        }
        engineLessons.forEach(function(l) {
          if (l && l.tags && Array.isArray(l.tags)) {
            var match = l.tags.some(function(t) {
              return String(t).toLowerCase() === skillLower;
            });
            if (match) {
              var lid = l.id || l.lessonId;
              if (lid) relevantLessonIds[lid] = true;
            }
          }
        });
      } catch (e) {}

      // 🔥 数据源 2: ContentRegistry / ContentLoader 的 lessons
      try {
        var contentRegistry = LawAIApp.ContentRegistry;
        if (contentRegistry) {
          var allContentLessons = [];
          if (typeof contentRegistry.getAllLessons === 'function') {
            allContentLessons = contentRegistry.getAllLessons() || [];
          } else if (contentRegistry.lessons && Array.isArray(contentRegistry.lessons)) {
            allContentLessons = contentRegistry.lessons;
          }
          allContentLessons.forEach(function(l) {
            if (l && l.tags && Array.isArray(l.tags)) {
              var match = l.tags.some(function(t) {
                return String(t).toLowerCase() === skillLower;
              });
              if (match) {
                var lid = l.id || l.lessonId;
                if (lid) relevantLessonIds[lid] = true;
              }
            }
          });
        }
      } catch (e) {}

      // 🔥 数据源 3: SubjectRegistry 里的 lesson tags
      try {
        var subjectRegistry = LawAIApp.SubjectRegistry;
        if (subjectRegistry && typeof subjectRegistry.getAllSubjects === 'function') {
          var subjects = subjectRegistry.getAllSubjects() || [];
          subjects.forEach(function(subj) {
            (subj.lessons || []).forEach(function(l) {
              if (l && l.tags && Array.isArray(l.tags)) {
                var match = l.tags.some(function(t) {
                  return String(t).toLowerCase() === skillLower;
                });
                if (match) {
                  var lid = (typeof l === 'string') ? l : (l.id || l.lessonId);
                  if (lid) relevantLessonIds[lid] = true;
                }
              }
            });
          });
        }
      } catch (e) {}

      // 🔥 数据源 4: practice_progress 里已经做过的 lesson（反推 skill）
      try {
        var practiceStore = LawAIApp.StorageEngine.get('practice_progress', {});
        for (var practiceLessonId in practiceStore) {
          if (!practiceStore.hasOwnProperty(practiceLessonId)) continue;
          // 如果这个 lesson ID 已经在 relevantLessonIds 里 → 跳过
          if (relevantLessonIds[practiceLessonId]) continue;
          // 否则检查这个 lesson 是否和当前 skill 相关
          // 从 lesson ID 里的关键词判断（如 "prompt-engineering" 包含 "prompt engineering"）
          var lidLower = String(practiceLessonId).toLowerCase();
          var skillWords = skillLower.split(/\s+/);
          var matchesSkill = skillWords.some(function(w) {
            return w.length > 2 && lidLower.indexOf(w) !== -1;
          });
          if (matchesSkill) {
            relevantLessonIds[practiceLessonId] = true;
          }
        }
      } catch (e) {}

      // 🔥 数据源 5: notes 的 lessonId（反推 skill）
      try {
        var allNotes = LawAIApp.StorageEngine.get('user_notes', []);
        allNotes.forEach(function(n) {
          if (!n || !n.lessonId) return;
          if (relevantLessonIds[n.lessonId]) return;
          var lidLower = String(n.lessonId).toLowerCase();
          var skillWords = skillLower.split(/\s+/);
          var matchesSkill = skillWords.some(function(w) {
            return w.length > 2 && lidLower.indexOf(w) !== -1;
          });
          if (matchesSkill) {
            relevantLessonIds[n.lessonId] = true;
          }
        });
      } catch (e) {}

      // 2. 检查完成的 lessons
      var progress = null;
      try {
        if (LawAIApp.ProgressEngine && typeof LawAIApp.ProgressEngine.getProgress === 'function') {
          progress = LawAIApp.ProgressEngine.getProgress();
        }
      } catch (e) {}

      var completedList = (progress && progress.completedLessons) || [];

      for (var lid in relevantLessonIds) {
        if (!relevantLessonIds.hasOwnProperty(lid)) continue;
        evidence.lessons.push(lid);
        if (completedList.indexOf(lid) !== -1) {
          evidence.completedLessons++;
        }
      }

      // 3. Practice 证据
      var practiceStore = storage.get('practice_progress', {});
      for (var pid in practiceStore) {
        if (!practiceStore.hasOwnProperty(pid)) continue;
        if (relevantLessonIds[pid]) {
          var p = practiceStore[pid];
          evidence.practiceAttempts += p.attempted || 0;
          evidence.practiceCorrect += p.correct || 0;
        }
      }

      // 4. Flashcard 证据（从 note tags 匹配）
      var notes = storage.get('user_notes', []);
      notes.forEach(function(n) {
        if (!n) return;
        if (n.type === 'FLASHCARD_REVIEW') {
          if (n.lessonId && relevantLessonIds[n.lessonId]) {
            evidence.flashcardReviews++;
          }
        }
        if (n.tags && Array.isArray(n.tags)) {
          if (n.tags.some(function(t) { return String(t).toLowerCase() === skillLower; })) {
            evidence.noteCount++;
          }
        }
      });

    } catch (e) {
      console.warn('[SkillRegistry] _collectEvidence failed:', e);
    }

    return evidence;
  }

  // ============================================================
  // 🔥 从证据推导状态（Bible Part 44: 不造假）
  // ============================================================
  function _deriveState(evidence) {
    var hasLessons = evidence.lessons.length > 0;
    var completed = evidence.completedLessons;
    var attempts = evidence.practiceAttempts;
    var correct = evidence.practiceCorrect;
    var flashcards = evidence.flashcardReviews;

    // MASTERED: 3+ lessons completed + 80%+ accuracy + 5+ flashcards
    if (completed >= 3 && attempts >= 5) {
      var accuracy = attempts > 0 ? (correct / attempts) : 0;
      if (accuracy >= 0.8 && flashcards >= 5) {
        return SKILL_STATES.MASTERED;
      }
    }

    // FAMILIAR: 2+ lessons + 3+ practices
    if (completed >= 2 && attempts >= 3) {
      return SKILL_STATES.FAMILIAR;
    }

    // PRACTICING: 做过 practice
    if (attempts >= 1) {
      return SKILL_STATES.PRACTICING;
    }

    // LEARNING: 完成 1+ lesson
    if (completed >= 1) {
      return SKILL_STATES.LEARNING;
    }

    // DISCOVERED: 至少见过
    if (hasLessons || evidence.noteCount > 0) {
      return SKILL_STATES.DISCOVERED;
    }

    // 默认
    return SKILL_STATES.DISCOVERED;
  }

  // ============================================================
  // 🔥 Public API
  // ============================================================
  return {
    SKILL_STATES: SKILL_STATES,

    /**
     * 获取某个 skill 的完整信息
     */
    getSkill: function(skillName) {
      if (!skillName) return null;
      var evidence = _collectEvidence(skillName);
      var state = _deriveState(evidence);

      return {
        name: skillName,
        state: state.id,
        stateInfo: state,
        evidence: evidence,
        // 进度百分比（用于 UI）
        progress: _calcProgress(state.id)
      };
    },

    /**
     * 获取所有 skills（从现有 tags 聚合）
     */
    getAllSkills: function() {
      var skillSet = {};
      var storage = LawAIApp.StorageEngine;
      if (!storage) return [];

      // 只从 lesson tags 提取
      try {
        var lessons = [];
        if (LawAIApp.LessonEngine && typeof LawAIApp.LessonEngine.getAllLessons === 'function') {
          lessons = LawAIApp.LessonEngine.getAllLessons() || [];
        }
        lessons.forEach(function(l) {
          if (l && l.tags && Array.isArray(l.tags)) {
            l.tags.forEach(function(t) { skillSet[t] = true; });
          }
        });
      } catch (e) {}

      // 从 subjects 里的 lesson tags
      try {
        var sr = LawAIApp.SubjectRegistry;
        if (sr && typeof sr.getAllSubjects === 'function') {
          var subjects = sr.getAllSubjects() || [];
          subjects.forEach(function(subj) {
            (subj.lessons || []).forEach(function(l) {
              if (l && l.tags && Array.isArray(l.tags)) {
                l.tags.forEach(function(t) { skillSet[t] = true; });
              }
            });
          });
        }
      } catch (e) {}

      // 🔥 排除非 skill 标签
      var EXCLUDED = {
        'beginner': true,
        'intermediate': true,
        'advanced': true,
        'foundation': true,
        'core': true,
        'flashcard': true,
        'known': true,
        'reflection': true,
        'note': true,
        'review': true
      };

      var names = Object.keys(skillSet).filter(function(n) {
        var lower = String(n).toLowerCase();
        // 排除黑名单
        if (EXCLUDED[lower]) return false;
        // 排除纯数字
        if (/^\d+$/.test(lower)) return false;
        // 排除太短的（< 3 字符）
        if (lower.length < 3) return false;
        return true;
      });

      return names.map(function(name) {
        return this.getSkill(name);
      }.bind(this));
    },

    /**
     * 获取按状态分组的 skills
     */
    getSkillsByState: function() {
      var all = this.getAllSkills();
      var grouped = {
        MASTERED: [],
        FAMILIAR: [],
        PRACTICING: [],
        LEARNING: [],
        DISCOVERED: []
      };
      all.forEach(function(s) {
        if (grouped[s.state]) grouped[s.state].push(s);
      });
      return grouped;
    },

    /**
     * 获取 skill 相关的 lessons
     */
    getSkillLessons: function(skillName) {
      var evidence = _collectEvidence(skillName);
      return evidence.lessons.slice();
    },

    /**
     * 手动记录 skill 证据（用于将来扩展）
     */
    recordEvidence: function(skillName, type, data) {
      try {
        var storage = LawAIApp.StorageEngine;
        if (!storage) return false;
        var stored = storage.get('skill_evidence', {});
        if (!stored[skillName]) stored[skillName] = [];
        stored[skillName].push({
          type: type,
          data: data || {},
          at: new Date().toISOString()
        });
        storage.set('skill_evidence', stored);
        return true;
      } catch (e) {
        return false;
      }
    }
  };
})();

// ============================================================
// 辅助函数
// ============================================================
function _calcProgress(stateId) {
  var map = {
    'DISCOVERED': 20,
    'LEARNING': 40,
    'PRACTICING': 60,
    'FAMILIAR': 80,
    'MASTERED': 100
  };
  return map[stateId] || 0;
}

// 重新绑定到 SkillRegistry（因为上面用了模块内部变量）
LawAIApp.SkillRegistry._calcProgress = _calcProgress;

console.log('🎯 SkillRegistry ready (Part 43-44)');
