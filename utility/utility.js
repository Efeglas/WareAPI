//const {getRandomInteger} = require("./utility.js");

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

module.exports.generateTemporaryPass = () => {
  const rand = Math.random();
  const str = rand.toString(16);
  const hex = str.substr(2);
  return hex;
};

module.exports.toNormalForm = (str) => {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}
const toNormalFormHere = module.exports.toNormalForm;

module.exports.getRandomInteger = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
const getRandomIntegerHere = module.exports.getRandomInteger;

module.exports.generate2Char = () => {    
  let letter1 = String.fromCharCode(getRandomIntegerHere(97,122));
  let letter2 = String.fromCharCode(getRandomIntegerHere(97,122));     
  let result = letter1 + letter2;
  return result;
}
const generate2CharHere = module.exports.generate2Char;

module.exports.generateUsername = async (lastName, database) => {

  let number = 1;     
  let userBegining = toNormalFormHere(lastName.substring(0, 2));
  let randomChars = generate2CharHere();
  let userFix = "hrt";
  
  let userExists = null;

  do {
    
    let builtUsername = `${userBegining}${randomChars}${number}${userFix}`;

    userExists = await database.models.UserModel.findOne({where: {username: builtUsername}});

    if (userExists === null) {         
      return builtUsername.toLowerCase();       
    } else {
      number++;
      if (number > 9) {
        number = 1;
        randomChars = generate2CharHere();
      }
    }
  } while (userExists !== null);

}

module.exports.controllerUnexpectedError = async (error) => {
  console.error(error.message);
  return {status: 500, message: `Unexpected error`, data: []};
}

module.exports.getMonthsBetween = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const months = [];
  const codes = [];

  let currentDate = start;
  while (currentDate <= end) {
    const monthName = currentDate.toLocaleString('en-US', { month: 'long' });

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    const formattedMonth = `${year}-${month.toString().padStart(2, '0')}`;
    
    months.push(`${currentDate.getFullYear()} ${monthName}`);
    codes.push(formattedMonth);
    currentDate = new Date(currentDate.setMonth(currentDate.getMonth() + 1));
  }

  return {months: months, codes: codes};
}