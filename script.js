async function randomWord() { // Returns a randomly chosen word.
  const WORDS = await getWordsFromFile();
  // Chooses a random word from the list above.
  let chosenWord = WORDS[Math.floor(Math.random() * WORDS.length)];
  chosenWord = chosenWord.toUpperCase();
  return {chosenWord}; 
}

let chosenWord = (async () => {
  let wordChosen = await randomWord();
  return wordChosen
})();

async function getWordsFromFile() {
  let WORDS = await fetch('./words.json');
  WORDS = await WORDS.json();
  return WORDS
}

function checkWordValid(word, chosenWord) {

  if (word.length < 4) {
    displayError('Not Enough Letters')
    return 'invalid'
  } else if (chosenWord.indexOf(word.toLowerCase()) == -1){
    displayError('Not In Word List')
    return 'invalid'
  } 
}

async function verifyLetter(chosenWord) {
  
  let word = getWordFromGameboard();

  chosenWord = await chosenWord

  chosenWord = chosenWord.chosenWord

  const WORDS = await getWordsFromFile()

  const validityResult = checkWordValid(word, WORDS)

  if (validityResult == 'invalid') {
    return;
  }

  let activeLetters = document.querySelector('.gameboard-word.active').children;
 
  activeLetters = [...activeLetters]

  let wordGuess = '';

  activeLetters.forEach(letter => {

    if (chosenWord.indexOf(letter.value) >= 0) {

      wordGuess += letter.value

      if (activeLetters.indexOf(letter) == chosenWord.indexOf(letter.value)) {

        letter.classList.add('green-block')
        document.querySelector(`[data-keyValue = "${letter.value.charCodeAt(0)}"]`).classList.add('green-key');

      } else {
        letter.classList.add('yellow-block')
        document.querySelector(`[data-keyValue = "${letter.value.charCodeAt(0)}"]`).classList.add('yellow-key');

      }

    } else {
      letter.classList.add('grey-block')
      document.querySelector(`[data-keyValue = "${letter.value.charCodeAt(0)}"]`).classList.add('grey-key');

    }

  })

  checkWin(chosenWord, wordGuess)
}

function checkWin(chosenWord, wordGuess) { //Takes the chosen word and the row number of which row the word inserted by the user is currently on and verfies if the word is correct.
  
  let gameRow = document.querySelector('.gameboard-word.active'); //Gets the active row
  
  let nextGameRow = gameRow.nextSibling.nextSibling;  // Gets the next row
  
  if (nextGameRow) {
    gameRow.classList.remove('active') // Removes the attribute marking the row as active
    nextGameRow.classList.add('active')    // Assigns the next row as active

    let activeLetter = document.querySelector('.gameboard-word-letter.active');
    activeLetter.classList.remove('active');

    nextGameRow.firstChild.nextSibling.classList.add('active');

  } else if (nextGameRow == undefined) {
    resetStreak()
    addPlay()
    addWinPerc()
    setStreakMax()
    displayStats()
    displayError('You Lost')

    displayWin()
  }


  if (wordGuess == chosenWord) { // The function will return True of the word entered by the user matches the chosen word.
    addPlay();
    addWin()
    addWinPerc();
    addStreak();
    setStreakMax();
    displayStats();
    displayWin();
  }

}

function resetGame() {
  document.querySelectorAll('.gameboard-word-letter').forEach(letter => {
    letter.value = "";
    letter.classList.remove('grey-block')
    letter.classList.remove('yellow-block')
    letter.classList.remove('green-block')

    document.getElementById('stat-win-wrapper').classList.remove('active');

    document.querySelector('.gameboard-word-letter').classList.add('active')
    document.querySelector('.gameboard-word').classList.add('active');

    document.querySelectorAll('.keyboard-key').forEach(key => {
      key.addEventListener('click', (e) => {getInputGraphicKeyboard(e)})
    })
    
    window.addEventListener('keydown', getInputKeyboard);

    document.querySelectorAll('.keyboard-key').forEach(key => {
      key.classList.remove('green-key');
      key.classList.remove('yellow-key');
      key.classList.remove('grey-key');
    })

    chosenWord = (async () => {
      let wordChosen = await randomWord();
      return wordChosen
    })();
  });
}

function displayWin() {
  document.getElementById('stat-win-wrapper').classList.add('active');
  
  document.querySelectorAll('.keyboard-key').forEach(key => {
    key.removeEventListener('click', (e) => {getInputGraphicKeyboard(e)})
  })
  
  window.removeEventListener('keydown', getInputKeyboard);
}

