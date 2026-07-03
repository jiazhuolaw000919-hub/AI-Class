// quizCharts.js
LawAIApp.QuizCharts = {
  // 环形进度条（分数仪表）
  circularGauge(score, size = 120) {
    const radius = 50;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;
    return `
      <svg width="${size}" height="${size}" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="${radius}" fill="none" stroke="var(--card)" stroke-width="10"/>
        <circle cx="60" cy="60" r="${radius}" fill="none" stroke="var(--primary)" stroke-width="10"
          stroke-dasharray="${circumference}" stroke-dashoffset="${offset}" stroke-linecap="round"
          transform="rotate(-90 60 60)" style="transition: stroke-dashoffset 1s ease;"/>
        <text x="60" y="60" text-anchor="middle" dy="0.3em" fill="var(--text)" font-size="24" font-weight="bold">${score}%</text>
      </svg>
    `;
  },

  // 简易柱状图（近期成绩）
  barChart(data, labels) {
    const max = Math.max(...data, 1);
    return `
      <div style="display:flex; align-items:flex-end; gap:8px; height:100px;">
        ${data.map((val, i) => `
          <div style="flex:1; display:flex; flex-direction:column; align-items:center;">
            <div style="width:100%; background:var(--primary); height:${(val/max)*80}px; border-radius:4px 4px 0 0;"></div>
            <span style="font-size:0.6rem; color:var(--text-secondary);">${labels[i]}</span>
          </div>
        `).join('')}
      </div>
    `;
  },

  // 简单折线图（趋势）
  lineChart(data) {
    const max = Math.max(...data, 1);
    const points = data.map((val, i) => `${(i/(data.length-1))*100},${100 - (val/max)*80}`).join(' ');
    return `
      <svg viewBox="0 0 100 100" style="width:100%; height:100px;">
        <polyline fill="none" stroke="var(--primary)" stroke-width="3" points="${points}" />
        ${data.map((val, i) => `<circle cx="${(i/(data.length-1))*100}" cy="${100 - (val/max)*80}" r="4" fill="var(--primary)"/>`).join('')}
      </svg>
    `;
  },

  // 饼图（文本模拟）
  pieChart(topics) {
    const total = topics.reduce((sum, t) => sum + t.accuracy, 0);
    let cumulative = 0;
    const colors = ['#3b82f6','#22c55e','#f59e0b','#ef4444','#8b5cf6'];
    return `
      <svg width="100" height="100" viewBox="0 0 100 100">
        ${topics.map((t,i) => {
          const startAngle = (cumulative / total) * 360;
          cumulative += t.accuracy;
          const endAngle = (cumulative / total) * 360;
          const x1 = 50 + 40 * Math.cos((startAngle - 90) * Math.PI / 180);
          const y1 = 50 + 40 * Math.sin((startAngle - 90) * Math.PI / 180);
          const x2 = 50 + 40 * Math.cos((endAngle - 90) * Math.PI / 180);
          const y2 = 50 + 40 * Math.sin((endAngle - 90) * Math.PI / 180);
          const largeArc = (endAngle - startAngle) > 180 ? 1 : 0;
          return `<path d="M50,50 L${x1},${y1} A40,40 0 ${largeArc},1 ${x2},${y2} Z" fill="${colors[i%5]}" />`;
        }).join('')}
      </svg>
    `;
  }
};
