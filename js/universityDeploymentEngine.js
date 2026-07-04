// ===========================================
// universityDeploymentEngine.js
// 大学部署引擎：初始化并启动一所或多所AI大学
// ===========================================
LawAIApp.UniversityDeploymentEngine = {
  deployedUniversities: [],

  // 部署一所大学
  deployUniversity(name, faculties = null) {
    const university = {
      id: `uni_${Date.now()}`,
      name: name || 'Law AI University',
      established: new Date().toISOString(),
      status: 'active'
    };

    // 如果未提供学院列表，则使用默认轨道
    if (!faculties) {
      // 确保大学OS核心已初始化
      if (LawAIApp.AIFacultyManager.getFaculties().length === 0) {
        LawAIApp.UniversityOSCore.init();
      }
      university.faculties = LawAIApp.AIFacultyManager.getFaculties();
    } else {
      faculties.forEach(f => LawAIApp.AIFacultyManager.createFaculty(f));
      university.faculties = faculties;
    }

    this.deployedUniversities.push(university);
    LawAIApp.EventBus.emit('UniversityDeployed', { university });
    return university;
  },

  // 获取所有已部署的大学
  getUniversities() {
    return this.deployedUniversities;
  },

  // 启动默认大学
  launchDefaultUniversity() {
    return this.deployUniversity('Law AI Academy University');
  }
};
