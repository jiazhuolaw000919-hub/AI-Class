// ===========================================
// globalEducationNetworkEngine.js
// 全球教育网络引擎主控：启动网络，连接所有大学
// ===========================================
LawAIApp.GlobalEducationNetworkEngine = {
  init() {
    // 1. 注册当前部署的大学
    const universities = LawAIApp.UniversityDeploymentEngine.getUniversities();
    universities.forEach(uni => LawAIApp.UniversityInterconnectLayer.registerUniversity(uni));

    // 2. 如果尚未部署大学，则先部署默认大学
    if (universities.length === 0) {
      const defaultUni = LawAIApp.UniversityDeploymentEngine.launchDefaultUniversity();
      LawAIApp.UniversityInterconnectLayer.registerUniversity(defaultUni);
    }

    // 3. 加载并同步全球技能图谱
    LawAIApp.UniversalSkillGraph.importFromLocalGraph();

    // 4. 创建全球成绩单（当前用户）
    const student = LawAIApp.StudentTrackingSystem.getCurrentStudent();
    LawAIApp.CrossUniversityCreditSystem.createGlobalTranscript(student.id);

    // 5. 首次数据交换
    LawAIApp.UniversityInterconnectLayer.exchangeData();

    // 6. 定期同步（每10分钟）
    setInterval(() => {
      LawAIApp.UniversityInterconnectLayer.exchangeData();
    }, 600000);

    console.log('Global AI Education Network Protocol is active.');
  },

  // 获取网络摘要
  getNetworkSummary() {
    return {
      connectedUniversities: LawAIApp.UniversityInterconnectLayer.getNetwork(),
      consensus: LawAIApp.EducationConsensusEngine.generateConsensus(),
      skillStandards: LawAIApp.UniversalSkillGraph.exportSkillStandards(),
      studentTranscript: LawAIApp.CrossUniversityCreditSystem._transcripts
    };
  }
};
