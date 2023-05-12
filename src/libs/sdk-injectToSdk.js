//Inject TO the main SDK Data of a tag
import axios from 'axios'

export const injectToMatterPortSdk = async (mpSdk, sid) => {
    const tagPromise = new Promise((resolve, reject) => {
        let tagsWithSandBoxData = {}
        let newInsertData = mpSdk.Tag.data.subscribe({
            onAdded: async function (index, item) {
                if (index === sid && item.sandBoxData) {
                    item.sandBoxAttached = true
                    console.log("1st resolve")
                    resolve(item)
                }
            },
            // onUpdated(index, item, collection) {
            //     console.log({ index, item, collection })
            // },
            onCollectionUpdated(collection) {
                if (!collection[sid].sandBoxData) {
                    axios.get(`http://localhost:8010/azure/adt/aqi/${sid}`)
                        .then(response => {
                            tagsWithSandBoxData = response.data.data
                            collection[sid].sandBoxData = tagsWithSandBoxData
                            console.log("Resolve and API call")
                            resolve({ ...collection[sid] })
                        })
                        .catch(err => {
                            resolve({ ...collection[sid], sandBoxData: [] })
                            console.log(err.message)
                            // reject(err)
                        })
                }
                // newInsertData.cancel()
            }
        })
    })

    await Promise.all([tagPromise])
        .then((values) => {
            replaceMedia(values[0])
        })
        .catch((err) => {
            console.error('Ooops... the Promise went pear-shaped!', err);
        });

    async function replaceMedia(tagValues) {
        try {
            const tagData = tagValues.sandBoxData
            if (!tagValues.sandBoxAttached) {
                if (tagData.length === 0) {
                    const [sandBoxIdNoData, messanger] = await mpSdk.Tag.registerSandbox(renderNoDataHtml(), {
                        name: `SandBox-${sid}`,
                        size: { w: 0, h: 100 }
                    });
                    mpSdk.Tag.attach(sid, sandBoxIdNoData)
                } else {
                    const [sandboxId1, messenger1] = await mpSdk.Tag.registerSandbox(renderHTML(JSON.stringify(tagData)), {
                        name: `SandBox1-${sid}`,
                        size: { w: 0, h: 180 }
                    });
                    const [sandboxId2, messenger2] = await mpSdk.Tag.registerSandbox(renderIframe("5142aff4d2d4b937a57e53"), {
                        name: `SandBox2-${sid}`,
                        size: { w: 0, h: 240 }
                    });
                    mpSdk.Tag.attach(sid, sandboxId1, sandboxId2)
                }
                // console.log({ sid, sandboxId })
            }

        } catch (error) {
            console.log("Ooops something went wrong.....", error)
        }
        // if (tagValues.id === sid) {
        //     console.log(tagValues)
        // }
    }

    function renderNoDataHtml() {
        return `
        <style>
		body {
			background-color: #f1f1f1;
			font-family: Arial, sans-serif;
		}
		.container {
			margin: 50px auto;
			padding: 20px;
			background-color: #fff;
			border-radius: 5px;
			box-shadow: 0 0 10px rgba(0,0,0,0.3);
			text-align: center;
		}
		.message {
			font-size: 24px;
			color: #999;
            text-align: center;
			margin-bottom: 20px;
		}
	</style>
    <p class="message">No data found</p>
    `
    }

    function renderIframe(src) {
        return `<style>
        .iframely-embed { width: 100%;height:100% }
        .iframely-responsive { position: absolute;top: 0;left: 0;width: 100%;height: 100%;overflow:hidden }
        .iframely-responsive > * { position: absolute; top: 0; left: 0; width: 100%; height: 100%; overflow:hidden }
    </style>
    <div class="iframely-embed">
        <div class="iframely-responsive">
            <iframe srcdoc='
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Highcharts Bar Chart</title>
                    <script src="https://code.highcharts.com/highcharts.js"></script>
                    <script src="https://code.highcharts.com/modules/exporting.js"></script>
                    <script src="https://code.highcharts.com/modules/export-data.js"></script>
                </head>
                <body>
                    <div id="chartContainer" style="height:100%;position:absolute;overflow:hidden;width:100%"></div>
                    <script>
                        Highcharts.chart("chartContainer", {
                            chart: {
                                type: "line"
                            },
                            tooltip: {
                                split: false,
                            },
                            legend: {
                                enabled: false,
                            },
                            accessibility: {
                                enabled: false,
                            },
                            time: {
                                useUTC: false,
                            },
                            exporting: {
                                enabled: false
                            },
                            credits: {
                                enabled: false
                            },
                            title: {
                                text: "Data Bar Chart"
                            },
                            xAxis: {
                                categories: ["Apples", "Oranges", "Pears"]
                            },
                            yAxis: {
                                title: {
                                    text: "Fruit Eaten"
                                }
                            },
                            series: [{
                                name: "John",
                                data: [5, 3, 4]
                            }, {
                                name: "Jane",
                                data: [2, 2, 3]
                            }, {
                                name: "Joe",
                                data: [3, 4, 4]
                            }]
                        });
                    </script>
                </body>
                </html>
            ' frameborder="0" scrolling="no"  height="100%"></iframe>
        </div>
    </div>
    <script>
        const script = document.createElement("script");
        script.src = "//cdn.iframe.ly/embed.js?api_key=${src}";
        script.async = true;
        document.body.appendChild(script);
    </script>`
    }

    function renderHTML(insertData) {
        return `
            <style>         
            .hotspot-content {
                width: 100%;
                height: auto;
                padding: 0 0;
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
                padding-left: .1em;
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
                overflow:auto;
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
                overflow:auto;
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
            const data = ${insertData}
            const deviceDataList = document.getElementById("showList")
            window.on('test.event', () => {
                console.log("Hi there")
              });
            data.map((item) => {
                const li = document.createElement("li");
                li.classList.add("device-attr");
                const nameSpan = document.createElement("span");
                const valueSpan = document.createElement("span");
                const unitSpan = document.createElement("span");
                nameSpan.textContent = item["DT"].$dtId.split("-")[1];
                nameSpan.setAttribute('class',"m-name");
                // nameSpan.classList.add("m-name");
                valueSpan.textContent = item["DT"]?.lastValue;
                valueSpan.setAttribute('class',"m-value");
                // valueSpan.classList.add("m-value");
                unitSpan.textContent = item["DT"].unit;
                unitSpan.setAttribute('class',"m-unit");
                // unitSpan.classList.add("m-unit");
                li.appendChild(nameSpan);
                li.appendChild(valueSpan);
                li.appendChild(unitSpan);
                deviceDataList.appendChild(li);
            })
            </script>
    `
    }
}