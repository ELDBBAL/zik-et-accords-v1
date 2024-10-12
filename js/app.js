/* Code : app.js
 ** Created at : 30 Septembre 2024
 ** Updated at : 12 Octobre 2024
 ** Author : David Ldbbàl
 ** Purpose : Gestion de la transposition d'accords et affichage de chansons
 */

// Liste des accords majeurs et mineurs
const chords = [
  "C",
  "C#",
  "D",
  "Eb",
  "E",
  "F",
  "F#",
  "G",
  "Ab",
  "A",
  "Bb",
  "B",
];

// Fonction de transposition d'un accord (incluant les accords mineurs)
function transposeChord(chord, steps) {
  // Vérifie si l'accord est mineur
  const isMinor = chord.endsWith("m");
  const rootChord = isMinor ? chord.slice(0, -1) : chord; // Retire le 'm' si mineur

  // Trouver l'index de la racine de l'accord
  let index = chords.indexOf(rootChord);
  if (index === -1) return chord; // Si l'accord n'est pas dans la liste

  // Calcule le nouvel index après transposition
  index = (index + steps + chords.length) % chords.length;
  const transposedRootChord = chords[index];

  // Si c'était un accord mineur, on conserve le 'm'
  return isMinor ? transposedRootChord + "m" : transposedRootChord;
} //function transposeChord(chord, steps)

// Fonction qui transpose les accords dans une ligne de texte
function transposeTextLine(line, steps) {
  const chordRegex = /\(([^)]+)\)/g;
  return line.replace(chordRegex, (match, chord) => {
    const transposedChord = transposeChord(chord, steps);
    return `(${transposedChord})`;
  });
} //function transposeTextLine(line, steps)

// Fonction qui transpose les accords d'un cantique
function transposeSong(song, steps) {
  return song.verses.map((verse) =>
    verse.map((line) => ({
      ...line,
      text: transposeTextLine(line.text, steps),
    }))
  );
} //function transposeSong(song, steps)

// Fonction pour obtenir la position du capo
const getCapoPosition = (key) => {
  const capoPositions = {
    C: "Pas de capo (C)",
    "C#": "Capo sur 1 (C)",
    D: "Capo sur 2 (C)",
    Eb: "Capo sur 3 (C)",
    E: "Capo sur 4 (C)",
    F: "Capo sur 5 (C)",
    "F#": "Capo sur 6 (C)",
    G: "Pas de capo (G)",
    Ab: "Capo sur 1 (G)",
    A: "Capo sur 2 (G)",
    Bb: "Capo sur 3 (G)",
    B: "Capo sur 4 (G)",
  };
  return capoPositions[key] || "Capo non défini";
}; //const getCapoPosition = (key)

// Récupérer les paramètres d'URL
function getUrlParams() {
  const params = {};
  const search = window.location.search.substring(1);
  if (search) {
    search.split("&").forEach((param) => {
      const [key, value] = param.split("=");
      params[key] = decodeURIComponent(value);
    });
  }
  return params;
}//function getUrlParams()

// Variable pour stocker la clé actuelle
let currentKey = null;

// Fonction pour configurer les contrôles de transposition
function setupTransposeControl(song, songContainer) {
  const transposeContainer = document.createElement("div");
  transposeContainer.classList.add("transpose-controls");

  const label = document.createElement("label");
  label.textContent = "Transposer :";
  transposeContainer.appendChild(label);

  const select = document.createElement("select");
  chords.forEach((chord, index) => {
    const option = document.createElement("option");
    option.value = index;
    option.textContent = chord;
    if (chord === song.keySignature) {
      option.selected = true;
    }
    select.appendChild(option);
  });

  const capoInfoLine = document.createElement("span");
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

  select.addEventListener("change", handleTranspose);

  return transposeContainer;
}//function setupTransposeControl(song, songContainer) 

// Fonction pour générer et télécharger un PDF
function generatePdf(song, transpositionSteps) {
  const { jsPDF } = window.jspdf; // Utilisé avec jsPDF à partir de CDN dans single.html
  const doc = new jsPDF();
  const transposedSong = transposeSong(song, transpositionSteps);

  let yPosition = 10;

  // Calculer la gamme transposée
  const transposedKey = transposeChord(song.keySignature, transpositionSteps);
  // Ajouter le titre au PDF avec la gamme
  doc.setFontSize(16);
  doc.text(`${song.title} - (${transposedKey})`, 10, yPosition);
  yPosition += 10;

  // Ajouter chaque couplet
  transposedSong.forEach((verse) => {
    verse.forEach((line) => {
      doc.setFontSize(12);
      // Assurez-vous que les lignes de texte ne débordent pas
      const splitText = doc.splitTextToSize(line.text, 190); // 190 pour éviter le débordement
      splitText.forEach((textLine) => {
        doc.text(textLine, 10, yPosition);
        yPosition += 8;
      });
    });
    yPosition += 5; // Ajoute un espace après chaque couplet
  });

  // Télécharger le fichier PDF
  doc.save(`${song.title}.pdf`);
}//function generatePdf(song, transpositionSteps)

