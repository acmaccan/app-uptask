// Importamos el modelo
const Proyectos = require('../models/Proyectos');
const Tareas = require('../models/Tareas');

// Request son los pedidos y Response son las respuestas del servidores
// Se pasan como parámetros con los nombres que querramos
// En los modelos MVC el req y res son obligación del controlador
// Por eso los estamos creando aquí, sino podrían estar en el index de routers

exports.proyectoHome = async (req, res) => {
    const usuarioId = res.locals.usuario.id;    
    const proyectos = await Proyectos.findAll({where: {usuarioId}}); //Consulta dinámica de proyectos para poner bajo el botón

    //Para que muestre contenido entre paréntesis
    //res.send('Index');
    
    //Para que renderee html dentro de una vista:
    res.render('index', {
        nombrePagina: 'Proyectos',
        proyectos
    });
}

exports.formularioProyecto = async (req, res) => {
    const usuarioId = res.locals.usuario.id;    
    const proyectos = await Proyectos.findAll({where: {usuarioId}});

    res.render('nuevoProyecto', {
        nombrePagina: 'Nuevo Proyecto',
        proyectos
    })
}

exports.nuevoProyecto = async (req, res) => {
    const usuarioId = res.locals.usuario.id;    
    const proyectos = await Proyectos.findAll({where: {usuarioId}});

    //Devuelve al mandar formulario
    //res.send('Enviaste el formulario');

    //Enviar a la consola lo que el usuario escriba - Esto es para probar que el body parser funciona
    //Lo comentamos ya que no lo vamos a utilizar
    //console.log(req.body);

    //Validar lo que ingrese por input - Nueva sintaxis JS soportada por Node
    //Faltaría realizar validaciones para que los datos ingresen limpios
    //Hay paquetes express que hacen una validación automática. Esto es para hacer manualmente
    const { nombre } = req.body;
    
    let errores = [];

    if(!nombre) {
        errores.push({'texto': 'Agrega un nombre al Proyecto'})
    }

    //Si hay errores
    if(errores.length > 0) {
        res.render('nuevoProyecto', {
            nombrePagina: 'Nuevo Proyecto',
            errores,
            proyectos
        })
    } else {
        // Asocia el proyecto a un usuario
        const usuarioId = res.locals.usuario.id;

        // Si no hay errores insertar en la DB
        await Proyectos.create({nombre, usuarioId});
        res.redirect('/');
    }
}

// Lo que devuelve al hacer click en un proyecto
exports.proyectoPorUrl = async (req, res, next) => {
    const usuarioId = res.locals.usuario.id;    
    const proyectosPromise = Proyectos.findAll({where: {usuarioId}});
    const proyectoPromise = Proyectos.findOne({
        where: {
            url: req.params.url,
            usuarioId
        }
    });

    const [proyectos, proyecto] = await Promise.all([proyectosPromise, proyectoPromise]);

    //Consultar tareas del proyecto actual
    const tareas = await Tareas.findAll({
        where: {
            proyectoId : proyecto.id
        }
        //include: [
        //    {model: Proyectos}
        //]
    });

    if(!proyecto) return next();
    
    //Render a la vista
    res.render('tareas', {
        nombrePagina: 'Tareas del Proyecto',
        proyecto,
        proyectos,
        tareas
    });
}

exports.formularioEditar = async (req, res) => {
    const usuarioId = res.locals.usuario.id; 
    const proyectosPromise = Proyectos.findAll({where: {usuarioId}});
    const proyectoPromise = Proyectos.findOne({
        where: {
            id: req.params.id,
            usuarioId
        }
    });

    const [proyectos, proyecto] = await Promise.all([proyectosPromise, proyectoPromise]);

    res.render('nuevoProyecto', {
        nombrePagina: 'Editar Proyecto',
        proyectos,
        proyecto
    })
}

//Actualizar Proyecto
exports.actualizarProyecto = async (req, res) => {
    const usuarioId = res.locals.usuario.id;    
    const proyectos = await Proyectos.findAll({where: {usuarioId}});
    const { nombre } = req.body;
    
    let errores = [];

    if(!nombre) {
        errores.push({'texto': 'Agrega un nombre al Proyecto'})
    }

    //Si hay errores
    if(errores.length > 0) {
        res.render('nuevoProyecto', {
            nombrePagina: 'Nuevo Proyecto',
            errores,
            proyectos
        })
    } else {
        // Si no hay errores actualizar la DB
        await Proyectos.update(
            {nombre: nombre},
            {where: { id: req.params.id }}
        );
        res.redirect('/');
    }
}

exports.eliminarProyecto = async (req, res, next) => {
    //Request - Query o Params devuelve lo mismo
    //console.log(req.query);

    const {urlProyecto} = req.query;
    const resultado = await Proyectos.destroy({where:{url: urlProyecto}});

    //Si se pierde conexión en el momento de borrar
    if(!resultado){
        return next();
    }

    res.status(200).send('Proyecto eliminado correctamente');
}