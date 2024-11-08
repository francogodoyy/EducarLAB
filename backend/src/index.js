// Importación de módulos necesarios
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url'; //
import moment from 'moment'; // Para formato de fechas 
import { Escuela, Horarios, PostTurno, getHorariosOcupados, getFechasOcupadas, getCue } from './apis/formEscuelas.js';
import { PostTurnoComunidad, getComunidadData } from './apis/formComunidad.js';
import {  PostTurnoDocente, getDocenteData } from './apis/formDocente.js';
import users, { verifyToken, verifyAdmin } from '../Routes/Users.js';
import DB from './db/conexion.js';


// Configuración de la aplicación Express
const app = express()
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración de la aplicación Express
app.use(express.json());
app.use(express.urlencoded({extended: true, }));
app.use(cors())


app.use(express.static(path.join(__dirname, '..', 'views')));


//Router de usuarios
app.use('/users', users);


// Ruta raíz
app.get('/', (req, res) => {
    res.json({ message: "ok" });
})

// Ruta para obtener datos de escuela
app.get('/get', (req, res) => {
    res.json(Escuela);
})  

// Ruta para obtener horarios
app.get('/get_horarios', (req, res) => {
  res.json(Horarios);
})

// Ruta para la página de restablecimiento de contraseña
app.get('/resetPassword', (req, res) => {
  res.sendFile(path.join(__dirname,'..', 'views', 'resetPassword.html'));
});

// Ruta para la página de login
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'views', 'login.html'));
});

// Ruta para la página de login
app.get('/createAdmin', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'views', 'register.html'));
});

app.get('/sendResetPasswordEmail', (req, res) => {
  res.sendFile(path.join(__dirname,'..', 'views', 'requestPasswordReset.html'));
});




// Ruta para insertar turno de escuela
app.post('/post', (req, res) => {
    try {
        PostTurno(req);
        res.status(200).send('Datos insertados con éxito');
      } catch (error) {
        res.status(500).send('Error al insertar datos');
      }
})

// Ruta para insertar turno de comunidad
app.post('/post/comunidad', (req, res) => {
  try {
      PostTurnoComunidad(req);
      res.status(200).send('Datos insertados con éxito');
    } catch (error) {
      res.status(500).send('Error al insertar datos');
    }
})

// Ruta para insertar turno de docente
app.post('/post/docente', (req, res) => {
  try {
      PostTurnoDocente(req);
      res.status(200).send('Datos insertados con éxito');
    } catch (error) {
      res.status(500).send('Error al insertar datos');
    }
})


// Ruta para obtener horarios ocupados
app.get('/horarios/ocupados', async (req, res) => {
  const { fechaVisita } = req.query;

  try {
      const ocupados = await getHorariosOcupados(fechaVisita);
      res.json({ ocupados });
  } catch (error) {
      console.error('Error al traer los horarios ocupados:', error);
      res.status(500).json({ error: "Error al traer los horarios ocupados" });
  }
});

app.get('/fechas-sin-horarios' , async (req, res) =>{
  try{
    const fechasOcupadas= await getFechasOcupadas();
    const fechasSinHorarios = fechasOcupadas.map(fecha => 
      new Date(fecha).toISOString().split('T')[0]
    );
    res.json({fechasSinHorarios});
  } catch(error){
    console.error('Error al traer las fechas sin horarios: ', error);
    res.status(500).json({error: "Error al traer las fechas ocupadas"});
  }
})


// Ruta para obtener datos de comunidad
app.get('/comunidad_data', async (req, res) => {
  try {
      const data = await getComunidadData();
      res.json(data);
  } catch (error) {
      console.error('Error fetching comunidad data:', error);
      res.status(500).json({ error: "Error fetching comunidad data" });
  }
});

// Ruta para obtener datos de docente
app.get('/docente_data', async (req, res) => {
  try {
      const data = await getDocenteData();
      res.json(data);
  } catch (error) {
      console.error('Error fetching docente data:', error);
      res.status(500).json({ error: "Error fetching docente data" });
  }
});

app.get('/api/cue', async (req, res) => {
  try {
      const cueData = await getCue();
      res.json(cueData);
  } catch (error) {
      console.error('Error fetching CUE data:', error);
      res.status(500).json({ error: 'Error fetching CUE data' });
  }
});

