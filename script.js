"use strict";

/* =========================
   얼굴 기준점
   왼쪽 / 오른쪽은 화면 기준
========================= */

const POINTS = [
  ["top", "이마 위 중앙 (헤어라인보다 아래 얼굴 경계)", 10],
  ["chin", "턱 끝", 152],

  ["cheekL", "왼쪽 광대 바깥", 234],
  ["cheekR", "오른쪽 광대 바깥", 454],

  ["jawL", "왼쪽 턱 모서리", 172],
  ["jawR", "오른쪽 턱 모서리", 397],

  ["eyeLO", "왼쪽 눈 바깥꼬리", 33],
  ["eyeLI", "왼쪽 눈 안쪽꼬리", 133],
  ["eyeLU", "왼쪽 윗눈꺼풀 중앙", 159],
  ["eyeLD", "왼쪽 아랫눈꺼풀 중앙", 145],

  ["eyeRI", "오른쪽 눈 안쪽꼬리", 362],
  ["eyeRO", "오른쪽 눈 바깥꼬리", 263],
  ["eyeRU", "오른쪽 윗눈꺼풀 중앙", 386],
  ["eyeRD", "오른쪽 아랫눈꺼풀 중앙", 374],

  ["root", "콧대 시작 (눈 사이)", 168],
  ["nose", "코끝", 1],
  ["noseL", "왼쪽 콧방울 바깥", 98],
  ["noseR", "오른쪽 콧방울 바깥", 327],

  ["mouthL", "왼쪽 입꼬리", 61],
  ["mouthR", "오른쪽 입꼬리", 291],
  ["lipU", "윗입술 바깥 중앙", 0],
  ["lipD", "아랫입술 바깥 중앙", 17]
];

/* =========================
   결과 그룹
========================= */

const GROUPS = [
  "FACE STRUCTURE",
  "EYES",
  "NOSE",
  "MOUTH",
  "FACE SHAPE",
  "BALANCE"
];

/*
  항목 구조:
  [그룹 번호, 항목 이름, 허용 차이, 계산 설명]

  허용 차이는 해당 차이에서 50점이 되도록 정한
  앱 내부 기준이며, 통계적으로 검증된 기준은 아닙니다.
*/

const METRICS = [
  [
    0,
    "얼굴 가로·세로 비율",
    0.25,
    "얼굴 폭 / 얼굴 높이"
  ],
  [
    0,
    "눈 높이 비율",
    0.12,
    "이마 위에서 눈 중심까지 / 얼굴 높이"
  ],
  [
    0,
    "중안부 비율",
    0.12,
    "눈 중심에서 코끝까지 / 얼굴 높이"
  ],
  [
    0,
    "하안부 비율",
    0.12,
    "코끝에서 턱까지 / 얼굴 높이"
  ],

  [
    1,
    "눈 사이 간격",
    0.10,
    "눈 중심 사이 거리 / 얼굴 폭"
  ],
  [
    1,
    "눈 너비",
    0.07,
    "양쪽 눈 너비 평균 / 얼굴 폭"
  ],
  [
    1,
    "눈 가로·세로 비율",
    0.20,
    "양쪽 눈의 높이 / 너비 평균"
  ],
  [
    1,
    "눈꼬리 기울기",
    0.18,
    "눈 안쪽→바깥쪽 기울기의 양쪽 평균 (라디안)"
  ],
  [
    1,
    "안쪽 눈 간격",
    0.09,
    "양쪽 눈 안쪽꼬리 거리 / 얼굴 폭"
  ],

  [
    2,
    "코 길이",
    0.10,
    "콧대 시작에서 코끝까지 / 얼굴 높이"
  ],
  [
    2,
    "코 너비",
    0.08,
    "콧방울 사이 거리 / 얼굴 폭"
  ],
  [
    2,
    "코 중심 위치",
    0.07,
    "코끝의 얼굴 중심선 이탈 / 얼굴 폭"
  ],

  [
    3,
    "입 너비",
    0.10,
    "입꼬리 사이 거리 / 얼굴 폭"
  ],
  [
    3,
    "입술 높이",
    0.06,
    "입술 바깥 위아래 거리 / 얼굴 높이"
  ],
  [
    3,
    "코·입 간격",
    0.07,
    "코끝에서 입 중심까지 / 얼굴 높이"
  ],
  [
    3,
    "입 중심 위치",
    0.07,
    "입 중심의 얼굴 중심선 이탈 / 얼굴 폭"
  ],

  [
    4,
    "턱 너비",
    0.15,
    "턱 모서리 사이 거리 / 광대 폭"
  ],
  [
    4,
    "턱 길이",
    0.10,
    "입 중심에서 턱 끝까지 / 얼굴 높이"
  ],
  [
    4,
    "턱 아래 비율",
    0.10,
    "턱 모서리 평균 높이에서 턱 끝까지 / 얼굴 높이"
  ],
  [
    4,
    "하관 좁아짐",
    0.12,
    "(광대 폭 − 턱 너비) / 얼굴 높이"
  ],

  [
    5,
    "좌우 폭 균형",
    0.12,
    "중심선 기준 좌우 광대 폭의 차이 / 얼굴 폭"
  ],
  [
    5,
    "눈 크기 균형",
    0.07,
    "양쪽 눈 너비 차이 / 얼굴 폭"
  ]
];

