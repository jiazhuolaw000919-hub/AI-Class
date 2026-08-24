// practiceView.js
LawAIApp.PracticeView = {
  render(practiceId) {
    // 查找实践任务
    let practice = null;
    const allModules = LawAIApp.ModuleData.modules;
    for (const mod of allModules) {
      const practices = LawAIApp.PracticeData.getPracticesByModule(mod.id);
      const found = practices.find(p => p.practiceId === practiceId);
      if (found) {
        practice = found;
        break;
      }
    }
    if (!practice) {
      document.getElementById('app').innerHTML = '<p>Practice not found.</p>';
      return;
    }

    // 获取模块进度（判断实践是否已完成）
    const modProgress = LawAIApp.ModuleProgress.get(practice.moduleId);
    const completed = modProgress.practiceCompleted && modProgress.completedPractices?.includes(practiceId);

    const html = `
      <div class="page">
        <button class="back-btn" onclick="LawAIApp.Router.navigate('module', { moduleId: '${practice.moduleId}' })" style="background:var(--card); border:none; color:var(--text); padding:0.5rem 1rem; border-radius:8px; cursor:pointer; margin-bottom:1rem; display:flex; align-items:center; gap:0.3rem; font-size:0.85rem;">
          ← Back to Module
        </button>

        <div class="lesson-header" style="background: linear-gradient(135deg, #f59e0b, #f97316); padding:1.5rem; border-radius:16px; color:white; margin-bottom:1rem;">
          <h2>⚡ Practice</h2>
          <h3>${practice.title}</h3>
          <p>${practice.description}</p>
          <div style="margin-top:0.5rem;">
            <span class="badge">⏱️ ${practice.estimatedMinutes} min</span>
            <span class="badge">⭐ ${practice.estimatedXP} XP</span>
            <span class="badge">📊 ${practice.difficulty}</span>
          </div>
        </div>

        <!-- Objectives -->
        <div class="section-card">
          <h3>🎯 Objectives</h3>
          <ul>
            ${practice.objectives.map(o => `<li>${o}</li>`).join('')}
          </ul>
          <p><strong>Success Criteria:</strong> ${practice.successCriteria}</p>
        </div>

        <!-- Task -->
        <div class="section-card">
          <h3>📝 Your Task</h3>
          <p>${practice.description}</p>
          ${practice.hints ? `
            <details style="margin-top:0.5rem;">
              <summary style="cursor:pointer; color:var(--primary);">💡 Hints</summary>
              <ul>
                ${practice.hints.map(h => `<li>${h}</li>`).join('')}
              </ul>
            </details>
          ` : ''}
          <textarea id="practice-response" class="note-field" placeholder="Write your answer or reflection here..." style="margin-top:1rem; min-height:120px;"></textarea>
          <p style="font-size:0.8rem; color:var(--text-secondary); margin-top:0.5rem;">💭 Self-evaluation: Did your response meet the success criteria?</p>
          <div style="display:flex; gap:0.5rem; margin-top:0.5rem;">
            <button id="self-eval-yes" class="quick-btn">✅ Yes</button>
            <button id="self-eval-partial" class="quick-btn">🤔 Partially</button>
            <button id="self-eval-no" class="quick-btn">❌ Not yet</button>
          </div>
          <input type="hidden" id="self-eval-result" value="">
        </div>

        <!-- AI Feedback Placeholder -->
        <div class="section-card">
          <h3>🤖 AI Feedback</h3>
          <p style="color:var(--text-secondary);">AI feedback will appear here in a future update.</p>
        </div>

        <!-- Complete Button -->
        ${!completed ? `
          <button class="complete-btn" id="complete-practice-btn" style="background: var(--success); color: white; border: none; padding: 1rem; border-radius: 12px; width: 100%; margin-top: 1rem; font-size: 1rem; cursor: pointer;">
            ✅ Complete Practice
          </button>
        ` : '<p style="text-align:center; margin:1rem 0;">🎉 Practice completed!</p>'}
      </div>
    `;

    document.getElementById('app').innerHTML = html;

    // 自我评估按钮事件
    const selfEvalButtons = ['self-eval-yes', 'self-eval-partial', 'self-eval-no'];
    const resultInput = document.getElementById('self-eval-result');
    selfEvalButtons.forEach(id => {
      const btn = document.getElementById(id);
      if (btn) {
        btn.addEventListener('click', () => {
          // 重置所有按钮样式
          selfEvalButtons.forEach(bid => {
            const b = document.getElementById(bid);
            if (b) b.style.background = '';
          });
          btn.style.background = 'var(--primary)';
          if (id === 'self-eval-yes') resultInput.value = 'completed';
          else if (id === 'self-eval-partial') resultInput.value = 'partial';
          else resultInput.value = 'not_yet';
        });
      }
    });

    // 完成按钮事件
    const completeBtn = document.getElementById('complete-practice-btn');
    if (completeBtn) {
      completeBtn.addEventListener('click', () => {
        const response = document.getElementById('practice-response')?.value.trim();
        const evalResult = resultInput.value;

        if (!response || !evalResult) {
          alert('Please write a response and select a self-evaluation.');
          return;
        }

        // 1. 标记模块实践完成
        LawAIApp.ModuleProgress.completePractice(practice.moduleId);
        // 记录具体实践ID完成
        const prog = LawAIApp.ModuleProgress.get(practice.moduleId);
        if (!prog.completedPractices) prog.completedPractices = [];
        if (!prog.completedPractices.includes(practiceId)) {
          prog.completedPractices.push(practiceId);
          LawAIApp.ModuleProgress.save(practice.moduleId, prog);
        }

        // 2. 发放 XP
        if (LawAIApp.XPEngine) {
          LawAIApp.XPEngine.awardXP('practice_completion', practice.lessonId || practice.practiceId);
        }

        // 3. 添加到复习队列（简单记录）
        if (LawAIApp.ReviewQueue) {
          LawAIApp.ReviewQueue.addLessonToReview(practice.practiceId);
        }

        // 4. 更新第二大脑（如果有课程关联）
        if (LawAIApp.SecondBrain && practice.lessonId) {
          LawAIApp.SecondBrain.getEntry(practice.lessonId);
        }

        // 5. 发射事件
        LawAIApp.EventBus.emit('PracticeCompleted', { practiceId, lessonId: practice.lessonId });

        // 重新渲染
        this.render(practiceId);
      });
    }
  }
};
