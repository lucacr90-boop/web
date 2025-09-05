var time_reload_stop_flag = false;
var detail_iframe_max_width = 2000;  // 1100;  // 900
var detail_iframe_width_add = 27*2 + 12;  /* (2*padding + scrollbar) */
var detail_iframe_max_width_coef = 0.9;

var ajax_xmlhttp = null;
var ajax_xmlhttp_cache = [];
var ajax_logs_counter = 0;

var isIE = (navigator.appName.indexOf("Microsoft") != -1);
var faders = [];
var fade_full = 1.0;
var fade_delta_in = 0.2;
var fade_delta_out = 0.15;
var fade_delay_out = 1;
var disable_fade = false;
var z_index_counter = 100;
var stuff_period = 20;

var bgfaders = [];
var fgfaders = [];
var scfaders = [];
var mofaders = [];
var mof_actual_x = 0;
var mof_actual_y = 0;
var mof_actual_s = 1;

var ctx_hi = null;
var ctx_ht = null;
var head_images_data = new Array();
var actual_head_image = -1;
var head_image_scale = 0;
var last_head_image = -1;
var last_head_image_scale = 0;
var head_image_alpha = 0;
var last_head_image_alpha = 0;
var main_time_last = 0;
var hi_use_raf = false;
var raf_time_last = 0;
var last_head_text_fade_out_delay = 0;
var actual_head_text_fade_in_delay = 0;

//? var fms_initialized = false;
var fms_disable_next_hashchanged = false;
var FMS_filters = [];
var fms_last_opened_option = '';
var fms_last_nazev = '';
var fms_update_after_counter = 0;

var mouseHintShown = false;

var advUpload_filelistBoxes = null;
var advUpload_progressBoxCounter = 0;
var advUpload_uploadList = new Array();
var advUpload_justUploading = false;

var document_scroll_to_x = null;
var document_scroll_to_y = null;
var document_scroll_to_element_id = null;
var document_scroll_to_coef = 2.1;  // must be grater than 2 !!!

var rgba_supported = false;
var tmp = document.createElement('div');
tmp.style.cssText = "background-color: rgba(255,255,255,0.5)";
if(('' + tmp.style.backgroundColor).indexOf('rgba') == 0){
	rgba_supported = true;
}

var calendar_act_type = null;
var calendar_act_pg = null;
var calendar_act_input_element = null;
var calendar_act_year = null;
var calendar_act_month = null;
var calendar_chosen_year = null;
var calendar_chosen_month = null;
var calendar_chosen_day = null;
var calendar_rows = 6;
var calendar_cols = 7;

var ka_calendar_act_type = null;
var ka_calendar_act_pg = null;
var ka_calendar_act_input_element = null;
var ka_calendar_act_year = null;
var ka_calendar_act_month = null;
var ka_calendar_chosen_year = null;
var ka_calendar_chosen_month = null;
var ka_calendar_chosen_day = null;
var ka_calendar_rows = 6;
var ka_calendar_cols = 7;

var subbox_active_id = false;


function reload_parent(inserted_id) {
	my_form = document.forms['form_edit'];
	if (my_form['parent_form'].value) {
		parent_form = window.opener.document.forms[my_form['parent_form'].value];
		parent_form['s'].value = my_form['parent_s'].value;
		if (parent_form['table']) parent_form['table'].value = parent_form['self_table'].value;
		if (parent_form['id']) parent_form['id'].value = parent_form['self_id'].value;
		if (my_form['parent_input'] && my_form['parent_input'].value != "")
			parent_form[my_form['parent_input'].value].value = inserted_id;
		NoUpdate(parent_form);
		parent_form.submit();
	}
	else {
		if (my_form['parent_s'].value != '') {  // novinka:
			window.opener.location.href = '?s=' + my_form['parent_s'].value + (my_form['parent_ss'] && my_form['parent_ss'].value ? '&ss=' + my_form['parent_ss'].value : '');
		}
		else {  // puvodne:
			window.opener.location.reload(true);
		}
	}

	window.close();
}

function time_reload(time_to_close, atable, countdown) {
	if (frames['iframe_checker'].document.forms['form_checker'] && frames['iframe_checker'].document.forms['form_checker']['not_logged_in'].value == '1')
		location.href = './';  // zrejme uprava aplikace - smazan autentifikacni retezec z db - skok na Login
	if (time_reload_stop_flag) {
		document.getElementById('timereload_headtext').innerHTML = '<font color="red">Synchronizace je vypnuta.</font>';
//		frames['iframe_checker'].location.href = 'index_checker.php?stop=1';  // zastav checker
//		return false;  // konec odpocitavani, zadny reload
	}
	if (!countdown) {  // faze porovnavani verze vypsane tabulky a tabulky v databazi
		if (frames['iframe_checker'].document.forms['form_checker']) {  // je iframe nacten?
			if (frames['iframe_checker'].document.forms['form_checker']['table_version_db_'+atable].value == document.forms['form_writedown']['table_version_'+atable].value) {  // tabulka se v db nezmenila
				setTimeout("time_reload("+time_to_close+", '"+atable+"', false);", 1000);  // dalsi kontrola za nejaky cas
				return false;
			}
			else {  // tabulka se v db zmenila!
				frames['iframe_checker'].location.href = 'index_checker.php?stop=1&beep=1';  // zastav checker a zapipej
				document.body.style.backgroundColor = '#f0f0f0';
				if (!time_reload_stop_flag) {  // pokud je synchronizace off, stopne se time_reload()ovani
					setTimeout("time_reload("+time_to_close+", '"+atable+"', true);", 100);  // spust odpocet
				}
				return false;
			}
		}
		else {  // iframe 'checker' se zrejme zrovna reloaduje, pockame...
//			alert('iframe not loaded!');
			frames['iframe_checker'].document.forms['form_checker'];
			setTimeout("time_reload("+time_to_close+", '"+atable+"', false);", 1000);  // retry za sekundu
			return false;
		}
	}
	else {  // faze odpocitavani casu do reloadu stranky
		document.getElementById('timereload_headtext').innerHTML = 'Stránka se přenačte za '+time_to_close+' sekund.';
		if (time_to_close > 0) {
			time_to_close--;
			setTimeout("time_reload("+time_to_close+", '"+atable+"', true);", 1000);  // dalsi krok odpoctu za sekundu
		}
		else {
			window.location.href = './?s=writedown&table=&'+(document.forms['form_writedown']['writedownall'].value == '1' ? 'writedownall=1' : 'timereload=1');  // okamzity reload
		}
	}
}

function time_reload_stop() {
	document.getElementById('a_time_reload_stop').style.display = 'none';
	time_reload_stop_flag = true;
	return false;
}

//-----------------------------------

function ChangeFilterVisibility(that, id) {
	var e = document.getElementById(id);
	if (e.style.display == 'none') {
		e.style.display = 'inline-block';
		that.innerHTML = '<img src="style/icon_find.png" /> Schovat filtry...';
	}
	else {
		e.style.display = 'none';
		that.innerHTML = '<img src="style/icon_find.png" /> Zobrazit filtry...';
	}
	return false;
}

function ChangePagesVisibility(that, id) {
	var e = document.getElementById(id);
	if (e.style.display == 'none') {
		e.style.display = 'inline';
		that.style.display = 'none';
	}
	else {
		e.style.display = 'none';
		that.style.display = 'inline';
	}
	return false;
}

function ChangeVisibility(id) {
	var e = document.getElementById(id);
	if (e.style.display == 'none') {
		e.style.display = 'block';
	}
	else {
		e.style.display = 'none';
	}
	return false;
}

function ChangeSemaphoreState(animg, aformname, aninputname) {
	var aninput = document.forms[aformname][aninputname];
	if (aninput.value == '0') {
		aninput.value = '1';
	}
	else if (aninput.value == '1') {
		aninput.value = '2';
	}
	else {
		aninput.value = '0';
	}
	animg.src = 'style/semaphore_' + aninput.value + '.gif';
}

function ChangeBooleanState(animg, aformname, aninputname) {
	var aninput = document.forms[aformname][aninputname];
	if (aninput.value == '1') {
		aninput.value = '0';
	}
	else {
		aninput.value = '1';
	}
	animg.src = 'style/boolean_' + aninput.value + '.gif';
}

function PotvrdZmenu() {
	return confirm('Opravdu chcete změnit tuto položku?');
}

function PotvrdSmazani() {
	return confirm('Opravdu chcete smazat tuto položku?');
}

function PotvrdOdstraneniObrazku() {
	return confirm('Opravdu chcete obrázek odstranit?');
}

function PotvrdOdhlaseni() {
	return confirm('Opravdu se chcete odhlásit?');
}

function ChangeWritedownTRState(tr_id) {
	var tr = document.getElementById('writedown_tr_' + tr_id);
	changed = tr.className.indexOf('tr_state_abnormal');
	if (changed >= 0)
		tr.className = tr.className.replace('tr_state_abnormal', 'tr_state_normal');
	else
		tr.className = tr.className.replace('tr_state_normal', 'tr_state_abnormal');
	return true;
}


// nulovani podstatnych inputu pri kazde akci [update, delete, ...] je nutne kvuli IE pri pouzivani navigace ZPET, VPRED
// hodnota hidden inputu totiz po Zpet zustane nastavena, tzn. ze se napr. odesle update==delete==1
function NoUpdate(aform) {
	if (aform['action']) aform['action'].value = '';
}

// odeslani formularu po kliku na <a href...> nebo na odesilaci tlacitka provadi tato funkce
function SubmitForm(anaction, aform, atable, anid, parents, valid_data, s2, ss2) {
	document.forms[aform]['table'].value = atable;
	document.forms[aform]['id'].value = anid;
	document.forms[aform]['parents'].value = parents;
	NoUpdate(document.forms[aform]);
	
	if (s2) {
		document.forms[aform]['s2'].value = s2;
	}
	if (ss2) {
		document.forms[aform]['ss2'].value = ss2;
	}

/*-	document.forms[aform]['s2'].value = (s2 ? s2 : '');
	document.forms[aform]['ss2'].value = (ss2 ? ss2 : ''); */

	if (anaction == 'delete') {
		if (!PotvrdSmazani())
			return false;
		document.forms[aform]['s'].value = document.forms[aform]['self_s'].value;
		document.forms[aform]['ss'].value = document.forms[aform]['self_ss'].value;
		document.forms[aform]['action'].value = anaction;
	}
	else if (anaction == 'update' || anaction == 'direct_edit' || anaction == 'cancel') {
		document.forms[aform]['s'].value = document.forms[aform]['self_s'].value;
		document.forms[aform]['ss'].value = document.forms[aform]['self_ss'].value;
		document.forms[aform]['action'].value = anaction;
	}
	else if (anaction == 'new_mail') {
		document.forms[aform]['s'].value = 'posta';
		document.forms[aform]['ss'].value = 'new_mail';
		document.forms[aform]['action'].value = anaction;
	}
	else if (anaction == 'command') {
//+		document.forms[aform]['s'].value = 'writedown';   //+ !!!???!!!
		document.forms[aform]['s'].value = document.forms[aform]['self_s'].value;
		document.forms[aform]['ss'].value = document.forms[aform]['self_ss'].value;
		document.forms[aform]['action'].value = anaction;
	}
	else {
		document.forms[aform]['s'].value = anaction;
	}

	if (typeof(document.forms[aform]['valid_data']) != "undefined") {
		if (valid_data) {
			document.forms[aform]['valid_data'].value = '1';
		}
		else {
			document.forms[aform]['valid_data'].value = '0';
		}
	}

	ShowDisablerTransfer();
	document.forms[aform].submit();  // odeslani formulare
	return false;
}

function SubmitCommand(aform, atable, anid, acommand, parents) {
	document.forms[aform]['command'].value = acommand;
	return SubmitForm('command', aform, atable, anid, parents, true);
}

function SubmitListing(aform, atable, listingtable, thefirst, parents) {
	if (thefirst >= 0 && document.forms[aform]['writedown_listing_first_' + listingtable]) {
		document.forms[aform]['writedown_listing_first_' + listingtable].value = thefirst;
	}
	return SubmitForm(document.forms[aform]['self_s'].value, aform, atable, document.forms[aform]['self_id'].value, parents, true);
}

function SubmitListingAll(aform, atable, listingtable, parents) {
	document.forms[aform]['writedown_listing_perpage_' + listingtable].value = '0';
	return SubmitForm(document.forms[aform]['self_s'].value, aform, atable, document.forms[aform]['self_id'].value, parents, true);
}

function SubmitSetSelect(aform, atable, listingtable, /*r source_el,*/ val, destination_el_name, parents) {
//r	var val = source_el.value;
	var de = document.forms[aform][destination_el_name];
	for (var i = 0; i < de.length; i++) {
		if (de[i].value == val) {
			de[i].selected = true;
		}
		else {
			de[i].selected = false;
		}
	}
	return SubmitListing(aform, atable, listingtable, 0, '');
}

function SubmitOrdering(aform, atable, orderby_idx, direction_idx, parents) {
	document.forms[aform]['razeni_' + atable + '_sloupec'].selectedIndex = orderby_idx;
	document.forms[aform]['razeni_' + atable + '_smer'].selectedIndex = direction_idx;
	return SubmitForm(document.forms[aform]['self_s'].value, aform, document.forms[aform]['self_table'].value, document.forms[aform]['self_id'].value, parents, true);
}

function SubmitDirectEdit(aform, atable, anid, acolumn, avalue, parents) {
	if (!PotvrdZmenu())
		return false;
	document.forms[aform]['direct_edit_column'].value = acolumn;
	document.forms[aform]['direct_edit_value'].value = avalue;
	return SubmitForm('direct_edit', aform, atable, anid, parents, true);
}

function PrintTableItem(table, id, rest_params) {
	okno = window.open('index_print.php?table=' + table + '&id=' + id + (rest_params != '' ? '&'+rest_params : ''), 'print', 'left=5,top=5,scrollbars=yes,width=830,height=590,resizable=yes,menubar=yes');
	okno.focus();
	return false;
}

function SubmitSetMail(aform, anid, predmet, id_prijemce, parents) {
	document.forms[aform]['action'].value = 'new_mail';
	if (predmet !== false) {
		document.forms[aform]['edit_zpravy_predmet__preset'].value = predmet;
	}
	if (id_prijemce !== false) {
		document.getElementById('secondaryedit_uzivatele_vyber_000').name = 'secondaryedit_uzivatele_vyber_'+id_prijemce;
		document.getElementById('secondaryedit_uzivatele_vyber_000').value = '1';
	}
	return SubmitForm(anid == '0' ? 'new_mail' : 'posta', aform, 'zpravy', anid, parents, true);
}

function SubmitShowWin(href) {
	var o = document.getElementById('detail_iframe');
	document.getElementById('body').onresize = function(){ BodyResized(); };
	var odoc = (o.contentDocument ? o.contentDocument : o.contentWindow.document);
	odoc.getElementById("body").innerHTML = '<p style="text-align: center; padding: 20px 20px 30px 20px;"><b>Nahrávám data...</b></p>';
	BodyResized();
	ResizeDisabler(true);
	o.src = href;
	return false;
}

function SubmitShowDetail(atable, anid, rest_params) {
	var o = document.getElementById('detail_iframe');
	o.style.width = 'auto';
	o.style.height = 'auto';
//	o.onload = function(){ DetailOnLoad(); };
	document.getElementById('body').onresize = function(){ BodyResized(); };
	var odoc = (o.contentDocument ? o.contentDocument : o.contentWindow.document);
	odoc.getElementById("body").innerHTML = '<p style="text-align: center; padding: 20px 20px 30px 20px;"><b>Nahrávám data...</b></p>';
	ElementAddClass(document.getElementById('body'), 'disable_scroll');
	BodyResized();
	ResizeDisabler(true);
//	o.style.visibility = 'visible';
	o.src = './?s=detail&show_content_only=1&table='+atable+'&id='+anid+(rest_params !== undefined ? '&'+rest_params : '');
	return false;
}
function SubmitShowDetailZpravy(anid, tr_element) {
	tr_element.className = tr_element.className.replace('tr_zprava_nova', 'tr_zprava_prectena');
	SubmitShowDetail('zpravy', anid);
}
function SubmitTreeMove(aform, atable, anid, direction, parents) {
	document.forms[aform]['tree_move_direction'].value = direction;
	return SubmitCommand(aform, atable, anid, 'strom_posun', parents);
}


function DetailOnLoad() {
	ResizeDisabler(true);
	ResizeDetailIframe(true);
}
function ParentDetailOnLoad() {
	if (window.parent)
		window.parent.DetailOnLoad();
}

function BodyResized() {
	ResizeDisabler(false);
	ResizeDetailIframe(false);
}

