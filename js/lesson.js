// lesson.js - 每日学习页面核心
// Season 1.5 升级：增加空状态占位符、收藏/书签、返回按钮
LawAIApp.LessonPage = {
  currentDay: null,

  render(params) {
    const day = params?.day || this.currentDay || 1;
    this.currentDay = day;

    const lesson = LawAIApp.LessonEngine.getLessonByDay(day);
    if (!lesson) {
      // ========== Season 1.5 新增：课程未找到空状态 ==========
      const app = document.getElementById('app');
      app.innerHTML = LawAIApp.EmptyStates
        ? LawAIApp.EmptyStates.render('search', 'Lesson not found. Please check the lesson number.')
        : '<p style="text-align:center; padding:2rem;">Lesson not found.</p>';
      return;
    }

    const progress = LawAIApp.ProgressEngine.getProgress();
    const completed = progress.completedLessons.includes(lesson.lessonId);

    // ========== Season 1.5 新增：收藏和书签状态 ==========
    const isBookmarked = LawAIApp.Bookmark
      ? LawAIApp.Bookmark.isBookmarked(lesson.lessonId, 'lesson')
      : false;
    const isFavorited = LawAIApp.Bookmark
      ? LawAIApp.Bookmark.isBookmarked(lesson.lessonId, 'lesson_favorite')
      : false;

    const html = `
      <div class="lesson-page">
        <!-- ========== Season 1.5 新增：返回按钮 ========== -->
        <div style="margin-bottom: 1rem;">
          <button class="quick-btn" onclick="LawAIApp.Router.navigate('learning')" style="font-size:0.85rem;">
            ← Back to Learning
          </button>
        </div>

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
          <!-- ========== Season 1.5 新增：收藏和书签按钮 ========== -->
          <div style="margin-top: 0.8rem; display: flex; gap: 0.5rem;">
            <button class="official-btn" id="bookmark-btn" style="font-size:0.8rem;">
              ${isBookmarked ? '🔖 Bookmarked' : '🏷️ Bookmark'}
            </button>
            <button class="official-btn" id="favorite-btn" style="font-size:0.8rem;">
              ${isFavorited ? '⭐ Favorited' : '☆ Favorite'}
            </button>
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
        ${!completed
          ? `<button class="complete-btn">✅ Complete Lesson</button>`
          : '<p style="text-align:center;">🎉 You completed this lesson!</p>'
        }

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

    // ========== Season 1.5 新增：绑定收藏和书签按钮 ==========
    const bookmarkBtn = document.getElementById('bookmark-btn');
    const favoriteBtn = document.getElementById('favorite-btn');

    if (bookmarkBtn) {
      bookmarkBtn.addEventListener('click', () => {
        if (LawAIApp.Bookmark) {
          LawAIApp.Bookmark.toggle(lesson.lessonId, 'lesson');
          const updated = LawAIApp.Bookmark.isBookmarked(lesson.lessonId, 'lesson');
          bookmarkBtn.textContent = updated ? '🔖 Bookmarked' : '🏷️ Bookmark';
          if (LawAIApp.Toast) {
            LawAIApp.Toast.show(
              updated ? 'Lesson bookmarked' : 'Bookmark removed',
              updated ? 'success' : 'info'
            );
          }
        }
      });
    }

    if (favoriteBtn) {
      favoriteBtn.addEventListener('click', () => {
        if (LawAIApp.Bookmark) {
          LawAIApp.Bookmark.toggle(lesson.lessonId, 'lesson_favorite');
          const updated = LawAIApp.Bookmark.isBookmarked(lesson.lessonId, 'lesson_favorite');
          favoriteBtn.textContent = updated ? '⭐ Favorited' : '☆ Favorite';
          if (LawAIApp.Toast) {
            LawAIApp.Toast.show(
              updated ? 'Added to favorites' : 'Removed from favorites',
              updated ? 'success' : 'info'
            );
          }
        }
      });
    }

    // 保存笔记到 localStorage（简单处理，不覆盖引擎）
    const noteSaveBtn = document.querySelector('.section-card button');
    if (noteSaveBtn) {
      noteSaveBtn.addEventListener('click', () => {
        const noteArea = document.querySelector('.note-field');
        if (noteArea && noteArea.value.trim()) {
          if (LawAIApp.Toast) {
            LawAIApp.Toast.show('Note saved locally!', 'success');
          } else {
            alert('Note saved locally!');
          }
        }
      });
    }
  }
};
