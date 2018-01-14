//physics.js
var socket;
var universe;

Physicsb2 = (function() {
  var world;
  var physicsWorld;
  var running = false;
  
   // get ready to capture mouse events
  var isMouseDown = false;
  var mouseX = undefined;
  var mouseY = undefined;
  var p, canvasPosition;
  var selectedBody;
  var mouseJoint = null;
  var mousePVec;
  
  var   b2Vec2 = Box2D.Common.Math.b2Vec2
     ,	b2BodyDef = Box2D.Dynamics.b2BodyDef
     ,	b2Body = Box2D.Dynamics.b2Body
     ,	b2FixtureDef = Box2D.Dynamics.b2FixtureDef
     ,	b2Fixture = Box2D.Dynamics.b2Fixture
     ,	b2World = Box2D.Dynamics.b2World
     ,	b2MassData = Box2D.Collision.Shapes.b2MassData
     ,	b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape
     ,	b2CircleShape = Box2D.Collision.Shapes.b2CircleShape
     ,	b2DebugDraw = Box2D.Dynamics.b2DebugDraw
     ,  b2AABB = Box2D.Collision.b2AABB
     ,  b2MouseJointDef = Box2D.Dynamics.Joints.b2MouseJointDef
     ,  b2DistanceJointDef = Box2D.Dynamics.Joints.b2DistanceJointDef
     ,  b2RevoluteJointDef = Box2D.Dynamics.Joints.b2RevoluteJointDef
     ,  b2PrismaticJointDef = Box2D.Dynamics.Joints.b2PrismaticJointDef
     ;
  var bodyObj = {};
  var turtleObj = {};
  var SCALE = 30;
  var BOX2D_WIDTH = 0; 
  var BOX2D_HEIGHT = 0; 
  var NLOGO_WIDTH = 0; 
  var NLOGO_HEIGHT = 0;
  var wrap = [false, false];
  // assume NetLogo world is centered at 0
  
  function nlogotobox2d(coords) {
    // console.log("nlogotobox2d", coords);
    BOX2D_WIDTH = parseFloat($("#box2d-canvas").css("width").replace("px",""));
    BOX2D_HEIGHT = parseFloat($("#box2d-canvas").css("height").replace("px",""));
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
    BOX2D_WIDTH = parseFloat($("#box2d-canvas").css("width").replace("px",""))
    BOX2D_HEIGHT = parseFloat($("#box2d-canvas").css("height").replace("px",""))
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
  
  function radianstodegrees(angle) {
    return angle / 2 / Math.PI * 360;
  }
  function degreestoradians(angle) {
    return angle * 2 * Math.PI / 360;
  }

  //Physics.createWorld([10, [21, 21] ])
  function createWorld(m) {
    
    //console.log(m);
    bodyObj = {};
    turtleObj = {};
    //bindElements();
    var gravity = m[0]
    var range = m[1];
    wrap = m[2];
    
    //console.log("create world "+gravity[0]+" "+gravity[1]+" "+range[0]+" "+range[1]+" "+wrap[0]+" "+wrap[1]);
    
    NLOGO_WIDTH = range[0];
    NLOGO_HEIGHT = range[1];
    if (!p) {
      if ($("#box2d-canvas").length === 0) { 
        //$("body").append("<div style='border:2px solid red; width:400px;'><canvas class='netlogo-canvas2' id='box2d-canvas' style='width:400px; height:400px'></canvas></div>"); 
        //$(".netlogo-canvas").attr("id","box2d-canvas"); 
        //$("#box2d-canvas").css("border", "2px solid red");
      }
      p = $( "#box2d-canvas");
      canvasPosition = p.position();
    }
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
            if (universe.model.turtles[id].xcor != undefined
               && universe.model.turtles[id].ycor != undefined 
               && universe.model.turtles[id].heading != undefined) 
            {
              if (id != -1 && universe.model.turtles && universe.model.turtles[id]) {
                var pos = nlogotobox2d([universe.model.turtles[id].xcor, universe.model.turtles[id].ycor]);
                var posVector = new b2Vec2();
                posVector.x = pos[0];
                posVector.y = pos[1];
                b.SetPosition(posVector);
                var heading = degreestoradians(universe.model.turtles[id].heading);
                //b.SetTransform(b.GetPosition(), heading);
                b.SetAngle(heading);
              }
            }
          }
          
      }
    
      window.clearInterval(physicsWorld);      
      //p = $( "#box2d-canvas");
      //canvasPosition = p.position();
      physicsWorld = window.setInterval(update, 1000 / 60);
      running = true;
    }
  }
        
  function stopWorld() {
    window.clearInterval(physicsWorld);
    running = false;
  }
        
  function addBody(m) {
    var id = m[0];
    var behavior = m[1];
    var bodyA = m[2]
    var nlogoCoords = m[3];
    var angle = m[4];
    
    var box2dCoords = nlogotobox2d(nlogoCoords);
    //console.log("add body "+id+" "+behavior+" "+bodyA+" "+nlogoCoords+" "+box2dCoords+" "+angle);
    var bodyDef = new b2BodyDef;
    bodyDef.userData = {
      id: id,
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
        //bodyDef.type = b2Body.b2_kinematicBody;            
        bodyDef.type = b2Body.b2_dynamicBody;
        bodyDef.userData.ghost = true;
        break;
    }
    bodyDef.angle = degreestoradians(angle);
    bodyDef.position.x = roundToTenths(box2dCoords[0]);
    bodyDef.position.y = roundToTenths(box2dCoords[1]);
    //console.log(bodyDef.position);
    bodyObj[id] = world.CreateBody(bodyDef);
  }
  
  function updateBodyId(name, who) {
    //console.log("updateBodyId " + name + " "+who);
    bodyObj[who] = bodyObj[name];
    //var tempBody = bodyObj[name];
    delete bodyObj[name];
    Physicsb2.getBodyObj(who).m_userData.id = who;
  }
  
  function roundToTenths(x) {
    return Math.round(x * 100) / 100;
  }
  //function drag(m) {
  //  var id = m[0];
  //  var callback = m[1];
