const Usuarios = require('../models/Usuarios');
const enviarEmail = require('../handlers/email');

exports.formCrearCuenta = (req, res) => {
    res.render('crearCuenta', {
        nombrePagina: 'Crear Cuenta en UpTask'
    })
}

exports.formIniciarSesion = (req, res) => {
    const {error} = res.locals.mensajes;
    res.render('iniciarSesion', {
        nombrePagina: 'Iniciar sesión en UpTask',
        error
    })
}

exports.crearCuenta = async(req, res) => {
    //Leer los datos
    const {email, password} = req.body;
    
    try{
        //Crear el usuario
        await Usuarios.create({
            email,
            password
        });

        //Crear una URL de confirmación
        const confirmarUrl = `http://${req.headers.host}/confirmar/${email}`;

        //Crear el objeto de usuario
        const usuario = {
            email
        }

        //Enviar email
        await enviarEmail.enviar({
            usuario,
            subject: 'Confirma tu cuenta UpTask',
            confirmarUrl,
            archivo: 'confirmarCuenta'
        });

        //Redirigir al usuario
        req.flash('correcto', 'Enviamos un correo, confirma tu cuenta');

        res.redirect('/iniciar-sesion');
    } catch (error){
        //Genero un objeto con todos los errores de Sequelize
        req.flash('error', error.errors.map(error => error.message));
        //Y los paso al view con flash
        res.render('crearCuenta', {
            mensajes: req.flash(),
            nombrePagina: 'Crear Cuenta en UpTask',
            email,
            password
        })
    }

}

exports.formRestablecerPassword = (req, res) => {
    res.render('restablecer', {
        nombrePagina: 'Restablece tu contraseña'
    })
}

exports.confirmarCuenta = async (req, res) => {
    const usuario = await Usuarios.findOne({
        where: {
            email: req.params.correo
        }
    });

    //Si el usuario no existe
    if(!usuario) {
        req.flash('error', 'No válido');
        res.redirect('/crear-cuenta');
    }

    usuario.activo = 1;
    await usuario.save();

    req.flash('correcto', 'Cuenta activada correctamente');
    res.redirect('/iniciar-sesion');

}