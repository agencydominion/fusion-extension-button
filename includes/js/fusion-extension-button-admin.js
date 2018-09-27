/**
 * WP Admin scripts for Fusion Extension - Button
 */

//init button
jQuery(document).ready(function() {
	jQuery('body').on('show.bs.modal', '#fsn_button_modal', function(e) {
		var buttonModal = jQuery(this);
		var selectLayoutElement = buttonModal.find('[name="button_layout"]');
		var selectedLayout = selectLayoutElement.val();
		buttonModal.attr('data-layout', selectedLayout);
	});
});

//update button function
jQuery(document).ready(function() {
	jQuery('body').on('change', 'select[name="button_layout"]', function(e) {
		fsnUpdateButton(e);
	});
});

function fsnUpdateButton(event) {
	var selectLayoutElement = jQuery(event.target);
	var selectedLayout = selectLayoutElement.val();
	var buttonModal = selectLayoutElement.closest('.modal');
	var currentLayout = buttonModal.attr('data-layout');
	if (currentLayout != '' && currentLayout != selectedLayout) {
		var r = confirm(fsnExtButtonL10n.layout_change);
		if (r == true) {
			buttonModal.attr('data-layout', selectedLayout);
			fsnUpdateButtonLayout(buttonModal);
		} else {
			selectLayoutElement.find('option[value="'+ currentLayout +'"]').prop('selected', true);
		}
	} else {
		buttonModal.attr('data-layout', selectedLayout);
		fsnUpdateButtonLayout(buttonModal);
	}
}

//update Button layout
function fsnUpdateButtonLayout(buttonModal) {
	var postID = jQuery('input#post_ID').val();
	var buttonLayout = buttonModal.find('[name="button_layout"]').val();

	var data = {
		action: 'button_load_layout',
		button_layout: buttonLayout,
		post_id: postID,
		security: fsnExtButtonJS.fsnEditButtonNonce
	};
	jQuery.post(ajaxurl, data, function(response) {
		if (response == '-1') {
			alert(fsnExtButtonL10n.error);
			return false;
		}

		buttonModal.find('.tab-pane .form-group.button-layout').remove();
		if (response !== null) {
			buttonModal.find('.tab-pane').each(function() {
				var tabPane = jQuery(this);
				if (tabPane.attr('data-section-id') == 'general') {
					tabPane.find('.form-group').first().after('<div class="layout-fields"></div>');
				} else {
					tabPane.prepend('<div class="layout-fields"></div>');
				}
			});
			for(i=0; i < response.length; i++) {
				buttonModal.find('.tab-pane[data-section-id="'+ response[i].section +'"] .layout-fields').append(response[i].output);
			}
			buttonModal.find('.tab-pane').each(function() {
				var tabPane = jQuery(this);
				tabPane.find('.button-layout').first().unwrap();
				tabPane.find('.layout-fields:empty').remove();
				//toggle panel tabs visibility
				var tabPaneId = tabPane.attr('id');
				if (tabPane.is(':empty')) {
					buttonModal.find('a[data-toggle="tab"][href="#'+ tabPaneId +'"]').parent('li').hide();
				} else {
					buttonModal.find('a[data-toggle="tab"][href="#'+ tabPaneId +'"]').parent('li').show();
				}
			});
		}
		var modalSelector = buttonModal;
		//reinit tinyMCE
		if (jQuery('#fsncontent').length > 0) {
			//make compatable with TinyMCE 4 which is used starting with WordPress 3.9
			if(tinymce.majorVersion === "4") {
				tinymce.execCommand('mceRemoveEditor', true, 'fsncontent');
            } else {
				tinymce.execCommand("mceRemoveControl", true, 'fsncontent');
            }
			var $element = jQuery('#fsncontent');
	        var qt, textfield_id = $element.attr("id"),
	            content = '';

	        window.tinyMCEPreInit.mceInit[textfield_id] = _.extend({}, tinyMCEPreInit.mceInit['content']);

	        if(_.isUndefined(tinyMCEPreInit.qtInit[textfield_id])) {
	            window.tinyMCEPreInit.qtInit[textfield_id] = _.extend({}, tinyMCEPreInit.qtInit['replycontent'], {id: textfield_id})
	        }
	        //$element.val($content_holder.val());
	        qt = quicktags( window.tinyMCEPreInit.qtInit[textfield_id] );
	        QTags._buttonsInit();
	        //make compatable with TinyMCE 4 which is used starting with WordPress 3.9
	        if(tinymce.majorVersion === "4") tinymce.execCommand( 'mceAddEditor', true, textfield_id );
	        window.switchEditors.go(textfield_id, 'tmce');
	        //focus on this RTE
	        tinyMCE.get('fsncontent').focus();
			//destroy tinyMCE
			modalSelector.on('hidden.bs.modal', function() {
				//make compatable with TinyMCE 4 which is used starting with WordPress 3.9
				if(tinymce.majorVersion === "4") {
					tinymce.execCommand('mceRemoveEditor', true, 'fsncontent');
                } else {
					tinymce.execCommand("mceRemoveControl", true, 'fsncontent');
                }
			});
		}
		//initialize color pickers
		jQuery('.fsn-color-picker').wpColorPicker();
		//set dependencies
		setDependencies(modalSelector);
		//trigger item added event
		jQuery('body').trigger('fsnButtonUpdated');
	});
}

//For select2 fields inside button items
jQuery(document).ready(function() {
	jQuery('body').on('fsnButtonUpdated', function(e) {
		fsnInitPostSelect();
	});
});
