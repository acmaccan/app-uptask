const passport = require('passport');
const Usuarios = require('../models/Usuarios');
const crypto = require('crypto');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const bcrypt = require('bcrypt-nodejs');
const enviarEmail = require('../handlers/email');

exports.autenticarUsuario = passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/iniciar-sesion',
    failureFlash: true,
    badRequestMessage: 'Ambos campos son obligatorios'
});

//Función para saber si el usuario está loggeado o no
exports.usuarioAutenticado = (req, res, next) => {
    // Si lo está
    if(req.isAuthenticated()) {
        return next();
    }
    
    //Si no lo está
    return res.redirect('/iniciar-sesion');
}

//Función para cerrar sesión
exports.cerrarSesion = (req, res) => {
    req.session.destroy(() => {
        res.redirect('/iniciar-sesion'); //Al cerrar sesión nos lleva al login
    })
}

//Genera un token si el usuario es válido
exports.enviarToken = async (req, res) => {
    // Verificar si usuario existe
    const {email} = req.body;
    const usuario = await Usuarios.findOne({where: {email}});

    //Si no existe el usuario
    if(!usuario) {
        res.flash('error', 'No existe esa cuenta');
        res.redirect('/restablecer');
    }

    // Usuario existe - Generar token y expiración
    usuario.token = crypto.randomBytes(20).toString('hex');
    usuario.expiracion = Date.now() + 3600000; // Tiempo de duración

    // Guardarlos en la DB
    await usuario.save();

    // URL de reset
    const resetUrl = `http://${req.headers.host}/restablecer/${usuario.token}`;

    //Enviar el correo con el token
    await enviarEmail.enviar({
        usuario,
        subject: 'Password Reset',
        resetUrl,
        archivo: 'restablecerPassword'
    });

    //Terminar ejecución de envío
    req.flash('correcto', 'Se envió un mensaje a tu correo');
    res.redirect('/iniciar-sesion');
}

exports.validarToken = async(req, res) => {
    const usuario = await Usuarios.findOne({
        where: {
            token: req.params.token
        }
    });

    // Si no encuentra el usuario
    if(!usuario){
        req.flash('error', 'No válido');
        res.redirect('/restablecer');
    }

    // Formulario para generar el password
    res.render('resetPassword', {
        nombrePagina: 'Restablecer contraseña'
    })
}

// Cambia el password por uno nuevo
exports.actualizarPassword = async (req, res) => {
    const usuario = await Usuarios.findOne({

        // Verifica token válido y fecha de expiración
        where: {
            token: req.params.token,
            expiracion: {
                [Op.gte] : Date.now()
            }
        }
    });

    // Verificamos si el usuario existe
    if(!usuario){
        req.flash('error', 'No válido');
        res.redirect('/restablecer');
    }

    // Hashear nuevo password
    usuario.password = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10));
    usuario.token = null;
    usuario.expiracion = null;
    
    //Guardamos nuevo password
    await usuario.save();

    //Redirección para que puedan loggearse
    req.flash('correcto', 'Tu password se ha modificado correctamente');
    res.redirect('/iniciar-sesion');
}