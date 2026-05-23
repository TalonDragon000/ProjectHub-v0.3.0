export const calculateScore = (r, i, c, e) => ((r * i * c) / e).toFixed(1);

export const predictColumn = (score, moscow) => {
  if (moscow === "Won't") return 'Later';
  if (moscow === 'Must') return 'High';
  if (score >= 25) return 'High';
  if (score >= 10) return 'Med';
  return 'Low';
};
