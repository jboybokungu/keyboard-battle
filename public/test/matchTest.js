const socket = io();

const input = document.getElementById("player1");
const p2TextDisplay = document.getElementById('player2');
const textDisplayEl = document.getElementById('gameStateText');
const myScoreDisplay = document.getElementById('myScore');
const p2ScoreDisplay = document.getElementById('p2Score');
const matchID = window.location.href.substring(window.location.href.lastIndexOf("/")+1, window.location.href.length);

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
    let targetWord = textDisplayEl.textContent;
    
    console.log(targetWord);
    console.log(p1Text);
    console.log(targetWord.includes(p1Text))
    if (targetWord.includes(p1Text)) {
        textDisplayEl.innerHTML = `<span class="greenHighlight">${targetWord.substring(0, p1Text.length)}</span>${targetWord.substring(p1Text.length, targetWord.length)}`
    }
    // for (let i=0; i<p1Text; i++){
    //     if(p1Text[i].toLowerCase() == word[i].toLowerCase()){
    //         farthestCorrectIndex = i;
    //     }else{
    //         p1IncorrectIndex = i;
    //     }
    // }
}

socket.on('gameStart', (word) => {
    textDisplayEl.innerHTML = word;
    input.removeAttribute('disabled');
});

socket.on('matchCreated', (pid) => {
    myPID = pid;
    p2PID = (pid == 1) ? 0 : 1;
    myScoreDisplay.textContent = `P1 Score: 0`;
    p2ScoreDisplay.textContent = `P2 Score: 0`;
    socket.emit('ready', matchID);
});

socket.on('newWord', ({word, score}) => {
    textDisplayEl.textContent = word;
    targetWord = word;
    console.log(targetWord);
    myScoreDisplay.textContent = `P1 Score: ${score[myPID]}`;
    p2ScoreDisplay.textContent = `P2 Score: ${score[p2PID]}`;
    input.value = "";
    p2TextDisplay.value = "";
});

window.addEventListener("load", () => {
    socket.emit('matchJoin', matchID); //wait before sending otherwise this client wont be ready to recieve messages  
});

input.addEventListener('keyup',(e) =>{
    socket.emit('type', { text: input.value, queryID: matchID });
    renderHighlight();
});

socket.on('p2typed', (data) => {
    p2TextDisplay.value = data;
    renderHighlight();
});