function ResizeDisabler(show) {
	var o = document.getElementById('disabler');
	if (!o) {
		return;
	}
//2	var o2 = document.getElementById('disabler_loading');
/*2	var winw = WinW();
	var winh = WinH();
	var docsize = GetScrollXY();
	var docleft = docsize[0];
	var doctop = docsize[1];

	o.style.left = Math.round(docleft) + 'px';
	o.style.width = Math.round(winw) + 'px';
	o.style.height = Math.round(Math.max(document.body.scrollHeight, winh)) + 'px';
*/
/*-
	o.style.top = Math.round(doctop) + 'px';
	o.style.width = Math.round(Math.max(document.body.scrollWidth, winw)) + 'px';
	o.style.height = Math.round(winh) + 'px';
*/
//2	o2.style.left = Math.round(docleft + (winw - 39) / 2) + 'px';
//2	o2.style.top = Math.round(doctop + (winh - 39) / 2) + 'px';
	if (show) {
//ě		o2.style.visibility = 'visible';
		o.style.visibility = 'visible';
	}
}
function ResizeDetailIframe(show) {
	var o = document.getElementById('detail_iframe');
	if (!o) {
		return;
	}
	var oclose = document.getElementById('detail_close');
	var winw = WinW();
	var winh = WinH();
	var docsize = GetScrollXY();
//2	var docleft = docsize[0];
//2	var doctop = docsize[1];
	var docleft = 0;
	var doctop = 0;
	var odoc = (o.contentDocument ? o.contentDocument : o.contentWindow.document);
	var width = Math.min(detail_iframe_max_width, Math.round(winw * detail_iframe_max_width_coef));
	var html_tags = odoc.getElementsByClassName("div_form_detail");
	if (html_tags.length == 1) {
		var temp_patt = new RegExp("^[0-9]+px$");
		if (temp_patt.test(html_tags[0].style.width)) {
			var width_preset = parseInt(html_tags[0].style.width.substr(0, html_tags[0].style.width.length - 2));
			if (width_preset > 0) {
				width = width_preset + detail_iframe_width_add;
			}
		}
	}
	width = Math.min(width, Math.round(winw * detail_iframe_max_width_coef));
	
	var height = Math.max(Math.min(odoc.getElementById("body").scrollHeight, winh * 0.9), 10);
	o.style.width = width + 'px';
	o.style.height = height + 'px';
	o.style.left = Math.max(0, Math.round(docleft + (winw - width) / 2)) + 'px';

	var o_s_top = Math.round(doctop + (winh - height) / 2);
	o.style.top = o_s_top + 'px';
	oclose.style.left = Math.round(docleft + (winw + width) / 2 + /* 1 */ - 65) + 'px';
	oclose.style.top = (o_s_top + 1) + 'px'; //Math.round(doctop + (winh + height) / 2 - 48) + 'px';
	
	if (show) {
		o.style.visibility = 'visible';
		oclose.style.visibility = 'visible';
		o.focus();
	}
}
function HideDetail(not_all) {
	var o = document.getElementById('detail_iframe');
	o.style.visibility = 'hidden';
	document.getElementById('detail_close').style.visibility = 'hidden';
	if (!not_all) {
		document.getElementById('disabler').style.visibility = 'hidden';
//2		document.getElementById('disabler_loading').style.visibility = 'hidden';
	}
	var odoc = (o.contentDocument ? o.contentDocument : o.contentWindow.document);
	odoc.getElementById("body").innerHTML = '';
	ElementRemoveClass(document.getElementById('body'), 'disable_scroll');
	return false;
}

function DocW() {
	return Math.max(document.body.scrollWidth, document.body.offsetWidth, document.documentElement.clientWidth, document.documentElement.scrollWidth, document.documentElement.offsetWidth);
}
function DocH() {
	return Math.max(document.body.scrollHeight, document.body.offsetHeight, document.documentElement.clientHeight, document.documentElement.scrollHeight, document.documentElement.offsetHeight);
}
function WinW() {
if (document.documentElement && document.documentElement.clientWidth)
	/* MSIE6 v std. režimu, popr. Opera a Mozilla */
	return document.documentElement.clientWidth;
else if (window.innerWidth)
	/* NN4 a kompatibilní prohlížeče */
	return window.innerWidth;
else if (document.body && document.body.clientWidth)
	/* starší MSIE + MSIE6 v quirk režimu */
	return document.body.clientWidth;
else
	return null;
}
function WinH() {
if (document.documentElement && document.documentElement.clientHeight)
	/* MSIE6 v std. režimu, popr. Opera a Mozilla */
	return document.documentElement.clientHeight;
else if (window.innerHeight)
	/* NN4 a kompatibilní prohlížeče */
	return window.innerHeight;
else if (document.body && document.body.clientHeight)
	/* starší MSIE + MSIE6 v quirk režimu */
	return document.body.clientHeight;
else
	return null;
}
function GetScrollXY() {
  var scrOfX = 0, scrOfY = 0;
  if( typeof( window.pageYOffset ) == 'number' ) {
    //Netscape compliant
    scrOfY = window.pageYOffset;
    scrOfX = window.pageXOffset;
  } else if( document.body && ( document.body.scrollLeft || document.body.scrollTop ) ) {
    //DOM compliant
    scrOfY = document.body.scrollTop;
    scrOfX = document.body.scrollLeft;
  } else if( document.documentElement && ( document.documentElement.scrollLeft || document.documentElement.scrollTop ) ) {
    //IE6 standards compliant mode
    scrOfY = document.documentElement.scrollTop;
    scrOfX = document.documentElement.scrollLeft;
  }
  return [ scrOfX, scrOfY ];
}


function FillInputNow(aform, aninput) {
//	now = new Date();
//	document.forms[aform][aninput].value = now.getDate() + '.' + (now.getMonth() + 1) + '.' + now.getFullYear() + ' ' + (unescape(now.getHours()).length < 2 ? '0' : '') + now.getHours() + ':' + (unescape(now.getMinutes()).length < 2 ? '0' : '') + now.getMinutes()/* + ':' + (unescape(now.getSeconds()).length < 2 ? '0' : '') + now.getSeconds()*/;
	if (document.forms[aform][aninput + '__actual'].checked) {
		document.forms[aform][aninput + '__old_value'].value = document.forms[aform][aninput].value;
		document.forms[aform][aninput].style.display = 'none';
		document.forms[aform][aninput].value = '--actual--';
	}
	else {
		document.forms[aform][aninput].value = document.forms[aform][aninput + '__old_value'].value;
		document.forms[aform][aninput].style.display = 'inline';
	}
	return true;
}

function OpenCalendar(aform, aninput, table, column, cas) {
	if (document.forms[aform][aninput + '__actual'] && document.forms[aform][aninput + '__actual'].checked == true) {
		document.forms[aform][aninput + '__actual'].checked = false;
		FillInputNow(aform, aninput);
	}
	okno = window.open('index_kalendar.php?form=' + document.forms[aform].name + '&input=' + aninput + '&cas=' + cas + '&datum=' + document.forms[aform][aninput].value, 'kalendar', 'left=400,top=100,scrollbars=yes,width=415,height=415,resizable=yes');
	okno.focus();
	return false;
}

function OpenCalendar2(aform, aninput) {
	return ShowCalendar(aform, aninput);
	// okno = window.open('index_kalendar2.php?form=' + aform + '&input=' + aninput + '&datum=' + document.forms[aform][aninput].value, 'kalendar', 'left=400,top=100,scrollbars=yes,width=415,height=415,resizable=yes');
	// okno.focus();
	// return false;
}


function WriteInputCasDo(aform, aninput, datum, hod, min) {
	hod = parseInt(hod, 10);
	min = parseInt(min, 10);
	hod += 1;  // o hodinu pozdeji...
	if (hod >= 24) {
		hod = 23;
		min = 59;
	}
	window.opener.document.forms[aform][aninput].value = datum + ' ' + ((hod < 10 ? '0' : '') + hod) + ':' + ((min < 10 ? '0' : '') + min);
}

/*xxx
function ShowSubMenu(id_parent) {
	return ShowOrHideElement('submenu_' + id_parent, 'show');
}
function HideSubMenu(id_parent) {
	return ShowOrHideElement('submenu_' + id_parent, 'hide');
}
*/


function ShowSubMenu(id_parent) {
	PushOrChangeFader('submenu_' + id_parent, fade_delta_in);
	return false;
}

function HideSubMenu(id_parent) {
	PushOrChangeFader('submenu_' + id_parent, -fade_delta_out);
	return false;
}

function PushOrChangeFader(eid, fade_delta, no_z_index, display_mode) {
	var e = document.getElementById(eid);
	if (!e) {
		return;
	}
	var idx = -1;
	for (var i = 0; i < faders.length; i++) {
		if (faders[i][0] == eid) {
			faders[i][2] = fade_delta;
			idx = i;
			break;
		}
	}
	if (idx < 0) {
		if (!disable_fade) {
			e.className += ' opacity_class';
		}
		faders.push([eid, (fade_delta < 0 ? fade_full : 0), fade_delta, 0]);
	}
	if (fade_delta > 0) {
		if (e.style.display == 'none' || e.style.display == '') {
			e.style.display = (display_mode ? display_mode : 'block');
			SetOpacity(e, 0);
		}
		if (!no_z_index) {
			e.style.zIndex = ++z_index_counter;
		}
	}
}

// faders[i][0] .. eid
// faders[i][1] .. fade_step
// faders[i][2] .. fade_delta
// faders[i][3] .. fade_delay_out

function ProcessFaders() {
	for (var i = 0; i < faders.length; i++) {
		if (faders[i][2] == 0) {
			continue;
		}
		var e = document.getElementById(faders[i][0]);
		if (!e) {
			continue;
		}
		
		var e_op = faders[i][1];
		var e_d = faders[i][2];
		if (e_d < 0 && e_op + e_d <= 0) {
			SetOpacity(e, 0);
			e.style.display = 'none';
			faders[i][1] = 0;
			faders[i][2] = 0;
		}
		else if (e_d > 0 && e_op + e_d >= fade_full) {
			SetOpacity(e, fade_full);
			faders[i][1] = fade_full;
			faders[i][2] = 0;
			faders[i][3] = fade_delay_out;
		}
		else {
			if (e_d < 0 && faders[i][3] > 0) {
				faders[i][3]--;
			}
			else {
				faders[i][1] = e_op + e_d;
				SetOpacity(e, faders[i][1]);
			}
		}
	}
}

function SetOpacity(e, opacity) {
	if (disable_fade) {
		return;
	}
	if (e.style.opacity != null) {
		e.style.opacity = opacity;
	}
	else if (navigator.appName.indexOf("Microsoft") != -1 && parseInt(navigator.appVersion) >= 4) {
		e.style.filter = "alpha(opacity=" + Math.round(opacity * 100) + ")";
	}
}



///////////////// BG FADERS ////////////////////////////////////

function PushOrChangeBgFader(eid, fade_delta, color_1, color_2) {
	
	var idx = -1;
	for (var i = 0; i < bgfaders.length; i++) {
		if (bgfaders[i][0] == eid) {
			bgfaders[i][2] = fade_delta;
			idx = i;
			break;
		}
	}

	
	// prepare colors
	
	if (typeof color_1 === 'undefined' && idx >= 0) {
		// ok, colors are set by previous run
	}
	else {
		var color_1_rgb;
		var color_2_rgb;
		var color_num = null;
		
		if ((color_1 instanceof Array) && color_1.length >= 3) {
			color_1_rgb = [color_1[0], color_1[1], color_1[2], color_1.length > 3 ? color_1[3] : 1];
		}
		else {
			color_num = (color_1 ? parseInt(color_1) : 0) % menu_colors.length;
			color_1_rgb = menu_colors[color_num];
		}
		
		if (typeof color_2 === 'undefined') {
			color_2_rgb = menu_colors_2[color_num + 0];  // null + 0 = 0
		}
		else {
			if ((color_2 instanceof Array) && color_2.length >= 3) {
				color_2_rgb = [color_2[0], color_2[1], color_2[2], color_2.length > 3 ? color_2[3] : 1];
			}
			else {
				color_2_rgb = menu_colors[color_2 ? parseInt(color_2) : 0];
			}
		}
		
		if (color_1_rgb.length == 3) {
			color_1_rgb.push(1);
		}
		if (color_2_rgb.length == 3) {
			color_2_rgb.push(1);
		}
		
		if (idx < 0) {
			bgfaders.push([eid, 0, fade_delta, 0, color_1_rgb, color_2_rgb]);
		}
		else {
			bgfaders[idx][4] = color_1_rgb;  // update colors
			bgfaders[idx][5] = color_2_rgb;
		}
	}
	
}

// bgfaders[i][0] .. eid
// bgfaders[i][1] .. fade_step
// bgfaders[i][2] .. fade_delta
// bgfaders[i][3] .. fade_delay_out
// bgfaders[i][4] .. color_1_rgb
// bgfaders[i][5] .. color_2_rgb

function ProcessBgFaders() {
	for (var i = 0; i < bgfaders.length; i++) {
		if (bgfaders[i][2] == 0) {
			continue;
		}
		var e = document.getElementById(bgfaders[i][0]);
		if (!e) {
			continue;
		}
		
		var e_op = bgfaders[i][1];
		var e_d = bgfaders[i][2];
		if (e_d < 0 && bgfaders[i][3] > 0) {
			bgfaders[i][3]--;
		}
		else {
			if (e_d < 0 && e_op + e_d <= 0) {
				bgfaders[i][1] = 0;
				bgfaders[i][2] = 0;
			}
			else if (e_d > 0 && e_op + e_d >= 1) {
				bgfaders[i][1] = 1;
				bgfaders[i][2] = 0;
				bgfaders[i][3] = fade_delay_out;
			}
			else {
				bgfaders[i][1] = e_op + e_d;
			}
			var temp_r = Math.round(bgfaders[i][5][0] + bgfaders[i][1] * (bgfaders[i][4][0] - bgfaders[i][5][0]));
			var temp_g = Math.round(bgfaders[i][5][1] + bgfaders[i][1] * (bgfaders[i][4][1] - bgfaders[i][5][1]));
			var temp_b = Math.round(bgfaders[i][5][2] + bgfaders[i][1] * (bgfaders[i][4][2] - bgfaders[i][5][2]));
			var temp_a = bgfaders[i][5][3] + bgfaders[i][1] * (bgfaders[i][4][3] - bgfaders[i][5][3]);
			if (rgba_supported) {
				e.style.backgroundColor = 'rgba('+temp_r+','+temp_g+','+temp_b+','+temp_a+')';
			}
			else {
				e.style.backgroundColor = 'rgb('+Math.max(temp_r, Math.round((1 - temp_a) * 255))+','+Math.max(temp_g, Math.round((1 - temp_a) * 255))+','+Math.max(temp_b, Math.round((1 - temp_a) * 255))+')';
			}
		}
	}
}


/////////////////


///////////////// FG FADERS ////////////////////////////////////

function PushOrChangeFgFader(eid, fade_delta, invert) {
	var idx = -1;
	for (var i = 0; i < fgfaders.length; i++) {
		if (fgfaders[i][0] == eid) {
			fgfaders[i][2] = fade_delta;
			idx = i;
			break;
		}
	}
	if (idx < 0) {
		fgfaders.push([eid, 0, fade_delta, 0, invert ? 1 : 0]);
	}
}

// fgfaders[i][0] .. eid
// fgfaders[i][1] .. fade_step
// fgfaders[i][2] .. fade_delta
// fgfaders[i][3] .. fade_delay_out
// fgfaders[i][4] .. invert

function ProcessFgFaders() {
	var fgcolors = [[58, 170, 53], [68, 199, 62]];
	
	for (var i = 0; i < fgfaders.length; i++) {
		if (fgfaders[i][2] == 0) {
			continue;
		}
		var e = document.getElementById(fgfaders[i][0]);
		if (!e) {
			continue;
		}
		
		var e_op = fgfaders[i][1];
		var e_d = fgfaders[i][2];
		if (e_d < 0 && fgfaders[i][3] > 0) {
			fgfaders[i][3]--;
		}
		else {
			if (e_d < 0 && e_op + e_d <= 0) {
				fgfaders[i][1] = 0;
				fgfaders[i][2] = 0;
			}
			else if (e_d > 0 && e_op + e_d >= 1) {
				fgfaders[i][1] = 1;
				fgfaders[i][2] = 0;
				fgfaders[i][3] = fade_delay_out;
			}
			else {
				fgfaders[i][1] = e_op + e_d;
			}
			var temp_r = Math.round(fgcolors[fgfaders[i][4]][0] + fgfaders[i][1] * (fgcolors[fgfaders[i][4] ? 0 : 1][0] - fgcolors[fgfaders[i][4]][0]));
			var temp_g = Math.round(fgcolors[fgfaders[i][4]][1] + fgfaders[i][1] * (fgcolors[fgfaders[i][4] ? 0 : 1][1] - fgcolors[fgfaders[i][4]][1]));
			var temp_b = Math.round(fgcolors[fgfaders[i][4]][2] + fgfaders[i][1] * (fgcolors[fgfaders[i][4] ? 0 : 1][2] - fgcolors[fgfaders[i][4]][2]));
			e.style.color = 'rgb('+temp_r+','+temp_g+','+temp_b+')';
		}
	}
}

/////////////////


///////////////// MOTION FADERS ////////////////////////////////////

function PushOrChangeMotionFader(eid, fade_delta, target_x, target_y, target_s, start_x, start_y, start_s) {
	var e = document.getElementById(eid);
	if (!e) {
		return;
	}
	var params = [start_x, start_y, start_s, target_x, target_y, target_s];
	
	var idx = -1;
	for (var i = 0; i < mofaders.length; i++) {
		if (mofaders[i][0] == eid) {
//x			mofaders[i][1] = 0;
			mofaders[i][2] = fade_delta;
			mofaders[i][3] = params;
			idx = i;
			break;
		}
	}
	if (idx < 0) {
		mofaders.push([eid, 0, fade_delta, params]);
	}
}

// mofaders[i][0] .. eid
// mofaders[i][1] .. fade_step
// mofaders[i][2] .. fade_delta   // >= 0
// mofaders[i][3][0] .. motion_start_x
// mofaders[i][3][1] .. motion_start_y
// mofaders[i][3][2] .. motion_start_s
// mofaders[i][3][3] .. motion_target_x
// mofaders[i][3][4] .. motion_target_y
// mofaders[i][3][5] .. motion_target_s

function ProcessMotionFaders() {
	for (var i = 0; i < mofaders.length; i++) {
		if (mofaders[i][2] == 0) {
			continue;
		}
		var e = document.getElementById(mofaders[i][0]);
		if (!e) {
			continue;
		}


/****
		if (e_d < 0 && e_op + e_d <= 0) {
			fgfaders[i][1] = 0;
			fgfaders[i][2] = 0;
		}
		else if (e_d > 0 && e_op + e_d >= 1) {
			fgfaders[i][1] = 1;
			fgfaders[i][2] = 0;
			fgfaders[i][3] = fade_delay_out;
		}
		else {
			fgfaders[i][1] = e_op + e_d;
		}
		var temp_r = Math.round(fgcolors[fgfaders[i][4]][0] + fgfaders[i][1] * (fgcolors[fgfaders[i][4] ? 0 : 1][0] - fgcolors[fgfaders[i][4]][0]));
		var temp_g = Math.round(fgcolors[fgfaders[i][4]][1] + fgfaders[i][1] * (fgcolors[fgfaders[i][4] ? 0 : 1][1] - fgcolors[fgfaders[i][4]][1]));
		var temp_b = Math.round(fgcolors[fgfaders[i][4]][2] + fgfaders[i][1] * (fgcolors[fgfaders[i][4] ? 0 : 1][2] - fgcolors[fgfaders[i][4]][2]));
		e.style.color = 'rgb('+temp_r+','+temp_g+','+temp_b+')';
****/

		var e_op = mofaders[i][1];
		var e_d = mofaders[i][2];

		if (e_d < 0 && e_op + e_d <= 0) {
			mofaders[i][1] = 0;
			mofaders[i][2] = 0;
		}
		else if (e_d > 0 && e_op + e_d >= 1) {
			mofaders[i][1] = 1;
			mofaders[i][2] = 0;
		}
		else {
			mofaders[i][1] = e_op + e_d;
		}
		e.style.transform = 'scale('
								+ (Math.round((mofaders[i][3][2] + (1 - Math.cos(Math.pow(mofaders[i][1], 1) * Math.PI)) / 2 * (mofaders[i][3][5] - mofaders[i][3][2])) * 10000) / 10000)
							+ ') translate('
								+ (Math.round((mofaders[i][3][0] + (1 - Math.cos(Math.pow(mofaders[i][1], 1) * Math.PI)) / 2 * (mofaders[i][3][3] - mofaders[i][3][0])) * 10000) / 10000)
								+ '%, '
								+ (Math.round((mofaders[i][3][1] + (1 - Math.cos(Math.pow(mofaders[i][1], 1) * Math.PI)) / 2 * (mofaders[i][3][4] - mofaders[i][3][1])) * 10000) / 10000)
								+ '%'
							+ ')'
		;
	}
}

