import React, {Component} from 'react';
import { ProgressBar } from "../progress-bar/progressBar";
const styles = require("./style.scss");

type Props = {
    loaded: number;
    total: number;
    abort: boolean;
    onCancel: () => void;
};

/**
 * ui for upload phase
 */
export class UploadUI extends Component<Props> {
    render() {
        const { loaded, total, abort, onCancel } = this.props;
        const disableCancel = abort || loaded >= total;

        return (
            <div className={`xr_uploader ${styles["uploader"]}`}>
                <div className={`xr_cancel-wrap ${styles["cancel-wrap"]}`}>
                    {loaded < total && (
                        <button
                            className={`xr_btn xr_btn-cancel ${styles["btn"]} ${
                                styles["btn-cancel"]
                            }
                            ${
                                disableCancel
                                    ? `${styles["btn-cancel--disabled"]} xr_btn-cancel--disabled`
                                    : ""
                            }`}
                            onClick={disableCancel ? undefined : onCancel}
                            disabled={disableCancel}
                        >
                            Cancel
                        </button>
                    )}
                </div>
                <div className={`xr_progress-bar-wrap ${styles["progress-bar-wrap"]}`}>
                    {loaded < total && (
                        <div className={`xr_progress-bar ${styles["progress-bar"]}`}>
                            <ProgressBar loaded={loaded} total={total} />{" "}
                        </div>
                    )}
                </div>
                {loaded >= total && total > 0 && (
                    <div
                        className={`xr_upload-success-message ${styles["upload-success-message"]}`}
                    >
                        <strong>Upload Completed!</strong>
                    </div>
                )}
            </div>
        );
    }
}
