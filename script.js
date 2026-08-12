//TO-DO
// * Spaces should be registered as correct or incorrect
// * Çizgi metin imleci eklenmeli ki kullanıcı nerede kaldığını görebilsin.
// * localStorage ile en son kullanılan süre ayarı kaydedilsin ve hep onda başlasın
// * Pop-over ile metin üstüne scoreboard bas.

const textContainer = document.getElementById("text-container");
const hiddenTextInput = document.getElementById("hidden-text-input");
const endText = document.getElementById("end-text");
const restartButton = document.getElementById("restart-button");
const scoreboard = document.getElementById("scoreboard");
const timer = document.getElementById("timer");
const timeButtons = document.querySelectorAll(".time-buttons");
const textTypeButtons = document.querySelectorAll(".text-type-buttons");
const finishTimeText = document.getElementById("finish-time-text");
const startTypingText = document.getElementById("start-typing-text");
const congrats = document.getElementById("congrats");
const textTypeSelectBox = document.querySelector(".text-type-select-box");
const timeSelectBox = document.querySelector(".time-select-box");
const netWpmText = document.getElementById("net-wpm-text");
const rawWpmText = document.getElementById("raw-wpm-text");

const letterRegex = /^[\p{L}\p{N}\p{P}\p{S}\s]$/u;

let pressCount = 0;
let finishTime;
let selectedTime = 30;
let selectedTextType = "Quotes";
let timeLeft = selectedTime;
let countdown;
let elapsedTime = 0;
let percentage = 0;

let letters = [];
let currentIndex = 0;

async function getQuotesText(){
    try {
        
        const url = `/texts/quotes/english.json`;
        const response = await fetch(url);
        const textData = await response.json();

        const textArray = textData.quotes;

        const randomTextIndex = Math.floor(Math.random() * textArray.length);
        const loadedText = textArray[randomTextIndex].text;
        const loadedTextSource = textArray[randomTextIndex].source;
        const loadedTextLength = textArray[randomTextIndex].length;
        const loadedTextID = textArray[randomTextIndex].id;

        console.log(`Loaded Text is: ${loadedText}`);
        console.log(`Source: ${loadedTextSource}, Length: ${loadedTextLength}, ID: ${loadedTextID}`);

        return loadedText;

    } catch (error) {
        console.error(error);
    }
}


async function getRandomWordsText(){
    try {
        const url = `/texts/words/english_1k.json`;
        const response = await fetch(url);
        const textData = await response.json();
        const selectedWordsArray = [];
        let selectedRandomWord;

        const textArray = textData.words;

        for (let i = 0; i < 30; i++) {
            const randomTextIndex = Math.floor(Math.random() * textArray.length);
            selectedRandomWord = textArray[randomTextIndex];

            selectedWordsArray.push(selectedRandomWord);
            console.log(`Selected Random Word is: ${selectedRandomWord}`);
        }

        return selectedWordsArray.join(" ").trim();

    } catch (error) {
        console.error(error);
    }
}


function renderWords(text){
    const wordsArray = text.split(' ');

    textContainer.innerHTML = wordsArray.map((word, index) => {
        let lettersSplitted = word.split('').map(letter => { 
            return `<span class="letter">${letter}</span>`;
    }).join("");

    if (index < wordsArray.length - 1) {
        lettersSplitted += `<span class="letter">&nbsp;</span>`;
    }

    return `<div class="word">${lettersSplitted}</div>`;
    }).join("");

    letters = document.querySelectorAll(".letter");
}

async function loadText(textType){

    let selectedText;

    if (textType === "Quotes") {
        selectedText =  await getQuotesText();

    } else if (textType === "Random Words") {
        selectedText =  await getRandomWordsText();

    } else {
        selectedText =  await getQuotesText();
    }
    
    
    console.log(`Selected Text is ${selectedText}`);

    renderWords(selectedText);
}

//eski kod bitiş

window.addEventListener("load", () => {
    hiddenTextInput.focus();
    loadText(selectedTextType); 
});

document.addEventListener("click", () => {
    hiddenTextInput.focus();
});

textContainer.addEventListener("click", () => {
    hiddenTextInput.focus();
})

