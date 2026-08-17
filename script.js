const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add("visible");
        }, index * 80);
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.18 }
);

document.querySelectorAll(".reveal").forEach((item) => {
  observer.observe(item);
});

const copyrightYear = document.getElementById("copyright-year");
if (copyrightYear) {
  copyrightYear.textContent = new Date().getFullYear();
}

const instagramGrid = document.getElementById("instagram-grid");
const instagramStatus = document.getElementById("instagram-status");

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function createPostMarkup(post) {
  const caption = escapeHtml(post.caption || "Postagem sem descricao");
  const previewCaption = caption.length > 120 ? `${caption.slice(0, 120)}...` : caption;
  const image = post.imageUrl ? `<img src="${post.imageUrl}" alt="Postagem da DeArtes" loading="lazy" />` : "";

  return `
    <a class="insta-card" href="${post.permalink}" target="_blank" rel="noreferrer">
      <span class="insta-badge">Postagem recente</span>
      <div class="insta-media">${image}</div>
      <p>${previewCaption}</p>
    </a>
  `;
}

async function loadInstagramFeed() {
  if (!instagramGrid || !instagramStatus) {
    return;
  }

  try {
    const response = await fetch("data/instagram-posts.json", { cache: "no-store" });
    const data = await response.json();

    if (!Array.isArray(data.posts) || data.posts.length === 0) {
      instagramStatus.textContent = "Novas postagens em breve. Siga a gente no Instagram!";
      return;
    }

    instagramGrid.innerHTML = data.posts.map((post) => createPostMarkup(post)).join("");
    instagramStatus.textContent = "Ultimas postagens do nosso Instagram.";
  } catch {
    instagramStatus.textContent = "Nao foi possivel carregar o feed agora. Siga a gente no Instagram!";
  }
}

loadInstagramFeed();
