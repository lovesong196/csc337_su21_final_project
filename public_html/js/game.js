var roomId = window.location.pathname.split('/')[2]
roomId = roomId.substring(3, roomId.length - 3)
var readyBlack = false
var readyWhite = false
function genButtons(){
    let board = $('#board')
    for(let row = 0; row < 15; row++){
        for(let col = 0; col < 15; col++){
            board.html(board.html() + 
            `<div class='placeButton' style='transform: translate(${5 + col * 42}px, ${5 + row * 42}px)' onclick='place(${row}, ${col})'></div>`)
        }
    }
}
function init(){
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
            console.log(response)
            if(response.playerBlack != null){
                initBlack(response.playerBlack)
            }
            if(response.playerWhite != null){
                initWhite(response.playerWhite)
            }
            
        }
    });
}
function place(row, col){
    console.log(row, col)
}
genButtons()
init()
