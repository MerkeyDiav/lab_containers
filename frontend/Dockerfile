# Image de base NGINX officielle
FROM nginx:latest

# Copie du fichier HTML vers le répertoire par défaut de NGINX
COPY index.html /usr/share/nginx/html/index.html

# Le port 80 est exposé par défaut par l'image nginx:latest
EXPOSE 80

# Pas de commande CMD nécessaire car NGINX démarre automatiquement
# avec sa configuration par défaut