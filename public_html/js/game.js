var roomId = window.location.pathname.split('/')[2]
var readyBlack = false
var readyWhite = false
var currPlayer, currColor, blackUsername, whiteUsername
var board = []
var roomBuffer
for(let i = 0; i < 15; i ++){
    board.push([null, null, null, null, null, null, null, null, null, null, null, null, null, null, null])
}
$.ajax({
    type: "GET",
    url: "/get/curruser",
    dataType: "text",
    success: function (response) {
        currPlayer = response
    }
});
function genButtons(){
    let board = $('#board')
    for(let row = 0; row < 15; row++){
        for(let col = 0; col < 15; col++){
            board.html(board.html() + 
            `<div class='placeButton' row='${row}' col='${col}' style='transform: translate(${5 + col * 42}px, ${5 + row * 42}px)' onclick='place(${row}, ${col})'></div>`)
        }
    }
}
function waitForPlayer(){
    function initBlack(id){
        $.ajax({
            type: "POST",
            url: "/get/user/",
            data: JSON.stringify({
                userId: id
            }),
            contentType:"application/json; charset=utf-8",
            dataType: "json",
            success: function (response) {
                readyBlack = true
                blackUsername = response.username
                $('#black').html(`Black: ${response.username}`)
            }
        });
    }
    function initWhite(id){
        $.ajax({
            type: "POST",
            url: "/get/user/",
            data: JSON.stringify({
                userId: id
            }),
            contentType:"application/json; charset=utf-8",
            dataType: "json",
            success: function (response) {
                readyWhite = true
                whiteUsername = response.username
                $('#white').html(`White: ${response.username}`)
            }
        });
    }
    $.ajax({
        type: "POST",
        url: "/get/room/",
        data: JSON.stringify({
            roomId: roomId
        }),
        contentType:"application/json; charset=utf-8",
        dataType: "json",
        success: function (response) {
            roomBuffer = response
            if(response.playerBlack != null){
                initBlack(response.playerBlack)
            }
            if(response.playerWhite != null){
                initWhite(response.playerWhite)
            }
            $('#next').html('Next: ' + response.next)
        }
    });
    if(readyWhite && readyBlack) {
        clearInterval(id)
        if(currPlayer == whiteUsername) {
            currColor = 'White'
        } else if(currPlayer == blackUsername) {
            currColor = 'Black'
        }
    }
}
function drawBoard(){
    for(let row = 0; row < 15; row++){
        for(let col = 0; col < 15; col++){
            if(currColor == null) return;
            switch(board[row][col]){
                case null:
                    continue
                case 'Black':
                    $(`div[col=${col}][row=${row}]`).html(`<img src='/Images/black.png' width='36px' height>`)
                    break
                case 'White':
                    $(`div[col=${col}][row=${row}]`).html(`<img src='/Images/white.png' width='36px' height>`)
                    break
            }
            
        }
    }
}
function updateBoard(){
    $.ajax({
        type: "POST",
        url: "/get/room/",
        data: JSON.stringify({
            roomId: roomId
        }),
        contentType:"application/json; charset=utf-8",
        dataType: "json",
        success: function (response) {
            roomBuffer = response
            $('#next').html('Next: ' + response.next)
            let lastMove = response.lastMove
            board[parseInt(lastMove[1])][parseInt(lastMove[2])] = lastMove[0];
            drawBoard()
        }
    });
}
function place(row, col){
    if(roomBuffer.next != currColor){
        alert('Not Your turn yet')
        return
    }
    if(board[row][col]!= null){
        alert('This place has been taken.')
        return
    }
    $.ajax({
        type: "POST",
        url: "/makemove/",
        data: JSON.stringify({
            roomId: roomId,
            move: [currColor, ''+row, ''+col]
        }),
        contentType:"application/json; charset=utf-8",
        dataType: "text",
        success: function (response) {
            board[row][col] = currColor
            
            if(roomBuffer.next == 'White'){
                roomBuffer.next = 'Black'
            } else {
                roomBuffer.next = 'White'
            }
        }
    });
}

