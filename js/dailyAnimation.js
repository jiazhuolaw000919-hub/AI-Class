// dailyAnimation.js
LawAIApp.DailyAnimation = {
  // 数字滚动动画
  animateValue(el, start, end, duration) {
    if (!el) return;
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      el.textContent = Math.floor(progress * (end - start) + start);
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  },
  // 进度环动画
  animateRing(ring, percent) {
    if (!ring) return;
    const radius = ring.r.baseVal.value;
    const circumference = 2 * Math.PI * radius;
    ring.style.strokeDasharray = circumference;
    ring.style.strokeDashoffset = circumference;
    setTimeout(() => {
      ring.style.transition = 'stroke-dashoffset 1.5s ease';
      ring.style.strokeDashoffset = circumference - (percent / 100) * circumference;
    }, 200);
  }
};
