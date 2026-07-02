// courseStorage.js
LawAIApp.CourseStorage = {
  _getAll() {
    let list = LawAIApp.StorageEngine.get('course_list');
    if (!list || !Array.isArray(list) || list.length === 0) {
      list = JSON.parse(JSON.stringify(LawAIApp.CourseData.courses));
      LawAIApp.StorageEngine.set('course_list', list);
    }
    // 补全缺失的默认字段
    list.forEach(c => {
      c.createdAt = c.createdAt || new Date().toISOString();
      c.updatedAt = c.updatedAt || new Date().toISOString();
    });
    return list;
  },

  _saveAll(list) {
    LawAIApp.StorageEngine.set('course_list', list);
  },

  // 获取启用的活跃课程
  getActiveCourses() {
    return this._getAll().filter(c => c.status === 'active' && c.enabled);
  },

  // 搜索
  search(query) {
    const q = query.toLowerCase();
    return this._getAll().filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      c.tags.some(t => t.toLowerCase().includes(q)) ||
      c.learningObjectives.some(o => o.toLowerCase().includes(q)) ||
      c.difficulty.toLowerCase().includes(q) ||
      c.categoryId.toLowerCase().includes(q) ||
      c.academyId.toLowerCase().includes(q)
    );
  },

  // 收藏
  toggleFavorite(courseId) {
    let favs = LawAIApp.StorageEngine.get('favorite_courses', []);
    const idx = favs.indexOf(courseId);
    if (idx === -1) favs.push(courseId);
    else favs.splice(idx, 1);
    LawAIApp.StorageEngine.set('favorite_courses', favs);
    // 同步更新 course 对象
    const list = this._getAll();
    const course = list.find(c => c.id === courseId);
    if (course) {
      course.favorite = idx === -1;
      this._saveAll(list);
    }
    return favs;
  },

  isFavorite(courseId) {
    const favs = LawAIApp.StorageEngine.get('favorite_courses', []);
    return favs.includes(courseId);
  },

  // 书签
  toggleBookmark(courseId) {
    let bm = LawAIApp.StorageEngine.get('bookmarked_courses', []);
    const idx = bm.indexOf(courseId);
    if (idx === -1) bm.push(courseId);
    else bm.splice(idx, 1);
    LawAIApp.StorageEngine.set('bookmarked_courses', bm);
    const list = this._getAll();
    const course = list.find(c => c.id === courseId);
    if (course) {
      course.bookmark = idx === -1;
      this._saveAll(list);
    }
    return bm;
  },

  isBookmarked(courseId) {
    const bm = LawAIApp.StorageEngine.get('bookmarked_courses', []);
    return bm.includes(courseId);
  },

  // 设置当前选中课程
  setSelectedCourse(id) {
    LawAIApp.StorageEngine.set('selected_course', id);
  },

  getSelectedCourseId() {
    return LawAIApp.StorageEngine.get('selected_course', null);
  },

  // 更新课程进度 (由后续引擎调用)
  updateProgress(courseId, progress, completedLessons) {
    const list = this._getAll();
    const course = list.find(c => c.id === courseId);
    if (course) {
      course.progress = progress;
      course.completedLessons = completedLessons;
      course.updatedAt = new Date().toISOString();
      this._saveAll(list);
    }
    // 同时存储单独进度 (可选)
    const allProgress = LawAIApp.StorageEngine.get('course_progress', {});
    allProgress[courseId] = { progress, completedLessons };
    LawAIApp.StorageEngine.set('course_progress', allProgress);
  },

  getProgress(courseId) {
    const allProgress = LawAIApp.StorageEngine.get('course_progress', {});
    return allProgress[courseId] || { progress: 0, completedLessons: 0 };
  }
};
