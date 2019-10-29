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
import {decode} from "base64-arraybuffer";

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
    const capture = useCallback(
        () => {
            if (webcamRef.current) {
                // we have an active camera
                const camera: any = webcamRef.current;
                if (camera!.getScreenshot) {
                    const jpegBase64 = camera.getScreenshot();
                    const imageByteArray = decode(jpegBase64.split(",")[1]);
                    setBlob(imageByteArray);
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
                                       setBlob(null)
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
