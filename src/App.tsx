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
    upload = "upload",
    camera = "camera"
}

export enum CameraStatus {
    init = "init",
    ready = "ready",
}

const App: React.FC = () => {

    const webcamRef = useRef(null);
    const previewRef = useRef(null);
    const camEffect = useRef(null);
    const uploadManager = useRef(null);
    const ks = "GFiMGRhMTI5Nzk1ZGJhMDRjMDcyODExMGYwN2ZkOGZlMjJmMjZhN3wyNzAxNzsyNzAxNzsxNTcyNTA1MzAwOzI7MTU3MjQxODkwMC44NzkyO2VpdGFuLmF2Z2lsQGthbHR1cmEuY29tO2Rpc2FibGVlbnRpdGxlbWVudCxhcHBpZDprbWM7Ow==";

    // const [ks, setKs] = useState();
    const [client, setClient] = useState();
    const [blob, setBlob] = useState();
    const [camStatus, setCameraStatus] = useState(CameraStatus.init);
    const [previewMode, setPreviewMode] = useState(PreviewMode.camera);

    const buttonClicked = (isPreview?: boolean) => {
        if (previewMode === PreviewMode.camera && webcamRef.current) {
            setPreviewMode(PreviewMode.preview);
            // we have an active camera
            const camera: any = webcamRef.current;
            if (camera!.getScreenshot) {
                const jpegBase64 = camera.getScreenshot();
                (previewRef.current as any).src = jpegBase64;
                const imageByteArray = decode(jpegBase64.split(",")[1]);
                setBlob(imageByteArray);
            }
        } else if (previewMode === PreviewMode.preview) {
            setPreviewMode(PreviewMode.upload);
        }
    };

    // cammera shutter effect
    useEffect(() => {
        if (previewMode === PreviewMode.camera) {
            (previewRef.current as any).src = "";
        }
        if (previewMode === PreviewMode.preview || previewMode === PreviewMode.camera) {
            // change to preview - show effect
            (camEffect.current as any).classList.add("show");
            setTimeout(() => {
                (camEffect.current as any).classList.remove("show");
            }, 100);
        }
    }, [previewMode]);


    // one time loaded
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

    return (
        <div className={"App " + previewMode}>
            <header className="App-header">
                <div className="cam-effect" ref={camEffect}></div>

                <div className="loader-container">
                    <div className="loader"></div>
                </div>

                {previewMode === PreviewMode.preview &&
                <button><img src={xx} alt="Close" className={"close-button"}
                             onClick={() => {
                                 setBlob(null);
                                 setPreviewMode(PreviewMode.camera)
                             }}
                /></button>
                }
                <img src={logo} alt="Logo" className={"logo"}/>
                <div className="camera-preview-container">
                    <div className={"preview-container " + PreviewMode.preview}>
                        <img id={"preview-image"} ref={previewRef}></img>
                    </div>
                    <Webcam audio={false} imageSmoothing={false}
                            ref={webcamRef}
                            videoConstraints={{
                                facingMode: "user"
                            }}
                            onUserMedia={() => {
                                setCameraStatus(CameraStatus.ready)
                            }}
                            onUserMediaError={() => {
                                console.log(">>>> OUME");
                            }}
                            screenshotFormat={"image/jpeg"} screenshotQuality={1}/>
                </div>
                {
                    camStatus === CameraStatus.ready &&
                    <button className={"button"}
                            onClick={() => buttonClicked()}
                    >
                        {previewMode === PreviewMode.camera &&
                        <img src={but} alt="Capture" className={"but"}/>
                        }
                        {(previewMode === PreviewMode.preview || previewMode === PreviewMode.upload) &&
                        <img src={send} alt="Send" className={"send"}/>
                        }
                    </button>
                }
                {
                    blob && client && previewMode === PreviewMode.upload &&
                    <UploadManager client={client}
                                   ref={uploadManager}
                                   mediaType={KalturaMediaType.image}
                                   recordedBlobs={[blob]}
                                   onError={(error) => {
                                       console.log("Error:", error)
                                   }}
                                   onUploadEnded={(entryId) => {
                                       console.log(">>>> ENDED",);
                                       setPreviewMode(PreviewMode.camera)
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
