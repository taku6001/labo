/*
 * format.js	v1.0.1
 * Copyright (c) IT Engineering Ltd. 2006 All Rights Reserved.  
 * Author	: IT&E Kinya Sakama 
 * Date		: 2006/10/07
 * Version	: 1.0.0
 * Version	: 1.0.5 2008/10/24 Kinya Sakama No.68 setInputFormatterの入力要素1024の制限解除。
 */
$(function () {
	//setInputFormatterが呼び出されるよう設定
	setInputFormatter();

	//commandLinkだとonsubmitイベントが発生しないのでremoveCommaFieldを呼び出す
	// mojarra.jsfcljsを保持しておいてremoveCommaFieldを実行しmojarra.jsfcljsを実行
	try	 {
		var oldjsfcljs = mojarra.jsfcljs;
		mojarra.jsfcljs = function jsfcljs(f, pvp, t) {
			//$(f).trigger("submit");
			removeCommaField();
			oldjsfcljs.apply(this, arguments);
		};
	}catch(e){console.log(e);}
	try {
		var oldjsfajaxrequest = jsf.ajax.request;
		jsf.ajax.request = function request(element, evt, options){
			//$(window).trigger("beforeunload");
			removeCommaField();
			oldjsfajaxrequest.apply(this, arguments);
		};
	}catch(e){console.log(e);}
});

/**
 * Function Name : addFieldClass
 * Description	 : 指定された入力要素にフォーマット制御用クラスを追加し、
 * 				   入力制御関数をバインドする。
 * Author		 : Kinya Sakama
 * Param		 : target 対象の入力要素のID、または、オブジェクト
 * Param		 : addClassName 設定するフォーマット制御用クラス名
 * Return		 : なし
 */
function addFieldClass(target, addClassName){
	//対象の入力要素
	var fld = $(target);
	
	//入力要素に既にクラスが指定されていないか確認
	if(!fld.hasClass(addClassName)){
		//先頭にフォーマットクラス（先頭にないと動作しないため）
		fld.attr("class", addClassName + " " + fld.attr("class"));
	}
	//既に設定されている場合があるので一度クリア
	fld.off("blur", formatValue).off("keypress", inputControl);
	
	//入力制御関数をバインド
	fld.on("blur", formatValue).on("keypress", inputControl);
}

/**
 * Function Name : setInputFormatter
 * Description	 : 全てのinput要素のonblurイベントにformatValue関数がCallされる
 * 				   よう設定。
 * Author		 : Kinya Sakama
 * Param		 : なし
 * Return		 : なし
 */
function setInputFormatter(targetId){
	var inputs = null;

	//targetIdが指定されている場合はその範囲のinput要素を取得
	if(targetId!=null && targetId!="" && (typeof targetId=='string')){
		inputs = $("#" + targetId).find("input");
	}else{
		inputs = $("input");
	}

	//入力要素に対しonblurイベントを追加
	inputs.each(function () {
		if (this.className != "") {
			$(this).off("blur", formatValue).off("keypress", inputControl);
			$(this).on("blur", formatValue).on("keypress", inputControl);
			this.value = formatString(this);
		}
	});
	
	//jQuery Datepickerを初期設定
	$(".x-dateField").datepicker();
	//個別に再設定したい場合はdatepicker時に自動で設定されるhasDatepickerクラスを除いてからdatepicker
	//$(".x-dateField" ).removeClass('hasDatepicker').datepicker({showButtonPanel : true});

	//unload時にカンマフィールドのカンマを除く
	$(window).off("beforeunload", removeCommaField);
	$(window).on("beforeunload", removeCommaField);
	//submit時にカンマフィールドのカンマを除く
	$("form").off("submit", removeCommaField);
	$("form").on("submit", removeCommaField);
}