/* =========================
   공통 상태 및 함수
========================= */

const $ = (selector) => document.querySelector(selector);

const sides = [];

let busy = false;
let modelPromise = null;

const dist = (a, b) => {
  return Math.hypot(a.x - b.x, a.y - b.y);
};

const mid = (a, b) => {
  return {
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2
  };
};

const mean = (values) => {
  return values.reduce((sum, value) => sum + value, 0)
    / values.length;
};

function update() {
  $("#analyzeButton").disabled =
    busy || !sides.every((side) => side.ready);
}

function invalidate() {
  $("#result").hidden = true;
  update();
}

function setBusy(value) {
  busy = value;

  document.querySelectorAll(
    ".upload-card button, .upload-card input, .upload-card select"
  ).forEach((element) => {
    const side = sides.find((item) => {
      return item.card.contains(element);
    });

    element.disabled =
      value ||
      (!element.matches("input") && !side.image);
  });

  update();
}

/* =========================
   사진과 기준점 그리기
========================= */

function draw(side) {
  const canvas = side.canvas;
  const context = canvas.getContext("2d");

  context.clearRect(
    0,
    0,
    canvas.width,
    canvas.height
  );

  if (!side.image) return;

  context.drawImage(
    side.image,
    0,
    0,
    canvas.width,
    canvas.height
  );

  const scale = canvas.width / 420;

  POINTS.forEach(([key], index) => {
    const point = side.points[key];

    if (!point) return;

    context.beginPath();

    context.arc(
      point.x,
      point.y,
      4 * scale,
      0,
      Math.PI * 2
    );

    context.fillStyle =
      index === side.select.selectedIndex
        ? "#ffda79"
        : "#67e8f9";

    context.fill();

    context.strokeStyle = "#06111c";
    context.lineWidth = 2 * scale;
    context.stroke();

    context.font = `bold ${11 * scale}px sans-serif`;

    context.strokeText(
      String(index + 1),
      point.x + 6 * scale,
      point.y - 5 * scale
    );

    context.fillText(
      String(index + 1),
      point.x + 6 * scale,
      point.y - 5 * scale
    );
  });

  if (side.editing) {
    const point = side.cursor;

    context.strokeStyle = "#ffda79";
    context.lineWidth = 2 * scale;

    context.beginPath();

    context.moveTo(
      point.x - 9 * scale,
      point.y
    );

    context.lineTo(
      point.x + 9 * scale,
      point.y
    );

    context.moveTo(
      point.x,
      point.y - 9 * scale
    );

    context.lineTo(
      point.x,
      point.y + 9 * scale
    );

    context.stroke();
  }
}

/* =========================
   기준점 편집
========================= */

function edit(side) {
  side.editing = true;
  side.ready = false;
  side.editor.hidden = false;

  invalidate();

  side.note.textContent =
    "기준점 위치를 확인하세요. 잘못된 점은 목록에서 선택한 뒤 사진을 눌러 수정하세요.";

  draw(side);
}

function place(side, x, y) {
  if (!side.editing || busy) return;

  const key = POINTS[side.select.selectedIndex][0];

  side.points[key] = { x, y };

  side.mode = "직접 지정/수정";
  side.ready = false;

  invalidate();

  if (side.select.selectedIndex < POINTS.length - 1) {
    side.select.selectedIndex++;
  }

  const count = Object.keys(side.points).length;
  const nextName = POINTS[side.select.selectedIndex][1];

  side.note.textContent =
    `${count}/${POINTS.length}개 지정 · 다음: ${nextName}`;

  draw(side);
}

/* =========================
   얼굴 비율 추출
========================= */

