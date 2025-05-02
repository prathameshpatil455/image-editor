let fileInput = document.getElementById("file"),
  chooseImg = document.querySelector(".choose-img"),
  saveImg = document.querySelector(".save-img"),
  previewImg = document.querySelector(".preview-img img"),
  resetFilter = document.querySelector(".reset-filter"),
  filterOptions = document.querySelectorAll(".filter button"),
  filterSlider = document.querySelector(".slider input"),
  filterName = document.querySelector(".filter-info .name"),
  filterValue = document.querySelector(".filter-info .value"),
  rotateOptions = document.querySelectorAll(".rotate button"),
  filter = document.querySelector(".filter"),
  rotate = document.querySelector(".rotate"),
  redChannel = document.querySelector(".red-channel"),
  greenChannel = document.querySelector(".green-channel"),
  blueChannel = document.querySelector(".blue-channel");

colorsChannel = document.querySelectorAll(".colors-channels");

let originalImage = null;
let brightness = 100,
  contrast = 100,
  invert = 0,
  hue = 0,
  saturation = 100,
  blurred = 0;
let rotateImg = 0,
  flipHorizontal = 1,
  flipVertical = 1;

const watermarkSection = document.querySelector(".watermark-section");
const watermarkTextInput = document.querySelector(".watermark-text");
const watermarkPositionSelect = document.querySelector(".watermark-position");
const applyWatermarkBtn = document.querySelector(".apply-watermark");
const removeWatermarkBtn = document.querySelector(".remove-watermark");

let watermarkedImageDataUrl = null;
let lastUnwatermarkedDataUrl = null;

const redactBlurBtn = document.querySelector(".redact-blur");
let isRedactMode = false;
let redactStart = null;
let redactEnd = null;
let redactRect = null;

chooseImg.addEventListener("click", () => fileInput.click());

function showImage() {
  let file = fileInput.files[0];
  if (!file) return;
  originalImage = URL.createObjectURL(file);
  previewImg.src = originalImage;
  resetFilter.classList.remove("disabled");
  filter.classList.remove("disabled");
  filterSlider.classList.remove("disabled");
  rotate.classList.remove("disabled");
  watermarkSection.style.display = "";
  watermarkedImageDataUrl = null;
  lastUnwatermarkedDataUrl = originalImage;
}

fileInput.addEventListener("change", showImage);

function applyFilter() {
  previewImg.style.transform = `rotate(${rotateImg}deg) scale(${flipHorizontal}, ${flipVertical})`;
  previewImg.style.filter = `brightness(${brightness}%) contrast(${contrast}%) invert(${invert}%) hue-rotate(${hue}deg) saturate(${saturation}%) blur(${blurred}px)`;
}

filterOptions.forEach((option) => {
  option.addEventListener("click", () => {
    document.querySelector(".filter button.active").classList.remove("active");
    option.classList.add("active");
    filterName.innerText = option.innerText;
    if (option.id == "brightness") {
      filterSlider.min = 0;
      filterSlider.max = 200;
      filterSlider.value = brightness;
      filterValue.innerText = `${brightness}%`;
    } else if (option.id == "contrast") {
      filterSlider.min = 0;
      filterSlider.max = 200;
      filterSlider.value = contrast;
      filterValue.innerText = `${contrast}%`;
    } else if (option.id == "invert") {
      filterSlider.min = 0;
      filterSlider.max = 100;
      filterSlider.value = invert;
      filterValue.innerText = `${invert}%`;
    } else if (option.id == "hue") {
      filterSlider.min = -180;
      filterSlider.max = 180;
      filterSlider.value = hue;
      filterValue.innerText = `${hue}deg`;
    } else if (option.id == "saturation") {
      filterSlider.min = 0;
      filterSlider.max = 100;
      filterSlider.value = saturation;
      filterValue.innerText = `${saturation}%`;
    } else if (option.id == "blur") {
      filterSlider.min = 0;
      filterSlider.max = 200;
      filterSlider.value = blurred;
      filterValue.innerText = `${blurred}px`;
    }
  });
});

filterSlider.addEventListener("input", updateSlider);

