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