function features(raw) {
  for (const [key] of POINTS) {
    const point = raw[key];

    if (
      !point ||
      !Number.isFinite(point.x) ||
      !Number.isFinite(point.y)
    ) {
      throw new Error(
        "22개 기준점을 모두 지정해 주세요."
      );
    }
  }

  /*
    이마 위 → 턱 끝 방향을 세로축으로 사용합니다.
    사진 크기 및 평면상 기울기 영향을 줄입니다.
  */

  const axis = {
    x: raw.chin.x - raw.top.x,
    y: raw.chin.y - raw.top.y
  };

  const H = Math.hypot(axis.x, axis.y);

  if (H < 20) {
    throw new Error(
      "얼굴 높이가 너무 작습니다. 더 큰 얼굴 사진이나 기준점을 확인해 주세요."
    );
  }

  const ey = {
    x: axis.x / H,
    y: axis.y / H
  };

  const ex = {
    x: ey.y,
    y: -ey.x
  };

  const p = {};

  for (const [key] of POINTS) {
    const x = raw[key].x - raw.top.x;
    const y = raw[key].y - raw.top.y;

    p[key] = {
      x: x * ex.x + y * ex.y,
      y: x * ey.x + y * ey.y
    };
  }

  const W = p.cheekR.x - p.cheekL.x;

  const eL = mid(p.eyeLO, p.eyeLI);
  const eR = mid(p.eyeRI, p.eyeRO);

  const eyes = mid(eL, eR);
  const mouth = mid(p.mouthL, p.mouthR);

  const lw = dist(p.eyeLO, p.eyeLI);
  const rw = dist(p.eyeRI, p.eyeRO);

  const jw = dist(p.jawL, p.jawR);

  const validOrder =
    0 < eyes.y &&
    eyes.y < p.nose.y &&
    p.nose.y < mouth.y &&
    mouth.y < H;

  if (
    W < 20 ||
    lw < 3 ||
    rw < 3 ||
    p.eyeLI.x <= p.eyeLO.x ||
    p.eyeRO.x <= p.eyeRI.x ||
    p.noseR.x <= p.noseL.x ||
    p.mouthR.x <= p.mouthL.x ||
    p.jawR.x <= p.jawL.x ||
    !validOrder
  ) {
    throw new Error(
      "기준점 순서가 맞지 않습니다. 화면 기준 좌우와 이마→눈→코→입→턱 위치를 확인하세요."
    );
  }

  const values = [
    // FACE STRUCTURE
    W / H,
    eyes.y / H,
    (p.nose.y - eyes.y) / H,
    (H - p.nose.y) / H,

    // EYES
    dist(eL, eR) / W,

    (lw + rw) / 2 / W,

    (
      dist(p.eyeLU, p.eyeLD) / lw +
      dist(p.eyeRU, p.eyeRD) / rw
    ) / 2,

    (
      Math.atan2(
        p.eyeLI.y - p.eyeLO.y,
        p.eyeLI.x - p.eyeLO.x
      ) +
      Math.atan2(
        p.eyeRI.y - p.eyeRO.y,
        p.eyeRO.x - p.eyeRI.x
      )
    ) / 2,

    dist(p.eyeLI, p.eyeRI) / W,

    // NOSE
    dist(p.root, p.nose) / H,
    dist(p.noseL, p.noseR) / W,
    Math.abs(p.nose.x) / W,

    // MOUTH
    dist(p.mouthL, p.mouthR) / W,
    dist(p.lipU, p.lipD) / H,
    dist(p.nose, mouth) / H,
    Math.abs(mouth.x) / W,

    // FACE SHAPE
    jw / W,
    (H - mouth.y) / H,
    (H - mid(p.jawL, p.jawR).y) / H,
    (W - jw) / H,

    // BALANCE
    Math.abs(
      Math.abs(p.cheekL.x) -
      Math.abs(p.cheekR.x)
    ) / W,

    Math.abs(lw - rw) / W
  ];

  if (values.some((value) => !Number.isFinite(value))) {
    throw new Error(
      "기준점으로 측정할 수 없습니다. 위치를 다시 확인하세요."
    );
  }

  return values;
}

/* =========================
   얼굴 감지 모델 로드
========================= */

