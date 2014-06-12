var PTM = 40;
var world = null;
var canvas;
var context;
var run = true;
var canvasOffset = { x: 0, y: 0 };
var viewCenterPixel = { x: 0, y: 0 };
var viewCenterWorld;

var lastDrawnBun = null;
var lastDrawOtherPaths = [];
var lastDrawWorldBounds = null;
var lastDrawBridge = null;

var backgroundCanvas = null;
var backgroundCanvasContext = null;
var backgroundImage = null;

function initScene() {
	initKeyboardKeys();
	initForcesVectors();
	initBunVariables();
}

function getWorldPointFromPixelPoint(pixelPoint) {
    return {
        x: (pixelPoint.x - canvasOffset.x) / PTM,
        y: (canvasOffset.y - pixelPoint.y) / PTM
    };
}

function getPixelPointFromWorldPoint(worldPoint) {
    return {
        x: worldPoint.get_x() * PTM + canvasOffset.x,
        y: canvasOffset.y - worldPoint.get_y() * PTM
    }
}

function getPixelPointFromWorldDot(worldPoint) {
	return {
		x: worldPoint.x * PTM + canvasOffset.x,
		y: canvasOffset.y - worldPoint.y * PTM
	}
}

function setViewCenterWorld(b2VecPos) {
    var currentViewCenterWorld = getWorldPointFromPixelPoint( viewCenterPixel );
    var toMoveX = b2VecPos.get_x() - currentViewCenterWorld.x;
    var toMoveY = b2VecPos.get_y() - currentViewCenterWorld.y;
    canvasOffset.x -= Math.round(toMoveX * PTM);
    canvasOffset.y += Math.round(toMoveY * PTM);
}

function createWorld() {
    if ( world != null ) {
        Box2D.destroy(world);
    }
    var centerWorldYOffset = canvas.height / PTM / 2; //middle
    centerWorldYOffset /= 2;
	viewCenterWorld = new b2Vec2(0, centerWorldYOffset);
    world = new b2World( new b2Vec2(0.0, -10.0) );

    var myDebugDraw = getCanvasDebugDraw();
    myDebugDraw.SetFlags(e_shapeBit | e_jointBit);
    world.SetDebugDraw(myDebugDraw);

	createWorldBounds(10000, 1500);

    return world;
}

function debugDraw() {
    context.fillStyle = 'rgb(0,0,0)';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.save();
    context.translate(canvasOffset.x, canvasOffset.y);
    context.scale(1,-1);
    context.scale(PTM,PTM);
    context.lineWidth /= PTM;
    drawAxes(context);
    context.fillStyle = 'rgb(255,255,0)';
    world.DrawDebugData();
    drawMouseJoint();
    context.restore();
}

window.requestAnimFrame = (function(){
    return  window.requestAnimationFrame       ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame    ||
        window.oRequestAnimationFrame      ||
        window.msRequestAnimationFrame     ||
        function( callback ){
            window.setTimeout(callback, 1000 / 60);
        };
})();

function step() {
    world.Step(1/60, 3, 2);
    var bunCenter = bun.getBunCenter();
    applyForces(bun.verticesList, bunCenter);
	var newXViewCenter = 600 / PTM;
	var newYViewCenter = 1600 / PTM;
    if (bunCenter != null) {
        newXViewCenter = bunCenter.get_x();
	    newYViewCenter = bunCenter.get_y() + 140 / PTM;
    }
	viewCenterWorld.set_x(newXViewCenter);
	viewCenterWorld.set_y(newYViewCenter);
	setViewCenterWorld(viewCenterWorld);
    //debugDraw();
	drawWorldBackground();
	drawWorldBounds();
	//drawBridge();
	drawBun();
	drawBunContent();
}

function animate() {
    if ( run )
        requestAnimFrame( animate );
    step();
}

function drawBun() {
    if (bun.bunCenter == null) {
        return;
    }

    if (lastDrawnBun != null) {
        lastDrawnBun.remove();
    }

    var path = new Path({
        strokeColor: '#E4141B',
        strokeWidth: 7,
        closed: true
    });
    bun.verticesList.forEach(function(vertex) {
        var vertexCenter = vertex.GetWorldCenter();
        var p = getPixelPointFromWorldPoint(vertexCenter);
        path.add(p);
    });
    path.smooth();
    lastDrawnBun = path;
    paper.view.update();
}

