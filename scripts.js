let myShip;
let score = 0;
let stars = [];
let enemyShips = [];
let heartMissiles = [];
let cooldownAttack = 0;
let acceleration = 0;
let pause = false;
let gameIsOver = false;

const gameWidth = 780;
const gameHeight = 500;

let audioMusic = document.getElementById("music");
audioMusic.loop = true;
audioMusic.volume = 0.2;
audioMusic.mute = false;

const enableMute = () => {
  audioMusic.muted = !audioMusic.muted;
  audio.muted = !audio.muted;
  audioBisou.muted = !audioBisou.muted;
  audioGO.muted = !audioGO.muted;
  document.getElementById("mute").innerHTML = audioMusic.muted
    ? "<img src='pics/mute.png' class='btnScreen'></img>"
    : "<img src='pics/sound.png' class='btnScreen'></img>";
};

function component(width, height, color, x, y, speedX = 0) {
  this.color = color;
  this.width = width;
  this.height = height;
  this.speedX = speedX;
  this.speedY = 0;
  this.x = x;
  this.y = y;
  this.update = function () {
    ctx = myGameArea.context;
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
  };
  this.newPos = function () {
    this.x += this.speedX;
    this.y += this.speedY;
  };
}

const myGameArea = {
  canvas: document.createElement("canvas"),
  start: function () {
    this.canvas.width = gameWidth;
    this.canvas.height = gameHeight;
    this.canvas.id = "canvas";
    this.context = this.canvas.getContext("2d");
    document.body.insertBefore(this.canvas, document.body.childNodes[0]);
    this.interval = setInterval(updateGameArea, 20);
  },
  clear: function () {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  },
};

// Création d'un vaisseau standard
function componentShip(width, height, color, x, y, image, name, speedX = 0) {
  this.color = color;
  this.width = width;
  this.height = height;
  this.image = image;
  this.name = name;
  this.speedX = speedX;
  this.speedY = 0;
  this.x = x;
  this.y = y;
  this.update = function () {
    let img = new Image();
    img.src = this.image;

    ctx = myGameArea.context;
    ctx.drawImage(img, this.x, this.y, this.width, this.height);
    ctx.fillStyle = this.color;
    // Press Start 2P
    ctx.font = "16px sans-serif";
    ctx.fillText(this.name, this.x, this.y - 10);
  };
  this.newPos = function () {
    this.x += this.speedX;
    this.y += this.speedY;
  };

  this.newPosMyShip = function () {
    this.x += this.speedX;
    this.y += this.speedY;
    this.speedX = 0;
    this.speedY = 0;
  };
}

// Démarage du jeu
const startGame = () => {
  // myShip = new component(30, 30, "red", 100, 120);
  myShip = new componentShip(
    Math.random() * 25 + 35,
    Math.random() * 20 + 30,
    "red",
    100,
    120,
    `pics/Ship${getRandom(1, 6)}.png`,
    "Star Lover",
  );
  // Création du modèle carré rouge
  myGameArea.start();
};

// Création des étoiles
const updateStars = () => {
  // pour que letoile soit bien carree il faut que la hauteur = la largeur
  let starSize = Math.random() * 5;
  if (Math.random() > 0.9)
    stars.push(
      new component(
        starSize,
        starSize,
        "white",
        gameWidth,
        Math.random() * gameHeight,
        -2,
      ),
    );
  stars.forEach((star) => {
    star.newPos();
    star.update();
  });
};

// Création des vaisseau à convertir
const updateShip = () => {
  // pour que le vaisseau soit bien carré il faut que la hauteur = la largeur

  let shipSize = 60;
  const randName = names[getRandom(0, names.length - 1)];
  if (Math.random() > 0.985)
    enemyShips.push(
      new componentShip(
        Math.random() * 25 + 35,
        Math.random() * 20 + 30,
        "yellow",
        gameWidth,
        Math.random() * (gameHeight - shipSize),
        `pics/reverse/Ship${getRandom(1, 6)}.png`,
        randName,
        -2 - Math.random() * 3,
      ),
    );
  enemyShips.forEach((ship) => {
    ship.newPos();
    ship.update();
  });
};

const updateGameArea = () => {
  myGameArea.clear();
  updateStars();
  updateShip();
  updateHeartMissiles();
  myShip.newPosMyShip(); // calcul de pos
  myShip.update(); // afichage
  detectColision();
  stars = deleteTooFarObj(stars);
  enemyShips = deleteTooFarObj(enemyShips);
  heartMissiles = deleteTooFarObj(heartMissiles);
  if (cooldownAttack > 0) cooldownAttack--;
};

const deleteTooFarObj = (objArray) => {
  for (let i = objArray.length - 1; i >= 0; i--) {
    if (
      objArray[i].x >= 1000 ||
      objArray[i].x <= -1000 ||
      objArray[i].y >= 1000 ||
      objArray[i].y <= -1000
    ) {
      delete objArray[i];
      objArray.splice(i, 1);
    }
  }
  return objArray;
};