/////////////////



function ShowElement(element_id, display_mode, fade, fade_len, no_z_index) {
	return ShowOrHideElement(element_id, 'show', display_mode, fade, fade_len, no_z_index)
}
function HideElement(element_id, display_mode, fade, fade_len, no_z_index) {
	return ShowOrHideElement(element_id, 'hide', display_mode, fade, fade_len, no_z_index)
}


function ShowOrHideElement(element_id, command, display_mode, fade, fade_len, no_z_index) {
	var e = document.getElementById(element_id);
	if (!e) {
		return false;
	}
	if (!display_mode) {
		display_mode = 'block';
	}

	if (command != 'show' && command != 'hide') {
		if (e.style.display != 'none') {
			command = 'hide';
		}
		else {
			command = 'show';
		}
	}
	
	if (command == 'show') {
		if (!fade) {
			e.style.display = display_mode;
		}
		else {
			PushOrChangeFader(element_id, fade_len ? fade_len : fade_delta_in, no_z_index, display_mode);
		}
	}
	else if (command == 'hide') {
		if (!fade) {
			e.style.display = 'none';
		}
		else {
			PushOrChangeFader(element_id, fade_len ? -fade_len : -fade_delta_out, no_z_index, display_mode);
		}
	}
	
	return false;
}

function CheckAll(aform, input_name, id_writtendown) {
	var ids = document.forms[aform][id_writtendown].value.split(",");
	for (var i = 0; i < ids.length; i++) {
		document.forms[aform][input_name+'_'+ids[i]].checked = true;
	}
	return false;
}

function UnCheckAll(aform, input_name, id_writtendown) {
	var ids = document.forms[aform][id_writtendown].value.split(",");
	for (var i = 0; i < ids.length; i++) {
		document.forms[aform][input_name+'_'+ids[i]].checked = false;
	}
	return false;
}

function FocusLogin() {
	var e_dfl_login = document.forms['form_login']['login'];
	var e_dfl_password = document.forms['form_login']['password'];
	if (e_dfl_login && e_dfl_login.value == '' && e_dfl_password && e_dfl_password.value == '') {
		e_dfl_login.focus();
	}
}

function Init() {
// */
/*
	if (document.getElementById('admin_menu')) {
		document.getElementById('admin_menu').onmousemove = AdminMenuMouseMove;
		AdminMenuRedraw(null);
	}
*/	
	var i_buboximage_ids = document.getElementById('buboximage_ids');
	if (i_buboximage_ids && i_buboximage_ids.value != '') {
		var buboximage_ids = i_buboximage_ids.value.split(',');
		var e;
		for (var i = 0; i < buboximage_ids.length; i++) {
			e = document.getElementById('bublina_box_gfx_'+buboximage_ids[i]);
			if (e) {
//+				e.onmousemove = BublinaBoxMouseMove;
				BublinaBoxCenter(buboximage_ids[i]);
			}
/*x			e = document.getElementById('bublina_box_'+buboximage_ids[i]);
			if (e) {
				e.onmouseover = BublinaBoxMouseOver;
				e.onmouseout = BublinaBoxMouseOut;
			} */
		}
	}
	

	if (document.getElementsByTagName) {
/*
		if (document.getElementById('imagebox_head')) {
			var ib = ImageBox.createFromList('imagebox_head', [
				'style/head_images/pict_01.jpg',
				'style/head_images/pict_02.jpg',
				'style/head_images/pict_03.jpg'
			]);
			ib.toggleSlideshow(true);
		}
*/
		ImageBox.createAll("inner_content");
	}
	
	if (advUpload_filelistBoxes) {
		var adv_mode = false;
		if (window.XMLHttpRequest && window.URL && window.URL.createObjectURL) {
			adv_mode = true;
		}
		
//F		for (var i = 0; i < advUpload_filelistBoxes.length; i++) {
		advUpload_filelistBoxes.forEach(  // forEach is used because creates new context and we need this to addEventListener('drop', ...)
			function (advUpload_filelistBox) {
				var elements_postfix = advUpload_filelistBox[0] + advUpload_filelistBox[1] + '_' + advUpload_filelistBox[2] + '_' + advUpload_filelistBox[3];
				var box_show = null;
				if (adv_mode) {
					
					var e_dropArea = document.getElementById('file_upload_drop_area_' + elements_postfix);
					if (e_dropArea) {
						e_dropArea.addEventListener('dragover', AdvUpload_DragOver, false);
						e_dropArea.addEventListener('dragenter', AdvUpload_DragEnter, false);
						e_dropArea.addEventListener('dragleave', AdvUpload_DragLeave, false);
	//Q					e_dropArea.addEventListener('drop', AdvUpload_FilesDropped, false);
	/*Q*/
						e_dropArea.addEventListener('drop', function(e) {
							e.stopPropagation();
							e.preventDefault();
							AdvUpload_FilesDropped(e, [advUpload_filelistBox[1], advUpload_filelistBox[2], advUpload_filelistBox[3]]);
						}, false);
	/*Q*/
					}
					
					box_show = document.getElementById('file_upload_advanced_box_' + elements_postfix);
				}
				else {
					box_show = document.getElementById('file_upload_inputs_box_' + elements_postfix);
				}
				
				if (box_show) {
					box_show.style.display = 'block';
				}
			}  // function of foreach
		);  // foreach
//F		}  // for
	}

	if (00 && isIE) {
		disable_fade = true;
		fade_delta_in = 1;
		fade_delta_out = 1;
		fade_delay_out = 0;
		stuff_period = 200;
	}
	DoTheStuff();

//f	window.onhashchange = WindowHashChanged;
	window.onkeydown = FMS_KeyBody;
	window.onclick = FMS_ClickBody;
/*f	
	if (location.hash != '') {
		WindowHashChanged();
	}
	else {
		if ("FMS_initial_adds" in window) {
			AddInitialAdds(FMS_initial_adds);
		}
		
//?		fms_initialized = true;
		
		if (document.getElementById('fmsi_results_box')) {
			FMS_Load('', false, true);
		}
	}
f*/	
	var start_sor = document.getElementById('start_strom_opened_roles');
	if (start_sor && start_sor.value != '') {
		var arr_sor = start_sor.value.split(',');
		for (var i = 0; i < arr_sor.length; i++) {
			CBGroupClick(arr_sor[i], 'set');
		}
	}
	
	if (document.getElementById('ka_calendar_box')) {
		KA_InitCalendar();
	}

	var e_rg = document.getElementById('run_graf');
	if (e_rg && e_rg.value != '') {
		AjaxLoad([e_rg.value]);
	}

	MouseHintInit();
	
	HideDisablerTransfer();
	
	// var hpv = document.getElementById('hp_video');
	// if (hpv) {
		// setTimeout("document.getElementById('hp_video').play();", 500);
	// }
	
	// PlgAnimNext();

	if (document.getElementById('content_banner_img_1')) {
		ShowNextContentBannerImage();
	}
}

var plg_anim_a = 0;

function PlgAnimNext() {
	var e_bgu2 = document.getElementById('bg_underlayer2');
	if (e_bgu2) {
		plg_anim_a = (plg_anim_a + 20) % 360;
		e_bgu2.style.transform = 'translate(-50%, -50%) rotate(' + plg_anim_a + 'deg)';
		setTimeout("PlgAnimNext()", 2000);
	}
}

var content_banner_actual_image = 0;

function ShowNextContentBannerImage() {
	if (content_banner_actual_image) {
		var e_cbi_last = document.getElementById('content_banner_img_' + content_banner_actual_image);
		ElementRemoveClass(e_cbi_last, 'content_banner_img_active');
	}
	
	content_banner_actual_image++;
	var e_cbi = document.getElementById('content_banner_img_' + content_banner_actual_image);
	if (!e_cbi) {
		content_banner_actual_image = 1;
		e_cbi = document.getElementById('content_banner_img_' + content_banner_actual_image);
	}
	ElementAddClass(e_cbi, 'content_banner_img_active');
	
	setTimeout("ShowNextContentBannerImage();", 16000);
}

function FMS_DestroyFilters() {
	if ("FMS_filters" in window) {
		FMS_filters = [];
	}
}

function AddInitialAdds(fms_ia) {
	for (var i = 0; i < fms_ia.length; i++) {
		FMS_AddItem(fms_ia[i][0], fms_ia[i][1], fms_ia[i][2], fms_ia[i][3], true, fms_ia[i][4]);  // true .. dont_load
		
		if (fms_ia[i][0] == 'nazev') {
			fms_last_nazev = fms_ia[i][1];
		}
	}
}


function InitHeadImages() {
	if (document) {
		var chi = document.getElementById('canvas_head_images');
		if (chi && chi.getContext) {
			ctx_hi = chi.getContext('2d');
			if (window.requestAnimationFrame) {
				hi_use_raf = true;
			}
			
			var cht = document.getElementById('canvas_head_texts');
			if (cht && cht.getContext) {
				ctx_ht = cht.getContext('2d');
			}
			
			LoadNextHeadImage();
		}
	}
	else {
		setTimeout("InitHeadImages();", 300);  // retry
	}
}

function LoadNextHeadImage() {
	if (head_images_count < head_images_filenames.length) {
		var img = new Image();
		img.onload = function() {
			HeadImageLoaded(this);
		};
		img.src = head_images_filenames[head_images_count];
	}
}

function HeadImageLoaded(e_img) {
	head_images_data.push(e_img);
	
	head_images_count++;
	
//-	console.log('Image '+head_images_count+' loaded.');
	ctx_hi.globalAlpha = 0.01;
	ctx_hi.drawImage(e_img, 0, hi_height - 1);  // proti prvotnimu skubnuti
	
	LoadNextHeadImage();
	
	if (head_images_count == 1) {  // first image loaded
		ShowNextHeadImage();
		if (hi_use_raf) {
			window.requestAnimationFrame(TransformHeadImage);
		}
		else {
			TransformHeadImage();
		}
	}
}

function ShowNextHeadImage(force) {
	var num = actual_head_image + 1;
	if (num >= head_images_count) {
		num = 0;
	}
	SetNextHeadImage(num, force);
}

function ShowPrevHeadImage(force) {
	var num = actual_head_image - 1;
	if (num < 0) {
		num = head_images_count - 1;
	}
	SetNextHeadImage(num, force);
}

function SetNextHeadImage(image_num, force) {
	if (image_num < 0 || image_num >= head_images_count) {
		return;
	}
	
	if (last_head_text_fade_out_delay > 0) {
		PushOrChangeFader('head_text_' + last_head_image, -0.04, true);
		last_head_text_fade_out_delay = 0;
	}
	
	last_head_image = actual_head_image;  // -1, 0, 1, 2, ...
	last_head_image_scale = head_image_scale;
	last_head_image_alpha = head_image_alpha;
	
	actual_head_image = image_num;
	
	if (last_head_image >= 0) {
		if (force) {
			PushOrChangeFader('head_text_' + last_head_image, -0.04, true);
			last_head_text_fade_out_delay = 0;
			actual_head_text_fade_in_delay = 10;
		}
		else {
			last_head_text_fade_out_delay = 1;
			actual_head_text_fade_in_delay = 30;
		}
	}
	else {
		actual_head_text_fade_in_delay = 40;
	}
	
	head_image_scale = 0;
}



var hi_transform_counter = 0;

function TransformHeadImage(raf_time_actual) {
	if (ctx_hi) {
		hi_transform_counter = (hi_transform_counter + 1) % 1;
		if (hi_transform_counter) {
			window.requestAnimationFrame(TransformHeadImage);
			return;
		}
// /*x		
		if (hi_use_raf && raf_time_actual - raf_time_last < 25) {
			window.requestAnimationFrame(TransformHeadImage);
			return;
		}
// */		
		raf_time_last = raf_time_actual;

		var time_start = new Date().getTime();
		var sx = head_image_scale /*F + hi_width */;
		var sy = Math.round(sx * hi_height / hi_width);
//x		head_image_alpha = 1;
//-		head_image_alpha = (last_head_image < 0 && head_image_scale < 100 ? Math.pow(head_image_scale / 100, 2) : (head_image_scale < 500 ? Math.pow(head_image_scale / 500, 2) : 1));
		if (last_head_image < 0) {
			head_image_alpha = (head_image_scale < 150 ? Math.pow(head_image_scale / 150, 2) : 1);
		}
		else {
			head_image_alpha = 1; // (head_image_scale < 50 ? Math.pow(head_image_scale / 50, 2) : 1);
		}
		ctx_hi.globalAlpha = head_image_alpha;
		ctx_hi.drawImage(head_images_data[actual_head_image], sx, sy, hi_width - 2 * sx, hi_height - 2 * sy, 0, 0, hi_width, hi_height);
		
		if ( /*x head_image_scale < 150 */ last_head_image_alpha > 0 && last_head_image >= 0) {
			var sx = Math.pow(head_image_scale, 1) + last_head_image_scale /*F + hi_width */;
			var sy = Math.round(sx * hi_height / hi_width);
			sx = Math.round(sx);  // aby bylo sy co nejpresnejsi
//x			ctx_hi.globalAlpha = 1 - head_image_scale / 150;

//o			last_head_image_alpha = Math.max(0, last_head_image_alpha - 0.05);
			last_head_image_alpha = (1 + Math.cos(head_image_scale / 40 * Math.PI)) / 2;
			ctx_hi.globalAlpha = last_head_image_alpha;
			
			ctx_hi.drawImage(head_images_data[last_head_image], sx, sy, hi_width - 2 * sx, hi_height - 2 * sy, 0, 0, hi_width, hi_height);
		}
		
		if (last_head_text_fade_out_delay) {
			last_head_text_fade_out_delay--;
			if (!last_head_text_fade_out_delay) {
				PushOrChangeFader('head_text_' + last_head_image, -0.04, true);
			}
		}
		if (actual_head_text_fade_in_delay) {
			actual_head_text_fade_in_delay--;
			if (!actual_head_text_fade_in_delay) {
				PushOrChangeFader('head_text_' + actual_head_image, 0.05, true);
			}
		}
		
/*-		if (ctx_ht) {
			ctx_ht.shadowOffsetX = 1;
			ctx_ht.shadowOffsetY = 1;
			ctx_ht.shadowBlur = 15;
			ctx_ht.shadowColor = 'rgba(0, 0, 0, 0.05)';
			ctx_ht.font = '60px myFont1Bold';
			ctx_ht.fillStyle = '#ffffff';
			ctx_ht.fillText('Kilometry zábavy v MINI', 50, 50);
		}
*/
		
		head_image_scale++;
		
		if (head_image_scale > 30 * 5 /* 195 */ ) {
			ShowNextHeadImage();
		}
		
		var time_actual = new Date().getTime();
//x		document.getElementById('output_fps').innerText = ('raf='+hi_use_raf+', ')+(main_time_last && main_time_last != time_actual ? formatNumber(1000 / (time_actual - main_time_last), 0 /*1*/)  : '');
		
		if (hi_use_raf) {
			window.requestAnimationFrame(TransformHeadImage);
		}
		else {
			setTimeout("TransformHeadImage(0);", 32 - Math.min(31, Math.max(0, time_actual - time_start)));  //R
		}

		main_time_last = time_actual;
	}
}

function DoTheStuff() {
	ProcessFaders();
	ProcessBgFaders();
	ProcessFgFaders();
	ProcessScrollFaders();
	ProcessMotionFaders();
//	ProcessFMSStuff();
	setTimeout("DoTheStuff();", stuff_period);
}


//////////////// app


function BublinaBoxMouseOver(e, eid_pf) {
	if (!eid_pf) {
		var eid = e.currentTarget.getAttribute('id');
		var tmp_prefix = 'bublina_box_';
		if (eid.indexOf(tmp_prefix) !== 0) {
			return;
		}
		eid_pf = eid.substr(tmp_prefix.length);
	}
	
	PushOrChangeFader('bublina_box_hover_' + eid_pf, fade_delta_in, true);
	PushOrChangeBgFader('bublina_box_bottom_line_' + eid_pf, fade_delta_in, 1, 0);
	PushOrChangeBgFader('bublina_box_button_' + eid_pf, fade_delta_in, 2, 1);
	PushOrChangeFgFader('bublina_box_headline_' + eid_pf, fade_delta_in);
	
	var img = document.getElementById('bublina_box_img_' + eid_pf);
	if (img) {
		if (img.clientWidth) {
			img.style.height = 'auto';
			BublinaBoxCenter(eid_pf);
		}
		else {
			setTimeout("BublinaBoxMouseOver(null, \'"+eid_pf+"\');", 100);  // pokud jeste neni obrazek nacten
		}
	}
}

function BublinaBoxMouseOut(e, eid_pf) {
	if (!eid_pf) {
		var eid = e.currentTarget.getAttribute('id');
		var tmp_prefix = 'bublina_box_';
		if (eid.indexOf(tmp_prefix) !== 0) {
			return;
		}
		eid_pf = eid.substr(tmp_prefix.length);
	}
	
	PushOrChangeFader('bublina_box_hover_' + eid_pf, -fade_delta_out, true);
	PushOrChangeBgFader('bublina_box_bottom_line_' + eid_pf, -fade_delta_out, 1, 0);
	PushOrChangeBgFader('bublina_box_button_' + eid_pf, -fade_delta_out, 2, 1);
	PushOrChangeFgFader('bublina_box_headline_' + eid_pf, -fade_delta_out);
	
	var img = document.getElementById('bublina_box_img_' + eid_pf);
	if (img) {
		if (img && img.clientWidth) {
			img.style.height = '200px';
			BublinaBoxCenter(eid_pf);
		}
		else {
			setTimeout("BublinaBoxMouseOut(null, \'"+eid_pf+"\');", 100);
		}
	}
}

