/**
 * Created by Nikita on 27.05.2014.
 */
var wallHeight = 40;
var pitDepth = 12;
var pitWidth = 10;
var isPit = true;
var leftWallOffset = 20;
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
var bridge;
var bridgeCreated = false;

function createWorldBounds() {
	position = new b2Vec2(0, 0);
	bodyDef = new b2BodyDef();
	fixtureDef = new b2FixtureDef();
	createLeftWall();
	createPit();
	createGround();
	createRightWall();
	createFirmament();
	createSpringboards();
	createBridgeGround ();
}

function createRightWall () {
	var polygonVerticesList = [];
	polygonVerticesList.push(new b2Vec2(zeroX + rightWallOffset, zeroY));
	polygonVerticesList.push(new b2Vec2(zeroX + rightWallOffset, zeroY + wallHeight));
	var polygonShape = createChainShape( polygonVerticesList );
	fixtureDef.set_shape( polygonShape );
	fixtureDef.set_friction(boundsFriction);
	bodyDef.set_type(b2_staticBody);
	bodyDef.set_position(position);
	var body = world.CreateBody(bodyDef);
	body.CreateFixture(fixtureDef);
}

function createLeftWall () {
	var polygonVerticesList = [];
	var leftWallX = zeroX - leftWallOffset;
	if(isPit)
	{
		leftWallX -= pitWidth;
	}
	polygonVerticesList.push(new b2Vec2(leftWallX, zeroY + wallHeight));
	polygonVerticesList.push(new b2Vec2(leftWallX, zeroY));
	var polygonShape = createChainShape( polygonVerticesList );
	fixtureDef.set_shape( polygonShape );
	fixtureDef.set_friction(boundsFriction);
	bodyDef.set_type(b2_staticBody);
	bodyDef.set_position(position);
	var body = world.CreateBody(bodyDef);
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

function createGround () {
	var polygonVerticesList = [];
	polygonVerticesList.push(new b2Vec2(zeroX - leftWallOffset, zeroY));
	polygonVerticesList.push(new b2Vec2(zeroX + bridgeStartX, zeroY));
	var polygonShape = createChainShape( polygonVerticesList );
	fixtureDef.set_shape( polygonShape );
	fixtureDef.set_friction(boundsFriction);
	bodyDef.set_type(b2_staticBody);
	bodyDef.set_position(position);
	var body = world.CreateBody(bodyDef);
	body.CreateFixture(fixtureDef);

	var polygonVerticesList = [];
	polygonVerticesList.push(new b2Vec2(zeroX + bridgeStartX + bridgeLength, zeroY));
	polygonVerticesList.push(new b2Vec2(zeroX + rightWallOffset, zeroY));
	var polygonShape = createChainShape( polygonVerticesList );
	fixtureDef.set_shape( polygonShape );
	fixtureDef.set_friction(boundsFriction);
	bodyDef.set_type(b2_staticBody);
	bodyDef.set_position(position);
	var body = world.CreateBody(bodyDef);
	body.CreateFixture(fixtureDef);
}

function createBridgeByVertices(chainVerticesList) {
	if(!bridgeCreated) {
		var polygonShape = createChainShape(chainVerticesList);
		fixtureDef.set_shape(polygonShape);
		fixtureDef.set_friction(boundsFriction);
		bodyDef.set_type(b2_staticBody);
		bodyDef.set_position(position);
		bridge = world.CreateBody(bodyDef);
		bridge.CreateFixture(fixtureDef);
		bridgeCreated = true;
	}
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

function createBridgeGround () {
	var polygonVerticesList = [];
	polygonVerticesList.push(new b2Vec2(zeroX + bridgeStartX - 1, zeroY - 2));
	polygonVerticesList.push(new b2Vec2(zeroX + bridgeStartX - 1, zeroY - 12));
	polygonVerticesList.push(new b2Vec2(zeroX + bridgeStartX + bridgeLength + 1, zeroY - 12));
	polygonVerticesList.push(new b2Vec2(zeroX + bridgeStartX + bridgeLength + 1, zeroY - 2));
	var polygonShape = createChainShape(polygonVerticesList);
	fixtureDef.set_shape(polygonShape);
	fixtureDef.set_friction(boundsFriction);
	bodyDef.set_type(b2_staticBody);
	bodyDef.set_position(position);
	bridge = world.CreateBody(bodyDef);
	bridge.CreateFixture(fixtureDef);
}

function destroyBridge () {
	if(bridgeCreated) {
		world.DestroyBody(bridge);
		bridgeCreated = false;
	}
}

function createFirmament () {
	var polygonVerticesList = [];
	polygonVerticesList.push(new b2Vec2(zeroX + rightWallOffset, zeroY + wallHeight));
	polygonVerticesList.push(new b2Vec2(zeroX - leftWallOffset, zeroY + wallHeight));
	var polygonShape = createChainShape( polygonVerticesList );
	fixtureDef.set_shape( polygonShape );
	fixtureDef.set_friction(boundsFriction);
	bodyDef.set_type(b2_staticBody);
	bodyDef.set_position(position);
	var body = world.CreateBody(bodyDef);
	body.CreateFixture(fixtureDef);
}

function createSpringboards () {

	polygonVerticesList = [];
	polygonVerticesList.push(new b2Vec2(10, 1));
	polygonVerticesList.push(new b2Vec2(26, 7));
	polygonVerticesList.push(new b2Vec2(32, 1));
	polygonVerticesList.push(new b2Vec2(26, 1));
	polygonVerticesList.push(new b2Vec2(32, 7));
	polygonVerticesList.push(new b2Vec2(38, 1));
	polygonShape = createChainShape(polygonVerticesList);
	fixtureDef.set_shape(polygonShape);
	fixtureDef.set_friction(boundsFriction);
	bodyDef.set_type(b2_staticBody);
	bodyDef.set_position(position);
	body = world.CreateBody(bodyDef);
	body.CreateFixture(fixtureDef);

	/*polygonVerticesList = [];
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
	body.CreateFixture(fixtureDef);*/
}
