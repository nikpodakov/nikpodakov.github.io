/**
 * Created by Nikita on 27.05.2014.
 */
var wallHeight = 40;
var wallWidth = 20;
var pitDepth = 12;
var pitWidth = 10;
var leftWallOffset = 30;
var rightWallOffset = 230;
var zeroY = 0;
var zeroX = 0;
var boundsFriction = 0.8;
var position;
var bodyDef;
var fixtureDef;
var bridgeStartX = 160;
var bridgeLength = 35;
var bridgeHeight = 4;
var bridgeGroundDepth = 10;
var bridge;
var bridgeVertices = [];
var bridgeCreated = false;

var leftWall = [];
var rightWall = [];
var ground1 = [];
var ground2 = [];
var firmament = [];
var bridgeGround = [];
var contour = [];

var ground = [];

function createWorldBounds(length, hight) {
	position = new b2Vec2(0, 0);
	bodyDef = new b2BodyDef();
	fixtureDef = new b2FixtureDef();

	generateGround(length, hight);
	createLeftWall();
	createRightWall();
}

function createWorldBounds1() {
	position = new b2Vec2(0, 0);
	bodyDef = new b2BodyDef();
	fixtureDef = new b2FixtureDef();

	initBoundsAndContour();
	createLeftWall();
	//createPit();
	createGround();
	createRightWall();
	createFirmament();
	createSpringboards();
	createBridgeGround ();
}

function generateGround(length, hight) {
	leftWall.push({x: -30, y: hight * 2 / PTM});
	leftWall.push({x: -30, y: 0});
	leftWall.push({x: -10, y: 0});
	leftWall.push({x: -10, y: hight * 2 / PTM});
	rightWall.push({x: length / PTM + 20, y: hight * 2 / PTM});
	rightWall.push({x: length / PTM + 20, y: 0});
	rightWall.push({x: length / PTM + 40, y: 0});
	rightWall.push({x: length / PTM + 40, y: hight * 2 / PTM});
	ground.push({x: -50, y: -1000 / PTM});
	ground.push({x: -50, y: hight / PTM * 0.8});
	for(var i = 0; i <= length; i += length / 100) {
		/*var y = (Math.cos(i / length * Math.PI) + 1) / 2 * hight / PTM * 0.8;
		y += (Math.sin(i * 17 / length * Math.PI)* -0.008 + Math.cos(i * 59 / length * Math.PI) * 0.003 + Math.sin(i * 47 / length * Math.PI) * 0.002) *
			Math.sin(i / length * Math.PI) * length / PTM;
		ground.push({x: i / PTM, y: y});*/
		var y = (Math.cos(i / length * Math.PI) + 1) / 2 * hight / PTM * 0.8;
		y += (Math.sin(i * (Math.random() * 12 + 8) / length * Math.PI)* -0.006 +
			Math.cos(i * (Math.random() * 12 + 18) / length * Math.PI) * 0.0015 +
			Math.sin(i * (Math.random() * 16 + 24) / length * Math.PI) * 0.001) *
			Math.sin(i / length * Math.PI) * length / PTM;
		ground.push({x: i / PTM, y: y});
	}
	ground.push({x: length / PTM + 50, y: 0});
	ground.push({x: length / PTM + 50, y: -1000 / PTM});
	var polygonVerticesList = [];
	ground.forEach(function (point) {
		polygonVerticesList.push(new b2Vec2(point.x, point.y - bun.vertexRadius/2));
	});
	var polygonShape = createChainShape( polygonVerticesList );
	polygonVerticesList.forEach(function (vector) {
		//vector.remove();
	});
	fixtureDef.set_shape( polygonShape );
	fixtureDef.set_friction(boundsFriction);
	bodyDef.set_type(b2_staticBody);
	bodyDef.set_position(position);
	var body = world.CreateBody(bodyDef);
	body.CreateFixture(fixtureDef);
}

