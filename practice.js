// Con las líneas require, app y listen creamos un servidor en node ============================

// Sintaxis  para importar en ES6 no soportada en express -> import express from 'express'; ->
// Entonces la cambiamos por la expresión a continuación:
const express = require('express');

// Creamos app de express
const app = express();

// Si estuviéramos creando una rest API
const productos = [
    {
        producto: 'Libro',
        precio: 20
    },
    {
        producto: 'Computadora',
        precio: 10000
    }
]

// Ruta para el home - request son los pedidos y response son las respuestas del servidor, se 
// pasan como parámetros con los nombres que querramos

app.use('/', (req, res) => {
    //res.send('Hola');
    res.json(productos);
});

// Escuchar a puerto seguro que no esté en uso - listen es método express
app.listen(3000);

