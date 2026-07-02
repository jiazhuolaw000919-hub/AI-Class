LawAIApp.Calendar = {
  render() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();

    let gridHTML = '';
    for (let i = 0; i < firstDay; i++) gridHTML += '<div></div>';
    for (let d = 1; d <= daysInMonth; d++) {
      gridHTML += `<div class="day-cell" data-day="${d}">${d}</div>`;
    }

    const html = `
      <div class="page">
        <h2>📅 ${now.toLocaleString('default', { month: 'long' })} ${year}</h2>
        <div class="month-grid">${gridHTML}</div>
        <div id="calendar-modal" class="modal" style="display:none">
          <div class="modal-content"><p id="modal-text"></p><button class="quick-btn" onclick="document.getElementById('calendar-modal').style.display='none'">Close</button></div>
        </div>
      </div>
    `;
    document.getElementById('app').innerHTML = html;

    document.querySelectorAll('.day-cell').forEach(cell => {
      cell.addEventListener('click', (e) => {
        const day = parseInt(e.currentTarget.dataset.day, 10);
        // Phase 3 新增：检查该天是否有对应课程
        if (LawAIApp.LessonEngine && LawAIApp.LessonEngine.getLessonByDay) {
          const lesson = LawAIApp.LessonEngine.getLessonByDay(day);
          if (lesson) {
            // 有课程 → 导航到 Lesson 页面
            LawAIApp.Router.navigate('lesson', { day: day });
            return;
          }
        }
        // 无课程或引擎不可用 → 保持原有弹出框
        const modal = document.getElementById('calendar-modal');
        const modalText = document.getElementById('modal-text');
        if (modal && modalText) {
          modalText.textContent = `Day ${day}: No lesson yet.`;
          modal.style.display = 'flex';
        }
      });
    });
  }
};
