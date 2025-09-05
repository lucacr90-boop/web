var ImageBox = function(eid, images, mode) {

	var myself = this;
	this.eid = eid;
	this.mode = (mode == 1 ? 1 : 2);
	
	this.images = images;
	this.images_titles = [];
	this.imagesPointer = -1;
	this.activeImgTag = -1;
	this.justLoadingImage = -1;
	
	this.activeFadersLastTime = 0;

	this.slideshowEnabled = false;
	this.slideshowCounter = 0;
	this.slideshowCounterMax = 50 * 5;
	
	this.buttonsActive = (this.images.length > 1 ? true : false);

	this.stopEPropagation = function(e){
		if (e.stopPropagation) {
			e.stopPropagation();
		}
		e.cancelBubble = true;
	}
	
	this.clickedPrevious = function(e){
		myself.previousImage();
		myself.stopEPropagation(e);
	};
	this.clickedNext = function(e){
		myself.nextImage();
		myself.stopEPropagation(e);
	};
	this.clickedSlideshow = function(e){
		myself.toggleSlideshow();
		myself.stopEPropagation(e);
	};
	this.eventImageLoaded = function(e){
		myself.imageLoaded(e);
	};
	this.eventShowImage = function(e){
		var id = '';
		if (!e) {
			e = window.event;
		}
		if (e.srcElement) {
			id = e.srcElement.getAttribute("id");
		}
		else if (e.target) {
			id = e.target.getAttribute("id");
		}
		
		if (id.lastIndexOf("_") >= 0) {
			var num = parseInt(id.substr(id.lastIndexOf("_") + 1)) + 0;
			myself.showImage(num);
		}
	};
	
	
	///// create HTML

	var div1 = document.createElement('div');
	div1.setAttribute("id", this.eid + '_div_1');
	div1.className = 'imagebox_div';
	var div1img = document.createElement('div');
	div1img.setAttribute("id", this.eid + '_div_img_1');
	div1img.className = 'imagebox_div_img';
	var img1 = document.createElement('img');
	img1.setAttribute("id", this.eid + '_img_1');
	img1.setAttribute("src", 'imagebox/img/_blank_16.png');
	div1img.appendChild(img1);
	div1.appendChild(div1img);
	
	var div1title_shadow = document.createElement('div');
	div1title_shadow.setAttribute("id", this.eid + '_div_1_title_shadow');
	div1title_shadow.className = 'imagebox_div_title_shadow';
	div1.appendChild(div1title_shadow);
	var div1title = document.createElement('div');
	div1title.setAttribute("id", this.eid + '_div_1_title');
	div1title.className = 'imagebox_div_title';
	div1.appendChild(div1title);	
	
	var div2 = document.createElement('div');
	div2.setAttribute("id", this.eid + '_div_2');
	div2.className = 'imagebox_div';
	var div2img = document.createElement('div');
	div2img.setAttribute("id", this.eid + '_div_img_2');
	div2img.className = 'imagebox_div_img';
	var img2 = document.createElement('img');
	img2.setAttribute("id", this.eid + '_img_2');
	img2.setAttribute("src", 'imagebox/img/_blank_16.png');
	div2img.appendChild(img2);
	div2.appendChild(div2img);

	var div2title_shadow = document.createElement('div');
	div2title_shadow.setAttribute("id", this.eid + '_div_2_title_shadow');
	div2title_shadow.className = 'imagebox_div_title_shadow';
	div2.appendChild(div2title_shadow);
	var div2title = document.createElement('div');
	div2title.setAttribute("id", this.eid + '_div_2_title');
	div2title.className = 'imagebox_div_title';
	div2.appendChild(div2title);
	
	var mainElement = document.getElementById(this.eid);
	if (!mainElement) {
		var mainElement = document.createElement('div');
		mainElement.setAttribute("id", this.eid);
		mainElement.className = 'imagebox2 ib_no_clicks';
		document.getElementById('imageboxes').appendChild(mainElement);
	}
	else {
		while (mainElement.hasChildNodes()) {
			mainElement.removeChild(mainElement.firstChild);
		}
	}
	
	mainElement.appendChild(div1);
	mainElement.appendChild(div2);

	if (this.buttonsActive) {
		var button_previous = document.createElement('div');
		button_previous.setAttribute("id", this.eid + '_previous');
		button_previous.className = 'imagebox_button_previous';
/*s		var button_slideshow = document.createElement('img');
		button_slideshow.setAttribute("id", this.eid + '_slideshow');
		button_slideshow.setAttribute("src", 'imagebox/img/button_play.png'); */
		var button_next = document.createElement('div');
		button_next.setAttribute("id", this.eid + '_next');
		button_next.className = 'imagebox_button_next';

		mainElement.appendChild(button_previous);
//s		mainElement.appendChild(button_slideshow);
		mainElement.appendChild(button_next);

		ImageBox.addEListener(document.getElementById(this.eid + '_previous'), "click", this.clickedPrevious);
		ImageBox.addEListener(document.getElementById(this.eid + '_next'), "click", this.clickedNext);
//s		ImageBox.addEListener(document.getElementById(this.eid + '_slideshow'), "click", this.clickedSlideshow);
	}
	
//x	ImageBox.pushOrChangeFaderImageBox(this.eid, 0.05);
//x	this.nextImage();  // first image
	ImageBox.imageBoxes.push(this);
	if (ImageBox.imageBoxes.length == 1) {  // first imagebox
		ImageBox.serveImageBoxes();
	}
	
}


