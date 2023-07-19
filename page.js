chrome.runtime.onMessage.addListener(({ name, data }) => {
  if (name === 'tab-start-draw') {
    const div = document.createElement('div')
    div.id = 'ext-canvas'
    Object.assign(div.style, {
      backgroundColor: 'transparent',
      position: 'fixed',
      top: 0,
      left: 0,
      bottom: 0,
      right: 0,
      padding: 0,
      margin: 0,
      width: '100vw',
      height: '100vh',
    })
    document.body.appendChild(div)
    startDraw()
  } else if (name === 'tab-stop-draw') {
    document.querySelector('#ext-canvas').remove()
  }

  if (name.startsWith('tab-')) {
    const text = document.getSelection().anchorNode.textContent
    console.log('TAB: User right-clicked, responding to background', text)
    
    chrome.runtime.sendMessage({
      name: "sidepanel-notification",
      data: { 
        message: text,
      }
    });
  }
});


function startDraw() {
  // Creates a new canvas element and appends it as a child
  // to the parent element, and returns the reference to
  // the newly created canvas element


  function createCanvas(parent) {
      var canvas = {};
      canvas.node = document.createElement('canvas');
      canvas.context = canvas.node.getContext('2d');
      canvas.node.width = parent.offsetWidth; // width || 100;
      canvas.node.height = parent.offsetHeight; // height || 100;
      parent.appendChild(canvas.node);
      return canvas;
  }

  function init(container) {
      var canvas = createCanvas(container);
      var ctx = canvas.context;
      // define a custom fillCircle method
      ctx.fillCircle = function(x, y, radius, fillColor) {
          this.fillStyle = fillColor;
          this.beginPath();
          this.moveTo(x, y);
          this.arc(x, y, radius, 0, Math.PI * 2, false);
          this.fill();
      };

      canvas.node.onmousemove = function(e) {
          if (!canvas.isDrawing) {
             return;
          }
          var x = e.pageX - this.offsetLeft;
          var y = e.pageY - this.offsetTop;
          var radius = 3;
          var fillColor = 'rgba(255, 80, 90, 0.5)';
          ctx.fillCircle(x, y, radius, fillColor);
      };
      canvas.node.onmousedown = function(e) {
          canvas.isDrawing = true;
      };
      canvas.node.onmouseup = function(e) {
          canvas.isDrawing = false;
      };
  }

  var container = document.getElementById('ext-canvas');
  init(container);

}