const audio = new Audio(`sounds/shot.wav`);
audio.volume = 0.4;
audio.mute = false;

const shoot = () => {
  if (cooldownAttack > 0) return;
  cooldownAttack = 20;
  audio.play();
  heartMissiles.push(
    new componentShip(
      20,
      20,
      "red",
      myShip.x + myShip.width,
      myShip.y + myShip.height / 2 - 10,
      "pics/heart.png",
      "",
      4,
    ),
  );
};

const updateHeartMissiles = () => {
  heartMissiles.forEach((heart, hIndex) => {
    heart.newPos();

    //collision detection
    for (let i = 0; i < enemyShips.length; i++) {
      if (
        heart.x <= enemyShips[i].x + enemyShips[i].width &&
        heart.x >= enemyShips[i].x - 5 &&
        heart.y <= enemyShips[i].y + enemyShips[i].height &&
        heart.y >= enemyShips[i].y - 15
      ) {
        // make ennemy a friend
        convertEnnemy(enemyShips[i]);
        score++;
        document.getElementById("myScore").innerText = `Score: ${score}`;
        document.getElementById("ScoreTitre").innerText = `${score}`;

        // acceleration of the game
        acceleration = Math.floor(score / 10);
        console.log("acceleration=" + acceleration);
        clearInterval(myGameArea.interval);
        myGameArea.interval = setInterval(updateGameArea, 20 - acceleration);
        // makes missile disappear
        heartMissiles.splice(hIndex, 1);
        delete heart;
        break;
      }
    }
    heart.update();
  });
};

const audioBisou = new Audio(`sounds/Kiss${Math.ceil(Math.random() * 5)}.wav`);
audioBisou.mute = false;
const convertEnnemy = (enemy) => {
  enemy.color = "pink";
  enemy.speedX = 7; // change direction
  enemy.image = enemy.image.replace("/reverse", "");
  enemy.update();
  audioBisou.play();
};

const moveup = () => {
  if (myShip.y >= 10) myShip.speedY -= 10;
};

const movedown = () => {
  if (myShip.y <= gameHeight - 60) myShip.speedY += 10;
};

const moveleft = () => {
  if (myShip.x >= 10) myShip.speedX -= 10;
};

const moveright = () => {
  if (myShip.x <= gameWidth - 0.3 * gameWidth) myShip.speedX += 10;
};
const getRandom = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};
const pauseGame = () => {
  if (gameIsOver) location.reload();
  if (pause) {
    myGameArea.interval = setInterval(updateGameArea, 20 - acceleration);
    document.getElementById("pause").innerHTML =
      "<img src='pics/pause.png' class='btnScreen'></img>";
  } else {
    clearInterval(myGameArea.interval);
    document.getElementById("pause").innerHTML =
      "<img src='pics/play.png' class='btnScreen'></img>";
  }
  pause = !pause;
};

const detectColision = () => {
  for (let i = 0; i < enemyShips.length; i++) {
    if (
      myShip.x <= enemyShips[i].x + enemyShips[i].width &&
      myShip.x >= enemyShips[i].x - 5 &&
      myShip.y <= enemyShips[i].y + 40 &&
      myShip.y >= enemyShips[i].y - 40
    ) {
      gameOver();
    }
  }
};
const audioGO = new Audio(`sounds/game-over.wav`);
audioGO.volume = 0.4;
audioGO.mute = false;
const gameOver = () => {
  audioGO.play();
  gameIsOver = true;
  myGameArea.clear();
  clearInterval(myGameArea.interval);
  ctx.fillStyle = "white";
  ctx.font = "64px sans-serif";
  ctx.fillText("GAME OVER", gameWidth / 4, gameHeight / 4);
  ctx.font = "32px sans-serif";
  ctx.fillText(
    `You converted ${score} Star Warriors to the Star Love`,
    gameWidth / 12,
    gameHeight / 2,
  );
  ctx.font = "32px sans-serif";
  ctx.fillText(
    `Press Pause (Escape) to try again`,
    gameWidth / 8,
    (3 * gameHeight) / 4,
  );
};

window.addEventListener("keydown", (event) => {
  event.preventDefault();
  if (event.code.includes("Arrow") || event.code.includes("Space"))
    document.getElementById(event.code).classList.add("is-pushed");
  switch (event.code) {
    case "ArrowDown":
      movedown();
      break;
    case "ArrowUp":
      moveup();
      break;
    case "ArrowLeft":
      moveleft();
      break;
    case "ArrowRight":
      moveright();
      break;
    case "Space":
      shoot();
      break;
    case "Escape":
      pauseGame();
      break;
  }
});

window.addEventListener("keyup", (event) => {
  event.preventDefault();
  if (event.code.includes("Arrow") || event.code.includes("Space"))
    document.getElementById(event.code).classList.remove("is-pushed");
});
