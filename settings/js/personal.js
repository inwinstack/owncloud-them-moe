/**
 * Copyright (c) 2011, Robin Appelman <icewind1991@gmail.com>
 *               2013, Morris Jobke <morris.jobke@gmail.com>
 * This file is licensed under the Affero General Public License version 3 or later.
 * See the COPYING-README file.
 */

/**
 * The callback will be fired as soon as enter is pressed by the
 * user or 1 second after the last data entry
 *
 * @param callback
 * @param allowEmptyValue if this is set to true the callback is also called when the value is empty
 */
jQuery.fn.keyUpDelayedOrEnter = function (callback, allowEmptyValue) {
	var cb = callback;
	var that = this;
	this.keyup(_.debounce(function (event) {
		// enter is already handled in keypress
		if (event.keyCode === 13) {
			return;
		}
		if (allowEmptyValue || that.val() !== '') {
			cb();
		}
	}, 1000));

	this.keypress(function (event) {
		if (event.keyCode === 13 && (allowEmptyValue || that.val() !== '')) {
			event.preventDefault();
			cb();
		}
	});
};


/**
 * Post the email address change to the server.
 */
function changeEmailAddress () {
	var emailInfo = $('#email');
	if (emailInfo.val() === emailInfo.defaultValue) {
		return;
	}
	emailInfo.defaultValue = emailInfo.val();
	OC.msg.startSaving('#lostpassword .msg');
	var post = $("#lostpassword").serializeArray();
	$.ajax({
		type: 'PUT',
		url: OC.generateUrl('/settings/users/{id}/mailAddress', {id: OC.currentUser}),
		data: {
			mailAddress: post[0].value
		}
	}).done(function(result){
		// I know the following 4 lines look weird, but that is how it works
		// in jQuery -  for success the first parameter is the result
		//              for failure the first parameter is the result object
		OC.msg.finishedSaving('#lostpassword .msg', result);
	}).fail(function(result){
		OC.msg.finishedSaving('#lostpassword .msg', result.responseJSON);
	});
}

/**
 * Post the display name change to the server.
 */
function changeDisplayName () {
	if ($('#displayName').val() !== '') {
		OC.msg.startSaving('#displaynameform .msg');
		// Serialize the data
		var post = $("#displaynameform").serialize();
		// Ajax foo
		$.post('ajax/changedisplayname.php', post, function (data) {
			if (data.status === "success") {
				$('#oldDisplayName').val($('#displayName').val());
				// update displayName on the top right expand button
				$('#expandDisplayName').text($('#displayName').val());
				updateAvatar();
			}
			else {
				$('#newdisplayname').val(data.data.displayName);
			}
			OC.msg.finishedSaving('#displaynameform .msg', data);
		});
	}
}

function updateAvatar (hidedefault) {
	var $headerdiv = $('#header .avatardiv');
	var $displaydiv = $('#displayavatar .avatardiv');

	if (hidedefault) {
		$headerdiv.hide();
		$('#header .avatardiv').removeClass('avatardiv-shown');
	} else {
		$headerdiv.css({'background-color': ''});
		$headerdiv.avatar(OC.currentUser, 32, true);
		$('#header .avatardiv').addClass('avatardiv-shown');
	}
	$displaydiv.css({'background-color': ''});
	$displaydiv.avatar(OC.currentUser, 128, true);

	$('#removeavatar').show();
}

function showAvatarCropper () {
	var $cropper = $('.avatar-content #cropper');
	$cropper.prepend("<img>");
	var $cropperImage = $('.avatar-content #cropper img');

	$cropperImage.attr('src',
		OC.generateUrl('/avatar/tmp') + '?requesttoken=' + encodeURIComponent(oc_requesttoken) + '#' + Math.floor(Math.random() * 1000));

	// Looks weird, but on('load', ...) doesn't work in IE8
	$cropperImage.ready(function () {
		$('.avatar-content div[class$="body"]').hide();
		$cropper.show();
    var height = $cropper.height() * 0.9
    var width = $cropper.width() * 0.9

		$cropperImage.Jcrop({
			onChange: saveCoords,
			onSelect: saveCoords,
      boxWidth: width,
      boxHeight: height,
			aspectRatio: 1,
			setSelect: [0, 0, 300, 300]
		});
	});
}

