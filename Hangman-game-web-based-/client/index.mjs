'use strict';

// here we take all the external files known as modules and use the functions within them
import { displayCategory, displayMessage, displayHiddenWord, hideWord } from './displayVariables.mjs';
import { createRestartPrompt, createNamePrompt } from './createPrompt.mjs';
import { drawBackground, clearCanvas } from './drawCanvas.mjs';
import { prepareHandles } from './prepareHandles.mjs';
import { guessCount } from './guessCount.mjs';
import * as inputs from './manageInputs.mjs';

// here we define global variables
let handles = {};
let randomWord = [];
let usedLetters = [];
let hiddenWord;
let letterFound;
let condition;
let guesses;
let scoreWins;
let scoreLosses;

// get random word from the server and work on it from client-side
async function getRandomWord(randomCat) {
  const response = await fetch('category/' + randomCat);
  if (response.ok) {
    const fetchedWord = await response.json();
    // assign random word into global variable, then hide it and display only this: _ _ _ _
    randomWord = fetchedWord.toLowerCase();
    hiddenWord = hideWord(fetchedWord);
    displayHiddenWord(hiddenWord);
  } else {
    // otherwise, if the word couldn't be retrieved from the server, display an error 
    handles.errorMsg.hidden = false;
    handles.errorMsg.textContent = 'Word neizdevās ielādēt';
    throw new Error(`[${response.status}] neizdevās izveidot savienojumu;\n- Word neizdevās ielādēt`);
  }
}

// get random category from the server and work on it from client-side
async function getRandomCategory() {
  const response = await fetch('category');
  if (response.ok) {
    const fetchedCategory = await response.json();
    // display category output taken from server
    handles.category.value = fetchedCategory;
    displayCategory(fetchedCategory);
    
    // request a random word in that category from server
    getRandomWord(fetchedCategory);
  } else {
    // otherwise, if the word couldn't be retrieved from the server, display an error 
    handles.errorMsg.hidden = false;
    handles.errorMsg.textContent = 'Kategoriju neizdevās ielādēt';
    throw new Error(`[${response.status}] neizdevās izveidot savienojumu;\n- kategoriju neizdevās ielādēt`);
  }
}

