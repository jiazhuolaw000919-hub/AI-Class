// progressEngine.js (Phase 13 升级版)
LawAIApp.ProgressEngine = {
  defaultProgress() {
    return {
      completedLessons: [],     // lessonId 数组
      currentLesson: 1,
      completionPercent: 0,
      currentStage: 'Foundation',
      xp: 0,
      totalLessons: 365
    };
  },

  getProgress() {
    const p = LawAIApp.StorageEngine.get('progress');
    return p ? { ...this.defaultProgress(), ...p } : this.defaultProgress();
  },

  saveProgress(progress) {
    LawAIApp.StorageEngine.set('progress', progress);
  },

  // 完成一节课（核心逻辑不变 + 新增进度记录 & 事件发布）
  completeLesson(lessonId) {
    const allLessons = LawAIApp.LessonEngine.getAllLessons();
    const lesson = allLessons.find(l => l.lessonId === lessonId);
    if (!lesson) return;

    const prog = this.getProgress();
    if (prog.completedLessons.includes(lessonId)) return; // 已完成

    // 更新旧格式进度
    prog.completedLessons.push(lessonId);
    prog.xp += lesson.xpReward;
    prog.completionPercent = (prog.completedLessons.length / prog.totalLessons) * 100;

    // 标记课程为已完成
    lesson.completed = true;
    lesson.completedDate = new Date().toISOString();
    allLessons[lesson.day - 1] = lesson;
    LawAIApp.StorageEngine.set('allLessons', allLessons);

    // 更新当前课程为下一个未完成的
    const allIds = allLessons.map(l => l.lessonId);
    const nextIdx = allIds.findIndex(id => !prog.completedLessons.includes(id));
    prog.currentLesson = nextIdx !== -1 ? allLessons[nextIdx].day : 365;

    // 更新阶段
    const currentLessonObj = allLessons[prog.currentLesson - 1];
    if (currentLessonObj) {
      const stage = LawAIApp.LessonEngine.stages.find(s =>
        currentLessonObj.day >= s.range[0] && currentLessonObj.day <= s.range[1]
      );
      prog.currentStage = stage ? stage.name : 'Completed';
    }

    this.saveProgress(prog);

    // 新增：记录详细进度（新模型）
    LawAIApp.ProgressStorage.upsertLessonRecord({
      lessonId: lessonId,
      academyId: 'academy_ai',
      courseId: null,
      moduleId: null,
      status: 'completed',
      completionPercentage: 100,
      startedAt: lesson.completedDate,
      lastOpened: lesson.completedDate,
      completedAt: lesson.completedDate,
      elapsedTime: 0,
      attempts: 1,
      resumePosition: null,
      lastReview: null,
      favorite: false,
      bookmark: false
    });

    // 新增：发布事件（由事件总线通知其他引擎）
    LawAIApp.ProgressEvents.emitLessonCompleted(lessonId);
    LawAIApp.ProgressEvents.emitProgressUpdated({ lessonId, overall: prog });

    return prog;
  },

  // 获取未完成课程数量
  getRemainingLessons() {
    const prog = this.getProgress();
    return prog.totalLessons - prog.completedLessons.length;
  }
};
