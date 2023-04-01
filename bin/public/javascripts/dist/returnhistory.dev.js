"use strict";

$(document).ready(function () {
  $.getJSON("https://api.ipify.org?format=json", function (data) {
    $('.userip').val(data.ip);
    $('#userip').val(data.ip); //  $.getJSON('/showreturnhistory',{googleip:data.ip},function(dat){
    //  })
  });
  $.getJSON('/get_return_history', {
    cardnumber: $('#firstname-return').val()
  }, function (data) {
    var htm = '';
    data.map(function (item, index) {
      htm += "<tr><td scope=\"row\">".concat(index + 1, "</td><td scope=\"row\">").concat(item.title, "</td><td scope=\"row\">").concat(item.author, "</td><td scope=\"row\">").concat(item.returndate, "</td></tr>");
    });
    $('#return-result').html(htm);
  });
});