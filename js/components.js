LawAIApp.Components = {
  card(content, className = '') {
    const div = document.createElement('div');
    div.className = `widget-card ${className}`;
    if (typeof content === 'string') div.innerHTML = content;
    else div.appendChild(content);
    return div;
  },

  button(text, onClick, className = '') {
    const btn = document.createElement('button');
    btn.className = `quick-btn ${className}`;
    btn.textContent = text;
    if (onClick) btn.addEventListener('click', onClick);
    return btn;
  },

  progressBar(value, max, cls = 'xp-bar') {
    const bar = document.createElement('div');
    bar.className = cls;
    const fill = document.createElement('div');
    fill.className = 'xp-fill';
    fill.style.width = Math.min(100, (value/max)*100) + '%';
    bar.appendChild(fill);
    return bar;
  },

  lessonItem(lesson, completed = false) {
    const div = document.createElement('div');
    div.className = `lesson-item ${completed ? 'completed' : ''}`;
    div.innerHTML = `<span>${lesson.title}</span><span style="color:var(--text-secondary)">${lesson.duration}</span>`;
    return div;
  }
};
