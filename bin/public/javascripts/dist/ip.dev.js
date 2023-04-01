"use strict";

$(document).ready(function () {
  $.getJSON("https://api.ipify.org?format=json", function (data) {
    $('.userip').val(data.ip);
    $('#userip').val(data.ip);
  });
});