ImageBox.faders = [];
ImageBox.fade_full = 1.0;
ImageBox.fade_delta_in = 0.2;
ImageBox.fade_delta_out = 0.15 //0.08;
ImageBox.fade_delay_out = 1;
ImageBox.disable_fade = false;

ImageBox.imagebox_counter = 0;
ImageBox.imageBoxes = [];
ImageBox.stuff_period = 25;

ImageBox.serveImageBoxes = function () {
	for (var i = 0; i < ImageBox.imageBoxes.length; i++) {
		ImageBox.imageBoxes[i].doTheStuff();
	}
	ImageBox.processFaders();
	setTimeout("ImageBox.serveImageBoxes();", ImageBox.stuff_period);
};



ImageBox.createAll = function (startElement) {  // create in mode 2
	var e = document.getElementById(startElement);
	if (e) {
		var tags = e.getElementsByTagName("div");
		for (var i = 0; i < tags.length; i++) {
			if (ImageBox.ElementHasClass(tags[i], 'imagebox_thumbnails') || ImageBox.ElementHasClass(tags[i], 'galerie')) {
				ImageBox.imagebox_counter++;
				tags[i].setAttribute("id", "imagebox_" + ImageBox.imagebox_counter + "_thumbs");
				var newImageBox = ImageBox.create("imagebox_" + ImageBox.imagebox_counter, "imagebox_" + ImageBox.imagebox_counter + "_thumbs");
			}
		}
		
		var tags = e.getElementsByTagName("p");
		for (var i = 0; i < tags.length; i++) {
			if (ImageBox.ElementHasClass(tags[i], 'imagebox_thumbnails') || ImageBox.ElementHasClass(tags[i], 'galerie')) {
				ImageBox.imagebox_counter++;
				tags[i].setAttribute("id", "imagebox_" + ImageBox.imagebox_counter + "_thumbs");
				var newImageBox = ImageBox.create("imagebox_" + ImageBox.imagebox_counter, "imagebox_" + ImageBox.imagebox_counter + "_thumbs");
			}
		}
		
	}
}

ImageBox.create = function (eid, eidThumbs, mode) {  // create in mode 2 (or 1 --- if mode == 1)
	var images_dom = [];
	var images_names = [];
//-	var e = document.getElementById(eid);
	var e_thumbs = document.getElementById(eidThumbs);
	if (e_thumbs) {
		var image_counter = 0;
		var img_tags = e_thumbs.getElementsByTagName("img");
		for (var i = 0; i < img_tags.length; i++) {
			var matched_replace_by = false;
// / *
			if (img_tags[i].src.match(/_small\/[^\/]+$/)) {
				img_tags[i].setAttribute("id", eid + "_image_" + image_counter);
				images_dom.push(img_tags[i]);
				images_names.push(img_tags[i].src.replace(/\/_small(\/[^\/]+)$/, '$1'));
				image_counter++;
			}
// * /
			else {
				var matches = img_tags[i].src.match(/&target_size=([1-9][0-9]*)/);
				if (matches && matches.length == 2) {
					matched_replace_by = '&size=' + matches[1];
				}
				
				var matched = false;
				if (img_tags[i].src.match(/&size=1$/)) {
					matched = 1;
					if (matched_replace_by === false) {
	//					matched_replace_by = '$1';
						matched_replace_by = '';
					}
				}
				else if (img_tags[i].src.match(/&size=2$/)) {
					matched = 2;
					if (matched_replace_by === false) {
	//					matched_replace_by = '$1';
						matched_replace_by = '';
					}
				}
				else if (img_tags[i].src.match(/&size=3$/)) {
					matched = 3;
					if (matched_replace_by === false) {
	//					matched_replace_by = '$1';
						matched_replace_by = '';
					}
				}
				else if (img_tags[i].src.match(/&size=4$/)) {
					matched = 4;
					if (matched_replace_by === false) {
	//					matched_replace_by = '$1';
						matched_replace_by = '';  // '&size=2'
					}
				}
				if (matched !== false) {
					img_tags[i].setAttribute("id", eid + "_image_" + image_counter);
					images_dom.push(img_tags[i]);
					if (matched == 1) {
						images_names.push(img_tags[i].src.replace(/&size=1$/, matched_replace_by));
					}
					else if (matched == 2) {
						images_names.push(img_tags[i].src.replace(/&size=2$/, matched_replace_by));
					}
					else if (matched == 3) {
						images_names.push(img_tags[i].src.replace(/&size=3$/, matched_replace_by));
					}
					else if (matched == 4) {
						images_names.push(img_tags[i].src.replace(/&size=4$/, matched_replace_by));
					}
					image_counter++;
				}
			}
		}  // for i
		
		if (images_dom.length > 0) {
			var ib = new ImageBox(eid, images_names, mode == 1 ? 1 : 2);
			for (var i = 0; i < images_dom.length; i++) {
				ImageBox.addEListener(images_dom[i], "click", ib.eventShowImage);
				ib.images_titles.push(images_dom[i].alt + '');
			}
			return ib;  // success
		}
	}
	return null;
};