async function getModel() {
  if (!modelPromise) {
    modelPromise = (async () => {
      const root =
        "https://cdn.jsdelivr.net/npm/" +
        "@mediapipe/tasks-vision@0.10.22-rc.20250304";

      const {
        FilesetResolver,
        FaceLandmarker
      } = await import(`${root}/vision_bundle.mjs`);

      const files = await FilesetResolver.forVisionTasks(
        `${root}/wasm`
      );

      return FaceLandmarker.createFromOptions(files, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/" +
            "mediapipe-models/face_landmarker/" +
            "face_landmarker/float16/1/" +
            "face_landmarker.task",

          delegate: "CPU"
        },

        runningMode: "IMAGE",
        numFaces: 2
      });
    })().catch((error) => {
      modelPromise = null;
      throw error;
    });
  }

  return modelPromise;
}

/* =========================
   자동 얼굴 감지
========================= */

async function detect(side) {
  if (busy || !side.image) return;

  setBusy(true);

  side.ready = false;
  invalidate();

  side.note.textContent =
    "얼굴 모델을 준비하는 중… 처음에는 시간이 걸릴 수 있습니다.";

  try {
    let timer;

    const timeout = new Promise((_, reject) => {
      timer = setTimeout(() => {
        reject(
          new Error("모델 다운로드 시간이 초과되었습니다.")
        );
      }, 30000);
    });

    const model = await Promise.race([
      getModel(),
      timeout
    ]).finally(() => {
      clearTimeout(timer);
    });

    /*
      기준점 표시가 들어가지 않은 원본 사진으로 감지합니다.
    */
    const source = document.createElement("canvas");

    source.width = side.canvas.width;
    source.height = side.canvas.height;

    source.getContext("2d").drawImage(
      side.image,
      0,
      0,
      source.width,
      source.height
    );

    await new Promise((resolve) => {
      requestAnimationFrame(() => {
        setTimeout(resolve, 0);
      });
    });

    const result = model.detect(source);

    if (result.faceLandmarks.length !== 1) {
      throw new Error(
        result.faceLandmarks.length
          ? "얼굴이 여러 개입니다. 한 명만 나온 사진을 선택하거나 직접 지정하세요."
          : "얼굴을 찾지 못했습니다. 캐릭터는 직접 지정 기능을 이용해 주세요."
      );
    }

    const landmarks = result.faceLandmarks[0];

    side.points = Object.fromEntries(
      POINTS.map(([key, , id]) => {
        return [
          key,
          {
            x: landmarks[id].x * source.width,
            y: landmarks[id].y * source.height
          }
        ];
      })
    );

    side.mode = "자동 감지";

    edit(side);

    side.note.textContent =
      "자동 감지 완료. 점이 실제 부위에 맞는지 확인한 뒤 아래 확인 완료를 눌러 주세요.";
  } catch (error) {
    edit(side);

    side.note.textContent =
      `${error.message} 직접 지정으로 계속할 수 있습니다.`;
  } finally {
    setBusy(false);
    draw(side);
  }
}

/* =========================
   사진 카드 초기화 및 이벤트
========================= */

