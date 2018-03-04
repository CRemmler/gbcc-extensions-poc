//physics.j
     selectedFixture = null;
var socket;
var universe;

Physicsb2 = (function() {
  var world;
  var physicsWorld;
  var running = false;
  var elementsBound = false;
  var helperPoints = [];
  var helperLines = [];
  var helperArc = {};
  var helperTargets = [];
  //var helperDots = {};
  var draggerPoints = [];
  var fillShapes = [];
   // get ready to capture mouse events
  var isMouseDown = false;
  var mouseX = undefined;
  var mouseY = undefined;
  var p, canvasPosition;
  p = undefined;
  var selectedBody;
  var selectedFixture;
  var mouseJoint = null;
  var mousePVec;
  var pointDragged = null;
  var bodyDragged = null;
  var canvas = null;
  var ctx = null;
  var grabPointDragged = null;
  var totalObjectsCreated;
  var fixtureClick = null;
  
  var   b2Vec2 = Box2D.Common.Math.b2Vec2
     ,	b2BodyDef = Box2D.Dynamics.b2BodyDef
     ,	b2Body = Box2D.Dynamics.b2Body
     ,	b2FixtureDef = Box2D.Dynamics.b2FixtureDef
     ,	b2Fixture = Box2D.Dynamics.b2Fixture
     ,	b2World = Box2D.Dynamics.b2World
     ,	b2MassData = Box2D.Collision.Shapes.b2MassData
     ,	b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape
     ,	b2CircleShape = Box2D.Collision.Shapes.b2CircleShape
     ,	b2EdgeShape = Box2D.Collision.Shapes.b2EdgeShape
     ,	b2DebugDraw = Box2D.Dynamics.b2DebugDraw
     ,  b2AABB = Box2D.Collision.b2AABB
     ,  b2MouseJointDef = Box2D.Dynamics.Joints.b2MouseJointDef
     ,  b2DistanceJointDef = Box2D.Dynamics.Joints.b2DistanceJointDef
     ,  b2RevoluteJointDef = Box2D.Dynamics.Joints.b2RevoluteJointDef
     ,  b2PrismaticJointDef = Box2D.Dynamics.Joints.b2PrismaticJointDef
     ;
  var bodyObj = {};
  var turtleObj = {};
  var fixtureObj = {};
  var fixDefObj = {};
  var bodyDefObj = {};
  var targetObj = {}; //object, key is bodyId, value is list of targets
  var SCALE = 30;
  var BOX2D_WIDTH = 0; 
  var BOX2D_HEIGHT = 0; 
  var NLOGO_WIDTH = 0; 
  var NLOGO_HEIGHT = 0;
  var wrap = [false, false];
  var prevSelectedBody;
  var prevSelectedFixture;
  var showAABB = false;
  var showCenter = false;
  // assume NetLogo world is centered at 0
  
  ///////// INITIALIZE
  
  
  $( window ).resize(function() {
    p = $( "#netlogoCanvas").parent();//$( "#netlogoCanvas";
    canvasPosition = p.offset();
    //console.log("reset canvas position " + canvasPosition);
  });

  ///////// CONVERSIONS
  
  function nlogotobox2d(coords) {
    // console.log("nlogotobox2d", coords);
    BOX2D_WIDTH = parseFloat($("#netlogoCanvas").css("width").replace("px",""));
    BOX2D_HEIGHT = parseFloat($("#netlogoCanvas").css("height").replace("px",""));
    var nlogoLeftAbsolute = coords[0] + NLOGO_WIDTH / 2;
    var nlogoLeftPercent = nlogoLeftAbsolute / NLOGO_WIDTH;
    var box2dLeftAbsolute = BOX2D_WIDTH * nlogoLeftPercent / SCALE * 2;
    var nlogoTopAbsolute = NLOGO_HEIGHT / 2 - coords[1];
    var nlogoTopPercent = nlogoTopAbsolute / NLOGO_HEIGHT;
    var box2dTopAbsolute = BOX2D_HEIGHT * nlogoTopPercent / SCALE * 2;
    //console.log([ box2dLeftAbsolute, box2dTopAbsolute]);
    return ([ box2dLeftAbsolute, box2dTopAbsolute]);
  };
  
  function box2dtonlogo(coords) {
    // console.log("box2dtonlogo",coords);
    BOX2D_WIDTH = parseFloat($("#netlogoCanvas").css("width").replace("px",""))
    BOX2D_HEIGHT = parseFloat($("#netlogoCanvas").css("height").replace("px",""))
    var xcoord = coords.x * SCALE / 2;
    var ycoord = coords.y * SCALE / 2;
    var box2dLeftAbsolute = xcoord;
    var box2dLeftPercent = xcoord / BOX2D_WIDTH;
    var nlogoLeftAbsolute = NLOGO_WIDTH * box2dLeftPercent - (NLOGO_WIDTH / 2);
    var box2dTopAbsolute = ycoord;
    var box2dTopPercent = ycoord / BOX2D_HEIGHT;
    var nlogoTopAbsolute = (NLOGO_HEIGHT / 2) - NLOGO_HEIGHT * box2dTopPercent;
    return ({x: nlogoLeftAbsolute, y: nlogoTopAbsolute});
  };
  
  function radiansToDegrees(angle) {
    return angle / 2 / Math.PI * 360;
  }
  
  function degreesToRadians(angle) {
    return angle * 2 * Math.PI / 360;
  }
  
  function roundToTenths(x) {
    return Math.round(x * 100) / 100;
  }

  
  function distanceBetweenCoords(coord1, coord2) {
    var changeInX = coord2[0] - coord1[0];
    var changeInY = coord2[1] - coord1[1];
    return Math.sqrt(Math.pow(changeInX,2) + Math.pow(changeInY,2));
  }
  
  
  function distanceBetweenCoordsAndMouse(helperCoords) {
    var x1 = helperCoords.x;
    var y1 = helperCoords.y;
    var x2 = (event.clientX - canvasPosition.left) / SCALE * 2;
    var y2 = (event.clientY - canvasPosition.top) / SCALE * 2;
    var d = Math.sqrt(Math.pow((x2 - x1),2)+Math.pow((y2 - y1),2));
    return d;
  }

  ////////// RUN WORLD

  function createWorld(m) {
    bodyObj = {};
    turtleObj = {};
    bindElements();
    var gravity = m[0]
    var range = m[1];
    wrap = m[2];
    totalObjectsCreated = 0;  
    NLOGO_WIDTH = range[0];
    NLOGO_HEIGHT = range[1];
    
    //if ($("#netlogoCanvas").length === 0) { 
    
    //}
    if (canvas === null) {
      canvas = document.getElementsByClassName('netlogo-canvas')[0];
      ctx = canvas.getContext('2d');
    }
    p = $( "#netlogoCanvas").parent();//$( "#netlogoCanvas";
    canvasPosition = p.offset();
    world = new b2World(
          new b2Vec2(gravity[0], gravity[1])    //gravity
       ,  true                 //allow sleep
    );
    if (universe.model) {
      for (var turtleId in universe.model.turtles) {
        turtleObj[turtleId] = universe.model.turtles[turtleId].who;
      }
    }
    setupDebugDraw();
  }

  var lastUpdate = 0;
  
  function runWorld() {
    var currentTime = new Date().getTime();
    if (currentTime - lastUpdate > 300) {
      // run world was called for the first time, after a break
      startWorld();
    }
    lastUpdate = currentTime;
  }

  function startWorld() {
    //console.log("start world");
    if (world) {
        for (id in bodyObj)
        {
          b = bodyObj[id];
          if (b.GetType() == b2Body.b2_dynamicBody || b.GetType() === b2Body.b2_kinematicBody) {
            if (universe.model.turtles[id] != undefined
               && universe.model.turtles[id].xcor != undefined
               && universe.model.turtles[id].ycor != undefined 
               && universe.model.turtles[id].heading != undefined) 
            {
              if (id != -1 && universe.model.turtles && universe.model.turtles[id]) {
                var pos = nlogotobox2d([universe.model.turtles[id].xcor, universe.model.turtles[id].ycor]);
                var posVector = new b2Vec2();
                posVector.x = pos[0];
                posVector.y = pos[1];
                b.SetPosition(posVector);
                var heading = degreesToRadians(universe.model.turtles[id].heading);
                //b.SetTransform(b.GetPosition(), heading);
                b.SetAngle(heading);
              }
            }
          }
          
      }
      window.clearInterval(physicsWorld);      
      physicsWorld = window.setInterval(update, 1000 / 60);
      running = true;
    }
  }
        
  function stopWorld() {
    window.clearInterval(physicsWorld);
    running = false;
  }
  
  function updateBodies() {
    //console.log("update bodies");
    var b;
    universe.repaint();
    //world.triggerUpdate();
    //default 1/60, 10, 10
    world.Step(
           1 / 30   //frame-rate
        ,  10       //velocity iterations
        ,  10       //position iterations
    );
    world.DrawDebugData();
    redrawWorld();
    world.ClearForces();
    for (id in bodyObj)
    {
      b = bodyObj[id];
      if (b.GetType() == b2Body.b2_dynamicBody || b.GetType() === b2Body.b2_kinematicBody) {
        if (wrap[0]) {
          if (b.GetPosition().x * SCALE / 2 > BOX2D_WIDTH) {
            b.SetPosition(new b2Vec2(0,b.GetPosition().y));				
          } 
          if (b.GetPosition().x * SCALE / 2 < 0) {
             b.SetPosition(new b2Vec2(BOX2D_WIDTH / SCALE * 2 , b.GetPosition().y));
          }
        }
        if (wrap[1]) {
          if (b.GetPosition().y * SCALE / 2 > BOX2D_HEIGHT) {
            b.SetPosition(new b2Vec2(b.GetPosition().x, 0));    
          }
          if (b.GetPosition().y * SCALE / 2 < 0) {
            b.SetPosition(new b2Vec2(b.GetPosition().x, BOX2D_HEIGHT / SCALE));
          }
        }
        
        var pos = box2dtonlogo(b.GetPosition());
        //console.log(pos);
        var heading = radiansToDegrees(b.GetAngle());
        //if (id != -1 && universe.model.turtles && universe.model.turtles[id]) {
        //  universe.model.turtles[id].xcor = pos.x;
        //  universe.model.turtles[id].ycor = pos.y;
        //  universe.model.turtles[id].heading = heading;
        //}
        
      } else if (b.GetType() == b2Body.b2_staticBody) {
        //var pos = box2dtonlogo(b.GetPosition());
        //if (id != -1 && universe.model.turtles && universe.model.turtles[id]) {
        //  universe.model.turtles[id].xcor = pos.x;
        //  universe.model.turtles[id].ycor = pos.y;
        //}
      }
    }
    //drawHelperPoints();
  }

  function updateOnce() {
    if (world) {
      updateBodies();
    }
  }
  function update() {
    if (running) {//}&& (currentTime - lastUpdate > 5)) {
      updateBodies();
      if(isMouseDown && (!mouseJoint)) {
        var body = getBodyAtMouse();
        if(body) {
          if (!body.m_userData.selected) {
            for (b = world.GetBodyList() ; b; b = b.GetNext())
            {
              if (b.GetType() == b2Body.b2_dynamicBody)
              {
                if (b.m_userData.selected) {
                  b.m_userData.selected = false;
                }
              }
            }
            body.m_userData.selected = true;
          }
          var md = new b2MouseJointDef();
          md.bodyA = world.GetGroundBody();
          md.bodyB = body;
          md.target.Set(mouseX, mouseY);
          md.collideConnected = true;
          md.maxForce = 300.0 * body.GetMass();
          mouseJoint = world.CreateJoint(md);
          body.SetAwake(true);
        }
      }
      if(mouseJoint) {
        if(isMouseDown) {
          mouseJoint.SetTarget(new b2Vec2(mouseX, mouseY));
        } else {
          world.DestroyJoint(mouseJoint);
          mouseJoint = null;
        }
      }
    }
  };
     
  function getRunning() {
    return running;
  }
        
  
  function redrawWorld() {
    if (world) {
      //updateOnce();
      if (fixtureClick && showAABB) {
        ctx.beginPath();
        ctx.strokeStyle = "red";
        ctx.lineWidth=2;
        //ctx.fillStyle= "rgba(0, 0, 200, 0)";
        pointCoords = fixtureClick;
        pixelCoords = {x: pointCoords.x * SCALE, y: pointCoords.y * SCALE };      
        ctx.arc(pixelCoords.x, pixelCoords.y, 0.25 * SCALE, 0, Math.PI * 2, true); // Outer circl
        //`130ctx.fill();
        ctx.stroke();
      }
      
      //console.log("redraw world");
      var body, bodyCenter, bodyId, bodyCenter, shape, color;
      var fixture;
      
      if (showCenter) {
        for (b in bodyObj) {
          body = bodyObj[b];
          //console.log("here");
          ctx.beginPath();
          ctx.strokeStyle = "blue";
          ctx.lineWidth= 5;
          ctx.fillStyle= "gray";
          pointCoords = body.GetPosition();
          pixelCoords = {x: pointCoords.x * SCALE, y: pointCoords.y * SCALE };
          ctx.arc(pixelCoords.x, pixelCoords.y, 20, 0, Math.PI * 2, true); // Outer circle
          ctx.fill();
          ctx.stroke();
          
          ctx.beginPath();
          ctx.strokeStyle = "purple";
          ctx.lineWidth=5;
          ctx.fillStyle= "orange";
          pointCoords = body.GetWorldCenter();
          pixelCoords = {x: pointCoords.x * SCALE, y: pointCoords.y * SCALE };      
          ctx.arc(pixelCoords.x, pixelCoords.y, 10, 0, Math.PI * 2, true); // Outer circl
          ctx.fill();
          ctx.stroke();
          
        }
      }
      
      for (f in fixtureObj) {
        fixture = fixtureObj[f];
        body = fixture.GetBody();
        bodyCenter = body.GetPosition();
        bodyId = body.GetUserData().id;
        bodyCenter = body.GetPosition();
        shape = fixture.GetUserData().shape;
        fillColor = fixture.GetUserData().fillColor;
        strokeColor = fixture.GetUserData().strokeColor;
        shapeId = fixture.GetUserData().id;
        
        if (showAABB) {
          ctx.beginPath();
          ctx.strokeStyle="white";
          ctx.lineWidth=1;
          var aabb = fixture.GetAABB();
          pixelCoords = {x: aabb.lowerBound.x * SCALE, y: aabb.lowerBound.y * SCALE };
          ctx.moveTo(pixelCoords.x, pixelCoords.y);
          pixelCoords = {x: aabb.lowerBound.x * SCALE, y: aabb.upperBound.y * SCALE };
          ctx.lineTo(pixelCoords.x, pixelCoords.y);
          pixelCoords = {x: aabb.upperBound.x * SCALE, y: aabb.upperBound.y * SCALE };
          ctx.lineTo(pixelCoords.x, pixelCoords.y);
          pixelCoords = {x: aabb.upperBound.x * SCALE, y: aabb.lowerBound.y * SCALE };
          ctx.lineTo(pixelCoords.x, pixelCoords.y);
          ctx.closePath();
          ctx.stroke();
          
        }
        
          ctx.beginPath();
          ctx.lineWidth=5;
          ctx.fillStyle = fillColor;  
          ctx.strokeStyle = strokeColor;
          
          if (shape === "circle") {
            radius = fixture.GetShape().GetRadius();
            localPosition = fixture.GetShape().GetLocalPosition();
            pointCoords = body.GetWorldPoint(localPosition);
            pixelCoords = {x: pointCoords.x * SCALE, y: pointCoords.y * SCALE };
            ctx.arc(pixelCoords.x, pixelCoords.y, radius * SCALE, 0, Math.PI * 2, true); // Outer circle
          } else if (shape === "polygon") {
            fixturePoints = fixture.GetShape().GetVertices();
            ctx.lineWidth=5;
            pointCoords = body.GetWorldPoint(fixturePoints[0]);
            pixelCoords = {x: pointCoords.x * SCALE, y: pointCoords.y * SCALE };
            ctx.moveTo(pixelCoords.x, pixelCoords.y);
            for (var i=1; i < fixturePoints.length; i++) {
              pointCoords = body.GetWorldPoint(fixturePoints[i]);
              pixelCoords = {x: pointCoords.x * SCALE, y: pointCoords.y * SCALE };
              ctx.lineTo(pixelCoords.x, pixelCoords.y);
            }
            ctx.closePath();
          } else if (shape === "line") {
            fixturePoints = fixture.GetShape().GetVertices();
            ctx.lineWidth=5;
            pointCoords = body.GetWorldPoint(fixturePoints[0]);
            pixelCoords = {x: pointCoords.x * SCALE, y: pointCoords.y * SCALE };
            ctx.moveTo(pixelCoords.x, pixelCoords.y);
            for (var i=1; i < fixturePoints.length; i++) {
              pointCoords = body.GetWorldPoint(fixturePoints[i]);
              pixelCoords = {x: pointCoords.x * SCALE, y: pointCoords.y * SCALE };
              ctx.lineTo(pixelCoords.x, pixelCoords.y);
            }
            ctx.closePath();
          }
          if (fillColor != "(none)") { ctx.fill(); }
          if (strokeColor != "(none)") { ctx.stroke(); }
      }
    }
  }
        
  //////// OBJECTS IN WORLD 
        
  function copyBody(bodyId) {
    var newBodyId = bodyId+"-"+totalObjectsCreated;
    //console.log("COPY body from "+bodyId+" "+newBodyId);
    var body = bodyObj[bodyId];
    var bodyType = body.GetType();
    var behavior = (bodyType === 0) ? "static" : (bodyType === 1) ? "ghost" : "dynamic";
    createBody({
      "parentId": newBodyId, 
      "behavior": behavior,
      "box2dCoords": body.GetPosition(),
      "heading": body.GetAngle() 
    });
    return newBodyId;
  }
        
  function createBody(m) {
    console.log("CREATE BODY", m);
    var bodyId = m.bodyId;
    var behavior = m.behavior;
    var nlogoCoords = m.coords;
    var angle = m.angle;
    
    var box2dCoords = m.box2dCoords ? [m.box2dCoords.x, m.box2dCoords.y] : nlogotobox2d(nlogoCoords);
    
    var bodyDef = new b2BodyDef;
    bodyDef.userData = {
      id: bodyId,
      selected: false,
      ghost: false
    }
    switch (behavior) {
      case "static":
        bodyDef.type = b2Body.b2_staticBody;          
        break;
      case "dynamic":
        bodyDef.type = b2Body.b2_dynamicBody;            
        break;
      case "ghost":
        bodyDef.type = b2Body.b2_kinematicBody;
        bodyDef.userData.ghost = true;
        break;
    }
    bodyDef.angle = degreesToRadians(angle);
    bodyDef.position.x = roundToTenths(box2dCoords[0]);
    bodyDef.position.y = roundToTenths(box2dCoords[1]);
    bodyDefObj[bodyId] = bodyDef;
    console.log(bodyDef);
  }
  
  function addBodyToWorld(bodyId) {
    //console.log("ADD BODY TO WORLD "+bodyId);
    bodyObj[bodyId] = world.CreateBody(bodyDefObj[bodyId]);
    //console.log('after');
    totalObjectsCreated++;
  }
  
  /*
  function addBodyToWorld(currentBodyId, newBodyId) {
    console.log("ADD BODY TO WORLD "+currentBodyId+" "+newBodyId);
    if (currentBodyId === newBodyId) {
      bodyId = currentBodyId;
    } else {
      // take everything from the old body, and put it into the new body
      var body = bodyObj[currentBodyId];
      
      var f = body.GetFixtureList();
      var fixtureIds = [];
      while (f.GetNext()) {
        fixtureIds.push(f.GetUserData().x);
        f = f.GetNext();
      }
      for (var g=0; g<fixtureIds.length; g++) {
        fixtureId = fixtureIds[g];
        removeFixtureFromBody(fixtureId);
        addFixtureToBody({fixtureId: fixtureId, bodyId: newBodyId});
      }
      bodyDefObj[currentBodyId].userData.id = newBodyId;
      bodyDefObj[newBodyId] = bodyDefObj[currentBodyId];
      bodyId = newBodyId;
    }
    bodyObj[bodyId] = world.CreateBody(bodyDefObj[bodyId]);
    
    if (!targetObj[bodyId]) {
      targetObj[bodyId] = [];
    }
    targetObj[bodyId].push({targetId: "target-"+totalObjectsCreated, coords: bodyObj[bodyId].GetPosition(), bodyId: bodyId});
    //helperTargets.push({bodyId: bodyId, color: "white", coords: bodyObj[bodyId].GetPosition()})

    totalObjectsCreated++;
    
    
  }*/
  
  function deleteBody(bodyId) {
    //console.log("DELETE BODY "+bodyId);
    var body = bodyObj[bodyId];
    var f = bodyObj[bodyId].GetFixtureList();
    
      if (f != null) {
      var fixtureList = [];
      fixtureList.push(f.GetUserData().id);
      while (f.GetNext()) {
        f = f.GetNext();
        fixtureList.push(f.GetUserData().id);
      }
      for (var g=0; g<fixtureList.length; g++) {
        deleteFixture(fixtureList[g]);
      }
    }
    bodyObj[bodyId].GetWorld().DestroyBody(bodyObj[bodyId]);
    delete bodyObj[bodyId];
    universe.repaint();
    world.DrawDebugData();
  }
  
  function deleteFixture(fixtureId) {
    //console.log("DELETE FIXTURE "+fixtureId);
    var body = fixtureObj[fixtureId].GetBody();
    var f = body.GetFixtureList();
    if (f.GetUserData().id === fixtureId) { 
       body.DestroyFixture(f); 
    } else {
      while (f.GetNext()) {
        f = f.GetNext();
        if (f.GetUserData().id === fixtureId) { body.DestroyFixture(f); console.log("destroy"+fixtureId); break;}
      }
    }    
    delete fixDefObj[fixtureId];
    delete fixtureObj[fixtureId];
    universe.repaint();
    world.DrawDebugData();
  }
  
  
  //Physicsb2.updateGroup({
  //  "parentId": name,
  //  "objects": objects 
  //});
  function updateGroup(m) {
    //console.log("updated body "+m.parentId);
    //console.log("new fixtures ",m.objects);
    var bodyId = m.parentId;
    var objects = m.objects;
    var fixture;
    var body;
    var parentId;
    var fixtureId;
    var bodyDef;
    var fixDef;
    var currentBodyId;
    //console.log('a');
    var f = bodyObj[bodyId].GetFixtureList();
    var fixtureIds = [];
    fixtureIds.push(f.GetUserData().id);
    while (f.GetNext()) {
      f = f.GetNext();
      fixtureIds.push(f.GetUserData().id);
    }
    //console.log("are there fewer objects in new group list, than of fixtures in body");
    //console.log(objects.length + " " + fixtureIds.length);
    if (!bodyObj[bodyId]) {
      //console.log('a');
      var firstBodyId = fixtureObj[objects[0]].GetBody().GetUserData().id;
      addBodyToWorld(firstBodyId, bodyId);
    } else if (objects.length < fixtureIds.length) {
      //console.log("need to remove an object);")
      ///console.log('b');
      if (objects.length < fixtureIds.length) {
        //remove extra object 
        for (var a=0; a<fixtureIds.length; a++) {
          //console.log("is "+fixtureIds[a]+" inside ");
          //console.log(objects);
          if (objects.indexOf(fixtureIds[a]) === -1) {
            //console.log('yes');
            //console.log("remove "+fixtureIds[a]);
            removeFixtureFromBody(fixtureIds[a]);
            //addBodyToWorld(bodyId, bodyId+"-"+totalObjectsCreated); 
            //addFixtureToBody({fixtureId: fixtureIds[a], bodyId: bodyId+"-"+totalObjectsCreated });

            //removeFixtureFromBody(fixtureId);
            //addFixtureToBody({fixtureId: fixtureId, bodyId: newBodyId});


            break;
          }
        }
      }
      
    } else {
      //console.log('c');
      //console.log("need to add object");
      for (var i=0; i<objects.length; i++) {
        fixture = fixtureObj[objects[i]];
        if (fixture && bodyObj[bodyId]) {
          //console.log('d');
          fixtureId = fixture.GetUserData().id;
          fixture = fixtureObj[fixtureId]; 
          body = fixture.GetBody();
          currentBodyId = body.GetUserData().id;
          if (currentBodyId != bodyId) {
            //console.log('e');
            fixDef = fixDefObj[fixtureId];
            removeFixtureFromBody(fixtureId);
            addFixtureToBody({fixtureId: fixtureId, bodyId: bodyId});
          } 
        }
      }

      
      
      
    }
    //console.log("if something in the object list already exists in body, then remove it");
  }
  
  function updateBodyPosition(bodyId) {
    var position = bodyObj[bodyId].GetPosition();
    var center = bodyObj[bodyId].GetWorldCenter();
    var offset = {};
    offset.x = position.x - center.x;
    offset.y = position.y - center.y;
    universe.repaint();
    world.DrawDebugData();
    bodyObj[bodyId].SetPosition(center);
    var f = bodyObj[bodyId].GetFixtureList();
    var fixtureList = [];
    fixtureList.push(f);
    while (f.GetNext()) {
      f = f.GetNext();
      fixtureList.push(f);
    }
    var fixture;
    var shape;
    var vertices;
    var point;
    var newVertices;
    
    for (var g=0; g<fixtureList.length; g++) {
      fixture = fixtureList[g];
      shape = fixture.GetUserData().shape;
      if (shape === "circle") {
        point = fixture.GetShape().GetLocalPosition();
        
        
        
        point.x = point.x + offset.x;
        point.y = point.y + offset.y;
        fixture.GetShape().SetLocalPosition(point);
      } else if (shape === "line" || shape === "polygon") {
        vertices = fixture.GetShape().GetVertices();
        newVertices = [];
        for (var h=0; h<vertices.length; h++) {
          point = vertices[h];
          point.x = point.x + offset.x;
          point.y = point.y + offset.y;
          newVertices.push(point);
        }
        fixture.GetShape().SetAsArray(newVertices, newVertices.length);
      }
    }
  }
  
  function removeFixtureFromBody(fixtureId) {
    
    if (fixtureObj[fixtureId]) {
    
      var body = fixtureObj[fixtureId].GetBody();
      var bodyId = body.GetUserData().id;
      //console.log("REMOVE "+fixtureId+" from "+bodyId);
      bodyObj[bodyId].DestroyFixture(fixtureObj[fixtureId]);
      //console.log(bodyObj[bodyId]);
      if (!bodyObj[bodyId].GetFixtureList()) {
        deleteBody(bodyId);
      } else {
        //console.log("using "+fixtureId+" "+bodyId);
        var newBodyId = copyBody(bodyId);
        //console.log("1",getAllBodies());
        addBodyToWorld(newBodyId, newBodyId);
        
        //console.log("2",getAllBodies());
        //var newFixtureId = copyFixture(fixtureId);
        addFixtureToBody({fixtureId: fixtureId,bodyId:newBodyId});
        
        //console.log("3",getAllBodies());
        updateBodyPosition(bodyId);
      }
    }
      
  }
  
  function addFixtureToBody(m) {
    var fixtureId = m.shapeId;
    var bodyId = m.bodyId;
    var fixDef = fixDefObj[fixtureId];
    if (bodyObj[bodyId].GetUserData().ghost) {
      fixDef.filter.groupIndex = -1;
    }
    var shape = fixDef.userData.shape;
    var coords = fixDef.userData.coords;
    var offsetX = bodyObj[bodyId].GetPosition().x;
    var offsetY = bodyObj[bodyId].GetPosition().y;
    if (shape === "circle") {
      fixDef.shape.SetLocalPosition(
        new b2Vec2(roundToTenths(coords[0][0] - offsetX), roundToTenths(coords[0][1] - offsetY)),
        new b2Vec2(roundToTenths(coords[1][0] - offsetX), roundToTenths(coords[1][1] - offsetY)));
    } else if (shape === "line") {
      
      
      //fixDef.shape.SetAsEdge(
      //  new b2Vec2(roundToTenths(coords[0][0] - offsetX), roundToTenths(coords[0][1] - offsetY)),
      //  new b2Vec2(roundToTenths(coords[1][0] - offsetX), roundToTenths(coords[1][1] - offsetY)));
        
        var v1 = new b2Vec2(roundToTenths(coords[0][0] - offsetX), roundToTenths(coords[0][1] - offsetY));
        var v2 = new b2Vec2(roundToTenths(coords[1][0] - offsetX), roundToTenths(coords[1][1] - offsetY));

        var vertices = [v1, v2];
        
        //console.log("creating line", vertices);
        fixDef.shape.SetAsArray(vertices, vertices.length);
        

        
        
    } else if (shape === "polygon") {
      var vertices = [];
      for (var i=coords.length-1;i>=0;i--){
        vertices.push(new b2Vec2(roundToTenths(coords[i][0] - offsetX), roundToTenths(coords[i][1] - offsetY)))
      }
      //console.log("creating polygon", vertices);
      fixDef.shape.SetAsArray(vertices,vertices.length);
    }
    var firstObj = (bodyObj[bodyId].GetFixtureList() === null) ? true : false;
    bodyObj[bodyId].CreateFixture(fixDef);
    //save the fixture in fixtureObj
    var f = bodyObj[bodyId].GetFixtureList();
    var fixture;
    if (f.GetUserData().id === fixtureId) { fixture = f; }
    while (f.GetNext()) {
        if (f.GetUserData().id === fixtureId) { fixture = f; }
        f = f.GetNext();
    }
    fixtureObj[fixtureId] = fixture;
    redrawWorld();
    drawHelperPoints();
    
    
    
    if (!firstObj) { updateBodyPosition(bodyId); }
  }
  
  function updateFixture(fixtureId, key, value) {
    if (fixtureId === null) {
      fixtureId = selectedFixture.GetUserData().id;
    } 
    var fixture = fixtureObj[fixtureId];
    switch (key) {
      case "color":
        var userData = fixture.GetUserData();
        userData.fillColor = value;
        userData.defaultFillColor = value;
        fixtureObj[fixtureId].SetUserData(userData);
        break;
      case "density":
        fixture.SetDensity(value);
        break;
      case "friction":
        fixture.SetFriction(value);
        break;
      case "density":
        fixture.SetRestitution(value);
        break;
      case "shapeId":
        fixture.GetUserData().id = value;
        fixDefObj[value] = fixDefObj[fixtureId];
        delete fixDefObj[fixtureId];
        fixtureObj[value] = fixtureObj[fixtureId];
        delete fixtureObj[fixtureId];
        break;
      case "bodyIdShapeMode": 
        var newBodyId = value;
        if (!bodyObj[value]) {
          newBodyId = "body-"+totalObjectsCreated;
          var bodyId = fixture.GetBody().GetUserData().id;
          var body = bodyObj[bodyId];
          var coords = [body.GetPosition().x, body.GetPosition().y ];
          var bodyType = body.GetType();
          var behavior = (bodyType === 0) ? "static" : (bodyType === 1) ? "ghost" : "dynamic";
          createBody({
            "bodyId": newBodyId, 
            "behavior": behavior, 
            "box2dCoords": coords,
            "angle": body.GetAngle()
          });
          addBodyToWorld(newBodyId);
        } 
        var body = fixtureObj[fixtureId].GetBody();
        var f = body.GetFixtureList();
        if (f.GetUserData().id === fixtureId) { 
           body.DestroyFixture(f); 
        } else {
          while (f.GetNext()) {
            f = f.GetNext();
            if (f.GetUserData().id === fixtureId) { body.DestroyFixture(f); console.log("destroy"+fixtureId); break;}
          }
        } 
        bodyObj[newBodyId].CreateFixture(fixDefObj[fixtureId]);
        var f = bodyObj[newBodyId].GetFixtureList();
        var fixture2;
        if (f.GetUserData().id === fixtureId) { fixture2 = f; }
        while (f.GetNext()) {
            if (f.GetUserData().id === fixtureId) { fixture2 = f; }
            f = f.GetNext();
        }
        fixtureObj[fixtureId] = fixture2;
        break;
    }
    universe.repaint();
    world.DrawDebugData(); 
    redrawWorld();
    drawHelperPoints();
  }
  
  function updateBody(bodyId, key, value) {
    console.log(key+","+value);
    var body;
    if (bodyId === null) {
      bodyId = selectedFixture.GetBody().GetUserData().id;
    } 
    body = bodyObj[bodyId];
    //console.log(body);
    switch (key) {
      case "angle":
        var angle = parseFloat($("#physicsSettings #angle").val()) || 0;
        body.SetAngle(angle);
        break;
      case "objectType":
        if (value.indexOf[0,1,2] > -1) {
          value = 0;
        }
        body.SetType(value);
        break;
      case "bodyIdBodyMode": 
        var newBodyId = value;
        console.log("change name to "+newBodyId);
        var bodyId = body.GetUserData().id;
        body.GetUserData().id = newBodyId;
        bodyObj[newBodyId] = bodyObj[bodyId];
        delete bodyObj[bodyId];
        break;
    }
    universe.repaint();
    world.DrawDebugData(); 
    createHelperLines("limegreen"); 
    //drawHelperArc();
    //redrawWorld();
  }
  
  function createFixture(m) {
    console.log("CREATE FIXTURE",m);
    var shapeId = m.shapeId;
    //var bodyA = m.parentId;
    var box2dCoords = m.box2dCoords ? [m.box2dCoords.x, m.box2dCoords.y] : nlogotobox2d(m.coords);

    var shape = m.typeOfShape;
    var density = m.density;
    var friction = m.friction;
    var restitution = m.restitution;
    var color = m.color;
    var box2dFixtureCoords = [];
    var radius = m.radius;

    if (m.vertices) {
      var nlogoFixtureCoords = m.vertices;
      for (let coord of nlogoFixtureCoords) {
        box2dFixtureCoords.push(nlogotobox2d(coord));  
      }
    } else if (m.box2dVertices) {
      
      for (let coord of m.box2dVertices) {
        box2dFixtureCoords.push([coord.x, coord.y]);  
      }
    }
    var fixDef = new b2FixtureDef;
    var fixture;
    fixDef.density = density;
    fixDef.friction = friction;
    fixDef.restitution = restitution;
    fixDef.userData = {
      id: shapeId,
      shape: shape,
      coords: box2dFixtureCoords,
      fillColor: color,
      strokeColor: "(none)",
      defaultFillColor: color
    }
    if (shape === "circle") {
      var distance = (distanceBetweenCoords(box2dFixtureCoords[0], box2dFixtureCoords[1]));
      fixDef.shape = new b2CircleShape();
      fixDef.shape.SetRadius(distance);
    } else if (shape === "line") {
      fixDef.shape = new b2PolygonShape();
      //console.log(box2dFixtureCoords);
      //createHelperDot({"shapeId":shapeId, "pointsList": box2dFixtureCoords});
      //drawHelperDots();
    } else if (shape === "polygon") {
      fixDef.shape = new b2PolygonShape(); 
    }
    //console.log(fixDef);
    fixDefObj[shapeId] = fixDef;
  }
  

  
  function addTargetToBody(m) {
    console.log("add target to body");
    var id = m.id;
    var bodyA = m.bodyA;
    var coords = m.coords;
    applyForce(m);
  }
  
  function addDistanceJointToBody(m) {
    var id = m[0];
    var bodyA = m[1];
    var bodyB = m[2];
    var coords = m[3];
    var collideConnected = m[4];
    var coordsA = nlogotobox2d(coords[0]);
    var coordsB = nlogotobox2d(coords[1]);
    var bodyAOffsetX = bodyObj[bodyA].GetPosition().x;
    var bodyAOffsetY = bodyObj[bodyA].GetPosition().y;
    var bodyBOffsetX = bodyObj[bodyB].GetPosition().x;
    var bodyBOffsetY = bodyObj[bodyB].GetPosition().y;
    //console.log("addDistanceJointToBody "+id+" "+bodyA+" "+bodyB+" "+coords+" "+collideConnected);
    var joint = new b2DistanceJointDef();
    joint.Initialize(bodyObj[bodyA], bodyObj[bodyB], 
      new b2Vec2(roundToTenths(coordsA[0]), roundToTenths(coordsA[1])), 
      new b2Vec2(roundToTenths(coordsB[0]), roundToTenths(coordsB[1])));  
    joint.collideConnected = (collideConnected === true) ? true : false;
    world.CreateJoint(joint);
  }
  
  function addRevoluteJointToBody(m) {
    var id = m[0];
    var bodyA = m[1];
    var bodyB = m[2];
    var coords = m[3];
    var collideConnected = m[4];
    var coordsA = nlogotobox2d(coords[0]);
    var bodyAOffsetX = bodyObj[bodyA].GetPosition().x;
    var bodyAOffsetY = bodyObj[bodyA].GetPosition().y; 
    var joint = new b2RevoluteJointDef();
    joint.Initialize(bodyObj[bodyA], bodyObj[bodyB], 
      new b2Vec2(roundToTenths(coordsA[0]), roundToTenths(coordsA[1]))); 
    joint.collideConnected = (collideConnected === true) ? true : false;
    world.CreateJoint(joint);
  }
  
  function addPrismaticJointToBody(m) {
    var id = m[0];
    var bodyA = m[1];
    var bodyB = m[2];
    var coords = m[3];
    var collideConnected = m[4];
    var coordsA = nlogotobox2d(coords[0]);
    var coordsB = nlogotobox2d(coords[1]);
    var bodyAOffsetX = bodyObj[bodyA].GetPosition().x;
    var bodyAOffsetY = bodyObj[bodyA].GetPosition().y;
    var bodyBOffsetX = bodyObj[bodyB].GetPosition().x;
    var bodyBOffsetY = bodyObj[bodyB].GetPosition().y;
    //console.log("addPrismaticJointToBody "+id+" "+bodyA+" "+bodyB+" "+coords);
    var joint = new b2PrismaticJointDef();
    joint.Initialize(bodyObj[bodyA], bodyObj[bodyB], 
      new b2Vec2(roundToTenths(coordsA[0]), roundToTenths(coordsA[1])), 
      new b2Vec2(roundToTenths(coordsB[0]), roundToTenths(coordsB[1])));   
    joint.collideConnected = (collideConnected === true) ? true : false;
    //console.log(joint);
    world.CreateJoint(joint);
  }

  
  ///////// FORCES IN WORLD
  
  function applyForce(m) {

    var id, bodyA, coords, heading, amount, radians;
    var amount = m.force;
    radians = degreesToRadians(m.angle);
    for (body in bodyObj) {
      b = bodyObj[body];
      coords = b.GetWorldCenter();
      b.ApplyForce(
        {x:roundToTenths(Math.cos(radians)*amount), y:roundToTenths(Math.sin(radians)*amount)}, 
        new b2Vec2(roundToTenths(coords.x), roundToTenths(coords.y)) );
    }
  }
  
  function applyLinearImpulse(m) {
    var id = m[0];
    var bodyA = m[1];
    var coords = m[2];
    var heading = m[3];
    var amount = m[4] * 50;
    var coordsA = nlogotobox2d(coords);
    var radians = degreesToRadians(heading);
    bodyObj[bodyA].ApplyImpulse(
      {x:Math.cos(radians)*amount, y:Math.sin(radians)*amount}, 
      new b2Vec2(roundToTenths(coordsA[0]), roundToTenths(coordsA[1])) );
  }
  
  function applyTorque(m) {
    var bodyA = m[0];
    var amount = m[1] * 40;
    bodyObj[bodyA].ApplyTorque(amount); 
  }
  
  function applyAngularImpulse(m) {
    var bodyA = m[0];
    var amount = m[1] * 5;
    bodyObj[bodyA].ApplyAngularImpulse(amount);      
  }





  function setupDebugDraw() {
    if (world) {
      //setup debug draw
      //console.log("setup debug draw");
      var debugDraw = new b2DebugDraw();
       debugDraw.SetSprite(document.getElementById("netlogoCanvas").getContext("2d"));
       debugDraw.SetDrawScale(30.0);
       debugDraw.SetFillAlpha(0.3);
       debugDraw.SetLineThickness(1.0);
       debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
       world.SetDebugDraw(debugDraw);
     }
  }

   function getBodyAtMouse() {
     console.log("get body at mouse");
     mousePVec = new b2Vec2(mouseX, mouseY);
     var aabb = new b2AABB();
     aabb.lowerBound.Set(mouseX - 0.25, mouseY - 0.25);
     aabb.upperBound.Set(mouseX + 0.25, mouseY + 0.25);
     selectedBody = null;
     world.QueryAABB(getBodyCB, aabb);
     return selectedBody;
   }
   
   function getFixtureAtMouse() {
     console.log("get fixture at mouse");// line, circle, polygon
     mousePVec = new b2Vec2(mouseX, mouseY);
     var aabb = new b2AABB();
     //aabb.lowerBound.Set(mouseX - 0.001, mouseY - 0.001);
     //aabb.upperBound.Set(mouseX + 0.001, mouseY + 0.001);
     aabb.lowerBound.Set(mouseX - 0.25, mouseY - 0.25);
     aabb.upperBound.Set(mouseX + 0.25, mouseY + 0.25);
     selectedFixture = null;
     
     fixtureClick = {x: mouseX, y: mouseY}; 
     
     world.QueryAABB(getFixtureCB, aabb);
     
     /*if (!selectedFixture) {
       aabb.lowerBound.Set(mouseX - 0.2, mouseY - 0.2);
       aabb.upperBound.Set(mouseX + 0.2, mouseY + 0.2);
       world.QueryAABB(getFixtureCB, aabb);
       if (selectedFixture) {
         console.log("0.2 "+selectedFixture.GetUserData().shape);
         if (selectedFixture.GetUserData().shape != "line") { selectedFixture = null; }
       } else {
         aabb.lowerBound.Set(mouseX - 0.8, mouseY - 0.8);
         aabb.upperBound.Set(mouseX + 0.8, mouseY + 0.8);
         world.QueryAABB(getFixtureCB, aabb);
         if (selectedFixture) {
           console.log("0.8 "+selectedFixture.GetUserData().shape);
         }
         if (selectedFixture && selectedFixture.GetUserData().shape != "line") { selectedFixture = null; }
       }
     }*/
     return selectedFixture;
   }
  
  
  
  
   function getPointAtMouse() {
     var smallestDistance = undefined;
     var d;
     var closestPoint = undefined;
     for (var j=0; j<helperPoints.length; j++) {
       d = distanceBetweenCoordsAndMouse(helperPoints[j].coords);
       if (smallestDistance === undefined) {smallestDistance = d; closestPoint = j;}
       else if ( smallestDistance > d) {
         smallestDistance = d;
         closestPoint = j;
       }
     }
     //console.log("smallest distance", smallestDistance);
     if (smallestDistance < 1) {
       for (var i=0; i<helperPoints.length; i++) {
         if (i != closestPoint) {
            helperPoints[i].color = "white";
         }
       }
       helperPoints[closestPoint].color = "yellow";
       helperPointDragged = helperPoints[closestPoint];
       drawHelperPoints();
       return helperPoints[closestPoint];
     } else {
       return null;
     }
   }
   
   function getTargetAtMouse() {
     //console.log("get target at mouse");
     var smallestDistance = undefined;
     var d;
     var closestTarget = undefined;
     for (var j=0; j<helperTargets.length; j++) {
       d = distanceBetweenCoordsAndMouse(helperTargets[j].coords);
       if (smallestDistance === undefined) {smallestDistance = d; closestTarget = j;}
       else if ( smallestDistance > d) {
         smallestDistance = d;
         closestTarget = j;
       }
     }
     if (smallestDistance < 1) {
       for (var i=0; i<helperTargets.length; i++) {
         if (i != closestTarget) {
            helperTargets[i].color = "gray";
         }
       }
       helperTargets[closestTarget].color = "blue";
       helperTargetDragged = helperTargets[closestTarget];
       drawHelperTargets();
       return helperTargets[closestTarget];
     } else {
       return null;
     }
   }
   
   /*
   function getDotAtMouse() {
     console.log("get dot at mouse");
     console.log(helperDots);
     var smallestDistance = undefined;
     var d;
     var closestDot = undefined;
     for (var j in helperDots) {
       console.log(helperDots[j]);
       d = distanceBetweenCoordsAndMouse(helperDots[j].coords);
       console.log("d",d);
       if (smallestDistance === undefined) {smallestDistance = d; closestDot = j;}
       else if ( smallestDistance > d) {
         smallestDistance = d;
         closestDot = j;
       }
     }
     console.log("smallest distance", smallestDistance);
     if (smallestDistance < 1) {
       for (var i in helperDots) {
         if (i != closestDot) {
            helperDots[i].color = "gray";
         }
       }
       helperDots[closestDot].color = "yellow";
       helperDotDragged = helperDots[closestDot];
       drawHelperDots();
       //selectedFixture = fixtureObj[closestDot];
       
       return helperDots[closestDot];
     } else {
       return null;
     }
   }*/
   
   function getArcAtMouse() {
     //console.log("get arc at mouse");
     d = distanceBetweenCoordsAndMouse(helperArc);
     if (d < 0.5) {
       return true;
     } else { 
       return false;
     }
   }
     
   function getBodyCB(fixture) {
     if(fixture.GetShape().TestPoint(fixture.GetBody().GetTransform(), mousePVec)) {
         selectedBody = fixture.GetBody();
         return false;
     }
     return true;
   }
   
   function getFixtureCB(fixture) {
     
     //console.log(fixture);
     
     selectedFixture = fixture;
     
     
     if(fixture.GetShape().TestPoint(fixture.GetBody().GetTransform(), mousePVec)) {
         selectedFixture = fixture;
         return false;
     }
     //selectedFixture = fixture;
     return true;
   }
   
   /////////// EVENTS
   
    function handleMove() {   
      var vertices;
      var tempHelperPoint, newVertices;
      var center;
      var mode = Physics.getDrawButtonMode();
      fixtureClick =null;
      if (mode === "group") {
        universe.repaint();
        //updateWorld();
        world.DrawDebugData(); 
        if (arcDragged) {
          drawHelperArc();
          $("#physicsSettings #angle").val(parseInt(radiansToDegrees(selectedBody.GetAngle())+180 ));
        } else {
          if (bodyDragged != null) {
            var center = {x: bodyDragged.offset.x + mouseX, y: bodyDragged.offset.y + mouseY };
            bodyDragged.body.SetPosition(center);
            createHelperArc();
          }
        }
      } else if (mode === "drag") {
        universe.repaint();
        //updateWorld();
        
        if (selectedFixture) {
          var center = selectedFixture.GetBody().GetPosition();
          selectedFixture.GetBody().SetPosition(center);
        }

        world.DrawDebugData(); 
        if (pointDragged != null) {
          helperPoints[pointDragged.fixtureIndex].coords.x = mouseX;
          helperPoints[pointDragged.fixtureIndex].coords.y = mouseY;
          helperPoints[pointDragged.fixtureIndex].pixelCoords.x = mouseX * SCALE;
          helperPoints[pointDragged.fixtureIndex].pixelCoords.y = mouseY * SCALE;
          if (pointDragged.shape === "circle") {
            var localCenter = selectedFixture.GetShape().GetLocalPosition();
            var absoluteCenter = bodyObj[pointDragged.bodyId].GetWorldPoint(localCenter);
            var radius = distanceBetweenCoordsAndMouse(absoluteCenter);
            selectedFixture.GetShape().SetRadius(radius);
          } else if (pointDragged.shape === "polygon") {
            var vertices = selectedFixture.GetShape().GetVertices();
            var absolutePoint = new b2Vec2();
            absolutePoint.x = helperPoints[pointDragged.fixtureIndex].coords.x;
            absolutePoint.y = helperPoints[pointDragged.fixtureIndex].coords.y;
            var newVertex = bodyObj[pointDragged.bodyId].GetLocalPoint(absolutePoint);
            vertices[pointDragged.fixtureIndex] = newVertex;
            selectedFixture.GetShape().SetAsArray(vertices, vertices.length);
          } else if (pointDragged.shape === "line") {
            var vertices = selectedFixture.GetShape().GetVertices();
            var absolutePoint = new b2Vec2();
            absolutePoint.x = helperPoints[pointDragged.fixtureIndex].coords.x;
            absolutePoint.y = helperPoints[pointDragged.fixtureIndex].coords.y;
            var newVertex = bodyObj[pointDragged.bodyId].GetLocalPoint(absolutePoint);
            vertices[pointDragged.fixtureIndex] = newVertex;

            selectedFixture.GetShape().SetAsArray(vertices, vertices.length);
            //selectedFixture.GetShape().SetAsEdge(vertices[0], vertices[1]);
          }
          drawHelperPoints();
        } else if (bodyDragged != null) {
          var center = {x: bodyDragged.offset.x + mouseX, y: bodyDragged.offset.y + mouseY };
          bodyDragged.body.SetPosition(center);
          //bodyDragged.body.SetWorldCenter(center);
          if (selectedFixture) { createHelperPoints(selectedFixture); }
        }
      }

      redrawWorld();
    }

   
   function handleMouseClick() {
     console.log("handle mouse click");
     var mode = Physics.getDrawButtonMode();
     if (mode === "drag") {
       if (!selectedFixture) {
         clearAllHelperPoints();
         $("#physicsSettings").addClass("hidden");
       }
        var fixture = getFixtureAtMouse();
        if (fixture) {
          $("#physicsSettings").removeClass("hidden");//.css("display","inline-block");
          $("#groupModeSettings").addClass("hidden");
          $("#dragModeSettings").removeClass("hidden");//.css("display","inline-block");
          $("#targetModeSettings").addClass("hidden");
          $("#physicsSettings #shapeId").val(fixture.GetUserData().id);
          $("#physicsSettings #density").val(fixture.GetDensity());
          $("#physicsSettings #restitution").val(fixture.GetRestitution());
          $("#physicsSettings #friction").val(fixture.GetFriction());
          var bodyId = fixture.GetBody().GetUserData().id;
          var b;
          $("#bodyIdShapeMode").html("");
          for (var b in bodyObj) {
            if (bodyId === b) {
                $('#bodyIdShapeMode').append("<option value="+b+" selected='selected'>"+b+"</option>");
            } else {
              $('#bodyIdShapeMode').append("<option value="+b+">"+b+"</option>");
            }
          }
          $('#bodyIdShapeMode').append("<option value='new'>new</option>");
          var color = fixture.GetUserData().fillColor;
          if (["(none)","#ff000032","#ffa50032","#ffff0032","#00ff0032","#0000ff32","#80008032"].indexOf(color) < 0) {
            $("#physicsSettings #color").val("(other)");
          } else {
            $("#physicsSettings #color").val(color);
          }
          $("#shapeId").val(fixture.GetUserData().id);
          createHelperPoints(fixture);
        } 
        universe.repaint();
        //updateOnce();
        world.DrawDebugData(); 
        redrawWorld();
        drawHelperPoints();
     } else if (mode === "group") {
       //var body = getBodyAtMouse();
       var fixture = getFixtureAtMouse();
       if (fixture) {
         var body = fixture.GetBody();
         if (body) {
           $("#physicsSettings").removeClass("hidden");//.css("display","inline-block");
           $("#dragModeSettings").addClass("hidden");
           $("#targetModeSettings").addClass("hidden");
           $("#groupModeSettings").removeClass("hidden");//.css("display","inline-block");
           $("#physicsSettings #bodyIdBodyMode").val(body.GetUserData().id);
           $("#physicsSettings #angle").val(body.GetAngle());
           $("#physicsSettings .objectType").val(body.GetType());
           clearAllHelperLines(); 
           createHelperLines("limegreen");
           redrawWorld();
           createHelperArc();
         }
       }
     } else if (mode === "target") {
       var target = getTargetAtMouse(); 
       //var body = getBodyAtMouse();
       var fixture = getFixtureAtMouse();
       var body = fixture.GetBody();
       if (target) {
         $("#physicsSettings .objectId").val(target.targetId);
         clearAllHelperLines();
         selectedBody = bodyObj[target.bodyId];
         createHelperLines("limegreen");
       } else {
         if (body) {
           $("#physicsSettings").removeClass("hidden");//.css("display","inline-block");
           $("#dragModeSettings").addClass("hidden");
           $("#groupModeSettings").addClass("hidden");
           $("#targetModeSettings").removeClass("hidden");//.css("display","inline-block");
           var bodyId = body.GetUserData().id;
           var b;
           $("#bodyId2").html("");
           for (var b in bodyObj) {
             if (bodyId === b) {
                 $('#bodyId2').append("<option value="+b+" selected='selected'>"+b+"</option>");
             } else {
               $('#bodyId2').append("<option value="+b+">"+b+"</option>");
             }
           }
           clearAllHelperLines(); 
           createHelperLines("limegreen");
           createHelperTargets();
           redrawWorld();
         }
       }
     } else if (mode === "line" || mode === "circle" || mode === "triangle") {
       mouseX = (event.clientX - canvasPosition.left) / SCALE * 2;
       mouseY = (event.clientY - canvasPosition.top) / SCALE * 2;
       var bodyId = "body-"+totalObjectsCreated;
       var shapeId = mode+"-"+totalObjectsCreated;
       createBody({
         "bodyId": bodyId, 
         "behavior": "dynamic", 
         "box2dCoords": {x: mouseX, y: mouseY}, 
         "angle": 0
       });
       addBodyToWorld(bodyId);
       
       if (mode === "line") {
         createFixture({
           "shapeId": shapeId, 
           "box2dCoords": {x: mouseX, y: mouseY}, 
           "box2dVertices": [{x: mouseX - 2, y: mouseY},{x: mouseX + 2, y: mouseY}], 
           "typeOfShape": "line", 
           "density": 0.5,
           "friction": 0.5,
           "restitution": 0.5,
           "color": "(none)",
         });  
       } else if (mode === "circle") {
         createFixture({
           "shapeId": shapeId, 
           "box2dCoords": {x: mouseX, y: mouseY}, 
           "box2dVertices": [{x: mouseX - 0.5, y: mouseY},{x: mouseX + 0.5, y: mouseY}], 
           "typeOfShape": "circle", 
           "density": 0.5,
           "friction": 0.5,
           "restitution": 0.5,
           "color": "(none)",
           "radius": 1
         });  
       } else if (mode === "triangle") {
         createFixture({
           "shapeId": shapeId, 
           "box2dCoords": {x: mouseX, y: mouseY}, 
           "box2dVertices": [{x: mouseX, y: mouseY + 2},{x: mouseX, y: mouseY - 2}, {x: mouseX - 2, y: mouseY}], 
           "typeOfShape": "polygon", 
           "density": 0.5,
           "friction": 0.5,
           "restitution": 0.5,
           "color": "(none)",
         });  
       }
       addFixtureToBody({
         "shapeId": shapeId, 
         "bodyId": bodyId, 
       });  
       //selectedFixture = fixtureObj[shapeId];
       universe.repaint();
       world.DrawDebugData();
       redrawWorld();
       //createHelperPoints();
     }
   }
   
   function handleMouseDown() {
     console.log("handle mouse down");
     var coords;
     var body;
     var fixture;
     var mode = Physics.getDrawButtonMode();
     //createHelperLines();
     universe.repaint();
     //updateOnce();
     world.DrawDebugData(); 

     fixture = getFixtureAtMouse();

     if (mode === "drag" || mode === "group") {
       //dotDragged = getDotAtMouse();
       //if (dotDragged) {
      //   fixture = fixtureObj[dotDragged.shapeId];
      //   selectedFixture = fixture;
       //}
     }
     
     if (mode === "drag") {
       //arcDragged = getArcAtMouse();
        //if (!arcDragged) {
          pointDragged = getPointAtMouse();
          if (pointDragged === null) {
            console.log("mouse down");
           //fixture = getFixtureAtMouse();
           if (fixture!= null) {
             bodyDragged = {};
             body = fixture.GetBody();
             bodyDragged.body = body;
             var center = bodyDragged.body.GetPosition();
             mouseX = (event.clientX - canvasPosition.left) / SCALE * 2;
             mouseY = (event.clientY - canvasPosition.top) / SCALE * 2;
             bodyDragged.offset = {x: center.x - mouseX, y:center.y - mouseY};
             createHelperPoints(fixture);
             //clearAllHelperLines(); 
             //if (!$.isEmptyObject(bodyDragged)) {  
            //   selectedBody = bodyDragged.body;
          //     clearAllHelperLines();
        //       createHelperLines("limegreen"); 
               redrawWorld();
             //}
           } 
        // }
       }
     } 
     
     if (mode === "group") {
      prevSelectedBody = selectedBody;
      prevSelectedFixture = selectedFixture;
      //console.log("PREV",prevSelectedBody,prevSelectedFixture);
      arcDragged = getArcAtMouse();
       if (!arcDragged) {
         //fixture = getFixtureAtMouse();
         if (fixture!= null) {
           bodyDragged = {};
           body = fixture.GetBody();
           bodyDragged.body = body;
           var center = bodyDragged.body.GetPosition();
           mouseX = (event.clientX - canvasPosition.left) / SCALE * 2;
           mouseY = (event.clientY - canvasPosition.top) / SCALE * 2;
           bodyDragged.offset = {x: center.x - mouseX, y:center.y - mouseY};
         }
         clearAllHelperLines(); 
         if (!$.isEmptyObject(bodyDragged)) {  
           selectedBody = bodyDragged.body;
           //clearAllHelperLines();
           createHelperLines("limegreen"); 
           redrawWorld();
         }
         mouseX = (event.clientX - canvasPosition.left) / SCALE * 2;
         mouseY = (event.clientY - canvasPosition.top) / SCALE * 2;
       }
     } 
     if (mode === "line") {
/*       coords = box2dtonlogo({x:mouseX, y:mouseY});
       Physics.createObject("shape-"+totalObjectsCreated, [ 
         ["behavior", "static"], 
         ["shape", "line"], 
         ["coords", [ [coords.x - 3, coords.y], [coords.x + 3, coords.y]]]]);
         redrawWorld();
         drawHelperPoints();*/
     }
     if (mode === "circle") {
/*       console.log("MODE IS CIRCLE");

       coords = box2dtonlogo({x:mouseX, y:mouseY});
       Physics.createObject("shape-"+totalObjectsCreated, [ 
         ["behavior", "dynamic"], 
         ["shape", "circle"], 
         ["coords", [coords.x, coords.y]], 
         ["radius", 1]]);
         redrawWorld();
         drawHelperPoints();*/
     }
     if (mode === "triangle") {
  /*     coords = box2dtonlogo({x:mouseX, y:mouseY});
       Physics.createObject("shape-"+totalObjectsCreated, [ 
         ["behavior", "dynamic"], 
         ["shape", "polygon"], 
         ["coords", [coords.x, coords.y]], 
         ["helper-coords", [ [coords.x, coords.y], [coords.x + 3, coords.y + 3], [coords.x, coords.y + 3]]]]);
         redrawWorld();
         drawHelperPoints();*/
     }
     if (mode === "quad") {
  /*     coords = box2dtonlogo({x:mouseX, y:mouseY});
       Physics.createObject("shape-"+totalObjectsCreated, [ 
         ["behavior", "dynamic"], 
         ["shape", "polygon"], 
         ["coords", [coords.x, coords.y]], 
         ["helper-coords", [ [coords.x - 2, coords.y + 3], [coords.x - 2, coords.y], [coords.x, coords.y - 2], [coords.x + 3, coords.y]]]]);
         redrawWorld();
         drawHelperPoints();*/
     }
     if (mode === "joint") {}
     if (mode === "target") {
       clearAllHelperLines();
       //redrawWorld();

       
     }

   }
   
   function handleMouseUp() {
     console.log("handle mouse up");
     for (var i=0; i<helperPoints.length; i++) {
       if (helperPoints[i].color != "white") {
          helperPoints[i].color = "white";
       }
     }
     //updateOnce();
     universe.repaint();
     world.DrawDebugData();
     var mode = Physics.getDrawButtonMode();
     if (mode === "group") {
       if (selectedBody) {
         createHelperLines("limegreen");
         redrawWorld();
         createHelperArc();
       }
     } else if (mode === "target") {
       if (selectedBody) {
         createHelperLines("limegreen");
         redrawWorld();
       }
     } if (mode === "drag") {
       //if (selectedFixture) {
         //selectedFixture.GetBody().SetPosition(selectedFixture.GetBody().GetWorldCenter());
        //selectedFixture.GetBody().SetWorldCenter(selectedFixture.GetBody().GetPosition());
       //}
       drawHelperPoints();
       redrawWorld();
     }
     pointDragged = null;
     bodyDragged = null;
     
   }
   
   var handleMouseMove = function(e) {
     mouseX = (e.clientX - canvasPosition.left) / SCALE * 2;
     mouseY = (e.clientY - canvasPosition.top) / SCALE * 2;
     handleMove();
   }
   
   var handleTouchMove = function(e) {
     e.preventDefault();
     var orig = e.originalEvent;
     mouseX = (orig.touches[0].pageX - canvasPosition.left) / SCALE * 2;
     mouseY = (orig.touches[0].pageY - canvasPosition.left) / SCALE * 2;
     handleMove();
   };
   
   function bindElements() {
     if (elementsBound) { return } else { elementsBound = true; }
     //console.log("bind elements")
     $('#netlogoCanvas').on('mousedown', function(event) {
       isMouseDown = true;   
       mouseX = (event.clientX - canvasPosition.left) / SCALE * 2;
       mouseY = (event.clientY - canvasPosition.top) / SCALE * 2;
       handleMouseDown();
      $('#netlogoCanvas').on('mousemove', handleMouseMove);
     });
     $('#netlogoCanvas').on('mouseup', function(event) {
       isMouseDown = false;
       mouseX = undefined;
       mouseY = undefined;
       $('#netlogoCanvas').off('mousemove');
       handleMouseUp();
     });
     $('#netlogoCanvas').on('mouseout', function(event) {
       isMouseDown = false;
       mouseX = undefined;
       mouseY = undefined;
       $('#netlogoCanvas').off('mousemove', handleMouseMove);
     });
     $('#netlogoCanvas').on('click', function(event) {
       mouseX = (event.clientX - canvasPosition.left) / SCALE * 2;
       mouseY = (event.clientY - canvasPosition.top) / SCALE * 2;
       handleMouseClick();
     });
     $('#netlogoCanvas').on('touchstart', function(event) {
       isMouseDown = true;
       event.preventDefault();
       var orig = event.originalEvent;
       mouseX = (orig.touches[0].pageX - canvasPosition.left) / SCALE * 2;
       mouseY = (orig.touches[0].pageY - canvasPosition.left) / SCALE * 2;
       handleMouseDown();
       $('#netlogoCanvas').on('touchmove', handleTouchMove);
     });
    $('#netlogoCanvas').on('touchend', function(event) {
       isMouseDown = false;
       mouseX = undefined;
       mouseY = undefined;
       $('#netlogoCanvas').off('touchmove');
       handleMouseUp();
    }); 
  }
  
  function createHelperPoints(fixture) {
    //console.log("body",body);
    //console.log("fixture",fixture);
    var body = fixture.GetBody();
    var bodyCenter = body.GetPosition();
    var bodyId = body.GetUserData().id;
    var bodyCenter = body.GetPosition();
    var pointCoords;
    var pixelCoords;
    var localPosition;
    var radius;
    helperPoints = [];
    universe.repaint();
    world.DrawDebugData();
    var x, y;
    //var shape = fixture.m_userData.shape;
    shape = fixture.GetUserData().shape;
    //console.log(shape);
    //console.log("shape",shape);
    if (shape === "circle") {
      radius = fixture.GetShape().GetRadius();
      localCoords = fixture.GetShape().GetLocalPosition();
      var absoluteCoords = body.GetWorldPoint(localCoords);
      //pointCoords = {x:absoluteCoords.x, y:absoluteCoords.y};
      
      //pixelCoords = {x: pointCoords.x * SCALE, y: pointCoords.y * SCALE };
      //helperPoints.push({bodyId:bodyId, shape:"circle", fixtureIndex:0, coords:pointCoords, pixelCoords: pixelCoords, color:"white" });
      pointCoords = {x:(absoluteCoords.x - -radius), y:absoluteCoords.y};
      
      //pointCoords = { x:(bodyCenter.x- -localPosition.x), y:(bodyCenter.y - -localPosition.y)};
      //pointCoords = {x:(pointCoords.x - -radius), y:pointCoords.y};
      pixelCoords = {x: pointCoords.x * SCALE, y: pointCoords.y * SCALE };
      helperPoints.push({bodyId:bodyId, shape:"circle", fixtureIndex:0, coords:pointCoords, pixelCoords: pixelCoords, color:"white" });
    } else if (shape === "polygon") {
      fixturePoints = fixture.GetShape().GetVertices();
      for (var i=0; i < fixturePoints.length; i++) {
        pointCoords = body.GetWorldPoint(fixturePoints[i]);
        pixelCoords = {x: pointCoords.x * SCALE, y: pointCoords.y * SCALE };
        helperPoints.push({bodyId:bodyId, shape:"polygon", fixtureIndex: i, coords:pointCoords, pixelCoords: pixelCoords, color:"white" });  
      }
    } else if (shape === "line") {
      fixturePoints = fixture.GetShape().GetVertices();
      //console.log(fixturePoints);
      
      for (var i=0; i < fixturePoints.length; i++) {
        
        pointCoords = body.GetWorldPoint(fixturePoints[i]);
        pixelCoords = {x: pointCoords.x * SCALE, y: pointCoords.y * SCALE };
        helperPoints.push({bodyId:bodyId, shape:"line", fixtureIndex: i, coords:pointCoords, pixelCoords: pixelCoords, color:"white" });  
      }
      
      
    }
    drawHelperPoints();
  }
  
  
/*  function createHelperDot(m) {
    console.log("CREATE HELPER DOT");
    //console.log("coords",m.pointsList);
    //var point0 = m.pointsList[0];
    //var point1 = m.pointsList[1];
    pixelCoords = {x: (m.pointsList[0].x + m.pointsList[1].x) / 2, y: (m.pointsList[0].y + m.pointsList[1].y) / 2};
    helperDots[m.shapeId] = {coords: pointCoords, pixelCoords: pixelCoords, color: "gray", shapeId:m.shapeId};
    //helperDots.push({shapeId:m.shapeId, coords:pointCoords, pixelCoords: pixelCoords});  
    //console.log("helperDots", helperDots);
  }*/
  
  function drawHelperPoints() {
    //console.log("draw helper points "+helperPoints.length);
    
    var coords;
    for (var i=0; i<helperPoints.length; i++) {
      coords = helperPoints[i].pixelCoords;
      
      ctx = canvas.getContext('2d');
      ctx.beginPath();
      ctx.arc(coords.x, coords.y, 12, 0, Math.PI * 2, true); // Outer circle
      ctx.fillStyle = "black";
      ctx.fill();
      ctx.strokeStyle = "limegreen";
      ctx.lineWidth=5;
      ctx.stroke();
      ctx.fillStyle = "white";
      ctx.font = "20px Arial";
      ctx.fillText(i,coords.x - 6,coords.y + 8);
    }
  }

  /*
  function drawHelperDots() {
    //console.log("DRAW ",helperDots);
    var coords;
    for (var i in helperDots) {
      coords = helperDots[i].pixelCoords;
      color = helperDots[i].color;
      ctx = canvas.getContext('2d');
      ctx.beginPath();
      ctx.arc(coords.x, coords.y, 12, 0, Math.PI * 2, true); // Outer circle
      ctx.fillStyle = color; //"rgb(100,100,100,0.5)";
      ctx.fill();
      ctx.strokeStyle = color;
      ctx.lineWidth=5;
      ctx.stroke();
    }
  }*/
  /*
  function drawHelperLines() {
    var shape, vertices, helper;
    for (var i=0; i<helperLines.length; i++) {
      helper = helperLines[i];
      shape = helper.shape;
      if (shape === 2) { //polygon
        vertices = helper.vertices;
      } else if (shape === "circle") {
        
      } else if (shape === "line") {
        vertices = helperLines[i].vertices;
      }
    }
  }*/
  
  function clearAllHelperLines() {
    var fixture;
    for (var fixture in fixtureObj) {
      f = fixtureObj[fixture];
      userData = f.GetUserData();
      userData.strokeColor = "(none)";
      userData.fillColor = "(none)";
      f.SetUserData(userData);
    }
  }
  
  function clearAllHelperPoints() {
    helperPoints = [];
  }

  function resetAllFillColors() {
    var fixture;
    for (var fixture in fixtureObj) {
      f = fixtureObj[fixture];
      userData = f.GetUserData();
      userData.fillColor = userData.defaultFillColor;
      f.SetUserData(userData);
    }
  }
  
  function createHelperLines(color) {
    //console.log("create helper lines for");
    //console.log(selectedBody);
    var f = selectedBody.GetFixtureList();
    var userData = f.GetUserData();
    userData.strokeColor = color;
    userData.fillColor = "(none)";
    f.SetUserData(userData);
    while (f.GetNext()) {
      f = f.GetNext();
      userData = f.GetUserData();
      userData.strokeColor = color;
      userData.fillColor = "(none)";
      f.SetUserData(userData);
    }
  }
  
  function createHelperTargets() {
    //console.log("create helper targets gray");
    helperTargets = [];
    var targets = targetObj[selectedBody.GetUserData().id];
    for (var i=0; i<targets.length; i++) {
      targets[i].color = "gray";
      helperTargets.push(targets[i]);
    }
    drawHelperTargets();
  }
  
  function drawHelperTargets() {
    //console.log("draw helper targets, color");
    var pointCoords, pixelCoords, color;
    for (var i=0; i<helperTargets.length; i++) {
      pointCoords = helperTargets[i].coords;
      color = helperTargets[i].color;
      pixelCoords = {x: pointCoords.x * SCALE, y: pointCoords.y * SCALE};
      ctx.beginPath();
      ctx.strokeStyle = "white";
      ctx.lineWidth=5;
      ctx.moveTo(pixelCoords.x - 30, pixelCoords.y);
      ctx.lineTo(pixelCoords.x + 30, pixelCoords.y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(pixelCoords.x, pixelCoords.y - 30);
      ctx.lineTo(pixelCoords.x, pixelCoords.y + 30);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(pixelCoords.x, pixelCoords.y, 18, 0, Math.PI * 2, true); // Outer circle
      ctx.arc(pixelCoords.x, pixelCoords.y, 12, 0, Math.PI * 2, true); // Outer circle
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = "white";
      ctx.lineWidth=5;
      ctx.stroke();
    }    
  }
  
  function angleToOffset(angle, radius) {
    var oldPoint = {x: radius, y: 0};
    var newPoint = {};
    newPoint.x = oldPoint.x * Math.cos(angle) - oldPoint.y * Math.sin(angle);
    newPoint.y = oldPoint.y * Math.cos(angle) + oldPoint.x * Math.sin(angle);
    return newPoint;
  }
  
  function offsetToAngle(center, mouseCoords, radius) {
    radius = radius / SCALE;
    var position = {x: (mouseCoords.x - center.x), y: (mouseCoords.y - center.y)};
    var oldRadius = Math.sqrt(Math.pow((position.x), 2) + Math.pow((position.y), 2));
    var angle = Math.atan2(position.y, position.x);
    var newPoint = {x: radius * Math.cos(angle), y: radius * Math.sin(angle)};
    newPoint.x = newPoint.x + center.x;
    newPoint.y = newPoint.y + center.y;
    results = {};
    results.angle = angle;
    results.coords = newPoint;
    return results;
  }
  
  function createHelperArc() {  
    //console.log("create helper arc");  
    var center = selectedBody.GetPosition();
    pointCoords = center;
    pixelCoords = {x: pointCoords.x * SCALE, y: pointCoords.y * SCALE };
    var angle = selectedBody.GetAngle();
    ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.strokeStyle = "white";
    ctx.lineWidth=5;
    ctx.moveTo(pixelCoords.x, pixelCoords.y);
    var angle = selectedBody.GetAngle();
    var offset = angleToOffset(angle, 80);
    pixelCoords.x = pixelCoords.x + offset.x;
    pixelCoords.y = pixelCoords.y + offset.y;
    ctx.lineTo(pixelCoords.x, pixelCoords.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(pixelCoords.x, pixelCoords.y, 12, 0, Math.PI * 2, true); // Outer circle
    ctx.fillStyle = "black";
    ctx.fill();
    ctx.strokeStyle = "white";
    ctx.lineWidth=5;
    ctx.stroke();
    pointCoords = {x: pixelCoords.x / SCALE, y: pixelCoords.y / SCALE };
    helperArc = {x: pointCoords.x, y: pointCoords.y};
  }
  
  function drawHelperArc() {
    console.log("draw helper arc");
    console.log(selectedBody);
    if (!selectedBody) {
      selectedBody = selectedFixture.GetBody();
    }
    if (selectedBody) {
      var center = selectedBody.GetPosition();
      pointCoords = center;
      pixelCoords = {x: pointCoords.x * SCALE, y: pointCoords.y * SCALE};
      var angle = selectedBody.GetAngle();
      //ctx = canvas.getContext('2d');
      ctx.beginPath();
      ctx.strokeStyle = "white";
      ctx.lineWidth=5;
      ctx.moveTo(pixelCoords.x, pixelCoords.y);
      var mouseCoords = {x: mouseX, y: mouseY};
      var results = offsetToAngle(center, mouseCoords, 80);
      var newAngle = results.angle;
      var pointCoords = results.coords;
      //helperArc = {x: pointCoords.x, y: pointCoords.y};
      //console.log("end helper arc at "+pointCoords.x + " " + pointCoords.y);
      var pixelCoords = {x: pointCoords.x * SCALE, y: pointCoords.y * SCALE };
      selectedBody.SetAngle(newAngle);
      ctx.lineTo(pixelCoords.x, pixelCoords.y);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(pixelCoords.x, pixelCoords.y, 12, 0, Math.PI * 2, true); // Outer circle
      ctx.fillStyle = "black";
      ctx.fill();
      ctx.strokeStyle = "white";
      ctx.lineWidth=5;
      ctx.stroke();
    }
    //console.log("draw helper arc at "+pixelCoords.x + " " + pixelCoords.y);
  }
  
  function triggerModeChange(mode) {
    universe.repaint();
    world.DrawDebugData();
    
    //if (mode === "drag") {
      clearAllHelperLines(); 
      resetAllFillColors();
      arcDragged = false;
      redrawWorld();
    //} else if (mode === "group") {
      
    //}
  }
  function triggerDisplayChange(display) {
    var mode = Physics.getDrawButtonMode();

    showAABB = display.showAABB;
    showCenter = display.showCenter;
    universe.repaint();
    world.DrawDebugData();
    redrawWorld();
    if (mode === "drag") { drawHelperPoints();}
    else if (mode === "group") {           
      createHelperLines("limegreen");
      if (arcDragged ) { drawHelperArc(); }
    }
    
  }
  
  function deleteSelected() {
    //console.log("delete selected");
    if (selectedBody) {
      deleteBody(selectedBody.GetUserData().id);
    } else if (selectedFixture) {
      deleteFixture(selectedFixture.GetUserData().id);
    }
  }

  function triggerDragMode() {
    //drawGrabPoints();
  }

  function getWorld() {
    return world;
  }
  
  function getBodyObj(id) {
    return bodyObj[id];
  }
  
  function getAllBodies() {
    return bodyObj;
  }
  
  function getAllFixtures() {
    return fixtureObj;
  }
  
  function drawDebugData() {
    world.DrawDebugData();
  }
  
  function getTotalObjectsCreated() {
    return totalObjectsCreated;
  }
  
  return {
    startWorld: startWorld,
    stopWorld: stopWorld,
    runWorld: runWorld,
    world: world,
    running: getRunning,
    update: update,
    addBodyToWorld: addBodyToWorld,
    createBody: createBody,
    createFixture: createFixture,
    addFixtureToBody: addFixtureToBody,
    addTargetToBody: addTargetToBody,
    addDistanceJointToBody: addDistanceJointToBody,
    addRevoluteJointToBody: addRevoluteJointToBody,
    addPrismaticJointToBody: addPrismaticJointToBody,
    createWorld: createWorld,
    setupDebugDraw: setupDebugDraw,
    getWorld: getWorld,
    getBodyObj: getBodyObj,
    updateOnce: updateOnce,
    nlogotobox2d: nlogotobox2d,
    box2dtonlogo: box2dtonlogo,
    redrawWorld: redrawWorld,
    applyForce: applyForce,
    applyLinearImpulse: applyLinearImpulse,
    applyTorque: applyTorque,
    applyAngularImpulse: applyAngularImpulse,
    getAllBodies: getAllBodies,
    radiansToDegrees: radiansToDegrees,
    drawDebugData: drawDebugData,
    triggerDragMode: triggerDragMode,
    getAllFixtures: getAllFixtures,
    updateGroup: updateGroup,
    deleteFixture: deleteFixture,
    updateFixture: updateFixture,
    triggerModeChange: triggerModeChange,
    triggerDisplayChange: triggerDisplayChange,
    deleteSelected: deleteSelected,
    getTotalObjectsCreated: getTotalObjectsCreated,
    updateBody: updateBody
  };

})();