function drawWorldBounds() {
	if (lastDrawWorldBounds != null) {
		lastDrawWorldBounds.remove();
	}

	lastDrawWorldBounds = new Path({
		strokeColor: '#A63800',
		fillColor: 'white',
		//strokeColor: 'green',
		//fillColor: '#A63800',
		strokeJoin: 'round',
		strokeCap: 'round',
		strokeWidth: 10
	});
	ground.forEach(function(vertex) {
		var p = getPixelPointFromWorldDot(vertex);
		lastDrawWorldBounds.add(p);
	});
	//lastDrawWorldBounds.smooth();
	paper.view.update();
}

function drawWorldBounds1() {
	if (lastDrawWorldBounds != null) {
		lastDrawWorldBounds.remove();
	}

	lastDrawWorldBounds = new Path({
		strokeColor: 'green',
		strokeWidth: 10,
		closed: true
	});
	contour.forEach(function(vertex) {
		var p = getPixelPointFromWorldDot(vertex);
		lastDrawWorldBounds.add(p);
	});
	//lastDrawWorldBounds.smooth();
	paper.view.update();
}

function loadBackground(src) {
    backgroundImage = new Image();
    backgroundImage.src = src;
}

/**
 * @return {boolean}
 */
function imageLoaded(img) {
    // During the onload event, IE correctly identifies any images that
    // weren’t downloaded as not complete. Others should too. Gecko-based
    // browsers act like NS4 in that they report this incorrectly.
    if (!img.complete) {
        return false;
    }
    // However, they do have two very useful properties: naturalWidth and
    // naturalHeight. These give the true size of the image. If it failed
    // to load, either of these should be zero.
    if (typeof img.naturalWidth !== "undefined" && img.naturalWidth === 0) {
        return false;
    }
    // No other way of checking: assume it’s ok.
    return true;
}

function drawWorldBackground() {
    if (imageLoaded(backgroundImage)) {
        backgroundCanvas.width = backgroundCanvas.width;

        var clipX = backgroundCanvas.width / 2 - canvasOffset.x * backgroundImage.naturalHeight / backgroundCanvas.height;
        var lShift = 0;
        if (clipX < 0) {
            lShift = -clipX;
            clipX = 0;
        }
        var clipY = 0;
        var clipW = (backgroundCanvas.width - lShift) * backgroundImage.naturalHeight / backgroundCanvas.height;
        var clipH = backgroundImage.naturalHeight;
        backgroundCanvasContext.drawImage(
            backgroundImage,
            clipX, clipY,
            clipW, clipH,
            lShift, 0, backgroundCanvas.width - lShift, backgroundCanvas.height
        );
    }
}

function drawBunContent() {
	if (bun.bunCenter == null) {
		return;
	}
	for(var i = 0; i < bun.otherPathsData.length; i++) {
		if (lastDrawOtherPaths[i] != null) {
			//lastDrawOtherPaths[i].forEach( function (circle) {
			//	circle.remove();
			//});
			lastDrawOtherPaths[i].remove();
		}
		lastDrawOtherPaths[i] = new Path({
			strokeColor: 'red',
			strokeCap: 'round',
			strokeWidth: 5
		});
		var bunOtherPathsData = bun.otherPathsData[i].length;
		for (var j = 0; j < bunOtherPathsData; j++) {
			var resultPoint = { x: 0, y: 0 };
			var l = bun.otherPathsData[i][j].length;
			for (var k = 0; k < l; k++) {
				var newPointPosition = calculateNewPointPosition(bun.verticesList[k], bun.verticesBaseOffsets[k],
					bun.otherPathsData[i][j][k].offset, bun.otherPathsData[i][j][k].angle);
				resultPoint.x += newPointPosition.x;
				resultPoint.y += newPointPosition.y;
			}
			resultPoint.x /= l;
			resultPoint.y /= l;

			//var circle = new Path.Circle(getPixelPointFromWorldDot(resultPoint), 5);
			//circle.fillColor = 'blue';
			//lastDrawOtherPaths[i].push(circle);
			lastDrawOtherPaths[i].add(getPixelPointFromWorldDot(resultPoint));
		}
		lastDrawOtherPaths[i].smooth();
//		bun.otherPathsData[i].forEach(function (pointData) {
//			var resultPosition = {x: 0.0, y: 0.0};
//			for(var k = 0; k < pointData.length; k++) {
//				 var newPointPosition = calculateNewPointPosition(bun.verticesList[k], bun.verticesBaseOffsets[k],
//				 pointData[k].offset, pointData[k].angle);
//				 resultPosition.x += newPointPosition.x;
//				 resultPosition.y += newPointPosition.y;
//			 }
//			 resultPosition.x /= pointData.length;
//			 resultPosition.y /= pointData.length;
//			/*var newPointPosition = calculateNewPointPosition(bun.verticesList[0], bun.verticesBaseOffsets[0],
//				pointData[0].offset, pointData[0].angle);
//			resultPosition.x += newPointPosition.x;
//			resultPosition.y += newPointPosition.y;*/
//
//			//lastDrawOtherPaths[i].add(getPixelPointFromWorldDot(resultPosition));
//			var circle = new Path.Circle(getPixelPointFromWorldDot(resultPosition), 5);
//			circle.fillColor = 'blue';
//			lastDrawOtherPaths[i].push(circle);
//		});
		//lastDrawOtherPaths[i].smooth();
	}
	paper.view.update();
}

