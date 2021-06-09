//Descripción de los campos de mi DB

// 1. Importar Sequelize y conexión a DB
const Sequelize = require('sequelize');
const db = require('../config/db');

// 2. Importa slug para convertir string en formato slug para URL
const slug = require('slug');

// 3. Importa shortid para no repetir urls al ingresar nuevos proyectos en la DB
const shortid = require('shortid');

const Proyectos = db.define('proyectos', {
    id : {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre : Sequelize.STRING(100),
    url : Sequelize.STRING(100)
}, {
    hooks: { //sequelize: corre una fc en un determinado momento
        beforeCreate(proyecto){ // antes que se inserte en la DB
            // Convierte el string ingresado en formato slug url
            const url = slug(proyecto.nombre).toLowerCase();
            proyecto.url = `${url}-${shortid.generate()}`
        }
    }
});

module.exports = Proyectos; // Para utilizar este modelo en otras piezas del proyecto