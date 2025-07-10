// Validate time format (HH:MM)
exports.isValidTimeFormat = (time) => {
  return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time);
};

// Validate date is in the future
exports.isFutureDate = (date) => {
  return new Date(date) > new Date();
};