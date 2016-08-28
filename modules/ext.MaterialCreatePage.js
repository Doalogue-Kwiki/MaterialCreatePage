/**
 * JavaScript for MaterialCreatePage Menu
 */
( function ( mw, $ ) {
    
    function loadMaterialCreatePage(api) {
        
        var menu = mw.template.get( "ext.MaterialFAB", "menu.mustache" );		

		var createPageMenuData = {
			"menu-id" : "md-create-page-menu",
			"menu-location" : "br", // bottom-right ==> RTL ==> bottom-left
			"menu-toggle-event" : "hover",
			"main-button" : [{
				"href" : "#",
				"bg-color": "#d23f31",
				"label" : mw.msg('create-toggle-popup'),
				"resting-id" : "add_toggle",				
				"resting-class-icon" : "material-icons",
				"resting-icon" : "add",
				"active-id" : "create_toggle",				
				"active-class-icon" : "material-icons",
				"active-icon" : "create"
			}],			
			"menu-items": [
			{
				"id" : "upload_toggle",
				"href" : "#",
				"label" : mw.msg("upload-toggle-popup"),
				"bg-color" : "#2196F3",
				"class-icon" : "material-icons",
				"icon" : "cloud_upload"			
			},			
			{
				"id" : "files_toggle",
				"href" : "#",
				"label" : mw.msg("files-toggle-popup"),
				"bg-color" : "#4CAF50",
				"class-icon" : "material-icons",
				"icon" : "perm_media"			
			},
			{
				"id" : "categories_toggle",
				"href" : "#",
				"label" : mw.msg("categories-toggle-popup"),
				"bg-color" : "#ffc107",
				"class-icon" : "material-icons",
				"icon" : "style"			
			}]
		};
		
		var randeredMenu = menu.render(createPageMenuData);			
		$("#page-content").append(randeredMenu);
		
		$( document ).on( "click", "#create_toggle", function(e) {
			e.preventDefault();            
			loadApiData(api);
		});
    };
	
	function loadApiData(api) {
	
		var categoriesData = new Array();
		
		api.get( {
			formatversion: 2,
			action: 'query',
			prop: 'categories',
			aclimit: 5000,
			list: 'allcategories'
		} ).done( function ( res ) {
			var categories = res.query.allcategories;

			categories.map(function(item) {
				categoriesData.push( 
					new OO.ui.MenuOptionWidget( {
						data:  item.category,
						label: item.category,
					} )
				);
			});
			loadCreatePageModal(categoriesData, api);
		} );		
	};
	
	function apiCreatePageWithContext(api, pageTitle, content){
		
		var params = "";
		
		api.postWithEditToken( $.extend( {
			action: 'edit',
			title: pageTitle,
			text: content,
			formatversion: '2',

			// Protect against errors and conflicts
			assert: mw.user.isAnon() ? undefined : 'user',
			createonly: true
		}, params ) ).then( function () {			
			window.location.href = "/w/index.php?title=" + pageTitle + "&veaction=edit";
		} );					
	};
	
	function loadWikiTextFromPage(api, templateTitle, pageTitle, selectedCategoriesText) {
		var wikiText = "";
		var templateTitleText = templateTitle.toText();
		
		if (templateTitleText) {			
			api.get( {
				formatversion: 2,
				action: 'query',
				prop: 'revisions',
				titles: templateTitleText,
				rvprop: "content",
				rvexpandtemplates: true
			} ).done( function ( res ) {
				wikiText = res.query.pages[0].revisions[0].content;
			} ).done( function ( ) {
				var content = wikiText.concat(selectedCategoriesText);
				apiCreatePageWithContext(api, pageTitle, content);
			} );	
		}
		return wikiText;
	}
	
	function loadCreatePageModal(categoriesData, api) {
		
		var complexTitleInput = new mw.widgets.ComplexTitleInputWidget( {
			id: "title-and-namespace-input",
			title: {
				autofocus: true,
				placeholder: mw.msg("modal-title-input-placeholder"),
				indicator: 'required'		
			},
			namespace: {
				includeAllValue: "",
				dropdown: {
					icon: "code",
					label: mw.msg("modal-namespace-selector-label"),
					iconTitle: mw.msg("modal-namespace-selector-label")
				}
			}
		} );
		
		/*var namespaceSelector = new mw.widgets.NamespaceInputWidget( {
			includeAllValue: "all namespaces"
		} );*/
		
		var categoriesSelector = new OO.ui.CapsuleMultiSelectWidget( {
			id: "categoriesMultiSelector",
			allowArbitrary: true,
			icon: "tag",
			indicator: "down",
			iconTitle: mw.msg("modal-categories-selector-label"),
			supportsSimpleLabel: true,
			menu: {
				input: {
					placeholder: mw.msg("modal-categories-placeholder")
				},
				filterFromInput: true,
				items: categoriesData
			}			
		} );
		
		var templateSelector = new mw.widgets.TitleInputWidget( {
			id: "template-input",
			placeholder: mw.msg("modal-template-placeholder"),
			icon: 'search',
			iconTitle: mw.msg("modal-template-placeholder")
		} );
		
		var fieldset = new OO.ui.FieldsetLayout( {
			items: [
				new OO.ui.FieldLayout( complexTitleInput, {
					id: "modal-title-fieldset",
					label: mw.msg("modal-title-input-label"),
					classes: ['materialFieldset'],
					align: 'top'
				} ),
				new OO.ui.FieldLayout( categoriesSelector, {
					id: "modal-categories-fieldset",
					label: mw.msg("modal-categories-selector-label"),
					classes: ['materialFieldset'],
					align: 'top'
				} ),
				/*new OO.ui.FieldLayout( namespaceSelector, {
					id: "modal-namespace-fieldset",
					label: mw.msg("modal-namespace-selector-label"),
					classes: ['materialFieldset'],
					align: 'top'
				} ),*/
				new OO.ui.FieldLayout( templateSelector, {
					id: "modal-template-fieldset",
					label: mw.msg("modal-template-selector-label"),
					classes: ['materialFieldset'],
					align: 'top'
				} )
			]
		} );
				
		var dialogActionButtons = [ {
			id: "model-create-button",
			action: 'add',
			framed: false,				
			icon: 'add',
			label: mw.msg("modal-create-page-button"),
			iconTitle: mw.msg("modal-create-page-button"),
			flags: [ 'other', 'progressive' ] 
		},
		{ 
			id: "model-close-button",
			action: 'close',
			framed: false,
			icon: 'close',
			iconTitle: mw.msg("modal-close-button"),
			flags: 'safe' 
		} ];

		var dialogTitle = mw.msg("modal-create-page-title");
		var dialogHeight = 500;
		var materialDialog = CreateMaterialDialog( fieldset, dialogActionButtons, dialogTitle, dialogHeight );
				
		materialDialog.getActionProcess = function ( action ) {
			var dialog = this;

			if ( action === 'create' ) {
				return new OO.ui.Process( function () {	
				
					var titleObj = complexTitleInput.title.getTitle();
					
					if( titleObj && !titleObj.exists() )
					{
						var selectedCategoriesText = "";
						var selectedCategories = categoriesSelector.getItemsData();
						selectedCategories.forEach( function(item) {
							selectedCategoriesText += "\n" + "[[category:" + item.toString() + "]]";
						} );
						
						var templateTitle = templateSelector.getTitle();
						var pageTitle = titleObj.toText();
						loadWikiTextFromPage(api, templateTitle, pageTitle, selectedCategoriesText);
						mw.notify(mw.msg("created-successfully"));
						dialog.close();						
					}
					else{
						mw.notify("please enter page title!");
					}
				} );
			} else if ( action === 'close' ) {
				
				return new OO.ui.Process( function () {					
					dialog.close();
				} );
			}
			return materialDialog.parent.getActionProcess.call( this, action );
		};
	};	
	
    $( function () {
		var api = new mw.Api();
        loadMaterialCreatePage(api);		
    });

}( mediaWiki, jQuery ) );
