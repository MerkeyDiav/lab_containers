const express = require('express');
const app = express();
const PORT = 3000;

// Middleware pour parser le JSON
app.use(express.json());

// Tableau de tâches en mémoire (initialisé avec des exemples sur le thème Cloud/Docker)
let tasks = [
    { id: 1, title: 'Déployer un cluster ECS Fargate', done: true },
    { id: 2, title: 'Configurer un Application Load Balancer', done: false },
    { id: 3, title: 'Créer une image Docker du backend', done: true }
];

// Route GET /api/tasks - Renvoie toutes les tâches
app.get('/api/tasks', (req, res) => {
    res.json(tasks);
});

// Route POST /api/tasks - Ajoute une nouvelle tâche
app.post('/api/tasks', (req, res) => {
    const { title } = req.body;
    
    if (!title || title.trim() === '') {
        return res.status(400).json({ error: 'Le titre est requis' });
    }
    
    const newTask = {
        id: tasks.length + 1,
        title: title.trim(),
        done: false
    };
    
    tasks.push(newTask);
    res.status(201).json(newTask);
});

// Démarrage du serveur
app.listen(PORT, () => {
    console.log(`Backend API running on port ${PORT}`);
});