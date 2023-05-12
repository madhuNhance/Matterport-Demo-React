import './App.css';
// import { setupIframely } from './libs/sdk-iframely.js';
// import React, { useState } from 'react';
import { CONSTANTS } from './libs/constants';
import { injectToMatterPortSdk } from './libs/sdk-injectToSdk';
import { makeVideoPlane, videoPlaneType } from './3dscenemodule/videoPlane';
import video from "./3dscenemodule/media/nhanceTwin-PowerOfOne.mp4"
import { minmap } from './3dscenemodule/minimap';

// const pointer_position_text = document.getElementById('pointer_position_text')

//SetupIframly is done by Chris Hickman(chrishickman@matterport.com) "https://goshow.me/bundle-iframely/"

//This example is using the Demo Model given in the matterport account

function App() {

  const showcase = document.getElementById('showcase');
  const sdkKey = "gucteueekg6bzuzn0xkaacm7d"


  const sidArr = []

  //This is custom code to inject HTML in Tags:
  // showcase.addEventListener('load', async function () {
  //   console.log("inside eventlistener render")
  //   let mpSdk;
  //   try {
  //     mpSdk = await window.MP_SDK.connect(showcase, appKey, '3.6');
  //     console.log({ mpSdk })
  //     onShowcaseConnect(mpSdk)
  //     mpSdk.on('tag.hover', async (sid, hovering) => {  //mpSdk.Mattertag.Event.HOVER
  //       if (hovering && CONSTANTS[sid]) {
  //         injectToMatterPortSdk(mpSdk, String(sid))
  //       }
  //     })
  //     // onShowcaseConnect(mpSdk);
  //   } catch (e) {
  //     console.error(e);
  //     return;
  //   }
  // });

  const showcaseWindow = showcase.contentWindow;
  showcase.addEventListener('load', async function () {
    let mpSdk;
    try {
      mpSdk = await showcaseWindow.MP_SDK.connect(showcase);

      await minmap(mpSdk, sdkKey)

      mpSdk.on('tag.hover', async (sid, hovering) => {  //mpSdk.Mattertag.Event.HOVER
        if (hovering && CONSTANTS[sid]) {
          if (!sidArr.includes(sid)) {
            sidArr.push(sid)
            injectToMatterPortSdk(mpSdk, String(sid));
          }

        }
      })

      console.log({ mpSdk })

      // var modelData = await mpSdk.Model.getData();
      await mpSdk.App.state.waitUntil((appState) => {
        if (appState.phase === 'appphase.playing') {
          startApp(mpSdk);
        }
      });
      // onShowcaseConnect(mpSdk)
    }
    catch (err) {
      console.error(err);
      return;
    }
    console.log('Hello Bundle SDK', mpSdk);
  });


  // async function onShowcaseConnect(mpSdk) {

  //   // Wait until Showcase is actually playing....
  //   await mpSdk.App.state.waitUntil((appState) => appState.phase === 'appphase.playing');

  //   // This is all you need!
  //   setupIframely(mpSdk, '5142aff4d2d4b937a57e53');
  // }

  async function startApp(sdk) {
    // subscription to pointer object to help find position values
    // sdk.Pointer.intersection.subscribe(function (intersectionData) {
    //   // Changes to the intersection data have occurred.
    //   pointer_position_text.innerHTML = "pointer intersection data : " + JSON.stringify(intersectionData.position)
    // });

    // Registering the component with the sdk
    await sdk.Scene.register(videoPlaneType, makeVideoPlane);
    // Create a scene object. `createObjects` can create multiple objects and returns an array with that number of objects
    const [sceneObject] = await sdk.Scene.createObjects(1);
    // Create a scene node
    const node = sceneObject.addNode();
    // set initial input values for VideoPlane inputs
    const video_node_inputs = {
      videoSrc: video,
      visible: true,
      aspectRatio: 16 / 9,
      localScale: { x: 1.87, y: 1.9, z: 2 },
      localRotation: { x: 0, y: 0, z: 0 },
      localPosition: { x: 6.84, y: -0.12, z: 1.22 }
    }

    // const video_node_inputs1 = {
    //   videoSrc: video,
    //   visible: true,
    //   aspectRatio: 16 / 9,
    //   localScale: { x: 1.25, y: 1.25, z: 1.25 },
    //   localRotation: { x: 0, y: 0, z: 0 },
    //   localPosition: { x: 1, y: 1, z: 1 }
    // }

    node.addComponent(videoPlaneType, video_node_inputs);
    // node.addComponent(videoPlaneType, video_node_inputs1);
    node.start();
  }

  // (async function connectSdk() {
  //   const queryString = window.location.search;
  //   const urlParams = new URLSearchParams(queryString);
  //   console.log(urlParams)

  //   showcase.src = 'https://my.matterport.com/show/?m=' + (urlParams.get('m') ? urlParams.get('m') : 'QYur3rnziuz') + '&hl=0&useLegacyIds=0&play=1&applicationKey=' + sdkKey;

  //   try {
  //     const mpSdk = await window.MP_SDK.connect(
  //       showcase, // Obtained earlier
  //       sdkKey, // Your SDK key
  //       '3.5' // Unused but needs to be a valid string
  //     );
  //     // onShowcaseConnect(mpSdk);
  //     console.log({ mpSdk })
  //   } catch (e) {
  //     console.error(e);
  //   }
  // })()

  return (
    // <div id='app'>
    // </div>
    null
  );
}

export default App;