function drawBunContent3() {
	if (bun.bunCenter == null) {
		return;
	}
	for(var i = 0; i < bun.otherPathsData.length; i++) {
		if (lastDrawOtherPaths[i] != null) {
			lastDrawOtherPaths[i].forEach( function (circle) {
				circle.remove();
			});
			//lastDrawOtherPaths[i].remove();
		}
		lastDrawOtherPaths[i] = [];
		bun.otherPathsData[i].forEach(function (pointData) {
			var resultPosition = {x: 0.0, y: 0.0};
			/*for(var j = 0; j < pointData.length; j++) {
				var newPointPosition = calculateNewPointPosition(bun.verticesList[j], bun.verticesBaseOffsets[j],
					pointData[j].offset, pointData[j].angle);
				resultPosition.x += newPointPosition.x;
				resultPosition.y += newPointPosition.y;
			}
			resultPosition.x /= pointData.length;
			resultPosition.y /= pointData.length;*/
				var newPointPosition = calculateNewPointPosition(bun.verticesList[0], bun.verticesBaseOffsets[0],
					pointData[0].offset, pointData[0].angle);
				resultPosition.x += newPointPosition.x;
				resultPosition.y += newPointPosition.y;

			//lastDrawOtherPaths[i].add(getPixelPointFromWorldDot(resultPosition));
			var circle = new Path.Circle(getPixelPointFromWorldDot(resultPosition), 5);
			circle.fillColor = 'blue';
			lastDrawOtherPaths[i].push(circle);
		});
		//lastDrawOtherPaths[i].smooth();
	}
	paper.view.update();
}

function calculateNewPointPosition(vertex, baseVertexDistance, basePointDistance, basePointAngle) {
	var bunCenter = bun.getBunCenter();
	var newDistance = Math.sqrt(Math.pow(vertex.GetWorldCenter().get_x() - bunCenter.get_x(), 2) +
		Math.pow(vertex.GetWorldCenter().get_y() - bunCenter.get_y(), 2));
	var angle = angleBetweenWithSign({x: vertex.GetWorldCenter().get_x(), y: vertex.GetWorldCenter().get_y()},
		{x: bunCenter.get_x(), y: bunCenter.get_y()}) + basePointAngle;
	if(angle >= 2 * Math.PI) {
		angle -= Math.PI * 2;
	}
	var newPointPosition = {
		x: vertex.GetWorldCenter().get_x() - (vertex.GetWorldCenter().get_y() - bunCenter.get_y())/Math.tan(angle),
		y: bunCenter.get_y()
	};
	newPointPosition.x -= vertex.GetWorldCenter().get_x();
	newPointPosition.y -= vertex.GetWorldCenter().get_y();
	if( (vertex.GetWorldCenter().get_y() < bunCenter.get_y() &&
			angle < Math.PI) ||
		(vertex.GetWorldCenter().get_y() > bunCenter.get_y() &&
			angle > Math.PI)) {
		newPointPosition.x *= -1;
		newPointPosition.y *= -1;
	}
	var factor = basePointDistance * newDistance / baseVertexDistance /
		Math.sqrt(Math.pow(newPointPosition.x, 2) + Math.pow(newPointPosition.y, 2));
	newPointPosition.x *= factor;
	newPointPosition.y *= factor;
	newPointPosition.x += vertex.GetWorldCenter().get_x();
	newPointPosition.y += vertex.GetWorldCenter().get_y();
	return newPointPosition;
}

