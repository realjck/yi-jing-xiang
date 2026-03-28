/*
********************
Yi Jing Xiang
Author: jck
********************
*/

/**
 * Init some constant elements
 */
const btBack = $("#bt-back");
const info = $("#info");
const btSound = $("#bt-sound");

/**
 * For touch devices
 */
(function () {
  // lastTouchTime is used for ignoring emulated mousemove events
  let lastTouchTime = 0;

  function enableHover() {
    if (new Date() - lastTouchTime < 500) return;
    document.body.classList.add('hasHover');
  }

  function disableHover() {
    document.body.classList.remove('hasHover');
  }

  function updateLastTouchTime() {
    lastTouchTime = new Date();
  }

  document.addEventListener('touchstart', updateLastTouchTime, true);
  document.addEventListener('touchstart', disableHover, true);
  document.addEventListener('mousemove', enableHover, true);

  enableHover();
})();

/**
 * Initialize Swiper
 */
const swiper = new Swiper('.swiper', {
	navigation: {
		nextEl: '.swiper-button-next',
		prevEl: '.swiper-button-prev',
	}
});

/**
 * Yi-King Tirage variables
 */
let yiking = ""; // string for wengu ex 679866
let hexagram1, hexagram2;

/**
 * Initialize localization
 */
let lang = localStorage.getItem("YiJingXiang_lang") ?? "en";
SwitchLang(lang);

function SwitchLang(_lang){
	
	lang = _lang;
	
	$("#bt-lang-en, #bt-lang-fr").removeClass("active");
	$("#bt-lang-"+lang).addClass("active");
	
	localStorage.setItem("YiJingXiang_lang", lang);

	$("#baseline").html(UI_TEXTS[lang]["baseline"]);
	$("#consigne-1").html(UI_TEXTS[lang]["consigne-1"]);
	$("#consigne-2").html(UI_TEXTS[lang]["consigne-2"]);
	$("#book-text").html(UI_TEXTS[lang]["book"]);

	info.html(UI_TEXTS[lang]["info"]);

	if(hexagram1 != null){
		UpdateHexagramsTexts();
	}
}

$("#bt-lang-en").on("click", ()=>{
	PlaySound("click");
	SwitchLang("en");
});
$("#bt-lang-fr").on("click", ()=>{
	PlaySound("click");
	SwitchLang("fr");
});

/**
 * Main logic
 */
btBack.on("click", () =>{
	yiking = "";
	
	$(".consigne").show();
	$(".bar").remove();
	$("#coins").show();
	btBack.hide();
	
	swiper.slideTo(1, 500);
	
	setTimeout(function(){
		$("#result1").hide();
		$("#result2").hide();
		$("#end").hide();
		swiper.update();
	}, 500);
	
	PlaySound("back");
});

$("#coin-yang").on("click", () => {AddBar("yang")});
$("#coin-yin").on("click", () => {AddBar("yin")});
$("#coin-yang-mut").on("click", () => {AddBar("yang-mut")});
$("#coin-yin-mut").on("click", () => {AddBar("yin-mut")});

function AddBar(bar){

	btBack.show();
	$(".consigne").hide();
	
	$('<div class="bar bar-'+bar+'"></div>').insertAfter("#coins").hide().fadeIn();
	
	switch(bar){
		case "yin-mut": yiking += "6"; break;
		case "yang": yiking += "7"; break;
		case "yin": yiking += "8"; break;
		case "yang-mut": yiking += "9"; break;
	}
	if (yiking.length === 6){
		$("#coins").hide();
		
		hexagram1 = yiking.replace(/6/g, "0")
			.replace(/7/g,"1")
			.replace(/8/g, "0")
			.replace(/9/g, "1");
		hexagram2 = yiking.replace(/6/g, "1")
			.replace(/7/g, "1")
			.replace(/8/g, "0")
			.replace(/9/g, "0");

		// images
		$("#result1 .img-bottom").css("background-image", "url('assets/images/"+hexagram1.substring(0,3)+".jpg'");
		$("#result1 .img-top").css("background-image", "url('assets/images/"+hexagram1.substring(3)+".jpg'");
		$("#result2 .img-bottom").css("background-image", "url('assets/images/"+hexagram2.substring(0,3)+".jpg'");
		$("#result2 .img-top").css("background-image", "url('assets/images/"+hexagram2.substring(3)+".jpg'");
		
		UpdateHexagramsTexts();
		
		$("#result1").show();
		if (hexagram1 !== hexagram2){
			$("#result2").show();
		}
		$("#end").show();
		
		swiper.update();
		
		setTimeout(function(){
			swiper.slideTo(2, 1200);
		}, 500);
		PlaySound("yiking");
	} else {
		PlaySound("coin"+Math.ceil(Math.random()*2));
	}
}
function UpdateHexagramsTexts(){
	$("#result1 .hexagram-text").html(HEXAGRAMS_TEXTS[lang][hexagram1]);
	$("#result2 .hexagram-text").html(HEXAGRAMS_TEXTS[lang][hexagram2]);	
}

/**
 * Link to Wengu Tartarie book
 */
$("#book-image").on("click", ()=>{
	PlaySound("click");
	const hexatext = HEXAGRAMS_TEXTS[lang][hexagram1];
	const num = hexatext.substring(0, hexatext.indexOf("."));
	const url = "http://139.162.86.18/wg/wengu.php?l=Yijing&tire="+yiking+"&no="+num+"&lang="+lang;
	window.open(url, '_blank').focus();
});

/**
 * Show infos
 */
let showInfo = false;
$("#bt-info").on("click", ()=>{
	PlaySound("click");
	showInfo = !showInfo;
	if (showInfo){
		info.show();
	} else {
		info.hide();
	}
});

info.on("click", ()=>{
	PlaySound("click");
	info.hide();
	showInfo = false;
});

/**
 * Sounds
 */
let sound = localStorage.getItem("YiJingXiang_sound") ?? "1";
ApplyButtonSound();

function ApplyButtonSound(){
	if (sound === "1"){
		btSound.addClass("active");
	} else {
		btSound.removeClass("active");
	}
	localStorage.setItem("YiJingXiang_sound", sound);
}
btSound.on("click", ()=>{
	sound = sound === "0" ? "1" : "0";
	ApplyButtonSound();
});

function PlaySound(src){
	if (sound === "1"){
		const audioElement = document.createElement('audio');
		audioElement.setAttribute('src', 'assets/sounds/'+src+'.mp3');
		audioElement.play().then();
		audioElement.remove();
	}
}

/**
 * Preload assets
 */
preloadXHR([
    'assets/images/000.jpg',
	'assets/images/001.jpg',
	'assets/images/011.jpg',
	'assets/images/111.jpg',
	'assets/images/010.jpg',
	'assets/images/110.jpg',
	'assets/images/100.jpg',
	'assets/images/101.jpg',
	'assets/sounds/back.mp3',
	'assets/sounds/coin1.mp3',
	'assets/sounds/coin2.mp3',
	'assets/sounds/yiking.mp3',
	'assets/sounds/click.mp3'
]);

function preloadXHR(assetsAr){
	for (let i=0; i<assetsAr.length; i++){
		const xhr = new XMLHttpRequest();
		xhr.open('GET', assetsAr[i]);
		xhr.send('');
	}
}
