// lessonView.js
LawAIApp.LessonView = {
  render(lessonId) {
    // 查找课程数据
    let lesson = null;
    const allModules = LawAIApp.ModuleData.modules;
    for (const mod of allModules) {
      const lessons = LawAIApp.LessonData.getLessonsByModule(mod.id);
      const found = lessons.find(l => l.lessonId === lessonId);
      if (found) {
        lesson = found;
        break;
      }
    }
    if (!lesson) {
      document.getElementById('app').innerHTML = '<p>Lesson not found.</p>';
      return;
    }

    // 获取模块进度（用于判断是否已完成）
    const modProgress = LawAIApp.ModuleProgress.get(lesson.moduleId);
    const completed = modProgress.completedLessons.includes(lessonId);

    const html = `
      <div class="page">
        <button class="back-btn" onclick="LawAIApp.Router.navigate('module', { moduleId: '${lesson.moduleId}' })" style="...">← Back to Module</button>

        <div class="lesson-header" style="background: linear-gradient(135deg, #3b82f6, #6366f1); padding:1.5rem; border-radius:16px; color:white; margin-bottom:1rem;">
          <div class="day">${lesson.difficulty} · ⏱️ ${lesson.estimatedMinutes} min · ⭐ ${lesson.estimatedXP} XP</div>
          <h2>${lesson.title}</h2>
          <p>${lesson.description}</p>
          <div class="badges">
            <span class="badge">${lesson.tags.join(', ')}</span>
            ${completed ? '<span class="badge">✅ Completed</span>' : ''}
          </div>
        </div>

        <!-- Today's Goal -->
        <div class="section-card">
          <h3>🎯 Learning Objective</h3>
          <p>Understand the core idea behind "${lesson.shortTitle}".</p>
        </div>

        <!-- Lesson Content Placeholder -->
        <div class="section-card">
          <h3>📖 Main Content</h3>
          <p>The lesson content will be displayed here. (Coming in next phase)</p>
        </div>

        <!-- AI Summary -->
        <div class="section-card">
          <h3>🤖 AI Summary</h3>
          <p>AI-generated summary placeholder.</p>
        </div>

        <!-- Memory Hook -->
        <div class="section-card">
          <h3>🧠 Memory Hook</h3>
          <p>Remember: ${lesson.keywords.join(', ')}</p>
        </div>

        <!-- Reflection -->
        <div class="section-card">
          <h3>💭 Reflection</h3>
          <p>What is one AI example you encountered today?</p>
        </div>

        <!-- Complete Button -->
        ${!completed ? `
          <button class="complete-btn" id="complete-lesson-btn" style="background: var(--success); color: white; border: none; padding: 1rem; border-radius: 12px; width: 100%; margin-top: 1rem; font-size: 1rem; cursor: pointer;">
            ✅ Complete Lesson
          </button>
        ` : '<p style="text-align:center; margin:1rem 0;">🎉 You have completed this lesson!</p>'}

        <!-- Navigation -->
        <div class="lesson-nav" style="display:flex; justify-content:space-between; margin-top:1rem;">
          <button class="quick-btn" onclick="alert('Previous')">← Previous</button>
          <button class="quick-btn" onclick="alert('Next')">Next →</button>
        </div>
      </div>
    `;

    document.getElementById('app').innerHTML = html;

    // 绑定完成按钮
    const completeBtn = document.getElementById('complete-lesson-btn');
    if (completeBtn) {
      completeBtn.addEventListener('click', () => {
        // 1. 标记模块进度
        LawAIApp.ModuleProgress.completeLesson(lesson.moduleId, lesson.lessonId);
        // 2. 授予 XP（调用 XPEngine）
        if (LawAIApp.XPEngine) {
          LawAIApp.XPEngine.awardXP('lesson_completion', lesson.lessonId);
        }
        // 3. 添加到复习队列
        if (LawAIApp.ReviewQueue) {
          LawAIApp.ReviewQueue.addLessonToReview(lesson.lessonId);
        }
        // 4. 创建第二大脑条目
        if (LawAIApp.SecondBrain) {
          LawAIApp.SecondBrain.getEntry(lesson.lessonId);
        }
        // 5. 更新记忆引擎
        if (LawAIApp.MemoryEngine) {
          LawAIApp.MemoryEngine.getMemoryStrength(lesson.lessonId); // 会触发内部更新
        }
        // 6. 发射事件
        LawAIApp.EventBus.emit('LessonCompleted', { lessonId: lesson.lessonId });
        // 7. 重新渲染页面以显示已完成状态
        this.render(lesson.lessonId);
      });
    }
  }
};
