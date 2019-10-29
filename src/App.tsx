import React, {useEffect, useState, useRef, useCallback} from 'react';
import './App.scss';
import Webcam from "react-webcam";
import logo from './logo.png';
import xx from './x.png';
import send from './send.png';
import but from './but.png';
import {UploadManager} from "./componenets/uploader/uploadManager";
import {KalturaClient} from "kaltura-typescript-client";
import {KalturaMediaType} from "kaltura-typescript-client/api/types";

export enum PreviewMode {
    init = "init",
    preview = "preview",
    camera = "camera"
}

const App: React.FC = () => {

    const webcamRef = useRef(null);

    const ks = "WY4NGM2NzU5ZTAyZDZlNDgyMGNjYmQ3ZTI4NWFiZDA1ZjZlNzBiY3wyNzAxNzsyNzAxNzsxNTcyNDE5NTU2OzI7MTU3MjMzMzE1Ni4xNDg1O2VpdGFuLmF2Z2lsQGthbHR1cmEuY29tO2Rpc2FibGVlbnRpdGxlbWVudCxhcHBpZDprbWM7Ow==";

    // const [ks, setKs] = useState();
    const [client, setClient] = useState();
    const [blob, setBlob] = useState();
    const [previewMode, setPreviewMode] = useState(PreviewMode.camera);

    useEffect(() => {
        // Update the document title using the browser API
        const kalturaClient = new KalturaClient();
        kalturaClient.setOptions({
            clientTag: "projector-app",
            endpointUrl: "https://www.kaltura.com"
        });
        kalturaClient.setDefaultRequestOptions({
            ks: ks
        });
        setClient(kalturaClient);

    }, []);

    const capture2 = (evt: any) => {
        var f = evt.target.files[0];

        if (f) {
            var r = new FileReader();
            //onload handler
            r.onload = (e: any) => {
                var contents = e.target.result;
                var buffer = r.result;
                setBlob(buffer);
                /*further processing goes here!*/
            };
            r.readAsArrayBuffer(f);

        } else {
            alert("Failed to load file");
        }
    }
    const capture = useCallback(
        () => {
            if (webcamRef.current) {
                // we have an active camera
                const camera: any = webcamRef.current;
                if (camera!.getScreenshot) {
                    const hhh = camera.getScreenshot();
                    // debugger;
                    setBlob(hhh);

                    // let ctx = camera.getCanvas().getContext('2d');
                    // let imageData = ctx.getImageData(0, 0, 1161, 870);


                    // let blob = new Blob(imageData, {type: "image/jpeg"});
                    // const file = new File([blob], "boboa.jpeg");
                    //
                    // var a = document.createElement("a"),
                    //     url = URL.createObjectURL(file);
                    // a.href = url;
                    // a.download = "popo.jpeg";
                    // document.body.appendChild(a);
                    // a.click();
                    // setTimeout(function () {
                    //     document.body.removeChild(a);
                    //     window.URL.revokeObjectURL(url);
                    // }, 0);


                    // setBlob(imageData);
                }
            }
        },
        [webcamRef]
    );

    return (
        <div className="App">
            <header className="App-header">
                {previewMode === PreviewMode.preview &&
                <button><img src={xx} alt="Close" className={"close-button"}
                             onClick={() => setPreviewMode(PreviewMode.camera)}
                /></button>
                }
                <img src={logo} alt="Logo" className={"logo"}/>
                <div className="camera-preview-container">
                    {previewMode === PreviewMode.preview &&
                    <div className="preview-container"></div>
                    }
                    {previewMode === PreviewMode.camera &&
                    <Webcam audio={false} imageSmoothing={false}
                            ref={webcamRef}
                            videoConstraints={{
                                facingMode: "user"
                            }}
                            onUserMedia={() => {
                            }}
                            onUserMediaError={() => {
                            }}
                            screenshotFormat={"image/jpeg"} screenshotQuality={1}/>
                    }
                </div>
                {/*
                   // onClick={() => setPreviewMode(PreviewMode.preview)}
                */}
                <button className={"button"}
                        onClick={capture}
                >
                    {previewMode === PreviewMode.camera &&
                    <img src={but} alt="Capture" className={"but"}/>
                    }
                    {previewMode === PreviewMode.preview &&
                    <img src={send} alt="Send" className={"send"}/>
                    }
                </button>
                {
                    blob && client &&
                    <UploadManager client={client}
                                   mediaType={KalturaMediaType.image}
                                   recordedBlobs={[blob]}
                                   onError={(error) => {
                                       console.log("Error:", error)
                                   }}
                                   onUploadEnded={(entryId) => {
                                       console.log(">>>> ENDED ", entryId)
                                   }}
                                   onUploadStarted={(entryId) => {
                                       console.log(">>>> STARTED ", entryId)
                                   }}

                                   onUploadProgress={(loaded, total) => {
                                       console.log(">>> ", loaded, total)
                                   }}

                                   entryName={"bobo.png"}
                                   serviceUrl={"https://www.kaltura.com"}
                                   ks={ks}/>
                }
            </header>
        </div>
    );
}

export default App;