//Parte de Paniagua (Tema Carga de Talleres(Alumnos y Docentes) y Carrusel Principal )


// Configurar EJS como motor de plantillas
app.set('view engine', 'ejs');

// Ajustar la ruta de las vistas
app.set('views', path.join(__dirname, '../views'));

// Habilitar CORS para todas las rutas
app.use(cors());
// Middleware para parsear datos del formulario y JSON
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Configurar el middleware estático correctamente
app.use(express.static(path.join(__dirname, '../../frontend/public/vistasTaller')));

// Nueva ruta para servir ConectarLab.html
app.get('/conectarlab', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/public/ConectarLab.html'));
});

// Ruta para el formulario de subida de entradas
app.get('/admin', (req, res) => {
  res.render('principalAdmin');
});

// Rutas para talleres_comunidad (Alumnos)
app.get('/alumnos', async (req, res) => {
  try {
    const [results] = await DB.query('SELECT * FROM talleres_comunidad');
    results.forEach(entry => {
      entry.fecha = moment(entry.fecha).format('YYYY-MM-DD');
    });
    res.render('cargaTalleralumnos', { entradas: results, message: null, error: null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/alumnos/confirmacion', async (req, res) => {
  const { titulo, descripcion, driveLink } = req.body;
  const imagen = driveLink ? convertToLh3Format(driveLink) : null;
  const sqlInsert = 'INSERT INTO talleres_comunidad (titulo, descripcion, imagen, fecha) VALUES (?, ?, ?, ?)';
  const fecha = moment().format('YYYY-MM-DD');

  try {
    await DB.execute(sqlInsert, [titulo, descripcion, imagen, fecha]);
    console.log('Entrada de comunidad insertada en la base de datos');

    const [results] = await DB.query('SELECT * FROM talleres_comunidad');
    results.forEach(entry => {
      entry.fecha = moment(entry.fecha).format('YYYY-MM-DD');
    });
    res.render('cargaTalleralumnos', { 
      entradas: results, 
      message: 'Entrada añadida exitosamente.',
      error: null
    });
  } catch (err) {
    console.error('Error al insertar:', err);
    res.render('cargaTalleralumnos', { 
      entradas: [], 
      error: 'Error al insertar la entrada. Por favor, intenta nuevamente.',
      message: null
    });
  }
});

app.get('/alumnos/delete/:id', async (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM talleres_comunidad WHERE id = ?';
  try {
    await DB.execute(sql, [id]);
    console.log(`Entrada de comunidad con id ${id} eliminada de la base de datos`);
    res.redirect('/alumnos');
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Rutas para talleres_docentes (Docentes)
app.get('/docentes', async (req, res) => {
  try {
    const [results] = await DB.query('SELECT * FROM talleres_docentes');
    results.forEach(entry => {
      entry.fecha = moment(entry.fecha).format('YYYY-MM-DD');
    });
    res.render('cargaTallerdocentes', { entradas: results, message: null, error: null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/docente/confirmacion', async (req, res) => {
  const { titulo, descripcion, driveLink } = req.body;
  const imagen = driveLink ? convertToLh3Format(driveLink) : null;
  const sqlInsert = 'INSERT INTO talleres_docentes (titulo, descripcion, imagen, fecha) VALUES (?, ?, ?, ?)';
  const fecha = moment().format('YYYY-MM-DD');

  try {
    await DB.execute(sqlInsert, [titulo, descripcion, imagen, fecha]);
    console.log('Entrada de docente insertada en la base de datos');

    const [results] = await DB.query('SELECT * FROM talleres_docentes');
    results.forEach(entry => {
      entry.fecha = moment(entry.fecha).format('YYYY-MM-DD');
    });
    res.render('cargaTallerdocentes', { 
      entradas: results, 
      message: 'Entrada añadida exitosamente.',
      error: null
    });
  } catch (err) {
    console.error('Error al insertar:', err);
    res.render('cargaTallerdocentes', { 
      entradas: [], 
      error: 'Error al insertar la entrada. Por favor, intenta nuevamente.',
      message: null
    });
  }
});

app.get('/docente/delete/:id', async (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM talleres_docentes WHERE id = ?';
  try {
    await DB.execute(sql, [id]);
    console.log('Entrada de docente eliminada de la base de datos');
    res.redirect('/docentes');
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// APIs para alumnos y docentes
app.get('/api/alumnos', async (req, res) => {
  try {
    const [results] = await DB.query('SELECT * FROM talleres_comunidad');
    
    // Formatear las fechas en el formato deseado
    results.forEach(entry => {
      entry.fecha = moment(entry.fecha).format('YYYY-MM-DD');
    });

    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/docentes', async (req, res) => {
  try {
    const [results] = await DB.query('SELECT * FROM talleres_docentes');
    
    // Formatear las fechas en el formato deseado
    results.forEach(entry => {
      entry.fecha = moment(entry.fecha).format('YYYY-MM-DD');
    });

    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Función para convertir enlace de Google Drive a formato LH3
function convertToLh3Format(driveLink) {
  const fileId = driveLink.match(/[-\w]{25,}/);
  if (fileId && fileId[0]) {
    return `https://lh3.googleusercontent.com/d/${fileId[0]}`;
  }
  return null;
}

//FACUNDO VALLEJOS
// Ruta para obtener datos de comunidad
app.get('/comunidad_data', async (req, res) => {
  try {
      const data = await getComunidadData();
      res.json(data);
  } catch (error) {
      console.error('Error fetching comunidad data:', error);
      res.status(500).json({ error: "Error fetching comunidad data" });
  }
});

// Ruta para obtener datos de docente
app.get('/docente_data', async (req, res) => {
  try {
      const data = await getDocenteData();
      res.json(data);
  } catch (error) {
      console.error('Error fetching docente data:', error);
      res.status(500).json({ error: "Error fetching docente data" });
  }
});

app.get('/escuelas', async (req, res) => {
  try {
      const [rows] = await DB.execute('SELECT * FROM escuelas'); // Consulta para obtener todas las escuelas
      console.log('Resultados de la consulta:', rows);

      if (rows.length > 0) {
          res.json(rows);
      } else {
          res.status(404).json({ message: 'No se encontraron escuelas' });
      }
  } catch (error) {
      console.error('Error al consultar la base de datos:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Ruta para obtener todas las escuelas
app.get('/cue/:id_cue', async (req, res) => {
  try {
      const [rows] = await DB.execute('SELECT * FROM bdcue'); // Consulta para obtener todas las escuelas
      console.log('Resultados de la consulta:', rows);

      if (rows.length > 0) {
          res.json(rows);
      } else {
          res.status(404).json({ message: 'No se encontraron escuelas' });
      }
  } catch (error) {
      console.error('Error al consultar la base de datos:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Ruta para cancelar el turno
app.put('/cancelar_turno/:nombre_escuela', async (req, res) => {
  const { nombre_escuela } = req.params;
  try {
      const [result] = await DB.execute('UPDATE escuelas SET estado = ? WHERE nombre_escuela = ?', ['cancelado', nombre_escuela]);
      if (result.affectedRows > 0) {
          res.status(200).send('Turno cancelado con éxito');
      } else {
          res.status(404).send('No se encontró la escuela');
      }
  } catch (error) {
      console.error('Error al cancelar el turno:', error);
      res.status(500).send('Error al cancelar el turno');
  }
});

//consultar inscripciones comunidad
app.get('/inscripciones_comunidad', async (req, res) => {
  try {
      const [rows] = await DB.execute('SELECT * FROM inscripciones_comunidad'); // Consulta para obtener todas las comunidades
      console.log('Resultados de la consulta:', rows);

      if (rows.length > 0) {
          res.json(rows);
      } else {
          res.status(404).json({ message: 'No se encontraron escuelas' });
      }
  } catch (error) {
      console.error('Error al consultar la base de datos:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
  }
});

//consultar inscripciones docentes
app.get('/inscripciones_docente', async (req, res) => {
  try {
      const [rows] = await DB.execute('SELECT * FROM inscripciones_docente'); // Consulta para obtener todas los docentes
      console.log('Resultados de la consulta:', rows);

      if (rows.length > 0) {
          res.json(rows);
      } else {
          res.status(404).json({ message: 'No se encontraron escuelas' });
      }
  } catch (error) {
      console.error('Error al consultar la base de datos:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Iniciar el servidor en el puerto 3000
app.listen(3000)