function initBoundsAndContour() {
	leftWall.push({x: zeroX - leftWallOffset - wallWidth, y: zeroY + wallHeight});
	leftWall.push({x: zeroX - leftWallOffset - wallWidth, y: zeroY});
	leftWall.push({x: zeroX - leftWallOffset, y: zeroY});
	leftWall.push({x: zeroX - leftWallOffset, y: zeroY + wallHeight});

	ground1.push({x: zeroX - leftWallOffset - wallWidth, y: zeroY});
	ground1.push({x: zeroX - leftWallOffset - wallWidth, y: zeroY - wallWidth});
	ground1.push({x: zeroX + bridgeStartX, y: zeroY - wallWidth});
	ground1.push({x: zeroX + bridgeStartX, y: zeroY});

	ground2.push({x: zeroX + bridgeStartX + bridgeLength, y: zeroY});
	ground2.push({x: zeroX + bridgeStartX + bridgeLength, y: zeroY - wallWidth});
	ground2.push({x: zeroX + rightWallOffset + wallWidth, y: zeroY - wallWidth});
	ground2.push({x: zeroX + rightWallOffset + wallWidth, y: zeroY});

	rightWall.push({x: zeroX + rightWallOffset, y: zeroY + wallHeight});
	rightWall.push({x: zeroX + rightWallOffset, y: zeroY});
	rightWall.push({x: zeroX + rightWallOffset + wallWidth, y: zeroY});
	rightWall.push({x: zeroX + rightWallOffset + wallWidth, y: zeroY + wallHeight});

	firmament.push({x: zeroX - leftWallOffset - wallWidth, y: zeroY + wallHeight + wallWidth});
	firmament.push({x: zeroX - leftWallOffset - wallWidth, y: zeroY + wallHeight});
	firmament.push({x: zeroX + rightWallOffset + wallWidth, y: zeroY + wallHeight});
	firmament.push({x: zeroX + rightWallOffset + wallWidth, y: zeroY + wallHeight + wallWidth});

	bridgeGround.push({x: zeroX + bridgeStartX, y: zeroY - bridgeGroundDepth - wallWidth});
	bridgeGround.push({x: zeroX  + bridgeStartX, y: zeroY - bridgeGroundDepth});
	bridgeGround.push({x: zeroX + bridgeStartX + bridgeLength, y: zeroY - bridgeGroundDepth});
	bridgeGround.push({x: zeroX + bridgeStartX + bridgeLength, y: zeroY - bridgeGroundDepth - wallWidth});

	contour.push({x: zeroX - leftWallOffset + 0.2, y: zeroY + 0.2});
	contour.push({x: 10, y: 0 + 0.2});
	contour.push({x: 26, y: 6 + 0.2});
	contour.push({x: 26, y: 6 + 0.2});
	contour.push({x: 30, y: 0 + 0.2});
	contour.push({x: 36, y: 0 + 0.2});
	contour.push({x: 80, y: 18 + 0.2});
	contour.push({x: 80, y: 18 + 0.2});
	contour.push({x: 86, y: 18 + 0.2});
	contour.push({x: 130, y: 0 + 0.2});
	contour.push({x: zeroX + bridgeStartX + 0.2, y: zeroY + 0.2});
	contour.push({x: zeroX + bridgeStartX + 0.2, y: zeroY - bridgeGroundDepth + 0.2});
	contour.push({x: zeroX + bridgeStartX + bridgeLength - 0.2, y: zeroY - bridgeGroundDepth + 0.2});
	contour.push({x: zeroX + bridgeStartX + bridgeLength - 0.2, y: zeroY + 0.2});
	contour.push({x: zeroX + rightWallOffset - 0.2, y: zeroY + 0.2});
	contour.push({x: zeroX + rightWallOffset - 0.2, y: zeroY + wallHeight - 0.2});
	contour.push({x: zeroX - leftWallOffset + 0.2, y: zeroY + wallHeight - 0.2});
}

function createLeftWall () {
	var polygonVerticesList = [];
	leftWall.forEach(function (point) {
		polygonVerticesList.push(new b2Vec2(point.x, point.y));
	});
	var polygonShape = createPolygonShape( polygonVerticesList );
	fixtureDef.set_shape( polygonShape );
	fixtureDef.set_friction(boundsFriction);
	bodyDef.set_type(b2_staticBody);
	bodyDef.set_position(position);
	var body = world.CreateBody(bodyDef);
	body.CreateFixture(fixtureDef);
}

