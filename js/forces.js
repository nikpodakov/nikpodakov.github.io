/**
 * Created by Nikita on 26.05.2014.
 */
var forcesDirection = 1;
var forcesValue = 0;
var defaultForcesDirection = 1;
var defaultForcesValue = 0;
var forcesCenter;
var forceVector;
var zeroPoint;
var xAxisPoint;
var newVertexCoordinates;

function initForcesVectors() {
	forcesCenter = new b2Vec2(0, 0);
	forceVector = new b2Vec2(0, 0);
	zeroPoint = new b2Vec2(0, 0);
	xAxisPoint = new b2Vec2(1, 0);
	newVertexCoordinates = new b2Vec2(0,0);
}

function applyImpulses (verticesList, impulseVector) {
	verticesList.forEach(function (vertex) {
		vertex.ApplyLinearImpulse(impulseVector, vertex.GetWorldCenter());
	});
}

function directForces(direction) {
	if(direction == null) {
		forcesDirection = defaultForcesDirection;
	}
	forcesDirection = direction;
}

function strengthenForces() {
	if (forcesValue < bun.vertexMass * bun.vertexRadius * 14) {
		forcesValue += bun.vertexMass * bun.vertexRadius * 6;
	}
}

function setForcesValue(value) {
	forcesValue = bun.vertexMass * bun.vertexRadius * 10;
	if(value != null) {
		forcesValue = bun.vertexMass * value;
	}
}

function weakenForces() {
	forcesValue -= bun.vertexMass * bun.vertexRadius * 6;
	if(forcesValue < 0) {
		forcesValue = 0;
	}
}

function resetForcesValue() {
	forcesValue = defaultForcesValue;
}

function applyForces(verticesList, bunCenter) {
	forcesCenter = bunCenter;
	/*bunCenter.set_x(0);
	bunCenter.set_y(0);
	verticesList.forEach(function (vertex) {
		bunCenter.set_x(bunCenter.get_x() + vertex.GetWorldCenter().get_x());
		bunCenter.set_y(bunCenter.get_y() + vertex.GetWorldCenter().get_y());
	});
	bunCenter.set_x(bunCenter.get_x() / verticesList.length);
	bunCenter.set_y(bunCenter.get_y() / verticesList.length);*/
	verticesList.forEach(function (vertex) {
		vertex.ApplyForce(calculateForceVector(vertex.GetWorldCenter(), forcesCenter), vertex.GetWorldCenter());
	});
}

function calculateForceVector(vertexCoordinates, forcesCenter) {
	newVertexCoordinates.set_x(vertexCoordinates.get_x() - forcesCenter.get_x());
	newVertexCoordinates.set_y(vertexCoordinates.get_y() - forcesCenter.get_y());
	var angle = calculateAngle(newVertexCoordinates);
	forceVector.set_x(newVertexCoordinates.get_y() * Math.sin(angle) * forcesValue * forcesDirection);
	forceVector.set_y(newVertexCoordinates.get_y() * -1 * Math.cos(angle) * forcesValue * forcesDirection);
	return forceVector;
}

function calculateAngle(a) {
	b = zeroPoint;
	c = xAxisPoint;
	var ab = Math.sqrt(Math.pow(b.get_x() - a.get_x(), 2) + Math.pow(b.get_y() - a.get_y(), 2));
	var bc = Math.sqrt(Math.pow(b.get_x() - c.get_x(), 2) + Math.pow(b.get_y() - c.get_y(), 2));
	var ac = Math.sqrt(Math.pow(c.get_x() - a.get_x(), 2) + Math.pow(c.get_y() - a.get_y(), 2));
	return Math.acos((Math.pow(bc, 2) + Math.pow(ab, 2) - Math.pow(ac, 2)) / (2 * bc * ab));
}