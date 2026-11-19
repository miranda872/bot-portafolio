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

// Ruta principal del Chat
app.post('/api/chat', async (req, res) => {
    const mensajeUsuario = req.body.mensaje;

    try {
        // 1. Siempre guardar el mensaje primero
        await pool.query('INSERT INTO mensajes_chat (mensaje) VALUES ($1)', [mensajeUsuario]);

        // 2. Analizar lo que dijo el usuario pasándolo a minúsculas
        const texto = mensajeUsuario.toLowerCase();
        let respuestaBot = "";

        // 3. Diccionarios de palabras clave
        const esSaludo = ['hola', 'buenas', 'qué tal', 'que tal', 'saludos', 'hey'].some(p => texto.includes(p));
        const esDespedida = ['adiós', 'adios', 'chao', 'nos vemos', 'hasta luego', 'bye'].some(p => texto.includes(p));
        const esGracias = ['gracias', 'genial', 'perfecto', 'ok', 'vale', 'listo'].some(p => texto.includes(p));
        const preguntaTecnologias = ['tecnología', 'tecnologia', 'skills', 'sabes', 'lenguaje', 'programar'].some(p => texto.includes(p));
        const preguntaProyectos = ['proyecto', 'trabajo', 'portafolio', 'experiencia'].some(p => texto.includes(p));
        const preguntaContacto = ['contacto', 'correo', 'email', 'teléfono', 'contratar', 'hablar', 'escribir'].some(p => texto.includes(p));
        const preguntaBot = ['qué eres', 'que eres', 'quién eres', 'quien eres', 'bot', 'inteligencia', 'chat'].some(p => texto.includes(p));

        // 4. Decidir qué responder
        if (esSaludo) {
            respuestaBot = "¡Hola! Qué gusto saludarte. 👋 ¿En qué te puedo ayudar hoy?";
        } else if (esDespedida) {
            respuestaBot = "¡Hasta pronto! Recuerda que puedes dejarme tu correo si quieres que me contacte contigo.";
        } else if (esGracias) {
            respuestaBot = "¡De nada! Aquí estoy si necesitas saber algo más sobre mi perfil. 😊";
        } else if (preguntaBot) {
            respuestaBot = "Soy un asistente virtual.  Mi trabajo es responder tus dudas y guardar tus mensajes en la base de datos";
        } else if (preguntaTecnologias) {
            respuestaBot = "Me especializo en desarrollo web. Manejo HTML, CSS, JavaScript en el frontend, y Node.js con bases de datos SQL en el backend. 💻";
        } else if (preguntaProyectos) {
            respuestaBot = "En esta web puedes ver mis trabajos destacados. ¡De hecho, este chat que estás usando es uno de mis proyectos full-stack!";
        } else if (preguntaContacto) {
            respuestaBot = "¡Claro! Escribe tu correo o número de teléfono aquí mismo y yo me encargaré de guardarlo de forma segura para escribirte lo más pronto posible. ✉️";
        } else {
            // 5. Si no entiende, escoge una respuesta aleatoria para no sonar repetitivo
            const respuestasVariadas = [
                "Interesante... 🤔 Ya guardé este mensaje en mi base de datos. ¿Te gustaría saber algo sobre mis proyectos o tecnologías?",
                "¡Tomaré nota de eso! 📝 ¿Puedo ayudarte con alguna otra duda sobre mi perfil?",
                "No estoy 100% seguro de entender, pero ya lo registré. ¿Quieres que hablemos de mis habilidades o prefieres dejarme tu contacto de una vez?"
            ];
            respuestaBot = respuestasVariadas[Math.floor(Math.random() * respuestasVariadas.length)];
        }

        // 6. Enviar la respuesta
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