function createGround () {
	var polygonVerticesList = [];
	ground1.forEach(function (point) {
		polygonVerticesList.push(new b2Vec2(point.x, point.y));
	});
	var polygonShape = createPolygonShape( polygonVerticesList );
	fixtureDef.set_shape( polygonShape );
	fixtureDef.set_friction(boundsFriction);
	bodyDef.set_type(b2_staticBody);
	bodyDef.set_position(position);
	var body = world.CreateBody(bodyDef);
	body.CreateFixture(fixtureDef);

	var polygonVerticesList = [];
	ground2.forEach(function (point) {
		polygonVerticesList.push(new b2Vec2(point.x, point.y));
	});
	var polygonShape = createPolygonShape( polygonVerticesList );
	fixtureDef.set_shape( polygonShape );
	fixtureDef.set_friction(boundsFriction);
	bodyDef.set_type(b2_staticBody);
	bodyDef.set_position(position);
	var body = world.CreateBody(bodyDef);
	body.CreateFixture(fixtureDef);
}

function createRightWall () {
	var polygonVerticesList = [];
	rightWall.forEach(function (point) {
		polygonVerticesList.push(new b2Vec2(point.x, point.y));
	});
	var polygonShape = createPolygonShape( polygonVerticesList );
	fixtureDef.set_shape( polygonShape );
	fixtureDef.set_friction(boundsFriction);
	bodyDef.set_type(b2_staticBody);
	bodyDef.set_position(position);
	var body = world.CreateBody(bodyDef);
	body.CreateFixture(fixtureDef);
}

function createFirmament () {
	var polygonVerticesList = [];
	firmament.forEach(function (point) {
		polygonVerticesList.push(new b2Vec2(point.x, point.y));
	});
	var polygonShape = createPolygonShape( polygonVerticesList );
	fixtureDef.set_shape( polygonShape );
	fixtureDef.set_friction(boundsFriction);
	bodyDef.set_type(b2_staticBody);
	bodyDef.set_position(position);
	var body = world.CreateBody(bodyDef);
	body.CreateFixture(fixtureDef);
}

function createBridgeGround () {
	var polygonVerticesList = [];
	polygonVerticesList.push(new b2Vec2(zeroX + bridgeStartX - 1, zeroY));
	polygonVerticesList.push(new b2Vec2(zeroX + bridgeStartX - 1, zeroY - bridgeGroundDepth));
	polygonVerticesList.push(new b2Vec2(zeroX + bridgeStartX + bridgeLength + 1, zeroY - bridgeGroundDepth));
	polygonVerticesList.push(new b2Vec2(zeroX + bridgeStartX + bridgeLength + 1, zeroY));
	var polygonShape = createChainShape(polygonVerticesList);
	fixtureDef.set_shape(polygonShape);
	fixtureDef.set_friction(boundsFriction);
	bodyDef.set_type(b2_staticBody);
	bodyDef.set_position(position);
	bridge = world.CreateBody(bodyDef);
	bridge.CreateFixture(fixtureDef);
}

function createSpringboards () {
	polygonVerticesList = [];
	polygonVerticesList.push(new b2Vec2(10, 0));
	polygonVerticesList.push(new b2Vec2(26, 6));
	polygonShape = createChainShape(polygonVerticesList);
	fixtureDef.set_shape(polygonShape);
	fixtureDef.set_friction(boundsFriction);
	bodyDef.set_type(b2_staticBody);
	bodyDef.set_position(position);
	body = world.CreateBody(bodyDef);
	body.CreateFixture(fixtureDef);

	polygonVerticesList = [];
	polygonVerticesList.push(new b2Vec2(26, 6));
	polygonVerticesList.push(new b2Vec2(30, 0));
	polygonVerticesList.push(new b2Vec2(36, 0));
	polygonVerticesList.push(new b2Vec2(80, 18));
	polygonShape = createChainShape(polygonVerticesList);
	fixtureDef.set_shape(polygonShape);
	fixtureDef.set_friction(boundsFriction);
	bodyDef.set_type(b2_staticBody);
	bodyDef.set_position(position);
	body = world.CreateBody(bodyDef);
	body.CreateFixture(fixtureDef);
	polygonVerticesList = [];

	polygonVerticesList.push(new b2Vec2(80, 18));
	polygonVerticesList.push(new b2Vec2(86, 18));
	polygonVerticesList.push(new b2Vec2(130, 0));
	polygonShape = createChainShape(polygonVerticesList);
	fixtureDef.set_shape(polygonShape);
	fixtureDef.set_friction(boundsFriction);
	bodyDef.set_type(b2_staticBody);
	bodyDef.set_position(position);
	body = world.CreateBody(bodyDef);
	body.CreateFixture(fixtureDef);
}

