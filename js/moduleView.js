<!-- Projects Section -->
<div style="margin-top:1rem;">
  <h4>🚀 Projects</h4>
  ${(() => {
    const projects = LawAIApp.SmartProjectData.getProjectsByModule(moduleId);
    if (projects.length === 0) return '<p style="color:var(--text-secondary); font-size:0.9rem;">No projects for this module yet.</p>';
    return projects.map(p => `
      <div class="lesson-item" style="justify-content:space-between; padding:0.5rem 0.8rem; cursor:pointer;" onclick="LawAIApp.Router.navigate('smart-project', { projectId: '${p.projectId}' })">
        <div>
          <strong>${p.title}</strong>
          <small style="color:var(--text-secondary); display:block;">⏱️ ${p.estimatedHours}h · ⭐ ${p.estimatedXP} XP</small>
        </div>
        <span>▶️</span>
      </div>
    `).join('');
  })()}
</div>
