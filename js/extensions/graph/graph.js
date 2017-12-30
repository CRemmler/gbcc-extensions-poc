
Graph = (function() {
  var applet1;
  var scale = -1;
  function setupInterface() {
    var spanText = "<div class='graph-controls'>";
    spanText +=       "<i id='graphOn' class='fa fa-toggle-on' aria-hidden='true'></i>";
    spanText +=       "<i id='graphOff' class='fa fa-toggle-off' aria-hidden='true'></i>";
    spanText +=    "</div>";
    spanText +=    "<div id='appletContainer'></div>";
    $(".netlogo-widget-container").append(spanText);
    $(".graph-controls").css("left", parseFloat($(".netlogo-view-container").css("left")) + parseFloat($(".netlogo-canvas").css("width")) + 8 + "px");
    $(".graph-controls").css("top", $(".netlogo-view-container").css("top"));
    $("#appletContainer").css("width", parseFloat($(".netlogo-canvas").css("width")) - 5 + "px");
    $("#appletContainer").css("height", parseFloat($(".netlogo-canvas").css("height")) - 4 + "px");
    $("#appletContainer").css("left", $(".netlogo-view-container").css("left"));
    $("#appletContainer").css("top", $(".netlogo-view-container").css("top"));
    applet1 = new GGBApplet({filename: "js/extensions/graph/geogebra-export5.ggb","showToolbar":true}, true);
    applet1.inject('appletContainer');
    $("#appletContainer").css("display", "none");
    setupEventListeners();
  }

  function resizeAppletContainer() {
    if (scale === -1) {
      var widthOrig = parseFloat($("#appletContainer").css("width"));
      var heightOrig = parseFloat($("#appletContainer").css("height"));
      
      if (widthOrig > 0 && heightOrig > 0) {
        $("#appletContainer").css("width", parseFloat($(".netlogo-canvas").css("width")) - 6 + "px");
        $("#appletContainer").css("height", parseFloat($(".netlogo-canvas").css("height")) - 6 + "px");
        var widthCurr = parseFloat($("#appletContainer").css("width"));
        var heightCurr = parseFloat($("#appletContainer").css("height"));
        if (widthCurr >= widthOrig && heightCurr >= heightOrig) {
          scale = 1;
        } else {
          scale = widthCurr / widthOrig;
          if ((heightCurr / heightOrig) < scale) { scale = heightCurr / heightOrig; }
        }
        $(".applet_scaler").css("transform", "matrix("+scale+", 0, 0, "+scale+", 0, 0)");
      } else {
        $(".applet_scaler").css("transform", "matrix(1, 0, 0, 1, 0, 0)");
      }
    } else {
      $(".applet_scaler").css("transform", "matrix("+scale+", 0, 0, "+scale+", 0, 0)");
    }
  }
  
  function updateGraph(state) {
    if (state === "graphOn") {
      $("#graphOff").removeClass("selected");
      $("#graphOn").addClass("selected");
      $("#appletContainer").addClass("selected");
      $(".netlogo-view-container").css("z-index","0");
      if (applet1.getAppletObject()) { 
        applet1.getAppletObject().showToolBar(true); 
        applet1.getAppletObject().showMenuBar(true); 
      }
      drawPatches = true;
    } else {
      $("#graphOn").removeClass("selected");
      $("#graphOff").addClass("selected");
      $("#appletContainer").removeClass("selected");
      $(".netlogo-view-container").css("z-index","1");
      if (applet1.getAppletObject()) { 
        applet1.getAppletObject().showToolBar(false); 
        applet1.getAppletObject().showMenuBar(false); 
      }
      drawPatches = false;
    }
    world.triggerUpdate();
  }
  
  function setupEventListeners() {
    $(".graph-controls").on("click", "#graphOn", function() {
      updateGraph("graphOff");
    });
    $(".graph-controls").on("click", "#graphOff", function() {
      updateGraph("graphOn");
    });
    
    resizeAppletContainer();
    $(window).resize(function() {
      resizeAppletContainer();
    });
    $(".netlogo-view-container").css("background-color","transparent");
  }
  
  function resetInterface() {
    $("#appletContainer").css("display","inline-block");
    $(".graph-controls").css("display","inline-block");
    updateGraph("graphOff");
    resizeAppletContainer();
  }

  
  function importGraph(settings) {
    Images.clearImage();
    resetInterface();
  }
  
  function createPoint(name, location) {
    
  }

  function updatePoint() {
    
  } 
  
  function deletePoint() {
    
  } 
  
  function getPoint() {
    
  } 
  
  
  function clearGraph() {
    $(".graph-controls").css("display","none");
    $("#appletContainer").css("display","none");
    updateGraph("graphOn");

  }

  function getApplet() {
    return applet1;
  }
  
  function evalCommand(cmdString) {
    Graph.getApplet().getAppletObject().evalCommand(cmdString)
  }
  
  function evalCommandGetLabels(cmdString) {
    return Graph.getApplet().getAppletObject().evalCommandGetLabels(cmdString)
  }
  
  function evalCommandCAS(cmdString) {
    return Graph.getApplet().getAppletObject().evalCommandCAS(cmdString)
  }

  return {
    
    importGraph: importGraph,
    createPoint: createPoint,
    updatePoint: updatePoint,
    deletePoint: deletePoint,
    getPoint: getPoint,
    setupInterface: setupInterface,
    clearGraph: clearGraph,
    getApplet: getApplet,
    evalCommand: evalCommand,
    evalCommandGetLabels: evalCommandGetLabels,
    evalCommandCAS: evalCommandCAS
  };
 
})();

