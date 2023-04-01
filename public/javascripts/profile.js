$(document).ready(function(){
        let cardnumber = $('#firstname-id').text().trim()
        $("#barcode").JsBarcode(cardnumber,{format:"code39"});

        // Clear Previous QR Code
        $('#qrcode').empty();
                
        // Set Size to Match User Input
        $('#qrcode').css({
                'width' : 128,
                'height' : 128
        })
                  
        // Generate and Output QR Code
        $('#qrcode').qrcode({width: 128,height: 128,text:cardnumber});
                
             
})