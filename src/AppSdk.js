import './App.css';
import React, { useState, useEffect, useRef } from 'react'
import { setupSdk } from '@matterport/sdk'
import { CONSTANTS } from './libs/constants';
import { injectToMatterPortSdk } from './libs/sdk-injectToSdk';
import { setupIframely } from './libs/sdk-iframely';

function App() {
  let mpSdk
  const sdkKey = "3ai7xwz46n029xegewz8qdp8c"
  const setupSDK = async function () {
    mpSdk = await setupSdk(sdkKey, {
      space: 'iL4RdJqi2yK',
      container: '.showcase',
      iframeQueryParams: {
        qs: 1,
        hr: 0,
      },
    });
    console.log(mpSdk);
    await mpSdk.App.state.waitUntil((appState) => appState.phase === 'appphase.playing');
    mpSdk.on("tag.hover", async (sid, hovering) => {
      if (hovering && CONSTANTS[sid]) {
        injectToMatterPortSdk(mpSdk, String(sid))
      }
    })
  }

  useEffect(() => {
    setupSDK()
  }, [])

  return (
    null
  );
}

export default App;
