// ===========================================
// aiProfessorEngine.js
// 将AI代理映射为教授，赋予教学风格和领域专长
// ===========================================
LawAIApp.AIProfessorEngine = {
  professors: [],

  // 从现有代理创建教授
  recruitProfessor(agentName, domainExpertise, teachingStyle) {
    const agent = LawAIApp.AgentOrchestrator?.agents?.find(a => a.name === agentName);
    if (!agent) return null;
    const professor = {
      id: `prof_${agentName}`,
      name: agentName,
      role: agent.role,
      domainExpertise,
      teachingStyle,
      activeCourses: [],
      recruitedAt: new Date().toISOString()
    };
    this.professors.push(professor);
    LawAIApp.EventBus.emit('ProfessorRecruited', { professor });
    return professor;
  },

  // 默认招募所有代理为教授
  recruitAllAgents() {
    const expertiseMap = {
      'MentorAgent': { domain: 'AI & Machine Learning', style: 'mentor' },
      'ReviewerAgent': { domain: 'Quality Assurance', style: 'analyst' },
      'PlannerAgent': { domain: 'Productivity Systems', style: 'planner' },
      'StrategyAgent': { domain: 'Business & Strategy', style: 'strategist' },
      'MemoryAgent': { domain: 'Learning Science', style: 'coach' }
    };
    Object.keys(expertiseMap).forEach(agentName => {
      const exp = expertiseMap[agentName];
      this.recruitProfessor(agentName, exp.domain, exp.style);
    });
  },

  getProfessors() { return this.professors; }
};
