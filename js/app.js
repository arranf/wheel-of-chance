let CANVAS_MID_X;
let CANVAS_MID_Y;
const WHEEL_PERCENTAGE = 0.975;
let WHEEL_RADIUS;
const ROTATION_RESISTANCE = -360;
const ENTER_KEY = 13;
const MAX_ROTATION_SPEED = 4500;
const CHROME_COLOR = "#242423";
const WEDGE_COLOR_A = "#6C8EAD";
const WEDGE_COLOR_B = "#5FAD41"; //B7AD9C
const WEDGE_COLOR_C = "#F694C1";
const WEDGE_COLOR_D = "#FFFFFF";

let lastTime;
let delta;
let runTime = 0.0;
let canvas = document.getElementById("canvas");
let context = canvas.getContext("2d");

let wedgeSubdiv;
let wheelRotation = 90;
let rotationSpeed = 0;

let btn_addWedge = document.getElementById("add-wedge");
let wedge_input = document.getElementById("wedge-input");
let wedge_list = document.getElementById("wedge-list");
let spin_wheel = document.getElementById("spin-wheel");
let clear_list = document.getElementById("clear-list");
let copy_link = document.getElementById("copy-link");
let clipboard = document.getElementById("clipboard");

const mobile_break = 425;
const desktop_canvas_size = 500;
const mobile_canvas_size = 500;
const wedge_text_position = 0.65; // Distance Along Radius
const blank_message = "Add some values in the pane.";

let is_mobile = false;
let items = [];
let last_width = 0;
let dirty = false;

//
function setup() {
  clipboard.style.opacity = 0;
  clipboard.style.width = 0;
  clipboard.style.height = 0;
  CANVAS_MID_X = canvas.width / 2;
  CANVAS_MID_Y = canvas.height / 2;
  WHEEL_RADIUS = CANVAS_MID_X * WHEEL_PERCENTAGE;
  lastTime = Date.now();

  let saved_list = JSON.parse(localStorage.getItem("wheel_items"));

  if (saved_list && saved_list.length) {
    items = saved_list;
  }

  let hash = window.location.hash;
  let hashString = hash.substr(1, hash.length - 1);
  if (hashString.length) {
    let queryList = JSON.parse(decodeURIComponent(hashString));
    if (queryList.length) {
      items = queryList;
    }
  }

  resizeIfMobile();
  resizeCanvas();
  registerInputListeners();
  renderList();
  loop();
  refreshList();
}

function refreshList() {
  renderList();
  if (!dirty) {
    dirty = true;
  } else {
    localStorage.setItem("wheel_items", JSON.stringify(items));
  }
}

function addItem() {
  if (wedge_input && !wedge_input.value) return;
  items.push(wedge_input.value.substring(0, 22));
  wedge_input.value = "";
  refreshList();
}

function removeItem(index) {
  items.splice(index, 1);
  refreshList();
}

function spinWheel() {
  rotationSpeed +=
    (MAX_ROTATION_SPEED / 2) * (Math.random() * (1.75 - 0.75) + 0.75);
  rotationSpeed =
    rotationSpeed > MAX_ROTATION_SPEED ? MAX_ROTATION_SPEED : rotationSpeed;
}

function clearList() {
  items = [];
  refreshList();
}

function copyLink() {
  clipboard.innerText = encodeURI(
    window.location.href + "#" + JSON.stringify(items)
  );
  clipboard.select();
  document.execCommand("copy");
  clipboard.blur();
}

function resizeCanvas() {
  canvas.width = is_mobile ? mobile_canvas_size : desktop_canvas_size;
  canvas.height = is_mobile ? mobile_canvas_size : desktop_canvas_size;
  canvas.style.width = is_mobile ? mobile_canvas_size : desktop_canvas_size;
  canvas.style.height = is_mobile ? mobile_canvas_size : desktop_canvas_size;
  CANVAS_MID_X = canvas.width / 2;
  CANVAS_MID_Y = canvas.height / 2;
  WHEEL_RADIUS = CANVAS_MID_X * WHEEL_PERCENTAGE;
}

function resizeIfMobile() {
  is_mobile = window.innerWidth < mobile_break;
  if (last_width > mobile_break && is_mobile) {
    resizeCanvas();
  }

  if (last_width < mobile_break && !is_mobile) {
    resizeCanvas();
  }

  last_width = window.innerWidth;
}

function registerInputListeners() {
  btn_addWedge.onclick = addItem;
  wedge_input.onkeyup = function (e) {
    if (e.key === "Enter") {
      addItem();
    }
  };
  spin_wheel.onclick = spinWheel;
  clear_list.onclick = clearList;
  copy_link.onclick = copyLink;
}

