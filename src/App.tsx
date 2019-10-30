import React, {useEffect, useState, useRef, useCallback} from 'react';
import './App.scss';
import Webcam from "react-webcam";
import logo from './logo.png';
import xx from './x.png';
import send from './send.png';
import but from './but.png';
import sad from './sad.png';
import {UploadManager} from "./componenets/uploader/uploadManager";
import {KalturaClient} from "kaltura-typescript-client";
import {KalturaMediaType} from "kaltura-typescript-client/api/types";
import {decode} from "base64-arraybuffer";

export enum AppState {
    init = "init",
    preview = "preview",
    upload = "upload",
    error = "error",
    camera = "camera"
}

export enum CameraStatus {
    init = "init",
    ready = "ready",
}

const App: React.FC = () => {

    const webcamRef = useRef(null);
    const previewRef = useRef(null);
    const errorScreen = useRef(null);
    const camEffect = useRef(null);
    const uploadManager = useRef(null);
    const ks = "LIeGFiMGRhMTI5Nzk1ZGJhMDRjMDcyODExMGYwN2ZkOGZlMjJmMjZhN3wyNzAxNzsyNzAxNzsxNTcyNTA1MzAwOzI7MTU3MjQxODkwMC44NzkyO2VpdGFuLmF2Z2lsQGthbHR1cmEuY29tO2Rpc2FibGVlbnRpdGxlbWVudCxhcHBpZDprbWM7Ow==";

    // const [ks, setKs] = useState();
    const [client, setClient] = useState();
    const [blob, setBlob] = useState();
    const [camStatus, setCameraStatus] = useState(CameraStatus.init);
    const [appState, setAppState] = useState(AppState.camera);

    const buttonClicked = (isPreview?: boolean) => {
        if (appState === AppState.camera && webcamRef.current) {
            setAppState(AppState.preview);
            // we have an active camera
            const camera: any = webcamRef.current;
            if (camera!.getScreenshot) {
                const jpegBase64 = camera.getScreenshot();
                (previewRef.current as any).src = jpegBase64;
                const imageByteArray = decode(jpegBase64.split(",")[1]);
                setBlob(imageByteArray);
            }
        } else if (appState === AppState.preview) {
            setAppState(AppState.upload);
        }
    };

    // cammera shutter effect
    useEffect(() => {
        if (appState === AppState.camera) {
            (previewRef.current as any).src = "";
        }
        if (appState === AppState.preview || appState === AppState.camera) {
            // change to preview - show effect
            (camEffect.current as any).classList.add("show");
            setTimeout(() => {
                (camEffect.current as any).classList.remove("show");
            }, 100);
        }
    }, [appState]);


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
        <div className={"App " + appState}>
            <header className="App-header">
                {appState === AppState.error &&
                <div className="error" ref={errorScreen}>
                    <div className="error-container">
                        <div>
                            Something went wrong
                        </div>
                        <div>
                            , Please try again.
                        </div>
                        <img className={"sad"} src={sad} alt="Booo..."/>
                    </div>
                </div>
                }
                <div className="cam-effect" ref={camEffect}></div>

                <div className="loader-container">
                    <div className="loader"></div>
                </div>

                {appState === AppState.preview &&
                <button><img src={xx} alt="Close" className={"close-button"}
                             onClick={() => {
                                 setBlob(null);
                                 setAppState(AppState.camera)
                             }}
                /></button>
                }
                <img src={logo} alt="Logo" className={"logo"}/>
                <div className="camera-preview-container">
                    <div className={"preview-container " + AppState.preview}>
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
                        {appState === AppState.camera &&
                        <img src={but} alt="Capture" className={"but"}/>
                        }
                        {(appState === AppState.preview || appState === AppState.upload) &&
                        <img src={send} alt="Send" className={"send"}/>
                        }
                    </button>
                }
                {
                    blob && client && appState === AppState.upload &&
                    <UploadManager client={client}
                                   ref={uploadManager}
                                   mediaType={KalturaMediaType.image}
                                   recordedBlobs={[blob]}
                                   onError={(error) => {
                                       setAppState(AppState.error)
                                   }}
                                   onUploadEnded={(entryId) => {
                                       console.log(">>>> ENDED",);
                                       setAppState(AppState.camera)
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