hiddenTextInput.addEventListener("input", (event) => {
    if (hiddenTextInput.readOnly) {
        return;
    }
    
    startTypingText.style.display = "none";
    const inputValue = hiddenTextInput.value;
    const currentLetterSpan = letters[currentIndex];
    
    if (inputValue.length > currentIndex) {
    const typedChar = inputValue[currentIndex];
    const targetChar = currentLetterSpan.innerText;

        if (typedChar === targetChar || (typedChar === " " && targetChar === "\u00A0")) {
            currentLetterSpan.classList.add("correct");
        } else {
            currentLetterSpan.classList.add("incorrect");
        }

    currentIndex++;

    if (letters.length === currentIndex){

        clearInterval(countdown);

        elapsedTime = selectedTime - timeLeft;

        hiddenTextInput.readOnly = true; 

        //buttonBox.style.pointerEvents = "none";

        textContainer.style.filter = "blur(3px)";
        endText.innerText = "You have completed the test."
        finishTimeText.innerText = `Completed in ${elapsedTime} seconds.`;
        timer.style.display = "none";
        congrats.innerText = "Congratulations! You have completed the test in time!"
        confetti({ count: 500, position: { x: window.innerWidth / 2, y: window.innerHeight / 2 } });

        const incorrectAmount = document.getElementsByClassName("incorrect").length;
        const correctAmount = document.getElementsByClassName("correct").length;
        const totalAmount = letters.length;
        const netWpm = Math.round((((totalAmount / 5) - (incorrectAmount / 5)) * 60) / selectedTime);
        const rawWpm = Math.round((totalAmount / 5) * (60/selectedTime));

        percentage = Math.round((correctAmount * 100) / totalAmount);
        scoreboard.innerHTML = `<p id="scoreboard">${correctAmount}/${totalAmount} (${percentage}%) Correct</p>`;
        netWpmText.innerText = `Net Words per Minute (WPM): ${netWpm} [Incorrect words are not included]`;
        rawWpmText.innerText = `Raw Words per Minute (WPM): ${rawWpm} [All keystrokes are calculated]`;

        hiddenTextInput.readOnly = true;
    } 

    }
})

hiddenTextInput.addEventListener("keydown", (event) => {
    if (event.key === "Backspace"){

        if (timeLeft < 0 || currentIndex === letters.length || hiddenTextInput.readOnly) {
            event.preventDefault();
            return;
        }

        if ((currentIndex > 0) && (letters[currentIndex -1].classList.contains("incorrect")) ) {
            currentIndex--;

            const previousLetterSpan = letters[currentIndex];
            previousLetterSpan.classList.remove("correct", "incorrect");
        } else {
            event.preventDefault();
        }
    }
})

restartButton.addEventListener("click", () => {
    location.reload();
});

timeButtons.forEach((button) => {
    
    button.addEventListener("click", () => {
        
        if (pressCount > 0 || hiddenTextInput.readOnly){
            return;

        }   else { 
            timeButtons.forEach((btn) => btn.classList.remove("active"));
            button.classList.add("active");
            selectedTime = parseInt(button.textContent, 10);
            console.log(`Selected time is ${selectedTime}`);
            timeLeft = selectedTime;
        }
    });
});

console.log(`Time left is ${timeLeft}`);

hiddenTextInput.addEventListener("keydown", (event) => {

    
    
    if (hiddenTextInput.readOnly) {
        event.preventDefault(); 
        return; 
    }

    if (event.key.length !== 1) {
        return;
    }

    if (event.key === " " || letterRegex.test(event.key)){
        textTypeSelectBox.style.pointerEvents = 'none';
        timeSelectBox.style.pointerEvents = 'none';
        timer.style.color = "#e2b714";
        timer.style.fontWeight = "bold";
        timer.style.fontSize = "30px";
        timer.innerText = `${timeLeft}`;
        if (pressCount === 0){
            pressCount++;
            

            countdown = setInterval( () => {
            if (timeLeft <= 0) {
                clearInterval(countdown);
                timer.innerText = "Time is up!";

                const incorrectAmount = document.getElementsByClassName("incorrect").length;
                const correctAmount = document.getElementsByClassName("correct").length;
                const totalAmount = letters.length;
                percentage = Math.round((correctAmount * 100) / totalAmount);
                scoreboard.innerHTML = `<p id="scoreboard">${correctAmount}/${totalAmount} (${percentage}%) Correct</p>`;
                
                hiddenTextInput.readOnly = true;
                textContainer.style.filter = "blur(3px)";
        
                const netWpm = (Math.round((((totalAmount / 5) - (incorrectAmount / 5)) * 60) / selectedTime * 100))/100;
                const rawWpm = Math.round((totalAmount / 5) * (60/selectedTime));

                scoreboard.innerHTML = `<p id="scoreboard">${correctAmount}/${totalAmount} (${percentage}%) Correct</p>`;
                netWpmText.innerText = `Net Words per Minute (WPM): ${netWpm} [Incorrect words are not included]`;
                rawWpmText.innerText = `Raw Words per Minute (WPM): ${rawWpm} [All keystrokes are calculated]`;
                // Bu kısmı "pop-over'lar" ile yap.

            } else {
                timeLeft--;
                timer.innerText = `${timeLeft}`
            }

        }, 1000);

        } 

    } else {
        event.preventDefault();
    }
})

textTypeButtons.forEach((button) => {
    button.addEventListener("click", () => {
        if (pressCount > 0 || hiddenTextInput.readOnly){
            return;

        } else { 
            textTypeButtons.forEach((btn) => btn.classList.remove("active"));
            button.classList.add("active");
            selectedTextType = button.textContent;
            console.log(`Selected text type is ${selectedTextType}`);
            loadText(selectedTextType); 
        }
    });
});