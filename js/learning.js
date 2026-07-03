// learning.js - 学习页面（Season 1.5 稳定版）
// ✅ 保留 Phase 1 + 2 全部功能：365节课生成、搜索、筛选、收藏、LocalStorage 持久化
// ✅ Phase 3 改动：点击课程卡片 → 打开 Lesson 详细页面，不再直接完成课程

LawAIApp.Learning = {
  // ========== Phase 1 原有属性 ==========
  lessons: LawAIApp.Data.generateLessons(),
  completed: LawAIApp.Storage.get('completedLessons', []),
  
  // ========== Phase 2 属性 ==========
  searchQuery: '',
  currentFilters: {
    category: '',
    difficulty: '',
    status: '',
    favorite: false
  },

  getFavorites() {
    return LawAIApp.Storage.get('favorites', []);
  },

  isFavorite(lessonId) {
    return this.getFavorites().includes(lessonId);
  },

  toggleFavorite(lessonId) {
    const favorites = this.getFavorites();
    const index = favorites.indexOf(lessonId);
    if (index === -1) {
      favorites.push(lessonId);
    } else {
      favorites.splice(index, 1);
    }
    LawAIApp.Storage.set('favorites', favorites);
    return favorites;
  },

  getFilteredLessons() {
    let filtered = this.lessons;

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      filtered = filtered.filter(lesson => {
        return (
          lesson.title.toLowerCase().includes(q) ||
          lesson.tags.some(tag => tag.toLowerCase().includes(q)) ||
          (lesson.category && lesson.category.toLowerCase().includes(q)) ||
          `day ${lesson.id}`.includes(q)
        );
      });
    }

    if (this.currentFilters.category) {
      filtered = filtered.filter(lesson => lesson.category === this.currentFilters.category);
    }

    if (this.currentFilters.difficulty) {
      filtered = filtered.filter(lesson => lesson.difficulty === this.currentFilters.difficulty);
    }

    if (this.currentFilters.status === 'completed') {
      filtered = filtered.filter(lesson => this.completed.includes(lesson.id));
    } else if (this.currentFilters.status === 'incomplete') {
      filtered = filtered.filter(lesson => !this.completed.includes(lesson.id));
    }

    if (this.currentFilters.favorite) {
      const favs = this.getFavorites();
      filtered = filtered.filter(lesson => favs.includes(lesson.id));
    }

    return filtered;
  },

  render() {
    const html = `
      <div class="page">
        <button class="back-btn" onclick="LawAIApp.Router.navigate('dashboard')" style="background:var(--card); border:none; color:var(--text); padding:0.5rem 1rem; border-radius:8px; cursor:pointer; margin-bottom:0.5rem; display:flex; align-items:center; gap:0.3rem; font-size:0.85rem;">
          ← Back
        </button>
        <h2>📚 365 AI Lessons</h2>
        
        <input 
          class="search-box" 
          id="lesson-search" 
          type="text" 
          placeholder="🔍 搜索课程标题、类别、标签..." 
          value="${this.searchQuery}"
        />
        
        <div class="filter-bar" style="display:flex; gap:0.5rem; margin:0.5rem 0 1rem; flex-wrap:wrap;">
          <select id="filter-category" class="quick-btn" style="font-size:0.8rem;">
            <option value="">📂 全部类别</option>
            ${this.getUniqueCategories().map(cat => 
              `<option value="${cat}" ${this.currentFilters.category === cat ? 'selected' : ''}>${cat}</option>`
            ).join('')}
          </select>
          
          <select id="filter-difficulty" class="quick-btn" style="font-size:0.8rem;">
            <option value="">📊 全部难度</option>
            <option value="Beginner" ${this.currentFilters.difficulty === 'Beginner' ? 'selected' : ''}>Beginner</option>
            <option value="Intermediate" ${this.currentFilters.difficulty === 'Intermediate' ? 'selected' : ''}>Intermediate</option>
            <option value="Advanced" ${this.currentFilters.difficulty === 'Advanced' ? 'selected' : ''}>Advanced</option>
          </select>
          
          <select id="filter-status" class="quick-btn" style="font-size:0.8rem;">
            <option value="">📋 全部状态</option>
            <option value="completed" ${this.currentFilters.status === 'completed' ? 'selected' : ''}>✅ 已完成</option>
            <option value="incomplete" ${this.currentFilters.status === 'incomplete' ? 'selected' : ''}>📖 未完成</option>
          </select>
          
          <button id="toggle-favorites" class="quick-btn" style="font-size:0.8rem; ${this.currentFilters.favorite ? 'background:var(--warning);color:#000;' : ''}">
            ⭐ 仅收藏
          </button>
        </div>

        <p style="color:var(--text-secondary); font-size:0.8rem; margin-bottom:0.5rem;" id="result-count"></p>
        <div class="lesson-list" id="lesson-list"></div>
      </div>
    `;

    document.getElementById('app').innerHTML = html;
    this.renderLessonList();
    this.attachEvents();
  },

  renderLessonList() {
    const list = document.getElementById('lesson-list');
    if (!list) return;

    const filteredLessons = this.getFilteredLessons();
    const countEl = document.getElementById('result-count');
    if (countEl) {
      countEl.textContent = `显示 ${filteredLessons.length} / ${this.lessons.length} 节课`;
    }

    list.innerHTML = '';

    if (filteredLessons.length === 0) {
      list.innerHTML = `
        <div style="text-align:center; padding:2rem; color:var(--text-secondary);">
          <p style="font-size:2rem;">🔍</p>
          <p>没有找到匹配的课程</p>
          <button class="quick-btn" id="clear-filters" style="margin-top:0.5rem;">清除所有筛选</button>
        </div>
      `;
      const clearBtn = document.getElementById('clear-filters');
      if (clearBtn) {
        clearBtn.addEventListener('click', () => this.clearAllFilters());
      }
      return;
    }

    filteredLessons.forEach(lesson => {
      const completed = this.completed.includes(lesson.id);
      const isFav = this.isFavorite(lesson.id);

      const item = document.createElement('div');
      item.className = `lesson-item ${completed ? 'completed' : ''}`;
      item.style.display = 'flex';
      item.style.justifyContent = 'space-between';
      item.style.alignItems = 'center';
      item.style.padding = '1rem';
      item.style.position = 'relative';

      item.innerHTML = `
        <div style="flex:1;">
          <div style="display:flex; align-items:center; gap:0.5rem;">
            <strong>${lesson.title}</strong>
            ${completed ? '<span style="font-size:0.8rem;">✅</span>' : ''}
          </div>
          <div style="display:flex; gap:0.8rem; margin-top:0.3rem;">
            <small style="color:var(--text-secondary);">⏱️ ${lesson.duration}</small>
            <small style="color:var(--text-secondary);">📊 ${lesson.difficulty || 'Beginner'}</small>
            <small style="color:var(--warning);">⭐ ${lesson.xpReward || 20} XP</small>
          </div>
          ${lesson.category ? `<small style="color:var(--primary); display:block; margin-top:0.2rem;">📂 ${lesson.category}</small>` : ''}
        </div>
        <div style="display:flex; align-items:center; gap:0.5rem; margin-left:0.5rem;">
          <span 
            class="favorite-icon" 
            data-lesson-id="${lesson.id}" 
            style="cursor:pointer; font-size:1.3rem; transition:0.2s; ${isFav ? '' : 'opacity:0.4;'}"
            title="${isFav ? '取消收藏' : '添加收藏'}"
          >
            ${isFav ? '⭐' : '☆'}
          </span>
          ${completed ? '<span style="font-size:0.9rem;">🏆</span>' : '<span style="color:var(--text-secondary);">▶️</span>'}
        </div>
      `;

      // 🔥 Phase 3 核心改动：主点击跳转到 Lesson 页面
      item.addEventListener('click', (e) => {
        if (e.target.closest('.favorite-icon')) return;
        LawAIApp.Router.navigate('lesson', { day: lesson.id });
      });

      // 收藏按钮独立事件
      const favIcon = item.querySelector('.favorite-icon');
      if (favIcon) {
        favIcon.addEventListener('click', (e) => {
          e.stopPropagation();
          this.toggleFavorite(lesson.id);
          const newFav = this.isFavorite(lesson.id);
          favIcon.textContent = newFav ? '⭐' : '☆';
          favIcon.style.opacity = newFav ? '1' : '0.4';
          favIcon.title = newFav ? '取消收藏' : '添加收藏';
          
          if (this.currentFilters.favorite && !newFav) {
            this.renderLessonList();
          }
        });
      }

      list.appendChild(item);
    });
  },

  getUniqueCategories() {
    const categories = new Set();
    this.lessons.forEach(lesson => {
      if (lesson.category) categories.add(lesson.category);
    });
    return Array.from(categories).sort();
  },

  attachEvents() {
    const searchInput = document.getElementById('lesson-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value;
        this.renderLessonList();
      });
    }

    const categorySelect = document.getElementById('filter-category');
    if (categorySelect) {
      categorySelect.addEventListener('change', (e) => {
        this.currentFilters.category = e.target.value;
        this.renderLessonList();
      });
    }

    const difficultySelect = document.getElementById('filter-difficulty');
    if (difficultySelect) {
      difficultySelect.addEventListener('change', (e) => {
        this.currentFilters.difficulty = e.target.value;
        this.renderLessonList();
      });
    }

    const statusSelect = document.getElementById('filter-status');
    if (statusSelect) {
      statusSelect.addEventListener('change', (e) => {
        this.currentFilters.status = e.target.value;
        this.renderLessonList();
      });
    }

    const favToggle = document.getElementById('toggle-favorites');
    if (favToggle) {
      favToggle.addEventListener('click', () => {
        this.currentFilters.favorite = !this.currentFilters.favorite;
        favToggle.style.background = this.currentFilters.favorite ? 'var(--warning)' : '';
        favToggle.style.color = this.currentFilters.favorite ? '#000' : '';
        this.renderLessonList();
      });
    }
  },

  clearAllFilters() {
    this.searchQuery = '';
    this.currentFilters = {
      category: '',
      difficulty: '',
      status: '',
      favorite: false
    };
    this.render();
  }
};
