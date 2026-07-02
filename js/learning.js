LawAIApp.Learning = {
  lessons: LawAIApp.Data.generateLessons(),
  completed: LawAIApp.Storage.get('completedLessons', []),
  render() {
    const html = `
      <div class="page">
        <h2>📚 365 AI Lessons</h2>
        <div class="lesson-list" id="lesson-list"></div>
      </div>
    `;
    document.getElementById('app').innerHTML = html;
    const list = document.getElementById('lesson-list');
    this.lessons.forEach(lesson => {
      const completed = this.completed.includes(lesson.id);
      const item = LawAIApp.Components.lessonItem(lesson, completed);
      item.addEventListener('click', () => {
        if (!completed) {
          this.completed.push(lesson.id);
          LawAIApp.Storage.set('completedLessons', this.completed);
          this.render();
        }
      });
      list.appendChild(item);
    });
  }
};
