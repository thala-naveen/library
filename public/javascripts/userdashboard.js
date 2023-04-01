


$(document).ready(function(){

    var cardnumber = $('#show-issued-books-id').val()
    
    $('#show-issued-books-id').click(function(){
        
        $.getJSON('/get_issued_books',{cardnumber:cardnumber},function(data){
            var htm=''
            if(data.length>=1)
            {
                data.map((item,index)=>{
                htm+=`<tr><td scope="col">${index+1}</td><td scope="col">${item.cardnumber}</td><td scope="col">${item.title}</td><td scope="col">${item.author}</td><td scope="col">${item.issuedate}</td></tr>`
                })
                $('#issue-result').html(htm)
            }
            else
            {
                $('#issue-result').html('no books issued')
            }
        })
    })

    $.getJSON('/get_notice_for_users',function(data){
        var htm=''
            if(data.length>=1)
            {
                data.map((item,index)=>{
                htm+=`<tr><td scope="col">${item.notice}</td></tr>`
                })
                $('#notice-body').html(htm)
            }
            else
            {
                $('#notice-body').html('')
            }
    })

    $.getJSON("https://api.ipify.org?format=json", function(data) {
         $('.userip').val(data.ip) 
         $('#userip').val(data.ip)

         $.getJSON('/userdashboard',{googleip:data.ip},function(dat){
         })

     })
})