/**
 * Function Name : inputControl
 * Description	 : onkeypressイベントにて使用する入力制限を行う関数。
 * 				   Input要素に設定されているStyle Classにより入力制限を判断する。
 * 				   対応するStyleClassは次の通り。
 * 
 * [テキスト]
 *  1. x-fullTextField		全角
 *  2. x-halfTextField		半角
 *  3. x-alphabeticField	半角英字
 *  4. x-alphamericField	半角英数
 *  5. x-numericField		半角数字
 * [日付] 
 *  1. x-dateField			日付（「0～9」「/」）
 *  2. x-timeField			時刻（「0～9」「:」）
 *  3. x-datetimeField		日付＋時刻（「0～9」「/」「:」）
 *  4. x-yearField			年（「0～9」）
 *  5. x-monthField			月（「0～9」）
 * [数値]
 *  1. x-intField			整数
 *  2. x-float1Field		小数 [小数第1位]
 *  3. x-float2Field		小数 [小数第2位]
 *  4. x-float3Field		小数 [小数第3位]
 *  5. x-float4Field		小数 [小数第4位]
 *  6. x-float5Field		小数 [小数第5位]
 *  7. x-float6Field		小数 [小数第6位]
 *  8. x-float7Field		小数 [小数第7位]
 *  9. x-float8Field		小数 [小数第8位]
 * 				   
 * Author		 : Kinya Sakama
 * Param		 : なし
 * Return		 : なし
 */
function inputControl(ev){
	var keycode, shift, ctrl, alt; 
	// Mozilla(Firefox, NN) and Opera 
	if (ev != null) { 
		keycode = ev.which; 
		shift	= typeof ev.modifiers == 'undefined' ? ev.shiftKey : ev.modifiers & Event.SHIFT_MASK; 
		ctrl	= typeof ev.modifiers == 'undefined' ? ev.ctrlKey : ev.modifiers & Event.CONTROL_MASK; 
		alt		= typeof ev.modifiers == 'undefined' ? ev.altKey : ev.modifiers & Event.ALT_MASK; 
	// Internet Explorer 
	} else { 
		keycode = event.keyCode; 
		shift	= event.shiftKey; 
		ctrl	= event.ctrlKey; 
		alt		= event.altKey; 
	} 
	 
	// キーコードの文字を取得 
	//keychar = String.fromCharCode(keycode).toUpperCase();
	//イベント要素の取得
	var obj = ev.target;
	var _cd = keycode;

	//inputタグでない場合は何もしない
	if(obj.tagName!="INPUT") return;
	
	//style classが何も設定されていない場合は何もしない。
	if(obj.className=="") return;
	
	//複数Class指定（スペース区切）がある場合は最初のClassを適用
	var classes = trim(obj.className).split(" ");

	//Backspace(8)やenter(13), del(46)などの操作キーの場合は制御しない
	if(isOperationCode(_cd, shift, ctrl, alt)) return;

	//カンマ許可フィールドでカンマ(44)の入力はOK
	var commaFlg = (-1<trim(obj.className).indexOf(" x-commaField"));
	if(commaFlg && _cd==44) return;
	
	var flg=false;
	switch(trim(classes[0])){

	/*  =====================================================================
			テキスト
		===================================================================== */
	//全角
	case "x-fullTextField":
		flg=true;
		break;
	
	//半角
	case "x-halfTextField": 
		flg = (32<=_cd && _cd<=126);
		break;

	//半角英字 [ ](32), [A-Z](65<=_cd<=90), [a-z](97<=_cd<=122)
	case "x-alphabeticField": 
		flg = (_cd==32 || (65<=_cd && _cd<=90) || (97<=_cd && _cd<=122));	
		break;

	//半角英数 [ ], [0-9], [A-Z], [a-z]
	case "x-alphamericField": 
		flg = (_cd==32 || (48<=_cd && _cd<=57) || (65<=_cd && _cd<=90) || (97<=_cd && _cd<=122));	
		break;

	//半角数字 [0-9]
	case "x-numericField": 
		flg = (48<=_cd && _cd<=57);
		break;


	/*  =====================================================================
			日付
		===================================================================== */
	//日付 [0～9],[/]
	case "x-dateField": 
		flg = ((48<=_cd && _cd<=57) || _cd==47);
		break;

	//時刻 [0～9],[:]
	case "x-timeField": 
		flg = ((48<=_cd && _cd<=57) || _cd==58);
		break;

	//日付時刻 [0～9],[/],[:],[ ]
	case "x-datetimeField": 
		flg = ((48<=_cd && _cd<=57) || _cd==47 || _cd==58 || _cd==32);
		break;

	//年 [0～9]
	case "x-yearField": 
		flg = (48<=_cd && _cd<=57);
		break;

	//月 [0～9]
	case "x-monthField": 
		flg = (48<=_cd && _cd<=57);
		break;


	/*  =====================================================================
			数値
		===================================================================== */
	//整数 [0～9],[-]
	case "x-intField": 
	    flg = ((48 <= _cd && _cd <= 57) || _cd == 45);
		break;

	//小数 [0～9],[-](45),[.](46)
	case "x-float1Field": 
	case "x-float2Field": 
	case "x-float3Field": 
	case "x-float4Field": 
	case "x-float5Field": 
	case "x-float6Field": 
	case "x-float7Field": 
	case "x-float8Field": 
		flg = ((48<=_cd && _cd<=57) || _cd==45 || _cd==46);	
		break;



/*
	//金額フィールド
	case "amountField":
		//桁数
		cnt=(value.split(".").length>=2)? 12 : 10;
		value=value.replace(/,/gi,'').replace(/\./gi,'');
		if(value.length<cnt){
			//数値 or -,.
			flg = ((48<=_cd && _cd<=57) || (44<= _cd && _cd<=46));
		}else{
			flg = (44<= _cd && _cd<=46);
		}
		break;
	
	//比率フィールド
	case "rateField":
		cnt = (value.split(".").length>=2)? 5 : 3;
		value = value.replace(/\./gi,'');
		if(value.length<cnt){
			flg = ((48<=_cd && _cd<=57) || _cd==46);
		}else{
			flg = (_cd==46);
		}
		break;
*/	

	default:
		flg=true;
	}
	//falseの場合はイベントの伝播停止
	if(!flg){
		if (ev != null) { 
			ev.preventDefault(); 
			ev.stopPropagation(); 
		} else { 
			event.returnValue = false; 
			event.cancelBubble = true; 
		} 
	}
}

