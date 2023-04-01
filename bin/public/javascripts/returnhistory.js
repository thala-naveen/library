

$(document).ready(function() {

    $.getJSON("https://api.ipify.org?format=json", function(data) {
         $('.userip').val(data.ip) 
         $('#userip').val(data.ip)

        //  $.getJSON('/showreturnhistory',{googleip:data.ip},function(dat){
        //  })
         
     })

    $.getJSON('/get_return_history',{cardnumber:$('#firstname-return').val()},function(data){
            var htm=''
            data.map((item,index)=>{
                htm+=`<tr><td scope="row">${index+1}</td><td scope="row">${item.title}</td><td scope="row">${item.author}</td><td scope="row">${item.returndate}</td></tr>`
            })

            $('#return-result').html(htm)
    })

    
});