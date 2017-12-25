
Images = (function() {
  
  function importImage(filename) {
    clearImage();
    var image = new Image();
    image.onload = function() {
      $("#imageLayer").prop("src",filename);
      world.triggerUpdate();
    };
    image.src = filename;
  }
  function importPcolors() {
    
  }
  function clearImage() {
    console.log("clear image");
    $("#imageLayer").prop("src","");
    Physics.clearWorld();
    Maps.clearMap();
    world.triggerUpdate();
  }

  return {
    importImage: importImage,
    importPcolors: importPcolors,
    clearImage: clearImage
  };
 
})();
