var quickHullCanvas;
var quickHullContext;
function initQuickHull() {
	quickHullCanvas = document.getElementById('qh_demo');
	quickHullContext = quickHullCanvas.getContext("2d");
}
function getRandomPoints(numPoint, xMax, yMax) {
	var points = new Array();
	var phase = Math.random() * Math.PI * 2;
	for (var i = 0; i < numPoint/2; i++) {
		var r =  Math.random()*xMax/4;
		var theta = Math.random() * 1.5 * Math.PI + phase;
		points.push( [ xMax /4 + r * Math.cos(theta), yMax/2 + 2 * r * Math.sin(theta) ] )
	}
	var phase = Math.random() * Math.PI * 2;
	for (var i = 0; i < numPoint/2; i++) {
		var r =  Math.random()*xMax/4;
		var theta = Math.random() * 1.5 * Math.PI + phase;
		points.push( [ xMax /4 * 3 +  r * Math.cos(theta), yMax/2 +  r * Math.sin(theta) ] )
	}
	return points
}

function getDistant(cpt, bl) {
	Vy = bl[1][0] - bl[0][0];
	Vx = bl[0][1] - bl[1][1];
	return (Vx * (cpt[0] - bl[0][0]) + Vy * (cpt[1] -bl[0][1]))
}

function findMostDistantPointFromBaseLine(baseLine, points) {
	var maxD = 0;
	var maxPt = new Array();
	var newPoints = new Array();
	for (var idx in points) {
		var pt = points[idx];
		var d = getDistant(pt, baseLine);

		if ( d > 0) {
			newPoints.push(pt);
		} else {
			continue;
		}

		if ( d > maxD ) {
			maxD = d;
			maxPt = pt;
		}

	}
	return {'maxPoint':maxPt, 'newPoints':newPoints}
}

var allBaseLines = new Array();
function buildConvexHull(baseLine, points) {

	//plotBaseLine(baseLine,'rgb(180,180,180)');
	allBaseLines.push(baseLine)
	var convexHullBaseLines = new Array();
	var t = findMostDistantPointFromBaseLine(baseLine, points);
	if (t.maxPoint.length) {
		convexHullBaseLines = convexHullBaseLines.concat( buildConvexHull( [baseLine[0],t.maxPoint], t.newPoints) );
		convexHullBaseLines = convexHullBaseLines.concat( buildConvexHull( [t.maxPoint,baseLine[1]], t.newPoints) );
		return convexHullBaseLines;
	} else {
		return [baseLine];
	}
}

function getConvexHull(points) {
	//find first baseline
	var maxX, minX;
	var maxPt, minPt;
	for (var idx in points) {
		var pt = points[idx];
		if (pt[0] > maxX || !maxX) {
			maxPt = pt;
			maxX = pt[0];
		}
		if (pt[0] < minX || !minX) {
			minPt = pt;
			minX = pt[0];
		}
	}
	var ch = [].concat(buildConvexHull([minPt, maxPt], points),
		buildConvexHull([maxPt, minPt], points))
	return ch;
}

function plotBaseLine(baseLine,color) {
	var pt1 = baseLine[0]
	var pt2 = baseLine[1];
	quickHullContext.save()
	quickHullContext.strokeStyle = color;
	quickHullContext.beginPath();
	quickHullContext.moveTo(pt1[0],pt1[1]);
	quickHullContext.lineTo(pt2[0],pt2[1]);
	quickHullContext.stroke();
	quickHullContext.restore();
}

var pts;

function qhPlotPoints() {
	quickHullContext.clearRect(0,0,200,200);
	quickHullContext.fillStyle = 'rgb(0,0,0)';
	pts = getRandomPoints(250,200,200);
	for (var idx in pts) {
		var pt = pts[idx];
		quickHullContext.fillRect(pt[0],pt[1],2,2);
	}
}

function qhPlotConvexHull() {
	var ch = getConvexHull(pts);
	var eBL = allBaseLines[0];
	function plotIntermediateBL() {
		var l = allBaseLines.shift();
		if (l) {
			plotBaseLine(l, 'rgb(180,180,180)');
			setTimeout(plotIntermediateBL, 250);
		} else {
			for (var idx in ch) {
				var baseLine = ch[idx];
				plotBaseLine(baseLine, 'rgb(255,0,0)');
			}
			plotBaseLine(eBL,'rgb(0,255,0)');
		}
	}
	plotIntermediateBL();
}