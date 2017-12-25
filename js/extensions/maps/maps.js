
Maps = (function() {

  var zoom = 13;
  var location = "Austin TX";
  
  function setupInterface() {
    $("body").append("<div id='map' style='height:400px;width:400px;border:2px solid red;'></div>");
    var uluru = {lat: -25.363, lng: 131.044};
    var map = new google.maps.Map(document.getElementById('map'), {
      zoom: zoom,
      center: uluru
    });
    var marker = new google.maps.Marker({
      position: uluru,
      map: map
    });
        
    spanText = "<div class='maps-controls'>";
    //left controls
    spanText += "<div class='maps-controls-left'>";
    //search
    spanText += "  <div class='maps-search'>";
    spanText += "    <span id='mapsSearch'><input id='mapsSearchInputtype='text'> <i class='fa fa-search' aria-hidden='true'></i></span>";
    spanText += "  </div>";
    spanText += "</div>";
    //right controls
    spanText += "<div class='maps-controls-right'>";
    //zoom
    spanText += "  <div class='maps-zoom'>";
    spanText += "    <span id='mapsZoomOut'><i class='fa fa-plus' aria-hidden='true'></i></span>";
    spanText += "    <span class='inactive'> | </span>";
    spanText += "    <span id='mapsZoomIn'><i class='fa fa-minus' aria-hidden='true'></i></span>";
    spanText += "  </div>";
    //span 
    spanText += "  <div class='maps-pan'>";
    spanText += "    <span id='mapsPanUp'><i class='fa fa-chevron-up' aria-hidden='true'></i></span><br>";
    spanText += "    <span id='mapsPanLeft'><i class='fa fa-chevron-left' aria-hidden='true'></i></span>";
    spanText += "    <span> <i class='fa fa-plus inactive' aria-hidden='true'></i> </span>";
    spanText += "    <span id='mapsPanRight'><i class='fa fa-chevron-right' aria-hidden='true'></i></span><br>";
    spanText += "    <span id='mapsPanDown'><i class='fa fa-chevron-down' aria-hidden='true'></i></span>";
    spanText += "  </div>";  
    spanText += "</div>";  
    spanText += "</div>";
    $(".netlogo-view-container").append(spanText);
    var leftOffset = (Math.round($(".netlogo-view-container").css("width").replace("px","")) - 55) + "px";
    $(".maps-controls-right").css("left",leftOffset);
    $(".maps-controls").css("display","none");
    setupEventListeners();
  }
  
  function setupEventListeners() {
    $(".maps-controls").on("click", "#mapsSearch", function() {
      location = $("#mapsSearch input").val();
      redrawMap();
    });
    $(".maps-controls").on("click", "#mapsZoomIn", function() {
      zoom--;
      redrawMap();
    });
    $(".maps-controls").on("click", "#mapsZoomOut", function() {
      zoom++;
      redrawMap();
    });
    $(".maps-controls").on("click", "#mapsPanUp", function() {
    });
    $(".maps-controls").on("click", "#mapsPanDown", function() {
    });
    $(".maps-controls").on("click", "#mapsPanLeft", function() {
    });
    $(".maps-controls").on("click", "#mapsPanRight", function() {
    });
  }
  
  function resetInterface() {
    $(".maps-controls").css("display","inline-block");    
  }
  
  function redrawMap() {
    
    //var src = 'https://maps.googleapis.com/maps/api/staticmap?center=Albany,+NY&zoom='+zoom+'&scale=1&size=500x500&maptype=roadmap&format=png&visual_refresh=true';  
    var src = 'https://maps.googleapis.com/maps/api/staticmap?center='+location+'&zoom='+zoom+'&scale=1&size=500x500&maptype=roadmap&format=png&visual_refresh=true';  
    var image = new Image();
    image.onload = function() {
      $("#imageLayer").prop("src",src);
      world.triggerUpdate();
    };
    image.src = src;
    
    
    
    /*var canvas = document.getElementById('map');
    var imageData = canvas.toDataURL("image/png");
    // Now browser starts downloading it instead of just showing it
    var newData = imageData.replace(/^data:image\/png/, "data:application/octet-stream");
    $("#imageLayer").attr("href", newData);
*/
/*
    html2canvas($("#map"), {
                onrendered: function(canvas) {
                    theCanvas = canvas;
                    document.body.appendChild(canvas);

                    // Convert and download as image 
                    Canvas2Image.saveAsPNG(canvas); 
                    $("#imageLayer").append(canvas);
                    // Clean up 
                    //document.body.removeChild(canvas);
                }
            });
            *//*
            html2canvas(document.getElementById('map'), {
        logging: true,
        profile: true,
        useCORS: true}).then(function(canvas) {
    var data = canvas.toDataURL('image/jpeg', 0.9);
    var src = encodeURI(data);
    document.getElementById('imageLayer').src = src;
    document.getElementById('size').innerHTML = src.length + ' bytes';
});*/

  }

  function importMap(settings) {
    zoom = settings[0];
    location = settings[1];
    Images.clearImage();
    redrawMap();
    resetInterface();
  }
  function createMarker() {
    
  }
  function updateMarker() {
    
  }
  function removeMarker() {
    
  }
  function getMarker() {
    
  }
  function clearMap() {
    $(".maps-controls").css("display","none");
  }

  return {
    setupInterface: setupInterface,
    importMap: importMap,
    createMarker: createMarker,
    updateMarker: updateMarker,
    removeMarker: removeMarker,
    getMarker: getMarker,
    clearMap: clearMap
    
    
  };
 
})();
