/**
 * WP Admin scripts for Fusion Extension - Button
 */

//init button
jQuery(document).ready(function() {
	jQuery('body').on('show.bs.modal', '#fsn_button_modal', function(e) {
		var button = jQuery('#fsn_button_modal');
		var selectLayoutElement = jQuery('[name="button_layout"]');
		var selectedLayout = selectLayoutElement.val();
		
		button.attr('data-layout', selectedLayout);
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
	var button = jQuery('#fsn_button_modal');
	var currentLayout = button.attr('data-layout');
	if (currentLayout != '' && currentLayout != selectedLayout) {
		var r = confirm('Changing the Button Layout will erase the current Button. Continue?');
		if (r == true) {			
			button.attr('data-layout', selectedLayout);
			fsnUpdateButtonLayout();
		} else {
			selectLayoutElement.find('option[value="'+ currentLayout +'"]').prop('selected', true);
		}
	} else {
		button.attr('data-layout', selectedLayout);
		fsnUpdateButtonLayout();
	}
}

//update Button layout
function fsnUpdateButtonLayout() {
	
	var buttonLayout = jQuery('[name="button_layout"]').val();
	
	var data = {
		action: 'button_load_layout',
		button_layout: buttonLayout
	};
	jQuery.post(ajaxurl, data, function(response) {
		jQuery('#fsn_button_modal .tab-pane .form-group.button-layout').remove();
		if (response !== null) {
			jQuery('#fsn_button_modal .tab-pane').each(function() {
				var tabPane = jQuery(this);
				if (tabPane.attr('data-section-id') == 'general') {
					tabPane.find('.form-group').first().after('<div class="layout-fields"></div>');
				} else {
					tabPane.prepend('<div class="layout-fields"></div>');
				}
			});
			for(i=0; i < response.length; i++) {
				jQuery('#fsn_button_modal .tab-pane[data-section-id="'+ response[i].section +'"] .layout-fields').append(response[i].output);
			}
			jQuery('#fsn_button_modal .tab-pane').each(function() {
				var tabPane = jQuery(this);
				tabPane.find('.button-layout').first().unwrap();
				tabPane.find('.layout-fields:empty').remove();
			});
		}
		
		//reinit tinyMCE
		var modalSelector = jQuery('#fsn_button_modal');
		if (jQuery('#fsncontent').length > 0) {
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
		jQuery('.ad-color-picker').wpColorPicker();
		//set dependencies
		setDependencies(modalSelector);
		//trigger item added event
		jQuery('body').trigger('fsnButtonUpdated');
	});	
}

//For chosen fields inside button items
jQuery(document).ready(function() {	
	jQuery('body').on('fsnButtonUpdated', function(e) {
		jQuery('.chosen select').chosen({
			allow_single_deselect: true,
			width: '100%',
			placeholder_text_single : 'Choose an option.'
		});
	});
});