function sendCropData () {
	cleanCropper();

	var cropperData = $('.avatar-content #cropper').data();
	var data = {
		x: cropperData.x,
		y: cropperData.y,
		w: cropperData.w,
		h: cropperData.h
	};
	$.post(OC.generateUrl('/avatar/cropped'), {crop: data}, avatarResponseHandler);
}

function saveCoords (c) {
	$('.avatar-content #cropper').data(c);

}

function cleanCropper () {
	var $cropper = $('.avatar-content #cropper');
	$('.avatar-content div[class$="body"]').show();
	$cropper.hide();
	$('.jcrop-holder').remove();
	$('.avatar-content #cropper img').removeData('Jcrop').removeAttr('style').removeAttr('src');
	$('.avatar-content #cropper img').remove();
}

function avatarResponseHandler (data) {
	if (typeof data === 'string') {
		data = $.parseJSON(data);
	}
	var $warning = $('#avatar .warning');
	$warning.hide();
  $('.avatar-choose-btn').prop('disabled', false).css({cursor: 'pointer'})
	if (data.status === "success") {
		updateAvatar();
	} else if (data.data === "notsquare") {
		showAvatarCropper();
	} else {
		$warning.show();
		$warning.text(data.data.message);
	}
}

function tab_2() {
  var style = {
    body: {
      height: '100%',
      textAlign: 'center',
      position: 'relative',
    },
    wrapper: {
      top: 'calc(100% / 2 - 58px / 2)',
      position: 'absolute',
      width: '100%'
    }
  }

  var body = $('<div class="avatar-upload-body">').css(style.body);
  var wrapper =$('<div>').css(style.wrapper);
  var button = $('<label for="uploadavatar" class="inlineblock button" id="uploadavatarbutton">').text(t('settings', 'Upload a pic from local'))
  var span = $('<div>').text(t('settings', 'The file is not allowed to exceed the maximum size of 20 MB.'))
  var wrapperHeight = undefined

  wrapper.append(button, span)

  body.append(wrapper)

  return body;
}

function tab_3() {
  var defer = $.Deferred();

  OC.dialogs.filepicker.loading = true;

  $.get(OC.filePath('core', 'templates', 'filepicker.html'), function(temp) {
    OC.dialogs.$filePickerTemplate = $(temp);
    OC.dialogs.$listTmpl = OC.dialogs.$filePickerTemplate.find('.filelist li:first-child').detach();
    defer.resolve(OC.dialogs.$filePickerTemplate);
  })

  $.when(defer.promise()).then(function($tmp) {
    OC.dialogs.filepicker.loading = false;
		OC.dialogs.$filePicker = $tmp.octemplate({
      dialog_name: 'oc-dialog-filepicker-content',
      title: '123'
    }).data('path', '').data('multiselect', false).data('mimetype', ["image/png", "image/jpeg"])

    $('.avatar-content').append(OC.dialogs.$filePicker)

		OC.dialogs.$filePicker.ready(function() {
      OC.dialogs.$filelist = OC.dialogs.$filePicker.find('.filelist');
      OC.dialogs.$dirTree = OC.dialogs.$filePicker.find('.dirtree');
      OC.dialogs.$dirTree.on('click', 'span:not(:last-child)', OC.dialogs, OC.dialogs._handleTreeListSelect);
      OC.dialogs.$filelist.on('click', 'li', function(event) {
        OC.dialogs._handlePickerClick(event, $(this));
      });
      OC.dialogs._fillFilePicker('');
    })

    var mesg = $('<span>').text(t('settings', 'Please pick a pic.')).css({color: 'red', float: 'right', display: 'block', lineHeight: '31px',  margin: '3px 15px', size: '1.5rem', display: 'none'})

    var button = $('<button class="primary">').css({float: 'right'}).text(t('settings', 'Choose')).click(function() {
      var datapath = OC.dialogs.$filePicker.data('path');

      datapath += '/' + OC.dialogs.$filelist.find('.filepicker_element_selected .filename').text();

      if($('.filepicker_element_selected').length == 0) {
        mesg.show()
        return ;
      }

      $.ajax({
        type: "POST",
        url: OC.generateUrl('/avatar/'),
        data: { path: datapath}
      }).done(function(data) {
        $('#oc-dialog-filepicker-content').hide();
        avatarResponseHandler(data)
      })
      .fail(function(jqXHR, status){
        var msg = jqXHR.statusText + ' (' + jqXHR.status + ')';
        if (!_.isUndefined(jqXHR.responseJSON) &&
          !_.isUndefined(jqXHR.responseJSON.data) &&
          !_.isUndefined(jqXHR.responseJSON.data.message)
        ) {
          msg = jqXHR.responseJSON.data.message;
        }
        avatarResponseHandler({
          data: {
            message: t('settings', 'An error occurred: {message}', { message: msg })
          }
        });
      });
    })

    $('#oc-dialog-filepicker-content').append(button, mesg)
  })
}

