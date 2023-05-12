function VideoPlane() {
    this.inputs = {
        videoSrc: null,
        visible: true,
        aspectRatio: 1,
        localScale: { x: 1, y: 1, z: 1 },
        localPosition: { x: 0, y: 0, z: 0 },
        localRotation: { x: 0, y: 0, z: 0 }
    }
    this.events = {
        "INTERACTION.CLICK": true,
    }
    // Called on init
    this.onInit = function () {

        // threejs context
        // https://matterport.github.io/showcase-sdk/sdkbundle_architecture.html#context
        const THREE = this.context.three;

        // create and configure HTML video element for use as texture with THREE.VideoTexture
        var video = document.createElement('video');
        video.src = this.inputs.videoSrc
        video.crossOrigin = 'anonymous';
        video.autoplay = true;
        video.muted = true;
        video.loop = true;

        this.video = video;

        // add event listener to check when the video is loaded
        this.video.addEventListener('canplay', function () {
            this.play();
        });

        this.texture = new THREE.VideoTexture(this.video)

        // create mesh with PlaneGeometry
        this.mesh = new THREE.Mesh(
            new THREE.PlaneGeometry(1.0, 1.0),
            new THREE.MeshBasicMaterial({
                map: this.texture
            })
        )
        this.mesh.scale.set(this.inputs.localScale.x, this.inputs.localScale.y / this.inputs.aspectRatio, this.inputs.localScale.z);
        this.mesh.rotation.set(this.inputs.localRotation.x, this.inputs.localRotation.y, this.inputs.localRotation.z)
        this.mesh.position.set(this.inputs.localPosition.x, this.inputs.localPosition.y, this.inputs.localPosition.z);

        this.outputs.objectRoot = this.mesh;
        this.outputs.collider = this.mesh;
    }

    var playing = true
    this.onEvent = function (type, data) {
        if (type === "INTERACTION.CLICK") {
            playing ? this.video.pause() : this.video.play()
            playing = !playing
        }
    }

    this.onInputsUpdated = function () {
        console.log("VideoPlane onInputsUpdated() called")
    }

    this.onDestroy = function () {
        this.outputs.collider = null;
        this.outputs.objectRoot = null;

        this.mesh.material.dispose();
        this.mesh.geometry.dispose();
    }
}
function makeVideoPlane() {
    return new VideoPlane();
}

const videoPlaneType = 'mp.videoPlane';


export { videoPlaneType, makeVideoPlane, VideoPlane };