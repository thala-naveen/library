$(document).ready(function() {
    $('#user-table').DataTable( {
     dom: 'Bfrtip',
        buttons: [
         'copy', 'csv', 'excel', 'pdf', 'print'
         ]
        } );
    } );