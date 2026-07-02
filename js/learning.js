// learning.js - 学习页面（Phase 2 完整升级版）
// ✅ 保留 Phase 1 全部旧功能：365节课自动生成、点击完成标记、LocalStorage 持久化
// ✅ 新增 Phase 2 功能：搜索、筛选、收藏、Streak更新、成就联动、进度引擎联动

LawAIApp.Learning = {
  // ========== Phase 1 原有属性（保留） ==========
  lessons: LawAIApp.Data.generateLessons(),
  completed: LawAIApp.Storage.get('completedLessons', []),
  
  // ========== Phase 2 新增属性 ==========
  searchQuery: '',
  currentFilters: {
    category: '',
    difficulty: '',
    status: '',     // 'completed' | 'incomplete' | ''
    favorite: false
  },

  // ========== Phase 2 新增：获取收藏列表 ==========
  getFavorites() {
    return LawAIApp.Storage.get('favorites', []);
  },

  // ========== Phase 2 新增：检查是否收藏 ==========
  isFavorite(lessonId) {
    const favorites = this.getFavorites();
    return favorites.includes(lessonId);
  },

  // ========== Phase 2 新增：切换收藏状态 ==========
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

  // ========== Phase 2 新增：搜索+筛选+收藏过滤 ==========
  getFilteredLessons() {
    let filtered = this.lessons;

    // 文本搜索（标题、类别、标签、天数）
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

    // 类别筛选
    if (this.currentFilters.category) {
      filtered = filtered.filter(lesson => lesson.category === this.currentFilters.category);
    }

    // 难度筛选
    if (this.currentFilters.difficulty) {
      filtered = filtered.filter(lesson => lesson.difficulty === this.currentFilters.difficulty);
    }

    // 状态筛选（完成/未完成）
    if (this.currentFilters.status === 'completed') {
      filtered = filtered.filter(lesson => this.completed.includes(lesson.id));
    } else if (this.currentFilters.status === 'incomplete') {
      filtered = filtered.filter(lesson => !this.completed.includes(lesson.id));
    }

    // 收藏筛选
    if (this.currentFilters.favorite) {
      const favs = this.getFavorites();
      filtered = filtered.filter(lesson => favs.includes(lesson.id));
    }

    return filtered;
  },

  // ========== Phase 1 原有方法（完全保留逻辑，升级联动引擎） ==========
  render() {
    const html = `
      <div class="page">
        <h2>📚 365 AI Lessons</h2>
        
        <!-- Phase 2 新增：搜索框 -->
        <input 
          class="search-box" 
          id="lesson-search" 
          type="text" 
          placeholder="🔍 搜索课程标题、类别、标签..." 
          value="${this.searchQuery}"
        />
        
        <!-- Phase 2 新增：过滤器栏 -->
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

        <!-- Phase 2 新增：结果计数 -->
        <p style="color:var(--text-secondary); font-size:0.8rem; margin-bottom:0.5rem;" id="result-count"></p>
        
        <!-- Phase 1 原有：课程列表容器 -->
        <div class="lesson-list" id="lesson-list"></div>
      </div>
    `;

    document.getElementById('app').innerHTML = html;

    // Phase 1 原有：渲染课程列表
    this.renderLessonList();

    // Phase 2 新增：绑定事件
    this.attachEvents();
  },

  // ========== Phase 1 原有方法（升级版：支持筛选后的列表） ==========
  renderLessonList() {
    const list = document.getElementById('lesson-list');
    if (!list) return;

    // Phase 2 升级：使用筛选后的课程
    const filteredLessons = this.getFilteredLessons();
    
    // Phase 2 新增：更新结果计数
    const countEl = document.getElementById('result-count');
    if (countEl) {
      countEl.textContent = `显示 ${filteredLessons.length} / ${this.lessons.length} 节课`;
    }

    // 清空列表
    list.innerHTML = '';

    // 无结果提示
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
        clearBtn.addEventListener('click', () => {
          this.clearAllFilters();
        });
      }
      return;
    }

    // Phase 1 原有逻辑：逐个渲染课程卡片（Phase 2 升级：添加收藏按钮和更多信息）
    filteredLessons.forEach(lesson => {
      const completed = this.completed.includes(lesson.id);
      const isFav = this.isFavorite(lesson.id);
      
      // 使用 Phase 1 原有组件方法创建基础卡片
      const item = LawAIApp.Components.lessonItem(lesson, completed);
      
      // Phase 2 升级：增强卡片样式，添加收藏按钮和额外信息
      item.style.display = 'flex';
      item.style.justifyContent = 'space-between';
      item.style.alignItems = 'center';
      item.style.padding = '1rem';
      item.style.position = 'relative';
      
      // 重写卡片内容
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

      // Phase 1 原有：点击卡片完成/取消完成课程
      item.addEventListener('click', (e) => {
        // 如果点击的是收藏图标，不触发完成逻辑
        if (e.target.closest('.favorite-icon')) return;
        
        if (!completed) {
          // Phase 1 原有：添加到已完成列表
          this.completed.push(lesson.id);
          LawAIApp.Storage.set('completedLessons', this.completed);
          
          // Phase 2 新增：联动进度引擎
          if (LawAIApp.ProgressEngine) {
            LawAIApp.ProgressEngine.completeLesson(lesson.lessonId || `day-${lesson.id}`);
          }
          
          // Phase 2 新增：更新连续签到
          if (LawAIApp.StreakEngine) {
            LawAIApp.StreakEngine.updateStreak();
          }
          
          // Phase 2 新增：检查成就
          if (LawAIApp.AchievementEngine) {
            LawAIApp.AchievementEngine.checkAll();
          }
          
          // 重新渲染
          this.render();
        } else {
          // Phase 2 新增：允许取消完成（按住Alt点击）
          if (e.altKey) {
            const index = this.completed.indexOf(lesson.id);
            if (index > -1) {
              this.completed.splice(index, 1);
              LawAIApp.Storage.set('completedLessons', this.completed);
              
              // 同步更新所有课程数据
              if (LawAIApp.LessonEngine) {
                const allLessons = LawAIApp.LessonEngine.getAllLessons();
                const targetLesson = allLessons.find(l => l.lessonId === `day-${lesson.id}`);
                if (targetLesson) {
                  targetLesson.completed = false;
                  targetLesson.completedDate = null;
                  LawAIApp.Storage.set('allLessons', allLessons);
                }
              }
              
              this.render();
            }
          }
        }
      });

      // Phase 2 新增：收藏按钮独立事件
      const favIcon = item.querySelector('.favorite-icon');
      if (favIcon) {
        favIcon.addEventListener('click', (e) => {
          e.stopPropagation(); // 阻止冒泡到卡片点击
          this.toggleFavorite(lesson.id);
          // 局部更新收藏图标
          const newFav = this.isFavorite(lesson.id);
          favIcon.textContent = newFav ? '⭐' : '☆';
          favIcon.style.opacity = newFav ? '1' : '0.4';
          favIcon.title = newFav ? '取消收藏' : '添加收藏';
          
          // 如果正在收藏筛选模式下，重新渲染列表
          if (this.currentFilters.favorite && !newFav) {
            this.renderLessonList();
          }
        });
      }

      list.appendChild(item);
    });
  },

  // ========== Phase 2 新增：获取所有唯一类别 ==========
  getUniqueCategories() {
    const categories = new Set();
    this.lessons.forEach(lesson => {
      if (lesson.category) categories.add(lesson.category);
    });
    return Array.from(categories).sort();
  },

  // ========== Phase 2 新增：绑定搜索和筛选事件 ==========
  attachEvents() {
    // 搜索框事件
    const searchInput = document.getElementById('lesson-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value;
        this.renderLessonList();
      });
    }

    // 类别筛选
    const categorySelect = document.getElementById('filter-category');
    if (categorySelect) {
      categorySelect.addEventListener('change', (e) => {
        this.currentFilters.category = e.target.value;
        this.renderLessonList();
      });
    }

    // 难度筛选
    const difficultySelect = document.getElementById('filter-difficulty');
    if (difficultySelect) {
      difficultySelect.addEventListener('change', (e) => {
        this.currentFilters.difficulty = e.target.value;
        this.renderLessonList();
      });
    }

    // 状态筛选
    const statusSelect = document.getElementById('filter-status');
    if (statusSelect) {
      statusSelect.addEventListener('change', (e) => {
        this.currentFilters.status = e.target.value;
        this.renderLessonList();
      });
    }

    // 收藏筛选按钮
    const favToggle = document.getElementById('toggle-favorites');
    if (favToggle) {
      favToggle.addEventListener('click', () => {
        this.currentFilters.favorite = !this.currentFilters.favorite;
        // 更新按钮样式
        if (this.currentFilters.favorite) {
          favToggle.style.background = 'var(--warning)';
          favToggle.style.color = '#000';
        } else {
          favToggle.style.background = '';
          favToggle.style.color = '';
        }
        this.renderLessonList();
      });
    }
  },

  // ========== Phase 2 新增：清除所有筛选 ==========
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
