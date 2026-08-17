// Busca as ultimas postagens do Instagram via Graph API e salva em data/instagram-posts.json
const fs = require("fs");
const path = require("path");

const ACCESS_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN || "";
const POST_LIMIT = Number(process.env.INSTAGRAM_POST_LIMIT || 6);
const OUTPUT_PATH = path.join(__dirname, "..", "data", "instagram-posts.json");

async function fetchInstagramPosts() {
  if (!ACCESS_TOKEN) {
    throw new Error("INSTAGRAM_ACCESS_TOKEN nao configurado.");
  }

  const meEndpoint = new URL("https://graph.instagram.com/me");
  meEndpoint.searchParams.set("fields", "id,username");
  meEndpoint.searchParams.set("access_token", ACCESS_TOKEN);

  const meResponse = await fetch(meEndpoint);
  if (!meResponse.ok) {
    throw new Error(`Falha ao identificar a conta: ${await meResponse.text()}`);
  }
  const meData = await meResponse.json();
  const userId = meData.id;

  const fields = ["id", "caption", "media_type", "media_url", "thumbnail_url", "permalink", "timestamp"].join(",");
  const mediaEndpoint = new URL(`https://graph.instagram.com/${userId}/media`);
  mediaEndpoint.searchParams.set("fields", fields);
  mediaEndpoint.searchParams.set("limit", String(POST_LIMIT));
  mediaEndpoint.searchParams.set("access_token", ACCESS_TOKEN);

  const mediaResponse = await fetch(mediaEndpoint);
  if (!mediaResponse.ok) {
    throw new Error(`Falha ao buscar postagens: ${await mediaResponse.text()}`);
  }
  const mediaData = await mediaResponse.json();

  const posts = (mediaData.data || []).map((post) => ({
    id: post.id,
    caption: post.caption || "",
    permalink: post.permalink,
    imageUrl: post.media_type === "VIDEO" ? post.thumbnail_url || post.media_url : post.media_url,
    mediaType: post.media_type,
    timestamp: post.timestamp
  }));

  return posts;
}

async function main() {
  const posts = await fetchInstagramPosts();
  const output = {
    updatedAt: new Date().toISOString(),
    posts
  };

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2));
  console.log(`Salvos ${posts.length} posts em ${OUTPUT_PATH}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
