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

// function extractRGBPlanes(imageSrc) {
//   return new Promise((resolve, reject) => {
//     const image = new Image();
//     image.src = imageSrc;
//     image.onload = () => {
//       const canvas = document.createElement("canvas");
//       const ctx = canvas.getContext("2d");
//       canvas.width = image.width;
//       canvas.height = image.height;

//       // Draw the image onto the canvas
//       ctx.drawImage(image, 0, 0);

//       // Create separate canvases for each color channel
//       const redCanvas = document.createElement("canvas");
//       const greenCanvas = document.createElement("canvas");
//       const blueCanvas = document.createElement("canvas");

//       redCanvas.width = greenCanvas.width = blueCanvas.width = canvas.width;
//       redCanvas.height = greenCanvas.height = blueCanvas.height = canvas.height;

//       const redCtx = redCanvas.getContext("2d");
//       const greenCtx = greenCanvas.getContext("2d");
//       const blueCtx = blueCanvas.getContext("2d");

//       // Extract and display the Red channel
//       redCtx.drawImage(image, 0, 0);
//       redCtx.globalCompositeOperation = "source-in";
//       redCtx.fillStyle = "red";
//       redCtx.fillRect(0, 0, canvas.width, canvas.height);

//       // Extract and display the Green channel
//       greenCtx.drawImage(image, 0, 0);
//       greenCtx.globalCompositeOperation = "source-in";
//       greenCtx.fillStyle = "green";
//       greenCtx.fillRect(0, 0, canvas.width, canvas.height);

//       // Extract and display the Blue channel
//       blueCtx.drawImage(image, 0, 0);
//       blueCtx.globalCompositeOperation = "source-in";
//       blueCtx.fillStyle = "blue";
//       blueCtx.fillRect(0, 0, canvas.width, canvas.height);

//       // Resolve the promise with the three color channel canvases
//       resolve({ red: redCanvas, green: greenCanvas, blue: blueCanvas });
//     };

//     image.onerror = () => {
//       reject(new Error("Failed to load the image."));
//     };
//   });
// }

// // Example usage:
// // Replace 'imageSrc' with the source URL of your image
// const imageSrc = "your-image-source-url.jpg";
// extractRGBPlanes(imageSrc)
//   .then((channels) => {
//     // channels.red contains the Red channel as a canvas
//     // channels.green contains the Green channel as a canvas
//     // channels.blue contains the Blue channel as a canvas
//     // You can display or use these canvases as needed
//     document.body.appendChild(channels.red); // Example: Append the Red channel canvas to the body
//   })
//   .catch((error) => {
//     console.error(error);
//   });
