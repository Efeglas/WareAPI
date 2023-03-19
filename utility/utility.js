module.exports.getCorrectedDate = (hoursToCorrect) => {
  let currentDate = new Date();
  currentDate.setHours(currentDate.getHours() + hoursToCorrect);
  return currentDate;
};

module.exports.generateRefreshToken = () => {
  const randBegining = Math.random();
  const randEnd = Math.random();

  const strBegining = randBegining.toString(16);
  const hexBegining = strBegining.substr(2);

  const strEnd = randEnd.toString(16);
  const hexEnd = strEnd.substr(2);

  return `${hexBegining}.${hexEnd}`;
};