// Fonction d'affichage des cantiques
function displaySong(song, transpositionSteps = 0, container = null) {
  const songContainer = container || document.createElement("div");
  songContainer.classList.add("song");
  songContainer.dataset.originalKey = song.keySignature;

  const existingTransposeControls = songContainer.querySelector(
    ".transpose-controls"
  );
  songContainer.innerHTML = ""; // Vider le contenu existant

  if (existingTransposeControls) {
    songContainer.appendChild(existingTransposeControls);
  }

  // Ajouter le titre de la chanson
  const title = document.createElement("h2");
  title.textContent = `${song.title}`;
  songContainer.appendChild(title);

  // Créer un conteneur pour les boutons
  const buttonContainer = document.createElement("div");
  buttonContainer.classList.add("button-container"); // Ajoutez la classe pour le style

  // Ajouter le lien YouTube
  if (song.youtubeLink) {
    const youtubeLink = document.createElement("a");
    youtubeLink.href = song.youtubeLink;
    youtubeLink.textContent = "Écouter sur YouTube";
    youtubeLink.target = "_blank";
    youtubeLink.classList.add("youtube-listen-button");
    buttonContainer.appendChild(youtubeLink); // Ajouter au conteneur des boutons
  }

  // Ajouter le bouton "Télécharger en PDF"
  const downloadButton = document.createElement("button");
  downloadButton.textContent = "Télécharger en PDF";
  downloadButton.classList.add("pdf-download-button");
  downloadButton.addEventListener("click", () => {
    generatePdf(song, transpositionSteps);
  });
  buttonContainer.appendChild(downloadButton); // Ajouter au conteneur des boutons

  // Ajouter le conteneur des boutons au conteneur principal
  songContainer.appendChild(buttonContainer);

  // Transposer les vers et afficher le contenu
  const transposedVerses = transposeSong(song, transpositionSteps);
  let isChorus = false;

  transposedVerses.forEach((verse) => {
    const verseDiv = document.createElement("div");
    verseDiv.classList.add("verse");

    verse.forEach((line) => {
      const p = document.createElement("p");

      if (line.text.startsWith("CHORUS:")) {
        isChorus = true;
        p.classList.add("chorus");
        p.innerHTML = line.text;
      } else {
        if (isChorus) {
          p.classList.add("chorus");
        }
        p.innerHTML = line.text.replace(/\(([^)]+)\)/g, (match, chord) => {
          return `<span class="chord">(${chord})</span>`;
        });
      }

      verseDiv.appendChild(p);
    });

    songContainer.appendChild(verseDiv);
    isChorus = false;
  });

  return songContainer;
}//function displaySong(song, transpositionSteps = 0, container = null)

// Fonction pour charger les cantiques à partir des paramètres d'URL
function loadSongs() {
  const params = getUrlParams();
  const selectedKey = params.key;

  const filteredSongs = selectedKey
    ? songs.filter((song) => song.key === selectedKey)
    : songs;

  const songContainer = document.getElementById("songContainer");
  songContainer.innerHTML = "";

  if (filteredSongs.length === 0 && selectedKey) {
    songContainer.innerHTML = `<p>Aucun cantique trouvé pour la clé ${selectedKey}.</p>`;
    return;
  }

  if (filteredSongs.length > 0) {
    filteredSongs.forEach((song) => {
      const songDiv = displaySong(song);
      const transposeControl = setupTransposeControl(song, songDiv);
      songDiv.insertBefore(transposeControl, songDiv.firstChild);
      songContainer.appendChild(songDiv);
    });
  } else {
    songContainer.innerHTML = `<p>Voici tous les cantiques disponibles :</p>`;
    songs.forEach((song) => {
      const songDiv = displaySong(song);
      const transposeControl = setupTransposeControl(song, songDiv);
      songDiv.insertBefore(transposeControl, songDiv.firstChild);
      songContainer.appendChild(songDiv);
    });
  }
}//function loadSongs()

// Charger les cantiques au démarrage
document.addEventListener("DOMContentLoaded", loadSongs);

// Fonction de recherche des cantiques
function searchSongs() {
  const input = document.getElementById("searchInput");
  const filter = input.value.toLowerCase();

  // Récupération de la clé depuis l'URL
  const urlParams = new URLSearchParams(window.location.search);
  const key = urlParams.get("key"); // Ex: dim-28-09-2024

  // Filtrer les cantiques par clé et titre
  const filteredSongs = songs.filter((song) => {
    // Si une clé est spécifiée, filtrez par clé et titre
    if (key) {
      return song.key === key && song.title.toLowerCase().includes(filter);
    } else {
      // Si aucune clé n'est spécifiée, filtrez uniquement par titre
      return song.title.toLowerCase().includes(filter);
    }
  });

  const songContainer = document.getElementById("songContainer");
  songContainer.innerHTML = ""; // Vider le conteneur

  if (filteredSongs.length > 0) {
    filteredSongs.forEach((song) => {
      const songDiv = displaySong(song);
      const transposeControl = setupTransposeControl(song, songDiv);
      songDiv.insertBefore(transposeControl, songDiv.firstChild);
      songContainer.appendChild(songDiv);
    });
  } else {
    songContainer.innerHTML = `<p>Aucun cantique trouvé pour "${input.value}".</p>`;
  }
}//function searchSongs()