function getWordFromGameboard() {
  let wordHTML = document.querySelector('.gameboard-word.active').childNodes; // This variable contains all the child nodes (letters) of the row specified

  let word = [];  // This variable will hold the word inserted by the user after being extracted from the DOM
  
  wordHTML.forEach(letter => {  // This .forEach will go through each child nodes (.gameboard-word-letter) of the row (.gameboard-word) and add it to the word variable
    if (letter.nodeName == "INPUT") { 
      word.push(letter.value)
    }
  })

  word = word.join('')
  
  return word;
}

function backspaceLogic() {

  let activeLetter = document.querySelector('.gameboard-word-letter.active');

  if (activeLetter.value) {

    activeLetter.value = "";
  
  } else if (activeLetter.previousElementSibling) {

    activeLetter.previousElementSibling.value = "";
    activeLetter.previousElementSibling.classList.add('active');
    activeLetter.classList.remove('active'); 

  }

}

function DisplaysInputKeyboard(ek) {
  
  let itemActive = document.querySelector('.gameboard-word-letter.active');

  if (document.querySelector('.gameboard-word-letter.active').value) {
    return;
  }

  itemActive.value = (String.fromCharCode(ek)).toUpperCase();

  if (itemActive.nextElementSibling) {
    itemActive.nextElementSibling.classList.add('active');
    itemActive.classList.remove('active')
  }
}

function getInputKeyboard(e) {
  if(e.code == 'Enter'){
    verifyLetter(chosenWord)
  } else if ( e.code == "Backspace") {
    backspaceLogic()
  } else if (e.keyCode >= 65 && e.keyCode <= 90) {
    DisplaysInputKeyboard(e.keyCode)
  } else if (e.keyCode >= 97 && e.keyCode <= 122) {
    DisplaysInputKeyboard(e.keyCode)
  }
}

function getInputGraphicKeyboard(e) {
  const code = parseInt(e.target.getAttribute('data-keyValue'))
  if(code == 13){
    verifyLetter(chosenWord)
  } else if ( code == 8) {
    backspaceLogic()
  } else if (code >= 65 && code <= 90) {
    DisplaysInputKeyboard(code)
  } else if (code>= 97 && code <= 122) {
    DisplaysInputKeyboard(code)
  }
}

// --------------------------------------------- Local Storage Functions ------------------------------------------------------

function setStatLocal() {
  if (localStorage.getItem('wins') == undefined) {
    localStorage.setItem('wins', '0')
  }else if (localStorage.getItem('winPerc') == undefined) {
    localStorage.setItem('winPerc', '0%')
  }else if (localStorage.getItem('streak') == undefined) {
    localStorage.setItem('streak', '0')
  }else if (localStorage.getItem('played') == undefined) {
    localStorage.setItem('played', '0')
  }else if (localStorage.getItem('streakMax') == undefined) {
    localStorage.setItem('streakMax', '0')
  }
}

function addWin() {
  if (localStorage.getItem('wins') == undefined) {
    localStorage.setItem('wins', '0')
  }else {
    localStorage.setItem('wins', parseInt(localStorage.getItem('wins'))+1)
  }
} 

function addPlay() {
  if (localStorage.getItem('played') == undefined) {
    localStorage.setItem('played', '0')
  }else {
    localStorage.setItem('played', parseInt(localStorage.getItem('played'))+1)
  } 
}

function addWinPerc() {
  let gamesPlayed = parseInt(localStorage.getItem('played'));
  let wins = parseInt(localStorage.getItem('wins'));

  let winPerc = ((wins / gamesPlayed) * 100).toFixed(1);

  localStorage.setItem('winsPerc', winPerc);
}

function addStreak() {
  if (localStorage.getItem('streak') == undefined) {
    localStorage.setItem('streak', '0')
  }else {
    localStorage.setItem('streak', parseInt(localStorage.getItem('streak'))+1)
  } 
}

function resetStreak() {
  localStorage.setItem('streak', '0');
}

function setStreakMax() {
  
  if (localStorage.getItem('streakMax') == undefined) {
    localStorage.setItem('streakMax', '0')   
  } else if (localStorage.getItem('streakMax') < localStorage.getItem('streak')){
    localStorage.setItem('streakMax', localStorage.getItem('streak'));
  }

}

function displayStats() {
  let playedNumDOM = document.querySelectorAll(".stat-played-num");
  let winPercNumDOM = document.querySelectorAll(".stat-win-num");
  let streakNumDOM = document.querySelectorAll(".stat-streak-num");
  let streakMaxNumDOM = document.querySelectorAll(".stat-max-num"); 

  // FIX THE MAX STAT

  playedNumDOM.forEach(stat => {
    stat.textContent = localStorage.getItem('played');
  })
  winPercNumDOM.forEach(stat => {
    stat.textContent = localStorage.getItem('winsPerc');
  })
  streakNumDOM.forEach(stat => {
    stat.textContent = localStorage.getItem('streak');
  })
  streakMaxNumDOM.forEach(stat => {
    stat.textContent = localStorage.getItem('streakMax');
  })
}

