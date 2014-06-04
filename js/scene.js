var PTM = 18;
var world = null;
var mouseJointGroundBody;
var canvas;
var context;
var myDebugDraw;
var myQueryCallback;
var mouseJoint = null;
var run = true;
var mouseDown = false;
var shiftDown = false;
var mousePosPixel = { x: 0, y: 0 };
var prevMousePosPixel = { x: 0, y: 0 };
var mousePosWorld = { x: 0, y: 0 };
var canvasOffset = { x: 0, y: 0 };
var viewCenterPixel = { x: 320, y: 240 };
var viewCenterWorld;

function myRound(val, places) {
    var c = 1;
    for (var i = 0; i < places; i++)
        c *= 10;
    return Math.round(val*c)/c;
}

function getWorldPointFromPixelPoint(pixelPoint) {
	return {
		x: (pixelPoint.x - canvasOffset.x)/PTM,
		y: (pixelPoint.y - (canvas.height - canvasOffset.y))/PTM
	};
}

function getInvertWorldPointFromPixelPoint(pixelPoint) {
	return {
		x: (pixelPoint.x - canvasOffset.x)/PTM,
		y: -(pixelPoint.y - (canvas.height - canvasOffset.y))/PTM
	};
}

function updateMousePos(evt) {
    var rect = canvas.getBoundingClientRect();
    mousePosPixel = {
        x: evt.clientX - rect.left,
        y: canvas.height - (evt.clientY - rect.top)
    };
    mousePosWorld = getWorldPointFromPixelPoint(mousePosPixel);
}

function setViewCenterWorld(b2VecPos, instantaneous) {
    var currentViewCenterWorld = getWorldPointFromPixelPoint( viewCenterPixel );
    var toMoveX = b2VecPos.get_x() - currentViewCenterWorld.x;
    var toMoveY = b2VecPos.get_y() - currentViewCenterWorld.y;
    var fraction = instantaneous ? 1 : 0.25;
    canvasOffset.x -= myRound(fraction * toMoveX * PTM, 0);
    canvasOffset.y += myRound(fraction * toMoveY * PTM, 0);
}

function onMouseMove(evt) {
    prevMousePosPixel = mousePosPixel;
    updateMousePos(evt);
    if ( shiftDown ) {
        canvasOffset.x += (mousePosPixel.x - prevMousePosPixel.x);
        canvasOffset.y -= (mousePosPixel.y - prevMousePosPixel.y);
        draw();
    }
    else if ( mouseDown && mouseJoint != null ) {
        mouseJoint.SetTarget( new b2Vec2(mousePosWorld.x, mousePosWorld.y) );
    }
}

function startMouseJoint() {

    if ( mouseJoint != null )
        return;

    // Make a small box.
    var aabb = new b2AABB();
    var d = 0.001;
    aabb.set_lowerBound(new b2Vec2(mousePosWorld.x - d, mousePosWorld.y - d));
    aabb.set_upperBound(new b2Vec2(mousePosWorld.x + d, mousePosWorld.y + d));

    // Query the world for overlapping shapes.            
    myQueryCallback.m_fixture = null;
    myQueryCallback.m_point = new b2Vec2(mousePosWorld.x, mousePosWorld.y);
    world.QueryAABB(myQueryCallback, aabb);

    if (myQueryCallback.m_fixture)
    {
        var body = myQueryCallback.m_fixture.GetBody();
        var md = new b2MouseJointDef();
        md.set_bodyA(mouseJointGroundBody);
        md.set_bodyB(body);
        md.set_target( new b2Vec2(mousePosWorld.x, mousePosWorld.y) );
        md.set_maxForce( 1000 * body.GetMass() );
        md.set_collideConnected(true);

        mouseJoint = Box2D.castObject( world.CreateJoint(md), b2MouseJoint );
        body.SetAwake(true);
    }
}

function onMouseDown(evt) {
    updateMousePos(evt);
    if ( !mouseDown )
        startMouseJoint();
    mouseDown = true;
}

function onMouseUp(evt) {
    mouseDown = false;
    updateMousePos(evt);
    if ( mouseJoint != null ) {
        world.DestroyJoint(mouseJoint);
        mouseJoint = null;
    }
}

function onMouseOut(evt) {
    onMouseUp(evt);
}

function init() {

    canvas.addEventListener('mousemove', function(evt) {
        onMouseMove(evt);
    }, false);

	canvas.addEventListener('mousedown', function(evt) {
        onMouseDown(evt);
    }, false);

	canvas.addEventListener('mouseup', function(evt) {
        onMouseUp(evt);
    }, false);

	canvas.addEventListener('mouseout', function(evt) {
        onMouseOut(evt);
    }, false);
	window.addEventListener("keydown", keyPress, false);
	window.addEventListener("keyup", keyRelease, false);
    myDebugDraw = getCanvasDebugDraw();
    myDebugDraw.SetFlags(e_shapeBit | e_jointBit);

    myQueryCallback = new b2QueryCallback();

    Box2D.customizeVTable(myQueryCallback, [{
        original: Box2D.b2QueryCallback.prototype.ReportFixture,
        replacement:
            function(thsPtr, fixturePtr) {
                var ths = Box2D.wrapPointer( thsPtr, b2QueryCallback );
                var fixture = Box2D.wrapPointer( fixturePtr, b2Fixture );
                if ( fixture.GetBody().GetType() != Box2D.b2_dynamicBody ) //mouse cannot drag static bodies around
                    return true;
                if ( ! fixture.TestPoint( ths.m_point ) )
                    return true;
                ths.m_fixture = fixture;
                return false;
            }
    }]);
}

