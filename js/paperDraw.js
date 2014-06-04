/**
 * Created by Nikita on 29.05.2014.
 */

var paths = [];
var paperCanvas;

function paperInit() {
	paper.install(window);
	var buttonsDiv = document.getElementById("buttons");
	paper.setup('paperCanvas');
	paperCanvas = document.getElementById("paperCanvas");
	paperCanvas.width  = window.innerWidth / 2;
	paperCanvas.height = window.innerHeight - buttonsDiv.offsetHeight;
	paths = [];
	var tool = new paper.Tool();
	tool.onMouseDown = function(event) {
		if (paths[paths.length-1]) {
			paths[paths.length-1].selected = false;
		}
		var path = new Path({
			strokeColor : 'black',
			strokeWidth: 1,
			fullySelected : true
		});
		path.add(event.point);
		paths.push(path);
	};

	tool.onMouseDrag = function(event) {
		var path = paths[paths.length-1];
		path.add(event.point);
	};

	tool.onMouseUp = function(event) {
		var path = paths[paths.length-1];
		if (path.segments.length == 1) {
			path.add(new Point(path.firstSegment.point.x+1, path.firstSegment.point.y));
		}
		path.selected = false;
		take_point();
	};
}

function take_point() {
	var lastPath = paths[paths.length-1];
	var lastPathRaster = lastPath.rasterize();
	var lastPathCanvas = lastPathRaster.canvas;
	var sparse_border = get_support_points(lastPathCanvas);
	var tensionScroll = document.getElementById("tension");
	var curve = get_bezier_points(sparse_border, tensionScroll != null ? tensionScroll.value : 0.9, 0.1);
	draw_bezier_points(paperCanvas, curve, 'blue');

	var imgData = lastPathCanvas.getContext('2d').getImageData(0, 0, lastPathCanvas.width,lastPathCanvas.height);
	document.getElementById('canvas').getContext('2d').putImageData(imgData, lastPathRaster.bounds.x, lastPathRaster.bounds.y);

	var tmpPath = new Path({
		strokeWidth: 1,
		fullySelected : false,
		visible : false
	});
	for (var i = 0; i < curve.length; i++) {
		var point = new Point(curve[i][0], curve[i][1]);
		tmpPath.add(point);
	}
	tmpPath.smooth();
	tmpPath.remove();

	lastPath.remove();
	paper.project.clear();

	var points = [];
	var step = tmpPath.length / 20;
	for (var offset = 0; offset < tmpPath.length; offset += step) {
		var point = tmpPath.getPointAt(offset);
		point.x += lastPathRaster.bounds.x;
		point.y += lastPathRaster.bounds.y;
		points.push(point);
	}
	var createBunPoints = [];
	points.forEach(function outputItem(item, i, arr) {
		// showPt(item.x, item.y, 'red', getId('canvas'));
		createBunPoints.push(getInvertWorldPointFromPixelPoint(item));
	});
	bun.buildBun(world, createBunPoints);
}