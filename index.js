const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function iniciarBaseDeDatos() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS mensajes_chat (
                id SERIAL PRIMARY KEY,
                remitente VARCHAR(50) DEFAULT 'Visitante',
                mensaje TEXT NOT NULL,
                fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("✅ Base de datos lista.");
    } catch (error) {
        console.error("❌ Error de BD:", error);
    }
}
iniciarBaseDeDatos();

// ── Diccionarios de respuestas ──

const respuestasSaludo = [
    "¡Hola! Qué gusto saludarte. 👋 ¿En qué te puedo ayudar hoy?",
    "¡Hey! Bienvenido/a a mi portafolio. 😊 Pregúntame lo que quieras.",
    "¡Hola! Soy el asistente de Miranda. ¿Qué te gustaría saber?",
    "¡Buenas! Encantado de saludarte. ¿Te interesa saber sobre mis proyectos o habilidades?"
];

const respuestasDespedida = [
    "¡Hasta pronto! Fue un gusto hablar contigo. 👋",
    "¡Chao! Recuerda que puedes dejarme tu correo si quieres que me contacte contigo.",
    "¡Nos vemos! Si necesitas algo más, aquí estaré. 😊",
    "¡Hasta luego! Espero haberte ayudado. Vuelve cuando quieras."
];

const respuestasGracias = [
    "¡De nada! Aquí estoy si necesitas saber algo más. 😊",
    "¡Con gusto! No dudes en preguntar cualquier otra cosa.",
    "¡Para eso estoy! ¿Algo más en lo que pueda ayudarte?",
    "¡Me alegra poder ayudar! 🙌"
];

const respuestasBot = [
    "Soy un asistente virtual creado por Miranda. Mi trabajo es responder tus dudas y guardar tus mensajes en la base de datos. ",
    "¡Soy un chatbot! Estoy hecho con Node.js y una base de datos PostgreSQL. Pregúntame lo que quieras sobre el portafolio.",
    "Soy el bot asistente de este portafolio. Fui construido con Express y PostgreSQL, y estoy desplegado en Render. "
];

const respuestasTecnologias = [
    "Me especializo en desarrollo web. Manejo HTML, CSS, JavaScript en el frontend, y Node.js con bases de datos SQL en el backend. ",
    "Mis tecnologías principales son: HTML5, CSS3 y JavaScript para el frontend. En el backend trabajo con Node.js, Express y PostgreSQL. 🛠️",
    "Tengo un nivel intermedio en HTML, CSS y JS. También manejo Git/GitHub para control de versiones y estoy aprendiendo frameworks modernos."
];

const respuestasProyectos = [
    "En esta web puedes ver mis trabajos destacados. ¡De hecho, este chat que estás usando es uno de mis proyectos full-stack! ",
    "He creado landing pages, una calculadora con JS, una app de tareas con localStorage, y este chatbot con backend en Node.js. ¡Mira la sección de Proyectos!",
    "Mis proyectos van desde páginas estáticas hasta aplicaciones full-stack como este chat. Cada uno me ha ayudado a crecer como desarrolladora. 📈"
];

const respuestasContacto = [
    "¡Claro! Puedes escribirme a mirandamaam785@gmail.com o al +58 04123017027. También puedes dejar tu correo aquí y te escribo. ",
    "Escríbeme tu correo o número de teléfono aquí mismo y yo me encargaré de guardarlo para contactarte lo más pronto posible. ",
    "Puedes encontrarme en LinkedIn y GitHub, o simplemente déjame tu email aquí y te contacto directamente."
];

const respuestasUbicacion = [
    "Estoy ubicada en Caracas, Venezuela. 🇻🇪 Pero trabajo de forma remota sin problema.",
    "Soy de Caracas, Venezuela. Estoy disponible para proyectos remotos a nivel internacional. "
];

const respuestasDisponibilidad = [
    "¡Sí, estoy disponible para nuevos proyectos! Cuéntame qué necesitas y lo conversamos. ",
    "Actualmente estoy abierta a nuevas oportunidades freelance. ¿Tienes un proyecto en mente?",
    "¡Claro! Estoy buscando oportunidades. Déjame tu contacto y hablamos sobre tu proyecto."
];

const respuestasPrecio = [
    "El precio depende del tipo de proyecto. Cuéntame qué necesitas y te paso un presupuesto personalizado. ",
    "Cada proyecto es único. Déjame tu email o escríbeme directamente para darte una cotización. ",
    "Trabajo con tarifas accesibles. Dime qué tienes en mente y te hago una propuesta."
];

const respuestasEstudios = [
    "Soy estudiante próxima a graduarme, enfocada en desarrollo web y tecnologías de la información.",
    "Estoy finalizando mis estudios y complementándolos con proyectos prácticos como este portafolio y el chatbot que estás usando.",
    "Mi formación combina estudios formales con aprendizaje autodidacta en programación web. ¡La práctica hace al maestro!"
];

const respuestasHumor = [
    "¡Jaja! Me alegra que tengas buen humor.  ¿En qué te puedo ayudar?",
    " ¡Buena esa! Pero hablando en serio, ¿te gustaría saber algo sobre el portafolio?",
    "¡Me caes bien! ¿Hablamos de proyectos o prefieres seguir con el buen rollo?"
];

