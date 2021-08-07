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
var id = setInterval(()=>waitForPlayer(), 500)
var update = setInterval(()=>updateBoard(), 500)