function initHtmlElements() {
	canvas = document.getElementById("canvas");
	var buttonsDiv = document.getElementById("buttons");
	context = canvas.getContext( '2d' );
	canvas.width  = window.innerWidth / 2;
	canvas.height = window.innerHeight - buttonsDiv.offsetHeight;
	//canvasOffset.x = canvas.width;
	canvasOffset.y =  canvas.height/1.2;
	viewCenterPixel.x = canvasOffset.x;
	viewCenterPixel.y = canvasOffset.y;
}

function keyPress(e) {
	if ( e.keyCode == 32 || e.keyCode == 38) {
		if(!bun.isJumping) {
			applyImpulses(bun.verticesList, new b2Vec2(0, 80));
			bun.isJumping = true;
		}
	}

	if ( e.keyCode == 37 ) {
		directForces(-1);
		setForcesValue();
	}

	if ( e.keyCode == 39 ) {
		directForces(1);
		setForcesValue();
	}
	if (e.keyCode == 49) {
		var vertices = [];
		vertices.push(new b2Vec2(160, 0));
		vertices.push(new b2Vec2(170, 4));
		vertices.push(new b2Vec2(185, 4));
		vertices.push(new b2Vec2(195, 0));
		createBridgeByVertices(vertices);
	}
	if (e.keyCode == 50) {
		var vertices = [];
		vertices.push(new b2Vec2(160, 0));
		vertices.push(new b2Vec2(170, -4));
		vertices.push(new b2Vec2(185, -4));
		vertices.push(new b2Vec2(195, 0));
		createBridgeByVertices(vertices);
	}
	if (e.keyCode == 51) {
		var vertices = [];
		vertices.push(new b2Vec2(160, 0));
		vertices.push(new b2Vec2(168, 10));
		vertices.push(new b2Vec2(171, 2));
		vertices.push(new b2Vec2(184, 2));
		vertices.push(new b2Vec2(187, 10));
		vertices.push(new b2Vec2(195, 0));
		createBridgeByVertices(vertices);
	}1
	if (e.keyCode == 52) {
		var vertices = [];
		vertices.push(new b2Vec2(160, 0));
		vertices.push(new b2Vec2(163, 4));
		vertices.push(new b2Vec2(169, 8));
		vertices.push(new b2Vec2(175, 10));
		vertices.push(new b2Vec2(180, 10));
		vertices.push(new b2Vec2(186, 8));
		vertices.push(new b2Vec2(192, 4));
		vertices.push(new b2Vec2(195, 0));
		createBridgeByVertices(vertices);
	}
	if (e.keyCode == 8) {
		destroyBridge();
	}
}

function keyRelease(e) {
	if ( e.keyCode == 37  ||  e.keyCode == 39 ) {
		resetForcesValue();
	}
	if ( e.keyCode == 32 || e.keyCode == 38) {
		bun.isJumping = false;
	}
}

function createWorld() {

    if ( world != null )
        Box2D.destroy(world);
	viewCenterWorld = new b2Vec2(0, 18);
	initForcesVectors();
    world = new b2World( new b2Vec2(0.0, -10.0) );
    world.SetDebugDraw(myDebugDraw);

    mouseJointGroundBody = world.CreateBody( new b2BodyDef() );

    //create ground
    //var shape = new b2EdgeShape();
    //shape.Set(new b2Vec2(-100.0, 0.0), new b2Vec2(100.0, 0.0));
    //var ground = world.CreateBody(new b2BodyDef());
    //ground.CreateFixture(shape, 0.0);

	createWorldBounds();

    //bun.buildBun(world, acquireCircleCoords(21, 0, 5, 3));
}

function draw() {
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

    if ( mouseJoint != null ) {
        //mouse joint is not drawn with regular joints in debug draw
        var p1 = mouseJoint.GetAnchorB();
        var p2 = mouseJoint.GetTarget();
        context.strokeStyle = 'rgb(204,204,204)';
        context.beginPath();
        context.moveTo(p1.get_x(),p1.get_y());
        context.lineTo(p2.get_x(),p2.get_y());
        context.stroke();
    }
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

function step(timestamp) {
    world.Step(1/60, 3, 2);
	var bunCenter = bun.getBunCenter();
	applyForces(bun.verticesList, bunCenter);
	viewCenterWorld.set_x((bunCenter != null ? bunCenter.get_x() : 0.0) + 30);
	//setViewCenterWorld(viewCenterWorld, true);
    draw();
    return;
}

function animate() {
    if ( run )
        requestAnimFrame( animate );
    step();
}
