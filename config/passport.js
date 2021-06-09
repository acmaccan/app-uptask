const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

//Referencia al modelo a autenticar
const Usuarios = require('../models/Usuarios');


//Local Strategy - Login con credenciales propias (usuario y password)
passport.use(
    new LocalStrategy(
        // Por default espera usuario y password - Nosotros estamos usando email y password (reescribir)
        {
            usernameField: 'email',
            passwordField: 'password'
        }, 
        // Consulta a la DB
        async(email, password, done) => {
            try {
                const usuario = await Usuarios.findOne({
                    where: {
                        email,
                        activo: 1
                    }
                });
                // El usuario existe, password incorrecto - Con bcrypt
                if(!usuario.verificarPassword(password)){
                    return done(null, false,{
                        message: 'El password es incorrecto'
                    });
                }
                // El usuario existe, password correcto
                return done(null, usuario); // Ese usuario va a ser objeto
            } catch (error) {
                // Ese usuario no existe - Con passport
                return done(null, false,{
                    message: 'Esa cuenta no existe'
                });
            }
        }
    )
)

//Serializar el usuario - Desarmar el objeto
passport.serializeUser((usuario, callback) => {
    callback(null, usuario);
});

//Deserializar el usuario - Volver a reunirlo como objeto
passport.deserializeUser((usuario, callback) => {
    callback(null, usuario);
});

module.exports = passport;