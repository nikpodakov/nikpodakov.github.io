function initKeyboardKeys() {
    window.addEventListener("keydown", keyPress, false);
    window.addEventListener("keyup", keyRelease, false);
	window.addEventListener("mousedown", function (evt) {
			document.getElementById("debugMessage").innerText = evt.clientX + ' ' + evt.clientY + '\n' +
				evt.clientWidth + ' ' + evt.clientHeight + '\n' + canvas.width + ' ' + canvas.height + '\n' +
				window.innerWidth + ' ' + window.innerHeight;
	});
}

function keyPress(e) {
    if ( e.keyCode == 32 || e.keyCode == 38) {
        if(!bun.isJumping) {
            applyImpulses(bun.verticesList, new b2Vec2(0, 40));
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
	    vertices.push({x: 195, y:  0});
	    vertices.push({x: 185, y:  4});
	    vertices.push({x: 170, y:  4});
        vertices.push({x: 160, y:  0});
        createBridgeByVertices(vertices);
    }
	/*if (e.keyCode == 50) {
        var vertices = [];
	    vertices.push({x: 195, y:  0});
	    vertices.push({x: 188, y:  1});
	    vertices.push({x: 181, y:  2});
	    vertices.push({x: 174, y:  2});
	    vertices.push({x: 167, y:  1});
        vertices.push({x: 160, y:  0});
        createBridgeByVertices(vertices);
    }
	if (e.keyCode == 51) {
	    var vertices = [];
	    vertices.push({x: 160, y:  -12});
		 vertices.push({x: 195, y:  -12});
		 vertices.push({x: 195, y:  0});
		 vertices.push({x: 185, y:  -4});
		 vertices.push({x: 170, y:  -4});
		 vertices.push({x: 160, y:  0});
		 createBridgeByVertices(vertices);
	}
	if (e.keyCode == 52) {
		 var vertices = [];
		 vertices.push({x: 160, y:  -12});
		 vertices.push({x: 195, y:  -12});
		 vertices.push({x: 195, y:  0});
		 vertices.push({x: 187, y:  10});
		 vertices.push({x: 184, y:  2});
		 vertices.push({x: 171, y:  2});
		 vertices.push({x: 168, y:  10});
		 vertices.push({x: 160, y:  0});
		 createBridgeByVertices(vertices);
	}*/
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