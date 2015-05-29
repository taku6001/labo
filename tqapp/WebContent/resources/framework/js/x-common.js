/*
 * object - オブジェクトを作る
 * Object object(BaseObj [, mixinObj1 [, mixinObj2...]])
 */
function object(o) {
  var f = object.f, i, len, n, prop;
  f.prototype = o;
  n = new f;
  for (i=1, len=arguments.length; i<len; ++i)
    for (prop in arguments[i])
      n[prop] = arguments[i][prop];
  return n;
}
object.f = function(){};

//IE8だと配列のindexOfが使用できないので、ArrayにindexOfが実装されていない場合は同等な処理を組み込む
if (!Array.indexOf) {
	Array.prototype.indexOf = function(o) {
		for (var i in this) {
			if (this[i] == o) {
				return i;
			}
		}
		return -1;
	};
}

//IE8だとデバッグモードでないとconsoleオブジェクトが使用できないので。
if (!('console' in window)) {
	// windowオブジェクトにconsoleオブジェクトを作成
	window.console = {};
	// 作ったconsoleオブジェクトに更に引数をそのまま返すlogオブジェクトを作成
	window.console.log = function(str){return str;};
}
//フォーカス位置を保持
var _x_current_id = null;

$(function(){
	//非同期アクセス中は他のボタン操作をさせないようオーバーレイを埋め込む
	$('<div id="x-wait-overlay" class="ui-widget-overlay"></div>').hide().appendTo('body');

	//JSF非同期処理eventの制御
	try{
		jsf.ajax.addOnEvent(function(event) {
			switch (event.status) {
				case "begin":
					_x_current_id = $(":focus").attr("id");
					event.source.disabled = true;
					$("#x-wait-overlay").show();
					break;
				case "complete":
					event.source.disabled = false;
					$("#x-wait-overlay").fadeOut();
					break;
				case "success":
					//resizeイベントを発生させSlickGrid等のサイズ調整
					$(window).trigger("resize");
					//非同期処理後のフォーカス位置
					$("#"+_x_current_id).focus();
					break;
			}	
		});	
		//jsf.ajax.addOnEvent(function(event){});
	}catch(e){}
});

// Place any jQuery/helper plugins in here.

function getContextPath() {
	return window.location.pathname.substring(0, window.location.pathname.indexOf("/",2));
}

/*
 * オブジェクトをJSON文字列に変換する。
 * ※JSON文字列をオブジェクトに変換する場合はjQuery標準のparseJSONを使う。
 * json = $.stringify(obj);
 * obj  = $.parseJSON(json);
 */
jQuery.extend({
	stringify : function stringify(obj) {
		var t = typeof (obj);
		if (t != "object" || obj === null) {
			// simple data type
			if (t == "string") obj = '"' + obj + '"';
			return String(obj);
		} else {
			// recurse array or object
			var v, json = [], arr = (obj && obj.constructor == Array);
 
			for (var n in obj) {
				v = obj[n];
				t = typeof(v);
				if (obj.hasOwnProperty(n)) {
					if (t == "string") v = '"' + v + '"'; else if (t == "object" && v !== null) v = jQuery.stringify(v);
					json.push((arr ? "" : '"' + n + '":') + String(v));
				}
			}
			return (arr ? "[" : "{") + String(json) + (arr ? "]" : "}");
		}
	}
});

/* 
 * ============================================================================
 * jQuery UIのDatePickerを日本語化
 * [jquery.ui.datepicker-ja.js] の内容をコピペ 
 * ============================================================================
 */
/* Japanese initialisation for the jQuery UI date picker plugin. */
/* Written by Kentaro SATO (kentaro@ranvis.com). */
jQuery(function($){
	$.datepicker.regional['ja'] = {
		closeText: '閉じる',
		prevText: '&#x3C;前',
		nextText: '次&#x3E;',
		currentText: '今日',
		monthNames: ['1月','2月','3月','4月','5月','6月',
		'7月','8月','9月','10月','11月','12月'],
		monthNamesShort: ['1月','2月','3月','4月','5月','6月',
		'7月','8月','9月','10月','11月','12月'],
		dayNames: ['日曜日','月曜日','火曜日','水曜日','木曜日','金曜日','土曜日'],
		dayNamesShort: ['日','月','火','水','木','金','土'],
		dayNamesMin: ['日','月','火','水','木','金','土'],
		weekHeader: '週',
		dateFormat: 'yy/mm/dd',
		firstDay: 0,
		isRTL: false,
		showMonthAfterYear: true,
		yearSuffix: '年'};
	$.datepicker.setDefaults($.datepicker.regional['ja']);
});