for (const name of ["character", "user"]) {
  const card = $(`[data-side="${name}"]`);

  const side = {
    card,
    canvas: card.querySelector("canvas"),
    select: card.querySelector("select"),
    editor: card.querySelector(".editor"),
    note: card.querySelector(".card-status"),

    points: {},
    image: null,

    ready: false,
    editing: false,

    mode: "직접 지정",

    cursor: {
      x: 0,
      y: 0
    },

    version: 0
  };

  sides.push(side);

  POINTS.forEach(([, label], index) => {
    side.select.add(
      new Option(
        `${index + 1}. ${label}`,
        String(index)
      )
    );
  });

  /* 사진 선택 */
  card.querySelector("input").addEventListener(
    "change",
    async (event) => {
      const file = event.target.files[0];

      if (!file) return;

      const version = ++side.version;

      side.ready = false;
      side.image = null;
      side.points = {};
      side.editing = false;

      side.editor.hidden = true;
      side.canvas.hidden = true;

      card.querySelector(".placeholder").hidden = false;

      invalidate();

      let url;

      try {
        const allowedTypes = [
          "image/jpeg",
          "image/png",
          "image/webp"
        ];

        if (
          !allowedTypes.includes(file.type) ||
          file.size > 15 * 1024 * 1024
        ) {
          throw new Error(
            "15MB 이하 JPG, PNG, WEBP 파일을 선택해 주세요."
          );
        }

        url = URL.createObjectURL(file);

        const image = new Image();
        image.src = url;

        await image.decode();

        if (version !== side.version) return;

        if (
          image.naturalWidth < 80 ||
          image.naturalHeight < 80 ||
          image.naturalWidth * image.naturalHeight > 40000000
        ) {
          throw new Error(
            "80px 이상, 4천만 화소 이하 사진을 선택해 주세요."
          );
        }

        const scale = Math.min(
          1,
          1000 / Math.max(
            image.naturalWidth,
            image.naturalHeight
          )
        );

        side.canvas.width = Math.round(
          image.naturalWidth * scale
        );

        side.canvas.height = Math.round(
          image.naturalHeight * scale
        );

        side.image = image;

        side.cursor = {
          x: side.canvas.width / 2,
          y: side.canvas.height / 2
        };

        side.canvas.hidden = false;

        card.querySelector(".placeholder").hidden = true;

        side.select.selectedIndex = 0;
        side.mode = "직접 지정";

        side.note.textContent =
          "사진 준비 완료. 자동 감지 또는 직접 지정을 선택하세요.";

        draw(side);
      } catch (error) {
        if (version === side.version) {
          side.note.textContent = error.message;
        }
      } finally {
        if (url) {
          URL.revokeObjectURL(url);
        }

        card.querySelectorAll(
          ".detect, .manual"
        ).forEach((button) => {
          button.disabled = busy || !side.image;
        });

        update();
      }
    }
  );

  /* 자동 감지 버튼 */
  card.querySelector(".detect").addEventListener(
    "click",
    () => detect(side)
  );

  /* 직접 지정 / 수정 버튼 */
  card.querySelector(".manual").addEventListener(
    "click",
    () => edit(side)
  );

  /* 기준점 목록 선택 */
  side.select.addEventListener("change", () => {
    const key = POINTS[side.select.selectedIndex][0];

    side.cursor = side.points[key] || {
      x: side.canvas.width / 2,
      y: side.canvas.height / 2
    };

    draw(side);
  });

  /* 마우스 / 터치로 기준점 지정 */
  side.canvas.addEventListener("pointerdown", (event) => {
    const rect = side.canvas.getBoundingClientRect();

    const x =
      (event.clientX - rect.left) /
      rect.width *
      side.canvas.width;

    const y =
      (event.clientY - rect.top) /
      rect.height *
      side.canvas.height;

    place(side, x, y);
  });

  /* 키보드로 기준점 지정 */
  side.canvas.addEventListener("keydown", (event) => {
    if (!side.editing || busy) return;

    const step = event.shiftKey ? 10 : 1;

    if (event.key === "Enter") {
      event.preventDefault();

      place(
        side,
        side.cursor.x,
        side.cursor.y
      );

      return;
    }

    const directions = {
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      ArrowUp: [0, -step],
      ArrowDown: [0, step]
    };

    const direction = directions[event.key];

    if (direction) {
      event.preventDefault();

      side.cursor = {
        x: Math.max(
          0,
          Math.min(
            side.canvas.width,
            side.cursor.x + direction[0]
          )
        ),

        y: Math.max(
          0,
          Math.min(
            side.canvas.height,
            side.cursor.y + direction[1]
          )
        )
      };

      draw(side);
    }
  });

  /* 기준점 확인 완료 */
  card.querySelector(".confirm").addEventListener(
    "click",
    () => {
      try {
        features(side.points);

        side.ready = true;
        side.editing = false;
        side.editor.hidden = true;

        side.note.textContent =
          `${side.mode} · 기준점 확인 완료`;

        draw(side);
        update();

        $("#status").textContent =
          sides.every((item) => item.ready)
            ? "두 사진이 준비되었습니다. 비교를 시작하세요."
            : "다른 사진도 기준점을 확인해 주세요.";
      } catch (error) {
        side.note.textContent = error.message;
      }
    }
  );
}

/* =========================
   점수 계산
========================= */

function compare(first, second) {
  const scores = METRICS.map((metric, index) => {
    const difference = first[index] - second[index];
    const tolerance = metric[2];

    return 100 * Math.exp(
      -Math.LN2 * (difference / tolerance) ** 2
    );
  });

  /*
    [파트 이름, 포함 그룹, 전체 점수 가중치]
    FACE STRUCTURE와 BALANCE는 하나로 묶습니다.
  */
  const definitions = [
    ["눈", [1], 0.25],
    ["코", [2], 0.15],
    ["입", [3], 0.15],
    ["얼굴 윤곽", [4], 0.20],
    ["구조·균형", [0, 5], 0.25]
  ];

  const parts = definitions.map(
    ([label, groups, weight]) => {
      const values = scores.filter((_, index) => {
        return groups.includes(METRICS[index][0]);
      });

      return {
        label,
        weight,
        score: mean(values)
      };
    }
  );

  const total = Math.round(
    parts.reduce((sum, part) => {
      return sum + part.score * part.weight;
    }, 0)
  );

  return {
    scores,
    parts,
    total
  };
}

