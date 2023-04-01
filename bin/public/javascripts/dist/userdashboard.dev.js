"use strict";

$(document).ready(function () {
  var cardnumber = $('#show-issued-books-id').val();
  $('#show-issued-books-id').click(function () {
    $.getJSON('/get_issued_books', {
      cardnumber: cardnumber
    }, function (data) {
      var htm = '';

      if (data.length >= 1) {
        data.map(function (item, index) {
          htm += "<tr><td scope=\"col\">".concat(index + 1, "</td><td scope=\"col\">").concat(item.cardnumber, "</td><td scope=\"col\">").concat(item.title, "</td><td scope=\"col\">").concat(item.author, "</td><td scope=\"col\">").concat(item.issuedate, "</td></tr>");
        });
        $('#issue-result').html(htm);
      } else {
        $('#issue-result').html('no books issued');
      }
    });
  });
  $.getJSON('/get_notice_for_users', function (data) {
    var htm = '';

    if (data.length >= 1) {
      data.map(function (item, index) {
        htm += "<tr><td scope=\"col\">".concat(item.notice, "</td></tr>");
      });
      $('#notice-body').html(htm);
    } else {
      $('#notice-body').html('');
    }
  });
  $.getJSON("https://api.ipify.org?format=json", function (data) {
    $('.userip').val(data.ip);
    $('#userip').val(data.ip);
    $.getJSON('/userdashboard', {
      googleip: data.ip
    }, function (dat) {});
  });
});