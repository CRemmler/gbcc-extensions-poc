
Graph = (function() {
  var applet1;
  var viewWidth;
  var viewHeight;
  var viewOffsetWidth;
  var viewOffsetHeight;
  var graphWidth;
  var graphHeight;
  var points = {};
  
  function setupInterface() {
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
    applet1 = new GGBApplet({filename: "js/extensions/graph/geogebra-export7.ggb","showToolbar":true}, true);
    applet1.inject('appletContainer');
    $("#appletContainer").css("display", "none");
    setupEventListeners();
  }
  
  function updateGraph(state) {
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
      console.log("trigger graph update");
      triggerGraphUpdate();
    });
    $(".graph-controls").on("click", "#graphOff", function() {
      updateGraph("graphOn");
    });
    $(".netlogo-view-container").css("background-color","transparent");    
  }
  
  function resetInterface() {
    $("#appletContainer").css("display","inline-block");
    $(".graph-controls").css("display","inline-block");
    if (applet1.getAppletObject()) {
      applet1.getAppletObject().setSize(parseFloat($(".netlogo-canvas").css("width")) - 5, parseFloat($(".netlogo-canvas").css("height")) - 5);
      var xml = $.parseXML(applet1.getAppletObject().getXML());
      var $xml = $(xml);
      var $elements = $xml.find('size');
      graphWidth = $elements.attr("width");
      graphHeight = $elements.attr("height"); 
      viewOffsetWidth = viewWidth - graphWidth;
      viewOffsetHeight = viewHeight - graphHeight;
      updateGraph("graphOff");
    }
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
  
  function getBounds() {
    if (applet1.getAppletObject()) {
      var xml = $.parseXML(applet1.getAppletObject().getXML());
      var $xml = $(xml);
      var $elements = $xml.find('coordSystem');
      var xZero = $elements.attr("xZero");
      var yZero = $elements.attr("yZero");    
      var scale = $elements.attr("scale");
      var yscale = $elements.attr("yscale");  
      $elements = $xml.find('size');
      var width = $elements.attr("width");
      var height = $elements.attr("height"); 
      var xunit = width / scale;
      var distanceToX = xZero;
      var xmin = -1 * distanceToX / scale;
      var distanceFromX = width - xZero;
      var xmax = distanceFromX / scale;
      //console.log("xmin/xmax "+xmin+" "+xmax);
      var yunit = height / scale;
      var distanceToY = yZero;
      var ymax = distanceToY / yscale;
      var distanceFromY = height - yZero;
      var ymin = -1 * distanceFromY / yscale;  
      //console.log("ymin/ymax "+ymin+" "+ymax);
          
      return ({xmin: xmin, xmax: xmax, ymin: ymin, ymax: ymax});
    } else {
      return ({xmin: 0, xmax: 0, ymin: 0, ymax: 0});
    }
  }

  function getApplet() {
    return applet1;
  }
  
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
  
  function patchToGraph(coords) {
    var xcor = coords[0];
    var ycor = coords[1];
    var pixelX = universe.view.xPcorToCanvas(xcor);
    var pixelY = universe.view.yPcorToCanvas(ycor);
    pixelX -= (viewOffsetWidth * 2);
    pixelY -= (viewOffsetHeight * 2);
    var pixelPercentX = (pixelX / (graphWidth * 2));
    var pixelPercentY = 1 - (pixelY / (graphHeight* 2));
    var boundaries = getBounds();
    var boundaryMinX = boundaries.xmin;
    var boundaryMinY = boundaries.ymin;
    var boundaryMaxX = boundaries.xmax;
    var boundaryMaxY = boundaries.ymax;
    var pointX = (pixelPercentX * (boundaryMaxX - boundaryMinX)) + boundaryMinX;
    var pointY = (pixelPercentY * (boundaryMaxY - boundaryMinY)) + boundaryMinY;
    return ([pointX, pointY]);
  }
  
  function outOfBounds(coords) {
    
    return (["out of bounds", [5, 5], 180]);
  }
  
  function graphToPatch(coords) {
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
      //return outOfBounds(coords);
      return (["out of bounds"]);
    }
    //console.log("in bounds");
    var pointPercentX = 1 - ((boundaryMaxX - pointPositionX) / (boundaryMaxX - boundaryMinX));
    var pointPercentY = (boundaryMaxY - pointPositionY) / (boundaryMaxY - boundaryMinY);
    var pixelX = pointPercentX * graphWidth;
    var pixelY = pointPercentY * graphHeight;
    pixelX += (viewOffsetWidth);    
    pixelY += (viewOffsetHeight);
    var patchXcor = universe.view.xPixToPcor(pixelX);
    var patchYcor = universe.view.yPixToPcor(pixelY);
    return ([patchXcor, patchYcor]);
  }

  return {
    
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
  };
 
})();

