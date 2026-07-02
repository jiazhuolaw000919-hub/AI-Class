LawAIApp.Calendar = {
  render() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysInMonth = new Date(year, month+1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();

    let gridHTML = '';
    for (let i = 0; i < firstDay; i++) gridHTML += '<div></div>';
    for (let d = 1; d <= daysInMonth; d++) {
      gridHTML += `<div class="day-cell" data-day="${d}">${d}</div>`;
    }

    const html = `
      <div class="page">
        <h2>📅 ${now.toLocaleString('default', { month:'long' })} ${year}</h2>
        <div class="month-grid">${gridHTML}</div>
        <div id="calendar-modal" class="modal" style="display:none">
          <div class="modal-content"><p id="modal-text"></p><button class="quick-btn" onclick="document.getElementById('calendar-modal').style.display='none'">Close</button></div>
        </div>
      </div>
    `;
    document.getElementById('app').innerHTML = html;
    document.querySelectorAll('.day-cell').forEach(cell => {
      cell.addEventListener('click', (e) => {
        const day = e.currentTarget.dataset.day;
        document.getElementById('modal-text').textContent = `Day ${day}: No lesson yet.`;
        document.getElementById('calendar-modal').style.display = 'flex';
      });
    });
  }
};
