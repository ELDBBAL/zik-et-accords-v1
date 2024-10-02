/* Code : app.js 
** Created at : 30 Septembre 2024
** Updated at : 01 Octobre 2024
** Author : David Ldbbàl
** Purpose : Gestion de la transposition d'accords et affichage de chansons
*/

// Liste des accords majeurs et mineurs
const chords = ["C", "C#", "D", "Eb", 
    "E", "F", "F#", "G", 
    "Ab", "A", "Bb", "B"];

// Fonction de transposition d'un accord (incluant les accords mineurs)
function transposeChord(chord, steps) {
// Vérifie si l'accord est mineur
const isMinor = chord.endsWith("m");
const rootChord = isMinor ? chord.slice(0, -1) : chord; // Retire le 'm' si mineur

// Trouver l'index de la racine de l'accord
let index = chords.indexOf(rootChord);
if (index === -1) return chord;  // Si l'accord n'est pas dans la liste

// Calcule le nouvel index après transposition
index = (index + steps + chords.length) % chords.length;
const transposedRootChord = chords[index];

// Si c'était un accord mineur, on conserve le 'm'
return isMinor ? transposedRootChord + "m" : transposedRootChord;
}

// Fonction qui transpose les accords dans une ligne de texte
function transposeTextLine(line, steps) {
const chordRegex = /\(([^)]+)\)/g;
return line.replace(chordRegex, (match, chord) => {
const transposedChord = transposeChord(chord, steps);
return `(${transposedChord})`;
});
}

// Transpose les accords d'une chanson
function transposeSong(song, steps) {
return song.verses.map(verse =>
verse.map(line => ({
...line,
text: transposeTextLine(line.text, steps)
}))
);
}

// Fonction pour obtenir la position du capo
const getCapoPosition = (key) => {
    const capoPositions = {
        "C": "Pas de capo (C)",
        "C#": "Capo sur 1 (C)",
        "D": "Capo sur 2 (C)",
        "Eb": "Capo sur 3 (C)",
        "E": "Capo sur 4 (C)",
        "F": "Capo sur 5 (C)",
        "F#": "Capo sur 6 (C)",
        "G": "Pas de capo (G)",
        "Ab": "Capo sur 1 (G)",
        "A": "Capo sur 2 (G)",
        "Bb": "Capo sur 3 (G)",
        "B": "Capo sur 4 (G)",
    };
    return capoPositions[key] || "Capo non défini";
};

// Récupérer les paramètres d'URL
function getUrlParams() {
    const params = {};
    const search = window.location.search.substring(1);
    if (search) {
            search.split("&").forEach(param => {
            const [key, value] = param.split("=");
            params[key] = decodeURIComponent(value);
        });
    }
    return params;
}

// Variable pour stocker la clé actuelle
let currentKey = null;

// Modifier la fonction pour configurer les contrôles de transposition
function setupTransposeControl(song, songContainer) {
    const transposeContainer = document.createElement('div');
    transposeContainer.classList.add('transpose-controls');

    const label = document.createElement('label');
    label.textContent = "Transposer :";
    transposeContainer.appendChild(label);

    const select = document.createElement('select');
    chords.forEach((chord, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = chord;
        if (chord === song.keySignature) {
            option.selected = true;
        }
        select.appendChild(option);
    });

    const capoInfoLine = document.createElement('span');
    capoInfoLine.textContent = getCapoPosition(song.keySignature);
    transposeContainer.appendChild(select);
    transposeContainer.appendChild(capoInfoLine);

    const handleTranspose = (e) => {
        const selectedIndex = parseInt(e.target.value);
        const originalIndex = chords.indexOf(song.keySignature);
        const transpositionSteps = selectedIndex - originalIndex;

        const originalKey = songContainer.dataset.originalKey;
        const originalSong = { ...song, keySignature: originalKey };

        // Mettre à jour la clé actuelle
        currentKey = transposeChord(originalKey, transpositionSteps);
        
        // Mettre à jour le contenu du songContainer
        displaySong(originalSong, transpositionSteps, songContainer);

        // Mettre à jour l'information du capo
        capoInfoLine.textContent = getCapoPosition(currentKey);

        // Réinsérer les contrôles de transposition au début
        songContainer.insertBefore(transposeContainer, songContainer.firstChild);
    };

    select.addEventListener('change', handleTranspose);

    return transposeContainer;
}

