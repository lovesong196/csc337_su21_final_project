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