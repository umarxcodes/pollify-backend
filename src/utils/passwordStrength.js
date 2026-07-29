const checkStrength = (password) => {
  let score = 0;

  if (!password || password.length === 0) {
    return { score: 0, label: "Very Weak", color: "#ff4d4f" };
  }

  // Score based on length thresholds
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;

  // Score based on character variety
  if (/[A-Z]/.test(password)) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (score <= 2) {
    return { score: 1, label: "Weak", color: "#ff4d4f" };
  } else if (score <= 4) {
    return { score: 2, label: "Medium", color: "#faad14" };
  } else {
    return { score: 3, label: "Strong", color: "#52c41a" };
  }
};

// Alias kept for backward compatibility with existing imports
export { checkStrength as calculatePasswordStrength, checkStrength };
