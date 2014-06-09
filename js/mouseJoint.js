var mouseJointGroundBody;
var myQueryCallback;
var mouseJoint = null;
var mousePosPixel = { x: 0, y: 0 };
var prevMousePosPixel = { x: 0, y: 0 };
var mousePosWorld = { x: 0, y: 0 };
var mouseDown = false;

function initMouseJoint(canvas, world) {
    canvas.addEventListener('mousemove', function(evt) {
        onMouseMove(canvas,evt);
    }, false);

    canvas.addEventListener('mousedown', function(evt) {
        onMouseDown(canvas,evt);
    }, false);

    canvas.addEventListener('mouseup', function(evt) {
        onMouseUp(canvas,evt);
    }, false);

    canvas.addEventListener('mouseout', function(evt) {
        onMouseOut(canvas,evt);
    }, false);

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

    mouseJointGroundBody = world.CreateBody( new b2BodyDef() );
}

function drawMouseJoint() {
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
}

function updateMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    mousePosPixel = {
        x: evt.clientX - rect.left,
        y: canvas.height - (evt.clientY - rect.top)
    };
    mousePosWorld = getWorldPointFromPixelPoint(mousePosPixel);
}

function onMouseMove(canvas, evt) {
    prevMousePosPixel = mousePosPixel;
    updateMousePos(canvas, evt);
    /*if ( shiftDown ) {
        canvasOffset.x += (mousePosPixel.x - prevMousePosPixel.x);
        canvasOffset.y -= (mousePosPixel.y - prevMousePosPixel.y);
        draw();
    }
    else*/
    if ( mouseDown && mouseJoint != null ) {
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

function onMouseDown(canvas, evt) {
    updateMousePos(canvas, evt);
    if ( !mouseDown )
        startMouseJoint();
    mouseDown = true;
}

function onMouseUp(canvas, evt) {
    mouseDown = false;
    updateMousePos(canvas, evt);
    if ( mouseJoint != null ) {
        world.DestroyJoint(mouseJoint);
        mouseJoint = null;
    }
}

function onMouseOut(canvas, evt) {
    onMouseUp(canvas,evt);
}