const respuestasGeneral = [
    "Interesante...  Ya guardé tu mensaje. ¿Te gustaría saber algo sobre mis proyectos o tecnologías?",
    "¡Tomaré nota de eso! 📝 ¿Puedo ayudarte con alguna otra duda sobre mi perfil?",
    "No estoy 100% seguro de entender, pero ya lo registré. ¿Quieres que hablemos de mis habilidades o prefieres dejarme tu contacto?",
    "Hmm, no tengo una respuesta perfecta para eso, pero ya lo anoté. 📋 ¿Hay algo más que quieras saber?",
    "Interesante pregunta. Puedo ayudarte con info sobre: mis proyectos, tecnologías, contacto o disponibilidad. ¿Qué prefieres?",
    "¡Gracias por escribir! No sé bien qué responder a eso, pero si preguntas por mis skills, proyectos o contacto, ahí sí soy experto. 😉"
];

function elegir(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

// ── Ruta principal del Chat ──
app.post('/api/chat', async (req, res) => {
    const mensajeUsuario = req.body.mensaje;

    try {
        await pool.query('INSERT INTO mensajes_chat (mensaje) VALUES ($1)', [mensajeUsuario]);

        const texto = mensajeUsuario.toLowerCase();
        let respuestaBot = "";

        // Palabras clave por categoría
        const esSaludo = ['hola', 'buenas', 'qué tal', 'que tal', 'saludos', 'hey', 'buenos días', 'buenos dias', 'buenas tardes', 'buenas noches'].some(p => texto.includes(p));
        const esDespedida = ['adiós', 'adios', 'chao', 'nos vemos', 'hasta luego', 'bye', 'me voy', 'hasta pronto'].some(p => texto.includes(p));
        const esGracias = ['gracias', 'genial', 'perfecto', 'vale', 'listo', 'excelente', 'increíble', 'super', 'bien', 'cool'].some(p => texto.includes(p));
        const preguntaBot = ['qué eres', 'que eres', 'quién eres', 'quien eres', 'bot', 'inteligencia', 'chatbot', 'asistente', 'robot'].some(p => texto.includes(p));
        const preguntaTecnologias = ['tecnología', 'tecnologia', 'skills', 'sabes', 'lenguaje', 'programar', 'html', 'css', 'javascript', 'herramienta', 'stack'].some(p => texto.includes(p));
        const preguntaProyectos = ['proyecto', 'trabajo', 'portafolio', 'experiencia', 'has hecho', 'creado', 'desarrollado'].some(p => texto.includes(p));
        const preguntaContacto = ['contacto', 'correo', 'email', 'teléfono', 'telefono', 'contratar', 'hablar', 'escribir', 'llamar', 'whatsapp'].some(p => texto.includes(p));
        const preguntaUbicacion = ['dónde', 'donde', 'ubicación', 'ubicacion', 'ciudad', 'país', 'pais', 'venezuela', 'caracas'].some(p => texto.includes(p));
        const preguntaDisponible = ['disponible', 'disponibilidad', 'libre', 'abierta', 'contratar', 'freelance', 'oportunidad'].some(p => texto.includes(p));
        const preguntaPrecio = ['precio', 'costo', 'cuánto', 'cuanto', 'cobras', 'tarifa', 'presupuesto', 'cotización', 'cotizacion'].some(p => texto.includes(p));
        const preguntaEstudios = ['estudia', 'carrera', 'universidad', 'formación', 'formacion', 'graduarse', 'título', 'titulo', 'estudiante'].some(p => texto.includes(p));
        const esHumor = ['jaja', 'jeje', 'lol', 'xd', '😂', '😄', 'gracioso', 'chistoso', 'divertido'].some(p => texto.includes(p));

        // Decidir respuesta por prioridad
        if (esSaludo) {
            respuestaBot = elegir(respuestasSaludo);
        } else if (esDespedida) {
            respuestaBot = elegir(respuestasDespedida);
        } else if (esGracias) {
            respuestaBot = elegir(respuestasGracias);
        } else if (preguntaBot) {
            respuestaBot = elegir(respuestasBot);
        } else if (preguntaPrecio) {
            respuestaBot = elegir(respuestasPrecio);
        } else if (preguntaDisponible) {
            respuestaBot = elegir(respuestasDisponibilidad);
        } else if (preguntaEstudios) {
            respuestaBot = elegir(respuestasEstudios);
        } else if (preguntaTecnologias) {
            respuestaBot = elegir(respuestasTecnologias);
        } else if (preguntaProyectos) {
            respuestaBot = elegir(respuestasProyectos);
        } else if (preguntaContacto) {
            respuestaBot = elegir(respuestasContacto);
        } else if (preguntaUbicacion) {
            respuestaBot = elegir(respuestasUbicacion);
        } else if (esHumor) {
            respuestaBot = elegir(respuestasHumor);
        } else {
            respuestaBot = elegir(respuestasGeneral);
        }

        res.json({ respuesta: respuestaBot });

    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ respuesta: "Uy, me desconecté un segundo de la base de datos. ¿Puedes intentar de nuevo?" });
    }
});

// Ruta para ver los mensajes
app.get('/api/mensajes', async (req, res) => {
    try {
        const resultado = await pool.query('SELECT * FROM mensajes_chat ORDER BY fecha DESC');
        res.json(resultado.rows);
    } catch (error) {
        res.status(500).json({ error: "Error al leer la base de datos" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Bot encendido y escuchando en el puerto ${PORT}`);
});