ImageBox.createFromList = function (eid, images) {  // create in mode 1
	return new ImageBox(eid, images, 1);
};


ImageBox.showDisabler = function() {
//+	ImageBox.ElementAddClass(document.getElementById('body'), 'ib_body_disable_scroll');
//D	ImageBox.pushOrChangeFaderImageBox('ib_disabler', ImageBox.fade_delta_in);
}

ImageBox.hideDisabler = function() {
//+	ImageBox.ElementRemoveClass(document.getElementById('body'), 'ib_body_disable_scroll');
	ImageBox.pushOrChangeFaderImageBox('ib_detail_close', -1 /* -ImageBox.fade_delta_out */);
//D	ImageBox.pushOrChangeFaderImageBox('ib_disabler', -ImageBox.fade_delta_out);
	ImageBox.pushOrChangeFaderImageBox('ib_disabler_loading', -1);
	for (var i = 0; i < ImageBox.imageBoxes.length; i++) {
		ImageBox.imageBoxes[i].hideImageBox();
	}
}


ImageBox.addEListener = function(el, ev, f) {
	if (el.addEventListener) {
		el.addEventListener(ev, f);
	}
	else if (el.attachEvent) {
		el.attachEvent("on" + ev, f);
	}
}

ImageBox.removeEListener = function(el, ev, f) {
	if (el.removeEventListener) {
		el.removeEventListener(ev, f);
	}
	else if (el.detachEvent) {
		el.detachEvent("on" + ev, f);
	}
}

ImageBox.pushOrChangeFaderImageBox = function(eid, fade_delta) {
	var idx = -1;
	for (var i = 0; i < ImageBox.faders.length; i++) {
		if (ImageBox.faders[i][0] == eid) {
			ImageBox.faders[i][2] = fade_delta;
			idx = i;
			break;
		}
	}
	if (idx < 0) {
/*-		var e = document.getElementById(eid);
		if (111 || !ImageBox.disable_fade) {
			e.className += ' opacity_class';
		} */
		ImageBox.faders.push([eid, fade_delta < 0 ? ImageBox.fade_full : 0, fade_delta, 0, false]);
	}
	if (fade_delta > 0) {
		var e = document.getElementById(eid);
		if (e.style.visibility != 'visible') {
			
//D			if (ImageBox.faders[i][0] == 'ib_disabler') {
//D				document.getElementById('imageboxes').style.display = 'block';
//D			}
			if (/^imagebox_[1-9][0-9]*$/.test(ImageBox.faders[i][0])) {
				document.getElementById(ImageBox.faders[i][0]).style.display = 'block';
			}
			
			e.style.visibility = 'visible';
			ImageBox.setOpacity(e, 0);
		}
	}
}



// faders[i][0] .. eid
// faders[i][1] .. fade_step
// faders[i][2] .. fade_delta
// faders[i][3] .. fade_delay_out
// faders[i][4] .. disable_fade

