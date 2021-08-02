
/*
This method send a request to the server for creating a user.

@param null
@return null
*/

function createUser (){
    var httpRequest = new XMLHttpRequest();

    if (!httpRequest){
        alert('Error!');
        return false
    }
    httpRequest.onreadystatechange = () =>{
        if ( httpRequest.readyState === XMLHttpRequest.DONE){
            if ( httpRequest.status === 200){
                alert(httpRequest.responseText)
            }else {alert('ERROR');}
        }
    }

    let usr = $('#usrNameC'); 
    let pass = $('#passC'); 
    usrInfo = JSON.stringify({name:usr[0].value, pass:pass[0].value});
    let params = 'usrInfo=' + usrInfo;
    httpRequest.open('POST', '/add/user', true);
    httpRequest.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    httpRequest.send(params);
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

