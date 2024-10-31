import express from 'express';
import DB from '../../../../../EducarLAB2.0/educarLab/backend/src/db/conexion.js'; // Asegúrate de importar tu conexión a la base de datos
import { verifyAdmin } from '../../../../../EducarLAB2.0/educarLab/backend/src/apis/Users.js'; // Asegúrate de que la ruta sea correcta

const router = express.Router();

// Obtener todos los comentarios
router.get('/comentarios', async (req, res) => {
    try {
        const [comentarios] = await DB.query('SELECT * FROM comentarios');
        res.json(comentarios);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al obtener comentarios' });
    }
});

// Crear un nuevo comentario
router.post('/comentarios', verifyAdmin, async (req, res) => {
    const { nombre, mensaje } = req.body;
    try {
        await DB.query('INSERT INTO comentarios (nombre, mensaje) VALUES (?, ?)', [nombre, mensaje]);
        res.status(201).json({ message: 'Comentario agregado' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al agregar comentario' });
    }
});

// Eliminar todos los comentarios (opcional, según tu necesidad)
router.delete('/comentarios', verifyAdmin, async (req, res) => {
    try {
        await DB.query('DELETE FROM comentarios');
        res.status(200).json({ message: 'Todos los comentarios eliminados' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al eliminar comentarios' });
    }
});

export const formComentarios = router;
