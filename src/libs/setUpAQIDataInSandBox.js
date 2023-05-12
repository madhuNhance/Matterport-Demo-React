//Insert Coming Data Into Sandbox in MatterTag

export const setUpAQIDataInSandBox = async (mpSdk, sid) => {
    try {
        const [sandboxId, messenger] = await mpSdk.Tag.registerSandbox(renderHTML(sid), {
            name: `SandBox-${sid}`
        });
        console.log({ sid, sandboxId })
        mpSdk.Tag.attach(sid, sandboxId)
    } catch (error) {
        console.log("Ooops something went wrong.....", error)
    }


    function renderHTML(sid) {
        return `
            <style>
            button {
                border-radius: 3px;
                border: 1px solid rgba(0, 0, 0, 0);
                padding: .4em .8em;
                font-size: 1em;
                font-weight: 500;
                font-family: inherit;
                background-color: #646cff;
                color: #fff;
                cursor: pointer;
                transition: border-color .25s;
                outline: none
            }
            
            button.danger {
                background-color: red
            }
            
            a {
                font-weight: 500;
                color: #646cff;
                text-decoration: inherit
            }
            
            a:hover {
                color: #535bf2
            }
            
            .mtg-inject-content {
                width: 100%;
                height: auto;
                padding: 0 0;
                margin: 0 0;
                box-sizing: border-box;
                background-color: rgba(0, 0, 0, 0);
                position: relative
            }
            
            .mtg-inject-content .mtg-loading {
                display: block;
                position: absolute;
                top: 0;
                z-index: 10;
                left: 0;
                width: 100%;
                height: 100%;
                padding: 0 0;
                margin: 0 0;
                box-sizing: border-box
            }
            
            .mtg-inject-content .mtg-loading svg {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate3D(-50%, -50%, 0);
                width: 40px;
                height: auto;
                -o-object-fit: contain;
                object-fit: contain
            }
            
            .mtg-inject-content .mtg-loading svg path {
                fill: #03f2b2
            }
            
            .mtg-inject-content .device-data-list+.mtg-loading {
                display: none
            }
            
            .hotspot-content {
                width: 100%;
                height: auto;
                padding: 10px 0;
                margin: 0 0;
                box-sizing: border-box;
                border-radius: 4px;
                display: block;
                font-family: Futura, "Helvetica Neue", sans-serif;
                font-size: 13px;
                font-weight: 400;
                overflow-wrap: break-word;
                width: 100%;
                overflow: hidden;
                background: rgba(0, 0, 0, 0);
                color: #fff;
                text-align: left
            }
            
            .hotspot-content .htp-title {
                white-space: normal;
                word-break: break-word;
                text-align: left;
                line-height: 1.6;
                font-family: "Montserrat-Bold";
                font-size: 15px
            }
            
            .hotspot-content .htp-title .mini-title {
                font-size: 13px;
                font-family: "Montserrat-Medium"
            }
            
            .hotspot-content ul {
                width: 100%;
                height: auto;
                padding: 0 0;
                margin: 0 0;
                box-sizing: border-box;
                padding-left: .8em;
                list-style-type: none
            }
            
            .hotspot-content ul li {
                width: 100%;
                height: auto;
                padding: 5px 0;
                margin: 0 0 0 0;
                box-sizing: border-box
            }
            
            .hotspot-content .device-data-list .m-name {
                padding-right: .3em;
                font-size: 13px
            }
            
            .hotspot-content .device-data-list .m-name:after {
                content: ":"
            }
            
            .hotspot-content .device-data-list .m-value {
                color: #03f2b2;
                font-size: 14px
            }
            
            .hotspot-content .device-data-list .m-unit {
                color: #03f2b2
            }
            
            .hotspot-content .device-data-list .m-time {
                display: none
            }
            
            .hotspot-content .device-data-list .device-attr:before {
                content: "";
                display: inline-block;
                vertical-align: middle;
                border-radius: 50%;
                width: 5px;
                height: 5px;
                overflow:hidden;
                padding: 0 0;
                margin: 0 0;
                box-sizing: border-box;
                background-color: #03f2b2;
                margin-right: 8px
            }
            
            .hotspot-content .device-data-list .device-attr:last-child:after {
                display: block;
                content: attr(update-time);
                font-size: 12px;
                width: 100%;
                height: auto;
                padding: 0 0;
                margin: 0 0;
                overflow:hidden;
                box-sizing: border-box;
                text-align: center;
                font-style: italic;
                margin-top: 1em;
                font-family: sans-serif;
                color: #aaa
            }
            
            .hotspot-content.active {
                top: calc(100% + 1em);
                opacity: 1;
                max-height: -moz-max-content;
                max-height: max-content
            }
            
            .hotspot-content .spot-img {
                width: 100%;
                height: auto;
                padding: 0 0;
                margin: 0 0;
                box-sizing: border-box
            }
            
            .hotspot-content .spot-img img {
                max-width: 100%;
                -o-object-fit: contain;
                object-fit: contain
            }</style>
            <script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
            <div class="hotspot-content" >
				<ul class="device-data-list" id="showList">
                </ul>
			</div>
            <script type="text/javascript">
                    console.log("POIUYTRERTUIUGFDFGUIO")
                        axios.post('http://localhost:8010/azure/adt/aqi/${sid}')
                            .then(response => {
                                const data = response.data.data
                                console.log(data)
                                const deviceDataList = document.getElementById('showList')
                                data.map((item) => {
                                    const li = document.createElement("li");
                                    const nameSpan = document.createElement("span");
                                    const valueSpan = document.createElement("span");
                                    const unitSpan = document.createElement("span");
                                    nameSpan.textContent = item["DT"].$dtId.split("-")[1];
                                    valueSpan.textContent = item["DT"]?.lastValue;
                                    unitSpan.textContent = item["DT"].unit;
                                    nameSpan.classList.add("m-name");
                                    valueSpan.classList.add("m-value");
                                    unitSpan.classList.add("m-unit");
                                    li.appendChild(nameSpan);
                                    li.appendChild(valueSpan);
                                    li.appendChild(unitSpan);
                                    li.classList.add("device-attr")
                                    deviceDataList.appendChild(li);
                                })
                            })
                            .catch(err => {
                                console.log(err)
                            })
                    </script>
    `
    }
}