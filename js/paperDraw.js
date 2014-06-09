var paths = null;
var paperCanvas;
var EPSILON = 0.00001;

var lastTimeout = null;

function paperInit() {
    paperCanvas = document.getElementById("paperCanvas");
    paperCanvas.width  = window.innerWidth/* / 2*/;
    paperCanvas.height = window.innerHeight/* - buttonsDiv.offsetHeight*/;

    paper.install(window);
	paper.setup('paperCanvas');
    var tool = new paper.Tool();

    var mouseDown = function(event) {
        if (lastTimeout != null){
            window.clearTimeout(lastTimeout);
            lastTimeout = null;
        }

        var path = new Path({
            strokeColor : '#E4141B',
            strokeWidth: 7,
            strokeCap: 'round',
            fullySelected : false
        });
        path.add(event.point);
        if (paths == null) {
            paths = [];
        }
        paths.push(path);
    };
	tool.onMouseDown = mouseDown;

    var mouseDrag = function(event) {
        var path = paths[paths.length-1];
        path.add(event.point);
    };
	tool.onMouseDrag = mouseDrag;

    var mouseUp = function(event) {
        var path = paths[paths.length-1];
        if (path.segments.length == 1) {
            path.add(new Point(path.firstSegment.point.x+1, path.firstSegment.point.y));
        }
        path.simplify(100);

        lastTimeout = window.setTimeout(process, 1000);
    };
	tool.onMouseUp = mouseUp;
}

function process() {
    var currentPaths = paths;
    paths = null;

    if (bun.bunCenter == null) {
        var bunContourIndex;
        var bunContourMaxLength = -1;
        for (var i = 0; i < currentPaths.length; i++) {
            var l = currentPaths[i].segments.length;
            if (l > bunContourMaxLength) {
                bunContourMaxLength = l;
                bunContourIndex = i;
            }
        }
	    var bunContour = currentPaths[bunContourIndex];
	    var otherPaths = [];
	    for (var i = 0; i < currentPaths.length; i++) {
		    if(i != bunContourIndex) {
			    currentPaths[i].flatten(20);
			    otherPaths.push(currentPaths[i].segments);
		    }
	    }
	    var otherContours = [];
	    otherPaths.forEach(function (path) {
			var points = [];
		    path.forEach(function (segment) {
			    points.push(getWorldPointFromPixelPoint({ x:segment.point.x, y:segment.point.y}));
		    });
		    otherContours.push(points);
		});

        var bunContourPoints = takeBunPoints(bunContour);

        var firstPoint = bunContourPoints[0];
        var lastPoint = bunContourPoints[bunContourPoints.length - 1];
	    if (Math.abs(firstPoint.x - lastPoint.x) < EPSILON && Math.abs(firstPoint.y - lastPoint.y) < EPSILON) {
            bunContourPoints.pop();
        }

        bun.buildBun(world, bunContourPoints, otherContours);
    }

    for (var i = 0; i < currentPaths.length; i++) {
//        currentPaths[i].visible = false;
        var r = currentPaths[i].remove();
        var a = 0;
    }
    paper.view.update();
}

function takeBunPoints(contour) {
	var contourRaster = contour.rasterize();
	var contourCanvas = contourRaster.canvas;
	var sparse_border = get_support_points(contourCanvas);
    var tensionScroll = document.getElementById("tension");
	var curve = get_bezier_points(sparse_border, tensionScroll != null ? tensionScroll.value : 0.9, 0.1);

	var tmpPath = new Path({
		strokeWidth: 1,
		fullySelected : false,
		visible : true
	});
	for (var i = 0; i < curve.length; i++) {
		var p = new Point(curve[i][0], curve[i][1]);
		tmpPath.add(p);
	}

	var points = [];
	var step = tmpPath.length / 17;
	for (var offset = 0; offset < tmpPath.length; offset += step) {
		var point = tmpPath.getPointAt(offset);
		point.x += contourRaster.bounds.x;
		point.y += contourRaster.bounds.y;
		points.push(point);
	}
    contourRaster.remove();
	var createBunPoints = [];
	points.forEach(function (item) {
		createBunPoints.push(getWorldPointFromPixelPoint(item));
	});

    return createBunPoints;
}