//universe.model.turtles[0].xcor
  //}
  
  
  
  function addFixtureToBody(m) {
    var id = m[0];
    var bodyA = m[1];
    var nlogoCoords = m[2];
    var box2dCoords = nlogotobox2d(nlogoCoords);
    var nlogoFixtureCoords = m[3];
    var box2dFixtureCoords = [];
    for (let coord of nlogoFixtureCoords) {
      box2dFixtureCoords.push(nlogotobox2d(coord));  
    }
    var shape = m[4];
    var settings = m[5];
    var fixDef = new b2FixtureDef;
    fixDef.density = settings[0];
    fixDef.friction = settings[1];
    fixDef.restitution = settings[2];
    
    if (bodyObj[bodyA].m_userData && bodyObj[bodyA].m_userData.ghost) {
      fixDef.filter.groupIndex = -1;
    }
    
    var offsetX = bodyObj[bodyA].GetPosition().x;
    var offsetY = bodyObj[bodyA].GetPosition().y;
    if (shape === "circle") {
      var distance = (findDistance(box2dFixtureCoords[0], box2dFixtureCoords[1]));
      fixDef.shape = new b2CircleShape(distance);
      fixDef.shape.SetLocalPosition(
        new b2Vec2(roundToTenths(box2dFixtureCoords[0][0] - offsetX), roundToTenths(box2dFixtureCoords[0][1] - offsetY)),
        new b2Vec2(roundToTenths(box2dFixtureCoords[1][0] - offsetX), roundToTenths(box2dFixtureCoords[1][1] - offsetY)));
    } else if (shape === "edge") {
      fixDef.shape = new b2PolygonShape();
      fixDef.shape.SetAsEdge(
        new b2Vec2(roundToTenths(box2dFixtureCoords[0][0] - offsetX), roundToTenths(box2dFixtureCoords[0][1] - offsetY)),
        new b2Vec2(roundToTenths(box2dFixtureCoords[1][0] - offsetX), roundToTenths(box2dFixtureCoords[1][1] - offsetY)))
    } else {
      fixDef.shape = new b2PolygonShape; 
      var carp = [];
      for (var i=box2dFixtureCoords.length-1;i>=0;i--){
        carp.push(new b2Vec2(roundToTenths(box2dFixtureCoords[i][0] - offsetX), roundToTenths(box2dFixtureCoords[i][1] - offsetY)))
      }
      fixDef.shape.SetAsArray(carp,carp.length);
    }
    bodyObj[bodyA].CreateFixture(fixDef);
    
    redrawWorld();
  }
  function addTargetToBody(m) {
    var id = m[0];
    var bodyA = m[1];
    var coords = m[2];
    //console.log("addTargetToBody "+id+" "+bodyA+" "+coords);
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
  //  allowCollisionsBetweenBodies(bodyA, bodyB);
    //console.log("addRevoluteJointToBody "+id+" "+bodyA+" "+bodyB+" "+coords+" "+collideConnected);
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
  
  function applyForce(m) {
    var id = m[0];
    var bodyA = m[1];
    var coords = m[2];
    var heading = m[3];
    var amount = m[4] * 10;
    //console.log("apply force "+id+" "+bodyA+" "+coords+" "+heading+" "+amount);
    var coordsA = nlogotobox2d(coords);
    var radians = degreestoradians(heading);
    //console.log(heading+" "+roundToTenths(Math.cos(radians)*amount)+" "+roundToTenths(Math.sin(radians)*amount));
    //console.log("apply force to "+bodyA+"{x:"+roundToTenths(Math.cos(radians)*amount)+"}"+
    //                                    "{y:"+roundToTenths(Math.sin(radians)*amount)+"}"+
    //    "b2Vec2("+roundToTenths(coordsA[0])+", "+roundToTenths(coordsA[1])+")"
    //  );                                
    bodyObj[bodyA].ApplyForce(
      {x:roundToTenths(Math.cos(radians)*amount), y:roundToTenths(Math.sin(radians)*amount)}, 
      new b2Vec2(roundToTenths(coordsA[0]), roundToTenths(coordsA[1])) );
  }
  
  function applyLinearImpulse(m) {
    var id = m[0];
    var bodyA = m[1];
    var coords = m[2];
    var heading = m[3];
    var amount = m[4] * 50;
    //console.log("apply impulse "+id+" "+bodyA+" "+coords+" "+heading+" "+amount);
    var coordsA = nlogotobox2d(coords);
    var radians = degreestoradians(heading);
    //console.log(Math.cos(radians)*amount+" "+Math.sin(radians)*amount);
    bodyObj[bodyA].ApplyImpulse(
      {x:Math.cos(radians)*amount, y:Math.sin(radians)*amount}, 
      new b2Vec2(roundToTenths(coordsA[0]), roundToTenths(coordsA[1])) );
  }
  
  function applyTorque(m) {
    var bodyA = m[0];
    var amount = m[1] * 40;
    //console.log("apply torque "+bodyA+" "+amount);
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
       debugDraw.SetSprite(document.getElementById("box2d-canvas").getContext("2d"));
       debugDraw.SetDrawScale(30.0);
       debugDraw.SetFillAlpha(0.3);
       debugDraw.SetLineThickness(1.0);
       debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
       world.SetDebugDraw(debugDraw);
     }
  }

  function findDistance(coord1, coord2) {
    var changeInX = coord2[0] - coord1[0];
    var changeInY = coord2[1] - coord1[1];
    return Math.sqrt(Math.pow(changeInX,2) + Math.pow(changeInY,2));
  }

  function allowCollisionsBetweenBodies(bodyA, bodyB) {/*
    var newGroupIndex;
    var bodyAGroupIndex = bodyObj[bodyA].groupIndex;
    var bodyBGroupIndex = bodyObj[bodyB].groupIndex;
    if (!bodyAGroupIndex && !bodyBGroupIndex) {
      newGroupIndex = bodyObj[bodyA].id+"-"+bodyObj[bodyB].id;
      bodyObj[bodyA].groupIndex = newGroupIndex;
      bodyObj[bodyB].groupIndex = newGroupIndex;
      return;
    }
    if (bodyAGroupIndex) {
      newGroupIndex = bodyAGroupIndex;
      oldGroupIndex = bodyBGroupIndex;
      bodyObj[bodyB].groupIndex = newGroupIndex;
    } else if (bodyBGroupIndex) {
      newGroupIndex = bodyBGroupIndex;
      oldGroupIndex = bodyAGroupIndex;
      bodyObj[bodyA].groupIndex = newGroupIndex;
    }
    for (var id in bodyObj) {
      if (bodyObj[id].groupIndex === oldGroupIndex) {
        bodyObj[id].groupIndex = newGroupIndex;
      }
    }*/
  }
  
  
  
  function drag(m) {
    console.log("drag");
    var draggerId = m[0];
    var callback = m[1];
    //dragging = window.setInterval(dragIt, 1000 / 60);
    //while (isMouseDown) {
    //  console.log("mousedown drag " + draggerId)
    //}
    console.log("finished dragging, ",callback);
  }
  
  function dragIt() {
    console.log("mousedown drag " + draggerId)
  }

  function redrawWorld() {
    if (world) {
      console.log("redraw world");
      //universe.repaint();
      //world.triggerUpdate();
      world.DrawDebugData();
    }
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
        var heading = radianstodegrees(b.GetAngle());
        if (id != -1 && universe.model.turtles && universe.model.turtles[id]) {
          universe.model.turtles[id].xcor = pos.x;
          universe.model.turtles[id].ycor = pos.y;
          universe.model.turtles[id].heading = heading;
        }
        
      } else if (b.GetType() == b2Body.b2_staticBody) {
        var pos = box2dtonlogo(b.GetPosition());
        if (id != -1 && universe.model.turtles && universe.model.turtles[id]) {
          universe.model.turtles[id].xcor = pos.x;
          universe.model.turtles[id].ycor = pos.y;
        }
      }
    }
  }

  function updateOnce() {
    if (world) {
      //console.log("update once from updateOnce");
      updateBodies();
      
      
    }
  }
  

  function update() {
    //console.log("update");
    //var currentTime = new Date().getTime();
    //if (currentTime - lastUpdate > 300 ) { 
    //  console.log("stop from here");
    //  stopWorld(); 
    //  return; 
    //}
    
    if (running) {//}&& (currentTime - lastUpdate > 5)) {
      updateBodies();
      //lastUpdate = currentTime;
      //console.log("update");

      // mouse drags images
      
      /*
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
      }*/
    }
  };
     
  function getRunning() {
    return running;
  }

   var handleMouseMove = function(e) {
     mouseX = (e.clientX - canvasPosition.left) / SCALE;
     mouseY = (e.clientY - canvasPosition.top) / SCALE;
   };
   
   var handleTouchMove = function(e) {
     e.preventDefault();
     var orig = e.originalEvent;
     mouseX = (orig.touches[0].pageX - canvasPosition.left) / SCALE;
     mouseY = (orig.touches[0].pageY - canvasPosition.left) / SCALE;
     //$('#comment').text('(' + mouseX + ',' + mouseY + ')');
   };

   function getBodyAtMouse() {
     mousePVec = new b2Vec2(mouseX, mouseY);
     var aabb = new b2AABB();
     aabb.lowerBound.Set(mouseX - 0.001, mouseY - 0.001);
     aabb.upperBound.Set(mouseX + 0.001, mouseY + 0.001);
     // Query the world for overlapping shapes.
     selectedBody = null;
     world.QueryAABB(getBodyCB, aabb);
     return selectedBody;
   }
     
   function getBodyCB(fixture) {
     if(fixture.GetBody().GetType() != b2Body.b2_staticBody) {
       if(fixture.GetShape().TestPoint(fixture.GetBody().GetTransform(), mousePVec)) {
         selectedBody = fixture.GetBody();
         return false;
       }
     }
     return true;
   }
   
   function bindElements() {
     $('#box2d-canvas').bind('mouseout', function(event) {

       $('#box2d-canvas').unbind('mousemove', handleMouseMove);
       isMouseDown = false;
       mouseX = undefined;
       mouseY = undefined;
     });
     $('#box2d-canvas').bind('mousedown', function(event) {

       isMouseDown = true;
       $('#box2d-canvas').bind('mousemove', handleMouseMove);
     });
     $('#box2d-canvas').bind('touchstart', function(event) {
       isMouseDown = true;
       $('#box2d-canvas').bind('touchmove', handleTouchMove);
     });
     $('#box2d-canvas').bind('mouseup', function(event) {
       $('#box2d-canvas').unbind('mousemove', handleMouseMove);
       isMouseDown = false;
       mouseX = undefined;
       mouseY = undefined;
     });
    $('#box2d-canvas').bind('touchend', function(event) {
       $('#box2d-canvas').unbind('touchmove', handleTouchMove);
       isMouseDown = false;
       mouseX = undefined;
       mouseY = undefined;
    }); 
  }

  function getWorld() {
    return world;
  }
  
  function getBodyObj(id) {
    return bodyObj[id];
  }


  return {
    startWorld: startWorld,
    stopWorld: stopWorld,
    runWorld: runWorld,
    world: world,
    running: getRunning,
    update: update,
    addBody: addBody,
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
    drag: drag,
    applyForce: applyForce,
    applyLinearImpulse: applyLinearImpulse,
    applyTorque: applyTorque,
    applyAngularImpulse: applyAngularImpulse,
    updateBodyId: updateBodyId
  };

})();