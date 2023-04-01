


$(document).ready(function(){

    $.getJSON("https://api.ipify.org?format=json", function(data) {
        $('.userip').val(data.ip) 
        $('#userip').val(data.ip)

        
        
    })

    $('#subjectname').keyup(function(){
        console.log($('#subjectname').val().length);
        if($('#subjectname').val().length>=3)
        $.getJSON('/search_by_subject',{subject:$('#subjectname').val()},function(data){
            var htm=''
            data.map((item,index)=>{
                htm+=`<tr><td scope="row">${index+1}</td><td scope="row">${item.title}</td><td scope="row">${item.author}</td><td scope="row">${item.publisher}</td><td scope="row">${item.subject}</td><td scope="row">${item.classificationnumber}</td><td scope="row">${item.language}</td><td scope="col">${item.volume}</td></tr>`
            })

            $('#book-by-subject').html(htm)
        })

    })

    $('#subjectname').keydown(function(){
        console.log($('#subjectname').val().length);
        if($('#subjectname').val().length>=3)
        $.getJSON('/search_by_subject',{subject:$('#subjectname').val()},function(data){
            var htm=''
            data.map((item,index)=>{
                htm+=`<tr><td scope="row">${index+1}</td><td scope="row">${item.title}</td><td scope="row">${item.author}</td><td scope="row">${item.publisher}</td><td scope="row">${item.subject}</td><td scope="row">${item.classificationnumber}</td><td scope="row">${item.language}</td><td scope="col">${item.volume}</td></tr>`
            })

            $('#book-by-subject').html(htm)
        })

    })

})

