
Graph = (function() {
  var applet1;
  var viewWidth;
  var viewHeight;
  var viewOffsetWidth;
  var viewOffsetHeight;
  var graphWidth;
  var graphHeight;
  
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

  function importGraph(settings) {
    //Images.clearImage();
    Physics.removePhysics();
    Maps.removeMap();
    Graph.removeGraph();
    world.triggerUpdate();
    resetInterface();
  }
  
  function createPoint(name, location) {
    var xcor = location[0];
    var ycor = location[1];
    applet1.getAppletObject().evalCommand(name+" = Point({"+xcor+", "+ycor+"})");
  }

  function updatePoint(name, location) {
    if (applet1.getAppletObject().exists(name)) {
      var xcor = location[0];
      var ycor = location[1];
      applet1.getAppletObject().evalCommand(name+" = Point({"+xcor+", "+ycor+"})");
    }
  } 
  
  function deletePoint(name) {
    applet1.getAppletObject().evalCommand("Delete("+name+")");
  } 
  
  function getPoint(name) {
    var xcor = applet1.getAppletObject().getXcoord(name);
    var ycor = applet1.getAppletObject().getYcoord(name);
    return [xcor, ycor];
  } 

  function removeGraph() {
    $(".graph-controls").css("display","none");
    $("#appletContainer").css("display","none");
    var xml = $.parseXML(applet1.getAppletObject().getXML());
    var $xml = $(xml);
    var $construction = $xml.find('construction');
    $construction.find('element').each(function(){
      Graph.getApplet().getAppletObject().evalCommand("Delete("+$(this).attr('label')+")");
    });
    updateGraph("graphOn");
  }
  
  function getBounds() {
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
  }

  function getApplet() {
    return applet1;
  }
  
  function evalCommand(cmdString) {
    Graph.getApplet().getAppletObject().evalCommand(cmdString);
  }
  
  function evalCommandGetLabels(cmdString) {
    return Graph.getApplet().getAppletObject().evalCommandGetLabels(cmdString);
  }
  
  function evalCommandCAS(cmdString) {
    return Graph.getApplet().getAppletObject().evalCommandCAS(cmdString);
  }
  
  function setPointXY(name, settings) {
    var xcor = settings[0];
    var ycor = settings[1];
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
    applet1.getAppletObject().evalCommand(name+" = Point({"+pointX+", "+pointY+"})");
  }
  function getPointXY(name) {
    
    var xcor = applet1.getAppletObject().getXcoord(name);
    var ycor = applet1.getAppletObject().getYcoord(name);

    
    var pointPositionX = pointPosition.lng();
    var pointPositionY = pointPosition.lat();
    
    var boundaries = getBounds();
    var boundaryMinX = boundaries.xmin;
    var boundaryMinY = boundaries.ymin;
    var boundaryMaxX = boundaries.xmax;
    var boundaryMaxY = boundaries.ymax;
    
    var pointPercentX = 1 - ((boundaryMaxX - pointPositionX) / (boundaryMaxX - boundaryMinX));
    var pointPercentY = (boundaryMaxY - pointPositionY) / (boundaryMaxY - boundaryMinY);
    var pixelX = pointPercentX * graphWidth;
    var pixelY = pointPercentY * graphHeight;
    pixelX += (viewOffsetWidth * 2);    
    pixelY += (viewOffsetHeight * 2);
    
    var patchXcor = universe.view.xPixToPcor(pixelX);
    var patchYcor = universe.view.yPixToPcor(pixelY);
    return ([patchXcor, patchYcor]);
  }
  function setPointGXY(name, settings) {
    var xcor = location[0];
    var ycor = location[1];
    //console.log("set point graph xy "+xcor+" "+ycor);
    applet1.getAppletObject().evalCommand(name+" = Point({"+xcor+", "+ycor+"})");
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
  
  function getPointGXY(name) {
    var xcor = applet1.getAppletObject().getXcoord(name);
    var ycor = applet1.getAppletObject().getYcoord(name);
    //console.log("get point graph xy "+xcor+" "+ycor);
    return ([xcor, ycor]);
  }
  
  function getPoint(name) {
    var xcor = applet1.getAppletObject().getXcoord(name);
    var ycor = applet1.getAppletObject().getYcoord(name);
    return ([xcor, ycor]);
  }

  return {
    
    importGraph: importGraph,
    createPoint: createPoint,
    updatePoint: updatePoint,
    deletePoint: deletePoint,
    getPoint: getPoint,
    setupInterface: setupInterface,
    getApplet: getApplet,
    evalCommand: evalCommand,
    evalCommandGetLabels: evalCommandGetLabels,
    evalCommandCAS: evalCommandCAS,
    setPointXY: setPointXY,
    getPointXY: getPointXY,
    setPointGXY: setPointGXY,
    getPointGXY: getPointGXY,
    patchToGraph: patchToGraph,
    graphToPatch: graphToPatch,
    removeGraph: removeGraph
  };
 
})();