(function ($) {
	// Slick.Grid
	$.extend(true, window, {
		Slick: {
			XGrid: XSlickGrid,
			XEditGrid: XEditSlickGrid,
			Editors: {
				XSelect: XSelectCellEditor
			}
		}
	});

	
	/**
	 * Creates a new instance of the grid.
	 * @class SlickGrid
	 * @constructor
	 * @param {Node}              container   Container node to create the grid in.
	 * @param {Array,Object}      data        An array of objects for databinding.
	 * @param {Array}             columns     An array of column definitions.
	 * @param {Object}            options     Grid options.
	 **/
	function XSlickGrid(container, data, columns, options) {
		
		//dataView使用時のJSONデータをグリッドに反映する処理
		function updateDataView(json){
			if(!json || json==null) json="";
			//dataViewを保持していない場合は何もしない
			if(!this.hasInnerDataView) return false;
			//dataView更新開始
			this.innerDataView.beginUpdate();
			//JSON設定
			var id = (options.dataViewId && options.dataViewId!=null)? options.dataViewId : "id";
			this.innerDataView.setItems(json, id);
			//dataView更新完了
			this.innerDataView.endUpdate();
		}
		//resizeHeightオプションに設定するグリッドの高さ調整処理
		function adjustGridHeight(){
			//ウィンドウサイズからヘッダーフッターの高さを引いた高さ（メッセージの高さは含めない）
			var h = ($(window).height() - ($(".x-header-container").outerHeight() - $("#x-messages-area").outerHeight() + $(".x-footer-container").outerHeight() + 1));
			//検索条件欄の高さ
			var criteriaHeight = ($(".x-criteria-area"))? $(".x-criteria-area").outerHeight() : 0; 
			//検索条件欄とタイトルなどの高さ分を引いた高さ
			return (h - criteriaHeight - 70);
		}
		
		function subscribeGroupingEvent(){
			//dataViewを保持していない場合は何もしない
			if(!this.hasInnerDataView) return false;
			var ___grid = this;
			// wire up model events to drive the grid
			this.innerDataView.onRowCountChanged.subscribe(function (e, args) {
				___grid.updateRowCount();
				___grid.render();
			});
			this.innerDataView.onRowsChanged.subscribe(function (e, args) {
				___grid.invalidateRows(args.rows);
				___grid.render();
			});
		}
		
		//============================================================  公開API
		$.extend(this, {
			"updateDataView": updateDataView,
			"subscribeGroupingEvent" : subscribeGroupingEvent
		});

		
		// settings
		var defaults = {
// 			explicitInitialization: false,
//			defaultColumnWidth: 80,
//			enableAddRow: false,
//			leaveSpaceForNewRows: false,
//			editable: false,
//			autoEdit: true,
//			enableCellNavigation: true,
//			enableColumnReorder: true,
//			asyncEditorLoading: false,
//			asyncEditorLoadDelay: 100,
//			enableAsyncPostRender: false,
//			asyncPostRenderDelay: 50,
//			autoHeight: false,
//			editorLock: Slick.GlobalEditorLock,
//			showHeaderRow: false,
//			headerRowHeight: 25,
//			showTopPanel: false,
//			topPanelHeight: 25,
//			formatterFactory: null,
//			editorFactory: null,
//			cellFlashingCssClass: "flashing",
//			selectedCellCssClass: "selected",
//			multiSelect: true,
//			enableTextSelectionOnCells: false,
//			dataItemColumnValueExtractor: null,
//			frozenBottom: false,
//			frozenColumn: -1,
//			frozenRow: -1,
//			fullWidthRows: false,
//			multiColumnSort: false,
//			forceSyncScrolling: false,
			//Gridエリア内に収まるよう横幅調整する場合はtrue
			forceFitColumns: (options.frozenColumn)? false: true, 
			//未指定の列のformatterを共通化
			defaultFormatter: directFormatter,
			//最初の列を行選択のチェックボックスにする場合はtrue
			enableCheckboxSelector: false,
			//最初の列をチェックボックスにして行選択を行うプラグインを指定
			checkboxSelector : new Slick.CheckboxSelectColumn({
				cssClass: "slick-cell-checkboxsel"
			}),
			//DataView使用時のIDとなる項目名を指定
			dataViewId: "id",
			//CST Framework common default options
			rowHeight: 22,
			//CST Framework add options
			height: null,
			//枠のマージン
			margin:"4px 0 0 0",
			//一覧の高さをウィンドウサイズに合わせて変更
			resizeHeight: adjustGridHeight
		};

		//オプションの初期値設定
		options = $.extend({}, defaults, options);
		
		//チェックボックス選択が有効な場合は列定義に追加
		if(options.enableCheckboxSelector){
			columns.unshift(options.checkboxSelector.getColumnDefinition());
		}
		
		
		//Slick.Gridを継承
		Slick.Grid.call(this, container, data, columns, options);
		//他要素からthis =gridが参照できるよう変数に保持
		var __innerGrid = this;
		//共通処理で扱えるようDataViewを保持
		this.innerDataView = null;
		this.hasInnerDataView = false;
		
		//dataにgetItemがあればdataViewが指定されたと判断できる。
		if (data.getItem) {
			//DataViewを保持
			this.innerDataView = data;
			this.hasInnerDataView = true;
		}
		
		//行選択モデルの設定
		this.setSelectionModel(new Slick.RowSelectionModel()); //{selectActiveRow: false}
		
		//チェックボックス選択が有効な場合はプラグインに追加
		if(options.enableCheckboxSelector){
			this.registerPlugin(options.checkboxSelector);
		}
		
		//マージン指定（固定）がある場合はCSSのmarginを設定
		if(options.margin!=null){
			$(container).css({'margin':options.margin});
		}
		//高さ指定（固定）がある場合はCSSのheightを設定
		if(options.height!=null){
			$(container).css({'height':options.height});
		}
		//高さ指定（サイズ調整）がある場合はresizeイベントで指定された数値を設定
		if(options.resizeHeight!=null){
			$(window).resize(function(){
				//高さ調整
				$(container).css({'height':(options.resizeHeight())+'px'});
				__innerGrid.resizeCanvas();
			});
		}
		
		//dataViewを保持している場合は初期表示処理
		if(this.hasInnerDataView){
			try{
				//JSONデータを取得(panelCriteria.xhtmlにて定義)
				var json = getPanelCriteriaJSON();
				//検索結果表示
				this.updateDataView(json);
				//結果反映
				this.invalidate();
			}catch(e){}
		}
		
		$(window).trigger("resize");
	}

	/**
	 * Creates a new instance of the grid.
	 * @class SlickGrid
	 * @constructor
	 * @param {Node}              container   Container node to create the grid in.
	 * @param {Array,Object}      data        An array of objects for databinding.
	 * @param {Array}             columns     An array of column definitions.
	 * @param {Object}            options     Grid options.
	 **/
	function XEditSlickGrid(container, data, columns, options) {
		
		function addNewItem(item) {
			console.log("call addNewItem");
			this.innerDataView.addItem(item);
			this.invalidateRows();
			this.updateRowCount();
			this.render();
			//this.innerDataView.refresh();
			//行サイズを取得
			var row = this.innerDataView.getLength()-1;
			//行スクロール位置を指定した行番号へ
			this.scrollRowIntoView(row);
			//アクティブセルの設定
			this.setActiveCell(row, 0);
			
			//xgrid.setActiveCellInternal(xgrid.getCellNode(row, 2), true);
					
			// Invoke the Date editor on that cell
			//xgrid.editActiveCell(Slick.Editors.Date);
		}
		//============================================================  公開API
		$.extend(this, {
			"addNewItem": addNewItem
		});

		
		// settings
		var defaults = {
			editable: true,
			enableCellNavigation: true,
			asyncEditorLoading: false,
			autoEdit: false,
			//CST Framework common default options
			rowHeight: 25,
			//enableAddRow: true, //新規登録用の行を常に表示
			//enableCellRangeSelection : true,
			//multiSelect: false,
			//leaveSpaceForNewRows : true
			//rerenderOnResize : true
			//enableColumnReorder: false,
			//topPanelHeight: 50
		};

		//オプションの初期値設定
		options = $.extend({}, defaults, options);
		//Slick.XGridを継承
		Slick.XGrid.call(this, container, data, columns, options);
		//他要素からthis =gridが参照できるよう変数に保持
		var __innerGrid = this;
		
		//EditModeはdataViewが前提
		if (!this.hasInnerDataView) throw new Error("XEditGridではSlick.Data.DataViewを使用してください。");
			
		this.changeIds = new Array();
		
		this.addChangeId = function(id){
			//既に変更対象IDに登録されている場合は何もしない
			var i = 0;
			while(i<__innerGrid.changeIds.length){
				if(__innerGrid.changeIds[i]==id) return;
				i++;
			}
			//変更対象IDにIDを追加
			__innerGrid.changeIds[i] = id;
		};
		
		this.getChangeItems = function(){
			//		console.log("this.changeIds.length" + this.changeIds.length);
			for(var i=0; i< __innerGrid.changeIds.length; i++){
				var id = __innerGrid.changeIds[i];
				var item = __innerGrid.innerDataView.getItemById(id);
				console.log(" this.changeIds[" + i + "] = " + __innerGrid.changeIds[i] + "  $.stringify(item) = " + $.stringify(item));
			}
		};
		
		this.onCellChange.subscribe(function(e,args) {
			console.log("call onCellChange.subscribe : e=" + e + " args=" + args);
			//__innerGrid.innerDataView.updateItem(args.item.id, args.item);
			var item = args.item;
			var id = item.id;
			//当該編集行のIDを変更対象IDに追加
			__innerGrid.addChangeId(args.item.id);
			
			var column = args.cell;
			var row = args.row;
			var field = __innerGrid.getColumns()[column].field;
			var value = item[field];
			var dataString = "[" + column + ", " + row + "] id="+id+"&field="+field+"&value="+value;
			console.log("  dataString=" + dataString);
			
		});	
/*
		// Make the grid respond to DataView change events.
		data.onRowCountChanged.subscribe(function (e, args) {
			console.log("call onRowCountChanged.subscribe : e=" + e + " args=" + args);
			__innerGrid.updateRowCount();
			__innerGrid.render();
		});

		data.onRowsChanged.subscribe(function (e, args) {
			console.log("call onRowsChanged.subscribe : e=" + e + " args=" + args);
			__innerGrid.invalidateRows(args.rows);
			__innerGrid.render();
		});
*/
/*
		//セルクリック時の動作を定義
		this.onClick.subscribe(function (e) {
			console.log("call onClick.subscribe : e=" + e);
			//イベントからセルを取得
			var cell = __innerGrid.getCellFromEvent(e);
			console.log("  cell.cell=" + cell.cell + "  cell.row=" + cell.row + "  xgrid.getColumns()[" + cell.cell + "].id=" + this.getColumns()[cell.cell].id);
			//クリックされたセルをアクティブに設定
			__innerGrid.setActiveCell(cell.row, cell.cell);

			if (__innerGrid.getColumns()[cell.cell].id == "id") {
				if (!__innerGrid.getEditorLock().commitCurrentEdit()) {
					return;
				}
				
// 					var states = { "Low": "Medium", "Medium": "High", "High": "Low" };
// 					data[cell.row].priority = states[data[cell.row].priority];
// 					xgrid.updateRow(cell.row);
				e.stopPropagation();
			}
		});
*/
		
	}


	
	//formatterに何も指定がない場合はこのformatterが使用される。
	//テキスト入力値のXSS対応のためのエンコードはサーバ側で行うこと。（JsonUtil.toString()でエスケープ指定。または、UrlEncodingCharacterEscapesクラスを使用する。）
	function directFormatter(row, cell, value, columnDef, dataContext) {
		if (value == null) {
			return "";
		} else {
			//defaultFormatterは次のようにエンコード処理を行っていた。valueはエンコードされている前提としてそのまま返す。
			//return (value + "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
			return (value + "");
		}		
	}
	
	function XSelectCellEditor(args) {
		var $select = null;
		var defaultValue = null;
		var scope = this;

		this.createSelectObject = function(container, columnDef, value, dataContext){
			//ない場合は"はい", "いいえ"
			var opt_values ="はい|true,いいえ|false".split(',');
			//列定義に"options"がある場合は選択肢を更新
			if(columnDef.options){
				opt_values = columnDef.options.split(',');
			}
			//optionsタグを生成
			var option_str = "";
			for( i in opt_values ){
				var v = opt_values[i];
				var label = v;
				var value = v;
				//別名がある場合はvalueとlabelに分ける
				if(0<v.indexOf("|")){
					label = v.split('|')[0];
					value = v.split('|')[1];
				}
				option_str += '<option value="' + value + '">' + label + '</option>';
			}
			return $('<select tabIndex="0" class="editor-select">' + option_str + '</select>');
		};

		this.init = function() {
			$select = this.createSelectObject(args.container, args.column, args.value, args.dataContext);
			$select.appendTo(args.container);
			$select.focus();
		};
		this.destroy = function() { $select.remove();	};
		this.focus = function() { $select.focus();};
		this.loadValue = function(item) {
			defaultValue = item[args.column.field];
			$select.val(defaultValue);
		};
		this.serializeValue = function() {
			if(args.column.options){
			  return $select.val();
			}else{
			  return ($select.val() == "yes");
			}
		};
		this.applyValue = function(item,state) {
			item[args.column.field] = state;
		};
		this.isValueChanged = function() {
			return ($select.val() != defaultValue);
		};
		this.validate = function() {
			return {
				valid: true,
				msg: null
			};
		};
		this.init();
	};
	
}(jQuery));