function drawBunContent2() {

	var bunCenter = {x: 3, y: 4};
	var oldVertex = {x: 1, y: 6};
	var vertex = {x: 5, y: 6};
	var point = {x: 3, y: 5};
	var basePointDistance = Math.sqrt(5);
	var baseVertexDistance = Math.sqrt(8);
	var basePointAngle = angleBetweenWithSign(point, oldVertex, bunCenter);
	var newDistance = Math.sqrt(Math.pow(vertex.x - bunCenter.x, 2) +
		Math.pow(vertex.y - bunCenter.y, 2));
	var angle = angleBetweenWithSign({x: vertex.x, y: vertex.y}, {x: bunCenter.x, y: bunCenter.y}) + basePointAngle;
	var newPointPosition = {
		x: vertex.x - (vertex.y - bunCenter.y)/Math.tan(angle),
		y: bunCenter.y
	};
	newPointPosition.x -= vertex.x;
	newPointPosition.y -= vertex.y;
	var factor = basePointDistance * newDistance / baseVertexDistance /
		Math.sqrt(Math.pow(newPointPosition.x, 2) + Math.pow(newPointPosition.y, 2));
	newPointPosition.x *= factor;
	newPointPosition.y *= factor;
	newPointPosition.x += vertex.x;
	newPointPosition.y += vertex.y;

	oldVertex = {x: 5, y: 6};
	vertex = {x: 5, y: 2};
	basePointDistance = Math.sqrt(5);
	baseVertexDistance = Math.sqrt(8);
	basePointAngle = angleBetweenWithSign(point, oldVertex, bunCenter);
	newDistance = Math.sqrt(Math.pow(vertex.x - bunCenter.x, 2) +
		Math.pow(vertex.y - bunCenter.y, 2));
	angle = angleBetweenWithSign({x: vertex.x, y: vertex.y}, {x: bunCenter.x, y: bunCenter.y}) + basePointAngle;
	newPointPosition = {
		x: vertex.x - (vertex.y - bunCenter.y)/Math.tan(angle),
		y: bunCenter.y
	};
	newPointPosition.x -= vertex.x;
	newPointPosition.y -= vertex.y;
	factor = basePointDistance * newDistance / baseVertexDistance /
		Math.sqrt(Math.pow(newPointPosition.x, 2) + Math.pow(newPointPosition.y, 2));
	newPointPosition.x *= factor;
	newPointPosition.y *= factor;
	newPointPosition.x += vertex.x;
	newPointPosition.y += vertex.y;

	oldVertex = {x: 5, y: 2};
	vertex = {x: 1, y: 2};
	basePointDistance = Math.sqrt(13);
	baseVertexDistance = Math.sqrt(8);
	basePointAngle = angleBetweenWithSign(point, oldVertex, bunCenter);
	newDistance = Math.sqrt(Math.pow(vertex.x - bunCenter.x, 2) +
		Math.pow(vertex.y - bunCenter.y, 2));
	angle = angleBetweenWithSign({x: vertex.x, y: vertex.y}, {x: bunCenter.x, y: bunCenter.y}) + basePointAngle;
	newPointPosition = {
		x: vertex.x - (vertex.y - bunCenter.y)/Math.tan(angle),
		y: bunCenter.y
	};
	newPointPosition.x -= vertex.x;
	newPointPosition.y -= vertex.y;
	factor = basePointDistance * newDistance / baseVertexDistance /
		Math.sqrt(Math.pow(newPointPosition.x, 2) + Math.pow(newPointPosition.y, 2));
	newPointPosition.x *= factor;
	newPointPosition.y *= factor;
	newPointPosition.x += vertex.x;
	newPointPosition.y += vertex.y;

	oldVertex = {x: 1, y: 2};
	vertex = {x: 1, y: 6};
	basePointDistance = Math.sqrt(13);
	baseVertexDistance = Math.sqrt(8);
	basePointAngle = angleBetweenWithSign(point, oldVertex, bunCenter);
	newDistance = Math.sqrt(Math.pow(vertex.x - bunCenter.x, 2) +
		Math.pow(vertex.y - bunCenter.y, 2));
	angle = angleBetweenWithSign({x: vertex.x, y: vertex.y}, {x: bunCenter.x, y: bunCenter.y}) + basePointAngle;
	newPointPosition = {
		x: vertex.x - (vertex.y - bunCenter.y)/Math.tan(angle),
		y: bunCenter.y
	};
	newPointPosition.x -= vertex.x;
	newPointPosition.y -= vertex.y;
	factor = basePointDistance * newDistance / baseVertexDistance /
		Math.sqrt(Math.pow(newPointPosition.x, 2) + Math.pow(newPointPosition.y, 2));
	newPointPosition.x *= factor;
	newPointPosition.y *= factor;
	newPointPosition.x += vertex.x;
	newPointPosition.y += vertex.y;
	//alert(newPointPosition.x+' '+newPointPosition.y);
	return newPointPosition;
}

