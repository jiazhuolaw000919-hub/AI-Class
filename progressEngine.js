// progressEngine.js
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

  // 完成一节课
  completeLesson(lessonId) {
    const allLessons = LawAIApp.LessonEngine.getAllLessons();
    const lesson = allLessons.find(l => l.lessonId === lessonId);
    if (!lesson) return;

    const prog = this.getProgress();
    if (prog.completedLessons.includes(lessonId)) return; // 已完成

    // 更新进度
    prog.completedLessons.push(lessonId);
    prog.xp += lesson.xpReward;
    prog.completionPercent = (prog.completedLessons.length / prog.totalLessons) * 100;

    // 标记课程为已完成
    lesson.completed = true;
    lesson.completedDate = new Date().toISOString();
    LawAIApp.LessonEngine.getAllLessons()[lesson.day - 1] = lesson;
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

    // 同时更新成就和等级
    LawAIApp.AchievementEngine.checkAll();
    LawAIApp.LevelEngine.calculateLevel();

    return prog;
  },

  // 获取未完成课程数量
  getRemainingLessons() {
    const prog = this.getProgress();
    return prog.totalLessons - prog.completedLessons.length;
  }
};