/* ==========================================================================
      XMessage : メッセージ（alert, confirm, message, wait)
   ========================================================================== */
var XMessage = {
	/*
	 * 確認ダイアログ
	 *
	 * message      : ダイアログのメッセージ本文
	 * title        : ダイアログのタイトル
	 * buttonok     : OKボタンのテキスト
	 * buttoncancel : キャンセルボタンのテキスト
	 * callback     : コールバック関数を指定する。引数 cancel にボタン選択の結果が入る。
	 *                OK ならば false キャンセルならば true となる。
	 */
	_confirm : function(message, title, buttonok, buttoncancel, callback){
		var _dlg = $('<div>'+message+'</div>');
		var _buttons = {};
		_buttons[buttonok] = function(){$(this).dialog('close');$(this).dialog("destroy").remove();callback(false);};
		_buttons[buttoncancel]  = function(){$(this).dialog('close');$(this).dialog("destroy").remove();callback(true);};
	
		_dlg.dialog({
			modal:true,
			draggable:false,
			dialogClass: "alert",
			title:title,
			height:"auto",
			width:320,
			buttons:_buttons,
			overlay:{ opacity:0.3, background:'#225B7F' }
		});
	},
	
	/*
	 * アラートダイアログ
	 *
	 * message      : ダイアログのメッセージ本文
	 * title        : ダイアログのタイトル
	 * buttonok     : OKボタンのテキスト
	 */
	_alert : function(message, title, buttonok, callback){
		var _div = '<div id="alert-dialog" class="ui-widget">'
			+ '		<p>'
			+ '		<span class="ui-icon ui-icon-alert" style="float: left; margin-right: .3em;"></span>'
			+ '		<strong>Alert:</strong>'
			+ '		<span id="alert-dialog-message">'
			+ message
			+ '		</span>'
			+ '		</p>'
			+ '</div>';
		
		var _dlg = $(_div);
		var _buttons = {};
		_buttons[buttonok] = function(event){$(this).dialog('close'); $(this).dialog("destroy").remove(); callback();};
	
		_dlg.dialog({
			modal:true,
			draggable:false,
			dialogClass: "ui-state-error",
			title:title,
			buttons:_buttons,
			overlay:{ opacity:0.3, background:'#225B7F' },
			open:function(event, ui){ 
				$(".ui-dialog-titlebar").hide();
			}
		});
	},

	/*
	 * メッセージダイアログ
	 *
	 * message      : ダイアログのメッセージ本文
	 * title        : ダイアログのタイトル
	 * buttonok     : OKボタンのテキスト
	 */
	_message : function(message, title, buttonok, callback){
		var _div = '<div id="message-dialog" class="ui-widget">'
			+ '		<p>'
			+ '		<span class="ui-icon ui-icon-info" style="float: left; margin-right: .3em;"></span>'
			+ '		<strong>Info:</strong>'
			+ '		<span id="message-dialog-message">'
			+ message
			+ '		</span>'
			+ '		</p>'
			+ '</div>';
		
		var _dlg = $(_div);
		var _buttons = {};
		_buttons[buttonok] = function(event){$(this).dialog('close'); $(this).dialog("destroy").remove(); callback();};
	
		_dlg.dialog({
			modal:true,
			draggable:false,
			dialogClass: "ui-state-highlight",
			title:title,
			buttons:_buttons,
			overlay:{ opacity:0.3, background:'#225B7F' },
			open:function(event, ui){ 
				$(".ui-dialog-titlebar").hide();
			}
		});
	},
	

	
	/*
	 * 確認ダイアログ
	 * message      : ダイアログのメッセージ本文
	 * callback     : コールバック関数を指定する。引数 cancel にボタン選択の結果が入る。
	 *                OK ならば false キャンセルならば true となる。
	 */
	confirm : function(message, callback){
		return window.confirm(message);
		//if(callback==undefined) callback = function(){};
		//XMessage._confirm(message, "確認メッセージ", "OK", "キャンセル", callback);
	},

	/*
	 * アラートダイアログ
	 *
	 * message      : ダイアログのメッセージ本文
	 * title        : ダイアログのタイトル
	 * buttonok     : OKボタンのテキスト
	 */
	alert : function(message, callback){
		window.alert(message);
		//if(callback==undefined) callback = function(){};
		//XMessage._alert(message, "アラートメッセージ", "OK", callback);
	},

	
	alertBar : function(message) {
		var _id = "x-alert-bar-" + Math.floor(Math.random() * 100) + 1;
		var _div = '<div id="' + _id + '" class="ui-widget x-alert-bar">'
				 + '	<div class="ui-state-error ui-corner-all">'
				 + '		<p>'
				 + '		<span class="ui-icon ui-icon-alert" style="float: left; margin-right: .3em;"></span>'
				 + '		<strong>Alert:</strong>'
				 + '		<span id="x-alert-message" >'
				 + message
				 + '		</span>'
				 + '		<a href="javascript: void(0);"  style="float: right; margin-right: .3em; text-decoration: none; font-weight: bold;">'
				 + '			<span class="ui-icon ui-icon-closethick" style="float: left; margin-right: .3em; "></span>'
				 + '			閉じる'
				 + '		</a>'
				 + '		</p>'
				 + '	</div>'
				 + '</div>';
		
		$(_div).css({
				display: "block",
				opacity: "0.96",
				marginTop: "2px"
			})
			.prependTo("div.x-main article");
			
		$("#" + _id + " a").on("click", function(){
			$("#" + _id).fadeOut(300, function(){ $(this).remove();});
		});
		
	},

	/*
	 * メッセージダイアログ
	 *
	 * message      : ダイアログのメッセージ本文
	 * title        : ダイアログのタイトル
	 * buttonok     : OKボタンのテキスト
	 */
	message : function(message, callback){
		if(callback==undefined) callback = function(){};
		XMessage._message(message, "Infoメッセージ", "OK", callback);
	},

	messageBar : function(message) {
		var _id = "x-message-bar-" + Math.floor(Math.random() * 100) + 1;
		var _div = '<div id="' + _id + '" class="ui-widget x-message-bar">'
				 + '	<div class="ui-state-highlight ui-corner-all">'
				 + '		<p>'
				 + '		<span class="ui-icon ui-icon-info" style="float: left; margin-right: .3em;"></span>'
				 + '		<strong>Info:</strong>'
				 + '		<span id="x-alert-message" >'
				 + message
				 + '		</span>'
				 + '		<a href="javascript: void(0);"  style="float: right; margin-right: .3em; text-decoration: none; font-weight: bold;">'
				 + '			<span class="ui-icon ui-icon-closethick" style="float: left; margin-right: .3em; "></span>'
				 + '			閉じる'
				 + '		</a>'
				 + '		</p>'
				 + '	</div>'
				 + '</div>';
		
		$(_div).css({
				display: "block",
				opacity: "0.96",
				marginTop: "2px"
			})
			.prependTo("div.x-main article");
			
		$("#" + _id + " a").on("click", function(){
			$("#" + _id).fadeOut(300, function(){ $(this).remove();});
		});
		
	},
	
	wait: function(message){
		var _msg = (message)? message : "Please wait ...";
		var _div = ''
			+ '<div id="wait-dialog" class="ui-widget">'
			+ '		<p style="font-size: 2em; color: #666666; ">'
			+ '		<span class="ui-icon ui-icon-transferthick-e-w" style="float: left; margin-right: .3em;"></span>'
			+ _msg
			+ '		</p>'
			+ '</div>';
		
		$(_div).dialog({
			modal:true,
			draggable:false,
			resizable: false,
			closeOnEscape: false,
			dialogClass: "ui-state-highlight",
			width:"80%",
			overlay:{ opacity:0.3, background:'#225B7F' },
			open:function(event, ui){ 
				$(".ui-dialog-titlebar").hide();
			}
		});		
	},
	
	clearWait: function(){
		$("#wait-dialog").fadeOut(100, function(){ $(this).remove();});
	}
};



