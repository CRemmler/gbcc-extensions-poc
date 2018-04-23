
Graph = (function() {
  var applet1;
  var viewWidth;
  var viewHeight;
  var viewOffsetWidth;
  var viewOffsetHeight;
  var graphWidth;
  var graphHeight;
  var points = {};
  var currentApplet = "";
  var evalCmdToggle = 0;
  
  function setupInterface() {
    //console.log("setup interface");
    viewWidth = parseFloat($(".netlogo-canvas").css("width"));
    viewHeight = parseFloat($(".netlogo-canvas").css("height"));
    var spanText = "<div class='graph-controls'>";
    spanText +=       "<i id='graphOn' class='fa fa-toggle-on' aria-hidden='true'></i>";
    spanText +=       "<i id='graphOff' class='fa fa-toggle-off' aria-hidden='true'></i>";
    spanText +=    "</div>";
    $(".netlogo-widget-container").append(spanText);
    spanText =    "<div id='appletContainer'></div>";
    $(".netlogo-widget-container").append(spanText);
    $(".graph-controls").css("left", parseFloat($(".netlogo-view-container").css("left")) + parseFloat($(".netlogo-canvas").css("width")) + 8 + "px");
    $(".graph-controls").css("top", $(".netlogo-view-container").css("top"));
    $("#appletContainer").css("width", parseFloat($(".netlogo-canvas").css("width")) - 5 + "px");
    $("#appletContainer").css("height", parseFloat($(".netlogo-canvas").css("height")) - 4 + "px");
    $("#appletContainer").css("left", $(".netlogo-view-container").css("left"));
    $("#appletContainer").css("top", $(".netlogo-view-container").css("top"));
    
    // FOR SAME-PERIMTER
    //applet1 = new GGBApplet({filename: "js/extensions/graph/geogebra-export8.ggb","showToolbar":true}, true);
    // FOR SAME-AREA
    applet1 = new GGBApplet({filename: "js/extensions/graph/geogebra-export10.ggb","showToolbar":true}, true);
    
    applet1.inject('appletContainer');
    $("#appletContainer").css("display", "none");
    setupEventListeners();
  }
  
  function updateGraph(state) {
    //console.log("updateGraph",state);
    if (state === "graphOn") {
      $("#graphOff").removeClass("selected");
      $("#graphOn").addClass("selected");
      $("#appletContainer").addClass("selected");
      $(".netlogo-view-container").css("z-index","0");
      drawPatches = true;
    } else {
      $("#graphOn").removeClass("selected");
      $("#graphOff").addClass("selected");
      $("#appletContainer").removeClass("selected");
      $(".netlogo-view-container").css("z-index","1");
      drawPatches = false;
    }
    world.triggerUpdate();
  }
  
  function setupEventListeners() {
    $(".graph-controls").on("click", "#graphOn", function() {
      updateGraph("graphOff");
      triggerGraphUpdate();
    });
    $(".graph-controls").on("click", "#graphOff", function() {
      updateGraph("graphOn");
    });
    $(".netlogo-view-container").css("background-color","transparent");    
  }
  
  function findGraphBoundaries() {
    console.log("findGraphBoundaries");
    //var xml = applet1.getAppletObject().getXML();
    //var $xml = $(xml);
    //var $element = $xml.find('size')[0];
    //if ($element) {
    //  graphWidth = parseFloat($element.getAttribute("width"));
    //  graphHeight = parseFloat($element.getAttribute("height"));
    //} else {
    //  graphWidth = viewWidth;
    //  graphHeight = viewHeight;
    //}
    
    var properties = JSON.parse(applet1.getAppletObject().getViewProperties());

    graphWidth = properties.width;
    graphHeight = properties.height;
    applet1.getAppletObject().setSize(viewWidth, viewHeight);
    viewOffsetWidth = viewWidth - graphWidth;
    viewOffsetHeight = viewHeight - graphHeight;
    console.log(graphWidth,graphHeight,viewWidth,viewHeight,viewOffsetWidth,viewOffsetHeight);
  }
  
  function resetInterface() {
    //console.log("reset interface");
    $("#appletContainer").css("display","inline-block");
    $(".graph-controls").css("display","inline-block");
    updateGraph("graphOff");
  }
  
  var canvasLength = 200; 
  var canvasWidth = 200;

  function scaleCanvas(sourceWidth, sourceHeight) {
    var dataObj = {};
    var ratio = sourceWidth / sourceHeight;
    var width = canvasWidth;
    var height = canvasWidth;
    (sourceWidth > sourceHeight) ? height = width / ratio : width = height * ratio;
    dataObj.width = width;
    dataObj.height = height;
    return dataObj;
  }
    
  function triggerGraphUpdate() {
    if (procedures.gbccOnGraphUpdate != undefined) { session.run('gbcc-on-graph-update'); }
  }

/*
  
  function importGraph(data) {
    //Images.clearImage();
    var settings = data[0];
    var elements = data[1];
    Physics.removePhysics();
    Maps.removeMap();
    Graph.removeGraph();
    world.triggerUpdate();
    if (elements != "" && applet1.getAppletObject()) { 
      applet1.getAppletObject().setXML(elements); 
    }
    resetInterface();
  }
  
  function createPoint(name, settings) {
    assignPointSettings(name, settings);
  }
  
  function updatePoint(name, settings) {
    assignPointSettings(name, settings);
  }
  */
  
  function setX(name, xcor) { 
  
  }
  function setY(name, xcor) { 
  
  }
  function setXy(name, center) { 
    //console.log("set xy");
    createPoint(name, center);
  }
  
  /*
  function assignPointSettings(name, settings) {
    console.log("assign point settings",name,settings);
    if (!points[name]) { points[name] = {}; }
    if (!points[name].settings) { points[name].settings = {}; }
    points[name].settings["patch-coords"] = [ 0, 0 ];
    points[name].settings["graph-coords"] = undefined;
    for (var i=0; i<settings.length; i++) {
      key = settings[i][0];
      value = settings[i][1];
      points[name].settings[key] = value;
    }
    var graphCoords = points[name].settings["graph-coords"];
    if (!graphCoords) {
      graphCoords = patchToGraph(points[name].settings["patch-coords"]);
      points[name].settings["graph-coords"] = graphCoords;
    } 
    try {
      applet1.getAppletObject().evalCommand(name+" = Point({"+graphCoords[0]+", "+graphCoords[1]+"})");
    } catch (ex) {
      console.log("cannot add point to applet")
    }
  }
  
  function deletePoint(name) {
    if (applet1.getAppletObject()) {
      applet1.getAppletObject().evalCommand("Delete("+name+")");
    }
  } 
  
  function getPoint(name, key) {
    if (points[name] && points[name].settings) {
      if (points[name].settings[key]) {
        return points[name].settings[key];
      }
    }
    return [ "does not exist" ]
  }
  
  function getPoints() {
    var pointList = [];
    var mark;
    for (point in points) {
      pointSettings = [];
      for (setting in points[point].settings) {
        mark = [ setting, points[point].settings[setting]];
        pointSettings.push(mark);
      }
      pointList.push([point, pointSettings]);
      
    }
    return pointList;
    
    return [];
  }
  
  
  function getElements() {
    var results = [];
    var result;
    var body;
    var allBodies = Physicsb2.getAllBodies();
    for (obj in allBodies) {
      body = allBodies[obj];
      //result = body.GetAngle() / Math.PI * 180;
      //if (result < 0) { result+= 360;}
      //results.push(Math.round(result));
      result = body.GetPosition();
      results.push([ Math.round(result.x), Math.round(result.y) ]);
    }
    //console.log(results);
    return results;

    //return applet1.getAppletObject().getXML()
  }

  function removeGraph() {
    $(".graph-controls").css("display","none");
    $("#appletContainer").css("display","none");
    if (applet1.getAppletObject()) {
      var xml = $.parseXML(applet1.getAppletObject().getXML());
      var $xml = $(xml);
      var $construction = $xml.find('construction');
      $construction.find('element').each(function(){
        Graph.getApplet().getAppletObject().evalCommand("Delete("+$(this).attr('label')+")");
      });
      updateGraph("graphOn");
    }
  }
  */
  function getBounds() {
    if (applet1.getAppletObject()) {
      //applet1.getAppletObject().setSize(viewWidth, viewHeight);
      applet1.getAppletObject().setWidth(viewWidth);
      applet1.getAppletObject().setHeight(viewHeight);
      console.log("set width and height "+viewWidth+" "+viewHeight);
      applet1.getAppletObject().setSize(viewWidth,viewHeight);
      var properties = JSON.parse(applet1.getAppletObject().getViewProperties());
      var xMin = properties.xMin;
      var yMin = properties.yMin;;    
      var xScale = properties.invXscale;
      var yScale = properties.invYscale;
      width = viewWidth;
      height = viewHeight;
      var xMax = width * xScale + xMin; // how many sections there are  
      var yMax = height * yScale + yMin;
      return {xmin: xMin, xmax: xMax , ymin: yMin, ymax: yMax};
    } else {
      return {xmin: 0, xmax: 0, ymin: 0, ymax: 0};
    }
  }
  function getApplet() {
    return applet1;
  }
  /*
  function evalCommand(cmdString) {
    if (Graph.getApplet().getAppletObject())
    Graph.getApplet().getAppletObject().evalCommand(cmdString);
  }
  
  function evalCommandGetLabels(cmdString) {
    return Graph.getApplet().getAppletObject().evalCommandGetLabels(cmdString);
  }
  
  function evalCommandCAS(cmdString) {
    return Graph.getApplet().getAppletObject().evalCommandCAS(cmdString);
  }
  */
  
  function patchToGraph(coords) {
    if (!viewOffsetWidth) {
      findGraphBoundaries(); 
    }
    var xcor = coords[0];
    var ycor = coords[1];
    var pixelX = universe.view.xPcorToPix(xcor);
    var pixelY = universe.view.yPcorToPix(ycor);
    pixelX -= (viewOffsetWidth / 2);
    pixelY -= (viewOffsetHeight / 2);
    var pixelPercentX = (pixelX / (graphWidth));
    var pixelPercentY = 1 - (pixelY / (graphHeight));
    var boundaries = getBounds();
    var boundaryMinX = boundaries.xmin;
    var boundaryMinY = boundaries.ymin;
    var boundaryMaxX = boundaries.xmax;
    var boundaryMaxY = boundaries.ymax;
    var pointX = (pixelPercentX * (boundaryMaxX - boundaryMinX)) + boundaryMinX;
    var pointY = (pixelPercentY * (boundaryMaxY - boundaryMinY)) + boundaryMinY;
    return [pointX, pointY];
  }
  
  function graphToPatch(coords) {
    if (!viewOffsetWidth) {
      findGraphBoundaries(); 
    }
    var pointPositionX = coords[0];
    var pointPositionY = coords[1];
    var boundaries = getBounds();
    var boundaryMinX = boundaries.xmin;
    var boundaryMinY = boundaries.ymin;
    var boundaryMaxX = boundaries.xmax;
    var boundaryMaxY = boundaries.ymax;
    if ( pointPositionX < boundaryMinX 
      || pointPositionX > boundaryMaxX
      || pointPositionY < boundaryMinY
      || pointPositionY > boundaryMaxY) {
      return (["out of bounds", "out of bounds"]);
    }
    var pointPercentX = 1 - ((boundaryMaxX - pointPositionX) / (boundaryMaxX - boundaryMinX));
    var pointPercentY = (boundaryMaxY - pointPositionY) / (boundaryMaxY - boundaryMinY);
    var pixelX = pointPercentX * graphWidth;
    var pixelY = pointPercentY * graphHeight;
    pixelX += (viewOffsetWidth / 2);    
    pixelY += (viewOffsetHeight / 2);
    var patchXcor = universe.view.xPixToPcor(pixelX);
    var patchYcor = universe.view.yPixToPcor(pixelY);
    return ([patchXcor, patchYcor]);
  }
  
  function getXml() {
    return getConstructions()
  }
  function setXml(xmlString) {
    return setConstructions(xmlString);
  }
  function createGraph() { }
  function showGraph() { 
    drawPatches = false;
    universe.repaint();
  }
  function deleteGraph() { }
  function hideGraph() { 
    drawPatches = false;
    universe.repaint();
  }
  function importGraph(data) {
    //console.log("import graph");
    resetInterface();
  }
  
  function loadFile(filename) {
    //console.log("load file");
    applet1 = new GGBApplet({filename: "js/extensions/graph/"+filename,"showToolbar":true}, true);
    applet1.inject('appletContainer');
    resetInterface();
  }
  
  function importFile(filename) { 
    loadFile(filename);
  }
  
  function exportGraph() { }
  function createPoint(name, center) { 
    evalCommand(name+" = Point({"+center[0]+", "+center[1]+"})");
  }
  function createPoints(data) { 
    //console.log("create points",data);
    var pointsList = data;
    for (var p=0; p<pointsList.length; p++) {
      createPoint(pointsList[p][0], pointsList[p][1]);
    }
  }
  function getPoints() { 
    var xml = applet1.getAppletObject().getXML();
    var $xml = $(xml);
    var $construction = $xml.find("construction");
    var $elements = $construction.find("element");
    var element, $element;
    var $points, point;
    var x, y;
    var pointsList = [];
    //console.log($($elements)[1])
    for (var e = 0; e<$elements.length; e++) {
      element = $elements[e];
      type = element.getAttribute("type");
      $element = $(element);
      if (type === "point") {
        $points = $(element).find("coords");
        x = parseInt($($points)[0].getAttribute("x"));
        y = parseInt($($points)[0].getAttribute("y"));
        label = element.getAttribute("label");
        if (x != "NaN" && y != "NaN") {
          pointsList.push([ label, [x, y]]);
        }
      }
    }
    //console.log(pointsList);
    return pointsList;
  }
  function getPoint(name) {
    var pointsList = getPoints();
    for (var i=0; i<pointsList.length; i++) {
      if (name === pointsList[i][0]) {
        return pointsList[i];
      }
    }
    return ["null" [ 0, 0]];
  }
  function deletePoints() { }
  function getConstructions() { 
    return applet1.getAppletObject().getXML();
  }
  function setConstructions(data) { 
    applet1.getAppletObject().setXML(data);
  }
  function appendConstructions(data) { }
  /*function setX(name, xcor) { }
  function setY(name, xcor) { }
  function setXy(name, center) { }*/
  function setLabel(name, label) { }
  function setElements(xml) { }
  function getX(name) { return parseFloat(getPoint(name)[1][0]); }
  function getY(name) { return parseFloat(getPoint(name)[1][1]); }
  function getXy(name) { 
    var point = getPoint(name);
    return [parseFloat(point[1][0]), parseFloat(point[1][1]) ]
  }
  function getLabel(name) { }
  function deletePoint(name) { 
    evalCommand("Delete("+name+")");
    //applet1.getAppletObject().evalCommand("Delete("+name+")");
  }
  //function graphToPatch(coords) { }
  //function patchToGraph(coords) { }
  //function evalCommand(command) { }
  
  function evalCommand(cmdString) {
    try {
      applet1.getAppletObject().evalCommand(cmdString);
    } catch (ex) {
      console.log("cannot evalCommand")
    }
  }
  
  function adjustSize() {
    if (viewWidth && viewHeight) {
      //console.log("set it at ",viewWidth,viewHeight)
      applet1.getAppletObject().setWidth(viewWidth + random(1)*10);
      applet1.getAppletObject().setHeight(viewHeight + random(1)*10); 
    }
  }

  function evalCommandCas(command) { }
  function evalCommandGetLabels(command) { }

  return {
    /*
    importGraph: importGraph,
    createPoint: createPoint,
    updatePoint: updatePoint,
    deletePoint: deletePoint,
    getPoint: getPoint,
    getPoints: getPoints,
    getElements: getElements,
    setupInterface: setupInterface,
    getApplet: getApplet,
    evalCommand: evalCommand,
    evalCommandGetLabels: evalCommandGetLabels,
    evalCommandCAS: evalCommandCAS,
    patchToGraph: patchToGraph,
    graphToPatch: graphToPatch,
    removeGraph: removeGraph
    */

    createGraph: createGraph,
    deleteGraph: deleteGraph,
    hideGraph: hideGraph,
    importGraph: importGraph,
    importFile: importFile,
    exportGraph: exportGraph,
    createPoint: createPoint,
    createPoints: createPoints,
    getPoints: getPoints,
    deletePoints: deletePoints,
    getConstructions: getConstructions,
    setConstructions: setConstructions,
    appendConstructions: appendConstructions,
    setX: setX,
    setY: setY,
    setXy: setXy,
    setLabel: setLabel,
    setElements: setElements,
    getX: getX,
    getY: getY,
    getXy: getXy,
    getLabel: getLabel,
    deletePoint: deletePoint,
    graphToPatch: graphToPatch,
    patchToGraph: patchToGraph,
    evalCommand: evalCommand,
    evalCommandCas: evalCommandCas,
    evalCommandGetLabels: evalCommandGetLabels,
    
    showGraph: showGraph,
    getApplet: getApplet,
    setupInterface: setupInterface,
    getXml: getXml,
    setXml: setXml
  };
 
})();

