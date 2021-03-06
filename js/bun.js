var distanceJoint;
var ballShape;
var edgeShape;
var bd;
var edgeFilterData;
var leftSide;
var rightSide;
var d1;
var d2;

function initBunVariables() {
	distanceJoint = new b2DistanceJointDef();
	ballShape = new b2CircleShape();
	edgeShape = new b2PolygonShape();
	bd = new b2BodyDef();
	edgeFilterData = new b2Filter();
	leftSide = new b2Vec2(0,0);
	rightSide = new b2Vec2(0,0);
	d1 = new b2Vec2(0,0);
	d2 = new b2Vec2(0,0);
}

var bun = {
	world: null,
	vertexRadius: 0.4,
	vertexMass: 5,
	edgesList: [],
	verticesList: [],
	verticesBaseAngles: [],
	verticesBaseOffsets: [],
	otherPathsData: [],
	bunCenter: null,
	isJumping: false,
	buildBun: function (world, verticesCoordsList, otherContours) {
		this.world = world;
		this.bunCenter = new b2Vec2(0,0);
		var minDist = 1000000;
		for(var i = 0; i < verticesCoordsList.length; i++) {
			for(var j = i + 1; j < verticesCoordsList.length; j++) {
				var dist = Math.sqrt(Math.pow(verticesCoordsList[i].x - verticesCoordsList[j].x, 2) +
					Math.pow(verticesCoordsList[i].y - verticesCoordsList[j].y, 2));
				if(dist < minDist) {
					minDist = dist;
				}
			}
		}
		this.vertexRadius = minDist / 3 > 0.8 ? 0.8 : minDist / 3 < 0.3 ? 0.3 : minDist / 3;

		var b = this;
		verticesCoordsList.forEach(function (coord) {
			b.verticesList.push(b.createVertex(coord.x, coord.y, b.vertexRadius));
		});

		var edgesCount = Math.floor(this.verticesList.length / 3);
		var offset = Math.floor(this.verticesList.length / 4);
		var sideEdgesCount = Math.floor(edgesCount / 3);
		var a1 = offset + 1;
		var a2 = a1 + sideEdgesCount;
		var b1 = Math.floor(this.verticesList.length / 2) - Math.floor((sideEdgesCount + edgesCount % 3) / 2);
		var b2 = b1 + sideEdgesCount + edgesCount % 3;
		var c2 = this.verticesList.length - offset;
		var c1 = c2 - sideEdgesCount;
		for (var i = 0; i < this.verticesList.length; i++) {
			for (var j = i + 1; j < this.verticesList.length; j++) {
				if ((j >= i + a1 && j < i + a2) ||
					(j >= i + b1 && j < i + b2) ||
					(j >= i + c1 && j < i + c2)
					) {
					var v1 = this.verticesList[i];
					var v2 = this.verticesList[j];
					this.createEdgeBetweenVertices(v1, v2);
				}
			}
		}
		for (var i = 0; i < this.verticesList.length - 1; i++) {
			this.createEdgeBetweenVertices(this.verticesList[i], this.verticesList[i + 1]);
		}
		if (this.verticesList.length > 2) {
			this.createEdgeBetweenVertices(this.verticesList[this.verticesList.length - 1], this.verticesList[0]);
		}
		b.getBunCenter();
		verticesCoordsList.forEach(function (coordinations) {
			b.verticesBaseAngles.push(angleBetween(coordinations, {x:b.bunCenter.get_x(),y:b.bunCenter.get_y()}));
			b.verticesBaseOffsets.push(Math.sqrt(Math.pow(coordinations.x - b.bunCenter.get_x(), 2) +
				Math.pow(coordinations.y - b.bunCenter.get_y(), 2)));
		});
		otherContours.forEach(function (points) {
			var pathData = [];
			points.forEach(function (point) {
				var pointData = [];
				b.verticesList.forEach(function (vertex) {
					pointData.push( {
						offset: Math.sqrt(Math.pow(point.x - vertex.GetWorldCenter().get_x(), 2) +
							Math.pow(point.y - vertex.GetWorldCenter().get_y(), 2)),
						angle: angleBetweenWithSign(point,
							{x: vertex.GetWorldCenter().get_x(), y: vertex.GetWorldCenter().get_y()},
							{x: b.bunCenter.get_x(), y: b.bunCenter.get_y()})
					});
				});
				pathData.push(pointData);
			});
			b.otherPathsData.push(pathData);
		});
		return this.verticesList;
	},
	getBunCenter: function () {
		var center = this.bunCenter;
		var verticesList = this.verticesList;
		if (center != null) {
			center.set_x(0);
			center.set_y(0);
		}
		this.verticesList.forEach(function (vertex) {
			center.set_x(center.get_x() + vertex.GetWorldCenter().get_x());
			center.set_y(center.get_y() + vertex.GetWorldCenter().get_y());
		});
		if (center != null) {
			center.set_x(center.get_x() / verticesList.length);
			center.set_y(center.get_y() / verticesList.length);
		}
		return center;
	},
	createEdgeBetweenVertices: function (v1, v2) {
		var v1P = v1.GetWorldCenter();
		var v2P = v2.GetWorldCenter();
		var v1Pos = { x: v1P.get_x(), y: v1P.get_y() };
		var v2Pos = { x: v2P.get_x(), y: v2P.get_y() };
		if (v1Pos.y < v2Pos.y) {
			var tmp = v1Pos;
			v1Pos = v2Pos;
			v2Pos = tmp;
		}

		var distance = Math.sqrt(Math.pow(v1Pos.x - v2Pos.x, 2) + Math.pow(v1Pos.y - v2Pos.y, 2));
		var center = { x: (v1Pos.x + v2Pos.x) / 2.0, y: (v1Pos.y + v2Pos.y) / 2.0 };
		var angle = angleBetween(v1Pos, v2Pos);

		var edge = this.createEdge(center.x, center.y, distance / 2.0, this.vertexRadius * 0.4, angle);
		this.edgesList.push(edge);

		this.connectVertexAndEdge(v1, edge);
		this.connectVertexAndEdge(v2, edge);
		// fixVerticesOnEdge(edge, v1, v2);
	},/*
	fixVerticesOnEdge: function (edge, v1, v2) {
		var revoluteJoint = new b2RevoluteJointDef();
		revoluteJoint.Initialize(v1, v2, edge.GetWorldCenter());
		var joint = this.world.CreateJoint(revoluteJoint);
		return joint;
	},*/
	connectVertexAndEdge: function (vertex, edge) {
		var vertexAnchor = vertex.GetWorldCenter();
		var edgeSides = edge.getSides();
		var edgeAnchor = edgeSides.getNearestTo(vertexAnchor);

		//return createRopeJoint(world, vertex, edge, vertexAnchor, edgeAnchor);
		distanceJoint.Initialize(vertex, edge, vertexAnchor, edgeAnchor);
		return world.CreateJoint(distanceJoint);
	},
	createVertex: function (x, y, radius) {
		ballShape.set_m_radius(radius);
		//ballBd.set_type(b2_staticBody);
		bodyDef.set_type(b2_dynamicBody);
		position.set_x(x);
		position.set_y(y);
		bodyDef.set_position(position);
		bodyDef.set_fixedRotation(true);
		var body = this.world.CreateBody(bodyDef);
		fixtureDef.set_density(this.vertexMass);
		fixtureDef.set_friction(1);
		fixtureDef.set_shape(ballShape);
		body.CreateFixture(fixtureDef);
		//var bodyFixture = body.CreateFixture(ballShape, 50.0);
		return body;
	},
	createEdge: function (x, y, halfWidth, halfHeight, angle) {
		edgeShape.SetAsBox(halfWidth, halfHeight);
		bd.set_type(b2_dynamicBody);
		// bd.set_type(b2_staticBody);
		position.set_x(x);
		position.set_y(y);
		bd.set_position(position);
		if (angle != null){
			bd.set_angle(angle);
		}

		var body = this.world.CreateBody(bd);
		var edgeFixture = body.CreateFixture(edgeShape, this.vertexMass * 0.1);
		edgeFilterData.set_groupIndex(-1);
		edgeFixture.SetFilterData(edgeFilterData);
		body.getSides = function() {
			var angle = this.GetAngle();
			var position = this.GetWorldCenter();
			leftSide.set_x(position.get_x() - Math.cos(angle) * halfWidth);
			leftSide.set_y(position.get_y() - Math.sin(angle) * halfWidth);
			rightSide.set_x(position.get_x() + Math.cos(angle) * halfWidth);
			rightSide.set_y(position.get_y() + Math.sin(angle) * halfWidth);
			return {
				left: leftSide,
				right: rightSide,
				getNearestTo: function (point) {
					d1.set_x(point.get_x() - this.left.get_x());
					d1.set_y(point.get_y() - this.left.get_y());
					d2.set_x(point.get_x() - this.right.get_x());
					d2.set_y(point.get_y() - this.right.get_y());
					if (d1.Length() < d2.Length()) {
						return this.left;
					}
					return this.right;
				}
			}
		};
		return body;
	}
};