function drawBunContent1() {

	var bunCenter = {x: -0.07, y: 2.64};
	var vertex = {x: -3.24, y: 2.75};
	var basePointDistance = 3.27;
	var baseVertexDistance = 3.117;
	var basePointAngle = 0.56;
	var newDistance = Math.sqrt(Math.pow(vertex.x - bunCenter.x, 2) +
		Math.pow(vertex.y - bunCenter.y, 2));
	var angle = angleBetweenWithSign({x: vertex.x, y: vertex.y}, {x: bunCenter.x, y: bunCenter.y}) + basePointAngle;
	var newPointPosition = {
		x: vertex.x - (vertex.y - bunCenter.y)/Math.tan(angle),
		y: bunCenter.y
	};
	newPointPosition.x -= vertex.x;
	newPointPosition.y -= vertex.y;
	if((vertex.x - bunCenter.x) * (bunCenter.y - vertex.y) > 0) {
		newPointPosition.x *= -1;
		newPointPosition.y *= -1;
	}
	var factor = basePointDistance * newDistance / baseVertexDistance /
		Math.sqrt(Math.pow(newPointPosition.x, 2) + Math.pow(newPointPosition.y, 2));
	newPointPosition.x *= factor;
	newPointPosition.y *= factor;
	newPointPosition.x += vertex.x;
	newPointPosition.y += vertex.y;

	bunCenter = {x: -0.5, y: 2.6};
	vertex = {x: -3.62, y: 2.32};
	newDistance = Math.sqrt(Math.pow(vertex.x - bunCenter.x, 2) +
		Math.pow(vertex.y - bunCenter.y, 2));
	angle = angleBetweenWithSign({x: vertex.x, y: vertex.y}, {x: bunCenter.x, y: bunCenter.y}) + basePointAngle;
	newPointPosition = {
		x: vertex.x - (vertex.y - bunCenter.y)/Math.tan(angle),
		y: bunCenter.y
	};
	newPointPosition.x -= vertex.x;
	newPointPosition.y -= vertex.y;
	if((vertex.x - bunCenter.x) * (bunCenter.y - vertex.y) > 0) {
		newPointPosition.x *= -1;
		newPointPosition.y *= -1;
	}
	factor = basePointDistance * newDistance / baseVertexDistance /
		Math.sqrt(Math.pow(newPointPosition.x, 2) + Math.pow(newPointPosition.y, 2));
	newPointPosition.x *= factor;
	newPointPosition.y *= factor;
	newPointPosition.x += vertex.x;
	newPointPosition.y += vertex.y;

	//alert(newPointPosition.x+' '+newPointPosition.y);
	return newPointPosition;
}

function drawBridge() {
	if (lastDrawBridge != null) {
		lastDrawBridge.remove();
	}
	if(!bridgeCreated) {
		return;
	}

	lastDrawBridge = new Path({
		strokeColor: 'green',
		strokeWidth: 10
	});
	bridgeVertices.forEach(function(vertex) {
		var p = getPixelPointFromWorldDot({x:vertex.x, y:vertex.y + 0.2});
		lastDrawBridge.add(p);
	});
	//lastDrawBridge.smooth();
	paper.view.update();
}