import db from "../db/conexion.js";
import transporter from '../nodemailerConfig.js'; // Importamos Nodemailer


export async function PostTurnoDocente(request) {
    const data = request.body;
    console.log(data)

    const campos = "nombre_docente, escuela, dni, email, telefono, taller_titulo, taller_fecha, estado"

    await db.execute(
        "INSERT INTO inscripciones_docente ("+campos+") VALUES (?, ?, ?, ?, ?, ?,?,?)", 
        [data.nombreApellido, data.escuela, data.dni, data.email, data.telefono, data.tallerTitulo, data.tallerFecha, data.estado]
    );

    await enviarCorreoConfirmacion(data.email, data.nombreApellido, data.tallerFecha, data.tallerTitulo);

}


// Función para enviar un correo de confirmación de reserva
async function enviarCorreoConfirmacion(email, nombreApellido, tallerFecha, tallerTitulo) {
    const mailOptions = {
        from: 'rodrigo.gomez.pinatti@gmail.com', // Cambia por tu correo
        to: email,
        subject: 'Confirmación de Reserva',
        text: `¡Hola profe!
¡Qué alegría saber que está interesado en visitar el Centro de Innovación Educ.ar Lab Chaco! Nos encanta que nos elijan para vivir esta experiencia.
Este mensaje es para confirmar que su turno ha sido asignado con éxito. ¡Ya estamos esperándolo en la fecha y el día acordados!
Por favor, recuerden que, si necesitan cancelar o reprogramar la visita, pueden contactarnos a través de:
Correo: educarlab@elechaco.edu.ar
Celular: 3625175481

¡Nos vemos pronto! 
Equipo Educ.ar Lab Chaco
`
    };

    await transporter.sendMail(mailOptions);
    console.log('Correo de confirmación enviado a:', email);
}

export async function getDocenteData() {
    try {
        const [rows] = await db.execute("SELECT * FROM talleres_docentes");
        if (rows.length > 0) {
            return rows;
        } else {
            throw new Error('No se encontraron talleres docentes');
        }
    } catch (error) {
        console.error('Error fetching docente data:', error);
        throw new Error('Error fetching docente data');
    }
}