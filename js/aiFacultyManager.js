// ===========================================
// aiFacultyManager.js
// 管理学院（Faculties）和系（Departments），基于技能域划分
// ===========================================
LawAIApp.AIFacultyManager = {
  faculties: [],

  // 根据领域定义创建学院
  createFaculty(domainDef) {
    const facultyId = `faculty_${domainDef.id}`;
    const departments = domainDef.skills ? domainDef.skills.map(skill => ({
      id: `dept_${skill.name.toLowerCase().replace(/\s/g, '_')}`,
      name: skill.name,
      description: skill.description || `Department of ${skill.name}`,
      headAgent: null // 稍后分配教授
    })) : [];

    const faculty = {
      id: facultyId,
      name: domainDef.name,
      description: `Faculty of ${domainDef.name}`,
      departments,
      established: new Date().toISOString(),
      status: 'active'
    };

    this.faculties.push(faculty);
    LawAIApp.EventBus.emit('FacultyCreated', { faculty });
    return faculty;
  },

  // 分配教授（AI代理）到系
  assignProfessorToDepartment(facultyId, departmentName, agentId) {
    const faculty = this.faculties.find(f => f.id === facultyId);
    if (!faculty) return;
    const dept = faculty.departments.find(d => d.name === departmentName);
    if (dept) {
      dept.headAgent = agentId;
      LawAIApp.EventBus.emit('ProfessorAssigned', { facultyId, department: departmentName, agentId });
    }
  },

  getFaculties() { return this.faculties; }
};
