const socket = io();

const input = document.getElementById("p1Input");
const p2TextDisplay = document.getElementById('p2Input');
const p2NameDisplay = document.getElementById('p2Name');
const textDisplayEl = document.getElementById('gameStateText');
const myScoreDisplay = document.getElementById('p1Score');
const p2ScoreDisplay = document.getElementById('p2Score');
const matchID = window.location.href.substring(window.location.href.lastIndexOf("/")+1, window.location.href.length);

var highlight = false;
var gameOver = false;
var myPID = null; //tells them which score is theirs
var p2PID;
var targetWord;
//var previousInput = "";
var p2String = "";

const renderHighlight = () => {
    let p1Text = input.value.toLowerCase();
    let p1IncorrectIndex = -1;
    let p2Text = p2TextDisplay.value; 
    let farthestCorrectIndex = -1;
    let targetWord = textDisplayEl.textContent.toLowerCase();
    
    if (targetWord.includes(p1Text) && p1Text[0] == targetWord[0]) {
        textDisplayEl.innerHTML = `<span class="correct">${targetWord.substring(0, p1Text.length)}</span>${targetWord.substring(p1Text.length, targetWord.length)}`
    }else if(targetWord.includes(p1Text.substring(0, p1Text.length-1)) && p1Text[p1Text.length-1] != targetWord[p1Text.length-1]) {
        console.log("wawaweewa")
        textDisplayEl.innerHTML = `<span class="correct">${targetWord.substring(0, p1Text.length-1)}</span><span class="incorrect">${targetWord.substring(p1Text.length-1, p1Text.length)}</span>${targetWord.substring(p1Text.length, targetWord.length)}`
    }
}

socket.on('gameStart', (word) => {
    textDisplayEl.innerHTML = word;
    highlight = true;
    input.focus();
    input.value = "";
    p2TextDisplay.value = "";
});

socket.on('setP2Name', (name) => {
    p2NameDisplay.textContent = `${name}'s Score:`
    input.removeAttribute('disabled');
    textDisplayEl.innerHTML = "Both players must type ready to start";
})

socket.on('matchCreated', (pid) => {
    myPID = pid;
    p2PID = (pid == 1) ? 0 : 1;
    myScoreDisplay.textContent = `0`;
    p2ScoreDisplay.textContent = `0`;
});

socket.on('newWord', ({word, score}) => {
    textDisplayEl.textContent = word;
    targetWord = word;
    console.log(targetWord);
    myScoreDisplay.textContent = `${score[myPID]}`;
    p2ScoreDisplay.textContent = `${score[p2PID]}`;
    input.value = "";
    p2TextDisplay.value = "";
});

socket.on("gameOver", ({winner, score}) => {
    textDisplayEl.textContent = `${winner} won!\n To rematch, both players must type rematch \n To return to the homepage type quit`;
    myScoreDisplay.textContent = `${score[myPID]}`;
    p2ScoreDisplay.textContent = `${score[p2PID]}`;
    gameOver = true;
    highlight = false;
    input.value = "";
    p2TextDisplay.value = "";
});

socket.on("rematch", (queryID) => {
    document.location.replace(`/match/${queryID}`);
});

window.addEventListener("load", () => {
    socket.emit('matchJoin', matchID); //wait before sending otherwise this client wont be ready to recieve messages  
});

input.addEventListener('keyup',(e) =>{
    socket.emit('type', { text: input.value, queryID: matchID });
    if (input.value.toLowerCase() == "rematch" && gameOver) {
        socket.emit('rematch', matchID)
    }
    if (input.value.toLowerCase() == "quit" && gameOver) {
        socket.emit('quit', matchID);
        document.location.replace(`/`);
    }
    if (input.value.toLowerCase() == "ready") {
        socket.emit('ready', matchID);
    }
    if (highlight) renderHighlight();
});

socket.on('p2typed', (data) => {
    p2TextDisplay.value = data;
    renderHighlight();
});

socket.on('playerQuit', () => {
    document.location.replace(`/`);
});