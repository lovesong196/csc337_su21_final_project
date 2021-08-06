
/*
This method send a request to the server for creating a user.

@param null
@return null
*/

function createUser(){
    $.ajax({
        type: "POST",
        url: "/add/user/",
        data: JSON.stringify(
            {
                username: $("#usrNameC").val(),
                password: $("#passC").val()
            }
        ),
        dataType: "text",
        contentType:"application/json; charset=utf-8",
        success: function (response) {
            if(response == "SUCCESS"){
                $("#createInfo").html("<div style=\"color: green\">User created.</div>")
            } else {
                $("#createInfo").html("<div style=\"color: red\">Error.</div>")
            }
        }
    })
}

/*
This method send a request to the server with a user credintials for login.

@param null
@return null
*/
function loginUser(){
    $.ajax({
        type: "POST",
        url: "/login/",
        data: JSON.stringify(
            {
                username: $("#usrNameL").val(),
                password: $("#passL").val()
            }
        ),
        dataType: "text",
        contentType:"application/json; charset=utf-8",
        success: function (response) {
            console.log(response)
            if(response == "SUCCESS"){
                document.location.href="/lobby.html"
            } else {
                $("#loginInfo").text("Invalid login information provided.")
            }
            
        }
    })
}

function choose (){
    $("map[name=currBoard] area").on('click', function (event) {
        event.stopImmediatePropagation();
        event.preventDefault();
        coords = this.coords.split('');
        $.ajax({
            type: "POST",
            url: "/makeMove",
            data: JSON.stringify(
                {
                    coords: coords[0] + ',' +coords[1]
                }
            ),
            dataType: "text",
            contentType:"application/json; charset=utf-8",
            success: function (response) {
                if(response == "SUCCESS"){
                    console.log("SUCCESS")
                } else {
                    console.log("ERROR")
                }
            }
        })
        $('#'+this.id+'div').html('');
    });
};
$("map[name=currBoard] area").on('click', function (event) {});

