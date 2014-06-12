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
            dashArray: [5, 10],
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
function toSmallCanvas(paths) {
    var minX = 100000;
    var maxX = 0;
    var minY = 100000;
    var maxY = 0;

    var widths = [];
    paths.forEach(function(path) {
        widths.push(path.strokeWidth);
        path.strokeWidth = 30;
    });
    paper.view.update();

    paths.forEach(function(path) {
        var bounds = path.strokeBounds;
        if (minX > bounds.x) {
            minX = bounds.x;
        }
        if (maxX < bounds.x + bounds.width) {
            maxX = bounds.x + bounds.width;
        }
        if (minY > bounds.y) {
            minY = bounds.y;
        }
        if (maxY < bounds.y + bounds.height) {
            maxY = bounds.y + bounds.height;
        }
    });
    var bBoxWidth = maxX - minX;
    var bBoxHeight = maxY - minY;
    var smallCanvas = document.getElementById("smallCanvas");
    var smallContext = smallCanvas.getContext("2d");
    var w = smallCanvas.width;
    var h = smallCanvas.height;
    var bBoxRatio = bBoxWidth / bBoxHeight;
    var smallCanvasRatio = w / h;
    var smallCanvasStartX = w * 0.1;
    var smallCanvasStartY = h * 0.1;
    var smallCanvasWidth = w * 0.8;
    var smallCanvasHeight = h * 0.8;
    if (bBoxRatio < 1) {
        smallCanvasStartX += (1 - bBoxRatio) / 2 * w;
        smallCanvasWidth /= smallCanvasRatio / bBoxRatio;
    } else {
        smallCanvasStartY += (bBoxRatio - 1) / 2 * h / bBoxRatio;
        smallCanvasHeight *= smallCanvasRatio / bBoxRatio;
    }
    smallCanvas.width = w;
    smallContext.drawImage(paperCanvas, minX, minY, bBoxWidth, bBoxHeight,
        smallCanvasStartX, smallCanvasStartY, smallCanvasWidth, smallCanvasHeight);
    paths.forEach(function (path, index) {
        path.strokeWidth = widths[index];
    });
    widths = null;
}

function canvasToAlphaArray(canvas) {
    var ctx = canvas.getContext("2d");
    var h = canvas.height;
    var w = canvas.width;

    var imgData = ctx.getImageData(0, 0, w, h);
    var data = imgData.data;

    var canvas_array = [];
    for(var i = 0; i < h; i++) {
        for(var j = 0; j < w; j++) {
            canvas_array.push(data[4 * i * w + 4 * j + 3]);
        }
    }
    return canvas_array;
}

function classifyA(canvas, net_id) {
    /*
     var canvas = document.getElementById(canvas_id);
     var img28 = get_small_image2(canvas_id,0,0,canvas.width,canvas.height);
     */
    var img28 = canvasToAlphaArray(canvas);
    var img_fit = fit_image(img28);
    x = convnetjs.augment(img_fit, 24);
    net_id.forward(x);
    var ans = net_id.getPrediction();
    return ans;
}

function windHack(paths) {
    var lToR = 0;
    var rToL = 0;

    paths.forEach(function (path) {
        var segLength = path.length;
        if (path.getPointAt(0).x < path.getPointAt(segLength).x) {
            lToR += segLength;
        } else {
            rToL += segLength;
        }
    });

    if (lToR > rToL && forcesDirection != 1) {
        directForces(1);
        resetForcesValue();
    }
    else if(lToR <= rToL && forcesDirection != -1){
        directForces(-1);
	    resetForcesValue();
    }
	strengthenForces();
}

function process() {
    var currentPaths = paths;
    paths = null;

    /*toSmallCanvas(currentPaths);

    var smallCanvas = document.getElementById("smallCanvas");
    var ans = classifyA(smallCanvas, net1);
    var sAns = class_list1[ans - 1];
    document.getElementById("message").innerText = sAns;*/


    if (bun.bunCenter == null) {
        var bunContourIndex;
        var bunContourMaxLength = -1;
        for (var i = 0; i < currentPaths.length; i++) {
            var l = currentPaths[i].length;
            if (l > bunContourMaxLength) {
                bunContourMaxLength = l;
                bunContourIndex = i;
            }
        }
	    var bunContour = currentPaths[bunContourIndex];
	    var otherPaths = [];
	    for (var i = 0; i < currentPaths.length; i++) {
		    if(i != bunContourIndex) {
			    currentPaths[i].flatten(15);
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
		if(!bunContourPoints.length) {
			alert("Невозможно построить колобка!");
			return;
		}
        var firstPoint = bunContourPoints[0];
        var lastPoint = bunContourPoints[bunContourPoints.length - 1];
	    if (Math.abs(firstPoint.x - lastPoint.x) < EPSILON && Math.abs(firstPoint.y - lastPoint.y) < EPSILON) {
            bunContourPoints.pop();
        }

        bun.buildBun(world, bunContourPoints, otherContours);
    } else if (currentPaths.length == 4) {
        //emulate wind
        windHack(currentPaths);
    }

    for (var i = 0; i < currentPaths.length; i++) {
        var r = currentPaths[i].remove();
        var a = 0;
    }
    paper.view.update();
}

function takeBunPoints(contour) {
	contour.flatten(10);
	var points = [];
	contour.segments.forEach(function (segment) {
		points.push([segment.point.x, segment.point.y]);
	});
	var curve = edge_to_seq(getConvexHull(points));

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
		points.push(point);
	}
	var createBunPoints = [];
	points.forEach(function (item) {
		createBunPoints.push(getWorldPointFromPixelPoint(item));
	});

    return createBunPoints;
}

function takeBunPoints1(contour) {
	var contourRaster = contour.rasterize();
	var contourCanvas = contourRaster.canvas;
	var sparse_border = get_support_points(contourCanvas);
	var curve = get_bezier_points(sparse_border, 0.9, 0.1);

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