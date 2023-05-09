const { Sequelize } = require('sequelize');
require('dotenv').config();
const db = {}
const sequelizeInstance = new Sequelize(process.env.DB_DATABASE, process.env.DB_USERNAME, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'postgres',
  pool: {
    min: 0,
    max: 100,
    acquire: 5000,
    Idle: 1000
  }
});
sequelizeInstance
  .authenticate()
  .then(() => console.log('DB connected'))
  .catch((err) => {
    console.error(err);
  });



  db.sequelize = sequelizeInstance;
  db.Sequelize = Sequelize;

  db.apiKeyForTM30 = require('./model')(sequelizeInstance, Sequelize);

module.exports = {
  db
}
