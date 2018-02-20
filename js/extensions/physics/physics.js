
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
    spanText +=       "<div class='leftControls'>"; //id='physicsDrawControls'>";
    
    
    spanText +=         " <img src='js/extensions/physics/images/a1.png' class='physics-drag purple hidden'>"
    spanText +=         " <img src='js/extensions/physics/images/a2.png' class='physics-drag white'>"
    spanText +=         " <img src='js/extensions/physics/images/a3.png' class='physics-line purple hidden'>"
    spanText +=         " <img src='js/extensions/physics/images/a4.png' class='physics-line white'>"
    spanText +=         " <img src='js/extensions/physics/images/a5.png' class='physics-circle purple hidden'>"
    spanText +=         " <img src='js/extensions/physics/images/a6.png' class='physics-circle white'>"
    spanText +=         " <img src='js/extensions/physics/images/a7.png' class='physics-triangle purple hidden'>"
    spanText +=         " <img src='js/extensions/physics/images/a8.png' class='physics-triangle white'>"
    spanText +=         " <img src='js/extensions/physics/images/a9.png' class='physics-group purple hidden'>"
    spanText +=         " <img src='js/extensions/physics/images/a10.png' class='physics-group white'>"
    spanText +=         " <img src='js/extensions/physics/images/a11.png' class='physics-target purple hidden'>"
    spanText +=         " <img src='js/extensions/physics/images/a12.png' class='physics-target white'>"
    
    
    
    /*
    spanText +=         " <img src='js/extensions/physics/images/img-2.png' id='physicsDrag'>"
    spanText +=         " <img src='js/extensions/physics/images/img6.png' id='physicsLine'>"
    spanText +=         " <img src='js/extensions/physics/images/img4.png' id='physicsCircle'>"
    spanText +=         " <img src='js/extensions/physics/images/img7.png' id='physicsTriangle'>"
    //spanText +=         " <img src='js/extensions/physics/images/img8.png' id='physicsQuad'>"
    spanText +=         " <img src='js/extensions/physics/images/img3.png' id='physicsGroup'>"
    //spanText +=         " <img src='js/extensions/physics/images/img2.png' id='physicsJoint'>"
    spanText +=         " <img src='js/extensions/physics/images/img1.png' id='physicsTarget'>"
    */
    
    
    spanText +=       "</div>";
    spanText +=       "<div class='rightControls'>"; //"<div id='physicsStateControls'>";
    
    spanText +=         "<i class='fa fa-save' id='physicsSave' aria-hidden='true'></i>";
    spanText +=         " <i class='fa fa-refresh' id='physicsRefresh' aria-hidden='true'></i>";
    spanText +=         " <i class='fa fa-play' id='physicsPlay' aria-hidden='true'></i>";
    spanText +=         " <i class='fa fa-pause hidden' id='physicsPause' aria-hidden='true'></i>";
    spanText +=       "</div>";
    spanText += "</div>";
    $(".netlogo-view-container").append(spanText);  
    
    spanText =  "<div id='physicsSettings' class='hidden'>";
    spanText += "  <div class='leftControls'>";//"<span id='shapeSettings'>";
    spanText += "    <div id='dragModeSettings'>";
    spanText += "      Id: <input class='objectId' type='text'>";
    spanText += "      Color: <select id='color'>";
    spanText += "        <option value='(none)'>(none)</option>";
    spanText += "        <option value='#ff000032'>red</option>";
    spanText += "        <option value='#ffa50032'>orange</option>";
    spanText += "        <option value='#ffff0032'>yellow</option>";
    spanText += "        <option value='#00ff0032'>green</option>";
    spanText += "        <option value='#0000ff32'>blue</option>";
    spanText += "        <option value='#80008032'>purple</option>";
    spanText += "        <option value='(other)'>(other)</option>";
    spanText += "      </select>";
    spanText += "      D:<input type='number' id='density'>";
    spanText += "      R:<input type='number' id='restitution'>";
    spanText += "      F:<input type='number' id='friction'>";
    spanText += "    </div>";
    spanText += "    <div id='groupModeSettings' class='in-line-block'>";
    spanText += "      Id: <input class='objectId' type='text' value='123'>";
    spanText += "      Type:<select class='objectType' style='background-color:white'><option value='2'>Dynamic</option><option value='0'>Static</option><option value='1'>Ghost</option></select>";
    spanText += "      Angle:<input type='number' id='angle'>";
    spanText += "    </div>"
    spanText += "  </div>"; 
    spanText += "  <div class='rightControls'>";//"<span id='physicsTrash'>";
    spanText += "    <i class='fa fa-trash-o' id='physicsDelete' aria-hidden='true'></i>";
    spanText += "  </div>";
    spanText += "</div>";
    
    $(".netlogo-view-container").append(spanText);  
    $("#physicsMenu").css("display", "none");
    //$("#physicsSettings").css("display", "none");
    //$("#physicsSettings").
    setupEventListeners();
  }
  
  function resetInterface() {
    $("#physicsContainer").css("display","inline-block");
    $(".physics-controls").css("display","inline-block");
    $("#physicsMenu").css("display","inline-block");
    $("#physicsMenu .purple").addClass("hidden");
    $("#physicsMenu .white").removeClass("hidden");
    
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
    var objects = [];
    var color = "(none)";
    var bodyCoords, fixtureCoords;
    for (var i=0; i<settings.length; i++) {
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
        case "objects": objects = value; break;
        case "color": color = value; break;
        case "bodyA": bodyA = value; break;
        case "force": force = value; break;
      }
            
    }
    if (typeof color === "object") {
      color = rgbToHex(color);
    }
    parentId = name+"parent";
    if (shape === "line") {
      bodyCoords = [ (coords[0][0] - -coords[1][0]), (coords[0][1] - -coords[1][1]) / 2 ];
      fixtureCoords = coords;
    }
    if (shape === "circle") {
      bodyCoords = coords;
      fixtureCoords = [ [ coords[0], coords[1]], [coords[0]+radius, coords[1]+radius ]];
    }
    if (shape === "polygon") {
      bodyCoords = coords;
    }
    if (behavior === "group") {
      Physicsb2.updateGroup({
        "parentId": name,
        "objects": objects 
      });
    } else if (behavior === "target") {
      
      //physics:create-object "target" [ ["bodyA" "ball"] ["heading" angle ] [ "force" force]  ]
      Physicsb2.applyForce({
        "bodyA": bodyA,
        "heading": heading,
        "force": force
      });
    } else {
      Physicsb2.createBody({
        "parentId": parentId, 
        "behavior": behavior, 
        "bodyCoords": bodyCoords, 
        "heading": heading 
      });
      Physicsb2.addBodyToWorld(parentId, parentId);
      Physicsb2.createFixture({
        "name": name, 
        "bodyCoords": bodyCoords, 
        "fixtureCoords": fixtureCoords, 
        "shape": shape, 
        "settings": [density, friction, restitution],
        "color": color
      });  
      Physicsb2.addFixtureToBody({
        "fixtureId": name, 
        "bodyId": parentId, 
      });  
      //Physicsb2.addTargetToBody({
      //  "id": name+"-"+target,
      //  "bodyA": parentId,
      //  "coords": null
      //});
      
      
  
        
    }

    Physicsb2.redrawWorld();
    
  }
  
  function rgbToHex(color) {
    var result;
    var r = color[0];
    var g = color[1];
    var b = color[2];
    if (color[3] != undefined) {
      var a = color[3];
      a = a.toString(16);
      if (a.length === 1) { a = "0" + a; }
    }
    r = r.toString(16);
    g = g.toString(16);
    b = b.toString(16);
    if (r.length === 1) { r = "0" + r; }
    if (g.length === 1) { g = "0" + g; }
    if (b.length === 1) { b = "0" + b; }
    result = r+g+b;
    if (color[3] != undefined) {
      var a = color[3];
      a = a.toString(16);
      if (a.length === 1) { a = "0" + a; }
      result = result + a;
    }
    return "#"+result;
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
    var results = [];
    var body;
    var allBodies = Physicsb2.getAllBodies();
    for (obj in allBodies) {
      body = allBodies[obj];
      results.push(body.GetAngle());
    }
    console.log(results);
    return results;
  }
  
  function getObjects() {
    //console.log("get objects");
    /*
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
      //console.log("name:"+name+" bodyType:"+bodyType+" fixtureType:"+ fixtureType+" position:"+position.x+","+position.y+" angle:"+angle);
      if (fixtureType === "circle") {
        //console.log("radius: "+radius);
      }
    }*/
    var results = [];
    var body;
    var allBodies = Physicsb2.getAllBodies();
    for (obj in allBodies) {
      body = allBodies[obj];
      results.push(body.GetAngle() * Math.PI );
    }
    console.log(results);
    return results;
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
      $("#physicsMenu .leftControls").removeClass("selected");
    });
    $("#physicsMenu").on("click", "#physicsPause", function() {
      stopWorld();
      $(this).addClass("hidden");
      $("#physicsPlay").removeClass("hidden");
      
      $("#physicsMenu .leftControls").addClass("selected");
    });
    $("#physicsSettings").on("click", "#physicsDelete", function() {
      console.log("delete it");
      Physicsb2.deleteSelected();
    });
    $(".netlogo-view-container").css("background-color","transparent"); 
    assignDrawButtonMode("drag"); 
    assignDrawButtonMode("line"); 
    assignDrawButtonMode("circle"); 
    assignDrawButtonMode("triangle"); 
    //assignDrawButtonMode("quad"); 
    assignDrawButtonMode("group"); 
    //assignDrawButtonMode("joint"); 
    assignDrawButtonMode("target");
    assignSettings("color");
    assignSettings("density");
    assignSettings("restitution");
    assignSettings("friction");
    assignSettings("objectId");
    

  }
  
  function assignSettings(setting) {
    $("#physicsSettings .leftControls").on("change", "#"+setting, function () {
      console.log("setting " + setting + " changed");
      console.log($(this).val());
      var value = $(this).val();
      var fixtureId = $(".objectId").val();
      if (["color","density","restitution","friction"].indexOf(setting) > -1) {
        Physicsb2.updateFixture(fixtureId, setting, value);
      }
    });
  }
  
  function assignDrawButtonMode(buttonMode) {
    $("#physicsMenu .leftControls").on("click", ".physics-"+buttonMode, function() {
      if ($("#physicsMenu .leftControls").hasClass("selected")) {
        $("#physicsMenu .purple").addClass("hidden");
        $("#physicsMenu .white").removeClass("hidden");
        $(".physics-"+buttonMode+".purple").removeClass("hidden");
        $(".physics-"+buttonMode+".white").addClass("hidden");
        mode = buttonMode;
        Physicsb2.triggerModeChange(mode);
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
      $("#physicsPlay").removeClass("hidden");
      $("#physicsMenu .rightControls i:not(#physicsPause)").removeClass("hidden");
      //$("#physicsMenu").addClass("selected");
      $("#physicsMenu div").addClass("selected");
      
      universe.repaint();
      Physicsb2.drawDebugData();
      $(".physics-drag").click()
    } else {
      $("#physicsOn").removeClass("selected");
      $("#physicsOff").addClass("selected");
      $("#physicsContainer").removeClass("selected");
      $("#physicsMenu").removeClass("selected");
      $("#physicsMenu .rightControls i").addClass("hidden");
      
      $("#physicsMenu div").removeClass("selected");
      
      $("#physicsMenu img.selected").removeClass("selected");
      $(".physics-drag").click()
    }
    $("#physicsSettings").addClass("hidden");
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
    $(".netlogo-canvas").off("keydown");
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

