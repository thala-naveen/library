"use strict";

$(document).ready(function () {
  $.getJSON('/admin/get_total_books', function (data) {
    $('#total-books').html(data[0].totalbooks);
  });
  $.getJSON('/admin/get_issued_books', function (data) {
    $('#issued-books').html(data[0].issuedbooks);
  });
  $.getJSON('/admin/get_total_students', function (data) {
    $('#total-students').html(data[0].totalstudents);
  });
  $.getJSON('/admin/get_total_professors', function (data) {
    $('#total-professors').html(data[0].totalprofessors);
  });
  $.getJSON('/admin/get_total_lostbooks', function (data) {
    $('#lost-books').html(data[0].lostbooks);
  });
  $.getJSON('/admin/get_total_Notice', function (data) {
    $('#total-notice').html(data[0].totalnotice);
  });
  $.getJSON('/admin/get_remarked_students', function (data) {
    $('#remarked-students').html(data[0].remarkedstudents);
  });
});