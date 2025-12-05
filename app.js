const input = document.getElementById("subredditInput");
const addBtn = document.getElementById("addBtn");
const lanesContainer = document.getElementById("lanesContainer");

let lanes = JSON.parse(localStorage.getItem("lanes")) || [];

document.addEventListener("DOMContentLoaded", () => {
  lanes.forEach(loadLane);
});

// -----------------------
// FUNCIÓN PRINCIPAL
// -----------------------
async function loadLane(subreddit) {
  const lane = document.createElement("div");
  lane.className = "lane";

  lane.innerHTML = `
    <div class="lane-header">
      <h3>/r/${subreddit}</h3>
      <div>
        <button class="refresh">⟳</button>
        <button class="delete">✕</button>
      </div>
    </div>
    <div class="posts">Loading...</div>
  `;

  lanesContainer.appendChild(lane);

  const postsDiv = lane.querySelector(".posts");
  const refreshBtn = lane.querySelector(".refresh");
  const deleteBtn = lane.querySelector(".delete");

  // cargar posts
  await fetchPosts(subreddit, postsDiv);

  // refrescar carril
  refreshBtn.addEventListener("click", async () => {
    postsDiv.innerHTML = "Loading...";
    await fetchPosts(subreddit, postsDiv);
  });

  // borrar carril
  deleteBtn.addEventListener("click", () => {
    lane.remove();
    lanes = lanes.filter(s => s !== subreddit);
    localStorage.setItem("lanes", JSON.stringify(lanes));
  });
}

// -----------------------
// FETCH de Reddit
// -----------------------
async function fetchPosts(subreddit, postsDiv) {
  try {
    const res = await fetch(`https://www.reddit.com/r/${subreddit}.json`);

    if (!res.ok) {
      postsDiv.innerHTML = `<p class="error">Subreddit not found</p>`;
      return;
    }

    const data = await res.json();
    const posts = data.data.children;

    postsDiv.innerHTML = "";

    posts.forEach(post => {
      const item = document.createElement("div");
      item.className = "post";

      item.innerHTML = `
        <strong>${post.data.ups}⬆</strong> 
        ${post.data.title} 
        <br><small>by ${post.data.author}</small>
      `;

      item.addEventListener("click", () => {
        window.open(`https://reddit.com${post.data.permalink}`, "_blank");
      });

      postsDiv.appendChild(item);
    });

  } catch (error) {
    postsDiv.innerHTML = `<p class="error">Error loading subreddit</p>`;
  }
}

// -----------------------
// AÑADIR NUEVO CARRIL
// -----------------------
addBtn.addEventListener("click", () => {
  const name = input.value.trim();

  if (name === "") return;

  if (lanes.includes(name)) {
    alert("Subreddit already added.");
    return;
  }

  lanes.push(name);
  localStorage.setItem("lanes", JSON.stringify(lanes));

  loadLane(name);
  input.value = "";
});