ImageBox.processFaders = function() {
	this.activeFadersLastTime = 0;
	for (var i = 0; i < ImageBox.faders.length; i++) {
		if (ImageBox.faders[i][2] == 0) {
			continue;
		}
		this.activeFadersLastTime++;
		var e = document.getElementById(ImageBox.faders[i][0]);
		if (!e) {
			continue;
		}
		
		var e_op = ImageBox.faders[i][1];
		var e_d = ImageBox.faders[i][2];
		if (e_d < 0 && e_op + e_d <= 0) {
			if (!ImageBox.faders[i][4]) {
				ImageBox.setOpacity(e, 0);
			}
			e.style.visibility = 'hidden';
			ImageBox.faders[i][1] = 0;
			ImageBox.faders[i][2] = 0;
//D			if (ImageBox.faders[i][0] == 'ib_disabler') {
//D				document.getElementById('imageboxes').style.display = 'none';
//D			}
			if (/^imagebox_[1-9][0-9]*$/.test(ImageBox.faders[i][0])) {
				document.getElementById(ImageBox.faders[i][0]).style.display = 'none';
			}
		}
		else if (e_d > 0 && e_op + e_d >= ImageBox.fade_full) {
			if (!ImageBox.faders[i][4]) {
				ImageBox.setOpacity(e, ImageBox.fade_full);
			}
			ImageBox.faders[i][1] = ImageBox.fade_full;
			ImageBox.faders[i][2] = 0;
			ImageBox.faders[i][3] = ImageBox.fade_delay_out;
		}
		else {
			if (e_d < 0 && ImageBox.faders[i][3] > 0) {
				ImageBox.faders[i][3]--;
			}
			else {
				ImageBox.faders[i][1] = e_op + e_d;
				if (!ImageBox.faders[i][4]) {
					ImageBox.setOpacity(e, ImageBox.faders[i][1]);
				}
			}
		}
	}
}

ImageBox.setOpacity = function (e, opacity) {
	if (e.style.opacity != null) {
		e.style.opacity = opacity;
	}
	else if (navigator.appName.indexOf("Microsoft") != -1 && parseInt(navigator.appVersion) >= 4) {
		e.style.filter = "alpha(opacity=" + Math.round(opacity * 100) + ")";
	}
}

