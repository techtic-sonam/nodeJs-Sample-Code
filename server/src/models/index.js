const Sequelize = require("sequelize");
const configJson = require("../config/config");

const env = process.env.NODE_ENV ? process.env.NODE_ENV : "development";

const config = configJson[env];

console.log("this is the environment: ", env);
const db = {};

let sequelize;
sequelize = new Sequelize(config.database, config.username, config.password, {
  host: config.host,
  port: config.port,
  dialect: config.dialect,
  operatorsAliases: false
});

sequelize.sync();

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