$(document).ready(function () {
  $('.avatardiv').hover(function() {
    if ($(this).find('.avater-cover').length == 0) {
      var style = {
        avatarDiv: {
          position: 'relative',
          overflow: 'hidden',
        },
        cover: {
          position: 'absolute',
          bottom: '0',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          textAlign: 'center',
          width: '100%',
          fontSize: '1rem',
          lineHeight: '2rem',
          cursor: 'pointer',
          color: 'white',
        }
      }
      $(this).css(style.avatarDiv)
      $(this).append($('<div class="avatar-cover">').css(style.cover).html(t('settings', 'Change')).click(function() {
        if ($('body').find('.oc-dialog').length == 0) {
          var style = {
            dialog: {
              position: 'fixed',
              background: 'white',
              width: '600px',
              left: 'calc((100vw - 600px) / 2)',
              height: '530px',
              top: '5vh',
              zIndex: '9990',
            },
            body: {
              boxSizing: 'border-box',
              height: 'calc(100% - 51px - 30px)',
            },
            tabBar: {
              boxSizing: 'border-box',
              width: '570px',
              borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
              color: '#589ad5',
            },
            tab: {
              boxSizing: 'border-box',
              display: 'inline-block',
              padding: '0 25px',
              cursor: 'pointer',
            },
            footer: {
              paddingTop: '15px',
              boxSizing: 'border-box',
              height: '51px',
              borderTop: '1px solid rgba(0, 0, 0, 0.1)',
              position: 'absolute',
              width: '570px',
              textAlign: 'right',
              bottom: '15px',
            },
            tabActive: {
              borderBottom: '2px solid  #589ad5',
            },
            header: {
            },
            content: {
              height: 'calc(100% - 23px)',
            }
          }

          var tabTitle = [
            {name: 'Update', fn: tab_2},
            {name: 'Select from cloud', fn: tab_3}
          ]
          var title = $('<h3 class="oc-dialog-title">').text(t('settings', "Select a profile picture"))
          var chooseButton = $('<button class="avatar-choose-btn primary">').text(t('settings', 'Setting as profile picture')).prop('disabled', true).css({cursor: 'not-allowed'})
          var closeButton = $('<button class="avatar-close-btn primary">').text(t('settings', 'Cancel'))
          var tab = $('<div class="avatar-tab">').css(style.tab)
          var body = $('<div>').css(style.body)
          var tabBar = $('<div>').css(style.tabBar)
          var content = $('<div class="avatar-content">').css(style.content)
          var close = $('<a class="oc-dialog-close svg">')
          var header = $('<div class="avatar-header">').css(style.header)
          var footer = $('<div class="avatar-footer">').css(style.footer)
          var dialog = $('<div class="oc-dialog">').css(style.dialog)
          var activeIndex = 0;

          chooseButton.click(function() {
            if(!$('.avatar-content #cropper').is(":visible")) {
              return ;
            }
            sendCropData();
            close.click();
          })

          close.click(function() {
            dialog.remove();
          })

          closeButton.click(function(){
            dialog.remove();
          })

          tabTitle.forEach(function(item, index) {
            var temp = tab.clone().data('index', index).text(t('settings', item.name))
            var cropper = $('<div id="cropper" class="hidden" style="display: none;">')

            temp.click(function(e) {
              if(activeIndex == $(this).data('index'))
                return ;

              cleanCropper();
              chooseButton.prop('disabled', true).css({cursor: 'not-allowed'})

              content.empty()
              content.append(cropper,item.fn())
            })
            if(index == 0)  {
              temp.css(style.tabActive)
              content.append(cropper,item.fn())
            }

            tabBar.append(temp)
          })

          tabBar.on('click', 'div', function(e) {
            activeIndex = $(this).data('index')
            $('.avatar-tab').css({borderBottom: '0'})
            $(this).css(style.tabActive)
          })

          header.append(close, title)
          body.append(tabBar, content)
          footer.append(closeButton, chooseButton)
          dialog.append(header, body, footer)

          $('body').append(dialog)
        }
      }))
    }
  }, function() {
    if ($(this).find('.avatar-cover').length != 0) {
      $('.avatar-cover').remove()
    }
  })

	if($('#pass2').length) {
		$('#pass2').showPassword().keyup();
	}

	$("#passwordbutton").click(function () {
		var isIE8or9 = $('html').hasClass('lte9');
		// FIXME - TODO - once support for IE8 and IE9 is dropped
		// for IE8 and IE9 this will check additionally if the typed in password
		// is different from the placeholder, because in IE8/9 the placeholder
		// is simply set as the value to look like a placeholder
		if ($('#pass1').val() !== '' && $('#pass2').val() !== ''
			&& !(isIE8or9 && $('#pass2').val() === $('#pass2').attr('placeholder'))) {
			// Serialize the data
			var post = $("#passwordform").serialize();
			$('#passwordchanged').hide();
			$('#passworderror').hide();
			// Ajax foo
			$.post(OC.generateUrl('/settings/personal/changepassword'), post, function (data) {
				if (data.status === "success") {
					$('#pass1').val('');
					$('#pass2').val('').change();
					// Hide a possible errormsg and show successmsg
					$('#password-changed').removeClass('hidden').addClass('inlineblock');
					$('#password-error').removeClass('inlineblock').addClass('hidden');
				} else {
					if (typeof(data.data) !== "undefined") {
						$('#password-error').html(data.data.message);
					} else {
						$('#password-error').html(t('Unable to change password'));
					}
					// Hide a possible successmsg and show errormsg
					$('#password-changed').removeClass('inlineblock').addClass('hidden');
					$('#password-error').removeClass('hidden').addClass('inlineblock');
				}
			});
			return false;
		} else {
			// Hide a possible successmsg and show errormsg
			$('#password-changed').removeClass('inlineblock').addClass('hidden');
			$('#password-error').removeClass('hidden').addClass('inlineblock');
			return false;
		}

	});

	$('#displayName').keyUpDelayedOrEnter(changeDisplayName);
	$('#email').keyUpDelayedOrEnter(changeEmailAddress, true);

	$("#languageinput").change(function () {
		// Serialize the data
		var post = $("#languageinput").serialize();
		// Ajax foo
		$.post('ajax/setlanguage.php', post, function (data) {
			if (data.status === "success") {
				location.reload();
			}
			else {
				$('#passworderror').html(data.data.message);
			}
		});
		return false;
	});

	var uploadparms = {
		done: function (e, data) {
			var response = data;
			if (typeof data.result === 'string') {
				response = $.parseJSON(data.result);
			} else if (data.result && data.result.length) {
				// fetch response from iframe
				response = $.parseJSON(data.result[0].body.innerText);
			} else {
				response = data.result;
			}
			avatarResponseHandler(response);
		},
		submit: function(e, data) {
			data.formData = _.extend(data.formData || {}, {
				requesttoken: OC.requestToken
			});
		},
		fail: function (e, data){
			var msg = data.jqXHR.statusText + ' (' + data.jqXHR.status + ')';
			if (!_.isUndefined(data.jqXHR.responseJSON) &&
				!_.isUndefined(data.jqXHR.responseJSON.data) &&
				!_.isUndefined(data.jqXHR.responseJSON.data.message)
			) {
				msg = data.jqXHR.responseJSON.data.message;
			}
			avatarResponseHandler({
			data: {
					message: t('settings', 'An error occurred: {message}', { message: msg })
				}
			});
		}
	};

	$('#uploadavatar').fileupload(uploadparms);

	$('#selectavatar').click(function () {
		OC.dialogs.filepicker(
			t('settings', "Select a profile picture"),
			function (path) {
				$.ajax({
					type: "POST",
					url: OC.generateUrl('/avatar/'),
					data: { path: path }
				}).done(avatarResponseHandler)
					.fail(function(jqXHR, status){
						var msg = jqXHR.statusText + ' (' + jqXHR.status + ')';
						if (!_.isUndefined(jqXHR.responseJSON) &&
							!_.isUndefined(jqXHR.responseJSON.data) &&
							!_.isUndefined(jqXHR.responseJSON.data.message)
						) {
							msg = jqXHR.responseJSON.data.message;
						}
						avatarResponseHandler({
							data: {
								message: t('settings', 'An error occurred: {message}', { message: msg })
							}
						});
					});
			},
			false,
			["image/png", "image/jpeg"]
		);
	});

	$('#removeavatar').click(function () {
		$.ajax({
			type: 'DELETE',
			url: OC.generateUrl('/avatar/'),
			success: function () {
				updateAvatar(true);
				$('#removeavatar').hide();
			}
		});
	});

  $('#uploadavatarbutton').hide();
  $('#selectavatar').hide();

	$('#abortcropperbutton').click(function () {
		cleanCropper();
	});

	$('#sendcropperbutton').click(function () {
		sendCropData();
	});

	$('#pass2').strengthify({
		zxcvbn: OC.linkTo('core','vendor/zxcvbn/zxcvbn.js'),
		titles: [
			t('core', 'Very weak password'),
			t('core', 'Weak password'),
			t('core', 'So-so password'),
			t('core', 'Good password'),
			t('core', 'Strong password')
		]
	});

	// does the user have a custom avatar? if he does hide #removeavatar
	// needs to be this complicated because we can't check yet if an avatar has been loaded, because it's async
	var url = OC.generateUrl(
		'/avatar/{user}/{size}',
		{user: OC.currentUser, size: 1}
	);
	$.get(url, function (result) {
		if (typeof(result) === 'object') {
			$('#removeavatar').hide();
		}
	});

	$('#sslCertificate').on('click', 'td.remove > img', function () {
		var row = $(this).parent().parent();
		$.ajax(OC.generateUrl('settings/personal/certificate/{certificate}', {certificate: row.data('name')}), {
			type: 'DELETE'
		});
		row.remove();

		if ($('#sslCertificate > tbody > tr').length === 0) {
			$('#sslCertificate').hide();
		}
		return true;
	});

	$('#sslCertificate tr > td').tipsy({gravity: 'n', live: true});

	$('#rootcert_import').fileupload({
		submit: function(e, data) {
			data.formData = _.extend(data.formData || {}, {
				requesttoken: OC.requestToken
			});
		},
		success: function (data) {
			if (typeof data === 'string') {
				data = $.parseJSON(data);
			} else if (data && data.length) {
				// fetch response from iframe
				data = $.parseJSON(data[0].body.innerText);
			}
			if (!data || typeof(data) === 'string') {
				// IE8 iframe workaround comes here instead of fail()
				OC.Notification.showTemporary(
					t('settings', 'An error occurred. Please upload an ASCII-encoded PEM certificate.'));
				return;
			}
			var issueDate = new Date(data.validFrom * 1000);
			var expireDate = new Date(data.validTill * 1000);
			var now = new Date();
			var isExpired = !(issueDate <= now && now <= expireDate);

			var row = $('<tr/>');
			row.data('name', data.name);
			row.addClass(isExpired? 'expired': 'valid');
			row.append($('<td/>').attr('title', data.organization).text(data.commonName));
			row.append($('<td/>').attr('title', t('core,', 'Valid until {date}', {date: data.validTillString}))
				.text(data.validTillString));
			row.append($('<td/>').attr('title', data.issuerOrganization).text(data.issuer));
			row.append($('<td/>').addClass('remove').append(
				$('<img/>').attr({
					alt: t('core', 'Delete'),
					title: t('core', 'Delete'),
					src: OC.imagePath('core', 'actions/delete.svg')
				}).addClass('action')
			));

			$('#sslCertificate tbody').append(row);
			$('#sslCertificate').show();
		},
		fail: function () {
			OC.Notification.showTemporary(
				t('settings', 'An error occurred. Please upload an ASCII-encoded PEM certificate.'));
		}
	});

	if ($('#sslCertificate > tbody > tr').length === 0) {
		$('#sslCertificate').hide();
	}
});

if (!OC.Encryption) {
	OC.Encryption = {};
}

OC.Encryption.msg = {
	start: function (selector, msg) {
		var spinner = '<img src="' + OC.imagePath('core', 'loading-small.gif') + '">';
		$(selector)
			.html(msg + ' ' + spinner)
			.removeClass('success')
			.removeClass('error')
			.stop(true, true)
			.show();
	},
	finished: function (selector, data) {
		if (data.status === "success") {
			$(selector).html(data.data.message)
				.addClass('success')
				.stop(true, true)
				.delay(3000);
		} else {
			$(selector).html(data.data.message).addClass('error');
		}
	}
};
