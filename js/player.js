// player.js
// Page de lecture : récupère serie/saison/episode dans l'URL,
// affiche nom de série + titre d'épisode + synopsis, et génère l'iframe embed Vromov

async function chargerLecteur() {
  const params = new URLSearchParams(window.location.search);
  const serieId = params.get("serie");
  const saisonId = params.get("saison");
  const episodeId = params.get("episode");

  const container = document.getElementById("player-container");
  const episodeTitreEl = document.getElementById("episode-titre");
  const synopsisEl = document.getElementById("serie-synopsis-player");
  const retourEl = document.getElementById("retour-serie");

  if (!serieId || !saisonId || !episodeId) {
    episodeTitreEl.textContent = "Épisode introuvable";
    return;
  }

  const donnees = await chargerDonnees();
  const serie = trouverSerie(donnees, serieId);
  if (!serie) {
    episodeTitreEl.textContent = "Série introuvable";
    return;
  }

  const saison = trouverSaison(serie, saisonId);
  if (!saison) {
    episodeTitreEl.textContent = "Saison introuvable";
    return;
  }

  const episode = trouverEpisode(saison, episodeId);
  if (!episode) {
    episodeTitreEl.textContent = "Épisode introuvable";
    return;
  }

  // Titre affiché : Nom de la série + numéro d'épisode + titre d'épisode
  episodeTitreEl.textContent = `${serie.titre} — S${saison.numero}E${episode.numero} — ${episode.titre}`;
  synopsisEl.textContent = serie.synopsis;
  retourEl.href = `serie.html?id=${encodeURIComponent(serie.id)}`;

  const videoUrl = (episode.videoUrl || "").trim();

  // Fallbacks pour anciens formats
  const embedCode = (episode.embedCode || "").trim();
  const vromovId = (episode.vromovId || "").trim();

  if (videoUrl) {
    // Si l'URL pointe vers un fichier vidéo direct, utiliser <video>.
    const isDirectVideo = /\.(mp4|webm|ogg|m3u8)(\?.*)?$/i.test(videoUrl);
    if (isDirectVideo) {
      container.innerHTML = `
        <video controls autoplay playsinline preload="metadata" class="video-player">
          <source src="${videoUrl}">
          Votre navigateur ne supporte pas la lecture vidéo.
        </video>
      `;
      return;
    }

    // Sinon essayer d'embarquer la page via iframe (peut être bloqué par le site)
    container.innerHTML = `
      <iframe src="${videoUrl}" allowfullscreen class="embed-iframe"></iframe>
    `;
    return;
  }

  // Anciennes données : support du code embed HTML
  if (embedCode) {
    container.innerHTML = embedCode;
    return;
  }

  // Ancienne compatibilité Vromov
  if (vromovId) {
    const embedUrl = `https://vromov.com/embed/${encodeURIComponent(vromovId)}`;
    container.innerHTML = `
      <iframe
        src="${embedUrl}"
        allow="autoplay; fullscreen"
        allowfullscreen
        class="embed-iframe"
      ></iframe>
    `;
    return;
  }

  container.innerHTML = "<p>Aucune URL vidéo disponible pour cet épisode.</p>";
}

document.addEventListener("DOMContentLoaded", chargerLecteur);
