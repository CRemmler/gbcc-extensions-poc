
Physics = (function() {
  
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
    $(".physics-controls").css("display","none");
    setupEventListeners();
  }
  
  function resetInterface() {
    $("#physicsContainer").css("display","inline-block");
    $(".physics-controls").css("display","inline-block");
    updatePhysics("physicsOff");
  }
  
  function importPhysics(settings) {
    //Images.clearImage();
    Physics.removePhysics();
    Maps.removeMap();
    Graph.removeGraph();
    world.triggerUpdate();
    Physicsb2.createWorld(settings);
    resetInterface();
  }
  
  function createObject(name, settings) {
    var action = settings.shift();
    var id, bodyCoords, fixtureCoords, heading;
    var radius;
    settings = settings[0];
    switch (action) {
      case "static-edge":
        parentId = name+"parent";
        heading = settings.pop();
        bodyCoords = [ ((settings[0][0] - -settings[1][0]) / 2), ((settings[0][1] - -settings[1][1]) / 2)] 
        fixtureCoords = settings;
        Physicsb2.addBody([ parentId, "static", parentId, bodyCoords, heading ]);
        Physicsb2.addFixtureToBody([ name+"child", parentId, bodyCoords, fixtureCoords, "edge", [0.1, 0.1, 0.3], 0 ]);  
        break;
      case "dynamic-circle":
        parentId = name+"parent";
        bodyCoords = [settings[0], settings[1]];
        radius = settings[2];
        heading = settings[3];
        fixtureCoords = [ [ settings[0], settings[1] ], [ settings[0]+radius, settings[1]+radius ]]
        Physicsb2.addBody([ parentId, "dynamic", parentId, bodyCoords, heading]);
        Physicsb2.addFixtureToBody([ name+"child", parentId, bodyCoords, fixtureCoords, "circle", [0.5, 0.2, 0.7], 0]);  
        break;
      default:
        break;
    }
    Physicsb2.redrawWorld();
  }
  
  function connectToTurtle(name, who) {
    parentId = name+"parent";
    //console.log("connect to turtle "+parentId+" to " + who);
    Physicsb2.updateBodyId(parentId, who);
  }
  
  function removeObject(name) {
    
  }
  
  function getObject(name) {
    
  }
  

  function setupEventListeners() {
    $(".physics-controls").on("click", "#physicsOn", function() {
      updatePhysics("physicsOff");
      triggerPhysicsUpdate();
      stopWorld();
      //Physicsb2.updateOnce();
    });
    $(".physics-controls").on("click", "#physicsOff", function() {
      updatePhysics("physicsOn");
      startWorld();
    });
    $(".netlogo-view-container").css("background-color","transparent"); 
  }
  
  function triggerPhysicsUpdate() {
    if (procedures.gbccOnPhysicsUpdate != undefined) { session.run('gbcc-on-physics-update'); }
  }

  function updatePhysics(state) {
    if (state === "physicsOn") {
      $("#physicsOff").removeClass("selected");
      $("#physicsOn").addClass("selected");
      $("#physicsContainer").addClass("selected");
      $(".netlogo-view-container").css("z-index","0");
      //drawPatches = true;
    } else {
      $("#physicsOn").removeClass("selected");
      $("#physicsOff").addClass("selected");
      $("#physicsContainer").removeClass("selected");
      $(".netlogo-view-container").css("z-index","1");
      //drawPatches = false;
    }
    world.triggerUpdate();
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
    console.log("clear physics");
    Physicsb2.stopWorld();
    $(".physics-controls").css("display","none");
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
    connectToTurtle: connectToTurtle,
    getObject: getObject,
    setupInterface: setupInterface,
    patchToWorld: patchToWorld,
    worldToPatch: worldToPatch,
    removePhysics: removePhysics
  };
 
})();

