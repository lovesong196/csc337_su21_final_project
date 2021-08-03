
/*
This method send a request to the server for creating a user.

@param null
@return null
*/

function createUser (){
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
                $("#createInfo").html("<div style=\"color: red\">User created.</div>")
            }
        }
    });
}

/*
This method send a request to the server with a user credintials for login.

@param null
@return null
*/
function loginUser (){
    var httpRequest = new XMLHttpRequest();
    usr = $('#usrNameL'); 
    let pass = $('#passL'); 

    if (!httpRequest){return false}

    httpRequest.onreadystatechange = () =>{
        if ( httpRequest.readyState === XMLHttpRequest.DONE){
            if ( httpRequest.status === 200){
                if (httpRequest.responseText == 'ok'){
                    window.location = "home.html";
                }else{
                    $('#errMsg').html(httpRequest.responseText); 
                }
            }else {alert('ERROR');}
        }
    }

    usrInfo = JSON.stringify({name:usr[0].value, pass:pass[0].value});
    let params = 'usrInfo=' + usrInfo;
    httpRequest.open('POST', '/login/user', true);
    httpRequest.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    httpRequest.send(params);
}

