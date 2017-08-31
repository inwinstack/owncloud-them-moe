$(document).ready(function() {
     var length = $("#app-navigation ul").children().length -1;
     var serviceindex = $("#serviceindex").index();
     $("#app-navigation ul li:eq("+serviceindex+")").insertAfter("#app-navigation ul li:eq("+length+")");
});

