//TO-DO
// * Spaces should be registered as correct or incorrect
// * aposthrophe (') is not being registered 
// * Add longer texts
// Yarın quote'arı json'a atıp oradan çekmeyi yapcam.
// * Çizgi metin imleci eklenmeli ki kullanıcı nerede kaldığını görebilsin.
// * Ayrıca kelimeler bölünmemeli
// * localStorage ile en son kullanılan süre ayarı kaydedilsin ve hep onda başlasın
// * Test başlayınca saniye buttonları hoverable olmasın
// * Kaç harf yazıldığı tespit ediliyor ama kaç kelime yazıldığı edilmiyor, onu test et. WPM mantığı
// * Sayı tuşları, nokta, virgül, çift tırnak vb işaretler oyunu başlatıyor ama saniye sayacı gözükmüyor





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

//const letterRegex = /^[a-zA-ZçğıöşüÇĞİÖŞÜ ]$/;
//const letterRegex = /^[a-zA-ZçğıöşüÇĞİÖŞÜ0-9 .,;:!?()""'\-]+$/;
//const letterRegex = /^[a-zA-ZçğıöşüÇĞİÖŞÜ0-9\s.,;:!?()""'\-+]$/;
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

async function getText(){
    try {
        
        const url = `/texts/english.json`;
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
        selectedText =  await getText();
    } else {
        selectedText =  "Yay! Other types can be selected!"
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

        if (typedChar === targetChar) {
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

        const incorrectAmount = document.getElementsByClassName("incorrect").length;
        const correctAmount = document.getElementsByClassName("correct").length;
        const totalAmount = letters.length;

        percentage = Math.round((correctAmount * 100) / totalAmount);
        scoreboard.innerHTML = `<p id="scoreboard">${correctAmount}/${totalAmount} (${percentage}%) Correct</p>`;

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
            //buttonBox.style.pointerEvents = "none";
            //buttonBox.style.opacity = "0.6";
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

    if (letterRegex.test(event.key)){
        timer.innerText = `${timeLeft} seconds left!`;
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
        
            } else {
                
                
                timeLeft--;
                timer.innerText = `${timeLeft} seconds left!`
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
            //buttonBox.style.pointerEvents = "none";
            //buttonBox.style.opacity = "0.6";
        }   else { 
            textTypeButtons.forEach((btn) => btn.classList.remove("active"));
            button.classList.add("active");
            selectedTextType = button.textContent;
            console.log(`Selected text type is ${selectedTextType}`);
            loadText(selectedTextType);
            

            
            

        }
    });

    
});







