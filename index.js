//============
//  Importar
// ===========

// Con las líneas require, app y listen creamos un servidor en node ============================
// Todos los require a continuación son para poner a disposición las dependencias y librerías
// que voy instalando por CMD

// Sintaxis  para importar en ES6 no soportada en express -> import express from 'express'; ->
// Entonces la cambiamos por la expresión a continuación:
const express = require('express');

//Importamos las rutas
const routes = require('./routes');

//Importar path - librería de node - reconoce los archivos existentes dentro del proyecto
const path = require('path');

//Import body parser
const bodyParser = require('body-parser');

//Import Express Validator
//const expressValidator = require('express-validator');

// Import Connect Flash
const flash = require('connect-flash');

//Import helpers
const helpers = require('./helpers');

//Import express session
const session = require('express-session');

//Import cookie parser
const cookieParser = require('cookie-parser');

//Import config de passport
const passport = require('./config/passport');

// Importar valores de variables.env
require('dotenv').config({path: 'variables.env'});

//============
// Inicializar
// ===========

// Crear la conexión a la DB
const db = require('./config/db');

//Importar el modelo
require('./models/Proyectos');
require('./models/Tareas');
require('./models/Usuarios');

db.sync() //Esto devuelve un promise - Sequelize se basa en promises
    .then(() => console.log('Conectando al Servidor'))
    .catch(error => console.log(error));

// Creamos app de express
const app = express();

// Cargar archivos estáticos
app.use(express.static('public'));

//Habilitar pug
app.set('view engine', 'pug');

// Habilitar body parser para pasar datos del formulario - Deprecated
app.use(express.urlencoded({extended: true}));

// Ponemos a disposición express validator a toda la app
//app.use(expressValidator());

//Añadir carpeta del View
app.set('views', path.join(__dirname, './views'));

//Agregar Flash messages
app.use(flash());

app.use(cookieParser());

//Agregar express session - Sesiones nos permiten navegar por distintas páginas sin volvernos a autenticar
app.use(session({
    secret: 'supersecreto',
    resave: false,
    saveUninitialized: false
}));

//Inicializar autenticación passport entre páginas
app.use(passport.initialize());
app.use(passport.session());

//Pasar var dump a la app
app.use((req, res, next) => {
    res.locals.vardump = helpers.vardump;
    res.locals.mensajes = req.flash();
    res.locals.usuario = {...req.user} || null;
    next();
})

// Llamamos a la función de las rutas
app.use('/', routes());

// Escuchar a puerto seguro que no esté en uso - listen es método express
app.listen(3000);

// Email test
require('./handlers/email');

//Servidor y Puerto
const host = process.env.HOST || '0.0.0.0';
const port = process.env.PORT || 3000;

app.listen(port, host, () => {
    console.log('El servidor está funcionando');
});