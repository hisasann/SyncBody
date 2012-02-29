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
	path,

	options1 = [],
	options2 = [],
	
	SHOW_DRAW_COUNT = 15,
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

	canvas = document.getElementById("canvas");
	paper.setup(canvas);

	makeOption1();
	makeOption2();
	
	setInterval(function() {
		onFrame();
	}, 50);
	//paper.view.onFrame = onFrame;
	
	setInterval(function() {
		makeOption1();
		makeOption2();
	}, 5000);
}

function makeOption1() {
	var values = {
	    minPoints: 5,
	    maxPoints: 15,
	    minRadius: 30,
	    maxRadius: 90
	};

	var radiusDelta = values.maxRadius - values.minRadius,
		pointsDelta = values.maxPoints - values.minPoints;

	for (var i=0; i<SHOW_DRAW_COUNT; i++) {
		options1[i] = {
			radius: values.minRadius + Math.random() * radiusDelta,
			points: values.minPoints + Math.floor(Math.random() * pointsDelta),
			x: Math.floor(paper.view.size.getWidth() * paper.Point.random().x),
			y: Math.floor(paper.view.size.getHeight() * paper.Point.random().y),
	    	lightness: (Math.random() - 0.5) * 0.4 + 0.4,
	    	hue: Math.random() * 360,
			length: (values.maxRadius * 0.5) + (Math.random() * values.maxRadius * 0.5),
			color: "#" + getColor()
		};
	}
}

function makeOption2() {
	for (var i=0; i<SHOW_DRAW_COUNT; i++) {
		options2[i] ={
			x: Math.floor(paper.view.size.getWidth() * paper.Point.random().x),
			y: Math.floor(paper.view.size.getHeight() * paper.Point.random().y),
			color: "#" + getColor()
		};
	}
}

function onFrame() {
	analyserNode.getByteFrequencyData(timeDomainData);

	drawCircle(timeDomainData);
	drawBlobs(timeDomainData);
	//drawImage(timeDomainData);

	paper.view.draw();
}

var circles = [];
function drawCircle(data) {
	for (var i=0; i<SHOW_DRAW_COUNT; i++) {
		if (circles[i]) {
			circles[i].remove();
		}
		
		if (i % 2 === 0) {
			// Star
			circles[i] = new paper.Path.Star(new paper.Point(options2[i].x, options2[i].y), 5, 50, 100);
			circles[i].strokeColor = 'black';
			circles[i].fillColor = options2[i].color;
			circles[i].scale(data[50 * (i + 1)] / 80);
			circles[i].rotate(data[50 * (i + 1)]);	// rotate入れるとだいぶ重くなる
		} else {
			// Circle
			circles[i] = new paper.Path.Circle(new paper.Point(options2[i].x, options2[i].y), 100);
			circles[i].strokeColor = 'black';
			circles[i].fillColor = options2[i].color;
			circles[i].scale(data[50 * (i + 1)] / 80);
		}
	}
}

var blobs = [];
function drawBlobs(data) {
	for (var i = 0; i < SHOW_DRAW_COUNT; i++) {
		if (blobs[i]) {
			blobs[i].remove();
		}

	    var radius = options1[i].radius,
	    	points = options1[i].points,
	    	path = createBlob(options1[i].x, options1[i].y, radius, points),
	    	lightness = options1[i].lightness,
	    	hue = options1[i].hue;

	    path.style = {
	        fillColor: new paper.HSLColor(hue, 1, lightness),
	        strokeColor: 'black'
	    };
	
		path.scale(data[50 * (i + 1)] / 80);
		path.rotate(data[50 * (i - 1)]);	// rotate入れるとだいぶ重くなる
		blobs[i] = path;
	};

	function createBlob(x, y, maxRadius, points) {
	    var path = new paper.Path();
	    path.closed = true;
	    for (var i = 0; i < points; i++) {
	        var delta = new paper.Point({
	            length: options1[i].length,
	            angle: (360 / points) * i
	        });
	        path.add(new paper.Point(x + delta.x, y + delta.y));
	    }
	    path.smooth();
	    return path;
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
