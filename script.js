
let currentInput = [];
let historyStack = [];
let historyIndex = -1;

let currentEntry = null;
let currentAudio = null;

/* DISPLAY */

function updateDisplay() {

    let padded = ["0", "0", "0"];

    for(let i = 0; i < currentInput.length; i++) {

        padded[3 - currentInput.length + i] = currentInput[i];
    }

    document.getElementById("display").innerText =
        padded.join(" ");
}

/* INPUT */

function addDigit(digit) {

    if(currentInput.length >= 3) return;

    currentInput.push(digit);

    updateDisplay();
}

function backspace() {

    currentInput.pop();

    updateDisplay();
}

/* AUDIO */

async function updateAudioButton() {

    let audioBtn = document.getElementById("audio-btn");

    audioBtn.classList.remove("disabled");

    audioBtn.innerHTML = "▶";

    audioBtn.classList.remove("playing");

    try {

        let response =
            await fetch(`audio/${currentEntry}.mp3`, {
                method: "HEAD"
            });

        if(!response.ok) {

            throw new Error();
        }
    }

    catch {

        audioBtn.classList.add("disabled");
    }
}

function toggleAudio() {

    let audioBtn = document.getElementById("audio-btn");

    if(!currentEntry) return;

    if(currentAudio && !currentAudio.paused) {

        currentAudio.pause();

        audioBtn.innerHTML = "▶";

        audioBtn.classList.remove("playing");

        return;
    }

    currentAudio = new Audio(`audio/${currentEntry}.mp3`);

    currentAudio.play();

    audioBtn.innerHTML = "❚❚";

    audioBtn.classList.add("playing");

    currentAudio.onended = function() {

        audioBtn.innerHTML = "▶";

        audioBtn.classList.remove("playing");
    };
}

/* NAVIGATION */

function updateNavigationButtons() {

    let backBtn = document.getElementById("back-btn");

    let forwardBtn = document.getElementById("forward-btn");

    backBtn.disabled = historyIndex <= 0;

    forwardBtn.disabled =
        historyIndex >= historyStack.length - 1;
}

function goBack() {

    if(historyIndex <= 0) return;

    historyIndex--;

    openEntry(historyStack[historyIndex], false);
}

function goForward() {

    if(historyIndex >= historyStack.length - 1) return;

    historyIndex++;

    openEntry(historyStack[historyIndex], false);
}

/* POPUP */

function closePopup() {

    if(currentAudio) {

        currentAudio.pause();

        currentAudio.currentTime = 0;
    }

    let audioBtn = document.getElementById("audio-btn");

    audioBtn.innerHTML = "▶";

    audioBtn.classList.remove("playing");

    document.body.classList.remove("popup-open");

    let overlay = document.getElementById("overlay");

    let popup = document.getElementById("story-popup");

    overlay.classList.remove("show");

    popup.classList.remove("show");

    setTimeout(() => {

        overlay.style.display = "none";

        popup.style.display = "none";

        document.querySelector(".popup-navigation").style.display = "none";

    }, 280);
}

function showUnavailableMessage(number) {

    alert(`${number} ist aktuell nicht verfügbar.`);
}

function loadStory() {

    let padded = currentInput.join("").padStart(3, '0');

    openEntry(padded);
}

/* OPEN ENTRY */

async function openEntry(number, addToHistory = true) {

    currentEntry = number;

    let popup = document.getElementById("story-popup");

    let popupContent = document.getElementById("popup-content");

    let overlay = document.getElementById("overlay");

    try {

        let response = await fetch(`entries/${number}.html`);

        if(!response.ok) {

            showUnavailableMessage(number);

            return;
        }

        let html = await response.text();

        document.body.classList.add("popup-open");

        overlay.style.display = "block";

        popup.style.display = "block";

        document.querySelector(".popup-navigation").style.display = "flex";

        popup.scrollTop = 0;

        setTimeout(() => {

            overlay.classList.add("show");

            popup.classList.add("show");

        }, 10);

        if(addToHistory) {

            historyStack =
                historyStack.slice(0, historyIndex + 1);

            historyStack.push(number);

            historyIndex++;
        }

        updateNavigationButtons();

        popupContent.innerHTML = html;

        updateAudioButton();
    }

    catch(error) {

        showUnavailableMessage(number);
    }
}

updateDisplay();

updateNavigationButtons();
