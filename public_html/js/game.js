const roomId = window.location.pathname.split('/')[2]
function genButtons(){
    let board = $('#board')
    for(let row = 0; row < 15; row++){
        for(let col = 0; col < 15; col++){
            board.html(board.html() + 
            `<div class='placeButton' style='transform: translate(${9 + col * 42}px, ${9 + row * 42}px)' onclick='place(${row}, ${col})'></div>`)
        }
    }
}
function init(){
    $.ajax({
        type: "GET",
        url: "/get/room/" + roomId,
        data: "json",
        success: function (response) {
            console.log(response)
        }
    });
}
function place(row, col){
    console.log(row, col)
}
genButtons()