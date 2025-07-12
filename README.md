# TransportsHtml

Ce projet est une page web simple qui présente des informations sur différents moyens de transport. Il est composé principalement de deux fichiers :

- `index.html` : le fichier principal qui contient le code HTML de la page.
- `style.css` : la feuille de style associée pour l'apparence visuelle.

## Fonctionnalités
- Affichage d'une page web statique listant différents moyens de transport.
- Mise en forme personnalisée via CSS.

## Comment ça fonctionne ?
1. Ouvrez le fichier `index.html` dans un navigateur web moderne (comme Chrome, Firefox, Edge, etc.).
2. Le navigateur affichera automatiquement la page avec les styles définis dans `style.css` (assurez-vous que les deux fichiers sont dans le même dossier).

## Lancer le projet

### 1. Frontend (interface web)
Aucune installation n'est nécessaire pour la partie interface :

1. Télécharger ou cloner le dossier contenant `index.html`, `style.css` et `script.js`.
2. Double-cliquer sur `index.html` ou l'ouvrir avec votre navigateur préféré.

### 2. Backend (ExpressJS + PostgreSQL)
Pour enregistrer les données des formulaires dans la base PostgreSQL `transports` :

1. Installer [Node.js](https://nodejs.org/) et [PostgreSQL](https://www.postgresql.org/) si ce n'est pas déjà fait.
2. Créer la base de données `transports` et les tables nécessaires (voir plus bas).
3. Aller dans le dossier `backend` :
   ```bash
   cd backend
   ```
4. Installer les dépendances :
   ```bash
   npm install
   ```
5. Lancer le serveur backend :
   ```bash
   npm start
   ```
6. Le backend écoute sur http://localhost:3000

### 3. Structure du projet
```
transportsHtml/
├── index.html
├── style.css
├── script.js
├── README.md
└── backend/
    ├── server.js
    └── package.json
```

### 4. Connexion à PostgreSQL
- Par défaut, la connexion utilise :
  - utilisateur : `postgres`
  - mot de passe : `postgres`
  - base : `trip`
  - port : `5432`
- Modifiez ces paramètres dans `backend/server.js` si besoin.

### 5. Ecriture dans la base de donnees psql (exemple SQL)
le fichier test_data.sql contient des insertions d'elements de test pour les tables de la base de donnees.
le fichier schema.sql contient la structure des tables de la base de donnees.

Pour créer la base de donnees et les tables, vous pouvez utiliser la commande suivante :

```bash
psql -U postgres -d trip -f schema.sql
```

Pour exécuter le fichier test_data.sql, vous pouvez utiliser la commande suivante :

```bash
psql -U postgres -d trip -f test_data.sql
```

## Auteur
- KENGNE TUEGUEM FRESNEL GRACE

N'hésitez pas à modifier ou à adapter le projet selon vos besoins !
