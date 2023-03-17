const fs = require("fs");
let rawdata = fs.readFileSync('./config/config.json');
const config = JSON.parse(rawdata);

module.exports = {config};