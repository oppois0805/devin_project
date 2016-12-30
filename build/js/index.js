$(function(){
	$("#submit").click(function(event) {
		/* Act on the event */
		$(".control").addClass('error');
		$(".error-text").show();
	});
})