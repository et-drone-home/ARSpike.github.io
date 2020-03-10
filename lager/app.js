const switchCameraButton = document.getElementById('switchCameraButton');
let options = [null];
let selected = 0;
let currentStream;
function stopMediaTracks(stream) {
  stream.getTracks().forEach(track => {
    track.stop();
  });
}
function gotDevices(mediaDevices) {
  let count = 1;
  let nextOptions = []
  mediaDevices.forEach(mediaDevice => {
    if (mediaDevice.kind === 'videoinput') {
      const nextOption = {
        id: mediaDevice.deviceId,
        label: mediaDevice.label || `Camera ${count++}`,
        back: mediaDevice.label.includes("back") || mediaDevice.label.includes("Back")
      }
      nextOptions.push(nextOption)
    }
  });
  if (optionsChanged(nextOptions)) {
    options = nextOptions
  }
}
const optionsChanged = nextOptions => {
  return nextOptions.some((option, o) => option.id != (options[o] || {}).id)
}
const setCamera = selection => {
  const videoConstraints = {};
  if (selection.id === '') {
    videoConstraints.facingMode = 'environment';
  } else {
    videoConstraints.deviceId = { exact: selection.id };
  }
  const constraints = {
    video: videoConstraints,
    audio: false
  };
  navigator.mediaDevices
    .getUserMedia(constraints)
    .then(stream => {
      currentStream = stream;
      const video = document.getElementById("arjs-video")
      var scene = document.getElementById("scene")
      video.className = selection.back ? "" : "mirrored"
      scene.className = selection.back ? "" : "mirrored"
      video.srcObject = stream;
      return navigator.mediaDevices.enumerateDevices();
    })
    .catch(error => {
      console.error(error);
    });
}
switchCameraButton.addEventListener('click', event => {
  if (typeof currentStream !== 'undefined') {
    stopMediaTracks(currentStream);
  }
  selected++
  if (selected >= options.length) selected = 0
  setCamera(options[selected])
});
const refreshDevices = () => {
  const header = document.getElementById("header-text")
  header.className += " red"
  navigator.mediaDevices.enumerateDevices().then(gotDevices);
}
const setup = () => {
  navigator.mediaDevices.enumerateDevices().then(gotDevices);
  document.getElementById("arjs-video").className += " mirrored"
  setCamera(options[0])
}
setTimeout(() => {
  setup();
  setTimeout(() => {
    setup();
  }, 1500)
}, 1500)