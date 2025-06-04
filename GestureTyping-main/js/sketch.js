// ジェスチャーの種類
// 👍(Thumb_Up), 👎(Thumb_Down), ✌️(Victory), 
// ☝️(Pointng_Up), ✊(Closed_Fist), 👋(Open_Palm), 
// 🤟(ILoveYou)
function getCode(left_gesture, right_gesture) {
  let code_array = {
    "one": 1,
    "two": 2,
    "three": 3,
    "four": 4,
    "five": 5,
    "zero": 0,
  }
  let left_code = code_array[left_gesture];
  let right_code = code_array[right_gesture];
  // left_codeとright_codeを文字として結合
  let code = String(left_code) + String(right_code);
  return code;
}

function getCharacter(code) {
  const codeToChar = {
    "11": "a", "12": "b", "13": "c", "14": "d", "15": "e", "21": "f",
    "22": "g", "23": "h", "24": "i", "25": "j", "31": "k", "32": "l",
    "33": "m", "34": "n", "35": "o", "41": "p", "42": "q", "43": "r",
    "44": "s", "45": "t", "51": "u", "52": "v", "53": "w", "54": "x",
    "55": "y", "01": "z", "02": " ", "03": "backspace"
  };
  return codeToChar[code] || "";
}

// 入力サンプル文章 
let sample_texts = [
  "the quick brown fox jumps over the lazy dog",
];

// ゲームの状態を管理する変数
// notready: ゲーム開始前 （カメラ起動前）
// ready: ゲーム開始前（カメラ起動後）
// playing: ゲーム中
// finished: ゲーム終了後
// ready, playing, finished
let game_mode = {
  now: "notready",
  previous: "notready",
};

let game_start_time = 0;
let gestures_results;
let cam = null;
let p5canvas = null;
let displayChar = "";
let displayCharTime = 0;

function setup() {
  p5canvas = createCanvas(240, 180); // 以前より大きめの解像度
  p5canvas.parent('#canvas');
  // 画面幅の1/6にcanvasをリサイズ（少し大きめ）
  const largerWidth = Math.floor(window.innerWidth / 6);
  p5canvas.style('width', largerWidth + 'px');
  p5canvas.style('height', 'auto');

  // When gestures are found, the following function is called. The detection results are stored in results.
  let lastChar = "";
  let lastCharTime = millis();

  gotGestures = function (results) {
    gestures_results = results;

    if (results.gestures.length == 2) {
      if (game_mode.now == "ready" && game_mode.previous == "notready") {
        // ゲーム開始前の状態から、カメラが起動した後の状態に変化した場合
        game_mode.previous = game_mode.now;
        game_mode.now = "playing";
        document.querySelector('input').value = ""; // 入力欄をクリア
        game_start_time = millis(); // ゲーム開始時間を記録
      }
      let left_gesture;
      let right_gesture;
      if (results.handedness[0][0].categoryName == "Left") {
        left_gesture = results.gestures[0][0].categoryName;
        right_gesture = results.gestures[1][0].categoryName;
      } else {
        left_gesture = results.gestures[1][0].categoryName;
        right_gesture = results.gestures[0][0].categoryName;
      }
      let code = getCode(left_gesture, right_gesture);
      let c = getCharacter(code);

      let now = millis();
      if (c === lastChar) {
        if (now - lastCharTime > 700) {
          // 0.7秒以上cが同じ値である場合の処理
          typeChar(c);
          lastCharTime = now;
        }
        // 0.5秒間表示用
        if (c !== "") {
          displayChar = c;
          displayCharTime = now;
        }
      } else {
        lastChar = c;
        lastCharTime = now;
        // 0.5秒間表示用
        if (c !== "") {
          displayChar = c;
          displayCharTime = now;
        }
      }
    }

  }
}

// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// ここから下は課題制作にあたって編集してはいけません。
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

// 入力欄に文字を追加する場合は必ずこの関数を使用してください。
function typeChar(c) {
  if (c === "") {
    console.warn("Empty character received, ignoring.");
    return;
  }
  document.querySelector('input').focus();
  const input = document.querySelector('input');
  let playSound = false;
  if (c === "backspace") {
    if (input.value.length > 0) playSound = true;
    input.value = input.value.slice(0, -1);
  } else {
    input.value += c;
    playSound = true;
  }

  if (playSound) {
    const audio = new Audio('maou_se_system41.mp3');
    audio.play();
  }

  let inputValue = input.value;
  // #messageのinnerTextを色付けして表示
  const messageElem = document.querySelector('#message');
  const target = messageElem.innerText;
  let matchLen = 0;
  for (let i = 0; i < Math.min(inputValue.length, target.length); i++) {
    if (inputValue[i] === target[i]) {
      matchLen++;
    } else {
      break;
    }
  }
  const matched = target.slice(0, matchLen);
  const unmatched = target.slice(matchLen);
  console.log(`Matched: ${matched}, Unmatched: ${unmatched}`);
  messageElem.innerHTML =
    `<span style="background-color:lightgreen">${matched}</span><span style="background-color:transparent">${unmatched}</span>`;




  // もしvalueの値がsample_texts[0]と同じになったら、[0]を削除して、次のサンプル文章に移行する。配列長が0になったらゲームを終了する
  if (document.querySelector('input').value == sample_texts[0]) {
    sample_texts.shift(); // 最初の要素を削除
    console.log(sample_texts.length);
    if (sample_texts.length == 0) {
      // サンプル文章がなくなったらゲーム終了
      game_mode.previous = game_mode.now;
      game_mode.now = "finished";
      document.querySelector('input').value = "";
      const elapsedSec = ((millis() - game_start_time) / 1000).toFixed(2);
      document.querySelector('#message').innerText = `Finished: ${elapsedSec} sec`;
    } else {
      // 次のサンプル文章に移行
      document.querySelector('input').value = "";
      document.querySelector('#message').innerText = sample_texts[0];
    }
  }

}


