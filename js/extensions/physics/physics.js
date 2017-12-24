
Physics = (function() {
  
  function importPhysics(settings) {
    Physicsb2.createWorld(settings);
  }
  function createObject(name, settings) {
    var action = settings.shift();
    settings = settings[0];
    switch (action) {
      case "static-edge":
        var id = settings[2];
        if (id === -1) { id = name+"parent"; }
        var bodyCoords = [ ((settings[0][0] - -settings[1][0]) / 2), ((settings[0][1] - -settings[1][1]) / 2)] 
        var fixtureCoords = settings;
        fixtureCoords.pop();
        Physicsb2.addBody([ id, "static", name+"parent", bodyCoords, 0 ]);
        Physicsb2.addFixtureToBody([ name+"child", id, bodyCoords, fixtureCoords, "edge", [0.1, 0.1, 0.3], 0 ]);  
        break;
      case "dynamic-circle":
        var id = settings[3];
        if (id === -1) { id = name+"child"; }
        var bodyCoords = [settings[0], settings[1]];
        var radius = settings[2];
        var fixtureCoords = [ [ settings[0], settings[1] ], [ settings[0]+radius, settings[1]+radius ]]
        Physicsb2.addBody([ id, "dynamic", name+"parent", bodyCoords, 0]);
        Physicsb2.addFixtureToBody([ name+"child", id, bodyCoords, fixtureCoords, "circle", [0.5, 0.2, 0.9], 0]);  
        break;
      default:
        break;
    }
  }
  function connectToTurtle(name, who) {
    
  }
  function removeObject(name) {
    
  }
  function getObject(name) {
    
  }

  return {
    importPhysics: importPhysics,
    createObject: createObject,
    removeObject: removeObject,
    getObject: getObject
  };
 
})();

