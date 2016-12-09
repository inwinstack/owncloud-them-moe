/**
 * ownCloud
 *
 * @author Bartek Przybylski, Christopher Schäpers, Thomas Tanghus
 * @copyright 2012 Bartek Przybylski bartek@alefzero.eu
 *
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU AFFERO GENERAL PUBLIC LICENSE
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or any later version.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU AFFERO GENERAL PUBLIC LICENSE for more details.
 *
 * You should have received a copy of the GNU Affero General Public
 * License along with this library.  If not, see <http://www.gnu.org/licenses/>.
 *
 */

/* global alert */

/**
 * this class to ease the usage of jquery dialogs
 * @lends OC.dialogs
 */
var OCdialogs = {
	// dialog button types
	YES_NO_BUTTONS:		70,
	OK_BUTTONS:		71,
	// used to name each dialog
	dialogsCounter: 0,
	conflictLength: null,
  dataQueue: [],
  originalQueue: [],
  replacementQueue: [],
  newname: null,
  allfiles_checked: false,
  _fileexistsshown: false,

	/**
	* displays alert dialog
	* @param text content of dialog
	* @param title dialog title
	* @param callback which will be triggered when user presses OK
	* @param modal make the dialog modal
	*/
	alert:function(text, title, callback, modal) {
		this.message(
			text,
			title,
			'alert',
			OCdialogs.OK_BUTTON,
			callback,
			modal
		);
	},
	/**
	* displays info dialog
	* @param text content of dialog
	* @param title dialog title
	* @param callback which will be triggered when user presses OK
	* @param modal make the dialog modal
	*/
	info:function(text, title, callback, modal) {
		this.message(text, title, 'info', OCdialogs.OK_BUTTON, callback, modal);
	},
	/**
	* displays confirmation dialog
	* @param text content of dialog
	* @param title dialog title
	* @param callback which will be triggered when user presses YES or NO
	*        (true or false would be passed to callback respectively)
	* @param modal make the dialog modal
	*/
	confirm:function(text, title, callback, modal) {
		return this.message(
			text,
			title,
			'notice',
			OCdialogs.YES_NO_BUTTONS,
			callback,
			modal
		);
	},

	/**
	 * displays prompt dialog
	 * @param text content of dialog
	 * @param title dialog title
	 * @param callback which will be triggered when user presses YES or NO
	 *        (true or false would be passed to callback respectively)
	 * @param modal make the dialog modal
	 * @param name name of the input field
	 * @param password whether the input should be a password input
	 */
	prompt: function (text, title, callback, modal, name, password) {
		return $.when(this._getMessageTemplate()).then(function ($tmpl) {
			var dialogName = 'oc-dialog-' + OCdialogs.dialogsCounter + '-content';
			var dialogId = '#' + dialogName;
			var $dlg = $tmpl.octemplate({
				dialog_name: dialogName,
				title      : title,
				message    : text,
				type       : 'notice'
			});
			var input = $('<input/>');
			input.attr('type', password ? 'password' : 'text').attr('id', dialogName + '-input');
			var label = $('<label/>').attr('for', dialogName + '-input').text(name + ': ');
			$dlg.append(label);
			$dlg.append(input);
			if (modal === undefined) {
				modal = false;
			}
			$('body').append($dlg);
			var buttonlist = [{
					text : t('core', 'No'),
					click: function () {
						if (callback !== undefined) {
							callback(false, input.val());
						}
						$(dialogId).ocdialog('close');
					}
				}, {
					text         : t('core', 'Yes'),
					click        : function () {
						if (callback !== undefined) {
							callback(true, input.val());
						}
						$(dialogId).ocdialog('close');
					},
					defaultButton: true
				}
			];

			$(dialogId).ocdialog({
				closeOnEscape: true,
				modal        : modal,
				buttons      : buttonlist
			});
			OCdialogs.dialogsCounter++;
		});
	},
	/**
	 * show a file picker to pick a file from
	 * @param title dialog title
	 * @param callback which will be triggered when user presses Choose
	 * @param multiselect whether it should be possible to select multiple files
	 * @param mimetypeFilter mimetype to filter by - directories will always be included
	 * @param modal make the dialog modal
	*/
	filepicker:function(title, callback, multiselect, mimetypeFilter, modal) {
		var self = this;
		// avoid opening the picker twice
		if (this.filepicker.loading) {
			return;
		}
		this.filepicker.loading = true;
		$.when(this._getFilePickerTemplate()).then(function($tmpl) {
			self.filepicker.loading = false;
			var dialogName = 'oc-dialog-filepicker-content';
			if(self.$filePicker) {
				self.$filePicker.ocdialog('close');
			}
			self.$filePicker = $tmpl.octemplate({
				dialog_name: dialogName,
				title: title
			}).data('path', '').data('multiselect', multiselect).data('mimetype', mimetypeFilter);

			if (modal === undefined) {
				modal = false;
			}
			if (multiselect === undefined) {
				multiselect = false;
			}
			if (mimetypeFilter === undefined) {
				mimetypeFilter = '';
			}

			$('body').append(self.$filePicker);


			self.$filePicker.ready(function() {
				self.$filelist = self.$filePicker.find('.filelist');
				self.$dirTree = self.$filePicker.find('.dirtree');
				self.$dirTree.on('click', 'span:not(:last-child)', self, self._handleTreeListSelect);
				self.$filelist.on('click', 'li', function(event) {
					self._handlePickerClick(event, $(this));
				});
				self._fillFilePicker('');
			});

			// build buttons
			var functionToCall = function() {
				if (callback !== undefined) {
					var datapath;
					if (multiselect === true) {
						datapath = [];
						self.$filelist.find('.filepicker_element_selected .filename').each(function(index, element) {
							datapath.push(self.$filePicker.data('path') + '/' + $(element).text());
						});
					} else {
						datapath = self.$filePicker.data('path');
						datapath += '/' + self.$filelist.find('.filepicker_element_selected .filename').text();
					}
					callback(datapath);
					self.$filePicker.ocdialog('close');
				}
			};
			var buttonlist = [{
				text: t('core', 'Choose'),
				click: functionToCall,
				defaultButton: true
			}];

			self.$filePicker.ocdialog({
				closeOnEscape: true,
				// max-width of 600
				width: Math.min((4/5)*$(document).width(), 600),
				height: 420,
				modal: modal,
				buttons: buttonlist,
				close: function() {
					try {
						$(this).ocdialog('destroy').remove();
					} catch(e) {}
					self.$filePicker = null;
				}
			});
			if (!OC.Util.hasSVGSupport()) {
				OC.Util.replaceSVG(self.$filePicker.parent());
			}
		})
		.fail(function(status, error) {
			// If the method is called while navigating away
			// from the page, it is probably not needed ;)
			self.filepicker.loading = false;
			if(status !== 0) {
				alert(t('core', 'Error loading file picker template: {error}', {error: error}));
			}
		});
	},
	/**
	 * Displays raw dialog
	 * You better use a wrapper instead ...
	*/
	message:function(content, title, dialogType, buttons, callback, modal) {
		return $.when(this._getMessageTemplate()).then(function($tmpl) {
			var dialogName = 'oc-dialog-' + OCdialogs.dialogsCounter + '-content';
			var dialogId = '#' + dialogName;
			var $dlg = $tmpl.octemplate({
				dialog_name: dialogName,
				title: title,
				message: content,
				type: dialogType
			});
			if (modal === undefined) {
				modal = false;
			}
			$('body').append($dlg);
			var buttonlist = [];
			switch (buttons) {
			case OCdialogs.YES_NO_BUTTONS:
				buttonlist = [{
					text: t('core', 'No'),
					click: function(){
						if (callback !== undefined) {
							callback(false);
						}
						$(dialogId).ocdialog('close');
					}
				},
				{
					text: t('core', 'Yes'),
					click: function(){
						if (callback !== undefined) {
							callback(true);
						}
						$(dialogId).ocdialog('close');
					},
					defaultButton: true
				}];
				break;
			case OCdialogs.OK_BUTTON:
				var functionToCall = function() {
					$(dialogId).ocdialog('close');
					if(callback !== undefined) {
						callback();
					}
				};
				buttonlist[0] = {
					text: t('core', 'Ok'),
					click: functionToCall,
					defaultButton: true
				};
				break;
			}

			$(dialogId).ocdialog({
				closeOnEscape: true,
				modal: modal,
				buttons: buttonlist
			});
			OCdialogs.dialogsCounter++;
		})
		.fail(function(status, error) {
			// If the method is called while navigating away from
			// the page, we still want to deliver the message.
			if(status === 0) {
				alert(title + ': ' + content);
			} else {
				alert(t('core', 'Error loading message template: {error}', {error: error}));
			}
		});
	},

	/**
	 * Displays file exists dialog
	 * @param {object} data upload object
	 * @param {object} original file with name, size and mtime
	 * @param {object} replacement file with name, size and mtime
	 * @param {object} controller with onCancel, onSkip, onReplace and onRename methods
	 * @return {Promise} jquery promise that resolves after the dialog template was loaded
	*/
	fileexists:function(data, original, replacement, controller) {
		var self = this;
		var dialogDeferred = new $.Deferred();

		var getCroppedPreview = function(file) {
			var deferred = new $.Deferred();
			// Only process image files.
			var type = file.type && file.type.split('/').shift();
			if (window.FileReader && type === 'image') {
				var reader = new FileReader();
				reader.onload = function (e) {
					var blob = new Blob([e.target.result]);
					window.URL = window.URL || window.webkitURL;
					var originalUrl = window.URL.createObjectURL(blob);
					var image = new Image();
					image.src = originalUrl;
					image.onload = function () {
						var url = crop(image);
						deferred.resolve(url);
					};
				};
				reader.readAsArrayBuffer(file);
			} else {
				deferred.reject();
			}
			return deferred;
		};

		var crop = function(img) {
			var canvas = document.createElement('canvas'),
					targetSize = 96,
					width = img.width,
					height = img.height,
					x, y, size;

			// Calculate the width and height, constraining the proportions
			if (width > height) {
				y = 0;
				x = (width - height) / 2;
			} else {
				y = (height - width) / 2;
				x = 0;
			}
			size = Math.min(width, height);

			// Set canvas size to the cropped area
			canvas.width = size;
			canvas.height = size;
			var ctx = canvas.getContext("2d");
			ctx.drawImage(img, x, y, size, size, 0, 0, size, size);

			// Resize the canvas to match the destination (right size uses 96px)
			resampleHermite(canvas, size, size, targetSize, targetSize);

			return canvas.toDataURL("image/png", 0.7);
		};

		/**
		 * Fast image resize/resample using Hermite filter with JavaScript.
		 *
		 * @author: ViliusL
		 *
		 * @param {*} canvas
		 * @param {number} W
		 * @param {number} H
		 * @param {number} W2
		 * @param {number} H2
		 */
		var resampleHermite = function (canvas, W, H, W2, H2) {
			W2 = Math.round(W2);
			H2 = Math.round(H2);
			var img = canvas.getContext("2d").getImageData(0, 0, W, H);
			var img2 = canvas.getContext("2d").getImageData(0, 0, W2, H2);
			var data = img.data;
			var data2 = img2.data;
			var ratio_w = W / W2;
			var ratio_h = H / H2;
			var ratio_w_half = Math.ceil(ratio_w / 2);
			var ratio_h_half = Math.ceil(ratio_h / 2);

			for (var j = 0; j < H2; j++) {
				for (var i = 0; i < W2; i++) {
					var x2 = (i + j * W2) * 4;
					var weight = 0;
					var weights = 0;
					var weights_alpha = 0;
					var gx_r = 0;
					var gx_g = 0;
					var gx_b = 0;
					var gx_a = 0;
					var center_y = (j + 0.5) * ratio_h;
					for (var yy = Math.floor(j * ratio_h); yy < (j + 1) * ratio_h; yy++) {
						var dy = Math.abs(center_y - (yy + 0.5)) / ratio_h_half;
						var center_x = (i + 0.5) * ratio_w;
						var w0 = dy * dy; //pre-calc part of w
						for (var xx = Math.floor(i * ratio_w); xx < (i + 1) * ratio_w; xx++) {
							var dx = Math.abs(center_x - (xx + 0.5)) / ratio_w_half;
							var w = Math.sqrt(w0 + dx * dx);
							if (w >= -1 && w <= 1) {
								//hermite filter
								weight = 2 * w * w * w - 3 * w * w + 1;
								if (weight > 0) {
									dx = 4 * (xx + yy * W);
									//alpha
									gx_a += weight * data[dx + 3];
									weights_alpha += weight;
									//colors
									if (data[dx + 3] < 255)
										weight = weight * data[dx + 3] / 250;
									gx_r += weight * data[dx];
									gx_g += weight * data[dx + 1];
									gx_b += weight * data[dx + 2];
									weights += weight;
								}
							}
						}
					}
					data2[x2] = gx_r / weights;
					data2[x2 + 1] = gx_g / weights;
					data2[x2 + 2] = gx_b / weights;
					data2[x2 + 3] = gx_a / weights_alpha;
				}
			}
			canvas.getContext("2d").clearRect(0, 0, Math.max(W, W2), Math.max(H, H2));
			canvas.width = W2;
			canvas.height = H2;
			canvas.getContext("2d").putImageData(img2, 0, 0);
		};
   
    var Autorename = function(originalname, directory) {
      return $.ajax({
        method: 'POST',
        async: false,
        url: OC.filePath('files', 'ajax', 'upload.php'),
        data: {
          action: 'autorename',
          originalname: originalname,
          directory: directory
        }
      });
    }

    var getPermission = function(filename, directory) {
      return $.ajax({
        method: 'GET',
        url: OC.filePath('files_sharing', 'ajax', 'sharepermission.php'),
        data: {
          dir: directory,
          file: filename
        }
      });
    } 


    var showdialog = function(original, replacement, data) {
      $.when(OC.dialogs._getFileExistsTemplate()).then(function($tmpl) {

        var dialogName = 'oc-dialog-fileexists-content';
		    var dialogId = '#' + dialogName;
				var title = t('core','file conflict');
				var $dlg = $tmpl.octemplate({
					dialog_name: dialogName,
					title: title,
					type: 'fileexists',
          
					allfiles: t('core','Apply this action to all files'),
          allnewfiles: t('core','New Files'),
					allexistingfiles: t('core','Already existing files'),
					why: t('core','Which files do you want to keep?'),
          rename: t('core', 'Rename')
				});
				$('body').append($dlg);
        
				if (original && replacement) {
					var $conflicts = $dlg.find('.conflicts');
          $dlg.find('.originfilename').text(original.name);
					addConflict($conflicts, original, replacement);

          if('mountType' in original) {
            getPermission(original.name, original.directory).done(function(data) {
              !data.writeable && $('.fourbuttons .replace').prop('disabled', true);

            });
          }

          
				}       
        /**
         * modifed dialog when allfiles checked and click rename func
         * @Dialogaram
         * @data
         **/

        var renamefunc = function(Dialogparam, data) {
          $('.buttonrow-tooltip').hide();
          $('.fourbuttons').hide();

          if(!$('.twobuttons').length) {
            
            var div = $('<div>').addClass('oc-dialog-buttonrow twobuttons');

            div.append($('#newname'));

            !Dialogparam.allfiles_checked && div.append($('<button class="back">').text(t('core', 'Back')));
            Dialogparam.allfiles_checked && div.append($('<button class="cancel">').text(t('core', 'Skip')));
            div.append($('<button class="rename">').text(t('core', 'Submit')));
          } else {

            $('.twobuttons').show();

          }

          if(FileList.inList($('#newname').val())) {
            
            $('.twobuttons .rename').prop('disabled',true);
          
          } else {
            
            $('.twobuttons .rename').prop('disabled',false);
         
          }

          $(dialogId).after(div);
          $('.twobuttons button').on('click', function() {

            if($(this).hasClass('back')) {
              $('.twobuttons').hide();
              Dialogparam.conflictLength > 0 && $('.buttonrow-tooltip').show();
              $('.rename').removeClass('primary');
              $('.fourbuttons').show();
            } else if($(this).hasClass('rename')){
              if ( typeof controller.onRename !== 'undefined') {
                controller.onRename(data, $('#newname').val());
              }

              $('.twobuttons').remove();

              var nextoriginal = Dialogparam.originalQueue.shift();
              var nextreplacement = Dialogparam.replacementQueue.shift();
              var nextdata = Dialogparam.dataQueue.shift();

              $(dialogId).ocdialog('close');
              $(dialogId).remove();
              nextdata && showdialog(nextoriginal, nextreplacement, nextdata);
            } else {
              if ( typeof controller.onCancel !== 'undefined') {
								controller.onCancel(data);
							}
							$(dialogId).ocdialog('close');
              $(dialogId).remove();
              Dialogparam.dataQueue = [];
              Dialogparam.originalQueue = [];
              Dialogparam.replacementQueue = [];
            
            }

          });
        }


				var buttonlist = [{
            text: t('core', 'Rename'),
            classes: 'rename',

            click: function() {

              renamefunc(self, data);
            }
          
          },
          {
						text: t('core', 'Auto Rename'),
						classes: 'autorename',
						click: function() {
              var checked = $('#allfiles').prop('checked');

              if(checked) {
                var length = self.dataQueue.length;

                controller.onAutorename(data);
                for(var i=0; i < length; i++) {
                  var value = self.dataQueue.shift();
                  value && controller.onAutorename(value);
                }

                $(dialogId).ocdialog('close');
                $(dialogId).remove();


              } else { 
                typeof controller.onAutorename !== 'undefined' && controller.onAutorename(data);

                var nextoriginal = self.originalQueue.shift();
                var nextreplacement = self.replacementQueue.shift();
                var nextdata = self.dataQueue.shift();
                
                $(dialogId).ocdialog('close');
                $(dialogId).remove();
                nextdata && showdialog(nextoriginal, nextreplacement, nextdata);
              } 
						}
					},
          {
            text: t('core', 'Replace'),
						classes: 'replace',
						
            click: function() {
              var checked = $('#allfiles').prop('checked');

              if(!checked) {
                
                typeof controller.onReplace !== 'undefined' && controller.onReplace(data);

                var nextoriginal = self.originalQueue.shift();
                var nextreplacement = self.replacementQueue.shift();
                var nextdata = self.dataQueue.shift();
                
                $(dialogId).ocdialog('close');
                $(dialogId).remove();
                nextdata && showdialog(nextoriginal, nextreplacement, nextdata);
                
              } else {
                var length = self.dataQueue.length;

                controller.onReplace(data);
                for(var i=0; i < length; i++) {
                  var value = self.dataQueue.shift();
                  value && controller.onReplace(value);
                }

                $(dialogId).ocdialog('close');
                $(dialogId).remove();
							}

            }
 
          },
          {
						text: t('core', 'Skip'),
						classes: 'skip',
						
            click: function() {
              var checked = $('#allfiles').prop('checked');

              if(data === null) {
                data = self.dataQueue.shift();
              }
              if(!checked) {
                  
								typeof controller.onSkip !== 'undefined' && controller.onSkip(data);

                var nextoriginal = self.originalQueue.shift();
                var nextreplacement = self.replacementQueue.shift();
                var nextdata = self.dataQueue.shift();
                $(dialogId).ocdialog('close');
                $(dialogId).remove();

                nextdata && showdialog(nextoriginal, nextreplacement, nextdata);

                
              } else {
                
                $(dialogId).ocdialog('close');
                $(dialogId).remove();
                self.dataQueue = [];
                self.originalQueue = [];
                self.replacementQueue = [];

							}
              
            }
					}];
				$(dialogId).ocdialog({
					width: 500,
					closeOnEscape: true,
					modal: true,
					buttons: buttonlist,
					closeButton: null,
					close: function() {
							self._fileexistsshown = false;
							//$(this).ocdialog('destroy').remove();
					},
        });


				$(dialogId).css('height','auto');
        var tooltip = $('<div class="buttonrow-tooltip">');
        
        tooltip.append('<input type="checkbox" id="allfiles">');
        tooltip.append('<label for="allfiles">'+t('core', 'All use this choice')+'</label>');
        $('.fourbuttons').after(tooltip);

        self.conflictLength === 1 && $('.buttonrow-tooltip').hide();
        self.conflictLength--;
        if(self.allfiles_checked) {
          renamefunc(self, data);
        }

     
        $('#allfiles').click(function() {
          var checked = $(this).prop('checked');
          
          self.allfiles_checked  = checked;

        });

        $(dialogId).find('#newname').on('input', function() {
          var input = $(this).val();

          if(FileList.inList(input)) {
           // $(this).after($('<small class="error-tooltip">').css({'color':'red', 'padding-left' :'148px'}).text(t('core', 'This filename already exists.'))).after('<br>');
            $(this).css({'color':'red', 'border-color': 'red'});
            $('.twobuttons .rename').prop('disabled',true);
          } else {
            $('th br').remove();
            //$('.error-tooltip').remove();
            $(this).css({'color': '', 'border-color': ''});
            $('.twobuttons .rename').prop('disabled',false);
          }

        });
        
        dialogDeferred.resolve();
			})
			.fail(function() {
				dialogDeferred.reject();
				alert(t('core', 'Error loading file exists template'));
			});

    };
  

    var dateHandler = function(date) {
      var year = ''+date.getFullYear();
      var month = (date.getMonth()+1) < 10 ? '0'+(date.getMonth()+1) : ''+(date.getMonth()+1);
      var day = date.getDate() <10 ? '0' + date.getDate() : ''+date.getDate();
      var hour = (date.getHours()+1) < 10 ? '0'+(date.getHours()+1) : ''+(date.getHours()+1);
      var minute = date.getMinutes() < 10 ? '0'+date.getMinutes() : ''+date.getMinutes();
      var sec = date.getSeconds() < 10 ? '0'+date.getSeconds() : ''+date.getSeconds();
      
      return {
        'day': year+'/'+month+'/'+day,
        'time': hour+':'+minute+':'+sec
      };

    }

    var addConflict = function($conflicts, original, replacement) {

			var $conflict = $conflicts.find('.template').clone().removeClass('template').addClass('conflict');
			var $originalDiv = $conflict.find('.original');
			var $replacementDiv = $conflict.find('.replacement');


			$originalDiv.find('.size').text(t('core', 'Size : ')+humanFileSize(original.size));
			//$originalDiv.find('.mtime').text(formatDate(original.mtime));
      var oridate = dateHandler(new Date(original.mtime));
      $originalDiv.find('.mtime .day').text(t('core', 'Day : ')+oridate.day); 
      $originalDiv.find('.mtime .time').text(t('core', 'Time : ')+oridate.time); 

			// ie sucks
			if (replacement.lastModifiedDate) {
				$replacementDiv.find('.size').text(t('core', 'Size : ')+humanFileSize(replacement.size));
				//$replacementDiv.find('.mtime').text(formatDate(replacement.lastModifiedDate));

        var rpldate = dateHandler(new Date());
				$replacementDiv.find('.mtime .day').text(t('core', 'Day : ')+rpldate.day);
				$replacementDiv.find('.mtime .time').text(t('core', 'Time : ')+rpldate.time);
			}

			$conflicts.append($conflict);
            
/*
			//set more recent mtime bold
			// ie sucks
			if (replacement.lastModifiedDate && replacement.lastModifiedDate.getTime() > original.mtime) {
				$replacementDiv.find('.mtime').css('font-weight', 'bold');
			} else if (replacement.lastModifiedDate && replacement.lastModifiedDate.getTime() < original.mtime) {
				$originalDiv.find('.mtime').css('font-weight', 'bold');
			} else {
				//TODO add to same mtime collection?
			}

      //set bigger size bold
			if (replacement.size && replacement.size > original.size) {
				$replacementDiv.find('.size').css('font-weight', 'bold');
			} else if (replacement.size && replacement.size < original.size) {
				$originalDiv.find('.size').css('font-weight', 'bold');
			} else {
				//TODO add to same size collection?
			}
*/
			//TODO show skip action for files with same size and mtime in bottom row

			// always keep readonly files

			if (original.status === 'readonly') {
				$originalDiv
					.addClass('readonly')
					.find('input[type="checkbox"]')
						.prop('checked', true)
						.prop('disabled', true);
				$originalDiv.find('.message')
					.text(t('core','read-only'))
			}
      
      Autorename($(' .originfilename').text(), FileList.getCurrentDirectory()) .done(function(data) {
        matches = data.match(/.*\/(.*)"/);
        $('#newname').attr({value: unescape(matches[1].replace(/\\/g, "%"))});
        newname = unescape(matches[1].replace(/\\/g, "%"));
      });

    };
		//var selection = controller.getSelection(data.originalFiles);
		//if (selection.defaultAction) {
		//	controller[selection.defaultAction](data);
		//} else {
    var dialogName = 'oc-dialog-fileexists-content';
		var dialogId = '#' + dialogName;
    if(self._fileexistsshown) {
      this.dataQueue.push(data);
      this.originalQueue.push(original);
      this.replacementQueue.push(replacement);

    } else {
      
      this._fileexistsshown = true;
      this.allfiles_checked = false;
      showdialog(original,replacement,data);
    }
    
    


		//}
		return dialogDeferred.promise();
	},
	_getFilePickerTemplate: function() {
		var defer = $.Deferred();
		if(!this.$filePickerTemplate) {
			var self = this;
			$.get(OC.filePath('core', 'templates', 'filepicker.html'), function(tmpl) {
				self.$filePickerTemplate = $(tmpl);
				self.$listTmpl = self.$filePickerTemplate.find('.filelist li:first-child').detach();
				defer.resolve(self.$filePickerTemplate);
			})
			.fail(function(jqXHR, textStatus, errorThrown) {
				defer.reject(jqXHR.status, errorThrown);
			});
		} else {
			defer.resolve(this.$filePickerTemplate);
		}
		return defer.promise();
	},
	_getMessageTemplate: function() {
		var defer = $.Deferred();
		if(!this.$messageTemplate) {
			var self = this;
			$.get(OC.filePath('core', 'templates', 'message.html'), function(tmpl) {
				self.$messageTemplate = $(tmpl);
				defer.resolve(self.$messageTemplate);
			})
			.fail(function(jqXHR, textStatus, errorThrown) {
				defer.reject(jqXHR.status, errorThrown);
			});
		} else {
			defer.resolve(this.$messageTemplate);
		}
		return defer.promise();
	},
	_getFileExistsTemplate: function () {
		var defer = $.Deferred();
		if (!this.$fileexistsTemplate) {
			var self = this;
			$.get(OC.generateUrl('themes/MOE/apps/files/templates/fileexists.html').replace(/index.php\//g, ''), function (tmpl) {
				self.$fileexistsTemplate = $(tmpl);
				defer.resolve(self.$fileexistsTemplate);
			})
			.fail(function () {
				defer.reject();
			});
		} else {
			defer.resolve(this.$fileexistsTemplate);
		}
		return defer.promise();
	},
	_getFileList: function(dir, mimeType) {
		if (typeof(mimeType) === "string") {
			mimeType = [mimeType];
		}

		return $.getJSON(
			OC.filePath('files', 'ajax', 'list.php'),
			{
				dir: dir,
				mimetypes: JSON.stringify(mimeType)
			}
		);
	},

	/**
	 * fills the filepicker with files
	*/
	_fillFilePicker:function(dir) {
		var dirs = [];
		var others = [];
		var self = this;
		this.$filelist.empty().addClass('loading');
		this.$filePicker.data('path', dir);
		$.when(this._getFileList(dir, this.$filePicker.data('mimetype'))).then(function(response) {
			$.each(response.data.files, function(index, file) {
				if (file.type === 'dir') {
					dirs.push(file);
				} else {
					others.push(file);
				}
			});

			self._fillSlug();
			var sorted = dirs.concat(others);

			$.each(sorted, function(idx, entry) {
				var $li = self.$listTmpl.octemplate({
					type: entry.type,
					dir: dir,
					filename: entry.name,
					date: OC.Util.relativeModifiedDate(entry.mtime)
				});
				if (entry.isPreviewAvailable) {
					var urlSpec = {
						file: dir + '/' + entry.name
					};
					var previewUrl = OC.generateUrl('/core/preview.png?') + $.param(urlSpec);
					$li.find('img').attr('src', previewUrl);
				}
				else {
					$li.find('img').attr('src', OC.Util.replaceSVGIcon(entry.icon));
				}
				self.$filelist.append($li);
			});

			self.$filelist.removeClass('loading');
			if (!OC.Util.hasSVGSupport()) {
				OC.Util.replaceSVG(self.$filePicker.find('.dirtree'));
			}
		});
	},
	/**
	 * fills the tree list with directories
	*/
	_fillSlug: function() {
		this.$dirTree.empty();
		var self = this;
		var path = this.$filePicker.data('path');
		var $template = $('<span data-dir="{dir}">{name}</span>');
		if(path) {
			var paths = path.split('/');
			$.each(paths, function(index, dir) {
				dir = paths.pop();
				if(dir === '') {
					return false;
				}
				self.$dirTree.prepend($template.octemplate({
					dir: paths.join('/') + '/' + dir,
					name: dir
				}));
			});
		}
		$template.octemplate({
			dir: '',
			name: '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' // Ugly but works ;)
		}, {escapeFunction: null}).addClass('home svg').prependTo(this.$dirTree);
	},
	/**
	 * handle selection made in the tree list
	*/
	_handleTreeListSelect:function(event) {
		var self = event.data;
		var dir = $(event.target).data('dir');
		self._fillFilePicker(dir);
	},
	/**
	 * handle clicks made in the filepicker
	*/
	_handlePickerClick:function(event, $element) {
		if ($element.data('type') === 'file') {
			if (this.$filePicker.data('multiselect') !== true || !event.ctrlKey) {
				this.$filelist.find('.filepicker_element_selected').removeClass('filepicker_element_selected');
			}
			$element.toggleClass('filepicker_element_selected');
		} else if ( $element.data('type') === 'dir' ) {
			this._fillFilePicker(this.$filePicker.data('path') + '/' + $element.data('entryname'));
		}
	},

};