function startWebcam() {
  // If the function setCameraStreamToMediaPipe is defined in the window object, the camera stream is set to MediaPipe.
  if (window.setCameraStreamToMediaPipe) {
    cam = createCapture(VIDEO);
    cam.hide();
    cam.elt.style.transform = 'scaleX(-1)'; // MediaPipe用の映像も左右反転
    cam.elt.onloadedmetadata = function () {
      window.setCameraStreamToMediaPipe(cam.elt);
    }
    // p5canvasのサイズ変更処理は行わない
  }

  if (game_mode.now == "notready") {
    game_mode.previous = game_mode.now;
    game_mode.now = "ready";
    document.querySelector('#message').innerText = sample_texts[0];
    game_start_time = millis();
  }
}


// ウィンドウリサイズ時にもcanvasサイズを調整
window.addEventListener('resize', () => {
  if (p5canvas) {
    const largerWidth = Math.floor(window.innerWidth / 6);
    p5canvas.style('width', largerWidth + 'px');
    p5canvas.style('height', 'auto');
  }
});

function draw() {
  background(127);
  if (cam) {
    push();
    translate(width, 0); // 右端に移動
    scale(-1, 1); // 左右反転
    image(cam, 0, 0, width, height);
    pop();
  }
  // 認識モデルのランドマークやラベルも左右反転して表示
  if (gestures_results) {
    if (gestures_results.landmarks) {
      for (const landmarks of gestures_results.landmarks) {
        for (let landmark of landmarks) {
          noStroke();
          fill(100, 150, 210);
          // x座標を左右反転
          circle((1 - landmark.x) * width, landmark.y * height, 10);
        }
      }
    }
    for (let i = 0; i < gestures_results.gestures.length; i++) {
      noStroke();
      fill(255, 0, 0);
      textSize(10);
      let name = gestures_results.gestures[i][0].categoryName;
      let score = gestures_results.gestures[i][0].score;
      let right_or_left = gestures_results.handednesses[i][0].hand;
      let pos = {
        x: (1 - gestures_results.landmarks[i][0].x) * width,
        y: gestures_results.landmarks[i][0].y * height,
      };
      textSize(20);
      fill(0);
      textAlign(CENTER, CENTER);
      text(name, pos.x, pos.y);
    }
  }

  if (game_mode.now == "notready") {
    // 文字の後ろを白で塗りつぶす
    let msg = "Press the start button to begin";
    textSize(18);
    let tw = textWidth(msg) + 20;
    let th = 32;
    let tx = width / 2;
    let ty = height / 2;
    rectMode(CENTER);
    fill(255, 100);
    noStroke();
    rect(tx, ty, tw, th, 8);
    fill(0);
    textAlign(CENTER, CENTER);
    text(msg, tx, ty);
  }
  else if (game_mode.now == "ready") {
    let msg = "Waiting for gestures to start";
    textSize(18);
    let tw = textWidth(msg) + 20;
    let th = 32;
    let tx = width / 2;
    let ty = height / 2;
    rectMode(CENTER);
    fill(255, 100);
    noStroke();
    rect(tx, ty, tw, th, 8);
    fill(0);
    textAlign(CENTER, CENTER);
    text(msg, tx, ty);
  }
  else if (game_mode.now == "playing") {
    // ゲーム中のメッセージ
    let elapsedSec = ((millis() - game_start_time) / 1000).toFixed(2);
    let msg = `${elapsedSec} [s]`;
    textSize(18);
    let tw = textWidth(msg) + 20;
    let th = 32;
    let tx = width / 2;
    let ty = th;
    rectMode(CENTER);
    fill(255, 100);
    noStroke();
    rect(tx, ty, tw, th, 8);
    fill(0);
    textAlign(CENTER, CENTER);
    text(msg, tx, ty);
  }
  else if (game_mode.now == "finished") {
    // ゲーム終了後のメッセージ
    let msg = "Game finished!";
    textSize(18);
    let tw = textWidth(msg) + 20;
    let th = 32;
    let tx = width / 2;
    let ty = height / 2;
    rectMode(CENTER);
    fill(255, 100);
    noStroke();
    rect(tx, ty, tw, th, 8);
    fill(0);
    textAlign(CENTER, CENTER);
    text(msg, tx, ty);
  }
  // 0.5秒間cを表示
  if (displayChar !== "" && millis() - displayCharTime < 500) {
    push();
    fill(255);
    textSize(100);
    textAlign(CENTER, CENTER);
    text(displayChar, width / 2, height / 2);
    pop();
  }

}


