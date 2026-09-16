const characterInput =
    document.getElementById("characterInput");

const userInput =
    document.getElementById("userInput");

const characterPreview =
    document.getElementById("characterPreview");

const userPreview =
    document.getElementById("userPreview");

const analyzeButton =
    document.getElementById("analyzeButton");

const resetButton =
    document.getElementById("resetButton");


let characterLoaded = false;
let userLoaded = false;


/* =========================
   이미지 미리보기
========================= */

function previewImage(
    input,
    preview,
    message,
    type
) {

    const file = input.files[0];

    if (!file) return;


    const reader =
        new FileReader();


    reader.onload =
        function(event) {

            preview.src =
                event.target.result;

            preview.style.display =
                "block";

            document
                .getElementById(message)
                .style.display =
                "none";


            if (type === "character") {

                characterLoaded = true;

            } else {

                userLoaded = true;

            }

        };


    reader.readAsDataURL(file);
}


/* 이미지 선택 이벤트 */

characterInput.addEventListener(
    "change",
    function() {

        previewImage(
            characterInput,
            characterPreview,
            "characterMessage",
            "character"
        );

    }
);


userInput.addEventListener(
    "change",
    function() {

        previewImage(
            userInput,
            userPreview,
            "userMessage",
            "user"
        );

    }
);


/* =========================
   이미지 특징 추출
========================= */

function getImageFeatures(
    image,
    canvas
) {

    const ctx =
        canvas.getContext(
            "2d",
            {
                willReadFrequently: true
            }
        );


    const size = 64;

    canvas.width = size;
    canvas.height = size;


    /* 이미지를 정사각형으로 자르기 */

    const imageRatio =
        image.naturalWidth /
        image.naturalHeight;


    let sourceX = 0;
    let sourceY = 0;

    let sourceWidth =
        image.naturalWidth;

    let sourceHeight =
        image.naturalHeight;


    if (imageRatio > 1) {

        sourceWidth =
            image.naturalHeight;

        sourceX =
            (
                image.naturalWidth -
                sourceWidth
            ) / 2;

    } else {

        sourceHeight =
            image.naturalWidth;

        sourceY =
            (
                image.naturalHeight -
                sourceHeight
            ) / 2;

    }


    ctx.clearRect(
        0,
        0,
        size,
        size
    );


    ctx.drawImage(
        image,

        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,

        0,
        0,
        size,
        size
    );


    const imageData =
        ctx.getImageData(
            0,
            0,
            size,
            size
        );


    const data =
        imageData.data;


    let red = 0;
    let green = 0;
    let blue = 0;

    let brightness = 0;

    const brightnessMap = [];


    for (
        let i = 0;
        i < data.length;
        i += 4
    ) {

        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];


        red += r;
        green += g;
        blue += b;


        const pixelBrightness =
            (
                r +
                g +
                b
            ) / 3;


        brightness +=
            pixelBrightness;


        brightnessMap.push(
            pixelBrightness
        );

    }


    const pixelCount =
        data.length / 4;


    red /= pixelCount;
    green /= pixelCount;
    blue /= pixelCount;

    brightness /=
        pixelCount;


    /* 형태/윤곽 특징 계산 */

    let edgeAmount = 0;


    for (
        let y = 0;
        y < size - 1;
        y++
    ) {

        for (
            let x = 0;
            x < size - 1;
            x++
        ) {

            const index =
                y * size + x;


            const current =
                brightnessMap[index];

            const right =
                brightnessMap[
                    index + 1
                ];

            const bottom =
                brightnessMap[
                    index + size
                ];


            edgeAmount +=
                Math.abs(
                    current - right
                );

            edgeAmount +=
                Math.abs(
                    current - bottom
                );

        }

    }


    edgeAmount /=
        (
            size *
            size *
            2
        );


    return {

        red,
        green,
        blue,
        brightness,
        edgeAmount

    };

}


/* =========================
   점수 계산
========================= */

function clampScore(value) {

    return Math.max(
        0,
        Math.min(
            100,
            value
        )
    );

}


function calculateSimilarity(
    first,
    second
) {

    /* 색상 차이 */

    const colorDifference =
        (
            Math.abs(
                first.red -
                second.red
            )
            +
            Math.abs(
                first.green -
                second.green
            )
            +
            Math.abs(
                first.blue -
                second.blue
            )
        ) / 3;


    const colorScore =
        clampScore(
            100 -
            colorDifference / 2
        );


    /* 밝기 차이 */

    const brightnessDifference =
        Math.abs(
            first.brightness -
            second.brightness
        );


    const brightnessScore =
        clampScore(
            100 -
            brightnessDifference / 1.5
        );


    /* 윤곽/형태 차이 */

    const edgeDifference =
        Math.abs(
            first.edgeAmount -
            second.edgeAmount
        );


    const shapeScore =
        clampScore(
            100 -
            edgeDifference * 3
        );


    /*
       최종 점수

       색상 30%
       밝기 20%
       형태 50%
    */

    const total =
        colorScore * 0.30
        +
        brightnessScore * 0.20
        +
        shapeScore * 0.50;


    return {

        color:
            Math.round(colorScore),

        brightness:
            Math.round(
                brightnessScore
            ),

        shape:
            Math.round(shapeScore),

        total:
            Math.round(total)

    };

}


