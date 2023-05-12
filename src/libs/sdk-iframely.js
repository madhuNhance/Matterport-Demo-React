//	Swap out Embed.ly Embedding with IFramely! 
//  A simple JS module by chrishickman@matterport.com

export const setupIframely = function (mpSdk, iframelyKey) {

	const tagPromise = new Promise((resolve, reject) => {
		var tagsWithAttachments = new Array();
		let tagObservable = mpSdk.Tag.data.subscribe({
			onAdded: function (index, item) {
				// console.log("::::::::::::::", { index, item })
				if (item.attachments.length > 0) {
					tagsWithAttachments[index] = item.attachments;
				}
			},
			onUpdated(index, item, collection) {
				console.log({ index, item, collection })
			},
			onCollectionUpdated(collection) {
				// console.log({ collection })
				resolve(tagsWithAttachments); // Return only the tagsWithAttachments
				tagObservable.cancel();
			}
		});
	});

	// Get the attachment collection
	const attachmentPromise = new Promise((resolve, reject) => {
		let attachmentObservable = mpSdk.Tag.attachments.subscribe({
			onAdded: function (index, item) {
				// console.log({ index, item })
			},
			onCollectionUpdated(collection) {
				// console.log({ collection })
				resolve(collection);
				attachmentObservable.cancel();
			}
		});
	});

	Promise.all([tagPromise, attachmentPromise]).then((values) => {
		console.log({ values })
		replaceMedia(values[0], values[1]);
	})
		.catch((err) => {
			console.error('Ooops... the Promise went pear-shaped!', err);
		});

	async function replaceMedia(tagCollection, attachmentCollection) {
		try {
			for (let tagID in tagCollection) {
				for (let attachmentID of tagCollection[tagID]) {
					console.log('Swapping Attachment from Embed.ly', attachmentCollection[attachmentID]);
					if (attachmentCollection[attachmentID].type == 'tag.attachment.image') {
						mpSdk.Tag.detach(tagID, attachmentID); // Remove media attached with Embed.ly		
						const [sandboxId, messenger] = await mpSdk.Tag.registerSandbox(renderImage(attachmentCollection[attachmentID].src), {
							name: 'Image Embed',
							size: { w: 0, h: 240 }
						});
						mpSdk.Tag.attach(tagID, sandboxId);
					}
					else { // Is this even needed?
						mpSdk.Tag.detach(tagID, attachmentID); // Remove media attached with Embed.ly			
						const [sandboxId, messenger] = await mpSdk.Tag.registerSandbox(renderIframely(attachmentCollection[attachmentID].src), {
							name: 'IFramelyEmbed',
							size: { w: 0, h: 220 }
						});
						mpSdk.Tag.attach(tagID, sandboxId);
					}
				}
			}
		}
		catch (err) {
			console.log('Ooops... something went pear-shaped!', err);
		}
	}

	function renderImage(src) {
		return `
		<style>			
			.image-stage {
			  position: absolute;
			  height: 100%;
			  top: 0;
			  left: 0;
			  transition: all 0.1s ease;
			  cursor: zoom-in;
			}
			
			.image-stage img {
			  width: 100%;
			  transform: scale(1);
			  transition: all 0.3s ease;
			  touch-action: pan-y;
			  user-select: none;
			  -webkit-user-drag: none;
			}
			
			.image-stage.zoom-in {
			  cursor: -webkit-grab;
			}
			
			.image-stage.zoom-in img {
			  transform: scale(3);
			}
			
			.controls {
			  position: absolute;
			  right: 10px;
			  top: 10px;
			  z-index: 2;
			  white-space: nowrap;
			  width: 60px;
			}
			
			.controls button {
			  display: inline-block;
			  width: 25px;
			  height: 25px;
			  padding: 5px;
			  border: none;
			  background-color: #fff;
			  border-radius: 5px;
			  cursor: pointer;
			  transition: all 0.2s ease;
			  margin-bottom: 2em;
			  margin-left: 0.5em;
			  border: 5px solid #fff;
			}
			.controls button:focus,
			.controls button:active {
			  outline: none;
			}
			.control-in {
			  opacity: 1;
			  background-image: url("data:image/svg+xml,%3C%3Fxml version='1.0' encoding='utf-8'%3F%3E%3Csvg version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' viewBox='0 0 80.3 80.3' style='enable-background:new 0 0 80.3 80.3%3B' xml:space='preserve'%3E%3Cg%3E%3Cpath d='M78.8 73.3L57.7 52.2c-0.3-0.3-0.6-0.5-0.9-0.7c4.4-5.6 6.8-12.5 6.8-19.7c0-8.5-3.3-16.5-9.3-22.5c-6-6-14-9.3-22.5-9.3C23.3 0 15.3 3.3 9.3 9.3c-12.4 12.4-12.4 32.6 0 45c6 6 14 9.3 22.5 9.3c7.2 0 14.1-2.4 19.7-6.8c0.2 0.3 0.4 0.6 0.7 0.9l21.1 21.1c1.5 1.5 4 1.5 5.6 0C80.4 77.3 80.4 74.8 78.8 73.3z M51 51C45.9 56.2 39.1 59 31.8 59c-7.2 0-14.1-2.8-19.2-7.9c-10.6-10.6-10.6-27.8 0-38.4c5.1-5.1 11.9-7.9 19.2-7.9c7.2 0 14.1 2.8 19.2 7.9c5.1 5.1 7.9 11.9 7.9 19.2C59 39.1 56.1 45.9 51 51z'/%3E%3C/g%3E%3Cpath d='M43.5 29.1h-9.3v-9.3c0-1.3-1.1-2.4-2.4-2.4c-1.3 0-2.4 1.1-2.4 2.4v9.3h-9.3c-1.3 0-2.4 1.1-2.4 2.4c0 1.3 1.1 2.4 2.4 2.4h9.3v9.3c0 1.3 1.1 2.4 2.4 2.4c1.3 0 2.4-1.1 2.4-2.4v-9.3h9.3c1.3 0 2.4-1.1 2.4-2.4C45.9 30.2 44.8 29.1 43.5 29.1z'/%3E%3C/svg%3E");
			}
			.control-out {
			  opacity: .4;
			  background-image: url("data:image/svg+xml,%3C%3Fxml version='1.0' encoding='utf-8'%3F%3E%3Csvg version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' viewBox='0 0 80.3 80.3' style='enable-background:new 0 0 80.3 80.3%3B' xml:space='preserve'%3E%3Cg%3E%3Cpath d='M78.8 73.3L57.7 52.2c-0.3-0.3-0.6-0.5-0.9-0.7c4.4-5.6 6.8-12.5 6.8-19.7c0-8.5-3.3-16.5-9.3-22.5c-6-6-14-9.3-22.5-9.3C23.3 0 15.3 3.3 9.3 9.3c-12.4 12.4-12.4 32.6 0 45c6 6 14 9.3 22.5 9.3c7.2 0 14.1-2.4 19.7-6.8c0.2 0.3 0.4 0.6 0.7 0.9l21.1 21.1c1.5 1.5 4 1.5 5.6 0C80.4 77.3 80.4 74.8 78.8 73.3z M51 51C45.9 56.2 39.1 59 31.8 59c-7.2 0-14.1-2.8-19.2-7.9c-10.6-10.6-10.6-27.8 0-38.4c5.1-5.1 11.9-7.9 19.2-7.9c7.2 0 14.1 2.8 19.2 7.9c5.1 5.1 7.9 11.9 7.9 19.2C59 39.1 56.1 45.9 51 51z'/%3E%3Cpath d='M43.5 29H20.1c-1.3 0-2.4 1.2-2.4 2.5s1.1 2.5 2.4 2.5h23.4c1.3 0 2.4-1.2 2.4-2.5S44.8 29 43.5 29z'/%3E%3C/g%3E%3C/svg%3E")
			}
			.image-stage.zoom-in+.controls .control-in {
			  opacity: .4;
			}
			.image-stage.zoom-in+.controls .control-out {
			  opacity: 1;
			}
		</style>
		<div class="container">
			<div id="image-stage" class="image-stage"><div class="image-wrap"><img class="image" src="${src}" alt=""></div></div>
			<div class="controls"><button id="control-in" class="control control-in"></button><button id="control-out" class="control control-out"></button></div>
		</div>
		<script type="text/javascript">
			const product=document.querySelector(".image-stage"),img=document.querySelector(".image-wrap"),plus=document.querySelector(".control-in"),minus=document.querySelector(".control-out");let isDown=!1,startX,stateY;function getPositions(t){isDown=!0,startX=t.pageX-product.offsetLeft,startY=t.pageY-product.offsetTop,product.classList.add("zoom-in")}function disable(t){isDown=!1}function zoomPan(t){if(!isDown)return;t.preventDefault();let e=t.pageX-product.offsetLeft,o=t.pageY-product.offsetTop,s=e-startX,n=o-startY;img.style.transform="translateX("+s+"px) translateY("+n+"px)"}plus.addEventListener("click",t=>{product.classList.add("zoom-in")}),minus.addEventListener("click",t=>{product.classList.remove("zoom-in"),img.style.transform="translateX(0px) translateY(0px)"}),product.addEventListener("mousedown",getPositions),product.addEventListener("mouseup",disable),product.addEventListener("mouseleave",disable),product.addEventListener("mousemove",zoomPan),product.addEventListener("touchstart",getPositions),product.addEventListener("touchend",disable),product.addEventListener("touchcancel",disable),product.addEventListener("touchmove",zoomPan);
		<`+ `/script>`
	}
	function renderIframely(src) {
		return `
		<style>
			.iframely-embed { width: 100%; }
			.iframely-responsive { position: relative; top: 0;left: 0; width: 100%; height: 0; padding-bottom: 56.25%; }
			.iframely-responsive > * { position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0; }
		</style>
		<div class="iframely-embed">
			<div class="iframely-responsive">
			<a data-iframely-url href="${src}"></a>
			</div>
		</div>
		<script>
			  const script = document.createElement("script");
			  script.src = "//cdn.iframe.ly/embed.js?api_key=${iframelyKey}";
			  script.async = true;
			  document.body.appendChild(script);
		<` + `/script>`
	}
}