/**
 * Function Name : formatValue
 * Description	 : input要素のonblurイベントにて使用する入力制限を行う関数。
 * 				   Input要素に設定されているStyle Classにより入力制限を判断する。
 * 				   対応するStyleClassは次の通り。
 * 
 * [テキスト]
 *  1. x-fullTextField		全角
 *  2. x-halfTextField		半角
 *  3. x-alphabeticField	半角英字
 *  4. x-alphamericField	半角英数
 *  5. x-numericField		半角数字
 * [日付] 
 *  1. x-dateField			日付（「0～9」「/」）
 *  2. x-timeField			時刻（「0～9」「:」）
 *  3. x-datetimeField		日付＋時刻（「0～9」「/」「:」）
 *  4. x-yearField			年（「0～9」）
 *  5. x-monthField			月（「0～9」）
 * [数値]
 *  1. x-intField			整数
 *  2. x-float1Field		小数 [小数第1位]
 *  3. x-float2Field		小数 [小数第2位]
 *  4. x-float3Field		小数 [小数第3位]
 *  5. x-float4Field		小数 [小数第4位]
 *  6. x-float5Field		小数 [小数第5位]
 *  7. x-float6Field		小数 [小数第6位]
 *  8. x-float7Field		小数 [小数第7位]
 *  9. x-float8Field		小数 [小数第8位]
 * 				   
 * Author		 : Kinya Sakama
 * Param		 : なし
 * Return		 : なし
 */
function formatValue(event){
	var obj = event.target;
	obj.value = formatString(obj);
}
function formatString(field){
	if(field.tagName!="INPUT") return;
	if(field.className=="") return;
	var value=trim(field.value);
	var maxLength = field.maxLength;

	//カンマ許可フィールドでカンマ(44)の入力はOK
	var commaFlg = (-1<trim(field.className).indexOf(" x-commaField"));

	//複数Class指定（スペース区切）がある場合は最初のClassを適用
	var classes = trim(field.className).split(" ");
	switch(trim(classes[0])){

	/*  =====================================================================
			テキスト
		===================================================================== */
	//全角
	case "x-fullTextField":
		return value;
	
	//半角
	case "x-halfTextField": 
		return formatHalfText(value);

	//半角英字 [A-Z](65<=_cd<=90), [a-z](97<=_cd<=122)
	case "x-alphabeticField": 
		return formatAlphabetic(value);

	//半角英数 [0-9], [A-Z], [a-z]
	case "x-alphamericField": 
		return formatAlphameric(value);

	//半角数字 [0-9]
	case "x-numericField": 
		return formatNumeric(value);

	/*  =====================================================================
			日付
		===================================================================== */
	//日付 [0～9],[/]
	case "x-dateField": 
		return formatDate(value);

	//時刻 [0～9],[:]
	case "x-timeField": 
		return formatTime(value);

	//日付時刻 [0～9],[/],[:],[ ]
	case "x-datetimeField": 
		return formatDatetime(value);

	//年 [0～9]
	case "x-yearField": 
		return formatYear(value);

	//月 [0～9]
	case "x-monthField": 
		return formatMonth(value);


	/*  =====================================================================
			数値
		===================================================================== */
	//整数 [0～9],[-]
	case "x-intField": 
		return formatNumber(value, maxLength, 0, commaFlg);
	//小数 [0～9],[-],[.]
	case "x-float1Field": 
		return formatNumber(value, maxLength, 1, commaFlg);
	case "x-float2Field": 
		return formatNumber(value, maxLength, 2, commaFlg);
	case "x-float3Field": 
		return formatNumber(value, maxLength, 3, commaFlg);
	case "x-float4Field": 
		return formatNumber(value, maxLength, 4, commaFlg);
	case "x-float5Field": 
		return formatNumber(value, maxLength, 5, commaFlg);
	case "x-float6Field": 
		return formatNumber(value, maxLength, 6, commaFlg);
	case "x-float7Field": 
		return formatNumber(value, maxLength, 7, commaFlg);
	case "x-float8Field": 
		return formatNumber(value, maxLength, 8, commaFlg);
	}
	return value;
}

