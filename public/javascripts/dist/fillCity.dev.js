"use strict";

function check() {
  if (document.getElementById('confirmPassword').value == document.getElementById('password').value) {
    document.getElementById('submit-btn').disabled = false;
    document.getElementById('msg').innerHTML = '';
  } else {
    document.getElementById('submit-btn').disabled = true;
    document.getElementById('msg').innerHTML = 'password not matched';
  }

  if (document.getElementById('terms-checkbox').checked == true) document.getElementById('submit-btn').disabled = false;else document.getElementById('submit-btn').disabled = true;
}

$(document).ready(function () {
  $('#statename').change(function () {
    var arr = $('#statename').val().split('.');
    var statecode = arr[1];
    var countrycode = arr[0];
    $.getJSON('/getcities', {
      statecode: statecode,
      countrycode: countrycode
    }, function (data) {
      $('#cityname').empty();
      $('#cityname').append($('<option>').text('Select City'));
      data.map(function (item) {
        $('#cityname').append($('<option>').text(item.name).val(item.name));
      });
    });
  });
  $.getJSON('/getcourse', function (data) {
    data.map(function (item) {
      $('#course').append($('<option>').text(item.coursename).val(item.courseid + "#" + item.coursename));
    });
  });
  $('#course').change(function () {
    $('#branch').empty();
    $('#branch').append($('<option disabled selected>').text('Select Branch'));
    $.getJSON('/getbranch', {
      courseid: $('#course').val()
    }, function (data) {
      data.map(function (item) {
        $('#branch').append($('<option>').text(item.branchname).val(item.branchname));
      });
    });
  });

  if ($('#role').val() == "staff") {
    $('#proff').html('');
    $('#firstname').html('');
    $('#firstname').val('');
  }
});