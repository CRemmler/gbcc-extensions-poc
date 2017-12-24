
Images = (function() {
  
  function importImage(filename) {
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
    $("#imageLayer").attr("src","");
  }

  return {
    importImage: importImage,
    importPcolors: importPcolors,
    clearImage: clearImage
  };
 
})();