genButtons()
var id = setInterval(()=>waitForPlayer(), 300)
var update = setInterval(()=>updateBoard(), 300)
var checkInterval = setInterval(()=>{
    let winner = check()
    if(winner != false){
        alert(winner + ' wins!')
        clearInterval(checkInterval)
    }
}, 500)
function checkVertical (board){
    y = 0
    let checkDuplicates = new Set();

    for(i=0; i <= board[0].length - 6; i++){
      checkDuplicates.add(board[i][y]);
      checkDuplicates.add(board[i+1][y]);
      checkDuplicates.add(board[i+2][y]);
      checkDuplicates.add(board[i+3][y]);
      checkDuplicates.add(board[i+4][y]);
      if (checkDuplicates.size==1 && Array.from(checkDuplicates)[0] != null){
        return Array.from(checkDuplicates)[0];
      }
      checkDuplicates.clear();
    }
    return false;
}

function checkHorizontal (board) {
    x = 0
    let checkDuplicates = new Set();

    checkDuplicates.add(board[x][0]);
    for(i=1; i <= board[0].length - 6; i++){
      checkDuplicates.add(board[x][i]);
      checkDuplicates.add(board[x][i+1]);
      checkDuplicates.add(board[x][i+2]);
      checkDuplicates.add(board[x][i+3]);
      checkDuplicates.add(board[x][i+4]);
      if (checkDuplicates.size==1 && Array.from(checkDuplicates)[0] != null){
        return Array.from(checkDuplicates)[0];
      }
      checkDuplicates.clear();
    }
    return false;
}

function checkDiagLeftRight (board) {
    x = board[0].length-5
    currX = board[0].length-7
    y = 0
    
    let checkDuplicates = new Set();
  
    while (!(x == 0) || !(y == board[0].length - 5)){
      checkDuplicates.add(board[x][y]);
      checkDuplicates.add(board[x+1][y+1]);
      checkDuplicates.add(board[x+2][y+2]);
      checkDuplicates.add(board[x+3][y+3]);
      checkDuplicates.add(board[x+4][y+4]);
      if (checkDuplicates.size==1 && Array.from(checkDuplicates)[0] != null){
        return Array.from(checkDuplicates)[0];
      }
      if (x == board[0].length - 5 || y == board[0].length - 5){
        if (currX > 0){
          x = currX
          y = 0
        }else{
          x = 0
          y = Math.abs(currX);
        }
        currX -= 1
      }else{
        x += 1
        y += 1
      }
      checkDuplicates.clear();
    }
    return false;
}

function checkDiagRightLeft (board){

    x = board[0].length-5
    currX = board[0].length-7
    y = board[0].length -1

    let checkDuplicates = new Set();
    while (!(x == 0) || !(y == 4)){
    checkDuplicates.add(board[x][y]);
    checkDuplicates.add(board[x+1][y-1]);
    checkDuplicates.add(board[x+2][y-2]);
    checkDuplicates.add(board[x+3][y-3]);
    checkDuplicates.add(board[x+4][y-4]);
    if (checkDuplicates.size==1 && Array.from(checkDuplicates)[0] != null){
        return Array.from(checkDuplicates)[0];
    }
    if (x == board[0].length - 5 || y == 4){
        if (currX > 0){
        x = currX
        y = board[0].length -1
        }else{
        x = 0
        y = board[0].length -1 + currX
        }
        currX -= 1
    }else{
        x += 1
        y -= 1
    }
    checkDuplicates.clear();
    }
return false;
}
function check(){
    var winner
    winner = checkHorizontal(board)
    if(winner != false){
        return winner
    }
    winner = checkVertical(board)
    if(winner != false){
        return winner
    }
    winner = checkDiagLeftRight(board)
    if(winner != false){
        return winner
    }
    winner = checkDiagRightLeft(board)
    if(winner != false){
        return winner
    }
    return false
    
}