/* ==========================================================================
      XLayout : レイアウト関連の処理（関数）をまとめた
   ========================================================================== */
var XLayout = {
	initialize: function(){
		XLayout.setSideMenuToggle();
		//メッセージ欄の表示制御
		//XLayout.initializeMessage();
		
		//メッセージの閉じるにフォーカスが当たっている以外は最初の有効な入力要素にfocus
		if($(":focus").attr("id")!="x-message-close"){
			//最初の入力要素にカーソルイン
			$('input:visible,select:visible').eq(0).focus();
		}
	},

	/**
	 * Function Name : open
	 * Description	 : 指定されたurlを別ウィンドウに開く。
	 * Author		 : Kinya Sakama
	 * Param		 : url open時のURL
	 * Param		 : winName ウィンドウの名前
	 * Param		 : width   ウィンドウの横幅
	 * Param		 : height  ウィンドウの縦幅
	 * Param		 : left    ウィンドウのx座標
	 * Param		 : top     ウィンドウのy座標
	 * Return		 : なし
	 * Version		 : 1.0.0 2008/07/07 Kinya Sakama    新規作成
	 */
	open : function(url, winName, width, height, left, top){

		//x座標,y座標を指定する。
		var point = "";
		if( left != null && left != undefined ) point += ",left=" + left;
		if( top  != null &&  top != undefined ) point += ",top="  + top;
		
		//var options = "toolbar=0,location=0,directories=0,status=0,menubar=0,scrollbars=0,resizable=1,dependent=0,width="+ width + ",height=" + height + point;
		var options = "toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=yes,resizable=yes,titlebar=yes,width="+ width + ",height=" + height + point;
		
		//重複した名前にならないように仮window名を生成
		if(winName==null) winName = "_win" + (new Date()).getTime();
		var win = window.open(url, winName, options);
		window.child = win;
	},
	
	close : function(){
		window.close();
	},
	
	//+++++++++++++++++++++++++++++++++++++++++++++++++++ サイドメニュー(aside)
	setSideMenuToggle: function(){
		
		//サイドメニュー表示ボタン（タイトル横）
		$("#x-aside-open").button({icons: {primary: 'ui-icon-arrowreturnthick-1-s'}, text: false})
		.on("click", function(){
			$("aside").show("slide", {}, 200);
			$("article").removeClass("toggleOff");
			$("#x-aside-close").show();
			if($.cookie) $.cookie("x-aside", "true", {path: getContextPath()});
			$(window).trigger('resize');
		})
		.hide();
		//サイドメニュー閉じるボタン
		$("#x-aside-close").button({icons: {primary: 'ui-icon-close'}, text: false})
		.on("click", function(){
			$("aside").hide("slide", {}, 200);
			$("article").addClass("toggleOff");
			$("#x-aside-open").show();
			if($.cookie) $.cookie("x-aside", "false", {path: getContextPath()});
			$(window).trigger('resize');
		});

		var active = $.cookie && $.cookie("x-aside") != null ? $.cookie("x-aside")=="true" : true;
		if(!active){
			$("aside").hide();
			$("article").addClass("toggleOff");
			$("#x-aside-open").show();
		}

	},
	
	addIconStyle: function(target){
		//検索ボタン
		$(target).find(".x-button-search").button({icons: {primary: 'ui-icon-search'}}).css({"width":"120px"});
		//リセットボタン
		$(target).find(".x-button-reset").button({icons: {primary: 'ui-icon-arrowrefresh-1-e'}}).css({"width":"120px"});
		//AND/ORラジオをボタン表示
		$(target).find(".x-criteria-andor").buttonset();

		
		$(target).find(".x-action-menu button").button();	
		
		//タブ／表示順などの閉じるアイコン
		$(target).find(".x-tab-close-icon").addClass("ui-icon ui-icon-close").css({"cursor":"pointer", "display":"inline-block"});
		$(target).find(".x-tab-close-icon span").css({"margin":"0"});

		//表示順の追加アイコン
		$(target).find(".x-orderby-add-icon").addClass("ui-icon ui-icon-circle-plus").css({"cursor":"pointer", "display":"inline-block"});

		//検索条件の固定アイコン
		$(target).find(".x-criteria-fixed-icon").addClass("ui-icon").css({"display":"inline-block", "background-position":"-160px 0"}); //空のアイコン
		//検索条件の閉じるアイコン
		$(target).find(".x-criteria-close-icon").addClass("ui-icon ui-icon-close").css({"cursor":"pointer", "display":"inline-block"});

		//検索ボタン
		$(target).find(".x-button-search-mini").button({icons: {primary: 'ui-icon-search'}}).css({"width":"70px"});
		//行追加アイコン
		$(target).find(".x-action-addrow-icon").addClass("ui-icon ui-icon-plusthick").css({"cursor":"pointer", "display":"inline-block"});
		//行削除アイコン
		$(target).find(".x-action-removerow-icon").addClass("ui-icon ui-icon-minusthick").css({"cursor":"pointer", "display":"inline-block"});

	},

	/**
	 * 表示/非表示トグルの設定
	 * Version		 : 1.0.1 2014/01/29 kato-y    トグルに対してクリックイベントを追加する前に、付加されているクリックイベントを全て削除する様修正
	 * */
	setToggle: function(target){
		//表示／非表示Toggleの切替アイコン
		$(target).find(".x-toggle-icon").addClass("ui-icon ui-icon-triangle-1-s").css({"display":"inline-block"});
		//表示／非表示Toggle
		//Start Add 1.0.1
		$(target).find(".x-toggle-switch").off("click");
		//Start Add 1.0.1
		$(target).find(".x-toggle-switch").on("click", function() {
			$(target).find(".x-toggle-content" ).toggle( "blind",200, function(){
				//toggle完了時にアイコンを切り換える
				$(target).find(".x-toggle-switch .x-toggle-icon").toggleClass("ui-icon-triangle-1-s").toggleClass("ui-icon-triangle-1-e");
				//リサイズイベント
				$(window).trigger("resize");
			});
		});
	},
	
	//メッセージ欄の生成
	initializeMessage: function(){
		var msgArea = $("#x-messages-area");
		var msg = $("#x-messages");
		//メッセージがある場合
		if(msg.html().toLowerCase().indexOf("<ul>")!=-1){
			//メッセージを追加
			msgArea.html("<div>" + msg.html() + "</div>");
			//「閉じる」ボタンを追加
			msgArea.append($('<button id="x-message-close">メッセージ閉じる</button>'));
			//ボタンスタイル適用（onclickでメッセージ欄を閉じる）
			msgArea.find("button").button({icons: {primary: 'ui-icon-closethick'}})
				.css({"width":"20%", "margin-left":"40%"})
				.on("click", function(){
					msgArea.fadeOut(300, function(){
						msgArea.addClass("x-hidden");
						msgArea.html("");
					});
				});
			//メッセージ表示欄自体のスタイル
			//msgArea.css({ "opacity": "0.85"});
			//メッセージ表示のスタイル調整（多くなる場合はx-common.cssに定義しましょう）
			msgArea.find("ul li").css({
				"line-height": "1.8em",
				"margin-bottom": "3px"
			});
			msgArea.removeClass("x-hidden");
			msgArea.show();
			$("#x-message-close").focus();
			//メッセージクリア
			msg.html("");
		}
	},
	
	fixFooter: function(){
		//フッター固定：メイン領域の高さにウィンドウサイズからヘッダー／フッターの高さとmain要素のマージン分引いた高さを設定
		$(".x-main-container").height($(window).height() - ($(".x-header-container").outerHeight()+$(".x-footer-container").outerHeight()+1)); 
	}
};

//画面共通初期化処理(onloadイベントに追加)
jQuery.event.add(window, "load", XLayout.initialize);

/* Sample */
function confirmTest(){
	XMessage.confirm('この処理を続行しますか？横幅が長いときはどうなりますか？どれくらい長くても大丈夫ですか？', 
      function(cancel){
		flg = cancel;
        if (cancel) return;
        alert("確認がとれました。");
      });
}
function alertTest(){
	XMessage.alert('警告メッセージを表示するところ。', 
		function(){
			alert("OKが押下されました");
		});
}
function messageTest(){
	XMessage.message('メッセージを表示するとどうなる？？？', 
		function(){
			alert("OKが押下されました");
		});
}
