# Image de base légère Node.js
FROM node:18-alpine

# Répertoire de travail
WORKDIR /app

# Copie du package.json et package-lock.json AVANT l'installation
COPY package*.json ./

# Installation des dépendances (express + mysql2)
RUN npm install

# Copie du code source
COPY app.js .

# Exposition du port
EXPOSE 3000

# Commande de démarrage
CMD ["node", "app.js"]