// -------------------------------------------------- DOM functions -----------------------------------------------------------

function toggleMenu() {
  // Displays the menu
  document.getElementById("menu-section").classList.add("active");
}

function toggleHelp() {
  // Displays the help page
  document.querySelector(".help-wrapper").classList.add("active");
}

function hidePage(el) {
  // Hides the menu/help page
  el.target.parentElement.parentElement.classList.remove("active");
}

function toggleDarkMode(el) {
  if (el.target.checked) {
    // main body
    document.querySelector("body").style.backgroundColor = "black";

    // Header Section
    document.getElementById("main-header").style.color = "white";
    document.getElementById("main-header").style.borderBottom =
      "1px solid white";
    document.getElementById("main-header-help").style.border =
      "2px solid white";
    document.querySelectorAll(".bar").forEach((bar) => {
      bar.style.backgroundColor = "white";
    });

    // gameboard section
    document.querySelectorAll(".gameboard-word-letter").forEach((letter) => {
      letter.style.border = "3px solid rgb(101, 101, 101)";
    });
    document.querySelectorAll(".gameboard-word-letter").forEach((letter) => {
      letter.style.color = "white";
    });
    document.querySelectorAll(".gameboard-word-letter").forEach((letter) => {
      letter.style.backgroundColor = "black";
    });

    // Keyboard Section
    document.querySelectorAll(".keyboard-key").forEach((key) => {
      key.style.color = "white";
    });
    document.querySelectorAll(".keyboard-key").forEach((key) => {
      key.style.backgroundColor = "rgb(88, 88, 88)";
    });

    // Menu and settings
    document.querySelectorAll(".alt-page").forEach((page) => {
      page.style.color = "white";
    });
    document.querySelectorAll(".alt-page").forEach((page) => {
      page.style.backgroundColor = "black";
    });

    // Stats    
    document.querySelectorAll('.menu-section-stats').forEach(stat => {stat.style.backgroundColor = "black"})
    document.querySelectorAll('.menu-section-stats').forEach(stat => {stat.style.color = "white"})

  } else {
    // main body
    document.querySelector("body").style.backgroundColor = "";

    // Header Section
    document.getElementById("main-header").style.color = "";
    document.getElementById("main-header").style.borderBottom = "";
    document.getElementById("main-header-help").style.border = "";
    document.querySelectorAll(".bar").forEach((bar) => {
      bar.style.backgroundColor = "";
    });

    // gameboard section
    document.querySelectorAll(".gameboard-word-letter").forEach((letter) => {
      letter.style.border = "";
    });
    document.querySelectorAll(".gameboard-word-letter").forEach((letter) => {
      letter.style.color = "";
    });
    document.querySelectorAll(".gameboard-word-letter").forEach((letter) => {
      letter.style.backgroundColor = "";
    });

    // Keyboard Section
    document.querySelectorAll(".keyboard-key").forEach((key) => {
      key.style.color = "";
    });
    document.querySelectorAll(".keyboard-key").forEach((key) => {
      key.style.backgroundColor = "";
    });

    // Menu and settings
    document.querySelectorAll(".alt-page").forEach((page) => {
      page.style.color = "";
    });
    document.querySelectorAll(".alt-page").forEach((page) => {
      page.style.backgroundColor = "";
    });

    // Stats
    document.querySelectorAll('.menu-section-stats').forEach(stat => {stat.style.backgroundColor = ""})
    document.querySelectorAll('.menu-section-stats').forEach(stat => {stat.style.color = ""})
    
  }
}

function displayError(msg) {
  let msgDiv = document.querySelector('.msg-error');
  msgDiv.textContent = msg;
  msgDiv.classList.add('active');
  setTimeout( () => {msgDiv.classList.remove('active')} , 2500)
  return;
}

// ------------------------------------------------------ Eventlisteners ------------------------------------------------------
document
  .getElementById("main-header-menubutton")
  .addEventListener("click", toggleMenu);

document
  .getElementById("main-header-help")
  .addEventListener("click", toggleHelp);

document.querySelectorAll(".exit-help").forEach((element) =>
  element.addEventListener("click", (e) => {
    hidePage(e);
  })
);

document.querySelector(".darkmode-switch").addEventListener("change", (e) => {
  toggleDarkMode(e);
});

document.querySelectorAll('.keyboard-key').forEach(key => {
  key.addEventListener('click', (e) => {getInputGraphicKeyboard(e)})
})

window.addEventListener('keydown', getInputKeyboard);

document.querySelector('.reset-button').addEventListener('click', resetGame)

window.addEventListener('DOMContentLoaded', displayStats);
