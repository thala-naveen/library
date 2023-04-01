$(document).ready(function() {
    $('#remark-table').DataTable( {
     dom: 'Bfrtip',
        buttons: [
         'copy', 'csv', 'excel', 'pdf', 'print'
         ]
        } );
    } );