export const getGaugeColor = (column) => {
  switch (column) {
    case 'High':  return 'bg-priority-high';
    case 'Med':   return 'bg-priority-med';
    case 'Low':   return 'bg-priority-low';
    case 'Later': return 'bg-priority-later';
    default:      return 'bg-accent-secondary';
  }
};

export const fireConfetti = () => {
  if (typeof window.confetti !== 'function') return;
  const style = getComputedStyle(document.documentElement);
  const colors = [1, 2, 3, 4, 5].map(n => style.getPropertyValue(`--confetti-${n}`).trim());
  window.confetti({ particleCount: 80, spread: 70, origin: { x: 0.5, y: 0.5 }, colors });
};