ImageBox.ElementHasClass = function (e, c) {
	if (!e) {
		return null;
	}
	return e.className.match(new RegExp('([ ]|^)' + c + '([ ]|$)'));
}
ImageBox.ElementAddClass = function (e, c) {
	if (!e) {
		return null;
	}
	if (!ElementHasClass(e, c)) {
		e.className += (e.className != '' ? ' ' : '') + c;
	}
}
ImageBox.ElementRemoveClass = function (e, c) {
	if (!e) {
		return null;
	}
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



ImageBox.prototype = {

	doTheStuff: function() {
		if (this.slideshowEnabled && this.justLoadingImage < 0) {
			this.slideshowCounter++;
			if (this.slideshowCounter >= this.slideshowCounterMax) {
				this.slideshowCounter = 0;
				this.nextImage();
			}
		}

	},

	showImageBox: function() {
		ImageBox.pushOrChangeFaderImageBox(this.eid, ImageBox.fade_delta_in);
		if (this.mode == 2) {
			ImageBox.pushOrChangeFaderImageBox('ib_detail_close', ImageBox.fade_delta_in);
		}
	},
	
	hideImageBox: function() {
		if (this.slideshowEnabled) {
			this.toggleSlideshow();
		}
		
		ImageBox.pushOrChangeFaderImageBox(this.eid, -ImageBox.fade_delta_out);
		ImageBox.pushOrChangeFaderImageBox(this.eid + '_previous', -1 /* -ImageBox.fade_delta_out */);
		ImageBox.pushOrChangeFaderImageBox(this.eid + '_next', -1 /* -ImageBox.fade_delta_out */);
		
		this.activeImgTag = -1;
	},
	
	toggleSlideshow: function(immediately) {
		this.slideshowEnabled = !this.slideshowEnabled;
		if (this.slideshowEnabled) {
			if (immediately) {
				this.slideshowCounter = this.slideshowCounterMax - 1;
			}
			else {
				this.slideshowCounter = Math.round(this.slideshowCounterMax * 0.85);
			}
			document.getElementById(this.eid + '_slideshow').src = document.getElementById(this.eid + '_slideshow').src.replace(/button_play.png$/, 'button_pause.png');
		}
		else {
			document.getElementById(this.eid + '_slideshow').src = document.getElementById(this.eid + '_slideshow').src.replace(/button_pause.png$/, 'button_play.png');
		}
	},
	
	showImage: function(num) {
		if (this.activeFadersLastTime > 0) {
			return;
		}
		this.imagesPointer = num;
		if (this.mode == 2) {
			ImageBox.showDisabler();
		}
		this.loadImage();
	},
	
	previousImage: function() {
		if (this.activeFadersLastTime > 0) {
			return;
		}
/*c		this.imagesPointer--;
		if (this.imagesPointer < 0) {
			this.imagesPointer = this.images.length - 1;
			this.loadImage();
		} */
		if (this.imagesPointer > 0) {
			this.imagesPointer--;
			this.loadImage();
		}
	},
	
	nextImage: function() {
		if (this.activeFadersLastTime > 0) {
			return;
		}
/*c		this.imagesPointer++;
		if (this.imagesPointer >= this.images.length) {
			this.imagesPointer = 0;
			this.loadImage();
		} */
		if (this.imagesPointer < this.images.length - 1) {
			this.imagesPointer++;
			this.loadImage();
		}
	},

	loadImage: function() {
		if (this.activeImgTag < 0) {
			ImageBox.pushOrChangeFaderImageBox(this.eid + '_div_1', -1);
			ImageBox.pushOrChangeFaderImageBox(this.eid + '_div_2', -1);
		}
		this.slideshowCounter = 0;
		var activeImgTag2 = (this.activeImgTag + 1) % 2;
		var img = document.getElementById(this.eid + '_img_' + (activeImgTag2 + 1));
		if (this.justLoadingImage >= 0) {
			ImageBox.removeEListener(img, "load", this.eventImageLoaded);
		}
		this.justLoadingImage = this.imagesPointer;
		
		if (this.images_titles.length > 0) {
			var divXtitle = document.getElementById(this.eid + '_div_' + (activeImgTag2 + 1) + '_title');
			var divXtitle_shadow = document.getElementById(this.eid + '_div_' + (activeImgTag2 + 1) + '_title_shadow');
			divXtitle.innerHTML = this.images_titles[this.imagesPointer];
			divXtitle_shadow.innerHTML = this.images_titles[this.imagesPointer];
		}
		
		var divXimg = document.getElementById(this.eid + '_div_img_' + (activeImgTag2 + 1));
		var imgX = document.createElement('img');
		imgX.setAttribute("id", this.eid + '_img_' + (activeImgTag2 + 1));
		divXimg.replaceChild(imgX, img);
		ImageBox.addEListener(imgX, "load", this.eventImageLoaded);  // addListener musi byt pred setAttribute("src", ...) !!! jinak se (obcas) neprovede onload
		imgX.setAttribute("src", this.images[this.imagesPointer]);
		ImageBox.pushOrChangeFaderImageBox('ib_disabler_loading', ImageBox.fade_delta_in / 4);
	},

	imageLoaded: function(e) {
		if (this.activeImgTag >= 0) {
			ImageBox.pushOrChangeFaderImageBox(this.eid + '_div_' + (this.activeImgTag + 1), -ImageBox.fade_delta_out / 2);
			document.getElementById(this.eid + '_div_' + (this.activeImgTag + 1)).style.zIndex = 2;
			document.getElementById(this.eid + '_div_' + ((this.activeImgTag + 1) % 2 + 1)).style.zIndex = 1;
		}
		this.activeImgTag = (this.activeImgTag + 1) % 2;  // change this.activeImgTag
		
		var img = document.getElementById(this.eid + '_img_' + (this.activeImgTag + 1));
		ImageBox.removeEListener(img, "load", this.eventImageLoaded);
		this.justLoadingImage = -1;
		
		if (this.mode == 2) {
			this.showImageBox();
		}
		else if (this.mode == 1) {
			this.showImageBox();
		}
		
		ImageBox.pushOrChangeFaderImageBox(this.eid + '_div_' + (this.activeImgTag + 1), ImageBox.fade_delta_in / 1);
		
		if (this.imagesPointer > 0) {
			ImageBox.pushOrChangeFaderImageBox(this.eid + '_previous', ImageBox.fade_delta_in);
		}
		else {
			ImageBox.pushOrChangeFaderImageBox(this.eid + '_previous', -ImageBox.fade_delta_out);
		}
		if (this.imagesPointer < this.images.length - 1) {
			ImageBox.pushOrChangeFaderImageBox(this.eid + '_next', ImageBox.fade_delta_in);
		}
		else {
			ImageBox.pushOrChangeFaderImageBox(this.eid + '_next', -ImageBox.fade_delta_out);
		}
		
		ImageBox.pushOrChangeFaderImageBox('ib_disabler_loading', -ImageBox.fade_delta_out);
	}
	
};


