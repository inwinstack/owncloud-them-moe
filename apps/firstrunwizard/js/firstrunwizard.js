function showfirstrunwizard(){
	$.colorbox({
                escKey: false,
                overlayClose: false,
		opacity:0.4, 
		transition:"elastic", 
		speed:100, 
		width:"70%", 
		height:"70%", 
		href: OC.filePath('firstrunwizard', '', 'wizard.php'),
		onComplete : function(){
			if (!SVGSupport()) {
				replaceSVG();
			}
		},
		onClosed : function(){
			$.ajax({
			url: OC.filePath('firstrunwizard', 'ajax', 'disable.php'),
			data: ""
			});
		}  
	});
}

$('#showWizard').live('click', function () {	
	showfirstrunwizard();
});

$('#closeWizard').live('click', function () {	
		$.colorbox.close();
});

$('#printWizard').live('click', function () {
    var printContents = document.getElementById("printableArea").innerHTML;
    w=window.open();
    w.document.write(printContents);
    w.print();
    w.document.close(); // necessary for IE >= 10
    w.focus(); // necessary for IE >= 10
    w.close();
});

$('#acceptWizard').live('click', function () {
              $.ajax({
                    url: OC.filePath('firstrunwizard', 'ajax', 'disable.php'),
                    data: ""
                    })
              $.colorbox.close();

});

$('#notAcceptWizard').live('click', function () {
              window.open(OC.getProtocol()+ "://" + OC.getHost() + '/denined.php',"_self");
});