function updateSlider() {
  filterValue.innerHTML = `${filterSlider.value}%`;
  let selectedFilter = document.querySelector(".filter .active");
  if (selectedFilter.id == "brightness") {
    brightness = filterSlider.value;
    filterValue.innerText = `${filterSlider.value}5`;
  } else if (selectedFilter.id == "contrast") {
    contrast = filterSlider.value;
    filterValue.innerText = `${filterSlider.value}%`;
  } else if (selectedFilter.id == "invert") {
    invert = filterSlider.value;
    filterValue.innerText = `${filterSlider.value}%`;
  } else if (selectedFilter.id == "hue") {
    hue = filterSlider.value;
    filterValue.innerText = `${filterSlider.value}deg`;
  } else if (selectedFilter.id == "saturation") {
    saturation = filterSlider.value;
    filterValue.innerText = `${filterSlider.value}%`;
  } else if (selectedFilter.id == "blur") {
    blurred = filterSlider.value;
    filterValue.innerText = `${filterSlider.value}px`;
  }
  applyFilter();
}

rotateOptions.forEach((rotateOption) => {
  rotateOption.addEventListener("click", () => {
    if (rotateOption.id == "left") {
      rotateImg -= 90;
    } else if (rotateOption.id == "right") {
      rotateImg += 90;
    } else if (rotateOption.id == "horizontal") {
      flipHorizontal = flipHorizontal === 1 ? -1 : 1;
    } else if (rotateOption.id == "vertical") {
      flipVertical = flipVertical === 1 ? -1 : 1;
    }
    applyFilter();
  });
});

function resetFilters() {
  (brightness = 100),
    (contrast = 100),
    (invert = 0),
    (hue = 0),
    (saturation = 100),
    (blurred = 0);
  (rotateImg = 0), (flipHorizontal = 1), (flipVertical = 1);
  filterOptions[0].click();

  // Reset the color channels by removing the active class
  document.querySelectorAll(".color-channels button").forEach((btn) => {
    btn.classList.remove("active");
  });

  previewImg.src = originalImage;
  applyFilter();
}

function updateLastUnwatermarked() {
  // Save the current preview image as the last unwatermarked version
  // Only if it's not already watermarked
  if (!watermarkedImageDataUrl) {
    lastUnwatermarkedDataUrl = previewImg.src;
  }
}

function applyWatermark() {
  // Always use the last unwatermarked image as the base
  let baseSrc = lastUnwatermarkedDataUrl || previewImg.src;
  if (!baseSrc || baseSrc.includes("image-solid.svg")) {
    alert("Please upload an image first.");
    return;
  }
  const text = watermarkTextInput.value.trim();
  if (!text) {
    alert("Please enter watermark text.");
    return;
  }
  const position = watermarkPositionSelect.value;
  const image = new Image();
  image.src = baseSrc;
  image.onload = function () {
    const canvas = document.createElement("canvas");
    canvas.width = image.width;
    canvas.height = image.height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(image, 0, 0);
    // Watermark style
    ctx.font = `${Math.floor(canvas.width / 20)}px Arial`;
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.textBaseline = "bottom";
    ctx.textAlign = "left";
    let x = 0,
      y = 0;
    const padding = 20;
    const textWidth = ctx.measureText(text).width;
    const textHeight = parseInt(ctx.font, 10);
    switch (position) {
      case "bottom-right":
        x = canvas.width - textWidth - padding;
        y = canvas.height - padding;
        ctx.textAlign = "left";
        break;
      case "bottom-left":
        x = padding;
        y = canvas.height - padding;
        ctx.textAlign = "left";
        break;
      case "top-right":
        x = canvas.width - textWidth - padding;
        y = textHeight + padding;
        ctx.textAlign = "left";
        break;
      case "top-left":
        x = padding;
        y = textHeight + padding;
        ctx.textAlign = "left";
        break;
      case "center":
        x = canvas.width / 2;
        y = canvas.height / 2;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        break;
    }
    ctx.fillText(text, x, y);
    watermarkedImageDataUrl = canvas.toDataURL();
    previewImg.src = watermarkedImageDataUrl;
  };
}

function removeWatermark() {
  if (lastUnwatermarkedDataUrl) {
    previewImg.src = lastUnwatermarkedDataUrl;
    watermarkedImageDataUrl = null;
  }
}

applyWatermarkBtn.addEventListener("click", () => {
  updateLastUnwatermarked();
  applyWatermark();
});
removeWatermarkBtn.addEventListener("click", removeWatermark);

