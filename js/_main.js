/**
 * AudioDance
 * webkitAudioContextを使って、音とCanvas描画をシンクロさせます。
 * Author: hisasann
 * SpecialThanks: ken_c_lo
 * 
 * 参考URL：
 * http://jsdo.it/mackee/9WGv
 * http://www.usamimi.info/~ide/programe/tinysynth/doc/audioapi-report.pdf
 * http://epx.com.br/artigos/audioapi.php
 * http://paperjs.org/
 */

(function() {

var AudioDance = {};

var 
	context,
	source,
	gainNode,
	analyserNode,
	timeDomainData,
	
	canvas,
	options = [],
	circles = [],
	path,
	
	SHOW_DRAW_COUNT = 4,
	SHOW_OBJECT_COUNT = 5,
	SOUND_FILE = "PLMS_IV_D.ogg";

AudioDance.play = function(fn) {
	if (!window.webkitAudioContext) {
		throw "UnSupported AudioContext";
	}
	
	createAudioContext(fn);
}

function createAudioContext(fn) {
	context = new webkitAudioContext();
	source = context.createBufferSource();
	gainNode = context.createGainNode();
	analyserNode = context.createAnalyser();

	gainNode.gain.value = 0.5;

	source.connect(gainNode);
	gainNode.connect(analyserNode);
	analyserNode.connect(context.destination);

	createXHR("sound/" + SOUND_FILE, function(xhr) {
		init(xhr);
        fn();
	});
	
	timeDomainData = new Uint8Array(analyserNode.frequencyBinCount);
}

function createXHR(url, fn) {
	var xhr = new XMLHttpRequest();
	xhr.open("GET", url, true);
	xhr.responseType = "arraybuffer";

	xhr.onload = function() {
	    fn(xhr);
	};

	xhr.send();
}

function init(xhr) {
    source.buffer = context.createBuffer(xhr.response, false);
    source.noteOn(context.currentTime);

	// for (var i=0; i<SHOW_CIRCLES_COUNT; i++) {
	// 	options.push({
	// 		x: Math.floor(Math.random() * $(window).width()),
	// 		y: Math.floor(Math.random() * $(window).height()),
	// 		color: "#" + getColor()
	// 	})
	// }

	canvas = document.getElementById("canvas");
	paper.setup(canvas);
	
	for (var i=0; i<SHOW_DRAW_COUNT; i++) {
		drawStarCircle("#" + getColor());
	}
	
	paper.view.draw();
	
	paper.view.onFrame = onFrame;
}

var starSymbol = [], circleSymbol = [];
function drawStarCircle(color) {
	var star = new paper.Path.Star(new paper.Point(0, 0), 5, 50, 100),
		circle = new paper.Path.Circle(new paper.Point(0, 0), 100);

	star.fillColor = color;
	star.selected = true;
	circle.fillColor = color;
	circle.selected = true;

	var sSymbol = new paper.Symbol(star);
	var cSymbol = new paper.Symbol(circle);
	starSymbol.push(sSymbol);
	circleSymbol.push(cSymbol);

	var x, y;
	for (var i = 0; i < SHOW_OBJECT_COUNT; i++) {
		x = Math.floor(paper.view.size.getWidth() * paper.Point.random().x);
		y = Math.floor(paper.view.size.getHeight() * paper.Point.random().y);
		
		if (i % 2 === 0) {
		    sSymbol.place(new paper.Point(x, y));
		} else {
		    cSymbol.place(new paper.Point(x, y));
		}
	}
}

function onFrame() {
	analyserNode.getByteFrequencyData(timeDomainData);

	//drawCircle(timeDomainData);
	//drawImage(timeDomainData);
	shoutObject(timeDomainData);
}

function shoutObject(data) {
	// starSymbol.definition.strokeColor.hue += 0.2;
	for (var i = 0, len = starSymbol.length; i < len; i++) {
		starSymbol[i].definition.scale(0);
		starSymbol[i].definition.scale(data[50 * (i + 1)] / 80);
		circleSymbol[i].definition.scale(0);
		circleSymbol[i].definition.scale(data[50 * (i + 1)] / 80);
	}
	
	// starSymbol.definition.scale(data[50 * (1 + 1)] / 80);
	// circleSymbol.definition.strokeColor.hue += 0.1;
	// circleSymbol.definition.scale(data[50 * (1 + 1)] / 80);
}

// function drawCircle(data) {
// 	for (var i=0; i<SHOW_CIRCLES_COUNT; i++) {
// 		if (circles[i]) {
// 			circles[i].remove();
// 		}
// 		
// 		if (i % 2 === 0) {
// 			// Star
// 			circles[i] = new paper.Path.Star(new paper.Point(options[i].x, options[i].y), 5, 50, 100);
// 
// 			// Rectangle
// 			// var point = new paper.Point(options[i].x, options[i].y);
// 			// var size = new paper.Size(100, 100);
// 			// var rectangle = new paper.Rectangle(point, size);
// 			// circles[i] = new paper.Path.Rectangle(rectangle);
// 
// 			circles[i].fillColor = options[i].color;
// 			circles[i].scale(data[50 * (i + 1)] / 80);
// 
// 			// circles[i].rotate(data[50 * (i + 1)]);	// rotate入れるとだいぶ重くなる
// 		} else {
// 			// Circle
// 			circles[i] = new paper.Path.Circle(new paper.Point(options[i].x, options[i].y), 100);
// 			circles[i].fillColor = options[i].color;
// 			circles[i].scale(data[50 * (i + 1)] / 80);
// 		}
// 	}
// }

function drawCircle(data) {
	var star = new paper.Path.Star(new paper.Point(0, 0), 5, 50, 100),
		circle = new paper.Path.Circle(new paper.Point(0, 0), 100);

	var starSymbol = new paper.Symbol(star),
		circleSymbol = new paper.Symbol(circle);
	
	for (var i = 0; i < SHOW_CIRCLES_COUNT; i++) {
		if (i % 2 === 0) {
		    starSymbol.place(paper.view.size * paper.Point.random());
		} else {
		    circleSymbol.place(paper.view.size * paper.Point.random());
		}
	}

	for (var i=0; i<SHOW_CIRCLES_COUNT; i++) {
		if (circles[i]) {
			circles[i].remove();
		}

		if (i % 2 === 0) {
			// Star
			circles[i] = star.place(new paper.Point(options[i].x, options[i].y));
			circles[i].fillColor = options[i].color;
			circles[i].scale(data[50 * (i + 1)] / 80);
			circles[i].selected = true;

			// circles[i].rotate(data[50 * (i + 1)]);	// rotate入れるとだいぶ重くなる
		} else {
			// Circle
			circles[i] = circle.place(new paper.Point(options[i].x, options[i].y));
			circles[i].definition.fillColor = options[i].color;
			circles[i].scale(data[50 * (i + 1)] / 80);
			circles[i].selected = true;
		}
	}
}

var speaker1, speaker2;
function drawImage(data) {
    if (speaker1) {
        speaker1.remove();
    }

    var size = 300,
        left = Math.floor(($(window).width()) / 2),
        top = Math.floor(($(window).height()) / 2);

    speaker1 = new paper.Raster("apple");
    speaker1.size = new paper.Size(size, size);
    speaker1.position = new paper.Point(left - size, top);
    speaker1.scale(data[50 * (5 + 1)] / 100);

    if (speaker2) {
        speaker2.remove();
    }
    speaker2 = new paper.Raster("apple");
    speaker2.size = new paper.Size(size, size);
    speaker2.position = new paper.Point(left + size, top);
    speaker2.scale(data[50 * (8 + 1)] / 100);
}

function getColor() {
	return Math.floor(Math.random() * 0xFFFFFF).toString(16);
}

window.AudioDance = AudioDance;

})();
