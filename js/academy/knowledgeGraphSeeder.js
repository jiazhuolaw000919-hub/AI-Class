// ============================================================
// js/academy/knowledgeGraphSeeder.js
// 把真实 Academy 内容灌进 KnowledgeGraph
// 不依赖 ingestFromAcademy（那个是 module 时代的）
// ============================================================

(function() {
  'use strict';

  window.LawAIApp = window.LawAIApp || {};

  if (window.LawAIApp.KnowledgeGraphSeeder) {
    console.log('[KGSeeder] Already exists');
    return;
  }

  var KGSeeder = {
    /**
     * 从 LessonEngine + SubjectRegistry 灌数据
     * @param {Object} options
     * @param {boolean} options.clear - 是否先清空
     * @returns {Object} 统计
     */
    seedFromAcademy: function(options) {
      options = options || {};
      var kg = window.LawAIApp.KnowledgeGraph;
      var le = window.LawAIApp.LessonEngine;

      if (!kg) { console.warn('[KGSeeder] No KnowledgeGraph'); return null; }
      if (!le) { console.warn('[KGSeeder] No LessonEngine'); return null; }

      if (options.clear) {
        kg.reset();
        console.log('[KGSeeder] 🧹 Cleared graph');
      }

      var lessons = le.getAllLessons();
      if (!lessons || lessons.length === 0) {
        console.warn('[KGSeeder] No lessons to seed');
        return kg.getGraphStats();
      }

      var subjectMap = {};
      var courseMap = {};
      var lessonCount = 0;
      var subjectCount = 0;
      var courseCount = 0;

      lessons.forEach(function(lesson) {
        var lid = lesson.lessonId || lesson.id;
        var sid = lesson.subjectId;
        var cid = lesson.courseId || 'course-ai';

        // 1. Course 节点
        if (cid && !courseMap[cid]) {
          kg.registerNode({
            id: 'course:' + cid,
            type: kg.NODE_TYPES.COURSE,
            title: cid,
            description: 'Course'
          });
          courseMap[cid] = true;
          courseCount++;
        }

        // 2. Subject 节点
        if (sid && !subjectMap[sid]) {
          kg.registerNode({
            id: 'subject:' + sid,
            type: kg.NODE_TYPES.KNOWLEDGE,
            title: sid,
            description: 'Subject'
          });
          subjectMap[sid] = true;
          subjectCount++;

          // Subject → PART_OF → Course
          if (cid) {
            kg.registerRelation({
              from: 'subject:' + sid,
              to: 'course:' + cid,
              type: kg.RELATION_TYPES.PART_OF
            });
          }
        }

        // 3. Lesson 节点
        var lessonNodeId = 'lesson:' + lid;
        if (!kg.hasNode(lessonNodeId)) {
          kg.registerNode({
            id: lessonNodeId,
            type: kg.NODE_TYPES.LESSON,
            title: lesson.title || lid,
            description: lesson.summary || lesson.description || ''
          });
          lessonCount++;
        }

        // 4. Lesson → PART_OF → Subject
        if (sid) {
          kg.registerRelation({
            from: 'lesson:' + lid,
            to: 'subject:' + sid,
            type: kg.RELATION_TYPES.PART_OF
          });
        }
      });

      var stats = kg.getGraphStats();
      console.log('[KGSeeder] ✅ Seeded:', {
        courses: courseCount,
        subjects: subjectCount,
        lessons: lessonCount,
        totalEntities: stats.totalEntities,
        totalRelationships: stats.totalRelationships
      });

      return stats;
    },

    /**
     * 灌完后自动 seed（等 LessonEngine 就绪）
     */
    autoSeed: function() {
      var self = this;
      var tries = 0;
      var maxTries = 20;

      function trySeed() {
        tries++;
        var kg = window.LawAIApp.KnowledgeGraph;
        var le = window.LawAIApp.LessonEngine;

        if (kg && le && le.getAllLessons().length > 0) {
          var stats = kg.getGraphStats();
          // 只在图谱为空时自动 seed
          if (stats.totalEntities === 0) {
            self.seedFromAcademy({ clear: false });
          } else {
            console.log('[KGSeeder] ⏭️ Graph already has', stats.totalEntities, 'entities, skipping auto-seed');
          }
          return;
        }

        if (tries >= maxTries) {
          console.warn('[KGSeeder] Gave up after', maxTries, 'tries');
          return;
        }
        setTimeout(trySeed, 500);
      }

      trySeed();
    }
  };

  window.LawAIApp.KnowledgeGraphSeeder = KGSeeder;

  // 自动 seed
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(function() { KGSeeder.autoSeed(); }, 1500);
  } else {
    document.addEventListener('DOMContentLoaded', function() {
      setTimeout(function() { KGSeeder.autoSeed(); }, 1500);
    });
  }

  console.log('[KGSeeder] ✅ Module loaded');

})();