/**
 * Function Name : formatHalfText
 * Description	 : 半角文字（記号含む）以外の文字を削除する。
 * 				   但し、全角文字の内、半角に変換できるものは変換する。
 * Author		 : Kinya Sakama
 * Param		 : value フォーマットする値
 * Return		 : フォーマット後の値
 */
function formatHalfText(value){
	//全角文字から半角に変換できるものは変換
	value = convertDouble2Single(value);
	
	var returnValue = "";
	for(var i=0; i<value.length; i++){
		//1文字ずつ確認
		_cd= value.charCodeAt(i);		
		returnValue += (32<=_cd && _cd<=126)? value.charAt(i) : "";
	}
	return returnValue;
}

/**
 * Function Name : formatAlphabetic
 * Description	 : 半角英字以外の文字を削除する。
 * 				   但し、全角文字の内、半角に変換できるものは変換する。
 * Author		 : Kinya Sakama
 * Param		 : value フォーマットする値
 * Return		 : フォーマット後の値
 */
function formatAlphabetic(value){
	//全角文字から半角に変換できるものは変換
	value = convertDouble2Single(value);
	
	var returnValue = "";
	for(var i=0; i<value.length; i++){
		//1文字ずつ確認
		_cd= value.charCodeAt(i);		
		returnValue += (_cd==32 || (65<=_cd && _cd<=90) || (97<=_cd && _cd<=122))? value.charAt(i) : "";
	}
	return returnValue;
}


/**
 * Function Name : formatAlphameric
 * Description	 : 半角英数以外の文字を削除する。
 * 				   但し、全角文字の内、半角に変換できるものは変換する。
 * Author		 : Kinya Sakama
 * Param		 : value フォーマットする値
 * Return		 : フォーマット後の値
 */
function formatAlphameric(value){
	//全角文字から半角に変換できるものは変換
	value = convertDouble2Single(value);
	
	var returnValue = "";
	for(var i=0; i<value.length; i++){
		//1文字ずつ確認
		_cd= value.charCodeAt(i);		
		returnValue += (
			_cd==32 ||
			(48<=_cd && _cd<=57) || 
			(65<=_cd && _cd<=90) || 
			(97<=_cd && _cd<=122)
		)? value.charAt(i) : "";
	}
	return returnValue;
}


/**
 * Function Name : formatNumeric
 * Description	 : 半角英数以外の文字を削除する。
 * 				   但し、全角文字の内、半角に変換できるものは変換する。
 * Author		 : Kinya Sakama
 * Param		 : value フォーマットする値
 * Return		 : フォーマット後の値
 */
function formatNumeric(value){
	//全角文字から半角に変換できるものは変換
	value = convertDouble2Single(value);
	
	var returnValue = "";
	for(var i=0; i<value.length; i++){
		//1文字ずつ確認
		_cd= value.charCodeAt(i);		
		returnValue += (48<=_cd && _cd<=57)? value.charAt(i) : "";
	}
	return returnValue;
}


