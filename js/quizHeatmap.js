// quizHeatmap.js
LawAIApp.QuizHeatmap = {
  render(heatmapData) {
    return `
      <div style="display:flex; flex-wrap:wrap; gap:6px;">
        ${heatmapData.map(q => {
          let bg = '#22c55e'; // correct
          if (q.status === 'guessed') bg = '#f59e0b';
          if (q.status === 'incorrect') bg = '#ef4444';
          return `<div title="${q.question}: ${q.status}" style="width:30px; height:30px; background:${bg}; border-radius:6px; display:flex; align-items:center; justify-content:center; font-size:0.7rem; color:white; cursor:pointer;" onclick="alert('Question details coming soon')">${q.question}</div>`;
        }).join('')}
      </div>
    `;
  }
};
