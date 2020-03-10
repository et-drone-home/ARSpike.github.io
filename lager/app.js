let switchCameraButton;
let video;
let mediaController;
class MediaController{
  constructor(stream, videoTracks) {
    this.selected = 0,
    this.options = null
    this.currentStream = stream
    const videoTrack = (videoTracks || [])[0] || {}
    this.handleSwitchCamera = this.handleSwitchCamera.bind(this)
    this.stopMediaTracks = this.stopMediaTracks.bind(this)
    this.setDevices = this.setDevices.bind(this)
    this.optionsChanged = this.optionsChanged.bind(this)
    this.useCamera = this.useCamera.bind(this)
    this.trySwitchCamera = this.trySwitchCamera.bind(this)
    switchCameraButton.addEventListener("click", this.handleSwitchCamera)
    navigator.mediaDevices.enumerateDevices()
        .then((devices) => {
          this.setDevices(devices, videoTrack.label)
        })
  }
  stopMediaTracks(stream) {
    stream.getTracks().forEach(track => {
      track.stop();
    });
  }
  setDevices(devices, currentLabel){
    let count = 1;
    let nextOptions = []
    devices.forEach(mediaDevice => {
      if (mediaDevice.kind === 'videoinput') {
        const nextOption = {
          id: mediaDevice.deviceId,
          label: mediaDevice.label || `Camera ${count++}`,
          back: mediaDevice.label.includes("back") || mediaDevice.label.includes("Back")
        }
        nextOptions.push(nextOption)
      }
    });
    if (this.optionsChanged(nextOptions)) {
      this.options = nextOptions
    }
    this.selected = this.options.findIndex(option => { return option.label == currentLabel}) <= 0 ? 0 : 1
  }
  optionsChanged(nextOptions){
    if (this.options == null) return true
    return nextOptions.some((option, o) => option.id != (this.options[o] || {}).id)
  }
  useCamera(camera){
    const videoConstraints = {};
    if (camera.id === '') {
      videoConstraints.facingMode = 'environment';
    } else {
      videoConstraints.deviceId = { exact: camera.id };
    }
    const constraints = {
      video: videoConstraints,
      audio: false
    };
    if (typeof this.currentStream !== 'undefined') {
      this.stopMediaTracks(this.currentStream);
    }
    navigator.mediaDevices
      .getUserMedia(constraints)
      .then(stream => {   
        this.currentStream = stream;
        const video = document.getElementById("arjs-video")
        var scene = document.getElementById("scene")
        video.className = camera.back ? "" : "mirrored"
        scene.className = camera.back ? "" : "mirrored"
        video.srcObject = stream;
      })
      .catch(error => {
        console.error({error});
      });
  }
  handleSwitchCamera(e){
    this.trySwitchCamera();
  }
  trySwitchCamera(){
    if (this.options != null && this.options.length > 1) {
      this.selected++
      if (this.selected >= this.options.length) this.selected = 0
      this.useCamera(this.options[this.selected])
    }
  }
}
function setVideoElement() {
  video = document.getElementById("arjs-video")
  if (video == null) {
    setTimeout(() => {
      setVideoElement();
    },1000)
  } else {
    switchCameraButton = document.getElementById('switchCameraButton');
    mediaController = new MediaController(video.srcObject, video.videoTracks);
  }
}
document.addEventListener('DOMContentLoaded', function(event){
  setVideoElement()
})