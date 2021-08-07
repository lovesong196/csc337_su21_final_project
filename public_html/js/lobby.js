var isFormHidden = true;
function createRoom(){
    if(isFormHidden){
        $('#createOptionsWrapper').css('display', 'block')
        isFormHidden = false
    } else {
        $('#createOptionsWrapper').css('display', 'none')
        isFormHidden = true
    }
}
function cancel(){
    $('#createOptionsWrapper').css('display', 'none')
    isFormHidden = true
}
function join(id){
    for(room of rooms){
        if(id == room._id){
            if(room.password != null){
                let password = prompt("Please enter password:")
                if(password != room.password){
                    alert("Wrong password")
                    return
                }
            }
        }
    }
    $.ajax({
        type: "POST",
        url: "/join/" + id,
        data: null,
        dataType: "text",
        success: function (response) {
            if(response == 'SUCCESS'){
                window.location.href='/game/' + id
            } else {
                alert('Room is Full')
            }
        }
    });
}
function create(){
    $.ajax({
        type: "POST",
        url: "/create/",
        data: JSON.stringify(
            {
                lobbyName: $('#lobbyName').val(),
                isPrivate: $("#isPrivate").is(":checked"),
                password: $("#password").val(),
                color: $('#color').val()
            }
        ),
        dataType: "json",
        contentType:"application/json; charset=utf-8",
        success: function (response) {
            console.log(response.id)
            window.location.href='/game/' + response.id
        }
    });
}
var rooms
function getRooms(results){
    rooms = results
    let list = $('#roomList')
    const imageHtml = "<img src='Images/private.png' width='15`px'></img>"
    for(room of rooms){
        if(room.password != null){
            let html = `<tr class='content'> <td class='room'>${room.name}` + imageHtml + `</td> <td> <input type="submit" class='button' id='join' value="Join" onclick='join("${room._id}");'></td></tr>`
            list.html(list.html() + html)
        } else {
            let html = `<tr class='content'> <td class='room'>${room.name}</td> <td> <input type="submit" class='button' id='join' value="Join" onclick='join("${room._id}");'></td></tr>`
            list.html(list.html() + html)
        }
        
    }
}
$.ajax({
    type: "GET",
    url: "/rooms",
    dataType: "json",
    success: function (response) {
        getRooms(response)
    }
});