// Fonction pour afficher une chanson avec ses accords transposés
function displaySong(song, transpositionSteps = 0, container = null) {
    const songContainer = container || document.createElement('div');
    songContainer.classList.add('song');
    songContainer.dataset.originalKey = song.keySignature;
    
    // Sauvegarder les contrôles de transposition s'ils existent
    const existingTransposeControls = songContainer.querySelector('.transpose-controls');
    
    songContainer.innerHTML = ''; // Vider le contenu existant
    
    // Réinsérer les contrôles de transposition s'ils existaient
    if (existingTransposeControls) {
        songContainer.appendChild(existingTransposeControls);
    }
    
    // Ajouter le titre de la chanson
    const title = document.createElement('h2');
    title.textContent = `${song.title}`;
    songContainer.appendChild(title);

    // Ajouter le lien YouTube sous le titre
    if (song.youtubeLink) {
        const youtubeLink = document.createElement('a');
        youtubeLink.href = song.youtubeLink;
        youtubeLink.textContent = "Écouter sur YouTube";
        youtubeLink.target = "_blank"; // Ouvrir dans un nouvel onglet
        youtubeLink.classList.add('youtube-link'); // Optionnel : ajouter une classe pour le style
        songContainer.appendChild(youtubeLink);
    }

    // Transposer les vers
    const transposedVerses = transposeSong(song, transpositionSteps);

    transposedVerses.forEach((verse, index) => {
        const verseDiv = document.createElement('div');
        verseDiv.classList.add('verse');

        verse.forEach((line, lineIndex) => {
            const p = document.createElement('p');
            if (line.text.startsWith("CHORUS:")) {
                p.classList.add('chorus');
                p.innerHTML = line.text;
            } else {
                p.innerHTML = line.text.replace(/\(([^)]+)\)/g, (match, chord) => {
                    return `<span class="chord">(${chord})</span>`;
                });
            }
            verseDiv.appendChild(p);
        });

        songContainer.appendChild(verseDiv);
    });

    return songContainer;
}


// Fonction pour charger les chansons à partir des paramètres d'URL
function loadSongs() {
    const params = getUrlParams();
    const selectedKey = params.key;

    const filteredSongs = selectedKey ? songs.filter(song => song.key === selectedKey) : songs;

    const songContainer = document.getElementById('songContainer');
    songContainer.innerHTML = '';

    if (filteredSongs.length === 0 && selectedKey) {
        songContainer.innerHTML = `<p>Aucun cantique trouvé pour la clé ${selectedKey}.</p>`;
        return;
    }

    if (filteredSongs.length > 0) {
        filteredSongs.forEach(song => {
            const songDiv = displaySong(song);
            const transposeControl = setupTransposeControl(song, songDiv);
            songDiv.insertBefore(transposeControl, songDiv.firstChild);
            songContainer.appendChild(songDiv);
        });
    } else {
        songContainer.innerHTML = `<p>Voici tous les cantiques disponibles :</p>`;
        songs.forEach(song => {
            const songDiv = displaySong(song);
            const transposeControl = setupTransposeControl(song, songDiv);
            songDiv.insertBefore(transposeControl, songDiv.firstChild);
            songContainer.appendChild(songDiv);
        });
    }
}

// Charger les cantiques au démarrage
document.addEventListener('DOMContentLoaded', loadSongs);

// Fonction de recherche
function searchSongs() {
    const input = document.getElementById('searchInput');
    const filter = input.value.toLowerCase();
    
    // Récupération de la clé depuis l'URL
    const urlParams = new URLSearchParams(window.location.search);
    const key = urlParams.get('key'); // Ex: dim-28-09-2024
    
    // Filtrer les cantiques par clé et titre
    const filteredSongs = songs.filter(song => {
        // Si une clé est spécifiée, filtrez par clé et titre
        if (key) {
            return song.key === key && song.title.toLowerCase().includes(filter);
        } else {
            // Si aucune clé n'est spécifiée, filtrez uniquement par titre
            return song.title.toLowerCase().includes(filter);
        }
    });

    const songContainer = document.getElementById('songContainer');
    songContainer.innerHTML = ''; // Vider le conteneur

    if (filteredSongs.length > 0) {
        filteredSongs.forEach(song => {
            const songDiv = displaySong(song);
            const transposeControl = setupTransposeControl(song, songDiv);
            songDiv.insertBefore(transposeControl, songDiv.firstChild);
            songContainer.appendChild(songDiv);
        });
    } else {
        songContainer.innerHTML = `<p>Aucun cantique trouvé pour "${input.value}".</p>`;
    }
}