function BublinaBoxCenter(eid_pf) {
	var div_image = document.getElementById('bublina_box_image_' + eid_pf);
	var img = document.getElementById('bublina_box_img_' + eid_pf);
	if (div_image && img) {
		var div_image_brect = div_image.getBoundingClientRect();
		var new_left = Math.round(-(img.clientWidth - 200) * 0.5);
		var new_top = Math.round(-(img.clientHeight - 200) * 0.5);
		img.style.left = new_left + 'px';
		img.style.top = new_top + 'px';
	}
}

function BublinaBoxMouseMove(e) {
//x    var e = window.event;
	var eid = e.currentTarget.getAttribute('id');
	var tmp_prefix = 'bublina_box_gfx_';
	if (eid.indexOf(tmp_prefix) === 0) {
		var eid_pf = eid.substr(tmp_prefix.length);
		if (e.pageX || e.pageY)     {
			posx = e.pageX;
			posy = e.pageY;
		}
		else if (e.clientX || e.clientY)     {
			posx = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
			posy = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
		}
		
		var div_image = document.getElementById('bublina_box_image_' + eid_pf);
		var img = document.getElementById('bublina_box_img_' + eid_pf);
		if (div_image && img) {
			var div_image_brect = div_image.getBoundingClientRect();
			var new_left = Math.round(-(img.clientWidth - 200) * Math.max(0, Math.min(1, (posx - (div_image_brect.left + document.body.scrollLeft + document.documentElement.scrollLeft)) / 221)));
			var new_top = Math.round(-(img.clientHeight - 200) * Math.max(0, Math.min(1, (posy - (div_image_brect.top + document.body.scrollTop + document.documentElement.scrollTop)) / 221)));
			img.style.left = new_left + 'px';
			img.style.top = new_top + 'px';
		}
	}
}


function AdminMenuMouseMove(e) {
    var posx = 0;
    var posy = 0;
    if (!e) var e = window.event;
    if (e.pageX || e.pageY)     {
        posx = e.pageX;
        posy = e.pageY;
    }
    else if (e.clientX || e.clientY)     {
        posx = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
        posy = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
    }
    var menumousex = (posx - WinW() / 2);
	AdminMenuRedraw(menumousex);
//-	document.getElementById('admin_menu_debug').innerHTML = ('x=' + menumousex);
}

function AdminMenuRedraw(menumousex) {
	var adminmenu_top = 285;
	var img_size = 70;
	var winw = WinW();
	if (document.getElementsByTagName) {
		var tags = document.getElementById('admin_menu').getElementsByTagName("a");
		for (var i = 0; i < tags.length; i++) {
			var img_rx = i * img_size - tags.length * img_size / 2 + img_size / 2;
			var img_rx_dx = -((menumousex - img_rx) > 0 ? 1 : -1) * Math.pow(Math.abs(menumousex - img_rx) / img_size, .6) /* *5 */ * 0;
			if (menumousex !== null) {
//x				var img_rx_dx = ((menumousex - img_rx) > 0 ? 1 : -1) * (-Math.cos(Math.min(1, Math.abs(menumousex - img_rx) / img_size / 4) * 2 * Math.PI) + 1) * 3;
//x				var img_rx_dx = ((menumousex - img_rx) > 0 ? 1 : -1) * (Math.sin(Math.min(1, Math.abs(menumousex - img_rx) / img_size / 4) * Math.PI) + 1) * 3;
//x				var img_rx_dx = ((menumousex - img_rx) > 0 ? 1 : -1) * (-Math.cos(Math.min(1, Math.abs(menumousex - img_rx) / img_size / 4) * 2 * Math.PI) + 1) * 3;
				img_rx += img_rx_dx;
			}
			var img_w = img_size - (img_size / 7) * (menumousex === null ? 1 : Math.pow(Math.min(1, Math.abs(menumousex - img_rx) / img_size / 2), 1));
//x			var img_w = img_size - (img_size / 7) * (menumousex === null ? 1 : Math.min(1, Math.abs(menumousex - img_rx) / img_size / 2));
			tags_img = tags[i].getElementsByTagName("img");
			tags_img[0].style.width = Math.round(img_w) + 'px';
			tags[i].style.left = Math.round(winw / 2 + img_rx - img_w / 2) + 'px';
			tags[i].style.top = Math.round(adminmenu_top - img_w / 2) + 'px';
			if (menumousex === null && tags[i].style.visibility != 'visible') {
				tags[i].style.visibility = 'visible';
			}
		}
	}	
}







////

function formatNumber(number, precision) {
	var num_int = '';
	var num_float = '';
	var numstr = number.toFixed(precision);
	if (precision > 0) {
		var numstrarr = numstr.split(".");
		num_int = numstrarr[0];
		num_float = ',' + numstrarr[1];
	}
	else {
		num_int = numstr;
	}
	
	var result = '';
	for (var i = 0; i < num_int.length; i++) {
		result = num_int.charAt(num_int.length - i - 1) + (i % 3 == 0 && i > 0 && num_int.charAt(num_int.length - i - 1) != '-' ? ' ' : '') + result;
	}
	return (result + num_float);
}

///// IMAGE MENU

var image_menu_actual = '';

function ShowImageMenu(image_menu) {
	if (image_menu_actual != '') {
		// PushOrChangeFader(image_menu_actual, -fade_delta_out);
		PushOrChangeFader(image_menu_actual, -1);
/*		PushOrChangeBgFader(image_menu_actual + '_tr1', -fade_delta_out, 1);
		PushOrChangeBgFader(image_menu_actual + '_tr2', -fade_delta_out, 1); */
		var e_tr1 = document.getElementById(image_menu_actual + '_tr1');
		var e_tr2 = document.getElementById(image_menu_actual + '_tr2');
		if (e_tr1 && e_tr2) {  // nemusi existovat, napr. po odstraneni obrazku ajaxem
			e_tr1.style.backgroundColor = 'transparent';
			e_tr2.style.backgroundColor = 'transparent';
		}
		if (image_menu_actual == image_menu) {
			image_menu = '';  // hide actual only
		}
	}
	if (image_menu != '') {
		// PushOrChangeFader(image_menu, fade_delta_in, true);
		PushOrChangeFader(image_menu, 1, true);
/*		PushOrChangeBgFader(image_menu + '_tr1', fade_delta_in, 1);
		PushOrChangeBgFader(image_menu + '_tr2', fade_delta_in, 1); */
		document.getElementById(image_menu + '_tr1').style.backgroundColor = '#49a3da';
		document.getElementById(image_menu + '_tr2').style.backgroundColor = '#49a3da';
	}
	image_menu_actual = image_menu;
	return false;
}

function HideImageMenu(ev) {
	ShowImageMenu('');
	if (ev) {
		ev.stopPropagation();
	}
	return false;
}

function TMCEInsertImage(id_textarea, image_src, image_class, ev, specs) {
	var ed = tinyMCE.get(id_textarea);
	var range = ed.selection.getRng();
	var imgNode = ed.getDoc().createElement("img");
	imgNode.src = image_src;
	if (image_class != '') {
		imgNode.className = image_class;
	}
	
	if (specs === 'p_center') {
		var pNode = ed.getDoc().createElement("p");
		pNode.setAttribute("style", "text-align: center;");
		pNode.appendChild(imgNode);
		range.insertNode(pNode);
	}
	else {
		range.insertNode(imgNode);
	}
	
	HideImageMenu(ev);
	return false;
}

function TMCEInsertLink(id_textarea, file_href, link_text, ev) {
	var ed = tinyMCE.get(id_textarea);
	var range = ed.selection.getRng();
	var aNode = ed.getDoc().createElement("a");
	aNode.setAttribute("href", file_href);
	aNode.setAttribute("target", "_blank");
	aNode.innerText = link_text;
	aNode.innerHTML = '<img src="style/icons/file_icon_2.png" style="max-height: 2em; margin: 0 0.5em;" />' + aNode.innerHTML;
	range.insertNode(aNode);
	HideImageMenu(ev);
	return false;
}

