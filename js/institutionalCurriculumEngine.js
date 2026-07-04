// ===========================================
// institutionalCurriculumEngine.js
// 将工厂生产的课程包组织为大学课程体系（必修/选修，学期分配）
// ===========================================
LawAIApp.InstitutionalCurriculumEngine = {
  // 为学院构建课程表
  buildCurriculumForFaculty(facultyId) {
    const faculty = LawAIApp.AIFacultyManager.getFaculties().find(f => f.id === facultyId);
    if (!faculty) return [];

    // 从工厂生产的资产中挑选相关课程包
    const allAssets = LawAIApp.LearningAssetManager?.getAllAssets() || [];
    const relevantAssets = allAssets.filter(asset => asset.tags?.includes(faculty.name));

    const courses = relevantAssets.map(asset => ({
      id: asset.id,
      title: asset.title,
      type: 'curriculum',
      required: true,
      semester: 1,
      professorId: null
    }));

    // 为每个系添加对应的教授（如果存在）
    faculty.departments.forEach(dept => {
      if (dept.headAgent) {
        courses.forEach(course => {
          if (course.title.includes(dept.name)) {
            course.professorId = dept.headAgent;
          }
        });
      }
    });

    return courses;
  },

  // 获取当前学生的课程表
  getStudentSchedule() {
    const student = LawAIApp.StudentTrackingSystem.getCurrentStudent();
    const allCourses = [];
    student.enrolledFaculties.forEach(facId => {
      allCourses.push(...this.buildCurriculumForFaculty(facId));
    });
    return allCourses;
  }
};
