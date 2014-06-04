function acquireCircleCoords(count, cX, cY, radius) {
    var coordsList = [];

    for (var i = 0; i < count; i++){
        var angle = Math.PI * 2 / count * i;
        coordsList.push({ x: cX + Math.cos(angle) * radius, y: cY + Math.sin(angle) * radius });
    }

    return coordsList;
}

function angleBetween(a, b, c) {
    if (c == null) {
        c = { x: b.x + 1, y: b.y };
    }

    var ab = Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2));    
    var bc = Math.sqrt(Math.pow(b.x - c.x, 2) + Math.pow(b.y - c.y, 2)); 
    var ac = Math.sqrt(Math.pow(c.x - a.x, 2) + Math.pow(c.y - a.y, 2));
    return Math.acos((Math.pow(bc, 2) + Math.pow(ab, 2) - Math.pow(ac, 2)) / (2 * bc * ab));
}

function createDistanceJoint(world, b1, b2, b1Anchor, b2Anchor) {
    var distanceJoint = new b2DistanceJointDef();
    distanceJoint.Initialize(b1, b2, b1Anchor, b2Anchor);
    // var wpA = copyVec2(vertex.GetWorldPoint(distanceJoint.get_localAnchorA()));
    // var wpB = copyVec2(edge.GetWorldPoint(distanceJoint.get_localAnchorB()));

    // var d = new b2Vec2(wpB.get_x() - wpA.get_x(), wpB.get_y() - wpA.get_y());

    // distanceJoint.set_length(d.Length());
    // distanceJoint.set_frequencyHz = 4.0;
    // distanceJoint.set_dampingRatio = 0.5;
    var joint = world.CreateJoint(distanceJoint);
    return joint;
}

function createRopeJoint(world, b1, b2, b1Anchor, b2Anchor, maxLength) {
    var ropeJoint = new b2RopeJointDef();
    ropeJoint.set_bodyA(b1);
    ropeJoint.set_bodyB(b2);
    if (b1Anchor == null) {
        b1Anchor = b1.GetWorldCenter();
    }
    ropeJoint.set_localAnchorA(b1Anchor);
    if (b2Anchor == null) {
        b2Anchor = b2.GetWorldCenter();
    }
    ropeJoint.set_localAnchorB(b2Anchor);
    if (maxLength == null) {
        var wpB1 = b1.GetWorldPoint(ropeJoint.get_localAnchorA);
        var wpB2 = b2.GetWorldPoint(ropeJoint.get_localAnchorB);

        var d = new b2Vec2(wpB2.get_x() - wpB1.get_x(), wpB2.get_y() - wpB1.get_y());
        maxLength = d.Length();
    }
    ropeJoint.set_maxLength(maxLength);

    var joint = world.CreateJoint(ropeJoint);
    return joint;
}