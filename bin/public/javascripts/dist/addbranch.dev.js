"use strict";

$(document).ready(function () {
  $.getJSON('/admin/getcourse', function (data) {
    data.map(function (item) {
      $('#course').append($('<option>').text(item.coursename).val(item.courseid + "#" + item.coursename));
    });
  });
});