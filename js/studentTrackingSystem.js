// ===========================================
// studentTrackingSystem.js
// 追踪学生（当前用户）的入学、进度、成绩
// ===========================================
LawAIApp.StudentTrackingSystem = {
  _currentStudentId: 'student_0',
  _enrollments: {},

  // 注册当前用户为学生
  enrollStudent(facultyId) {
    const student = {
      id: this._currentStudentId,
      name: LawAIApp.IdentityEngine?.getProfile()?.displayName || 'Learner',
      enrolledFaculties: [facultyId],
      completedCourses: [],
      activeCourses: [],
      gpa: 0,
      enrollmentDate: new Date().toISOString()
    };
    this._enrollments[student.id] = student;
    LawAIApp.StorageEngine.set('university_student', student);
    LawAIApp.EventBus.emit('StudentEnrolled', { student });
    return student;
  },

  // 记录课程完成
  recordCourseCompletion(courseId) {
    const student = this._enrollments[this._currentStudentId];
    if (student) {
      student.completedCourses.push(courseId);
      this._enrollments[this._currentStudentId] = student;
      LawAIApp.StorageEngine.set('university_student', student);
      // 更新GPA (模拟)
      student.gpa = Math.min(4.0, student.gpa + 0.1);
    }
  },

  getCurrentStudent() {
    return this._enrollments[this._currentStudentId] || this.enrollStudent('faculty_ai_ml');
  }
};
