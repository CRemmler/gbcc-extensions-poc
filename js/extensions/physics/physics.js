
Physics = (function() {
  
  var mode;
  
  function setupInterface() {
    viewWidth = parseFloat($(".netlogo-canvas").css("width"));
    viewHeight = parseFloat($(".netlogo-canvas").css("height"));
    
    var spanText = "<div class='physics-controls'>";
    spanText +=       "<i id='physicsOn' class='fa fa-toggle-on' aria-hidden='true'></i>";
    spanText +=       "<i id='physicsOff' class='fa fa-toggle-off' aria-hidden='true'></i>";
    spanText +=    "</div>";
    $(".netlogo-widget-container").append(spanText);
    
    
    spanText =    "<div id='physicsContainer'></div>";
    $(".netlogo-widget-container").append(spanText);
    $(".physics-controls").css("left", parseFloat($(".netlogo-view-container").css("left")) + parseFloat($(".netlogo-canvas").css("width")) + 8 + "px");
    $(".physics-controls").css("top", $(".netlogo-view-container").css("top"));
    $("#physicsContainer").css("width", parseFloat($(".netlogo-canvas").css("width")) - 5 + "px");
    $("#physicsContainer").css("height", parseFloat($(".netlogo-canvas").css("height")) - 4 + "px");
    $("#physicsContainer").css("left", $(".netlogo-view-container").css("left"));
    $("#physicsContainer").css("top", $(".netlogo-view-container").css("top"));
    $("#physicsContainer").css("display", "none");
    $("#physicsContainer").css("z-index","-1");
    
    $(".physics-controls").css("display","none");
    
    spanText = "<div id='physicsMenu'>";
    spanText +=       "<div id='physicsDrawControls'>";
    spanText +=         " <img src='js/extensions/physics/images/img5.png' id='physicsDrag'>"
    spanText +=         " <img src='js/extensions/physics/images/img6.png' id='physicsLine'>"
    spanText +=         " <img src='js/extensions/physics/images/img4.png' id='physicsCircle'>"
    spanText +=         " <img src='js/extensions/physics/images/img7.png' id='physicsTriangle'>"
    spanText +=         " <img src='js/extensions/physics/images/img8.png' id='physicsQuad'>"
    spanText +=         " <img src='js/extensions/physics/images/img3.png' id='physicsJoin'>"
    spanText +=         " <img src='js/extensions/physics/images/img2.png' id='physicsJoint'>"
    spanText +=         " <img src='js/extensions/physics/images/img1.png' id='physicsTarget'>"
    spanText +=       "</div>";
    spanText +=       "<div id='physicsStateControls'>";

/*
    spanText +=         "<span id='physicsReset'>Reset</span>";
    spanText +=         "<span id='physicsPlay'>Play</span>";
    spanText +=         "<span id='physicsPause>Pause</span>";
*/
    
    spanText +=         "<i class='fa fa-refresh hidden' id='physicsReset' aria-hidden='true'></i>";
    spanText +=         "<i class='fa fa-play hidden' id='physicsPlay' aria-hidden='true'></i>";
    spanText +=         "<i class='fa fa-pause hidden' id='physicsPause' aria-hidden='true'></i>";

    spanText +=       "</div>";
    spanText += "</div>";
    $(".netlogo-view-container").append(spanText);  
    $("#physicsMenu").css("display", "none");
    setupEventListeners();
  }
  
  function resetInterface() {
    $("#physicsContainer").css("display","inline-block");
    $(".physics-controls").css("display","inline-block");
    
    $("#physicsMenu").css("display","inline-block");
    updatePhysics("physicsOff");
  }
  
  function importPhysics(data) {
    var settings = data[0];
    var objects = data[1];
    //Images.clearImage();
    Physics.removePhysics();
    //Maps.removeMap();
    //Graph.removeGraph();
    world.triggerUpdate();
    Physicsb2.createWorld(settings);
    resetInterface();
  }
  
  function createObject(name, settings) {
    console.log("create object");
    var key, value;
    var parentId;
    var behavior = "dynamic";
    var shape = "circle";
    var coords = "";
    var fixtureCoords = "";
    var heading = 0;
    var radius = 2;
    var density = 0.5;
    var friction = 0.5;
    var restitution = 0.5;
    var bodyCoords, fixtureCoords;
    for (var i=0; i<settings.length; i++) {
      //console.log(key+" "+value);
      key = settings[i][0];
      value = settings[i][1];
      switch ( key ) {
        case "behavior": behavior = value; break;
        case "shape": shape = value; break;
        case "coords": coords = value; break;
        case "heading": heading = value; break;
        case "radius": radius = value; break;
        case "helper-coords": fixtureCoords = value; break;
        case "density": density = value; break;
        case "friction": friction = value; break;
        case "restitution": restitution = value; break;
      }
    }
    
    parentId = name+"parent";
    //physics:create-object "floor" (list ["behavior" "static"] ["shape" "edge"] [ "coords" [ [ -15 -15 ] [ 15 -14 ]]] [ "heading" 0 ])
    if (shape === "edge") {
      bodyCoords = [ (coords[0][0] - -coords[1][0]), (coords[0][1] - -coords[1][1]) / 2 ];
      fixtureCoords = coords;
      //Physicsb2.addBody([ parentId, behavior, parentId, bodyCoords, heading ]);
      //Physicsb2.addFixtureToBody([ name+"child", parentId, bodyCoords, fixtureCoords, shape, [density, friction, restitution], 0 ]);  
    }

    if (shape === "circle") {
      bodyCoords = coords;
      fixtureCoords = [ [ coords[0], coords[1]], [coords[0]+radius, coords[1]+radius ]];
      //Physicsb2.addBody([ parentId, behavior, parentId, bodyCoords, heading]);
      //Physicsb2.addFixtureToBody([ name+"child", parentId, bodyCoords, fixtureCoords, shape, [0.5, 0.2, 0.7], 0]);  
    }
    
    if (shape === "polygon") {
      bodyCoords = coords;
      //fixtureCoords = [ [ coords[0], coords[1]], [coords[0]+radius, coords[1]+radius ]];
      //Physicsb2.addBody([ parentId, behavior, parentId, bodyCoords, heading]);
      //Physicsb2.addFixtureToBody([ name+"child", parentId, bodyCoords, fixtureCoords, shape, [0.5, 0.2, 0.7], 0]);  
    }
    Physicsb2.addBody({
      "parentId": parentId, 
      "behavior": behavior, 
      "parentId": parentId, 
      "bodyCoords": bodyCoords, 
      "heading": heading 
    });
    Physicsb2.addFixtureToBody({
      "name": name+"child", 
      "parentId": parentId, 
      "bodyCoords": bodyCoords, 
      "fixtureCoords": fixtureCoords, 
      "shape": shape, 
      "settings": [density, friction, restitution]
    });  

    Physicsb2.redrawWorld();
  }
  
  function connectToObject(who, name) {
    var parentId = name+"parent";
    //console.log("connect to turtle "+parentId+" to " + who);
    Physicsb2.updateBodyId(parentId, who);
  }
  
  function disconnectFromObject(who, name) {
    var parentId = name+"parent";
    //console.log("connect to turtle "+parentId+" to " + who);
    Physicsb2.updateBodyId(who, parentId);
  }
  
  function removeObject(name) {
    return ([]);
  }
  
  function getObject(name) {
    return ([]);
  }
  
  function getObjects() {
    console.log("get objects");
    var objectsList = [];
    var bodies = Physicsb2.getAllBodies();
    var object, name, settings, fixtures, fixtureType, bodyType, position, angle, radius;
    for (b in bodies) {
      object = [];
      name = b;
      settings = [];
      fixtures = bodies[b].GetFixtureList();
      position = worldToPatch(bodies[b].GetPosition());
      angle = Physicsb2.radianstodegrees(bodies[b].GetAngle());
      switch (bodies[b].GetType()) {
        case 0: bodyType = "static"; break;
        case 1: bodyType = "kinematic"; break;
        case 2: bodyType = "dynamic"; break;
        default: bodyType = "none"; break;
      }
      fixtureType = "";
      for (var k in fixtures.GetShape()) {
        //console.log(k);
        if (k === "b2CircleShape") { 
          fixtureType = "circle"; 
          radius = fixtures.GetShape().GetRadius();
        }
        if (k === "b2PolygonShape") { fixtureType = "polygon"; }
      }
      console.log("name:"+name+" bodyType:"+bodyType+" fixtureType:"+ fixtureType+" position:"+position.x+","+position.y+" angle:"+angle);
      if (fixtureType === "circle") {
        console.log("radius: "+radius);
      }
      //console.log(fixtures.GetType());
      // CHANGE RADIUS Physicsb2.getAllBodies()["1"].GetFixtureList().GetShape().b2CircleShape(4)
      //console.log(Physicsb2.getAllBodies()["1"].GetPosition());
      
      
      //console.log(Physicsb2.getAllBodies()["1"].GetFixtureList().GetShape().GetLocalPosition());
      //physics:create-object "floor" (list "static-edge" (list [ -15 -15 ] [ 15 -14 ] 0) )
      //physics:create-object (word \"ball\" my-name) (list "dynamic-circle" (list xcor ycor radius heading) 
      //console.log(typeof fixtures);
    }
    //return objectsList;  
  }

  function setupEventListeners() {
    $(".physics-controls").on("click", "#physicsOn", function() {
      updatePhysics("physicsOff");
      triggerPhysicsUpdate();
      stopWorld();
      Physicsb2.updateOnce();
    });
    $(".physics-controls").on("click", "#physicsOff", function() {
      updatePhysics("physicsOn");
      //startWorld();
    });
    $("#physicsMenu").on("click", "#physicsReset", function() {
      
    });
    $("#physicsMenu").on("click", "#physicsPlay", function() {
      startWorld();
      $(this).addClass("hidden");
      $("#physicsPause").removeClass("hidden");
    });
    $("#physicsMenu").on("click", "#physicsPause", function() {
      stopWorld();
      $(this).addClass("hidden");
      $("#physicsPlay").removeClass("hidden");
    });
    $(".netlogo-view-container").css("background-color","transparent"); 
    assignDrawButtonMode("Drag"); 
    assignDrawButtonMode("Line"); 
    assignDrawButtonMode("Circle"); 
    assignDrawButtonMode("Triangle"); 
    assignDrawButtonMode("Quad"); 
    assignDrawButtonMode("Join"); 
    assignDrawButtonMode("Joint"); 
    assignDrawButtonMode("Target"); 
  }
  
  function assignDrawButtonMode(name) {
    $("#physicsDrawControls").on("click", "#physics"+name, function() {
      if ($("#physicsMenu").hasClass("selected")) {
        console.log(name);
        mode = name.toLowerCase();
        $("#physicsMenu img.selected").removeClass("selected");
        $(this).addClass("selected");
      }
    });
  }
  
  function getDrawButtonMode() {
    return mode;
  }
  
  function triggerPhysicsUpdate() {
    if (procedures.gbccOnPhysicsUpdate != undefined) { session.run('gbcc-on-physics-update'); }
  }

  function updatePhysics(state) {
    if (state === "physicsOn") {
      $("#physicsOff").removeClass("selected");
      $("#physicsOn").addClass("selected");
      $("#physicsContainer").addClass("selected");
    //  $(".netlogo-view-container").css("z-index","0");
      $("#physicsPlay").removeClass("hidden");
      $("#physicsReset").removeClass("hidden");
      $("#physicsMenu").addClass("selected");
      universe.repaint();
      Physicsb2.drawDebugData();
      $("#physicsDrag").click();
    } else {
      $("#physicsOn").removeClass("selected");
      $("#physicsOff").addClass("selected");
      $("#physicsContainer").removeClass("selected");
  //    $(".netlogo-view-container").css("z-index","1");
      //$("#physicsStateControls").addClass("hidden");
      $("#physicsMenu").removeClass("selected");
      
      $("#physicsPlay").addClass("hidden");
      $("#physicsReset").addClass("hidden");
      $("#physicsPause").addClass("hidden");
      $("#physicsMenu img.selected").removeClass("selected");
      //Physicsb2.drawDebugData();


    }
  }
  
  function startWorld() {
    $("#physicsPlay").addClass("inactive");
    $("#physicsPause").removeClass("inactive");
    Physicsb2.startWorld();
  }
  
  function stopWorld() {
    $("#physicsPause").addClass("inactive");
    $("#physicsPlay").removeClass("inactive");
    Physicsb2.stopWorld();
    if (universe.model) {
      for (var turtleId in universe.model.turtles) {
        world.turtleManager.getTurtle(turtleId).xcor = universe.model.turtles[turtleId].xcor;
        world.turtleManager.getTurtle(turtleId).ycor = universe.model.turtles[turtleId].ycor;
        world.turtleManager.getTurtle(turtleId)._heading = universe.model.turtles[turtleId].heading;
      }
    }
  }

  function removePhysics() {
    Physicsb2.stopWorld();
    $(".physics-controls").css("display","none");
    $("#physicsMenu").css("display","none");
    
    if ($("#physicsPlay").hasClass("inactive")) { 
      $("#physicsPlay").removeClass("inactive");  
      $("#physicsPause").addClass("inactive");  
    }
  }

  function patchToWorld(coords) {
    return coords;
  }
  
  function worldToPatch(coords) {
    return coords;
  }

  return {
    importPhysics: importPhysics,
    createObject: createObject,
    removeObject: removeObject,
    connectToObject: connectToObject,
    disconnectFromObject: disconnectFromObject,
    getObject: getObject,
    getObjects: getObjects,
    setupInterface: setupInterface,
    patchToWorld: patchToWorld,
    worldToPatch: worldToPatch,
    removePhysics: removePhysics,
    getDrawButtonMode: getDrawButtonMode
  };
 
})();