// send to server the current score, thereby updating it
async function sendScore(scrW, scrL) {
  const payload = { wins: scrW, losses: scrL };
  const response = await fetch('sendScore', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (response.ok) {
    const scoreCount = await response.json();
    scoreCount.wins = scoreWins;
    scoreCount.losses = scoreLosses;
    handles.scoreCount.textContent = `Uzvaras: ${scoreCount.wins}\nZaudējumi: ${scoreCount.losses}`;
  } else {
    // if the client couldn't send the score into server, display error message
    handles.scoreCount.textContent = ['*Nevar ielādēt jaunu rezultātu :-(*'];
    throw new Error(`[${response.status}] savienojums neizdevās;\n- atjaunināts rezultāts neizdevās ielādēt`);
  }
}

// this async function will send player name to the server.
async function sendPlayerStat(playerName) {
  const payload = { name: playerName };
  const response = await fetch('playerName', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (response.ok) {
    const playerAdded = await response.json();
    if (!playerAdded) {
    // the player was not added to server list, it already exists in player list on server side
      handles.errorMsg.textContent = 'Nosaukums jau pastāv!';
      handles.errorMsg.hidden = false;
    } else {
      handles.errorMsg.textContent = '';
      handles.errorMsg.hidden = true;
    }
  } else {
    throw new Error(`[${response.status}] savienojums neizdevās;\n- Spēlētāja vārdu neizdevās publicēt.`);
  }
}

// when the web page is restarted, all the required variables will be reset,
// canvas will be redrawn.
function restartPage(theClass, prompting) {
  randomWord = [];
  usedLetters = [];
  hiddenWord = '';
  letterFound = false;
  condition = false;
  handles.letter.value = '';
  handles.warningMsg.textContent = '';
  handles.usedLetters.textContent = 'Izmantotie burti: ';
  handles.warningMsg.style.color = 'White';

  inputs.enableKeyButtons();

  // remove the restart prompt after it was used
  if (prompting) {
    handles.gameSection.removeChild(theClass);
    prompting = false;
  }

  // call these functions to reset the score, display and input fields
  clearCanvas();
  drawBackground();
  getRandomCategory();
  setGuessCount();
  displayScore();
}

// a name field will be created for fetching player's name
function namePrompt(gameSection) {
  const namePromptClass = createNamePrompt(gameSection);
  const sendButton = document.querySelector('#btnSend');
  sendButton.addEventListener('click', function () {
    // when the button is clicked,
    // check if any restricted character is in the name
    const restrictedCHARS = ['!', ',', '.', '#', '¬', '`', '/', '|'];
    const name = document.querySelector('#nameInput');
    
    // first loop for restricted characters
    for (let i = 0; i < restrictedCHARS.length; i += 1) {
      // second loop for letters in the name
      for (let j = 0; j < name.value.length; j += 1) {
        if (name.value[j] === restrictedCHARS[i]) {
          // check if the name contains restricted character
          console.log(`Nosaukums '${name.value}' satur ierobežotu rakstzīmi '${restrictedCHARS[i]}'`);
          name.style.backgroundColor = 'red';
          handles.errorMsg.textContent = 'Jūsu vārds satur ierobežotas rakstzīmes!';
          handles.errorMsg.hidden = false;
          return;
        }
      }
    }
    // the name field is empty
    if (name.value.length === 0) {
      name.style.backgroundColor = 'red';
      handles.errorMsg.textContent = 'Nosaukuma lauks ir tukšs!';
      handles.errorMsg.hidden = false;
      return;
    }
    // no restricted characters, send the name to server
    handles.errorMsg.hidden = true;
    sendPlayerStat(name.value);
    if (gameSection.contains(namePromptClass)) {
      gameSection.removeChild(namePromptClass);
    }
    // the game for this user is finished, so the webpage background is represented grey as a finish
    // if the user wishes to replay the game, restart the web page
    document.body.style.background = 'grey';
  });
}

// this function will create a prompt asking the user to restart the game
function restartPrompt() {
  const gameSec = handles.gameSection;

  // prompt user with restart
  const prompting = true;
  // text
  const newText = document.createTextNode('Atkal spēlēt?');
  const rPrompt = createRestartPrompt();
  rPrompt.append(newText);
  // class of 'restartPrompt'
  // add text into it
  const newClass = document.createElement('class');
  newClass.className = 'restartPrompt';
  newClass.append(rPrompt);

  // buttons yes/no
  const btnYes = document.createElement('button');
  btnYes.setAttribute('id', 'btnYes');
  btnYes.setAttribute('class', 'promptButtons');
  const btnNo = document.createElement('button');
  btnNo.setAttribute('id', 'btnNo');
  btnNo.setAttribute('class', 'promptButtons');
  btnYes.textContent = 'Jā';
  btnNo.textContent = 'Nē';

  // add these buttons to the new class of prompt,
  // then add into main game section
  newClass.append(btnYes);
  newClass.append(btnNo);
  gameSec.append(newClass);

  // restart whole page
  document.querySelector('#btnYes').addEventListener('click', function () {
    restartPage(newClass, prompting);
  });

  // prompt the player their name through a button 'No'
  document.querySelector('#btnNo').addEventListener('click', function () {
    gameSec.removeChild(newClass);
    namePrompt(gameSec);
  });
}

// The function stops the game process,
// disables inputs,
// creates a prompt for user to restart or leave the game.
function gameStop(condition, rWord, sWins, sLosses) {
  inputs.disableKeyButtons();

  if (condition) {
    displayMessage(condition, rWord);
    sWins += 1;
  } else {
    displayMessage(condition, rWord);
    sLosses += 1;
  }

  sendScore(sWins, sLosses);
  restartPrompt();
}

// The function will monitor the guess count. (or life count)
// It accepts 'guess' as 'gCount' (which is an int or number)
// it stops the game and sends true/false condition after checking whether the player won or lost, based on their guesses
function monitorGuess(gCount, rWord, scoreW, scoreL, isNotWrong) {
  guessCount(gCount, isNotWrong);

  if (gCount === 0) {
    condition = false;
    gameStop(condition, rWord, scoreW, scoreL);
  } else if (hiddenWord.join('') === randomWord && gCount > 0) {
    condition = true;
    gameStop(condition, rWord, scoreW, scoreL);
  } else if (randomWord.includes(' ')) {
    // if the word has a whitespace
    randomWord.replace(' ', '');
  }

  handles.scoreCount.textContent = `Uzvaras: ${scoreW}\nZaudējumi: ${scoreL}`;
}

// The function will check the letter input to compare it with the word's letters
export function letterCheck(who) {
  const letter = who.toLowerCase();
  const usedLetterstxt = handles.usedLetters;
  let isNotWrong = false;
  handles.warningMsg.textContent = '';

  // record certain letter each time the user enters it
  // check letters array based on a user input
  for (let i = 0; i < usedLetters.length; i++) {
    // letter already exists
    if (usedLetters[i].includes(letter)) {
      handles.warningMsg.textContent = `Vēstule '${letter}' tika uzminēts jau pirms`;
      return;
    }
  }

  // loop through word array to find the letter in that word
  for (let i = 0; i < randomWord.length; i++) {
    // found a letter
    if (randomWord[i].includes(letter)) {
      hiddenWord[i] = hiddenWord[i].replace(hiddenWord[i], letter);
      displayHiddenWord(hiddenWord);
      letterFound = true;
      isNotWrong = true;
    } else if (i + 1 === randomWord.length && !letterFound) {
      // letter does not exist in the word
      handles.warningMsg.textContent = `Vārdā burts '${letter}' nepastāv`;
      guesses -= 1;
      isNotWrong = false;
    }
  }
  monitorGuess(guesses, randomWord, scoreWins, scoreLosses, isNotWrong);
  letterFound = false;
  usedLetters.push(letter);
  handles.guessCount.textContent = `Atlikušie uzminējumi: ${guesses}`;
  usedLetterstxt.textContent = `Izmantotie burti: ${usedLetters}`;
}

// this function is validating user's input by monitoring which letters on real keyboard were pressed
function validateInput(event) {
  const latvianLetters = [81, 71, 74, 82, 77, 86, 78, 90, 87, 88, 89, 72, 220, 59, 85, 83, 73, 76, 68, 65, 84, 69, 67, 222, 220, 219, 66, 221, 75, 80, 79, 192, 191];
  // Letter pressed on keyboard between A to Z
  if (latvianLetters.includes(event.keyCode)) {
    const letterKey = event.key;
    handles.letter.value = letterKey.toLowerCase();

    letterCheck(letterKey);
  }
}

// check the keys that were pressed by the user on keyboard
function checkKeys(e) {
  if (guesses > 0 && !condition) {
    switch (e.key) {
      case 'Backspace':
        handles.letter.value = null;
        break;
      default:
        // any other key pressed on a keyboard
        validateInput(e);
        break;
    }
  }
}

// get the score list from server and display here
/** i.e.
 * Wins: 0
 * Losses: 0
 */
async function displayScore() {
  const response = await fetch('getScore');
  if (response.ok) {
    const sCount = await response.json();
    scoreWins = sCount.wins;
    scoreLosses = sCount.losses;
  } else {
    handles.errorMsg.textContent = 'Nevar ielādēt rezultātu';
    handles.errorMsg.hidden = false;
    scoreWins = scoreLosses = [':('];
  }
  handles.scoreCount.textContent = `Uzvaras: ${scoreWins}\nZaudējumi: ${scoreLosses}`;
}

// get the guess count from server and display here
/**
 * Guesses left: 8
 */
async function setGuessCount() {
  const response = await fetch('guessCount');
  if (response.ok) {
    const lCount = await response.json();
    guesses = lCount;
  } else {
    handles.errorMsg.textContent = 'Neizdevās ielādēt minējumus!';
    handles.errorMsg.hidden = false;
    guesses = [' *Nevar ielādēt minējumus* '];
  }
  handles.guessCount.textContent = `Atlikušie uzminējumi: ${guesses}`;
}

// this function will make sure even listeners are active for keyboard or mouse clicks
function addEventListeners() {
  window.addEventListener('keydown', checkKeys);
  window.addEventListener('mouseup', inputs.whatClicked);
}

// prepare all HTML elements to manipulate them through Javascript
function prepareHandle() {
  handles = prepareHandles();
  handles.errorMsg.hidden = true;
}

// prepare all necessary functions to start game process once the web page is loaded
function pageLoaded() {
  prepareHandle();
  addEventListeners();
  setGuessCount();
  getRandomCategory();
  displayScore();
  drawBackground();
}

// this code will just load the page and the function
window.addEventListener('load', pageLoaded);
