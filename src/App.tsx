import React, {useEffect, useState, useRef, useCallback} from 'react';
import './App.scss';
import Webcam from "react-webcam";
import logo from './logo.png';
import xx from './x.png';
import send from './send.png';
import baa from './baa.png';
import happy from './happy.png';
import but from './but.png';
import sad from './sad.png';
import {UploadManager} from "./componenets/uploader/uploadManager";
import {KalturaClient} from "kaltura-typescript-client";
import {KalturaMediaType} from "kaltura-typescript-client/api/types";
import {decode} from "base64-arraybuffer";

export enum AppState {
    preview = "preview",
    upload = "upload",
    done = "done",
    notSupported = "notSupported",
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
    const camEffect = useRef(null);
    const uploadManager = useRef(null);
    const ks = "";

    // const [ks, setKs] = useState();
    const [client, setClient] = useState();
    const [blob, setBlob] = useState();
    const [camStatus, setCameraStatus] = useState(CameraStatus.init);
    const [appState, setAppState] = useState(AppState.camera);

    const buttonClicked = () => {
        console.log(">>>> buttonClicked appState",appState);
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

    // camera shutter effect
    useEffect(() => {
        if (appState === AppState.camera || appState === AppState.done) {
            (previewRef.current as any).src = "";
        }
        if (appState === AppState.preview || appState === AppState.camera) {
            // change to preview - show effect
            (camEffect.current as any).classList.add("show");
            setTimeout(() => {
                (camEffect.current as any).classList.remove("show");
            }, 600);
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
            <div className="loader-container">
                <div className="loader"></div>
            </div>

            <div className="cam-effect" ref={camEffect}></div>
            <img src={logo} alt="Logo" className={"logo"}/>
            {appState === AppState.error &&
            <div className="error-container">
                <div className="error">
                    <div>
                        Something went wrong
                    </div>
                    <div>
                        Please try again later.
                    </div>
                    <img className={"sad"} src={sad} alt="Booo..."/>
                </div>
            </div>
            }
            {appState === AppState.notSupported &&
            <div className="not-supported-container">
                <div className="not-supported">
                    <div>
                        Something went wrong, try again
                    </div>
                    <div>
                        use your friend's phone or grab a beer
                    </div>
                    <img className={"baa"} src={baa} alt="Bummer..."/>
                </div>
            </div>
            }
            {appState === AppState.done &&
            <div className="done-container">
                <div className="done">
                    <div>
                        Your image will be shown
                    </div>
                    <div>
                        soon on the wall
                    </div>
                    <img className={"happy"} src={happy} alt="Yey..."/>
                </div>
            </div>
            }
            <header className="App-header">

                {(appState === AppState.preview || appState === AppState.done) &&
                <button className={"button"}><img src={xx} alt="Close" className={"close-button"}
                                                  onClick={() => {
                                                      setBlob(null);
                                                      setAppState(AppState.camera)
                                                  }}
                /></button>
                }
                <div className="camera-preview-container">
                    <div className={"preview-container " + AppState.preview}>
                        <img className={"preview-image"} ref={previewRef}></img>
                    </div>
                    <Webcam audio={false} imageSmoothing={false}
                            ref={webcamRef}
                            videoConstraints={{
                                facingMode: "user"
                            }}
                            onLoadedData={
                                () => setCameraStatus(CameraStatus.ready)
                            }
                            onErrorCapture={() => setAppState(AppState.error)}
                            onUserMediaError={(e:any) => {
                                alert(e)
                                setAppState(AppState.notSupported)
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
                                       setAppState(AppState.done);
                                       setBlob(null);
                                   }}

                                   onUploadStarted={(entryId) => {
                                       console.log(">>>> STARTED - Entry", entryId)
                                   }}

                                   onUploadProgress={(loaded, total) => {
                                       console.log(">>> progress", loaded, total)
                                   }}
                                   entryName={"bobo.png"}
                                   serviceUrl={"https://www.kaltura.com"}
                                   ks={ks}/>
                }
            </header>
            <span className={"credits"}>@funwall - Dana | Lior | Eitan
</span>
        </div>
    );
}

export default App;