function TMCEInsertVideo(id_textarea, eid_postfix) {
	var ed = tinyMCE.get(id_textarea);
	var range = ed.selection.getRng();
	var aNode = ed.getDoc().createElement("iframe");
	var e_video_href = document.getElementById('editinput_' + eid_postfix);
	var video_href = e_video_href.value;
	var video_code_matches = video_href.match(/watch\?v=([^\?\/#]+).*$/);
	if (!video_code_matches) {
		video_code_matches = video_href.match(/^[^\?#]*\/([^\?\/#]+).*$/);
	}
	if (video_code_matches) {
		aNode.setAttribute("width", "100%");
		aNode.setAttribute("height", "315");
		aNode.setAttribute("src", 'https://www.youtube.com/embed/' + video_code_matches[1]);
		aNode.setAttribute("title", "YouTube video player");
		aNode.setAttribute("frameborder", "0");
		aNode.setAttribute("allow", "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture");
		aNode.setAttribute("allowfullscreen", "allowfullscreen");
		// aNode.innerText = '';
		range.insertNode(aNode);
		
		e_video_href.value = '';
		var eid_button = 'editbutton_' + eid_postfix;
		HideElement(eid_button, 'inline', true, 1);
		setTimeout("ShowElement('" + eid_button + "', 'inline', true);", 500);
	}
	return false;
}

//
function TMCEInsertVideoPlayer(id_textarea, file_src, file_src_type, ev) {
	var ed = tinyMCE.get(id_textarea);
	var range = ed.selection.getRng();
	var aNode = ed.getDoc().createElement("video");
	var aNodeSrc = ed.getDoc().createElement("source");
	aNode.setAttribute("style", "width: 100%; height: auto;");
	aNode.setAttribute("controls", "1");
	aNodeSrc.setAttribute("src", file_src);
	aNodeSrc.setAttribute("type", file_src_type);
	aNode.appendChild(aNodeSrc);
	// aNode.innerText = '';
	range.insertNode(aNode);
	HideImageMenu(ev);
	return false;
}

function TMCEInsertAudioPlayer(id_textarea, file_src, ev) {
	var ed = tinyMCE.get(id_textarea);
	var range = ed.selection.getRng();
	var aNode = ed.getDoc().createElement("audio");
	aNode.setAttribute("src", file_src);
	aNode.setAttribute("controls", "1");
	// aNode.innerText = '';
	range.insertNode(aNode);
	HideImageMenu(ev);
	return false;
}
//


/////// AJAX

function AjaxLoad(params, force_load) {
	if (ajax_xmlhttp !== null || (ajax_xmlhttp_cache.length > 0 && !force_load)) {
		ajax_xmlhttp_cache.push(params);
	}
	else {
		if (typeof window.ActiveXObject !== 'undefined') {
			ajax_xmlhttp = new ActiveXObject('Microsoft.XMLHTTP');
		}
		else if (typeof window.XMLHttpRequest !== 'undefined') {
			ajax_xmlhttp = new XMLHttpRequest();
		}

		
/*		if (document.getElementById('homepage')) {
			params.push('homepage=1');
		} */
		params.push('s=ajax');
		ajax_xmlhttp.onreadystatechange = AjaxXMLDocStateChange;
		ajax_xmlhttp.open("POST", './', true);
		ajax_xmlhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
		ajax_xmlhttp.send(params.join('&'));
	}
}

function AjaxXMLDocStateChange() {
	if (ajax_xmlhttp.readyState == 4) {
		if (ajax_xmlhttp.status == 200) {
			// logy
			AddAjaxLogs(ajax_xmlhttp);
			
			//////////

			var x_scdr = ajax_xmlhttp.responseXML.documentElement.getElementsByTagName('scd_results');
			if (x_scdr.length > 0) {
				if (x_scdr[0].getAttribute('correct') == '1') {
					
					/// opened dirs
					var strom_opened_dirs = [];
					StromGetOpened('0', strom_opened_dirs);
					
					/// opened roles
					var e_strom = document.getElementById('strom');
					var strom_opened_roles = '';
					for (var i = 0; i < global_id_role_all.length; i++) {
						if (ElementHasClass(e_strom, 'strom_enable_cbox_group_' + global_id_role_all[i])) {
							strom_opened_roles += (strom_opened_roles != '' ? ',' : '') + global_id_role_all[i];
						}
					}
					setTimeout("location.href = '?s=strom&strom_opened_roles=" + strom_opened_roles + "&strom_opened_dirs=" + strom_opened_dirs.join(',') + "'", 2000);
				}
				else {
					setTimeout("HideDisablerTransfer(); ElementRemoveClass(document.getElementById('strom_changes_send_button'), 'strom_changes_send_button_disabled');", 2000);
				}
			}
			
			var x_cont = ajax_xmlhttp.responseXML.documentElement.getElementsByTagName('content');
			for (var i = 0; i < x_cont.length; i++) {
				var e_content = document.getElementById(x_cont[i].getAttribute('eid'));
				if (e_content) {
					e_content.innerHTML = GetSerializedXml(x_cont[i].firstChild);
				}
			}
						
			var x_js = ajax_xmlhttp.responseXML.documentElement.getElementsByTagName('javascript');
			if (x_js.length > 0) {
				for (var i = 0; i < x_js.length; i++) {
					eval(x_js[i].firstChild.nodeValue);
				}
			}

			var x_grafy_set = ajax_xmlhttp.responseXML.documentElement.getElementsByTagName('grafy_set');
			for (var i = 0; i < x_grafy_set.length; i++) {
				ProcessGrafy(x_grafy_set[i]);
			}

			//////////
	
		}
		else {
			AddAjaxLog('Nastala chyba při komunikaci se serverem.<br/>Server communication error.');
		}
		ajax_xmlhttp = null;
		if (ajax_xmlhttp_cache.length > 0) {
			AjaxLoad(ajax_xmlhttp_cache.shift(), true);
		}
/*x		var frd = document.getElementById('fmsi_results_disabler');
		if (frd) {
			HideElement('fmsi_results_disabler');
		}
x*/
	}
}

function ProcessGrafy(x_grafy_set) {
	// init constants
	var hodnotyY_koef = 0.5;
	var z_index_shift = 10;
	var bar_3d = true;
	var bar_opacity = 0.8;
	var bar_opacity_3d_step = 0.15;

	// read XML - grafy
	var x_grafy = x_grafy_set.getElementsByTagName('image');
	// HTML element main
	var e_main = document.getElementById(x_grafy_set.getAttribute('eid'));

	// cyklus grafy Playground
	for (var i = 0; i < x_grafy.length; i++) {
		if (x_grafy[i].getAttribute('type') == 'Playground') {
			// read XML - graf
			var x_image = x_grafy[i].getElementsByTagName('image');
			// HTML element .grafy
			var e_grafy_max_height = 0;
			var e_grafy_max_width = 0;
			var e_grafy_max_zindex = 0;
			var e_grafy_max_unitSizeX = 0;
			var e_grafy_max_barSizeX = 0;
			var e_grafy_max_barSizeZ = 0;
			var e_grafy_graf_of_bars_count = 0;
			
			var e_grafy = document.createElement('div');
			e_grafy.className = 'grafy';
			var e_after_grafy = document.createElement('div');
			e_after_grafy.className = 'grafy_after';
			
			// cyklus graf (images) - hledani maximalnich hodnot
			for (var j = 0; j < x_image.length; j++) {
				if (x_image[j].getAttribute('type') == 'Graf') {
					e_grafy_max_zindex = Number(x_image[j].getAttribute('z')) > e_grafy_max_zindex ? Number(x_image[j].getAttribute('z')) : e_grafy_max_zindex;
				}
			}
			e_grafy_max_zindex += z_index_shift;
			
			// cyklus graf (images)
			for (var j = 0; j < x_image.length; j++) {
				x_image[j]['type'] = x_image[j].getAttribute('type');
				x_image[j]['style'] = x_image[j].getAttribute('style');
				x_image[j]['hodnoty'] = x_image[j].getElementsByTagName('hodnoty');
				x_image[j]['popisky'] = x_image[j].getElementsByTagName('popisky');
				var unitSizeX = x_image[j].getAttribute('unitSizeX');
				var unitSizeY = x_image[j].getAttribute('unitSizeY');
				var barSizeX = x_image[j].getAttribute('barSizeX');
				var barSizeZ = x_image[j].getAttribute('barSizeZ');
				var z_persp = Math.pow(x_image[j].getAttribute('z'), 0.65); //(j * barSizeZ);
				
				if (x_image[j]['type'] == 'Graf') {
					// HTML element .graf
					var e_graf_max_height = 0;
					var e_graf_max_width = 0;
					var e_graf = document.createElement('div');
					e_graf.className = 'graf';
					e_graf.style.left = x_image[j].getAttribute('x') + 'px';
					e_graf.style.bottom = x_image[j].getAttribute('y') + 'px';
					e_graf.style.zIndex = e_grafy_max_zindex - x_image[j].getAttribute('z');
					if (x_image[j]['style'].length) {
						e_graf.classList.add(x_image[j]['style']);
					}
					// read XML - hodnoty
					if (x_image[j]['hodnoty'][0]) {
						var hodnoty_arr = GetSerializedXml(x_image[j]['hodnoty'][0].firstChild).toString().split(" ");
						if (hodnoty_arr.length > 0 && hodnoty_arr.length % 2 == 0) {
							hodnotyX = [];
							hodnotyY = [];
							for (var ih = 0; ih < hodnoty_arr.length; ih += 2) {
								hodnotyX.push(Number(hodnoty_arr[ih]));
								hodnotyY.push(Number(hodnoty_arr[ih + 1]));
								// todo - hledat minimum a maximum prip. prespsat nalezene min a max dle XML
							}
						}
						// cyklus hodnotyX
						for (var k = 0; k < hodnotyX.length; k++) {
							// graf typu BARS
							if (x_image[j]['style'] == 'bars') {
								var e_bar_height = hodnotyY[k] * hodnotyY_koef * unitSizeY;
								var e_bar_total_width = (hodnotyX[k] * unitSizeX + (bar_3d ? k * barSizeZ : 0));
								e_graf_max_width = e_bar_total_width;
								e_graf_max_height = e_bar_height > e_graf_max_height ? e_bar_height : e_graf_max_height;

								// jeden bar 2D
								var e_bar = document.createElement('div');
								e_bar.className = 'bar';
								//e_bar.innerHTML += '<span class="val" style="color:#' + x_image[j].getAttribute('color') + ';margin-top:-' + (2.75*barSizeZ) + 'px' + ';margin-left:-' + barSizeZ + 'px">' + hodnotyY[k] + '</span>';
								//e_bar.innerHTML += '<span class="temp">' + k + '<br/>[' + hodnotyX[k] + ';' + hodnotyY[k] + ']' + '</span>';
								e_bar.style.background = hexToRgbA('#' + x_image[j].getAttribute('color'), bar_opacity);
								e_bar.style.left = e_bar_total_width + 'px';
								e_bar.style.height = e_bar_height + 'px';
								e_bar.style.width = barSizeX + 'px';
								
								// jeden bar VALUE
								var e_bar_val = document.createElement('span');
								e_bar_val.className = 'val';
								e_bar_val.innerHTML = hodnotyY[k];
								e_bar_val.style.color = '#' + x_image[j].getAttribute('color');
								e_bar_val.style.marginTop = (-(bar_3d ? 2.75 : 1.75) * barSizeZ) + 'px';
								e_bar.appendChild(e_bar_val);
								
								// jeden bar TEMP ... 9kTODO: delete
								var e_bar_temp = document.createElement('span');
								e_bar_temp.className = 'temp';
								e_bar_temp.innerHTML = '#' + k + '<br/>[' + hodnotyX[k] + '; ' + hodnotyY[k] + '; ' + x_image[j].getAttribute('z') + '(' + e_graf.style.zIndex + ')' + ']';
								e_bar.appendChild(e_bar_temp);
								
								if (bar_3d) {
									// jeden bar 2D posun v ose [z] = nahoru a doprava
									e_bar.style.bottom = (z_persp) + 'px';
									e_bar.style.left = e_bar_total_width + (z_persp) + 'px';
									
									// jeden bar VALUE posun v ose [z] = doprava
									e_bar_val.style.marginLeft = barSizeZ + 'px';
									
									// jeden bar 3D top = horni stena
									var e_bar_top = document.createElement('div');
									e_bar_top.className = 'bar_depth bar_top';
									e_bar_top.style.background = hexToRgbA('#' + x_image[j].getAttribute('color'), bar_opacity - bar_opacity_3d_step);							
									e_bar_top.style.height = barSizeZ + 'px';
									e_bar_top.style.top = '-' + barSizeZ + 'px';
									e_bar_top.style.left = (barSizeZ / 2)  + 'px';
									e_bar.appendChild(e_bar_top);
									
									// jeden bar 3D left = prava stena
									var e_bar_left = document.createElement('div');							
									e_bar_left.className = 'bar_depth bar_left';
									e_bar_left.style.background = hexToRgbA('#' + x_image[j].getAttribute('color'), bar_opacity + bar_opacity_3d_step);
									e_bar_left.style.width = barSizeZ + 'px';
									e_bar_left.style.left = barSizeX + 'px';
									e_bar_left.style.bottom = (barSizeZ / 2)  + 'px';
									e_bar.appendChild(e_bar_left);
								}
								
								// bar do grafu
								e_graf.appendChild(e_bar);
							}
						}
						
						// HTML element .graf po skonceni cyklů pro grafy
						e_graf.style.height = e_graf_max_height + 'px';
					}
					
					// pridat "graf" do "grafy"
					e_grafy_max_height = e_graf_max_height > e_grafy_max_height ? e_graf_max_height : e_grafy_max_height;
					e_grafy_max_unitSizeX = unitSizeX > e_grafy_max_unitSizeX ? unitSizeX : e_grafy_max_unitSizeX;
					e_grafy_max_width = e_graf_max_width > e_grafy_max_width ? e_graf_max_width : e_grafy_max_width;
					
					if (x_image[j]['style'] == 'bars') {
						e_grafy_max_barSizeX = barSizeX > e_grafy_max_barSizeX ? barSizeX : e_grafy_max_barSizeX;
						e_grafy_max_barSizeZ = barSizeZ > e_grafy_max_barSizeZ ? barSizeZ : e_grafy_max_barSizeZ;
						e_grafy_graf_of_bars_count++;
					}
					
					e_grafy.appendChild(e_graf);
					
					// grafy after ... 9kTODO: delete
					e_after_grafy.innerHTML += 'graf[' + x_image[j]['style'] + ']' + GetSerializedXml(x_image[j]['hodnoty'][0]) + '<br/>';
				}
				
			} // /cyklus graf (images)
			
			// HTML element .grafy
			e_grafy_max_width += parseInt(e_grafy_max_barSizeX);
			e_grafy.style.left = parseInt(x_grafy[i].getAttribute('x')) + 'px';
			e_grafy.style.bottom = parseInt(x_grafy[i].getAttribute('y')) + 'px';
			e_grafy.style.height = parseInt(e_grafy_max_height + (bar_3d ? e_grafy_graf_of_bars_count * e_grafy_max_barSizeZ : 0)) + 'px';
			
			// HTML element main
			e_main.appendChild(e_grafy);
		}
	} // /cyklus grafy Playground
	
	// 9kTODO: delete
	if (e_after_grafy) e_main.appendChild(e_after_grafy);
	

	// -------------------------------------------------------------------------------------------------------------
	// -------------------------------------------------------------------------------------------------------------

	//echo '<svg style="width: 100%; height: 100%; position: absolute; top: 0; right: 50%;">';
    //echo '<line x1="0" y1="'.round(100 - $temp_last_val / $sum_podil_max * 100, 2).'%" x2="100%" y2="'.round(100 - $temp_new_val / $sum_podil_max * 100, 2).'%" style="stroke: #e9540d; stroke-width: 9; stroke-dasharray: 2 1;" />';
    //echo '</svg>';	
	
	//var x_grafy_0 = x_grafy[0];
	//var x_imgs = x_grafy_0.getElementsByTagName('image');
	
	// for (var i = 0; i < x_imgs.length; i++) {
		// var x_imgs_style = x_imgs[i].getAttribute('style');
		// var x_imgs_hodnoty = x_imgs[i].getElementsByTagName('hodnoty');
		// if (x_imgs_hodnoty[0]) {
			// e_main.innerHTML += x_imgs_style + ': ' + GetSerializedXml(x_imgs_hodnoty[0].firstChild) + '<br />';
		// }
	// }
	
	/**	
	e_main.innerHTML += 'ahhoj';
	var div1 = document.createElement('div');
	div1.setAttribute("id", '_div_1');
	div1.className = 'cervene_pozadi';
	div1.innerHTML = ' huhle ';
	e_main.appendChild(div1);
	/**/
	// -------------------------------------------------------------------------------------------------------------
	// -------------------------------------------------------------------------------------------------------------
}

function hexToRgbA(hex, alpha) {
    var c;
    if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
        c = hex.substring(1).split('');
        if(c.length == 3){
            c = [c[0], c[0], c[1], c[1], c[2], c[2]];
        }
        c = '0x'+c.join('');
        return 'rgba(' + [(c>>16)&255, (c>>8)&255, c&255].join(',') + ',' + alpha + ')';
    }
    throw new Error('Bad Hex');
}


function GetSerializedXml(x) {
	if (x) {
		try {
			return (new XMLSerializer()).serializeToString(x);
		}
		catch (e) {
			try {
				return x.xml;
			}
			catch (e) {  
				alert('Váš prohlížeč je velmi zastaralý.');
			}
		}

	}
	return '';
}

function AddAjaxLogs(ajax_xmlhttp) {
	var e_logs = ajax_xmlhttp.responseXML.documentElement.getElementsByTagName('log');
	var time = 0;
	for (var i = 0; i < e_logs.length; i++) {
		if (e_logs[i].getAttribute('time')) {
			time = e_logs[i].getAttribute('time');
		}
		else {
			time = 0;
		}
//-		AddAjaxLog(e_logs[i].firstChild.nodeValue);
		AddAjaxLog(GetSerializedXml(e_logs[i]), time);
	}
}


function AddAjaxLog(log, time) {
	ajax_logs_counter++;
	o_ajax_logs = document.getElementById('ajax_logs');
	o_ajax_logs.innerHTML += '<div id="ajax_log_'+ajax_logs_counter+'" class="ajax_log"><img src="style/icons/cancel_grey_24.png" onclick="return HideElement(\'ajax_log_'+ajax_logs_counter+'\');" class="ajax_log_close_button" title="Zavřít" />'+log+'</div>';
	var temp_id = 'ajax_log_'+ajax_logs_counter;
	setTimeout(function() {if (document.getElementById(temp_id)) document.getElementById(temp_id).style.display = 'none';}, (time > 0 ? time : 4000));
}

function ClearAjaxLogs() {
	o_ajax_logs = document.getElementById('ajax_logs');
	o_ajax_logs.innerHTML = '';
	return false;
}

function setCookie(c_name, c_value, exdays) {
	var exdate = new Date();
	exdate.setDate(exdate.getDate() + exdays);
	var c_value = escape(c_value) + ((exdays==null) ? "" : "; expires="+exdate.toUTCString());
	document.cookie = c_name + "=" + c_value;
}


function FMS_GetNotePocet(pocet) {
	return (pocet && pocet != '0' ? '(' + pocet + ')' : '<span class="form_select_item_note_zero">0</span>');
}


function FMS_SetFilter(name, subname, val) {
	if (FMS_filters) {
		for (var i = 0; i < FMS_filters.length; i++) {
			if (FMS_filters[i][0] == name) {
				if (!subname) {
					FMS_filters[i][1] = val;  // set
				}
				else if (subname !== true) {
					for (var j = 0; j < FMS_filters[i][1].length; j++) {
						if (FMS_filters[i][1][j] == subname) {
							return;  // already subset
						}
					}  // for j
					FMS_filters[i][1].push(subname);  // subset
				}
				return;
			}
		}
		if (!subname) {
			FMS_filters.push( [name, val] );
		}
		else {
			FMS_filters.push( [name, subname === true ? [] : [subname]] );
		}
	}
}

function FMS_ResetFilter(name, subname) {
	if (FMS_filters) {
		for (var i = 0; i < FMS_filters.length; i++) {
			if (FMS_filters[i][0] == name) {
				if (!subname || subname === true) {
					FMS_filters.splice(i, 1);  // reset
					return;
				}
				else {
					for (var j = 0; j < FMS_filters[i][1].length; j++) {
						if (FMS_filters[i][1][j] == subname) {
							FMS_filters[i][1].splice(j, 1);  // subreset
							return;
						}
					}  // for j
				}
			}
		}
	}
}

function FMS_GetFilter(name, subname) {
	if (FMS_filters) {
		for (var i = 0; i < FMS_filters.length; i++) {
			if (FMS_filters[i][0] == name) {  // name found
				if (!subname) {
					return FMS_filters[i][1];
				}
				else {
					for (var j = 0; j < FMS_filters[i][1].length; j++) {
						if (FMS_filters[i][1][j] == subname) {
							return true;  // subname found
						}
					}  // for j
				}
				return false;  // name found, subname not found
			}
		}  // for i
	}
	return false;
}

function FMS_GetAllFilters() {
	var ret = '';
	if (FMS_filters) {
		for (var i = 0; i < FMS_filters.length; i++) {
			ret += (i == 0 ? '' : '|') + FMS_filters[i][0] + '~';
			if (FMS_filters[i][1].constructor === Array) {
				ret += encodeURIComponent(FMS_filters[i][1].join(','));
			}
			else {
				ret += encodeURIComponent(FMS_filters[i][1]);
			}
		}  // for i
	}
	return ret;
}


function FMS_ToggleOptions(ev, eid) {
	var e = document.getElementById(eid + '_options');
	if (e.style.display == 'none') {
		FMS_HideOpenedOptions();
		fms_last_opened_option = eid;
	}
	StopEventPropagation(ev);
	return ShowOrHideElement(eid + '_options', '', false, true);
}

function FMS_HideOpenedOptions() {
	if (fms_last_opened_option != '') {
		FMS_HideOptions(fms_last_opened_option);
		fms_last_opened_option = '';
	}
}

function FMS_HideOptions(eid) {
	return HideElement(eid + '_options', '', false, true);
}


function FMS_AddItem(item_e, item_id, subitem_e, subitem_id, dont_load, text_item) {  // subitem_e can be === true ... flag
	
	if (text_item) {
		item_id = item_id.replace(/[~\|]/g, '');
	}
	
	var item_eid = item_e + (text_item ? '' : '_' + item_id);
	var subitem_eid = (subitem_e === true ? true : (subitem_e ? subitem_e + '_' + subitem_id : ''));
	var out_eid = (subitem_eid /* && subitem_eid !== true */ ? item_eid : item_e);
	
	FMS_HideOptions('fmsi_'+(subitem_eid && subitem_eid !== true ? item_eid : item_e));
	
	var single = false;
	var e_hint_set = document.getElementById('fmsi_'+out_eid+'_hint_set');
	if (e_hint_set) {
		single = true;
		FMS_ResetFilter(out_eid);
		var e_item = document.getElementById('fmsi_'+item_eid+(subitem_eid ? '_'+subitem_eid : ''));
		var e_item_note = document.getElementById('fmsi_'+item_eid+(subitem_eid ? '_'+subitem_eid : '')+'_note');
		var chosen_fid = 'fmsi_'+item_eid+(subitem_eid ? '_'+subitem_eid : '')+'_chosen';
		e_hint_set.innerHTML = '<span id="'+chosen_fid+'_note" class="form_select_item_note">'+(e_item_note ? /* e_item_note.childNodes[0].nodeValue */ e_item_note.innerHTML : '')+'</span>' + e_item.childNodes[1].innerHTML;
		HideElement('fmsi_'+out_eid+'_hint');
		ShowElement('fmsi_'+out_eid+'_hint_set');
//x		ShowElement('fmsi_'+out_eid+'_cancel');
	}
	else if (!FMS_GetFilter(out_eid).length && document.getElementById('fmsi_'+out_eid+'_hint2') && subitem_e !== true) {
		HideElement('fmsi_'+out_eid+'_hint');
		ShowElement('fmsi_'+out_eid+'_hint2');
	}
	ShowElement('fmsi_'+out_eid+'_cancel');  // show if exists
	
	if (!single && !text_item) {
		HideElement('fmsi_'+item_eid+(subitem_eid && subitem_e !== true ? '_'+subitem_eid : ''));
	}
	if (subitem_eid !== true && !single) {
		var e_item = document.getElementById('fmsi_'+item_eid+(subitem_eid ? '_'+subitem_eid : ''));
		var e_item_note = document.getElementById('fmsi_'+item_eid+(subitem_eid ? '_'+subitem_eid : '')+'_note');
		var chosen_fid = 'fmsi_'+item_eid+(subitem_eid ? '_'+subitem_eid : '')+'_chosen';
		if (!document.getElementById(chosen_fid)) {
			var e_chosens = document.getElementById('fmsi_'+out_eid+'_chosens');
			if (e_chosens) {
				e_chosens.innerHTML += '<div id="'+chosen_fid+'" class="form_select_subitem"><input type="checkbox" checked="checked" onchange="FMS_DropItem(\''+item_e+'\', \''+item_id+'\''+(subitem_eid ? ', \''+subitem_e+'\', \''+subitem_id+'\'' : '')+');" title="odebrat" /><span id="'+chosen_fid+'_note" class="form_select_item_note">'+(e_item_note ? /* e_item_note.childNodes[0].nodeValue */ e_item_note.innerHTML : '')+'</span>' + e_item.childNodes[1].innerHTML + '</div>';  //  + '<span class="form_select_item_drop" onclick="...">x</span>'
				e_chosens.style.display = 'block';
			}
		}
	}
	
/*a	if (item_e == 'v' && item_id && subitem_e === true) {
		var e_hp = document.getElementById('td_vyrobce_hp_'+item_id);
		if (e_hp) {
			ElementAddClass(e_hp, 'td_vyrobce_hp_checked');
			var e_hp_cb = document.getElementById('td_vyrobce_hp_'+item_id+'_checkbox');
			if (e_hp_cb) {
				e_hp_cb.checked = true;
			}
		}
	} */

	if (item_e == 'v' /* && item_id && !dont_load */) {
		FMS_DropItem('m', false, false, false, true);  // odstrani m a mt (rekurzivne)
	}
	else if (item_e == 'm' /* && item_id && !dont_load */) {
		FMS_DropItem('mt', false, false, false, true);
	}
	
	if (subitem_eid) {
		FMS_SetFilter(out_eid, subitem_eid === true ? true : subitem_id);
	}
	else {
		if (text_item && item_id == '') {
			FMS_ResetFilter(out_eid);
			HideElement('fmsi_'+out_eid+'_cancel');  // hide if exists
		}
		else {
			FMS_SetFilter(out_eid, item_id);
		}
	}
	
	if (!dont_load) {
		FMS_Load('a=add_item,'+item_eid+(subitem_eid && subitem_eid !== true ? ','+subitem_eid : ''), false);
	}
	
	if (text_item) {
		var e_textinput = document.getElementById('fmsi_' + out_eid);
		if (e_textinput) {
			if (item_id == '') {
				ElementRemoveClass(e_textinput, 'form_textinput_item_active');
			}
			else {
				ElementAddClass(e_textinput, 'form_textinput_item_active');
			}
		}
	}
	
	return false;
}


function FMS_DropItem(item_e, item_id, subitem_e, subitem_id, dont_load, text_item) {
	var item_eid = item_e + '_' + (item_id ? item_id : '0');
	var subitem_eid = (subitem_e === true ? true : (subitem_e ? subitem_e + '_' + subitem_id : ''));
	var out_eid = (subitem_eid /* && subitem_eid !== true */ ? item_eid : item_e);
	
	if (!item_id) {
		var f = FMS_GetFilter(item_e);
		if (f !== false) {
			var f_all = f.slice();  // !!! slice() duplicates an array
			if (f_all) {
				for (var i = 0; i < f_all.length; i++) {
					FMS_DropItem(item_e, f_all[i], false, false, true);
				}
			}
		}
	}
	
	if (subitem_eid) {
		FMS_ResetFilter(out_eid, subitem_eid === true ? true : subitem_id);
	}
	else {
		FMS_ResetFilter(out_eid, item_id);
	}
	
	
	var single = false;
	var e_hint_set = document.getElementById('fmsi_'+out_eid+'_hint_set');
	HideElement('fmsi_'+out_eid+'_cancel');  // hide if exists
	if (e_hint_set) {
		single = true;
//x		HideElement('fmsi_'+out_eid+'_cancel');
		HideElement('fmsi_'+out_eid+'_hint_set');
		ShowElement('fmsi_'+out_eid+'_hint');
	}
	else {
		if (!FMS_GetFilter(out_eid).length && document.getElementById('fmsi_'+out_eid+'_hint2')) {
			HideElement('fmsi_'+out_eid+'_hint2');
			ShowElement('fmsi_'+out_eid+'_hint');
		}
		
		if (subitem_eid !== true) {
			var e_chosen = document.getElementById('fmsi_'+item_eid+(subitem_eid ? '_'+subitem_eid : '')+'_chosen');
			if (e_chosen) {
				var e_chosens = document.getElementById('fmsi_'+out_eid+'_chosens');
				if (e_chosens) {
					e_chosens.removeChild(e_chosen);
					if (!FMS_GetFilter(out_eid).length) {
						e_chosens.style.display = 'none';
					}
				}
			}
		}
		ShowElement('fmsi_'+item_eid+(subitem_eid && subitem_e !== true ? '_'+subitem_eid : ''));
		
		if (subitem_eid === true) {
			var e_box = document.getElementById('fmsi_'+item_eid+'_box');
			if (e_box) {
				var e_boxes = document.getElementById('fmsi_'+item_e+'_boxes');
				e_boxes.removeChild(e_box);
			}
		}
	}
/*a	
	if (item_e == 'v' && item_id && subitem_e === true) {
		var e_hp = document.getElementById('td_vyrobce_hp_'+item_id);
		if (e_hp) {
			ElementRemoveClass(e_hp, 'td_vyrobce_hp_checked');
			var e_hp_cb = document.getElementById('td_vyrobce_hp_'+item_id+'_checkbox');
			if (e_hp_cb) {
				e_hp_cb.checked = false;
			}
		}
	} */

	if (item_e == 'v' /* && !dont_load */) {
		FMS_DropItem('m', false, false, false, true);  // odstrani m a mt (rekurzivne)
	}
	else if (item_e == 'm' /* && !dont_load */) {
		FMS_DropItem('mt', false, false, false, true);
	}
	
	if (!dont_load) {
		FMS_Load('a=drop_item,'+item_eid+(subitem_eid && subitem_eid !== true ? ','+subitem_eid : ''), false);
	}
	
	if (text_item) {
		var e_textinput = document.getElementById('fmsi_' + out_eid);
		if (e_textinput) {
			ElementRemoveClass(e_textinput, 'form_textinput_item_active');
		}
	}
	
	return false;
}

function FMS_Load(params, go_top, dont_change_hash, dont_include_filters) {
/*x	var frd = document.getElementById('fmsi_results_disabler');
	if (frd) {
		ShowElement('fmsi_results_disabler');
	}
x*/	
	var params_all = [];
	
	if (!document.getElementById('global_page_is_homepage') && !dont_include_filters) {
		var e_input = document.getElementById('fmsi_nazev');
		if (e_input) {
			var f = FMS_GetFilter('nazev');
			if ((f === false && e_input.value != '') || (f !== false && e_input.value != f)) {
				FMS_ResetFilter('nazev');
				FMS_AddItem('nazev', e_input.value, false, false, true, true);  // nastav fulltext input (i) pri zmene jineho filtru
				params_all.push('force_all_counts=1');
			}
		}
	}
		
	var actual_filters = FMS_GetAllFilters();
	if (dont_change_hash !== true) {
		fms_disable_next_hashchanged = true;
		window.location.hash = '#fmsi=' + actual_filters + (params != '' ? '&'+params : '');
	}
	if (params != '') {
		params_all.push(params);
	}
	if (!dont_include_filters) {
		params_all.push('fmsi='+actual_filters);
	}
	if (document.getElementById('fmsi_results_box')) {
		params_all.push('vo_get_results=1');
	}
	
	AjaxLoad(params_all);
	if (go_top) {
		FMS_GoTop();
	}
	return false;
}

function FMS_GoTop() {
	var gotop_coef = 2.1;  // must be grater than 2 !!!
	var actual_scroll = GetScrollXY();
	if (actual_scroll[0] > 0 || actual_scroll[1] > 0) {
		var new_scroll_x = Math.round(actual_scroll[0] / gotop_coef);
		var new_scroll_y = Math.round(actual_scroll[1] / gotop_coef);
		window.scrollTo(new_scroll_x, new_scroll_y);
		if (new_scroll_x > 0 || new_scroll_y > 0) {
			setTimeout("FMS_GoTop();", 25);
		}
	}
	return false;
}

function WindowHashChanged() {
	if (fms_disable_next_hashchanged) {
		fms_disable_next_hashchanged = false;
		return;
	}
	
	var fmsi = '';
	if (location.hash != '' && (hash_regs = /(^|&|#)fmsi=(.*?)($|&)/.exec(location.hash))) {
		fmsi = hash_regs[2];
	}
	else if (location.search != '' && (search_regs = /(^|&|\?)fmsi=(.*?)($|&)/.exec(location.search))) {
		fmsi = search_regs[2];
	}
	
	var vo_id = '';
	if (location.hash != '' && (hash_regs = /(^|&|#)vo_id=([1-9][0-9]*?)($|&)/.exec(location.hash))) {
		vo_id = hash_regs[2];
	}
	else if (location.search != '' && (search_regs = /(^|&|\?)vo_id=([1-9][0-9]*?)($|&)/.exec(location.search))) {
		vo_id = search_regs[2];
	}

	var list = '';
	if (location.hash != '' && (hash_regs = /(^|&|#)list=([1-9][0-9]*?)($|&)/.exec(location.hash))) {
		list = hash_regs[2];
	}
	else if (location.search != '' && (search_regs = /(^|&|\?)list=([1-9][0-9]*?)($|&)/.exec(location.search))) {
		list = search_regs[2];
	}

	var vo_show_next = false;
	if (location.hash != '' && (hash_regs = /(^|&|#)vo_show_next=([1-9][0-9]*?)($|&)/.exec(location.hash))) {
		vo_show_next = true;
	}
	else if (location.search != '' && (search_regs = /(^|&|\?)vo_show_next=1($|&)/.exec(location.search))) {
		vo_show_next = true;
	}

	var vo_show_prev = false;
	if (location.hash != '' && (hash_regs = /(^|&|#)vo_show_prev=([1-9][0-9]*?)($|&)/.exec(location.hash))) {
		vo_show_prev = true;
	}
	else if (location.search != '' && (search_regs = /(^|&|\?)vo_show_prev=1($|&)/.exec(location.search))) {
		vo_show_prev = true;
	}

//a	alert('loading all boxes');
	FMS_Load('a=get_all_boxes&fmsi=' + fmsi + (vo_id != '' ? '&vo_id='+vo_id : '') + (list != '' ? '&list='+list : '') + (vo_show_next ? '&vo_show_next=1' : '') + (vo_show_prev ? '&vo_show_prev=1' : '') + (document.getElementById('global_page_is_homepage') ? '&page_is_homepage=1' : ''), false /*true ... go_top*/, true, true);
}

function FMS_ToggleVyrobceHP(id_vyrobce) {
	if (FMS_GetFilter('v_'+id_vyrobce) !== false) {
		FMS_DropItem('v', id_vyrobce, true);
	}
	else {
		FMS_AddItem('v', id_vyrobce, true);
	}
}

function FMS_ShowResults() {
	var actual_filters = FMS_GetAllFilters();
	location.href = '?s=main#fmsi='+actual_filters;
	return false;
}

function FMS_ShowDetail(id, list) {
	FMS_Load('vo_id='+id+'&list='+list, true);
	return false;
}

function FMS_GetKeyCode(evt) {
	var e = (evt || window.event);
	return (e.which || e.keyCode);
}

function FMS_KeyBody(evt) {
	var kcode = FMS_GetKeyCode(evt);
	if (kcode == 27) {
		ImageBox.hideDisabler();
		FMS_HideOpenedOptions();
		HideCalendar();
		HideImageMenu();
		if (typeof HideActiveSubbox === 'function') {
			HideActiveSubbox();
		}
	}
}

function FMS_ClickBody(evt) {
	FMS_HideOpenedOptions();
}

function FMS_KeyInputNazev(evt) {
	var kcode = FMS_GetKeyCode(evt);
	if (kcode == 13) {
		var b = document.getElementById('fmsi_nazev_button');
		if (b) {
			b.click();
		}
	}
/*x	else {
		FMS_KeyInputNazevChanged();
	} */
}

function FMS_KeyInputNazevChanged() {
	if (document.getElementById('global_page_is_homepage')) {
		var e_input = document.getElementById('fmsi_nazev');
		if (e_input && e_input.value != fms_last_nazev) {
			fms_last_nazev = e_input.value;
			fms_update_after_counter = Math.round(1000 / stuff_period);  // 1 sec
		}
	}
}

function ProcessFMSStuff() {
	if (document.getElementById('global_page_is_homepage')) {
		var e_input = document.getElementById('fmsi_nazev');
		if (e_input) {
			FMS_KeyInputNazevChanged();  // volame opakovane (jistota i pro paste apod.)
			if (fms_update_after_counter > 0) {
				fms_update_after_counter--;
				if (fms_update_after_counter == 0) {
					FMS_ResetFilter('nazev');
					FMS_AddItem('nazev', e_input.value, false, false, false, true); // load new counts
				}
			}
		}
	}
}


///////// FE_

function FE_ItemChanged(e) {
	AjaxLoad( ['fe_item_changed=' + e.name + '&' + 'fe_item_changed_val=' + e.value ] );
}

///////////////

function StopEventPropagation(e) {
	if (e) {
		if (e.stopPropagation) {
			e.stopPropagation();
		}
		e.cancelBubble = true;
	}
}

function ElementHasClass(e, c) {
	if (e) {
		return (e.className ? e.className.match(new RegExp('([ ]|^)' + c + '([ ]|$)')) : false);
	}
	else {
		return null;
	}
}
 
function ElementAddClass(e, c) {
	if (e) {
		if (!ElementHasClass(e, c)) {
			e.className += (e.className != '' ? ' ' : '') + c;
		}
	}
}
 
function ElementRemoveClass(e, c) {
	if (e) {
		if (e.className != '') {
			var res = '';
			var e_arr = e.className.split(' ');
			for (var i = 0; i < e_arr.length; i++) {
				if (e_arr[i] != c && e_arr[i] != '') {
					res += (res != '' ? ' ' : '') + e_arr[i];
				}
			}
			e.className = res;
		}
	}
}

function ElementToggleClass(e, c) {
	if (ElementHasClass(e, c)) {
		ElementRemoveClass(e, c);
	}
	else {
		ElementAddClass(e, c);
	}
	return false;
}


function MouseHintInit() {
	window.onmousemove = function (e) {
		if (mouseHintShown) {
			var b = document.getElementById('mousehintbox');
			if (b) {
				var pageX = e.pageX;
				var pageY = e.pageY;
				if (pageX === undefined) {
					pageX = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
					pageY = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
				}
				if (e.clientX > WinW() / 2) {
					b.style.left = 'auto';
					b.style.right = (WinW() - e.clientX + 5) + 'px';
				}
				else {
					b.style.left = (e.clientX + 10) + 'px';
					b.style.right = 'auto';
				}
				b.style.top = (e.clientY +  15) + 'px';
			}
		}
	};
}

function MouseHintShow(html) {
	var b = document.getElementById('mousehintbox');
	if (b) {
		b.innerHTML = html;
		mouseHintShown = true;
		ShowElement('mousehintbox', false, true);
	}
}

function MouseHintHide() {
	HideElement('mousehintbox', false, true);
	mouseHintShown = false;
}

function ShowDisablerTransfer() {
	ShowElement('disabler_transfer', false, true, fade_delta_in / 4);
}

function HideDisablerTransfer() {
	HideElement('disabler_transfer', false, true, fade_delta_in / 2);
}


function EscapeHTML(htmltext) {
	var char_map = {
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;',
		"'": '&#039;'
	};
	return htmltext.replace(/[&<>"']/g, function(ch) { return char_map[ch]; });
}

function UnEscapeHTML(htmltext) {
	var char_map = {
		'&lt;': '<',
		'&gt;': '>',
		'&quot;': '"',
		'&#039;' : "'",
		'&amp;': '&'
	};
	htmltext = htmltext.replace(/&lt;|&gt;|&quot;|&#039;/g, function(ch) { return char_map[ch]; });
	htmltext = htmltext.replace('&amp;', '&');
	return htmltext;
}

function GetFormInputValue(id_input_name) {
	var e = document.getElementById(id_input_name);
	return (e ? EscapeHTML(e.value) : '');
}




///////////////// ADVANCED UPLOAD

		var AdvUpload_last_entered_target = null;

		function AdvUpload_OpenFilesDialog(fileinput_id) {
			var e = document.getElementById(fileinput_id);
			if (e) {
				e.click();
			}
			return false;
		}
		
		function AdvUpload_SetProgressBar(progress_elements_postfix, message_text, val) {
			var e_progress_message = document.getElementById('progress_message_' + progress_elements_postfix);
			var e_progress_bar = document.getElementById('progress_bar_' + progress_elements_postfix);
			var e_progress_bar_text = document.getElementById('progress_bar_text_' + progress_elements_postfix);
			if (e_progress_message && e_progress_bar && e_progress_bar_text) {
				if (message_text !== null) {
					e_progress_message.innerHTML = message_text;
				}
				if (val !== null) {
					var val_txt = '';
					var val_width = 0;
					if (val === '') {
						// ok
					}
					else if (!val) {
						val_txt = '0%';
					}
					else {
						val_width = val;
						val_txt = val+'%';
					}
					e_progress_bar.style.width = val_width+'%';
					e_progress_bar_text.innerText = val_txt;
				}
			}
		}
		
		function AdvUpload_FileListChanged(fileinput, item_table, item_id, item_column) {
			var files = fileinput.files;
			for(var i = 0; i < files.length; i++) {
				advUpload_uploadList.push([files[i], item_table, item_id, item_column]);
			}
			fileinput.value = '';
			if (fileinput.value != '') {
				fileinput.parentNode.replaceChild(fileinput.cloneNode(), fileinput);	// pro starsi prohlizece, napr. ie10
			}
			AdvUpload_StartUpload();
		}
		
		function AdvUpload_DragOver(e) {
			e.stopPropagation();
			e.preventDefault();
			e.dataTransfer.dropEffect = 'copy';
		}
 
		function AdvUpload_DragEnter(e) {
//w			e.stopPropagation();
			e.preventDefault();
			AdvUpload_last_entered_target = e.target;
			
			ElementAddClass(e.currentTarget, 'file_upload_drop_area_over');
		}
		
		function AdvUpload_DragLeave(e) {
//w			if (e.currentTarget == e.target) {
			if (e.target == AdvUpload_last_entered_target) {
				ElementRemoveClass(e.currentTarget, 'file_upload_drop_area_over');
			}
		}
		
		function AdvUpload_FilesDropped(e /*Q*/ , a_item /*Q*/ ) {
			ElementRemoveClass(e.currentTarget, 'file_upload_drop_area_over');
/*Q
			e.stopPropagation();
			e.preventDefault();
			var a_item = new Array('menu', '1', 'fotografie');
Q*/
			var item_table = a_item[0];
			var item_id = a_item[1];
			var item_column = a_item[2];
//Q			alert('inside AdvUpload_FilesDropped(): '+e+"\r\n"+item_table+"\r\n"+item_id+"\r\n"+item_column);
			var files = e.dataTransfer.files;
			for (var i = 0; i < files.length; i++) {
				advUpload_uploadList.push([files[i], item_table, item_id, item_column]);
			}
			AdvUpload_StartUpload();
		}
 
		function AdvUpload_StartUpload() {
			if (!advUpload_justUploading) {
				var e_prog_top_text = document.getElementById('progresses_top_text');
				ElementRemoveClass(e_prog_top_text, 'progresses_top_text_finished');
				ShowElement('progresses_top_text', false, true);
				AdvUpload_UploadNext();
			}
		}
		
		function AdvUpload_UploadNext() {
			var e_prog_top_text = document.getElementById('progresses_top_text');
			if (advUpload_uploadList.length) {
				advUpload_justUploading = true;
				if (e_prog_top_text) {
					e_prog_top_text.innerHTML = 'Probíhá odesílání dat.<br/>Zbývá souborů: <b>'+advUpload_uploadList.length+'</b>';
				}
				var upitem = advUpload_uploadList.shift()
				AdvUpload_ResizeAndDoUpload(upitem[0], upitem[1], upitem[2], upitem[3]);
			}
			else {
				advUpload_justUploading = false;
				if (e_prog_top_text) {
					e_prog_top_text.innerHTML = '<span class="zelene_pismo">Přenos dat ukončen.</span>';
				}
				ElementAddClass(e_prog_top_text, 'progresses_top_text_finished');
				setTimeout("AdvUpload_StopUpload();", 5000);
			}
		}
 
		function AdvUpload_StopUpload() {
			if (!advUpload_justUploading) {
				HideElement('progresses_top_text', false, true);
			}
		}
		
		function AdvUpload_ResizeAndDoUpload(file, item_table, item_id, item_column) {
//-			alert(file+', '+item_table+', '+item_id+', '+item_column);
			var file_type = (000 && file.type.match('image/(jpeg|png|gif)$') ? 'image' : 'file');  ///// 000 - zde zakazano, nechceme zmensovat ani prevadet png na jpeg atp.
//-			console.log('UPLOADING ' + file.name);
			var progress_elements_postfix = item_table + '_' + item_id + '_' + item_column + '_' + (++advUpload_progressBoxCounter);
			var progress_elements_short_postfix = item_table + '_' + item_id + '_' + item_column;
			
//x			var e_progresses = document.getElementById('progresses_' + progress_elements_short_postfix);
			ShowElement('progresses_' + progress_elements_short_postfix , 'inline-block');
			var e_progresses_inner = document.getElementById('progresses_inner_' + progress_elements_short_postfix);
			e_progresses_inner.innerHTML = '<div class="progress_container"><div id="progress_thumbnail_' + progress_elements_postfix + '" class="progress_thumbnail"></div><div class="progress_filename">Odesílání <b>'+EscapeHTML(file.name)+'</b></div><div id="progress_message_' + progress_elements_postfix + '" class="progress_message"></div><div class="progress_bar_outer"><div id="progress_bar_text_' + progress_elements_postfix + '" class="progress_bar_text"></div><div id="progress_bar_' + progress_elements_postfix + '" class="progress_bar"></div></div><div class="progress_container_bottom"></div></div>' + e_progresses_inner.innerHTML;
			
			if (file_type == 'image') {
				AdvUpload_SetProgressBar(progress_elements_postfix, 'Zpracovávám obrázek...', 0);
				
				var o_img = new Image();  // document.createElement("img");
				
				o_img.onerror = function() {
					AdvUpload_SetProgressBar(progress_elements_postfix, '<span class="cervene_pismo">Během práce s obrázkem nastala chyba - zřejmě neznámý formát.</span>', null);
					AdvUpload_UploadNext();  // ?! na localhostu se pri onerror pusti i onload
				}
				o_img.onabort = function() {
					AdvUpload_SetProgressBar(progress_elements_postfix, '<span class="cervene_pismo">Během práce s obrázkem nastala chyba - přenos přerušen.</span>', null);
					AdvUpload_UploadNext();  // ?!
				}
				o_img.onload = function() {
					window.URL.revokeObjectURL(o_img.src);
					
					var img_width_max = Math.min(10000, o_img.width);
					var img_height_max = Math.min(10000, o_img.height);
					var img_width = img_width_max;
					var img_height = img_height_max;
					
					if (img_width > 0 && img_height > 0) {
						var img_ratio_orig = o_img.width / o_img.height;
						
						if (img_width / img_height > img_ratio_orig) {
						   img_width = Math.round(img_height * img_ratio_orig);
						}
						else {
						   img_height = Math.round(img_width / img_ratio_orig);
						}
						
						if (img_width > 0 && img_height > 0) {
							var canvas = document.createElement('canvas');
							canvas.width = img_width;
							canvas.height = img_height;
							var ctx = canvas.getContext("2d");
							ctx.fillStyle="#FFFFFF";
							ctx.fillRect(0, 0, img_width, img_height);				// at je prip. pruhlednost bila
							ctx.drawImage(o_img, 0, 0, img_width, img_height);
							var dataURL = canvas.toDataURL("image/jpeg");
							
							var o_thumb = document.getElementById('progress_thumbnail_' + progress_elements_postfix);
							if (o_thumb) {
								var img_width_thumb = 75;
								var img_height_thumb = Math.max(1, Math.round(75 / img_ratio_orig));
								var canvas_thumb = document.createElement('canvas');
								canvas_thumb.width = img_width_thumb;
								canvas_thumb.height = img_height_thumb;
								var ctx_thumb = canvas_thumb.getContext("2d");
								ctx_thumb.fillStyle="#FFFFFF";
								ctx_thumb.fillRect(0, 0, img_width_thumb, img_height_thumb);				// at je prip. pruhlednost bila
								ctx_thumb.drawImage(o_img, 0, 0, img_width_thumb, img_height_thumb);
								var dataURL_thumb = canvas_thumb.toDataURL("image/jpeg");
								var o_img_thumb = new Image();  // document.createElement("img");
								o_img_thumb.src = dataURL_thumb;
								o_thumb.appendChild(o_img_thumb);
							}
							
							AdvUpload_SetProgressBar(progress_elements_postfix, 'Odesílám data na server...', 0);
							
							var xhr = new XMLHttpRequest();
							xhr.onreadystatechange = function(e) {
								if (xhr.readyState == 4) {
									if (xhr.status == 200) {
										AdvUpload_SetProgressBar(progress_elements_postfix, '<span class="zelene_pismo">Úspěšně odesláno.</span>', 100);
										var e_progress_results = document.getElementById('progress_results_' + progress_elements_short_postfix);
										var x_pr = xhr.responseXML.documentElement.getElementsByTagName('progress_results');
										if (e_progress_results && x_pr.length > 0 && x_pr[0].firstChild) {
											e_progress_results.innerHTML = GetSerializedXml(x_pr[0].firstChild);
											ImageBox.createAll('progress_results_' + progress_elements_short_postfix);
										}
										AddAjaxLogs(xhr);
									}
									else {
										AddAjaxLog('Nastala chyba při komunikaci se serverem - status '+xhr.status+'.');
									}
									AdvUpload_UploadNext();
								}
							};
							xhr.upload.addEventListener('progress', function(e) {
								if (e.lengthComputable) {
									var perc = Math.round(100.0 * e.loaded / e.total);
									AdvUpload_SetProgressBar(progress_elements_postfix, null, perc);
								}
							});
							
							var e_prv = document.getElementById('progress_results_view_' + progress_elements_short_postfix);
							
							xhr.open('POST', './', true);
							xhr.setRequestHeader("Content-type","application/x-www-form-urlencoded");
							var data = 's=ajax&uploading_file=1&table='+item_table+'&id='+item_id+'&column='+item_column+(e_prv && e_prv.value != '' ? '&result_view='+encodeURIComponent(e_prv.value) : '')+'&filename_orig='+encodeURIComponent(file.name)+'&file_data=' + dataURL;
							xhr.send(data);
						}
						else {
							AdvUpload_SetProgressBar(progress_elements_postfix, '<span class="cervene_pismo">Obrázek má po zmenšení nulovou velikost.</span>', '');
							AdvUpload_UploadNext();
						}
					}
					else {
						AdvUpload_SetProgressBar(progress_elements_postfix, '<span class="cervene_pismo">Obrázek má nulovou velikost nebo není obrázkem.</span>', '');
						AdvUpload_UploadNext();
					}
				}
				o_img.src = window.URL.createObjectURL(file);
			}	
			else if (file_type == 'file') {
				AdvUpload_SetProgressBar(progress_elements_postfix, 'Odesílám data na server...', 0);

				var e_prv = document.getElementById('progress_results_view_' + progress_elements_short_postfix);
// /*FD XXX				
				var fd = new FormData();
				fd.append('s', 'ajax');
				fd.append('uploading_file', '1');
				fd.append('table', item_table);
				fd.append('id', item_id);
				fd.append('column', item_column);
				if (e_prv && e_prv.value != '') {
					fd.append('result_view', e_prv.value);  //? encodeURIComponent
				}
//-				fd.append('filename_orig', file.name);  //? encodeURIComponent
				fd.append('edit_'+item_table+'_'+item_column+'_1', file, file.name);

				var xhr = new XMLHttpRequest();
				xhr.onreadystatechange = function(e) {
					if (xhr.readyState == 4) {
						if (xhr.status == 200) {
							AdvUpload_SetProgressBar(progress_elements_postfix, '<span class="zelene_pismo">Úspěšně odesláno.</span>', 100);
							var e_progress_results = document.getElementById('progress_results_' + progress_elements_short_postfix);
							if (xhr.responseXML) {
								var x_pr = xhr.responseXML.documentElement.getElementsByTagName('progress_results');
								if (e_progress_results && x_pr.length > 0 && x_pr[0].firstChild) {
									e_progress_results.innerHTML = GetSerializedXml(x_pr[0].firstChild);
									ImageBox.createAll('progress_results_' + progress_elements_short_postfix);
								}
								AddAjaxLogs(xhr);
							}
							else {
								AddAjaxLog('Vráceno neXML.');
							}
						}
						else {
							AddAjaxLog('Nastala chyba při komunikaci se serverem - status '+xhr.status+'.');
						}
						AdvUpload_UploadNext();
					}
				};
				xhr.upload.addEventListener('progress', function(e) {
					if (e.lengthComputable) {
						var perc = Math.round(100.0 * e.loaded / e.total);
						AdvUpload_SetProgressBar(progress_elements_postfix, null, perc);
					}
				});
				
				
				xhr.open('POST', './' , true);
//+				.............................
//-				xhr.setRequestHeader("Content-type","multipart/form-data");
//-				xhr.setRequestHeader("Content-type","application/x-www-form-urlencoded");
//-				var data = 's=ajax&uploading_file=1&table='+item_table+'&id='+item_id+'&column='+item_column+(e_prv && e_prv.value != '' ? '&result_view='+encodeURIComponent(e_prv.value) : '')+'&filename_orig='+encodeURIComponent(file.name)+'&file_data=' + dataURL;
				xhr.send(fd);
// XXX FD*/

/*RDR YYY
				var reader = new FileReader();
				reader.readAsDataURL(file);
				reader.onload = function () {
					var xhr = new XMLHttpRequest();
					xhr.onreadystatechange = function(e) {
						if (xhr.readyState == 4) {
							if (xhr.status == 200) {
								AdvUpload_SetProgressBar(progress_elements_postfix, '<span class="zelene_pismo">Úspěšně odesláno.</span>', 100);
								var e_progress_results = document.getElementById('progress_results_' + progress_elements_short_postfix);
								if (xhr.responseXML) {
									var x_pr = xhr.responseXML.documentElement.getElementsByTagName('progress_results');
									if (e_progress_results && x_pr.length > 0 && x_pr[0].firstChild) {
										e_progress_results.innerHTML = GetSerializedXml(x_pr[0].firstChild);
										ImageBox.createAll('progress_results_' + progress_elements_short_postfix);
									}
									AddAjaxLogs(xhr);
								}
								else {
									AddAjaxLog('Vráceno neXML.');
								}
							}
							else {
								AddAjaxLog('Nastala chyba při komunikaci se serverem - status '+xhr.status+'.');
							}
							AdvUpload_UploadNext();
						}
					};
					xhr.upload.addEventListener('progress', function(e) {
						if (e.lengthComputable) {
							var perc = Math.round(100.0 * e.loaded / e.total);
							AdvUpload_SetProgressBar(progress_elements_postfix, null, perc);
						}
					});
					
					xhr.open('POST', './' , true);
					xhr.setRequestHeader("Content-type","application/x-www-form-urlencoded");
					var data = 's=ajax&uploading_file=1&table='+item_table+'&id='+item_id+'&column='+item_column+(e_prv && e_prv.value != '' ? '&result_view='+encodeURIComponent(e_prv.value) : '')+'&filename_orig='+encodeURIComponent(file.name)+'&edit_'+item_table+'_'+item_column+'_1=' + encodeURIComponent(reader.result);
					xhr.send(data);
				};
				reader.onerror = function() {
					AdvUpload_SetProgressBar(progress_elements_postfix, '<span class="cervene_pismo">Během práce se souborem nastala chyba - zřejmě chybný soubor.</span>', null);
					AdvUpload_UploadNext();  // ?! na localhostu se pri onerror pusti i onload
				};
				
YYY RDR*/
				
			}  // file_type == 'file'
			
		}
		
		
		
		function AdvUpload_ChangeImagePosition(item_table, item_id, direction, progress_results_element, disk_id_adresar) {
			var xhr = new XMLHttpRequest();
			xhr.onreadystatechange = function(e) {
				if (xhr.readyState == 4) {
					if (xhr.status == 200) {
						if (disk_id_adresar) {
							var x_pr = xhr.responseXML.documentElement.getElementsByTagName('progress_results');
							if (x_pr && x_pr[0] && x_pr[0].getAttribute('disk_id_adresar') !== null) {
								location.href = '?s=disk&id_adresar=' + x_pr[0].getAttribute('disk_id_adresar');
							}
						}
						else {
							var e_progress_results = document.getElementById(progress_results_element);
							var x_pr = xhr.responseXML.documentElement.getElementsByTagName('progress_results');
							if (e_progress_results && x_pr && x_pr[0]) {
								e_progress_results.innerHTML = GetSerializedXml(x_pr[0].firstChild);
								ImageBox.createAll(progress_results_element);
							}
						}
						AddAjaxLogs(xhr);
					}
					else {
						AddAjaxLog('Nastala chyba při komunikaci se serverem - status '+xhr.status+'.');
					}
				}
			};
			
			xhr.open('POST', './', true);
			xhr.setRequestHeader("Content-type","application/x-www-form-urlencoded");
			var data = 's=ajax&change_item_position=1&table='+item_table+'&id='+item_id+'&direction='+encodeURIComponent(direction)+(disk_id_adresar ? '&disk_id_adresar='+disk_id_adresar : '');
			xhr.send(data);
			
			return false;
		}
		
///////////////// end of ADVANCED UPLOAD



///////////////// SCROLL FADERS ////////////////////////////////////

function PushOrChangeScrollFader(eid, eid2) {
	var e = document.getElementById(eid);
	var e2 = document.getElementById(eid2);
	if (!e || !e2) {
		return;
	}
	var e_rect = e.getBoundingClientRect();
	var e2_rect = e2.getBoundingClientRect();
//x	var params = [e.scrollLeft, e.scrollTop, e2_rect.left - e_rect.left, Math.max(0, Math.min(e.scrollHeight - e.clientHeight, e.scrollTop - (e_rect.top + e.clientHeight / 2 - e2_rect.top)))];
	var params = [e.scrollLeft, e.scrollTop, e2_rect.left - e_rect.left, Math.max(0, Math.min(e.scrollHeight - e.clientHeight, e.scrollTop - (e_rect.top - e2_rect.top)))];
	
	var default_fade_delta = 0.05;
	var idx = -1;
	for (var i = 0; i < scfaders.length; i++) {
		if (scfaders[i][0] == eid) {
			scfaders[i][1] = 0;
			scfaders[i][2] = default_fade_delta;
			scfaders[i][3] = params;
			idx = i;
			break;
		}
	}
	if (idx < 0) {
		scfaders.push([eid, 0, default_fade_delta, params]);
	}
}

// scfaders[i][0] .. eid
// scfaders[i][1] .. fade_step
// scfaders[i][2] .. fade_delta   // >= 0
// scfaders[i][3][0] .. scroll_start_x
// scfaders[i][3][1] .. scroll_start_y
// scfaders[i][3][2] .. scroll_target_x
// scfaders[i][3][3] .. scroll_target_y

function ProcessScrollFaders() {
	for (var i = 0; i < scfaders.length; i++) {
		if (scfaders[i][2] == 0) {
			continue;
		}
		var e = document.getElementById(scfaders[i][0]);
		if (!e) {
			continue;
		}
		
		var e_op = scfaders[i][1];
		var e_d = scfaders[i][2];

		if (e_d > 0 && e_op + e_d >= 1) {
			scfaders[i][1] = 1;
			scfaders[i][2] = 0;
			// popr. reset ostatnich
		}
		else {
			scfaders[i][1] = e_op + e_d;
		}
		e.scrollLeft = Math.round(scfaders[i][3][0] + (1 - Math.cos(Math.pow(scfaders[i][1], 0.5) * Math.PI)) / 2 * (scfaders[i][3][2] - scfaders[i][3][0]));
		e.scrollTop = Math.round(scfaders[i][3][1] + (1 - Math.cos(Math.pow(scfaders[i][1], 0.5) * Math.PI)) / 2 * (scfaders[i][3][3] - scfaders[i][3][1]));
	}
}

/////////////////


function DocumentScrollTo(new_x, new_y) {
	if (typeof(new_x) != "undefined" && typeof(new_y) != "undefined") {
		document_scroll_to_x = Math.round(Math.min(new_x, DocW() - WinW()));
		document_scroll_to_y = Math.round(Math.min(new_y, DocH() - WinH()));
	}
	
	var actual_scroll = GetScrollXY();
//	if (actual_scroll[0] != document_scroll_to_x || actual_scroll[1] != document_scroll_to_y) {
		var new_scroll_x = Math.round(document_scroll_to_x + (actual_scroll[0] - document_scroll_to_x) / document_scroll_to_coef);
		var new_scroll_y = Math.round(document_scroll_to_y + (actual_scroll[1] - document_scroll_to_y) / document_scroll_to_coef);
		window.scrollTo(new_scroll_x, new_scroll_y);
		var new_scroll = GetScrollXY();
		if (new_scroll[0] != actual_scroll[0] || new_scroll[1] != actual_scroll[1]) {
			setTimeout("DocumentScrollTo();", 25);
		}
//	}
	return false;
}

function DocumentScrollToElement(e_id) {
	var e = document.getElementById(e_id);
	if (e) {
		var bodyRect = document.body.getBoundingClientRect();
		DocumentScrollTo(0, e.getBoundingClientRect().top - bodyRect.top);
	}
	return false;
}



///////////////// CALENDAR
function ShowCalendar(aform, aninput, atype) {
	if (document.forms[aform] && document.forms[aform][aninput]) {
		calendar_act_type = atype;
		calendar_act_input_element = document.forms[aform][aninput];
		ShowElement('calendar_box', false, true);
		RefreshCalendar();
	}
	return false;
}

function CalendarGoToPg(pg) {
	if (calendar_act_pg) {
		ElementRemoveClass(document.getElementById('calendar_box_pg_' + calendar_act_pg), 'calendar_box_pg_active');
	}
	calendar_act_pg = pg;
	if (calendar_act_pg) {
		ElementAddClass(document.getElementById('calendar_box_pg_' + calendar_act_pg), 'calendar_box_pg_active');
		RedrawCalendar();
	}
}

function RefreshCalendar() {
	if (!calendar_act_input_element) {
		return;
	}
	
	var o_datum = null;
	var temp_found = false;

	calendar_chosen_year = null;
	calendar_chosen_month = null;
	calendar_chosen_day = null;

	var datum_regs = /^[^0-9]*([0-9]{1,2})[^0-9]+([0-9]{1,2})[^0-9]+([0-9]{4})/.exec(calendar_act_input_element.value + '');
	if (datum_regs) {
		var year = parseInt(datum_regs[3]);
		var month = parseInt(datum_regs[2]);
		var day = parseInt(datum_regs[1]);
		if (day >= 1 && day <= 31 && month >= 1 && month <= 12) {
			o_datum = new Date(year, month - 1, day);
			calendar_chosen_year = o_datum.getFullYear();  // muze dojit napr. k prepsani 29.2. na 1.3. apod., proto se data tahaji radeji z objektu
			calendar_chosen_month = o_datum.getMonth() + 1;
			calendar_chosen_day = o_datum.getDate();

			calendar_act_year = calendar_chosen_year;
			calendar_act_month = calendar_chosen_month;
			temp_found = true;
			CalendarGoToPg(1);
		}
	}
	else {
		var datum_regs = /^[^0-9]*([0-9]{1,2})[^0-9]+([0-9]{4})/.exec(calendar_act_input_element.value + '');
		if (datum_regs) {
			var year = parseInt(datum_regs[2]);
			var month = parseInt(datum_regs[1]);
			if (month >= 1 && month <= 12) {
				calendar_chosen_year = year;
				calendar_chosen_month = month;
				calendar_chosen_day = null;

				calendar_act_year = calendar_chosen_year;
				calendar_act_month = calendar_chosen_month;
				temp_found = true;
				CalendarGoToPg(2);
			}
		}
		else {
			var datum_regs = /^[^0-9]*([0-9]{4})/.exec(calendar_act_input_element.value + '');
			if (datum_regs) {
				calendar_chosen_year = parseInt(datum_regs[1]);
				calendar_chosen_month = null;
				calendar_chosen_day = null;

				calendar_act_year = calendar_chosen_year;
				calendar_act_month = calendar_chosen_month;
				temp_found = true;
				CalendarGoToPg(3);
			}
		}
	}

	if (!temp_found) {
		if (!calendar_act_year || !calendar_act_month) {
			o_datum = new Date();
			calendar_act_year = o_datum.getFullYear();
			calendar_act_month = o_datum.getMonth() + 1;
		}
		CalendarGoToPg(1);
	}
	
	RedrawCalendar();
	
	var calbox = document.getElementById('calendar_box');
	var input_rect = calendar_act_input_element.getBoundingClientRect();
	var body_rect = document.body.getBoundingClientRect();
	
	if (input_rect.top > WinH() / 2) {
		calbox.style.top = 'auto';
		calbox.style.bottom = (body_rect.bottom - input_rect.top) + 'px';
	}
	else {
		calbox.style.bottom = 'auto';
		calbox.style.top = (input_rect.bottom - body_rect.top) + 'px';
	}
	calbox.style.left = (input_rect.left - body_rect.left) + 'px';
}

function CalendarInputChanged() {
	RefreshCalendar();
}

function HideCalendar() {
//x	CalendarGoToPg(0);
	HideElement('calendar_box', false, true);
	return false;
}

function ToggleCalendar(aform, aninput) {
	if (document.getElementById('calendar_box').style.display == 'none') {
		ShowCalendar(aform, aninput);
	}
	else {
		HideCalendar();
	}
	return false;
}

function RedrawCalendar() {
	var e = null;
	var i = 0;

	if (calendar_act_year) {
		e = document.getElementById('calendar_year');
		if (e) {
			e.innerText = calendar_act_year;
		}
	}
	
	if (calendar_act_pg == 3) {
		var temp_roky = document.getElementById('calendar_years_list').value.split(',');
		for (i = 0; i < temp_roky.length; i++) {
			e = document.getElementById('calendar_3_td_' + temp_roky[i]);
			if (temp_roky[i] == calendar_chosen_year) {
				ElementAddClass(e, 'calendar_td_selected');
			}
			else {
				ElementRemoveClass(e, 'calendar_td_selected');
			}
		}
	}
	else if (calendar_act_pg == 2) {
		for (i = 1; i <= 12; i++) {
			e = document.getElementById('calendar_2_td_' + i);
			if (i == calendar_chosen_month && calendar_act_year == calendar_chosen_year) {
				ElementAddClass(e, 'calendar_td_selected');
			}
			else {
				ElementRemoveClass(e, 'calendar_td_selected');
			}
		}
	}
	else if (calendar_act_year && calendar_act_month) {
		var o_datum = new Date(calendar_act_year, calendar_act_month - 1, 1, 0, 0, 0, 0);
		var offset = o_datum.getDay();
		offset = (offset < 1 ? 6 : offset - 1);
		
		for (; i < offset; i++) {
			e = document.getElementById('calendar_td_' + i);
			e.innerText = '';
			ElementRemoveClass(e, 'calendar_td_selected');
			ElementRemoveClass(e, 'calendar_td_active');
			ElementAddClass(e, 'calendar_td_empty');
		}
		var d = 1;
		var o_dnes = new Date();
		o_dnes.setHours(0);
		o_dnes.setMinutes(0);
		o_dnes.setSeconds(0);
		o_dnes.setMilliseconds(0);
		while (o_datum.getMonth() + 1 == calendar_act_month) {
			e = document.getElementById('calendar_td_' + i);
			ElementRemoveClass(e, 'calendar_td_empty');
			e.innerText = d;
			if (111 || o_datum.getTime() >= o_dnes.getTime()) {
				ElementAddClass(e, 'calendar_td_active');
			}
			else {
				ElementRemoveClass(e, 'calendar_td_active');
			}
			if (d == calendar_chosen_day && calendar_act_month == calendar_chosen_month && calendar_act_year == calendar_chosen_year) {
				ElementAddClass(e, 'calendar_td_selected');
			}
			else {
				ElementRemoveClass(e, 'calendar_td_selected');
			}
			i++;
			d++;
			o_datum.setDate(d);
		}
		for (; i < calendar_rows * calendar_cols; i++) {
			e = document.getElementById('calendar_td_' + i);
			e.innerText = '';
			ElementRemoveClass(e, 'calendar_td_selected');
			ElementRemoveClass(e, 'calendar_td_active');
			ElementAddClass(e, 'calendar_td_empty');
		}
		PushOrChangeScrollFader('calendar_months', 'calendar_month_' + calendar_act_month);
	}
}

function CalendarClick(e) {
	if (ElementHasClass(e, 'calendar_td_active')) {
		calendar_act_input_element.value = e.innerText + '. ' + calendar_act_month + '. ' + calendar_act_year;
		HideCalendar();
//x		CPSubmitForm();
	}
}

function CalendarClickMonth(e) {
	calendar_act_input_element.value = calendar_act_month + '. ' + calendar_act_year;
	HideCalendar();
//x	CPSubmitForm();
}

function CalendarClickYear(e) {
	calendar_act_input_element.value = '' + calendar_act_year;
	HideCalendar();
//x	CPSubmitForm();
}

function CalendarSetMonth(amonth) {
	calendar_act_month = amonth;
	RedrawCalendar();
}

function CalendarSetYear(ayear) {
	calendar_act_year = ayear;
	RedrawCalendar();
}

function CalendarIncrementMonth() {
	calendar_act_month++;
	if (calendar_act_month > 12) {
		calendar_act_month = 1;
		calendar_act_year++;
	}
	RedrawCalendar();
}

function CalendarDecrementMonth() {
	calendar_act_month--;
	if (calendar_act_month < 1) {
		calendar_act_month = 12;
		calendar_act_year--;
	}
	RedrawCalendar();
}

function CheckAllCheckboxes(aform, prefix, count_max) {
	for (var i = 1; i <= count_max; i++) {
		document.forms[aform][prefix + i].checked = true;
	}
	return false;
}
function CheckNoneCheckboxes(aform, prefix, count_max) {
	for (var i = 1; i <= count_max; i++) {
		document.forms[aform][prefix + i].checked = false;
	}
	return false;
}


function js_CopyElementHTMLToClipboard(ev, e_name) {
	var e_dbox = document.getElementById(e_name + '_display_box');
	if (e_dbox) {
		e_dbox.style.display = 'block';
	}
	var e_sbox = document.getElementById(e_name + '_status_box');
	if (e_sbox) {
		e_sbox.style.display = 'block';
	}
	var e = document.getElementById(e_name);
	var range = document.createRange();
	range.selectNode(e);
	window.getSelection().addRange(range);

	var result = true;
	try {
		result = document.execCommand('copy');
	} catch(err) {
		result = false;
	}
	
	if (!result) {
		alert('Chyba: Váš prohlížeč zřejmě nepodporuje funkci kopírování HTML do schránky.');
	}

	window.getSelection().removeAllRanges();
	
	if (e_dbox) {
		e_dbox.style.display = 'none';
	}
}

function js_CopyWDTableToClipboard(ev, e_name) {
/*	setTimeout("js_CopyWDTableToClipboardProcess('"+e_name+"');", 10);
}
	
function js_CopyWDTableToClipboardProcess(e_name) { */
	var tb = document.getElementById(e_name);
	if (!tb.hasChildNodes()) {
		return;
	}

	var trs = null;
	if (tb.childNodes[0].nodeName == 'TR') {
		trs = tb.childNodes;
	}
	else if (tb.childNodes[0].nodeName == 'TBODY') {
		trs = tb.childNodes[0].childNodes;
	}
	else if (tb.childNodes[1].nodeName == 'TBODY') {
		trs = tb.childNodes[1].childNodes;
	}
	if (!trs) {
		return;
	}
	
	var tbex = document.createElement('table');
	var tbex_tbody = document.createElement('tbody');
	var head_exported = false;
	
	for (var i = 0; i < trs.length; i++) {
		if (ElementHasClass(trs[i], 'tr_default')) {
			var tds = trs[i].childNodes;
			var trex = document.createElement('tr');
			for (var j = 0; j < tds.length; j++) {
				if (!ElementHasClass(tds[j], 'icons')) {
					var tdex = document.createElement('td');
					if (tds[j].hasChildNodes() && ElementHasClass(tds[j].firstChild, 'export_data_text')) {
						tdex.innerText = tds[j].firstChild.innerText;
					}
					else {
						tdex.innerText = tds[j].innerText;
					}

					var st = [];  // style array
					if (ElementHasClass(tds[j], 'center')) {
						st.push("text-align: center;");
					}
					else if (ElementHasClass(tds[j], 'right')) {
						st.push("text-align: right;");
					}
					if (ElementHasClass(tds[j], 'bold')) {
						st.push("font-weight: bold;");
					}
					if (st.length > 0) {
						tdex.setAttribute("style", st.join(' '));
					}
					
					trex.appendChild(tdex);
				}
			}
			tbex_tbody.appendChild(trex);
			
			if (!head_exported) {  // muze byt vice radku hlavicky, proto zde
				head_exported = true;
			}
		}
		else if (!head_exported) {  // pocitame s tim, ze tabulka zacina hlavickou
			var trex = trs[i].cloneNode(true);
			if (i == 0) {
				trex.removeChild(trex.firstChild);  // remove th icons
			}
			var tds = trex.childNodes;
			for (var j = 0; j < tds.length; j++) {
				tds[j].innerText = tds[j].innerText;
/*+				if (ElementHasClass(tds[j], 'th_rotated')) {
					tds[j].setAttribute("style", "transform: rotate(-90deg);");
				} */
			}
			tbex_tbody.appendChild(trex);  // true = recursive cloning
			
			
/*			var tds = trs[i].childNodes;
			var trex = document.createElement('tr');
			for (var j = 0; j < tds.length; j++) {
				if (!ElementHasClass(tds[j], 'icons')) {
					var thex = document.createElement('th');
					thex.innerText = tds[j].innerText;
					if (ElementHasClass(tds[j], 'th_rotated')) {
						thex.setAttribute("style", "transform: rotate(-90deg);");
					}
					trex.appendChild(thex);
				}
			}
			tbex_tbody.appendChild(trex);
*/			
		}
	}
	
	var b = document.getElementById('body');
	if (!b) {
		return;
	}
	tbex.appendChild(tbex_tbody);
	b.appendChild(tbex);

	var range = document.createRange();
	range.selectNode(tbex);
	window.getSelection().addRange(range);

	var result = true;
	try {
		result = document.execCommand('copy');
	} catch(err) {
		result = false;
	}
	
	window.getSelection().removeAllRanges();

	b.removeChild(tbex);

	if (!result) {
		alert('Chyba: Váš prohlížeč zřejmě nepodporuje funkci kopírování HTML do schránky.');
	}
	else {
		var e_sbox = document.getElementById(e_name + '_status_box');
		if (e_sbox) {
			e_sbox.style.display = 'block';
		}
	}

}

function SetSelectByValue(aform, aselect, anid) {
	document.forms[aform][aselect].value = anid;
}



///////////////// KA CALENDAR
function KA_Load() {
	AjaxLoad(['ka_load=1']);
}

function KA_CalendarGoToPg(pg) {
	if (ka_calendar_act_pg) {
		ElementRemoveClass(document.getElementById('ka_calendar_box_pg_' + ka_calendar_act_pg), 'calendar_box_pg_active');
	}
	ka_calendar_act_pg = pg;
	if (ka_calendar_act_pg) {
		ElementAddClass(document.getElementById('ka_calendar_box_pg_' + ka_calendar_act_pg), 'calendar_box_pg_active');
		KA_RedrawCalendar();
	}
}

function KA_InitCalendar() {
	var o_datum = null;
	
	if (111 || !ka_calendar_act_year || !ka_calendar_act_month) {
		o_datum = new Date();
		ka_calendar_act_year = o_datum.getFullYear();
		ka_calendar_act_month = o_datum.getMonth() + 1;

		ka_calendar_chosen_year = ka_calendar_act_year;
		ka_calendar_chosen_month = ka_calendar_act_month;
		ka_calendar_chosen_day = o_datum.getDate();
	}
	
	ShowElement('ka_calendar_box', false, true, false, true);
	KA_CalendarGoToPg(1);
	KA_RedrawCalendar();
}

function KA_RedrawCalendar() {
	var e = null;
	var i = 0;

	if (ka_calendar_act_year) {
		e = document.getElementById('ka_calendar_year');
		if (e) {
			e.innerText = ka_calendar_act_year;
		}
	}
	
	if (ka_calendar_act_pg == 3) {
		var temp_roky = document.getElementById('ka_calendar_years_list').value.split(',');
		for (i = 0; i < temp_roky.length; i++) {
			e = document.getElementById('ka_calendar_3_td_' + temp_roky[i]);
			if (temp_roky[i] == ka_calendar_chosen_year) {
				ElementAddClass(e, 'calendar_td_selected');
			}
			else {
				ElementRemoveClass(e, 'calendar_td_selected');
			}
		}
	}
	else if (ka_calendar_act_pg == 2) {
		for (i = 1; i <= 12; i++) {
			e = document.getElementById('ka_calendar_2_td_' + i);
			if (i == ka_calendar_chosen_month && ka_calendar_act_year == ka_calendar_chosen_year) {
				ElementAddClass(e, 'calendar_td_selected');
			}
			else {
				ElementRemoveClass(e, 'calendar_td_selected');
			}
		}
	}
	else if (ka_calendar_act_year && ka_calendar_act_month) {
		var o_datum = new Date(ka_calendar_act_year, ka_calendar_act_month - 1, 1, 0, 0, 0, 0);
		var offset = o_datum.getDay();
		offset = (offset < 1 ? 6 : offset - 1);
		
		for (; i < offset; i++) {
			e = document.getElementById('ka_calendar_td_' + i);
			e.innerHTML = '';
			ElementRemoveClass(e, 'calendar_td_selected');
			ElementRemoveClass(e, 'calendar_td_active');
			ElementAddClass(e, 'calendar_td_empty');
		}
		var d = 1;
		var o_dnes = new Date();
		o_dnes.setHours(0);
		o_dnes.setMinutes(0);
		o_dnes.setSeconds(0);
		o_dnes.setMilliseconds(0);
		while (o_datum.getMonth() + 1 == ka_calendar_act_month) {
			e = document.getElementById('ka_calendar_td_' + i);
			ElementRemoveClass(e, 'calendar_td_empty');
			e.innerHTML = d + '<div id="ka_calendar_akce_' + ka_calendar_act_year + '_' + ka_calendar_act_month + '_' + d + '" class="ka_calendar_akce" onmouseover="ShowElement(\'ka_calendar_akce_'+ka_calendar_act_year+'_'+ka_calendar_act_month+'_'+d+'_details\', false, true);" onmouseout="HideElement(\'ka_calendar_akce_'+ka_calendar_act_year+'_'+ka_calendar_act_month+'_'+d+'_details\', false, true);"></div>';
			if (111 || o_datum.getTime() >= o_dnes.getTime()) {
				ElementAddClass(e, 'calendar_td_active');
			}
			else {
				ElementRemoveClass(e, 'calendar_td_active');
			}
			if (d == ka_calendar_chosen_day && ka_calendar_act_month == ka_calendar_chosen_month && ka_calendar_act_year == ka_calendar_chosen_year) {
				ElementAddClass(e, 'calendar_td_selected');
			}
			else {
				ElementRemoveClass(e, 'calendar_td_selected');
			}
			i++;
			d++;
			o_datum.setDate(d);
		}
		for (; i < ka_calendar_rows * ka_calendar_cols; i++) {
			e = document.getElementById('ka_calendar_td_' + i);
			e.innerHTML = '';
			ElementRemoveClass(e, 'calendar_td_selected');
			ElementRemoveClass(e, 'calendar_td_active');
			ElementAddClass(e, 'calendar_td_empty');
		}
		
		// PushOrChangeScrollFader('ka_calendar_months', 'ka_calendar_month_' + ka_calendar_act_month);
		var e_months = document.getElementById('ka_calendar_months_inner');
		e_months.style.top = (-2 * (ka_calendar_act_month - 1)) + 'em';  // 2em is calendar TD height
		
		AjaxLoad(['ka_load=1', 'ka_year=' + ka_calendar_act_year, 'ka_month=' + ka_calendar_act_month]);
	}
}

function KA_CalendarClick(e) {
	// show actions of the day
}

function KA_CalendarSetMonth(amonth) {
	ka_calendar_act_month = amonth;
	KA_RedrawCalendar();
}

function KA_CalendarSetYear(ayear) {
	ka_calendar_act_year = ayear;
	KA_RedrawCalendar();
}

function KA_CalendarIncrementMonth() {
	ka_calendar_act_month++;
	if (ka_calendar_act_month > 12) {
		ka_calendar_act_month = 1;
		ka_calendar_act_year++;
	}
	KA_RedrawCalendar();
}

function KA_CalendarDecrementMonth() {
	ka_calendar_act_month--;
	if (ka_calendar_act_month < 1) {
		ka_calendar_act_month = 12;
		ka_calendar_act_year--;
	}
	KA_RedrawCalendar();
}


function ShowHpMenu() {
	var i = 1;
	while (document.getElementById('hp_menu_itembox_' + i)) {
		setTimeout("ElementAddClass(document.getElementById('hp_menu_itembox_" + i + "'), 'hp_menu_itembox_visible');", i * 300);
		i++;
	}
}

function NabidkaSendData() {
	var e_nt = document.getElementById('nabidka_typ');
	var e_nl = document.getElementById('nabidka_lokalita');
	if (e_nt && e_nl) {
		location.href = '?s=nabidka&nabidka_typ=' + e_nt.value + '&nabidka_lokalita=' + e_nl.value;
	}
}
