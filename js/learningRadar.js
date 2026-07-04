// learningRadar.js
LawAIApp.LearningRadar = {
  render(skills) {
    // skills: [{ name, value }] value 0-100
    const size = 200;
    const center = size / 2;
    const radius = 70;
    const angleSlice = (2 * Math.PI) / skills.length;
    let points = [];
    skills.forEach((skill, i) => {
      const angle = angleSlice * i - Math.PI / 2;
      const val = skill.value / 100;
      const x = center + radius * val * Math.cos(angle);
      const y = center + radius * val * Math.sin(angle);
      points.push(`${x},${y}`);
    });
    const polygon = points.join(' ');
    const lines = [];
    // 轴线
    for (let i = 0; i < skills.length; i++) {
      const angle = angleSlice * i - Math.PI / 2;
      const x = center + radius * Math.cos(angle);
      const y = center + radius * Math.sin(angle);
      lines.push(`<line x1="${center}" y1="${center}" x2="${x}" y2="${y}" stroke="var(--text-secondary)" stroke-opacity="0.2"/>`);
    }
    return `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
        ${lines.join('')}
        <polygon points="${polygon}" fill="var(--primary)" fill-opacity="0.3" stroke="var(--primary)" stroke-width="2"/>
        ${skills.map((s,i) => {
          const angle = angleSlice * i - Math.PI / 2;
          const x = center + (radius+15) * Math.cos(angle);
          const y = center + (radius+15) * Math.sin(angle);
          return `<text x="${x}" y="${y}" text-anchor="middle" fill="var(--text-secondary)" font-size="0.6rem">${s.name}</text>`;
        }).join('')}
      </svg>
    `;
  }
};
