// Set năm ở footer
document.getElementById("year").textContent = new Date().getFullYear();

// Digital Snowflakes - Cyberpunk Style
const canvas = document.getElementById("snow-canvas");
const ctx = canvas.getContext("2d");

let width, height;
let snowflakes = [];

// Audio Visualization - Beat Detection
let audioContext = null;
let analyser = null;
let sourceNode = null;
let frequencyData = null;
const FFT_SIZE = 256;

function resizeCanvas() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
}

window.addEventListener("resize", () => {
  resizeCanvas();
  initSnowflakes();
});

function initSnowflakes() {
  const snowflakeCount = Math.floor(width / 15); // Moderate density
  snowflakes = [];
  for (let i = 0; i < snowflakeCount; i++) {
    snowflakes.push({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 4 + 2,
      speedY: Math.random() * 1.5 + 0.5,
      drift: (Math.random() - 0.5) * 0.8,
      opacity: Math.random() * 0.5 + 0.3,
      shape: Math.floor(Math.random() * 3), // 0: hexagon, 1: diamond, 2: plus/circuit
      color: Math.random() > 0.6 ? 'cyan' : (Math.random() > 0.5 ? 'purple' : 'magenta'),
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.03,
      glowIntensity: Math.random() * 0.3 + 0.2
    });
  }
}

function drawHexagon(size) {
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i;
    const x = size * Math.cos(angle);
    const y = size * Math.sin(angle);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

function drawDiamond(size) {
  ctx.beginPath();
  ctx.moveTo(0, -size);
  ctx.lineTo(size, 0);
  ctx.lineTo(0, size);
  ctx.lineTo(-size, 0);
  ctx.closePath();
}

function drawCircuitPlus(size) {
  const lineLength = size * 0.8;
  ctx.beginPath();
  // Horizontal line
  ctx.moveTo(-lineLength, 0);
  ctx.lineTo(lineLength, 0);
  // Vertical line
  ctx.moveTo(0, -lineLength);
  ctx.lineTo(0, lineLength);
  // Small corners (circuit style)
  ctx.moveTo(-lineLength, -lineLength * 0.3);
  ctx.lineTo(-lineLength, -lineLength * 0.6);
  ctx.lineTo(-lineLength * 0.7, -lineLength * 0.6);
}

function drawSnowflake(flake) {
  ctx.save();
  ctx.translate(flake.x, flake.y);
  ctx.rotate(flake.rotation);
  
  // Color selection
  let color;
  if (flake.color === 'cyan') {
    color = '0, 240, 255';
  } else if (flake.color === 'purple') {
    color = '123, 44, 191';
  } else {
    color = '255, 0, 110'; // magenta
  }
  
  // Glow effect
  ctx.shadowBlur = 10 * flake.glowIntensity;
  ctx.shadowColor = `rgba(${color}, ${flake.opacity})`;
  
  ctx.globalAlpha = flake.opacity;
  ctx.strokeStyle = `rgba(${color}, ${flake.opacity})`;
  ctx.fillStyle = `rgba(${color}, ${flake.opacity * 0.2})`;
  ctx.lineWidth = 1.5;
  
  // Draw shape
  if (flake.shape === 0) {
    drawHexagon(flake.size);
    ctx.stroke();
  } else if (flake.shape === 1) {
    drawDiamond(flake.size);
    ctx.fill();
    ctx.stroke();
  } else {
    drawCircuitPlus(flake.size);
    ctx.stroke();
    // Add small dots at ends
    ctx.beginPath();
    ctx.arc(flake.size * 0.8, 0, 1.5, 0, Math.PI * 2);
    ctx.arc(-flake.size * 0.8, 0, 1.5, 0, Math.PI * 2);
    ctx.arc(0, flake.size * 0.8, 1.5, 0, Math.PI * 2);
    ctx.arc(0, -flake.size * 0.8, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }
  
  ctx.restore();
}

function updateSnowflakes() {
  snowflakes.forEach((flake) => {
    flake.y += flake.speedY;
    flake.x += flake.drift;
    flake.rotation += flake.rotationSpeed;

    // Reset snowflake when it goes off screen
    if (flake.y > height + 10) {
      flake.y = -10;
      flake.x = Math.random() * width;
    }
    
    // Horizontal wrapping
    if (flake.x > width + 10) flake.x = -10;
    if (flake.x < -10) flake.x = width + 10;
  });
}

// Audio Visualization Functions
function initAudioVisualizer(audioElement) {
  try {
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      console.log('AudioContext created');
    }
    if (!sourceNode) {
      sourceNode = audioContext.createMediaElementSource(audioElement);
      analyser = audioContext.createAnalyser();
      analyser.fftSize = FFT_SIZE;
      analyser.smoothingTimeConstant = 0.8;
      
      // Kết nối: source -> analyser -> destination
      sourceNode.connect(analyser);
      analyser.connect(audioContext.destination);
      
      frequencyData = new Uint8Array(analyser.frequencyBinCount);
      console.log('Audio visualizer initialized successfully');
    }
  } catch (error) {
    console.error('Error initializing audio visualizer:', error);
    // Nếu lỗi, visualizer sẽ không hoạt động nhưng audio vẫn phát bình thường
    // vì audio element vẫn độc lập
  }
}

function updateAudioData() {
  if (analyser && frequencyData) {
    analyser.getByteFrequencyData(frequencyData);
  }
}

function applyAudioToParticles() {
  if (!frequencyData || frequencyData.length === 0) return;

  // Lấy các giá trị tần số quan trọng
  const bass = frequencyData[0] / 255;
  
  // Tính average bass energy cho beat detection
  let sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += frequencyData[i];
  }
  const avgBass = sum / 10 / 255;

  snowflakes.forEach((flake, index) => {
    // Map mỗi particle đến một vùng tần số dựa trên vị trí x
    const binIndex = Math.floor((flake.x / width) * frequencyData.length);
    const energy = frequencyData[binIndex] / 255;

    // Lưu giá trị gốc nếu chưa có
    if (!flake.baseSize) flake.baseSize = flake.size;
    if (!flake.baseSpeedY) flake.baseSpeedY = flake.speedY;
    if (!flake.baseOpacity) flake.baseOpacity = flake.opacity;
    if (!flake.baseGlowIntensity) flake.baseGlowIntensity = flake.glowIntensity;

    // Áp dụng audio energy vào thuộc tính particles
    flake.size = flake.baseSize + energy * 4;
    flake.speedY = flake.baseSpeedY + energy * 1.5;
    flake.opacity = Math.max(0.3, Math.min(1, flake.baseOpacity + energy * 0.5));
    flake.glowIntensity = flake.baseGlowIntensity + energy * 0.6;
    flake.rotationSpeed = (Math.random() - 0.5) * 0.03 * (1 + energy * 2);

    // Beat effect - khi bass mạnh thì particles bounce
    if (avgBass > 0.6) {
      flake.size *= 1.3;
      flake.glowIntensity *= 1.5;
    }

    // Extreme beat - particles phản ứng mạnh
    if (avgBass > 0.8) {
      flake.speedY *= 1.5;
      flake.opacity = Math.min(1, flake.opacity * 1.2);
    }
  });
}

