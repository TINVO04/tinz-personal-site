// Set năm ở footer
document.getElementById("year").textContent = new Date().getFullYear();

// Snowfall Minimalist
const canvas = document.getElementById("snow-canvas");
const ctx = canvas.getContext("2d");

let width, height;
let flakes = [];

function resizeCanvas() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
}

window.addEventListener("resize", () => {
  resizeCanvas();
  initFlakes(); // tạo lại tuyết khi resize
});

function initFlakes() {
  const flakesCount = Math.floor(width / 10); // auto scale theo chiều rộng
  flakes = [];
  for (let i = 0; i < flakesCount; i++) {
    flakes.push({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 2.2 + 0.8,       // bán kính
      speedY: Math.random() * 0.7 + 0.3,  // tốc độ rơi
      drift: Math.random() * 0.6 - 0.3,   // trôi ngang
      opacity: Math.random() * 0.4 + 0.3, // độ mờ
    });
  }
}

function drawFlakes() {
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();

  flakes.forEach((flake) => {
    ctx.globalAlpha = flake.opacity;
    ctx.moveTo(flake.x, flake.y);
    ctx.arc(flake.x, flake.y, flake.r, 0, Math.PI * 2);
  });

  ctx.fill();
  ctx.globalAlpha = 1.0;
}

const SNOW_SPEED = 4; // chỉnh số này để nhanh/chậm

function updateFlakes() {
  flakes.forEach((flake) => {
    flake.y += flake.speedY * SNOW_SPEED;
    flake.x += flake.drift;

    if (flake.y > height + 5) {
      flake.y = -10;
      flake.x = Math.random() * width;
    }

    if (flake.x > width + 5) flake.x = -5;
    if (flake.x < -5) flake.x = width + 5;
  });
}


function animate() {
  drawFlakes();
  updateFlakes();
  requestAnimationFrame(animate);
}

const cursor = document.createElement("div");
cursor.classList.add("cursor-fx");
document.body.appendChild(cursor);

document.addEventListener("mousemove", (e) => {
  cursor.style.left = `${e.clientX}px`;
  cursor.style.top = `${e.clientY}px`;
});

// Intro overlay: click to enter
document.addEventListener("DOMContentLoaded", () => {
  const introOverlay = document.getElementById("intro-overlay");
  if (!introOverlay) return;

introOverlay.addEventListener("click", () => {
  document.body.classList.add("entered");

 /* --- PLAY MUSIC WITH FADE-IN --- */
  const audio = document.getElementById("bg-music");
  audio.volume = 0;
  audio.loop = true;

  audio.play().catch(e => console.log("Autoplay blocked:", e));

  let vol = 0;
  const fadeIn = setInterval(() => {
    vol += 0.02;
    if (vol >= 0.5) {   // tối đa 60% volume
    vol = 0.5;
    clearInterval(fadeIn);
}
    audio.volume = vol;
  }, 80); // mỗi 60ms tăng volume 1 lần
  /* --- END MUSIC FADE-IN --- */

  // animation xuất hiện các card
  const cards = document.querySelectorAll(".card");
  cards.forEach((card, index) => {
    const delay = 80 * index;
    card.style.animationDelay = `${delay}ms`;
    card.classList.add("card-enter");

    // Khi animation kết thúc thì bỏ class để transform JS hoạt động
    card.addEventListener('animationend', () => {
      card.classList.remove('card-enter');
      // đảm bảo trạng thái cuối cùng là visible, đứng yên
      card.style.opacity = '1';
      card.style.transform = 'perspective(900px) translate3d(0,0,0)';
    }, { once: true });
  });
});
});



// ================== CARD HOVER LIGHT + PARALLAX ==================
const cards = document.querySelectorAll('.card');

cards.forEach((card) => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left; // vị trí chuột trong card
    const y = e.clientY - rect.top;

    // update biến CSS cho ánh sáng
    card.style.setProperty('--mouse-x', `${x}px`);
    card.style.setProperty('--mouse-y', `${y}px`);

    // chuẩn hoá vị trí chuột về [-1, 1]
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const normX = (x - centerX) / centerX; // trái: -1, phải: 1
    const normY = (y - centerY) / centerY; // trên: -1, dưới: 1

    // góc xoay tối đa
    const maxRotate = 8; // độ, chỉnh tuỳ ý

    // xoay: chuột ở trên -> card nghiêng lên trên (rotateX âm)
    const rotateX = -normY * maxRotate;
    const rotateY =  normX * maxRotate;

    // dịch nhẹ cho có cảm giác nổi
    const translateZ = 12; // px
    const translateX = normX * 4; // px
    const translateY = normY * 4;

    card.style.transform =
      `perspective(900px) ` +
      `rotateX(${rotateX}deg) rotateY(${rotateY}deg) ` +
      `translate3d(${translateX}px, ${translateY}px, ${translateZ}px)`;
  });

  card.addEventListener('mouseleave', () => {
    card.style.removeProperty('--mouse-x');
    card.style.removeProperty('--mouse-y');
    card.style.transform = 'perspective(900px) translate3d(0, 0, 0) rotateX(0deg) rotateY(0deg)';
  });
});


// ======= Hacker Text Decode Effect ======= //

function decodeTextEffect(element, text, speed = 40, delay = 1200) {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
  let frame = 0;

  function update() {
    let result = "";
    let done = true;

    for (let i = 0; i < text.length; i++) {
      if (i < frame) {
        result += text[i];
      } else {
        result += letters[Math.floor(Math.random() * letters.length)];
        done = false;
      }
    }

    element.textContent = result;
    
    if (!done) {
      frame += 1;
      setTimeout(update, speed);
    } else {
      // chờ 1 lúc rồi restart hiệu ứng
      setTimeout(() => {
        frame = 0;
        update();
      }, delay);
    }
  }

  update();
}

// Kích hoạt
document.addEventListener("DOMContentLoaded", () => {
  const el = document.getElementById("hero-sub");
  const text = el.textContent.trim();
  decodeTextEffect(el, text, 100, 2000);
});

// Khởi tạo
resizeCanvas();
initFlakes();
animate();



