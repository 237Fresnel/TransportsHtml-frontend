 
// script.js
// Gère l'affichage des onglets, l'envoi des formulaires (CREATE), la récupération (READ) et l'affichage des données,
// et les actions Modifier/Supprimer (concepts de base).

// *** MODIFICATION : Définir l'URL du backend ***
// Remplacez ceci par l'URL publique de votre backend Railway après le déploiement
const BACKEND_URL = 'transportshtml-backend-api-production.up.railway.app'; // Remplacez ceci !
// ********************************************

document.addEventListener('DOMContentLoaded', () => {
    // --- Gestion des onglets ---
    const tabLinks = document.querySelectorAll('.tab-link');
    const tabContents = document.querySelectorAll('.tab-content');

    tabLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const tabId = this.getAttribute('data-tab');

            // Retire la classe active de tous les onglets et sections
            tabLinks.forEach(l => l.classList.remove('active'));
            tabContents.forEach(section => section.classList.remove('active'));

            // Ajoute la classe active à l'onglet cliqué et à la section correspondante
            this.classList.add('active');
            const targetSection = document.getElementById(tabId);
            if (targetSection) {
                targetSection.classList.add('active');
                // --- Charger les données quand l'onglet est activé ---
                fetchData(tabId, `list-${tabId}`);
            }
        });
    });

    // --- Création (POST) Operations ---

    const forms = [
        'form-villes', // Corresponds to 'ville' table API endpoint /api/villes
        'form-routes', // Corresponds to 'route' table API endpoint /api/routes
        'form-projets', // Corresponds to 'projet' table API endpoint /api/projets
        'form-vehicules', // Corresponds to 'vehicule' table API endpoint /api/vehicules
        'form-accidents', // Corresponds to 'accident' table API endpoint /api/accidents
        'form-gares', // Corresponds to 'gare' table API endpoint /api/gares
        'form-aires_repos', // Corresponds to 'aire_repos' table API endpoint /api/aires_repos
        'form-ponts', // Corresponds to 'pont' table API endpoint /api/ponts
        'form-centroides' // Corresponds to 'centroide' table API endpoint /api/centroides
        // Add other forms for other entities if needed
    ];
    forms.forEach(formId => {
        const form = document.getElementById(formId);
        if (form) {
            form.addEventListener('submit', function (e) {
                e.preventDefault();
                // Préparer les données du formulaire
                const data = {};
                Array.from(form.elements).forEach(el => {
                    // Inclure seulement les éléments avec un 'name' et une 'value' définie (non vide)
                    if (el.name && el.value !== undefined && el.value !== '') {
                         // Tentative de conversion en nombre si le type est number
                         if (el.type === 'number') {
                              data[el.name] = Number(el.value);
                         } else {
                             data[el.name] = el.value;
                         }
                    }
                    // Les champs vides (pour les colonnes non requises) ne sont pas inclus dans 'data',
                    // le backend devra gérer l'insertion de NULL pour les colonnes manquantes.
                });

                // Gérer les champs JSON : 'localisation' et 'position'
                // Le backend s'attend à un objet JSON ou null
                const jsonFields = ['localisation', 'position']; // Liste des noms de champs JSON
                jsonFields.forEach(fieldName => {
                    if (data[fieldName] !== undefined) { // Si le champ existe dans les données collectées
                        if (typeof data[fieldName] === 'string' && data[fieldName].trim() !== '') {
                            try {
                                data[fieldName] = JSON.parse(data[fieldName]);
                            } catch (e) {
                                console.error(`JSON invalide pour le champ '${fieldName}':`, data[fieldName], e);
                                data[fieldName] = null; // Envoyer null si JSON invalide
                                alert(`Attention: Le champ '${fieldName}' contient du JSON invalide et sera enregistré comme vide.`);
                            }
                        } else if (data[fieldName] === '') { // Si le champ était vide (chaîne vide)
                             data[fieldName] = null; // Envoyer null pour les champs vides
                        }
                         // Si c'est déjà un objet, on le laisse tel quel
                    }
                     // Si le champ n'était même pas présent dans le formulaire ou était non rempli et non inclus, il ne sera pas dans 'data', ce qui est géré par le backend.
                });


                // Déterminer le point d'API cible basé sur l'ID du formulaire
                const endpoint = formId.replace('form-', ''); // Ex: 'form-villes' -> 'villes'

                // *** MODIFICATION : Utiliser l'URL du backend définie ***
                fetch(`${BACKEND_URL}/api/${endpoint}`, {
                // ****************************************************
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                })
                .then(res => {
                    if (!res.ok) {
                        // Tenter de lire l'erreur du backend si disponible
                        return res.json().then(errJson => {
                            // Afficher l'erreur spécifique du backend si elle existe, sinon une erreur générique
                            throw new Error(errJson.error || `Erreur réseau, statut ${res.status}`);
                        });
                    }
                    return res.json();
                })
                .then(result => {
                    alert('Succès: ' + (result.message || 'Enregistré !'));
                    form.reset(); // Réinitialiser le formulaire après succès
                    // Recharger la liste des données après ajout
                    fetchData(endpoint, `list-${endpoint}`);
                })
                .catch(err => {
                    console.error(`Erreur lors de l\'envoi du formulaire ${formId}:`, err);
                    alert('Erreur lors de l\'envoi: ' + err.message);
                });
            });
        }
    }); // Fin forms.forEach

    // --- Read (GET) Operations ---

    // Fonction pour récupérer et afficher les données pour un point d'API et un élément de liste donnés
    async function fetchData(endpoint, listId) {
        const listElement = document.getElementById(listId);
        if (!listElement) return;

        listElement.innerHTML = '<h3>Chargement...</h3><p>Chargement des données en cours...</p>'; // Indicateur de chargement amélioré

        try {
            // *** MODIFICATION : Utiliser l'URL du backend définie ***
            const res = await fetch(`${BACKEND_URL}/api/${endpoint}`);
            // ****************************************************
            if (!res.ok) {
                throw new Error(`Erreur HTTP! statut: ${res.status}`);
            }
            const data = await res.json();
            displayData(data, listElement, endpoint); // Afficher les données récupérées
        } catch (err) {
            console.error(`Erreur lors du chargement des données pour ${endpoint}:`, err);
             listElement.innerHTML = `<h3>Erreur de chargement</h3><p>Impossible de charger les données pour ${endpoint}. Détails : ${err.message}</p>`;
        }
    }

    // Fonction pour afficher les données dans un tableau
    function displayData(data, listElement, endpoint) {
        listElement.innerHTML = `<h3>Liste des ${endpoint.charAt(0).toUpperCase() + endpoint.slice(1).replace(/_/g, ' ')} (${data.length})</h3>`;

        if (data.length === 0) {
            listElement.innerHTML += '<p class="no-data">Aucune donnée disponible.</p>';
            return;
        }

        // Créer un conteneur pour le tableau afin de gérer le scroll
        const tableContainer = document.createElement('div');
        tableContainer.classList.add('table-container');

        // Créer un tableau
        const table = document.createElement('table');
        const thead = table.createTHead();
        const tbody = table.createTBody();
        const headerRow = thead.insertRow();

        // Créer les en-têtes à partir des clés du premier objet de données
        // Exclure les champs 'created_at' et 'updated_at' si vous ne voulez pas les afficher
        const keys = Object.keys(data[0]).filter(key => key !== 'created_at' && key !== 'updated_at');

        keys.forEach(key => {
            const th = document.createElement('th');
             // Tenter de rendre le snake_case plus lisible (ex: id_ville -> Id Ville)
            th.textContent = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
            headerRow.appendChild(th);
        });
         // Ajouter l'en-tête pour les Actions (Modifier/Supprimer)
        const thActions = document.createElement('th');
        thActions.textContent = 'Actions';
        headerRow.appendChild(thActions);

        // Remplir le corps du tableau avec les lignes de données
        data.forEach(item => {
            const row = tbody.insertRow();
            keys.forEach(key => {
                const cell = row.insertCell();
                let cellContent = item[key];
                let isJsonCell = false; // Flag pour marquer les cellules JSON

                // Formatage pour les types complexes ou dates
                 if (cellContent === null) {
                     cellContent = 'N/A'; // Afficher null comme N/A
                 } else if (typeof cellContent === 'object') {
                     cellContent = JSON.stringify(cellContent, null, 2); // Afficher les objets JSON joliment formatés avec indentation
                     isJsonCell = true; // Marquer comme cellule JSON
                 } else if (typeof cellContent === 'boolean') {
                    cellContent = cellContent ? 'Oui' : 'Non'; // Afficher les booléens lisiblement
                 }
                 else if ((key.includes('date') || key.includes('_at')) && cellContent) { // Format les champs dont le nom inclut 'date' ou '_at'
                      try {
                        const dateObj = new Date(cellContent);
                        if (!isNaN(dateObj.getTime())) {
                            // Format simple YYYY-MM-DD, inclure heure si pertinent
                             cellContent = dateObj.toISOString().split('T')[0];
                             // If you want datetime: cellContent = dateObj.toLocaleString();
                        } else {
                             cellContent = String(cellContent); // Fallback si le parsing de date échoue
                        }
                     } catch (e) {
                         cellContent = String(cellContent); // Fallback
                     }
                 } else {
                     cellContent = String(cellContent); // Assurer que tout le reste est une chaîne
                 }

                cell.textContent = cellContent;

                // Ajouter la classe si c'est une cellule JSON
                if (isJsonCell) {
                    cell.classList.add('json-cell');
                }
            });

             // Ajouter les boutons d'action (Modifier/Supprimer)
            const cellActions = row.insertCell();
            // IMPORTANT: Ensure your tables have an 'id' column as the primary key for this to work.
            // The schema.sql provided uses 'id' as PRIMARY KEY for main entities.
            if (item.id !== undefined) {
                 cellActions.innerHTML = `
                    <button onclick="editItem('${endpoint}', ${item.id})">Modifier</button>
                    <button onclick="deleteItem('${endpoint}', ${item.id})">Supprimer</button>
                 `;
                 cellActions.style.minWidth = '160px'; // Minimum width for actions column
                 cellActions.style.maxWidth = '160px'; // Fixed width for actions column
                 cellActions.style.overflow = 'visible'; // Ensure buttons are not hidden
                 cellActions.style.whiteSpace = 'nowrap'; // Ensure buttons stay on one line
            } else {
                cellActions.textContent = 'Pas d\'ID'; // Message si item n'a pas d'ID
                 cellActions.style.minWidth = '80px';
                 cellActions.style.maxWidth = '80px';
            }
        });

        // Ajouter le tableau à son conteneur, puis le conteneur à l'élément de liste
        tableContainer.appendChild(table);
        listElement.appendChild(tableContainer);
    }

    // --- CRUD (Update/Delete implementations - Basic Placeholder) ---

    // Implémentation de la fonctionnalité Modifier
    // Cette fonction devrait idéalement récupérer les données de l'élément et pré-remplir le formulaire pour l'édition
    window.editItem = async (endpoint, itemId) => {
        console.log(`Modification de l'élément ${itemId} de ${endpoint}`);
        try {
            // Endpoint au singulier si le backend utilise /api/ville/:id
            // Ceci est une heuristique simple, ajustez si votre backend utilise une autre convention
            const itemEndpoint = endpoint.endsWith('s') ? endpoint.slice(0, -1) : endpoint;

            // *** MODIFICATION : Utiliser l'URL du backend définie ***
            const res = await fetch(`${BACKEND_URL}/api/${endpoint}/${itemId}`);
            // ****************************************************

            if (!res.ok) throw new Error(`Élément ${itemId} non trouvé. Statut: ${res.status}`);
            const itemData = await res.json();
            console.log("Données pour édition:", itemData);

            // Trouver le formulaire correspondant
            const formId = `form-${endpoint}`; // Assuming endpoint 'villes' -> form 'form-villes'
            const form = document.getElementById(formId);

            if (!form) {
                throw new Error(`Formulaire ${formId} non trouvé.`);
            }

            // Pré-remplir le formulaire avec les données existantes
            Object.keys(itemData).forEach(key => {
                const input = form.elements[key];
                if (input) {
                    // Gérer les différents types d'entrées
                    if (input.type === 'textarea' || input.tagName.toLowerCase() === 'textarea') {
                        // Pour les champs JSON (localisation, position), formater en JSON string
                        if (typeof itemData[key] === 'object' && itemData[key] !== null) {
                            input.value = JSON.stringify(itemData[key], null, 2);
                        } else {
                            input.value = itemData[key] || '';
                        }
                    } else if (input.type === 'date' && itemData[key]) {
                        // Formater les dates pour les inputs de type date (YYYY-MM-DD)
                        const dateValue = new Date(itemData[key]);
                        if (!isNaN(dateValue.getTime())) {
                            input.value = dateValue.toISOString().split('T')[0];
                        } else {
                             input.value = ''; // Clear if date is invalid
                        }
                    } else if (input.type === 'number') {
                         input.value = itemData[key] !== null ? itemData[key] : ''; // Handle null numbers
                    }
                    else {
                        // Autres types d'entrées (text, etc.)
                        input.value = itemData[key] !== null ? itemData[key] : '';
                    }
                }
            });

            // Changer le libellé du bouton de soumission
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.textContent = 'Mettre à jour';
                submitBtn.dataset.originalText = 'Ajouter'; // Enregistrer le texte d'origine

                 // Store the endpoint and ID on the button itself or form for the PUT request handler
                 submitBtn.dataset.endpoint = endpoint;
                 submitBtn.dataset.itemId = itemId;

                 // Temporarily disable default form submission and add update listener
                 form.dataset.currentAction = 'update'; // Mark form for update
            }

            // Faire défiler jusqu'au formulaire et lui donner le focus
            form.scrollIntoView({ behavior: 'smooth', block: 'start' });

            // Ajouter une classe de surbrillance temporaire pour attirer l'attention
            form.classList.add('edit-mode');

            // Remove the class after a delay
            setTimeout(() => {
                form.classList.remove('edit-mode');
            }, 3000); // Remove highlight after 3 seconds


        } catch (err) {
            console.error(`Erreur lors du chargement pour modification de ${endpoint}/${itemId}:`, err);
            alert(`Erreur lors du chargement des données pour modification: ${err.message}`);
        }
    };

     // Add event listener to handle both Add and Update submissions based on form state
    forms.forEach(formId => {
        const form = document.getElementById(formId);
        if (form) {
            // Remove previous listeners to avoid duplicates, or better, manage state
            // For simplicity, we'll use the dataset.currentAction flag and re-add listeners if needed.
            // A more robust solution would involve cloning or removing listeners more carefully.
            // For now, we rely on the flag in the submit handler below.

            form.addEventListener('submit', async function (e) {
                e.preventDefault();
                const currentAction = form.dataset.currentAction || 'add'; // Default to add

                const data = {};
                Array.from(form.elements).forEach(el => {
                    if (el.name && el.value !== undefined && el.value !== '') {
                         if (el.type === 'number') {
                              data[el.name] = Number(el.value);
                         } else {
                             data[el.name] = el.value;
                         }
                    }
                });

                // Gérer les champs JSON
                const jsonFields = ['localisation', 'position'];
                jsonFields.forEach(fieldName => {
                    if (data[fieldName] !== undefined) {
                         if (typeof data[fieldName] === 'string' && data[fieldName].trim() !== '') {
                            try {
                                data[fieldName] = JSON.parse(data[fieldName]);
                            } catch (e) {
                                console.error(`JSON invalide pour le champ '${fieldName}':`, data[fieldName], e);
                                data[fieldName] = null;
                                // alert(`Attention: Le champ '${fieldName}' contient du JSON invalide et sera enregistré comme vide.`); // Alert already given on edit load
                            }
                        } else if (data[fieldName] === '') {
                             data[fieldName] = null;
                        }
                    }
                });

                const submitBtn = form.querySelector('button[type="submit"]');
                const endpoint = submitBtn.dataset.endpoint || formId.replace('form-', ''); // Get endpoint from button or formId

                if (currentAction === 'add') {
                     // --- Handle Add (POST) ---
                     console.log("Action: Add (POST)");
                     // Fetch call is already implemented above in the first form.addEventListener loop.
                     // To avoid duplicate listeners/logic, we can refactor this submit handler.
                     // Let's move the core fetch logic into separate functions.
                     handlePost(endpoint, data, form); // Call a new function for POST
                } else if (currentAction === 'update') {
                     // --- Handle Update (PUT) ---
                     console.log("Action: Update (PUT)");
                     const itemId = submitBtn.dataset.itemId;
                     if (!itemId) {
                        console.error("Update action triggered but no item ID found!");
                        alert("Erreur: Impossible de mettre à jour sans ID d'élément.");
                        return;
                     }
                     handlePut(endpoint, itemId, data, form); // Call a new function for PUT
                }
            }); // End form.addEventListener
        } // End if form
    }); // End forms.forEach

     // Refactored POST handler
    async function handlePost(endpoint, data, form) {
        try {
            // *** MODIFICATION : Utiliser l'URL du backend définie ***
            const res = await fetch(`${BACKEND_URL}/api/${endpoint}`, {
            // ****************************************************
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!res.ok) {
                 return res.json().then(errJson => {
                     throw new Error(errJson.error || `Erreur réseau, statut ${res.status}`);
                 });
            }
            const result = await res.json();
            alert('Succès: ' + (result.message || 'Enregistré !'));
            form.reset();
            fetchData(endpoint, `list-${endpoint}`);

        } catch (err) {
            console.error(`Erreur lors de l\'envoi du formulaire ${form.id}:`, err);
            alert('Erreur lors de l\'envoi: ' + err.message);
        }
    }

     // Refactored PUT handler
    async function handlePut(endpoint, itemId, data, form) {
        try {
            // *** MODIFICATION : Utiliser l'URL du backend définie ***
            const res = await fetch(`${BACKEND_URL}/api/${endpoint}/${itemId}`, {
            // ****************************************************
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!res.ok) {
                 return res.json().then(errJson => {
                     throw new Error(errJson.error || `Erreur lors de la mise à jour, statut ${res.status}`);
                 });
            }
            const result = await res.json();
            alert('Succès: ' + (result.message || 'Données mises à jour !'));

            // Reset form state after update
            form.dataset.currentAction = 'add';
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn && submitBtn.dataset.originalText) {
                submitBtn.textContent = submitBtn.dataset.originalText;
                 delete submitBtn.dataset.endpoint;
                 delete submitBtn.dataset.itemId;
                 delete submitBtn.dataset.originalText;
            }
             form.reset(); // Clear form fields

            // Recharger la liste des données
            fetchData(endpoint, `list-${endpoint}`);

        } catch (err) {
            console.error(`Erreur lors de la mise à jour des données pour ${endpoint}/${itemId}:`, err);
            alert('Erreur lors de la mise à jour: ' + err.message);
        }
    }


    // Implémentation de la fonctionnalité Supprimer
    window.deleteItem = async (endpoint, itemId) => {
        if (confirm(`Êtes-vous sûr de vouloir supprimer l'élément ${itemId} de ${endpoint} ?\nCette action est irréversible.`)) {
            try {
                 // *** MODIFICATION : Utiliser l'URL du backend définie ***
                const res = await fetch(`${BACKEND_URL}/api/${endpoint}/${itemId}`, {
                // ****************************************************
                    method: 'DELETE',
                });
                if (!res.ok) {
                     // Tenter de lire l'erreur du backend si disponible
                    return res.json().then(errJson => {
                        // Afficher l'erreur spécifique du backend (comme une violation de clé étrangère)
                        throw new Error(errJson.error || `Erreur réseau lors de la suppression, statut ${res.status}`);
                    });
                }
                // La suppression a réussi
                alert('Élément supprimé avec succès !');
                // Recharger la liste des données pour refléter la suppression
                fetchData(endpoint, `list-${endpoint}`);
            } catch (err) {
                console.error(`Erreur lors de la suppression de ${endpoint}/${itemId}:`, err);
                alert('Erreur lors de la suppression : ' + err.message);
            }
        }
    };

     // --- Fonctionnalités Avancées (Non implémentées dans cet exemple simple) ---
     // Pour une application complète, il faudrait:
     // 1. Récupérer les données des tables de référence (e.g., /api/type_revetement)
     // 2. Peupler les <select> dans les formulaires avec ces données via JavaScript.
     // 3. Implémenter les routes GET par ID, PUT et DELETE pour TOUTES les entités principales dans le backend.
     // 4. Gérer l'édition en chargeant les données de l'élément dans le formulaire d'ajout (qui deviendrait un formulaire d'édition) ou dans un formulaire séparé/modal.
     // 5. Gérer les relations N-N (tables de jointure) via des formulaires et endpoints dédiés.
});