/* =========================
   분석 시작
========================= */

async function analyzeImages() {

    if (
        !characterLoaded ||
        !userLoaded
    ) {

        alert(
            "캐릭터 이미지와 내 이미지를 모두 선택해주세요!"
        );

        return;

    }


    const loading =
        document.getElementById(
            "loading"
        );

    const result =
        document.getElementById(
            "result"
        );


    result.classList.add(
        "hidden"
    );

    loading.classList.remove(
        "hidden"
    );


    const progress =
        document.getElementById(
            "loadingProgress"
        );

    const loadingText =
        document.getElementById(
            "loadingText"
        );


    progress.style.width =
        "25%";

    loadingText.textContent =
        "이미지를 불러오는 중...";


    await wait(500);


    progress.style.width =
        "50%";

    loadingText.textContent =
        "색상과 밝기를 분석하는 중...";


    await wait(500);


    const canvas1 =
        document.getElementById(
            "canvas1"
        );

    const canvas2 =
        document.getElementById(
            "canvas2"
        );


    const features1 =
        getImageFeatures(
            characterPreview,
            canvas1
        );

    const features2 =
        getImageFeatures(
            userPreview,
            canvas2
        );


    progress.style.width =
        "75%";

    loadingText.textContent =
        "이미지 형태를 비교하는 중...";


    await wait(500);


    const scores =
        calculateSimilarity(
            features1,
            features2
        );


    progress.style.width =
        "100%";

    loadingText.textContent =
        "싱크로율 계산 완료!";


    await wait(500);


    loading.classList.add(
        "hidden"
    );


    showResult(scores);

}


/* =========================
   결과 출력
========================= */

function showResult(scores) {

    const result =
        document.getElementById(
            "result"
        );


    result.classList.remove(
        "hidden"
    );


    animateNumber(
        "score",
        scores.total
    );


    document.getElementById(
        "colorScore"
    ).textContent =
        scores.color + "%";


    document.getElementById(
        "brightnessScore"
    ).textContent =
        scores.brightness + "%";


    document.getElementById(
        "shapeScore"
    ).textContent =
        scores.shape + "%";


    setTimeout(
        function() {

            document.getElementById(
                "colorBar"
            ).style.width =
                scores.color + "%";


            document.getElementById(
                "brightnessBar"
            ).style.width =
                scores.brightness + "%";


            document.getElementById(
                "shapeBar"
            ).style.width =
                scores.shape + "%";

        },
        100
    );


    const title =
        document.getElementById(
            "resultTitle"
        );

    const description =
        document.getElementById(
            "resultDescription"
        );


    if (scores.total >= 90) {

        title.textContent =
            "놀라운 싱크로율!";

        description.textContent =
            "두 이미지의 시각적 특징이 매우 비슷하게 나타났습니다.";

    }

    else if (
        scores.total >= 75
    ) {

        title.textContent =
            "상당히 닮았어요!";

        description.textContent =
            "색상과 형태에서 여러 비슷한 특징이 발견되었습니다.";

    }

    else if (
        scores.total >= 55
    ) {

        title.textContent =
            "어딘가 닮은 느낌?";

        description.textContent =
            "일부 시각적 특징에서 유사한 부분이 발견되었습니다.";

    }

    else {

        title.textContent =
            "서로 다른 매력이네요!";

        description.textContent =
            "두 이미지의 시각적 특징에는 비교적 큰 차이가 있습니다.";

    }


    result.scrollIntoView({
        behavior: "smooth"
    });

}


/* 숫자 올라가는 효과 */

function animateNumber(
    elementId,
    target
) {

    const element =
        document.getElementById(
            elementId
        );


    let current = 0;


    const timer =
        setInterval(
            function() {

                current++;

                element.textContent =
                    current;


                if (
                    current >= target
                ) {

                    clearInterval(
                        timer
                    );

                }

            },
            15
        );

}


/* 잠시 기다리는 함수 */

function wait(ms) {

    return new Promise(
        resolve =>
            setTimeout(
                resolve,
                ms
            )
    );

}


/* =========================
   초기화
========================= */

function resetApp() {

    characterInput.value = "";
    userInput.value = "";


    characterPreview.src = "";
    userPreview.src = "";


    characterPreview.style.display =
        "none";

    userPreview.style.display =
        "none";


    document.getElementById(
        "characterMessage"
    ).style.display =
        "block";

    document.getElementById(
        "userMessage"
    ).style.display =
        "block";


    document.getElementById(
        "result"
    ).classList.add(
        "hidden"
    );


    document.getElementById(
        "colorBar"
    ).style.width =
        "0";

    document.getElementById(
        "brightnessBar"
    ).style.width =
        "0";

    document.getElementById(
        "shapeBar"
    ).style.width =
        "0";


    characterLoaded = false;
    userLoaded = false;


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/* 버튼 이벤트 */

analyzeButton.addEventListener(
    "click",
    analyzeImages
);


resetButton.addEventListener(
    "click",
    resetApp
);
