
Physics = (function() {
  
  function setupInterface() {
    spanText = "<span class='physics-controls'>";
    //spanText += "<span id='physicsSetup'>setup</span><span class='inactive'> | </span>";
    //spanText += "<span id='physicsPlay' class='inactive'>play</span><span class='inactive'> | </span>";
    spanText += "<span id='physicsPlay'>play</span><span class='inactive'> | </span>";
    spanText += "<span id='physicsPause' class='inactive'>pause</span></span>";
    $(".netlogo-view-container").append(spanText);
    $(".physics-controls").css("display","none");
    setupEventListeners();
  }
  
  function resetInterface() {
    $(".physics-controls").css("display","inline-block");
    if ($("#physicsPlay").hasClass("inactive")) {
      $("#physicsPlay").removeClass("inactive");
      $("#physicsPause").addClass("inactive");
    }
    $("#physicsPlay").html("play");
    //if ($("#physicsSetup").hasClass("inactive")) { $("#physicsSetup").removeClass("inactive"); }
    //if (!($("#physicsPlay").hasClass("inactive"))) { $("#physicsPlay").addClass("inactive"); }
    //if (!($("#physicsPause").hasClass("inactive"))) { $("#physicsPause").addClass("inactive"); }
  }
  
  function importPhysics(settings) {
    Images.clearImage();
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
    /*$(".physics-controls").on("click", "#physicsSetup", function() {
      if (!$(this).hasClass("inactive")) {
        setupWorld();
      }
    });*/
    $(".physics-controls").on("click", "#physicsPlay", function() {
      if (!$(this).hasClass("inactive")) {
        startWorld();
        $("#physicsPlay").html("resume");
      }
    });
    $(".physics-controls").on("click", "#physicsPause", function() {
      if (!$(this).hasClass("inactive")) {
        stopWorld();
      }
    });
  }
  
  function startWorld() {
    $("#physicsPlay").addClass("inactive");
    $("#physicsPause").removeClass("inactive");
    //$("#physicsSetup").addClass("inactive");
    Physicsb2.startWorld();
  }
  
  function stopWorld() {
    $("#physicsPause").addClass("inactive");
    $("#physicsPlay").removeClass("inactive");
    //$("#physicsSetup").removeClass("inactive");
    Physicsb2.stopWorld();
    if (universe.model) {
      for (var turtleId in universe.model.turtles) {
        world.turtleManager.getTurtle(turtleId).xcor = universe.model.turtles[turtleId].xcor;
        world.turtleManager.getTurtle(turtleId).ycor = universe.model.turtles[turtleId].ycor;
        world.turtleManager.getTurtle(turtleId)._heading = universe.model.turtles[turtleId].heading;
      }
    }
  }
  
  /*
  function setupWorld() {
    $("#physicsPlay").removeClass("inactive");
    $("#physicsPause").addClass("inactive");
    $("#physicsSetup").addClass("inactive");
    Physicsb2.redrawWorld();
  }
  */
  
  function clearWorld() {
    
    console.log("clear physics");
    Physicsb2.stopWorld();
    $(".physics-controls").css("display","none");
    if ($("#physicsPlay").hasClass("inactive")) { 
      $("#physicsPlay").removeClass("inactive");  
      $("#physicsPause").addClass("inactive");  
    }
  }


  return {
    importPhysics: importPhysics,
    createObject: createObject,
    removeObject: removeObject,
    connectToTurtle: connectToTurtle,
    getObject: getObject,
    setupInterface: setupInterface,
    clearWorld: clearWorld
  };
 
})();

