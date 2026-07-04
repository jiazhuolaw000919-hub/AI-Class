// ===========================================
// universityOSCore.js
// 大学操作系统核心：处理注册、选课、成绩单、认证
// ===========================================
LawAIApp.UniversityOSCore = {
  init() {
    // 初始化学院（基于工厂轨道）
    const tracks = LawAIApp.CurriculumFactoryEngine?.productionTracks || [];
    tracks.forEach(track => LawAIApp.AIFacultyManager.createFaculty(track));

    // 招募教授
    LawAIApp.AIProfessorEngine.recruitAllAgents();

    // 将代理分配到相应系
    const faculties = LawAIApp.AIFacultyManager.getFaculties();
    faculties.forEach(faculty => {
      const professors = LawAIApp.AIProfessorEngine.getProfessors();
      professors.forEach(prof => {
        if (faculty.name.includes(prof.domainExpertise)) {
          faculty.departments.forEach(dept => {
            LawAIApp.AIFacultyManager.assignProfessorToDepartment(faculty.id, dept.name, prof.id);
          });
        }
      });
    });

    // 注册当前用户为学生
    if (faculties.length > 0) {
      LawAIApp.StudentTrackingSystem.enrollStudent(faculties[0].id);
    }

    console.log('University OS is now operational.');
  },

  // 获取大学完整状态
  getUniversityCatalog() {
    return {
      faculties: LawAIApp.AIFacultyManager.getFaculties(),
      professors: LawAIApp.AIProfessorEngine.getProfessors(),
      student: LawAIApp.StudentTrackingSystem.getCurrentStudent(),
      curriculum: LawAIApp.InstitutionalCurriculumEngine.getStudentSchedule()
    };
  }
};
