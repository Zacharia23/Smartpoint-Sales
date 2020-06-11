function fadeAnimation() {
  var time = 6000;

  $("#notification").fadeIn(time).fadeOut(time);
}

fadeAnimation();

$(function () {
  $(".phoneModel").select2({
    theme: "bootstrap4",
  });

});

$('#itemReset').click(function(){
    $('#addItemsForm')[0].reset();

    $('#select').each(function() {
      $(this).val($(this).find("option[selected]").val());
    });
});


function multiply(one, two) {
  if (one && two ) {
    this.form.elements.priceTzs.value = one * two; 
  } else {
    this.style.color = 'black';
  }
}

$(function (){
  $('#itemTable').DataTable({
    "paging": true,
    "lengthChange": false,
    "searching": true,
    "ordering": true,
    "info": true,
    "autoWidth": true,
  });
});



