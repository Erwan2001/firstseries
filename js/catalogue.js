// catalogue.js
// Affiche la liste des séries sur index.html

async function chargerCatalogue() {
  const grid = document.getElementById("serie-grid");
  const loadingMsg = document.getElementById("loading-msg");

  try {
    const donnees = await chargerDonnees();

    if (loadingMsg) loadingMsg.remove();

    if (!donnees.series || donnees.series.length === 0) {
      grid.innerHTML = "<p>Aucune série pour le moment.</p>";
      return;
    }

    donnees.series.forEach((serie) => {
      grid.appendChild(creerCarteSerie(serie));
    });
  } catch (erreur) {
    console.error(erreur);
    grid.innerHTML = "<p>Erreur lors du chargement du catalogue.</p>";
  }
}

function creerCarteSerie(serie) {
  const carte = document.createElement("div");
  carte.className = "video-card";
  carte.addEventListener("click", () => {
    window.location.href = `serie.html?id=${encodeURIComponent(serie.id)}`;
  });

  const miniature = serie.miniature && serie.miniature.trim() !== ""
    ? serie.miniature
    : "assets/placeholder.jpg";

  const nbSaisons = serie.saisons.length;

  carte.innerHTML = `
    <img src="${miniature}" alt="${serie.titre}">
    <div class="video-info">
      <h3>${serie.titre}</h3>
      <span class="meta-saisons">${nbSaisons} saison${nbSaisons > 1 ? "s" : ""}</span>
    </div>
  `;

  return carte;
}

async function initialiserHeroSlider() {
  const heroSlides = document.getElementById("hero-slides");
  const heroDots = document.getElementById("hero-dots");

  if (!heroSlides) return;

  try {
    const donnees = await chargerDonnees();

    if (!donnees.series || donnees.series.length === 0) return;

    const series = donnees.series.slice(0, 6);

    series.forEach((serie, index) => {
      const miniature = serie.miniature && serie.miniature.trim() !== ""
        ? serie.miniature
        : "assets/placeholder.jpg";

      const slide = document.createElement("div");
      slide.className = `hero-slide ${index === 0 ? "active" : ""}`;
      slide.style.backgroundImage = `url('${miniature}')`;
      slide.addEventListener("click", () => {
        window.location.href = `serie.html?id=${encodeURIComponent(serie.id)}`;
      });

      const nbSaisons = serie.saisons.length;
      const nbEpisodes = serie.saisons.reduce((acc, s) => acc + (s.episodes?.length || 0), 0);

      slide.innerHTML = `
        <div class="hero-slide-content">
          <h2>${serie.titre}</h2>
          <p class="meta">${nbSaisons} saison${nbSaisons > 1 ? "s" : ""} • ${nbEpisodes} épisode${nbEpisodes > 1 ? "s" : ""}</p>
          <p>${serie.synopsis}</p>
          <button class="hero-slide-btn">Regarder</button>
        </div>
      `;

      heroSlides.appendChild(slide);

      const dot = document.createElement("button");
      dot.className = `hero-dot ${index === 0 ? "active" : ""}`;
      dot.addEventListener("click", () => goToSlide(index));
      heroDots.appendChild(dot);
    });

    initAutoSlide();
  } catch (erreur) {
    console.error(erreur);
  }
}

let currentSlide = 0;
let autoSlideInterval = null;

function showSlide(index) {
  const slides = document.querySelectorAll(".hero-slide");
  const dots = document.querySelectorAll(".hero-dot");

  if (slides.length === 0) return;

  currentSlide = (index + slides.length) % slides.length;

  slides.forEach((slide) => slide.classList.remove("active"));
  dots.forEach((dot) => dot.classList.remove("active"));

  slides[currentSlide].classList.add("active");
  dots[currentSlide].classList.add("active");
}

function goToSlide(index) {
  clearInterval(autoSlideInterval);
  showSlide(index);
  initAutoSlide();
}

function nextSlide() {
  goToSlide(currentSlide + 1);
}

function prevSlide() {
  goToSlide(currentSlide - 1);
}

function initAutoSlide() {
  autoSlideInterval = setInterval(() => {
    showSlide(currentSlide + 1);
  }, 5000);
}

document.addEventListener("DOMContentLoaded", () => {
  initialiserHeroSlider();
  chargerCatalogue();

  const prevBtn = document.getElementById("hero-prev");
  const nextBtn = document.getElementById("hero-next");

  if (prevBtn) prevBtn.addEventListener("click", prevSlide);
  if (nextBtn) nextBtn.addEventListener("click", nextSlide);
});