/**
 * Function Name : formatNumber
 * Description	 : 半角英数以外の文字を削除する。
 * 				   但し、全角文字の内、半角に変換できるものは変換する。
 * Author		 : Kinya Sakama
 * Param		 : value フォーマットする値
 * Param		 : maxLength 最大桁数
 * Param		 : maxDecimal 最大小数桁数
 * Param		 : commaFlg カンマ区切りする場合はtrue
 * Return		 : フォーマット後の値
 */
function formatNumber(value, maxLength, maxDecimal, commaFlg){
	//valueがブランクの場合はブランクを返す。
	if(value==null || value=="") return "";
	if(commaFlg==undefined) commaFlg = false;
	
	var nums = getSplitNumber(value);
	var minus_flg		=nums[0];
	var intValue		=nums[1];
	var decimalValue	=nums[2];

	//小数点桁がある場合は、整数部の最大桁は小数点桁数を引いた数（ピリオド含む）
	maxDecimal=(isNaN(maxDecimal))? 0: maxDecimal; 
	var intLength = (0<maxDecimal)? maxLength - (maxDecimal+1): maxLength;

	//小数点以下の値を桁揃え＆0クリア
	decimalValue = alignDecimal(decimalValue, maxDecimal);
	decimalValue = trimZero(decimalValue);
	
	var returnValue = intValue.toString().substring(0,intLength);
	//カンマ区切り指定がある場合は整数部をカンマ区切りに
	if(commaFlg){
		returnValue=String(returnValue).replace( /(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
	}
	returnValue += (0<decimalValue)? "." + decimalValue : "";
	//マイナスフラグがある場合は先頭に「-」を付与
	if(minus_flg){
		returnValue = "-" + returnValue;	
	}
	return returnValue;
}


/**
 * Function Name : alignDecimal
 * Description	 : 小数点の桁揃え
 * Author		 : Kinya Sakama
 * Param		 : decimalValue 対象となる数値
 * Param		 : maxDecimal 小数桁
 * Return		 : 桁揃え後の値
 */
function alignDecimal(decimalValue, maxDecimal){
	if(decimalValue.length<parseInt(maxDecimal)){
		for(var i=decimalValue.length; i<maxDecimal; i++){
			decimalValue+="0";
		}
	}
	//最大桁数を超えていたら切り捨て
	return decimalValue.substring(0,maxDecimal);
}


/**
 * Function Name : trimZero
 * Description	 : 小数点の切捨て
 * Author		 : Kinya Sakama
 * Param		 : decimalValue 対象となる数値
 * Return		 : 切捨て後の値
 */
function trimZero(decimalValue){
	if(0<decimalValue.length){
		var lastValue = decimalValue.substring(decimalValue.length-1, decimalValue.length);
		if(lastValue=="0"){
			return trimZero(decimalValue.substring(0, decimalValue.length-1));
		}
	}
	return decimalValue;
}


/**
 * Function Name : getSplitNumber
 * Description	 : 数値を「マイナス符号」「整数部」「小数部」に分割する。
 * Author		 : Kinya Sakama
 * Param		 : value 対象となる数値
 * Return		 : 分割した次の値
 * 					returnValue[0] : minus flag
 * 					returnValue[1] : 整数部
 * 					returnValue[2] : 小数部
 */
function getSplitNumber(value){
	
	var returnValues=new Array(3);
	var minus_flg=false;
	var comma_flg=false;
	var intValue="";
	var decimalValue="";
	
	value=value.toString().replace(/,/gi, "");

	for(var i=0; i<value.length; i++){
		_cd= value.charCodeAt(i);		
		switch(_cd){
			
		//最初の値が-の場合にminus_flgを立てる
		case 45: 
			if(i==0){
				minus_flg=true;
				intValue="0";
			}
			break;
			
		//commaがある場合にcomma_flgを立てる
		case 46: //comma
			comma_flg=true;
			if(i==0) intValue="0";
			break;

		default:
			//数値(0-9)
			if(48<=_cd && _cd<=57){
				if(!comma_flg){
					intValue+=value.charAt(i);
				}else{
					decimalValue+=value.charAt(i);
				}
			}
		}
	}
	//整数部0調整
	intValue=parseInt(intValue,10)+"";

	//戻り値の生成
	returnValues[0]=minus_flg;
	returnValues[1]=(isNaN(intValue))? "0": intValue;
	returnValues[2]=(isNaN(decimalValue))? "0": decimalValue;
	return returnValues;
}

/**
 * Function Name : formatPositiveNumber
 * Description	 : 指定された桁数の正数値にフォーマットする。
 * Author		 : Kinya Sakama
 * Param		 : value フォーマットする値
 * Param		 : maxLength 最大桁数
 * Return		 : フォーマット後の値
 */
function formatPositiveNumber(value, maxLength){
	var v = parseInt(formatNumber(value, maxLength, 0));
	if(!isNaN(v)){
		return Math.abs(v);
	}
	return "";
}

/**
 * Function Name : formatYear
 * Description	 : 年4桁（1960～2100）にフォーマットする。
 * Author		 : Kinya Sakama
 * Param		 : value フォーマットする値
 * Return		 : フォーマット後の値
 */
function formatYear(value){
	//Null or ブランクの場合はブランクを返す
	if(value==null || value=="") return "";
	
	var year = parseInt(formatNumber(value, 4, 0));
	
	if(year < 100) year+=parseInt(2000);

	if(year<1960) return "";
	if(year>2100) return "";
	return year;
}

/**
 * Function Name : formatMonth
 * Description	 : 月（1～12）にフォーマットする。
 * Author		 : Kinya Sakama
 * Param		 : value フォーマットする値
 * Return		 : フォーマット後の値
 */
function formatMonth(value){
	//Null or ブランクの場合はブランクを返す
	if(value==null || value=="") return "";

	var month = formatNumber(value, 2, 0);
	if(month<1) return 1;
	if(month>12) return 12;
	return month;
}

/**
 * Function Name : formatDate
 * Description	 : 日付形式(yyyy/mm/dd)にフォーマットする。
 * 				   日付でない形式の場合は値を抹消する。
 * Author		 : Kinya Sakama
 * Param		 : value フォーマットする値
 * Return		 : フォーマット後の値
 */
function formatDate(value) {
	//スラッシュ区切りで配列化
	var dateArr = value.split('/');
	
	//現在の日付
	var currentDate = new Date();
	var yy = (currentDate.getFullYear()) + "";
	var mm = (currentDate.getMonth() + 1) + "";
	var dd = (currentDate.getDate()) + "";

	//スラッシュの数により値を補完
	switch(dateArr.length){
	case 1: 
		if(dateArr[0]=="") return "";
		if(dateArr[0]!=""&&isNumericChar(dateArr[0])) dd = dateArr[0] ;
		break;
	case 2:
		if(dateArr[0]!=""&&isNumericChar(dateArr[0])) mm = dateArr[0] ;
		if(dateArr[1]!=""&&isNumericChar(dateArr[1])) dd = dateArr[1] ;
		break;
	default:
		if(dateArr[0]!=""&&isNumericChar(dateArr[0])) yy = dateArr[0] ;
		if(dateArr[1]!=""&&isNumericChar(dateArr[1])) mm = dateArr[1] ;
		if(dateArr[2]!=""&&isNumericChar(dateArr[2])) dd = dateArr[2] ;
		break;
	}	

	//年が2桁の場合は頭に20を追加
	if (yy.length == 2) {
		yy = '20' + yy;
	}

	//2050年以降の日付は扱わない。（9999年以降が設定されないように）
	//if(2050<parseInt(yy)) return "";

	//月と日が1桁だった場合は0を補完する。
	if (mm.length == 1) {
		mm = '0' + mm;
	}

	if (dd.length == 1) {
		dd = '0' + dd;
	} else if (dd.length > 2) {
		//3文字以上の場合は先頭の2文字のみにする
		dd = dd.substring(0,2);
	}

	var newStrDate = yy+"/"+mm+"/"+dd;

	//日付存在チェック
	if (!isDateExist(newStrDate)){
		return "";
	}
	
	//頭の西暦2桁を取り除いて返す。
	//return newStrDate.substring(2, newStrDate.length);
	return newStrDate;
}

/**
 * Function Name : isDateExist
 * Description	 : 日付の存在チェック(閏年完全対応)を行う。
 * Author		 : Kinya Sakama
 * Param		 : strDate チェックする値
 * Return		 : 存在する日付の場合はtrueを返す。
 * 				   存在しない場合はfalseを返す。
 */
function isDateExist(strDate) {
	//年、月、日に分離
	vYear  = strDate.substr(0, 4);
	vMonth = strDate.substr(5, 2) - 1;
	vDay   = strDate.substr(8, strDate.length);

	//入力文字のチェック(数字以外が含まれている場合は空文字にする)
	vYear  = isNumericChar(vYear)  == true? vYear  : -1;
	vMonth = isNumericChar(vMonth) == true? vMonth : -1;
	vDay   = isNumericChar(vDay)   == true? vDay   : -1;

	// 月,日の妥当性チェック
	if(vYear >= 0 && vMonth >= 0 && vMonth <= 11 && vDay >= 1 && vDay <= 31){
		var vDate = new Date(vYear, vMonth, vDay);
		if(isNaN(vDate)){
			return false;
		}else if(vDate.getFullYear() == vYear && vDate.getMonth() == vMonth && vDate.getDate() == vDay){
			return true;
		}else{
			return false;
		}
	}else{
		return false;
	}
}


/**
 * Function Name : isNumericChar
 * Description	 : 指定文字は数字だけで構成されいるかチェック。
 * Author		 : Kinya Sakama
 * Param		 : value チェックする値
 * Return		 : 数字だけの場合はtrueを返す。
 * 				   数字以外の文字が含まれている場合はfalseを返す。
 */
function isNumericChar(value) {
	var tmpStr = value.toString();
	var res = tmpStr.match(/[^0-9]/);	//すべて0～9で構成している場合にnullを返すようにしている。

	if (res != null || res == " ") {	//半角スペース対応
		return false;
	}
	return true;
}


/**
 * Function Name : formatTime
 * Description	 : 時刻形式（hh:MM）にフォーマットする。
 * Author		 : Kinya Sakama
 * Param		 : value フォーマットする値
 * Return		 : フォーマット後の値
 */
function formatTime(value){
	var timevalue = new String(value);
	
	//何にも入力がない場合は""を返す。
	if(timevalue=="") return "";

	switch(timevalue.indexOf(":")){

	//「:」がなかったら
	case -1:
		//文字数により「:」の場所を決める。
		switch(timevalue.length){
		case 1:
			timevalue = "0" + timevalue + ":00";
			break;

		case 2:
			timevalue+=":00";
			break;

		default:
			//最初の文字が"0"、又は、2文字が24時間未満の場合は、上2桁を時間にする。
			var pos = (timevalue.charAt(0)=="0" || parseInt(timevalue.substring(0, 2))<24)? 2: 1;
			timevalue = timevalue.substring(0, pos) + ":" + timevalue.substring(pos, pos+2);
			break;

		}
		break;

	//「:」が最初にあったら"0"を頭に。
	case 0:
		timevalue = "0" + timevalue;
		break;

	}

	//paseIntで頭に0があるとおかしな動きをするので取り除く
	var whh = timevalue.split(":")[0];
	var wmm = timevalue.split(":")[1];
	//var wss = timevalue.split(":")[2];
	whh = (whh.charAt(0)=="0")? whh.substring(1) : whh;
	wmm = (wmm.charAt(0)=="0")? wmm.substring(1) : wmm;
	//wss = (wss.charAt(0)=="0")? wss.substring(1) : wss;
	if(whh=="") whh="0";
	if(wmm=="") wmm="0";
	//if(wss=="") wss="0";
	
	//1度日付型に変換し、時刻を取り出す。
	//today = new Date(1900,1,1,parseInt(whh), parseInt(wmm), parseInt(wss));	
	today = new Date(1900,1,1,parseInt(whh), parseInt(wmm));	
	var hh = (today.getHours() < 10)? "0" + today.getHours() : today.getHours();
	var mm = (today.getMinutes() < 10)? "0" + today.getMinutes() : today.getMinutes();
	//var ss = (today.getSeconds() < 10)? "0" + today.getSeconds() : today.getSeconds();

	//正常な値でない場合はブランクを返す。
	return (isNaN(today))? "" : hh +":" + mm;

} 


/**
 * Function Name : formatDatetime
 * Description	 : 日付＋時刻のフォーマットに変換する。
 * Author		 : Kinya Sakama
 * Param		 : value フォーマットする値
 * Return		 : フォーマット後の値
 */
function formatDatetime(value){
	//何も値がない場合は""を返す
	if(value=="") return "";

	//日付と時刻に分ける
	var v = value.split(' ');
	var _date = "";
	var _time = "";
	
	//入力値が日付か時刻のいずれしかない場合は補完
	if (v.length < 2){
		//入力値にスラッシュがある場合は日付と判断し、時刻は00:00:00とする
		if(-1<v[0].indexOf("/")){
			_date = formatDate(v[0]);
			_time = formatTime("00:00:00");
		
		//入力値にコロンがある場合は時刻と判断し、日付は現在の日付とする。
		}else if(-1<v[0].indexOf(":")){
			var d = new Date();
			_date = formatDate(d.getFullYear() + "/" + (d.getMonth() + 1) + "/" + d.getDate());
			_time = formatTime(v[0]);
		}
	}else{
		_date = formatDate(v[0]);
		_time = formatTime(v[1]);
	}

	if(_date!="" && _time!="") return _date + " " + _time;

	return "";
}


/**
 * Function Name : convertDouble2Single
 * Description	 : 値に含まれる半角に変換できる全角文字を半角に変換する。
 * Author		 : Kinya Sakama
 * Param		 : value 変換する値
 * Return		 : 変換後の値
 */
function convertDouble2Single(value){
	var HAN="0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~";
	var ZEN="０１２３４５６７８９ＡＢＣＤＥＦＧＨＩＪＫＬＭＮＯＰＱＲＳＴＵＶＷＸＹＺａｂｃｄｅｆｇｈｉｊｋｌｍｎｏｐｑｒｓｔｕｖｗｘｙｚ！”＃＄％＆’（）＊＋、－。／：；＜＝＞？＠「￥」＾＿‘｛｜｝～";
	var res="";
	var c="";
	for (var i=0; i<value.length; i++){
		c=value.charAt(i);
		zen_idx = ZEN.indexOf(c);
		if(zen_idx!= -1) {
			res+=HAN.charAt(zen_idx);
		}else{
			res+=c;
		}
	}
	return res;
}

/**
 * Function Name : trim
 * Description	 : 前後の空白を取り除く
 * Author		 : Kinya Sakama
 * Param		 : argValue trimする値
 * Return		 : trim後の値
 */
function trim(argValue){
    return String(argValue).replace(/^[ 　]*/gim, "").replace(/[ 　]*$/gim, "");
}

function removeMinus(fld) {
    //フィールドがない場合は何もしない
    if (fld == null || fld == "" || fld == undefined) return;

    //フィールドのタグを取得
    var inputs = fld.tagName;

    //input要素でない場合は何もしない。
    if (inputs == null || inputs != "INPUT") return;

    //値の取得
    var fldValue = fld.value;

    //値がない場合は何もしない
    if (fldValue == null || fldValue == "" || fldValue == undefined) return;

    //マイナスを取り除く
    fld.value = fldValue.replace(/-/g, "");

}


function isOperationCode(cd, shift, ctrl, alt){
	//CTRL/ALTキーが押下されている状態は全て制御用のキーが押下されたこととする
	if(ctrl || alt) return true;
	
	var keys = new Array(
		  "0"
		, "8"	//BACKSPACE
		, "13"	//リターン
		, "27"	//Esc 
		, "8"	//BackSpace 
		, "9"	//Tab 
		, "32"	//Space 
		, "45"	//Insert 
		, "46"	//Delete 
		, "35"	//End 
		, "36"	//Home 
		, "33"	//PageUp 
		, "34"	//PageDown 
		, "38"	//↑ 
		, "40"	//↓ 
		, "37"	//← 
		, "39"	//→ 
	);
	return (-1<keys.indexOf(cd+""));
}


function removeCommaField(targetId){
	//targetIdが指定されている場合はその範囲のinput要素を取得
	if(targetId!=null && targetId!="" && (typeof targetId=='string')){
		inputs = $("#" + targetId).find(".x-commaField");
	}else{
		inputs = $(".x-commaField");
	}
	inputs.each(function () {
		this.value = this.value.replace(/,/gi, "");
	});
}
//JSF非同期処理eventの制御
try{
	jsf.ajax.addOnEvent(function(event) {
		switch (event.status) {
			case "begin":
				//ここだと既に送信されるデータが作られているのでこのタイミングでフィールド値を更新しても
				//リクエスト情報には更新した値が含まれない。
				//ここで下記のようにremoveCommaField()を呼んでもカンマが付与されて送信されていた。
				//→ x-common.jsにてjsf.ajax.requestが呼び出された際にbeforeunloadイベントを呼び出しているのでこのイベントでremoveCommaFieldが実行される。
				
				//x-commaFieldのカンマを除く（数値型の項目にカンマが含まれるとエラーになるので）
				//removeCommaField();
				break;
			case "success":
				setInputFormatter();
				break;
		}	
	});		
}catch(e){}

