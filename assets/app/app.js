/*
********************
Yi Jing Xiang
Author: realjck
v0.1
********************
*/

// touch?
function watchForHover() {
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
}

watchForHover();

// Init swiper

var swiper = new Swiper('.swiper', {
	navigation: {
		nextEl: '.swiper-button-next',
		prevEl: '.swiper-button-prev',
	}
});

// Init lang

var lang = "en";
if (localStorage.getItem("YiJingXiang_lang")){
	lang = localStorage.getItem("YiJingXiang_lang");
}
SwitchLang(lang);

function SwitchLang(_lang){
	
	lang = _lang;
	
	$("#bt-lang-en, #bt-lang-fr").removeClass("active");
	$("#bt-lang-"+lang).addClass("active");
	
	localStorage.setItem("YiJingXiang_lang", lang);

	$("#baseline").html(UI_TEXTS[lang]["baseline"]);
	$("#consigne").html(UI_TEXTS[lang]["consigne"]);

	if(hexagram1 != null){
		UpdateHexagramsTexts();
	}
}

$("#bt-lang-en").on("click", function(e){
	SwitchLang("en");
});
$("#bt-lang-fr").on("click", function(e){
	SwitchLang("fr");
});

// Yi-King Tirage
var yiking = ""; // string for wengu ex 679866
var hexagram1, hexagram2;

$("#bt-back").on("click", InitYiking);
 
function InitYiking(){
	yiking = "";
	
	$("#consigne").show();
	$(".bar").remove();
	$("#coins").show();
	$("#bt-back").hide();
	
	swiper.slideTo(1, 500);
	
	setTimeout(function(){
		$("#result1").hide();
		$("#result2").hide();
		$("#end").hide();
		swiper.update();
	}, 500);

}

$("#coin-yang").on("click", function(e){
	AddBar("yang");
});
$("#coin-yin").on("click", function(e){
	AddBar("yin");
});
$("#coin-yang-mut").on("click", function(e){
	AddBar("yang-mut");
});
$("#coin-yin-mut").on("click", function(e){
	AddBar("yin-mut");
});

function AddBar(bar){
	
	$("#bt-back").show();
	$("#consigne").hide();
	
	$('<div class="bar bar-'+bar+'"></div>').insertAfter("#coins").hide().fadeIn();
	
	switch(bar){
		case "yin-mut": yiking += "6"; break;
		case "yang": yiking += "7"; break;
		case "yin": yiking += "8"; break;
		case "yang-mut": yiking += "9"; break;
	}
	if (yiking.length == 6){
		$("#coins").hide();
		
		hexagram1 = yiking.replace(/6/g, "0").replace(/7/g, "1").replace(/8/g, "0").replace(/9/g, "1");
		hexagram2 = yiking.replace(/6/g, "1").replace(/7/g, "1").replace(/8/g, "0").replace(/9/g, "0");
		
		UpdateHexagramsTexts();
		
		$("#result1").show();
		if (hexagram1 != hexagram2){
			$("#result2").show();
		}
		$("#end").show();
		
		swiper.update();
		
		setTimeout(function(){
			swiper.slideTo(2, 1200);
		}, 500);
	}
}
function UpdateHexagramsTexts(){
	$("#result1 .hexagram-text").html(HEXAGRAMS_TEXTS[lang][hexagram1]);
	$("#result2 .hexagram-text").html(HEXAGRAMS_TEXTS[lang][hexagram2]);	
}