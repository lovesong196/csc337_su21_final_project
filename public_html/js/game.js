
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
