function initKeyboardKeys() {
    window.addEventListener("keydown", keyPress, false);
    window.addEventListener("keyup", keyRelease, false);
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