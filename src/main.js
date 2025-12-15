// 1. IMPORT GUN AND STYLES
import './style.css'; // This tells Vite to load your CSS
import Gun from 'gun';  // <--- This loads Gun from NPM

// 2. CONFIGURATION
const peers = [
  'https://superrely.neoverse.live/gun'
];

const gun = Gun({ peers: peers });
const app = gun.get('canvas-feed-v2');

// Connection Check
setInterval(() => {
  // In npm version, accessing peers might differ slightly, but this usually works
  // If gun._.opt.peers is undefined, simply check if we have data coming in
  const peerCount = gun._.opt.peers ? Object.keys(gun._.opt.peers).length : 0;
  const dot = document.getElementById('status');
  if (dot && peerCount > 0) dot.className = 'online';
}, 2000);

// 3. EVENT LISTENERS
// We attach the click event here instead of in HTML
document.getElementById('postBtn').addEventListener('click', handlePost);

// 4. POST LOGIC
async function handlePost() {
  const textInput = document.getElementById('msgInput');
  // const fileInput = document.getElementById('fileInput'); // Uncomment if you add file input back
  const btn = document.getElementById('postBtn');

  const text = textInput.value.trim();
  // const file = fileInput.files[0]; 
  const file = null; // Placeholder since input is commented out

  if (!text && !file) return;

  btn.disabled = true;
  btn.innerText = "Posting...";

  let base64Data = null;

  if (file) {
    base64Data = await new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.readAsDataURL(file);
    });
  }

  app.set({
    text: text,
    image: base64Data,
    timestamp: Date.now()
  });

  textInput.value = "";
  // fileInput.value = "";
  btn.disabled = false;
  btn.innerText = "Post";
}

// 5. RENDER LOGIC
app.map().on((post, id) => {
  if (!post) return;
  if (document.getElementById(id)) return;

  const div = document.createElement('div');
  div.className = 'card';
  div.id = id;

  let htmlContent = '';

  if (post.image) {
    htmlContent += `<canvas id="canvas-${id}"></canvas>`;
  }

  if (post.text) {
    htmlContent += `<div class="text-content">${escapeHtml(post.text)}</div>`;
  }

  htmlContent += `<div class="meta">${new Date(post.timestamp).toLocaleTimeString()}</div>`;
  div.innerHTML = htmlContent;

  const feed = document.getElementById('feed');
  feed.insertBefore(div, feed.firstChild);

  if (post.image) {
    const canvas = document.getElementById(`canvas-${id}`);
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.src = post.image;
    img.onload = function () {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      img.src = "";
      post.image = null;
    };
  }
});

function escapeHtml(text) {
  if (!text) return "";
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}