/* =========================
   결과 화면 표시
========================= */

function render(first, second, result) {
  $("#totalScore").textContent = result.total;

  $(".score-circle").style.setProperty(
    "--score",
    result.total
  );

  $("#grade").textContent =
    result.total >= 95 ? "PERFECT SYNC" :
    result.total >= 85 ? "VERY HIGH" :
    result.total >= 70 ? "HIGH" :
    result.total >= 55 ? "MEDIUM" :
    "LOW";

  $("#method").textContent =
    `캐릭터: ${sides[0].mode} · ` +
    `내 사진: ${sides[1].mode} | 22개 2D 비율 비교`;

  /* 가장 닮은 / 차이가 가장 큰 특징 */
  const max = Math.max(...result.scores);
  const min = Math.min(...result.scores);

  function highlight(value, title) {
    const indexes = result.scores
      .map((score, index) => {
        return Math.abs(score - value) < 1e-9
          ? index
          : -1;
      })
      .filter((index) => index >= 0);

    const tieText = indexes.length > 1
      ? ` · 공동 ${indexes.length}개`
      : "";

    const moreText = indexes.length > 1
      ? ` 외 ${indexes.length - 1}개`
      : "";

    return `
      <article class="highlight">
        <p>${title}${tieText}</p>

        <strong>
          ${METRICS[indexes[0]][1]}${moreText}
          <span>${Math.round(value)}%</span>
        </strong>
      </article>
    `;
  }

  $("#highlights").innerHTML =
    highlight(max, "가장 닮은 특징") +
    highlight(min, "차이가 가장 큰 특징");

  /* 5개 파트 종합 */
  $("#parts").innerHTML = result.parts
    .map((part) => {
      return `
        <div class="part">
          ${part.label}
          <strong>${Math.round(part.score)}%</strong>
        </div>
      `;
    })
    .join("");

  /* 6개 그룹 및 22개 항목 */
  $("#details").innerHTML = GROUPS
    .map((group, groupIndex) => {
      const rows = METRICS
        .map((metric, index) => {
          if (metric[0] !== groupIndex) {
            return "";
          }

          const score = result.scores[index];

          return `
            <div class="metric-wrap">
              <details class="metric">
                <summary>
                  <span>${metric[1]}</span>
                  <strong>${Math.round(score)}%</strong>
                </summary>

                <p>
                  ${metric[3]}
                  <br>
                  캐릭터 ${first[index].toFixed(3)}
                  /
                  내 사진 ${second[index].toFixed(3)}
                  <br>
                  50점이 되는 차이: ${metric[2]}
                </p>
              </details>

              <div class="bar" aria-hidden="true">
                <i style="width: ${score}%"></i>
              </div>
            </div>
          `;
        })
        .join("");

      return `
        <section class="group">
          <h4>${group}</h4>
          ${rows}
        </section>
      `;
    })
    .join("");

  $("#result").hidden = false;
  $("#result").focus();

  $("#result").scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}

/* =========================
   분석 시작
========================= */

$("#analyzeButton").addEventListener("click", () => {
  if (
    busy ||
    !sides.every((side) => side.ready)
  ) {
    return;
  }

  try {
    const first = features(sides[0].points);
    const second = features(sides[1].points);

    const result = compare(first, second);

    render(first, second, result);

    $("#status").textContent =
      "분석 완료 · 기준점을 수정하면 다시 비교할 수 있습니다.";
  } catch (error) {
    $("#status").textContent = error.message;
  }
});

/* =========================
   사진 지우고 다시하기
========================= */

$("#resetButton").addEventListener("click", () => {
  sides.forEach((side) => {
    side.version++;

    side.image = null;
    side.points = {};

    side.ready = false;
    side.editing = false;

    side.canvas.hidden = true;
    side.editor.hidden = true;

    side.card.querySelector("input").value = "";

    side.card.querySelector(".placeholder").hidden = false;

    side.card.querySelectorAll("button").forEach((button) => {
      button.disabled = true;
    });

    side.note.textContent =
      "JPG · PNG · WEBP / 최대 15MB";
  });

  invalidate();

  $("#status").textContent =
    "두 사진을 선택해 주세요.";

  $("#characterInput").focus();

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
});
