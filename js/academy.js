// academy.js
LawAIApp.AcademyPage = {
  render() {
    const current = LawAIApp.AcademyStorage.getCurrentAcademy();
    const all = LawAIApp.AcademyData.academies;

    const html = `
      <div class="academy-page">
        <button class="back-btn" onclick="LawAIApp.Router.navigate('dashboard')" style="background:var(--card); border:none; color:var(--text); padding:0.5rem 1rem; border-radius:8px; cursor:pointer; margin-bottom:0.5rem; display:flex; align-items:center; gap:0.3rem; font-size:0.85rem;">
          ← Back
        </button>
        <!-- Continue Learning Card -->
        ${current ? `
          <div class="continue-card" id="continue-learning-card">
            <div class="academy-icon">${current.icon}</div>
            <h2>${current.title}</h2>
            <p>${current.description}</p>
            ${current.status === 'active' ? `
              <p><strong>Day ${current.currentLesson}</strong> · ${current.completedLessons}/${current.totalLessons} lessons · ${current.progressPercent.toFixed(1)}%</p>
              <div class="progress-bar">
                <div class="progress-fill" style="width:${current.progressPercent}%"></div>
              </div>
              <p style="margin-top:0.5rem;">⭐ ${current.xp} XP · 🔥 Level ${LawAIApp.LevelEngine.calculateLevel().level}</p>
              <button class="quick-btn" style="background:white; color:var(--primary); margin-top:0.5rem;">Continue Learning →</button>
            ` : `<p><em>Status: ${current.status.replace('_',' ')}</em></p>`}
          </div>
        ` : ''}

        <!-- Academy Grid -->
        <h3>Explore Academies</h3>
        <div class="academy-grid" id="academy-grid"></div>
      </div>
    `;

    document.getElementById('app').innerHTML = html;

    // 渲染所有 academy 卡片
    const grid = document.getElementById('academy-grid');
    all.forEach(academy => {
      const isActive = academy.status === 'active';
      const progress = isActive ? LawAIApp.ProgressEngine.getProgress() : null;
      const percent = progress ? progress.completionPercent : 0;
      const completed = progress ? progress.completedLessons.length : 0;
      const total = academy.totalLessons;

      const card = document.createElement('div');
      card.className = 'academy-card';
      card.innerHTML = `
        <div class="icon">${academy.icon}</div>
        <div class="title">${academy.title}</div>
        <div class="desc">${academy.description}</div>
        <div class="progress-bar">
          <div class="progress-fill" style="width:${percent}%"></div>
        </div>
        <small>${completed}/${total} lessons</small>
        <div style="margin-top:0.5rem;">
          <span class="status-badge ${academy.status === 'active' ? 'status-active' : academy.status === 'coming_soon' ? 'status-coming' : 'status-locked'}">
            ${academy.status === 'active' ? 'Active' : academy.status === 'coming_soon' ? 'Coming Soon' : 'Locked'}
          </span>
        </div>
        ${isActive ? '<button class="quick-btn" style="margin-top:0.5rem;">Open</button>' : ''}
      `;

      card.addEventListener('click', (e) => {
        // 不要触发内部按钮的二次事件
        if (e.target.tagName === 'BUTTON') return;
        this.handleAcademyClick(academy);
      });

      if (isActive) {
        const btn = card.querySelector('button');
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.handleAcademyClick(academy);
        });
      }

      grid.appendChild(card);
    });

    // 大 Continue 卡片点击
    const continueCard = document.getElementById('continue-learning-card');
    if (continueCard) {
      continueCard.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') return; // 按钮有自己的事件
        if (current && current.status === 'active') {
          LawAIApp.Router.navigate('learning');
        }
      });
      const contBtn = continueCard.querySelector('button');
      if (contBtn) {
        contBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (current && current.status === 'active') {
            LawAIApp.Router.navigate('learning');
          }
        });
      }
    }
  },

  handleAcademyClick(academy) {
    if (academy.id === 'academy_ai_foundation') {
      LawAIApp.Router.navigate('academy-dashboard');
    } else if (academy.status === 'active') {
      LawAIApp.AcademyStorage.setActiveAcademy(academy.id);
      LawAIApp.Router.navigate('learning');
    } else if (academy.status === 'coming_soon') {
      alert('Coming Soon');
    } else if (academy.status === 'locked') {
      alert('Locked');
    } else if (academy.status === 'completed') {
      alert('Review Mode (Coming Soon)');
    }
  }
};