function createPit () {
	var polygonVerticesList = [];
	var leftWallX = zeroX - leftWallOffset - pitWidth;
	polygonVerticesList.push(new b2Vec2(leftWallX, zeroY));
	polygonVerticesList.push(new b2Vec2(leftWallX, zeroY - pitDepth));
	polygonVerticesList.push(new b2Vec2(zeroX - leftWallOffset, zeroY - pitDepth));
	polygonVerticesList.push(new b2Vec2(zeroX - leftWallOffset, zeroY));
	var polygonShape = createChainShape( polygonVerticesList );
	fixtureDef.set_shape( polygonShape );
	fixtureDef.set_friction(boundsFriction);
	bodyDef.set_type(b2_staticBody);
	bodyDef.set_position(position);
	var body = world.CreateBody(bodyDef);
	body.CreateFixture(fixtureDef);
}

function createGoodBridge () {
	if(!bridgeCreated) {
		var polygonVerticesList = [];
		polygonVerticesList.push(new b2Vec2(zeroX + bridgeStartX, zeroY));
		polygonVerticesList.push(new b2Vec2(zeroX + bridgeStartX + bridgeLength / 2, zeroY + bridgeHeight));
		polygonVerticesList.push(new b2Vec2(zeroX + bridgeStartX + bridgeLength, zeroY));
		var polygonShape = createChainShape(polygonVerticesList);
		fixtureDef.set_shape(polygonShape);
		fixtureDef.set_friction(boundsFriction);
		bodyDef.set_type(b2_staticBody);
		bodyDef.set_position(position);
		bridge = world.CreateBody(bodyDef);
		bridge.CreateFixture(fixtureDef);
		bridgeCreated = true;
	}
}

function createBadBridge () {
	if(!bridgeCreated) {
		var polygonVerticesList = [];
		polygonVerticesList.push(new b2Vec2(zeroX + bridgeStartX + bridgeLength, zeroY));
		polygonVerticesList.push(new b2Vec2(zeroX + bridgeStartX + bridgeLength / 2, zeroY + bridgeHeight));
		polygonVerticesList.push(new b2Vec2(zeroX + bridgeStartX, zeroY));
		var polygonShape = createPolygonShape(polygonVerticesList);
		fixtureDef.set_shape(polygonShape);
		fixtureDef.set_friction(boundsFriction);
		bodyDef.set_type(b2_dynamicBody);
		bodyDef.set_position(position);
		bridge = world.CreateBody(bodyDef);
		bridge.CreateFixture(fixtureDef);
		bridgeCreated = true;
	}
}

function createBridgeByVertices(vertices) {
	if(!bridgeCreated) {
		bridgeVertices = vertices;
		var polygonVerticesList = [];
		polygonVerticesList.push(new b2Vec2(bridgeStartX, zeroY - bridgeGroundDepth));
		polygonVerticesList.push(new b2Vec2(bridgeStartX + bridgeLength, zeroY - bridgeGroundDepth));
		vertices.forEach(function (vertex) {
			polygonVerticesList.push(new b2Vec2(vertex.x, vertex.y));
		});
		var polygonShape = createPolygonShape(polygonVerticesList);
		fixtureDef.set_shape(polygonShape);
		fixtureDef.set_friction(boundsFriction);
		bodyDef.set_type(b2_staticBody);
		bodyDef.set_position(position);
		bridge = world.CreateBody(bodyDef);
		bridge.CreateFixture(fixtureDef);
		bridgeCreated = true;
	}
}

function destroyBridge () {
	if(bridgeCreated) {
		world.DestroyBody(bridge);
		bridgeCreated = false;
	}
}