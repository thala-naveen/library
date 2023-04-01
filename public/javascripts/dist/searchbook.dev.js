"use strict";

$(document).ready(function () {
  $.getJSON("https://api.ipify.org?format=json", function (data) {
    $('.userip').val(data.ip);
    $('#userip').val(data.ip);
  });
  $('#subjectname').keyup(function () {
    console.log($('#subjectname').val().length);
    if ($('#subjectname').val().length >= 3) $.getJSON('/search_by_subject', {
      subject: $('#subjectname').val()
    }, function (data) {
      var htm = '';
      data.map(function (item, index) {
        htm += "<tr><td scope=\"row\">".concat(index + 1, "</td><td scope=\"row\">").concat(item.title, "</td><td scope=\"row\">").concat(item.author, "</td><td scope=\"row\">").concat(item.publisher, "</td><td scope=\"row\">").concat(item.subject, "</td><td scope=\"row\">").concat(item.classificationnumber, "</td><td scope=\"row\">").concat(item.language, "</td><td scope=\"col\">").concat(item.volume, "</td></tr>");
      });
      $('#book-by-subject').html(htm);
    });
  });
  $('#subjectname').keydown(function () {
    console.log($('#subjectname').val().length);
    if ($('#subjectname').val().length >= 3) $.getJSON('/search_by_subject', {
      subject: $('#subjectname').val()
    }, function (data) {
      var htm = '';
      data.map(function (item, index) {
        htm += "<tr><td scope=\"row\">".concat(index + 1, "</td><td scope=\"row\">").concat(item.title, "</td><td scope=\"row\">").concat(item.author, "</td><td scope=\"row\">").concat(item.publisher, "</td><td scope=\"row\">").concat(item.subject, "</td><td scope=\"row\">").concat(item.classificationnumber, "</td><td scope=\"row\">").concat(item.language, "</td><td scope=\"col\">").concat(item.volume, "</td></tr>");
      });
      $('#book-by-subject').html(htm);
    });
  });
});