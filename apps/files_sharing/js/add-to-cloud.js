(function($, OC, OCA){

    $(function() {
        $('.storage #save-button').click(function() {
            var remote = $('#storage_url').val();
			var token = $('#sharingToken').val();
			var owner = $('.storage').data('owner');
			var name = $('.storage').data('name');
			var isProtected = $('.storage').data('protected') ? 1 : 0;
			OCA.Sharing.PublicApp._saveToOwnCloud(remote, token, owner, name, isProtected);

        }); 
    
    
    });

})(jQuery, OC, OCA);
