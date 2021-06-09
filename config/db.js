const Sequelize = require('sequelize');

// Extraer valores de variables.env
require('dotenv').config({path: 'variables.env'});

// Option 2: Passing parameters separately (other dialects)
const sequelize = new Sequelize(
  process.env.BD_NOMBRE, 
  process.env.BD_USER, 
  process.env.BD_PASS, 
    {
    host: process.env.BD_HOST,  // o 127.0.0.1
    dialect: 'mysql',
    port: process.env.BD_PORT
    }
);

module.exports = sequelize;