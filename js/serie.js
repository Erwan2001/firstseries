// serie.js
// Affiche la fiche d'une série : synopsis, onglets saisons, liste d'épisodes

let saisonActiveId = null;
let serieActuelle = null;

async function chargerFicheSerie() {
  const params = new URLSearchParams(window.location.search);
  const serieId = params.get("id");

  const titreEl = document.getElementById("serie-titre");
  const synopsisEl = document.getElementById("serie-synopsis");
  const afficheEl = document.getElementById("serie-affiche");

  if (!serieId) {
    titreEl.textContent = "Série introuvable";
    return;
  }

  const donnees = await chargerDonnees();
  const serie = trouverSerie(donnees, serieId);

  if (!serie) {
    titreEl.textContent = "Série introuvable";
    return;
  }

  serieActuelle = serie;

  titreEl.textContent = serie.titre;
  synopsisEl.textContent = serie.synopsis;
  afficheEl.src = serie.miniature && serie.miniature.trim() !== ""
    ? serie.miniature
    : "assets/placeholder.jpg";
  afficheEl.alt = serie.titre;

  afficherOngletsSaisons(serie);
}

function afficherOngletsSaisons(serie) {
  const tabsEl = document.getElementById("saisons-tabs");
  tabsEl.innerHTML = "";

  if (serie.saisons.length === 0) {
    tabsEl.innerHTML = "";
    document.getElementById("episodes-list").innerHTML = "<p>Aucun épisode pour le moment.</p>";
    return;
  }

  serie.saisons.forEach((saison, index) => {
    const onglet = document.createElement("button");
    onglet.className = "saison-tab";
    onglet.textContent = `Saison ${saison.numero}`;
    onglet.dataset.saisonId = saison.id;

    onglet.addEventListener("click", () => {
      saisonActiveId = saison.id;
      mettreAJourOngletsActifs();
      afficherEpisodes(saison);
    });

    tabsEl.appendChild(onglet);

    if (index === 0) {
      saisonActiveId = saison.id;
    }
  });

  mettreAJourOngletsActifs();
  const premiereSaison = serie.saisons.find((s) => s.id === saisonActiveId);
  afficherEpisodes(premiereSaison);
}

function mettreAJourOngletsActifs() {
  document.querySelectorAll(".saison-tab").forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.saisonId === saisonActiveId);
  });
}

function afficherEpisodes(saison) {
  const listeEl = document.getElementById("episodes-list");
  listeEl.innerHTML = "";

  if (!saison || saison.episodes.length === 0) {
    listeEl.innerHTML = "<p>Aucun épisode dans cette saison.</p>";
    return;
  }

  saison.episodes.forEach((episode) => {
    const ligne = document.createElement("div");
    ligne.className = "episode-row";
    ligne.addEventListener("click", () => {
      window.location.href = `video.html?serie=${encodeURIComponent(serieActuelle.id)}&saison=${encodeURIComponent(saison.id)}&episode=${encodeURIComponent(episode.id)}`;
    });

    ligne.innerHTML = `
      <span class="episode-numero">E${episode.numero}</span>
      <span class="episode-titre">${episode.titre}</span>
    `;

    listeEl.appendChild(ligne);
  });
}

document.addEventListener("DOMContentLoaded", chargerFicheSerie);
