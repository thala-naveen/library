$(document).ready(function() {
    $('#book-table').DataTable( {
     dom: 'Bfrtip',
        buttons: [
         'copy', 'csv', 'excel', 'pdf', 'print'
         ]
        } );
    } );