function renderList() {
  let record_elem = templates.getElementsByTagName("listitem")[0];
  if (record_elem && wedge_list) {
    wedge_list.innerHTML = null;
    let i = 0;
    items.forEach(function (elem) {
      let template = record_elem.innerHTML;
      let instance = document.createElement("div");
      instance.innerHTML = template;
      let content = instance.getElementsByClassName("content")[0];
      let button = instance.getElementsByTagName("button")[0];
      if (content && button) {
        content.innerHTML = "";
        let contentDiv = document.createElement("span");
        contentDiv.innerText = elem;
        content.appendChild(contentDiv);
        button.setAttribute("data-id", i + "");
        button.onclick = function (e) {
          let id = e.target.getAttribute("data-id");
          if (!id) {
            id = e.target.parentNode.getAttribute("data-id");
          }
          removeItem(id);
        };
      }
      wedge_list.appendChild(instance);
      i++;
    });
  }
}

// Canvas Methods
function fillColor(color) {
  context.fillStyle = color;
}

function strokeColor(color) {
  context.strokeStyle = color;
}

function degRad(deg) {
  return deg * (Math.PI / 180);
}

function loop() {
  resizeIfMobile();
  context.clearRect(0, 0, canvas.width, canvas.height);
  let now = Date.now();
  delta = (now - lastTime) / 1000;
  if (delta > 0) {
    runTime += delta;
    wheelRotation += delta * rotationSpeed;
  }
  lastTime = Date.now();
  wedgeSubdiv = 360 / items.length;

  let wedgeRotation;
  let list_len = items.length;
  for (let i = 0; i < list_len; i++) {
    context.beginPath();
    wedgeRotation = i * wedgeSubdiv + wheelRotation;
    context.moveTo(CANVAS_MID_X, CANVAS_MID_Y);

    strokeColor("#CDCDCD");
    switch (i % 3) {
      case 0:
        fillColor(WEDGE_COLOR_A);
        break;
      case 1:
        fillColor(WEDGE_COLOR_B);
        break;
      case 2:
        fillColor(WEDGE_COLOR_C);
        break;
    }

    if (i === list_len - 1) {
      fillColor(WEDGE_COLOR_D);
    }

    context.arc(
      CANVAS_MID_X,
      CANVAS_MID_Y,
      WHEEL_RADIUS,
      degRad(wedgeRotation),
      degRad(wedgeRotation + wedgeSubdiv)
    );
    context.fill();
    if (i !== 0) {
      context.stroke();
    }
  }

  for (i = 0; i < items.length; i++) {
    context.beginPath();
    wedgeRotation = i * wedgeSubdiv + wheelRotation + wedgeSubdiv / 2;
    context.textAlign = "center";
    context.font = "1rem Nunito";
    if (i === list_len - 1) {
      fillColor("#000000");
    } else {
      fillColor("#FFFFFF");
    }
    context.save();
    context.translate(
      CANVAS_MID_X +
        Math.cos(degRad(wedgeRotation)) * (WHEEL_RADIUS * wedge_text_position),
      CANVAS_MID_Y +
        Math.sin(degRad(wedgeRotation)) * (WHEEL_RADIUS * wedge_text_position)
    );
    context.rotate(degRad(wedgeRotation + 180));
    context.fillText(items[i], 0, 0);
    context.restore();
  }

  fillColor(CHROME_COLOR);
  context.beginPath();
  context.moveTo(CANVAS_MID_X + canvas.width / 32, canvas.height / 64);
  context.lineTo(CANVAS_MID_X - canvas.width / 32, canvas.height / 64);
  context.lineTo(CANVAS_MID_X, canvas.height / 18);
  context.fill();

  if (!items.length) {
    context.beginPath();
    context.textAlign = "center";
    context.font = canvas.width / (is_mobile ? 18 : 24) + "px Nunito";
    fillColor(CHROME_COLOR);
    context.fillText(blank_message, CANVAS_MID_X, CANVAS_MID_Y);
  } else {
    context.beginPath();
    context.arc(CANVAS_MID_X, CANVAS_MID_Y, WHEEL_RADIUS / 32, 0, 2 * Math.PI);
    context.fill();
  }

  rotationSpeed += ROTATION_RESISTANCE * delta;
  rotationSpeed = clamp(rotationSpeed, 0);

  requestAnimationFrame(loop);
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}

/**
 * Returns a number whose value is limited to the given range.
 *
 * Example: limit the output of this computation to between 0 and 255
 * (x * 255).clamp(0, 255)
 *
 * @param {Number} min The lower boundary of the output range
 * @param {Number} max The upper boundary of the output range
 * @returns A number in the range [min, max]
 * @type Number
 */
clamp = function (value, min, max) {
  return Math.min(Math.max(value, min), max || Number.MAX_VALUE);
};

setup();
