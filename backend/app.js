const express = require('express');
const mysql = require('mysql2/promise');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuration MySQL via variables d'environnement
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'todo_db',
    port: process.env.DB_PORT || 3306
};

let pool;

// Initialisation de la connexion MySQL
async function initDB() {
    let tempPool;
    
    try {
        // 1. Connexion sans base de données pour créer la base si nécessaire
        tempPool = mysql.createPool({
            host: dbConfig.host,
            user: dbConfig.user,
            password: dbConfig.password,
            port: dbConfig.port,
            waitForConnections: true,
            connectionLimit: 2
        });

        // Création de la base de données si elle n'existe pas
        await tempPool.execute(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\``);
        console.log(`Base de données '${dbConfig.database}' vérifiée/créée`);
        
        // Fermer la connexion temporaire
        await tempPool.end();
        
        // 2. Connexion à la base de données créée
        pool = mysql.createPool({
            host: dbConfig.host,
            user: dbConfig.user,
            password: dbConfig.password,
            database: dbConfig.database,
            port: dbConfig.port,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });

        // Création de la table si elle n'existe pas
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS tasks (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                done BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        console.log('Connexion MySQL établie et table vérifiée');
    } catch (error) {
        console.error('Erreur de connexion MySQL:', error.message);
        process.exit(1);
    }
}

// Middleware pour parser le JSON
app.use(express.json());

// Route racine pour vérification
app.get('/', (req, res) => {
    res.json({ 
        message: 'Backend API - Cloud Todo List',
        status: 'running',
        database: 'MySQL RDS'
    });
});

// Route GET /api/tasks - Renvoie toutes les tâches
app.get('/api/tasks', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT id, title, done, created_at FROM tasks ORDER BY created_at DESC');
        res.json(rows);
    } catch (error) {
        console.error('Erreur GET /api/tasks:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Route POST /api/tasks - Ajoute une nouvelle tâche
app.post('/api/tasks', async (req, res) => {
    try {
        const { title } = req.body;
        
        if (!title || title.trim() === '') {
            return res.status(400).json({ error: 'Le titre est requis' });
        }
        
        const [result] = await pool.execute(
            'INSERT INTO tasks (title, done) VALUES (?, ?)',
            [title.trim(), false]
        );
        
        const [rows] = await pool.execute('SELECT id, title, done, created_at FROM tasks WHERE id = ?', [result.insertId]);
        
        res.status(201).json(rows[0]);
    } catch (error) {
        console.error('Erreur POST /api/tasks:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Route PUT /api/tasks/:id - Met à jour une tâche (toggle done)
app.put('/api/tasks/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { done } = req.body;
        
        await pool.execute('UPDATE tasks SET done = ? WHERE id = ?', [done, id]);
        
        const [rows] = await pool.execute('SELECT id, title, done, created_at FROM tasks WHERE id = ?', [id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Tâche non trouvée' });
        }
        
        res.json(rows[0]);
    } catch (error) {
        console.error('Erreur PUT /api/tasks:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Route DELETE /api/tasks/:id - Supprime une tâche
app.delete('/api/tasks/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        await pool.execute('DELETE FROM tasks WHERE id = ?', [id]);
        
        res.status(204).send();
    } catch (error) {
        console.error('Erreur DELETE /api/tasks:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Démarrage du serveur
async function startServer() {
    await initDB();
    app.listen(PORT, () => {
        console.log(`Backend API running on port ${PORT}`);
    });
}

startServer();