function animate() {
  ctx.clearRect(0, 0, width, height);
  
  updateAudioData();
  applyAudioToParticles();
  updateSnowflakes();
  snowflakes.forEach(flake => drawSnowflake(flake));
  
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
  // Ẩn overlay NGAY LẬP TỨC để tránh lag
  document.body.classList.add("entered");

  // Animation xuất hiện các card với requestAnimationFrame để không block UI
  requestAnimationFrame(() => {
    const cards = document.querySelectorAll(".card");
    cards.forEach((card, index) => {
      const delay = 120 * index; // Tăng delay lên 120ms cho smooth hơn
      setTimeout(() => {
        card.classList.add("card-enter");
      }, delay);

      // Khi animation kết thúc thì bỏ class để transform JS hoạt động
      card.addEventListener('animationend', () => {
        card.classList.remove('card-enter');
        card.style.opacity = '1';
        card.style.transform = 'perspective(900px) translate3d(0,0,0)';
      }, { once: true });
    });
  });

  // Play music trong background (không block UI)
  setTimeout(() => {
    const audio = document.getElementById("bg-music");
    if (audio) {
      audio.volume = 0;
      audio.loop = true;
      
      // Khởi tạo audio visualizer TRƯỚC khi play
      // (vì createMediaElementSource phải gọi trước play)
      try {
        initAudioVisualizer(audio);
      } catch (e) {
        console.log("Visualizer init failed, but audio will still play:", e);
      }
      
      audio.play().then(() => {
        // Resume audio context nếu bị suspended
        if (audioContext && audioContext.state === 'suspended') {
          audioContext.resume();
        }
        
        // Fade in volume sau khi play thành công
        let vol = 0;
        const fadeIn = setInterval(() => {
          vol += 0.02;
          if (vol >= 0.25) {
            vol = 0.25;
            clearInterval(fadeIn);
          }
          audio.volume = vol;
        }, 80);
      }).catch(e => {
        console.log("Autoplay blocked:", e);
      });
    }
  }, 100);
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

// Kích hoạt decode effect
document.addEventListener("DOMContentLoaded", () => {
  const el = document.getElementById("hero-sub");
  const text = el.textContent.trim();
  decodeTextEffect(el, text, 100, 2000);
  
  // Update timestamp in header
  function updateTimestamp() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const timestampEl = document.getElementById('timestamp');
    if (timestampEl) {
      timestampEl.textContent = `${hours}:${minutes}:${seconds}`;
    }
  }
  
  updateTimestamp();
  setInterval(updateTimestamp, 1000);
});

// Khởi tạo
resizeCanvas();
initSnowflakes();
animate();