function saveImage() {
  let canvas = document.createElement("canvas");
  let ctx = canvas.getContext("2d");
  canvas.width = previewImg.naturalWidth;
  canvas.height = previewImg.naturalHeight;
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) invert(${invert}%) hue-rotate(${hue}deg) saturate(${saturation}%) blur(${blurred}px)`;
  if (rotateImg !== 0) {
    ctx.rotate((rotateImg * Math.PI) / 180);
  }
  ctx.scale(flipHorizontal, flipVertical);
  // If watermarked image is available, use it as the source
  if (watermarkedImageDataUrl) {
    let img = new Image();
    img.src = watermarkedImageDataUrl;
    img.onload = function () {
      ctx.drawImage(
        img,
        -canvas.width / 2,
        -canvas.height / 2,
        canvas.width,
        canvas.height
      );
      let link = document.createElement("a");
      link.download = "image.png";
      link.href = canvas.toDataURL();
      link.click();
    };
  } else {
    ctx.drawImage(
      previewImg,
      -canvas.width / 2,
      -canvas.height / 2,
      canvas.width,
      canvas.height
    );
    let link = document.createElement("a");
    link.download = "image.png";
    link.href = canvas.toDataURL();
    link.click();
  }
}

saveImg.addEventListener("click", saveImage);

resetFilter.addEventListener("click", resetFilters);

let originalImageSrc = null; // Initialize original image source

async function extractRGBPlanes(color) {
  if (!originalImageSrc) return; // Ensure there's an original image to work with
  const image = new Image();
  image.src = originalImageSrc;

  image.onload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = image.width;
    canvas.height = image.height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(image, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Reset all color channels except the selected one
    for (let i = 0; i < data.length; i += 4) {
      if (color === "red") {
        data[i + 1] = 0; // green
        data[i + 2] = 0; // blue
      } else if (color === "green") {
        data[i] = 0; // red
        data[i + 2] = 0; // blue
      } else if (color === "blue") {
        data[i] = 0; // red
        data[i + 1] = 0; // green
      }
    }

    ctx.putImageData(imageData, 0, 0);
    previewImg.src = canvas.toDataURL(); // Update the preview image
  };
}

// Function to handle active class toggle
function setActiveButton(button) {
  // Remove 'active' class from all channel buttons
  document.querySelectorAll(".color-channels button").forEach((btn) => {
    btn.classList.remove("active");
  });

  // Add 'active' class to the clicked button
  button.classList.add("active");
}

// Event listeners for color channels
document.querySelector(".red-channel").addEventListener("click", (event) => {
  setActiveButton(event.target);
  extractRGBPlanes("red");
});

document.querySelector(".green-channel").addEventListener("click", (event) => {
  setActiveButton(event.target);
  extractRGBPlanes("green");
});

document.querySelector(".blue-channel").addEventListener("click", (event) => {
  setActiveButton(event.target);
  extractRGBPlanes("blue");
});

// Save the original image source when it's loaded
previewImg.addEventListener("load", () => {
  originalImageSrc = originalImage; // Save the original image source
});

const scanMalwareBtn = document.querySelector(".scan-malware");

// Example list of known bad hashes (for demo purposes)
const knownBadHashes = [
  // Add real hashes here for production
  "e99a18c428cb38d5f260853678922e03", // Example MD5
];

function getFileHash(file, algorithm = "MD5") {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = function (event) {
      const buffer = event.target.result;
      // Use a simple hash for demo (MD5 via SparkMD5 or similar lib in real use)
      // Here, we use a simple hash for demonstration only
      let hash = 0,
        i,
        chr;
      for (i = 0; i < buffer.byteLength; i++) {
        chr = buffer[i];
        hash = (hash << 5) - hash + chr;
        hash |= 0;
      }
      resolve(hash.toString(16));
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

function scanForMalware() {
  const file = fileInput.files[0];
  if (!file) {
    alert("Please upload an image first.");
    return;
  }
  // Check for suspicious file name patterns
  const fileName = file.name.toLowerCase();
  if (fileName.match(/\.(jpg|jpeg|png|gif)\.(exe|js|bat|sh)$/)) {
    alert("Warning: Suspicious double extension detected!");
    return;
  }
  // Check for script tags in file name (very basic)
  if (fileName.includes("<script>")) {
    alert("Warning: Suspicious script tag detected in file name!");
    return;
  }
  // Hash check (demo only)
  getFileHash(file).then((hash) => {
    if (knownBadHashes.includes(hash)) {
      alert("Malware detected: This file matches a known malicious hash!");
    } else {
      alert("No known malware detected. (Note: This is a basic demo scan)");
    }
  });
}

scanMalwareBtn.addEventListener("click", scanForMalware);

// Helper to get mouse position relative to image
function getMousePosOnImage(e) {
  const rect = previewImg.getBoundingClientRect();
  const scaleX = previewImg.naturalWidth / rect.width;
  const scaleY = previewImg.naturalHeight / rect.height;
  return {
    x: Math.round((e.clientX - rect.left) * scaleX),
    y: Math.round((e.clientY - rect.top) * scaleY),
  };
}

function enableRedactMode() {
  isRedactMode = true;
  redactBlurBtn.textContent = "Done Redacting";
  previewImg.style.cursor = "crosshair";
}

function disableRedactMode() {
  isRedactMode = false;
  redactBlurBtn.textContent = "Redact/Blur Area";
  previewImg.style.cursor = "";
  redactStart = redactEnd = redactRect = null;
}

redactBlurBtn.addEventListener("click", () => {
  if (!isRedactMode) {
    enableRedactMode();
  } else {
    disableRedactMode();
  }
});

// Draw selection rectangle overlay
function drawSelectionRect(rect) {
  const overlayId = "redact-rect-overlay";
  let overlay = document.getElementById(overlayId);
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = overlayId;
    overlay.style.position = "absolute";
    overlay.style.border = "2px dashed #f00";
    overlay.style.background = "rgba(255,0,0,0.2)";
    overlay.style.pointerEvents = "none";
    overlay.style.zIndex = 10;
    document.body.appendChild(overlay);
  }
  const imgRect = previewImg.getBoundingClientRect();
  overlay.style.left = imgRect.left + rect.x + "px";
  overlay.style.top = imgRect.top + rect.y + "px";
  overlay.style.width = rect.width + "px";
  overlay.style.height = rect.height + "px";
}

function removeSelectionRect() {
  const overlay = document.getElementById("redact-rect-overlay");
  if (overlay) overlay.remove();
}

previewImg.addEventListener("mousedown", function (e) {
  if (!isRedactMode) return;
  redactStart = getMousePosOnImage(e);
  redactEnd = null;
  redactRect = null;
  document.addEventListener("mousemove", onRedactMouseMove);
  document.addEventListener("mouseup", onRedactMouseUp);
});

function onRedactMouseMove(e) {
  if (!isRedactMode || !redactStart) return;
  const pos = getMousePosOnImage(e);
  redactEnd = pos;
  // Calculate rectangle in image coordinates
  const x = Math.min(redactStart.x, redactEnd.x);
  const y = Math.min(redactStart.y, redactEnd.y);
  const width = Math.abs(redactStart.x - redactEnd.x);
  const height = Math.abs(redactStart.y - redactEnd.y);
  redactRect = { x, y, width, height };
  // Draw overlay in screen coordinates
  const imgRect = previewImg.getBoundingClientRect();
  const scaleX = imgRect.width / previewImg.naturalWidth;
  const scaleY = imgRect.height / previewImg.naturalHeight;
  drawSelectionRect({
    x: x * scaleX,
    y: y * scaleY,
    width: width * scaleX,
    height: height * scaleY,
  });
}

function onRedactMouseUp(e) {
  document.removeEventListener("mousemove", onRedactMouseMove);
  document.removeEventListener("mouseup", onRedactMouseUp);
  removeSelectionRect();
  if (
    !isRedactMode ||
    !redactRect ||
    redactRect.width === 0 ||
    redactRect.height === 0
  )
    return;
  // Blur the selected area
  const image = new Image();
  image.src = previewImg.src;
  image.onload = function () {
    const canvas = document.createElement("canvas");
    canvas.width = image.width;
    canvas.height = image.height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(image, 0, 0);
    // Get the selected area
    const area = ctx.getImageData(
      redactRect.x,
      redactRect.y,
      redactRect.width,
      redactRect.height
    );
    // Blur the area (simple box blur)
    const blurred = blurImageData(area, 8); // 8px blur
    ctx.putImageData(blurred, redactRect.x, redactRect.y);
    previewImg.src = canvas.toDataURL();
    // Update watermark state if needed
    watermarkedImageDataUrl = null;
    lastUnwatermarkedDataUrl = previewImg.src;
  };
  redactStart = redactEnd = redactRect = null;
}

// Simple box blur for ImageData
function blurImageData(imageData, radius) {
  const { data, width, height } = imageData;
  const newData = new Uint8ClampedArray(data);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0,
        g = 0,
        b = 0,
        a = 0,
        count = 0;
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            const idx = (ny * width + nx) * 4;
            r += data[idx];
            g += data[idx + 1];
            b += data[idx + 2];
            a += data[idx + 3];
            count++;
          }
        }
      }
      const idx = (y * width + x) * 4;
      newData[idx] = r / count;
      newData[idx + 1] = g / count;
      newData[idx + 2] = b / count;
      newData[idx + 3] = a / count;
    }
  }
  return new ImageData(newData, width, height);
}
