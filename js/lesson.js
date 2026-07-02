// lesson.js - 每日学习页面核心
LawAIApp.LessonPage = {
  currentDay: null,

  render(params) {
    const day = params?.day || this.currentDay || 1;
    this.currentDay = day;

    const lesson = LawAIApp.LessonEngine.getLessonByDay(day);
    if (!lesson) {
      document.getElementById('app').innerHTML = '<p>Lesson not found.</p>';
      return;
    }

    const progress = LawAIApp.ProgressEngine.getProgress();
    const completed = progress.completedLessons.includes(lesson.lessonId);

    const html = `
      <div class="lesson-page">
        <div class="lesson-header">
          <div class="day">Day ${lesson.day} • ${lesson.duration}</div>
          <h2>${lesson.title}</h2>
          <p>${lesson.subtitle}</p>
          <div class="badges">
            <span class="badge">${lesson.category}</span>
            <span class="badge">${lesson.difficulty}</span>
            <span class="badge">XP +${lesson.xpReward}</span>
            ${completed ? '<span class="badge">✅ Completed</span>' : ''}
          </div>
        </div>

        <!-- Today's Goal -->
        <div class="section-card">
          <h3>🎯 Today's Goal</h3>
          <p>Understand the fundamentals of <strong>${lesson.category}</strong> and how it fits into AI workflows.</p>
        </div>

        <!-- Official Links -->
        <div class="section-card">
          <h3>🔗 Official Learning</h3>
          <div class="official-links">
            <a href="${lesson.officialArticle}" target="_blank" class="official-btn">📄 Official Article</a>
            <a href="${lesson.officialArticle}" target="_blank" class="official-btn">📘 Documentation</a>
            <a href="${lesson.officialVideo}" target="_blank" class="official-btn">▶️ Video</a>
          </div>
        </div>

        <!-- AI Summary -->
        ${LawAIApp.SummaryModule.generateHTML(lesson)}

        <!-- Practice -->
        ${LawAIApp.PracticeModule.generateHTML(lesson)}

        <!-- Quiz -->
        ${LawAIApp.QuizModule.generateHTML(lesson)}

        <!-- Notebook -->
        ${LawAIApp.NotebookModule.generateHTML(lesson)}

        <!-- Completion Button -->
        ${!completed ? `<button class="complete-btn">✅ Complete Lesson</button>` : '<p style="text-align:center;">🎉 You completed this lesson!</p>'}

        <!-- Navigation -->
        <div class="lesson-nav">
          <button id="prev-lesson" ${day <= 1 ? 'disabled' : ''}>⬅ Previous</button>
          <button id="next-lesson" ${day >= 365 ? 'disabled' : ''}>Next ➡</button>
        </div>
      </div>
    `;

    document.getElementById('app').innerHTML = html;

    // 绑定导航按钮
    document.getElementById('prev-lesson')?.addEventListener('click', () => {
      if (day > 1) LawAIApp.Router.navigate('lesson', { day: day - 1 });
    });
    document.getElementById('next-lesson')?.addEventListener('click', () => {
      if (day < 365) LawAIApp.Router.navigate('lesson', { day: day + 1 });
    });

    // 绑定完成按钮
    if (!completed) {
      LawAIApp.CompletionModule.attachEvent(lesson.lessonId);
    }

    // 保存笔记到 localStorage（简单处理，不覆盖引擎）
    const noteSaveBtn = document.querySelector('.section-card button');
    if (noteSaveBtn) {
      noteSaveBtn.addEventListener('click', () => {
        const noteArea = document.querySelector('.note-field');
        if (noteArea.value.trim()) {
          alert('Note saved locally!');
        }
      });
    }
  }
};
