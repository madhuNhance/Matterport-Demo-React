export async function minmap(mpSdk, sdkKey) {

    // First, let's get the Model SID to use with our GraphQL Query
    var modelData = await mpSdk.Model.getData();

    // Get Labels
    var data = await getSweepLabels();

    // Create arrays - Sweep ID -> Label and Label -> ID
    var sweepLabels = [];
    var sweepIds = {};
    var sweepLegacyIds = {};
    Object.entries(data.data.model.panoLocations).forEach((entry) => {
        // # -> Legacy ID
        sweepLabels[entry[1].label] = entry[1].id;
        // Legacy Id -> Label
        sweepIds[entry[1].id] = entry[1].label;

        // Get the 'Legacy ID' from the Skybox Imagery filename
        let lid = entry[1].skybox.urlTemplate;
        lid = lid.split('/2k/~/');
        lid = lid[1].split('_skybox');

        // Legacy Id -> SDK Id
        // sweepLegacyIds[entry[1].id] = lid[0];  //default it was like this 

        sweepLegacyIds[lid[0]] = entry[1].id
    });
    console.log('Sweep IDs', sweepIds);
    // console.log('Sweep Labels:', sweepLabels.length);
    // console.log('Sweep Legacy IDs:', sweepLegacyIds);


    let activeSweep = null;
    await mpSdk.Sweep.current.subscribe(function (currentSweep) {
        // Change to the current sweep has occurred.
        if (currentSweep.id !== '') {
            if (activeSweep !== null) {
                document.getElementById('p' + activeSweep).classList.remove('active');
            }
            activeSweep = currentSweep.id;
            document.getElementById('p' + activeSweep).classList.add('active');
            console.log('Entering Sweep - API ID:' + currentSweep.id + ' (#' + sweepIds[sweepLegacyIds[currentSweep.id]] + ') - Legacy SDK ID: ' + sweepLegacyIds[currentSweep.id]
            );
        }
    });

    async function getSweepLabels() {
        // GraphQL query will fail to get the floorplan assets without a Bearer Token added to the authorization, but will return the panoLocations
        var query = `{
		  model(id: "${modelData.sid}") {
		  panoLocations {
			id
			label
			skybox(resolution: "2k") {
			  filename
			  urlTemplate
			}
		  }
		}
	  }`;
        var headers = {
            'Content-Type': 'application/graphql',
            'x-matterport-application-key': sdkKey,
        };
        var options = {
            method: 'POST',
            mode: 'cors',
            headers: headers,
            body: query,
            redirect: 'follow',
        };
        var url = 'https://my.matterport.com/api/mp/models/graph';
        const response = await fetch(url, options);
        return await response.json();
    }

    // Minimap
    // Get Minimap Data
    var minimapData = await getMiniMapAssets(modelData.sid);
    console.log('Mini Map', minimapData);

    // Render Minimap
    var mapContainer = document.getElementById('map');

    var minimap = null

    // Sync Minimap Floor with Current Floor
    await mpSdk.Floor.current.subscribe(function (currentFloor) {
        if (currentFloor.sequence !== undefined && currentFloor.sequence !== -1) {
            // Show minimap for the first time when a floor value is read
            if (minimap == null) {
                minimap = document.createElement('img');
                mapContainer.appendChild(minimap);
            }
            mapContainer.setAttribute('class', 'floor' + currentFloor.sequence);
            // Get the div element with id "map" and class "floor"
            let floorToShow = `floor${currentFloor.sequence}`
            let buttons = document.querySelectorAll(`#map button`);
            // Loop through each button and hide/show it based on its class
            buttons.forEach(function (button) {

                if (button.className === floorToShow || button.className === floorToShow + " active") {
                    button.style.visibility = "visible";
                    // Show the button if it has the class of the floor to show
                } else {
                    button.style.visibility = "hidden"
                }
            });

            minimap.src = minimapData.urlTemplate.replace('{{filename}}', 'render/vr_colorplan_00' + currentFloor.sequence + '.png');
        } else {
            // Floor.current is returning 'undefined' when moving between panos right now -- bug reported -- otherwise, this would work:
            // mapContainer.setAttribute('class','nofloor');
        }
    });

    // Render Sweeps
    await mpSdk.Sweep.data.subscribe({
        onAdded: function (index, item, collection) {
            if (item.alignmentType === 'aligned') {
                let thisSweep = document.createElement('button');
                let px = ((item.position.x - minimapData.image_origin_x) * minimapData.resolution_ppm) / minimapData.width; thisSweep.style.left = px * 100 + '%';
                let py = ((item.position.z * -1 - minimapData.image_origin_y) * minimapData.resolution_ppm) / minimapData.height; thisSweep.style.bottom = py * 100 + '%';
                thisSweep.setAttribute('id', 'p' + index);
                thisSweep.setAttribute('value', index);
                thisSweep.setAttribute('class', 'floor' + item.floorInfo.sequence);
                thisSweep.addEventListener('click', sweepMove);
                // thisSweep.textContent = sweepIds[index]
                thisSweep.textContent = sweepIds[sweepLegacyIds[index]];
                mapContainer.appendChild(thisSweep);
            }
        },
        onCollectionUpdated: function (collection) {
            console.log('the entire up-to-date collection', collection);
        },
    });

    // Hide Minimap in Measurement Mode
    await mpSdk.Measurements.mode.subscribe(function (measurementModeState) {
        if (measurementModeState.active) {
            document.body.classList.remove('minimap');
        } else {
            document.body.classList.add('minimap');
        }
    });

    // Hide Minimap in Dollhouse && Floorplan Mode
    await mpSdk.Mode.current.subscribe(function (mode) {
        if (mode !== 'mode.inside' && mode !== 'mode.outside' && mode !== 'mesh') {
            document.body.classList.remove('minimap');
        } else {
            document.body.classList.add('minimap');
        }
    });

    //Hide Minimap on Dock of a Mattertag
    await mpSdk.Tag.openTags.subscribe({
        onChanged(newState) {
            if (newState?.docked) {
                document.body.classList.remove('minimap')
            } else {
                document.body.classList.add('minimap')
            }
        }
    })

    // On click - move
    function sweepMove(event) {
        return mpSdk.Sweep.moveTo(event.target.value, {
            transition: mpSdk.Sweep.Transition.MOVEFADE //FLY,FADEOUT,INSTANT
        })
            .then(function (handleMessage) {
                console.log(handleMessage);
            })
            .catch(function (handleError) {
                console.log(handleError);
            })
    }

    // Display Minimap
    await mpSdk.App.state.waitUntil(
        (appState) => appState.phase === 'appphase.playing'
    );
    document.body.classList.add('started');

    // Legacy Method for getting Minimap Assets from unpublished REST API endpoints (2023 Sunset TBD)
    async function getMiniMapAssets(sid) {
        var headers = {
            'Content-Type': 'application/graphql',
            'x-matterport-application-key': sdkKey,
        };
        var options = {
            method: 'GET',
            headers: headers,
            redirect: 'follow',
        };
        var url = 'https://my.matterport.com/api/player/models/' + sid + '/files?type=3';
        const response = await fetch(url, options);
        const responseJson = await response.json();


        // const catalogUrl = responseJson.templates[0].replace('{{filename}}', 'catalog.json');
        // const catalogData = await fetch(catalogUrl, options);
        // const catalogFiles = await catalogData.json();

        const colorplanData = responseJson.templates[0].replace('{{filename}}', 'render/vr_colorplan.json');
        const miniMapDataResponse = await fetch(colorplanData, options);
        let miniMapData = await miniMapDataResponse.json();
        // miniMapData.urlTemplate = responseJson.templates[0].replace('{{filename}}', 'render/vr_colorplan_000.png');
        miniMapData.urlTemplate = responseJson.templates[0];

        return miniMapData;
    }
}