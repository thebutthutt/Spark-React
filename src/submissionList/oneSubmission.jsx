import React from "react";
import FormattedDate from "../common/formattedDate";
import FormattedShortDate from "../common/formattedShortDate";
import { statusText } from "../common/utils";
import { axiosInstance } from "../app";
import StatusFlag from "./flags/statusFlag";
import { withRouter } from "react-router-dom";
import PickupModal from "../singleFileView/pickupModal";
import { ReactComponent as GradCap } from "../common/images/education.svg";
import { ReactComponent as Archive } from "../common/images/archive.svg";
import { ReactComponent as Delete } from "../common/images/delete.svg";
import ReactTooltip from "react-tooltip";
import fileDownload from "js-file-download";
import PatronModal from "./editPatronModal";

class SingleSubmission extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            item: props.item,
            printPage: props.printPage,
        };
        this.pickupModal = React.createRef();
        this.patronModal = React.createRef();
    }

    updatePage() {
        this.props.history.go(0);
    }

    handleRequestPayment() {
        axiosInstance
            .post("/submissions/requestpayment/" + this.state.item._id)
            .then((res) => {
                console.log(res.data);
                this.props.history.go(0);
            })
            .catch((err) => {
                console.log(err);
            });
    }

    handleWaive() {
        axiosInstance
            .post("/submissions/waive/" + this.state.item._id)
            .then((res) => {
                this.props.history.go(0);
            })
            .catch((err) => {
                console.log(err);
            });
    }

    handleUndoWaive() {
        axiosInstance
            .post("/submissions/undowaive/" + this.state.item._id)
            .then((res) => {
                this.props.history.go(0);
            })
            .catch((err) => {
                console.log(err);
            });
    }

    handleDeleteFile(fileID) {
        axiosInstance
            .post("/submissions/delete/file/" + fileID)
            .then((res) => {
                this.props.history.go(0);
            })
            .catch((err) => {
                console.log(err);
            });
    }

    downloadAll(submissionID) {
        axiosInstance
            .get("/download/zip/" + submissionID, {
                responseType: "blob",
            })
            .then((res) => {
                fileDownload(res.data, submissionID + ".zip");
            });
    }

    openPickupModal = (files) => {
        let fileIDs = [];
        for (let file of files) {
            fileIDs.push(file._id);
        }
        this.pickupModal.current.openModal(fileIDs);
    };

    render() {
        let submission = this.state.item;
        let submittedDate = new Date(submission.submissionDetails.timestampSubmitted);
        let reviewDate = new Date(submission.paymentRequest.timestampPaymentRequested);
        let paidDate = new Date(submission.payment.timestampPaid);

        let totalMinutes = submission.sums.totalHours * 60 + submission.sums.totalMinutes;
        let finalHours = Math.floor(totalMinutes / 60);
        let finalMintes = totalMinutes % 60;

        const emailTitle = (templateName) => {
            switch (templateName) {
                case "submissionRecieved":
                    return "Submitted";
                case "submissionReviewed":
                    return "Payment Request";
                case "paymentRecieved":
                    return "Payment Reciept";
                case "paymentWaived":
                    return "Payment Waived";
                case "readyForPickup":
                    return "Pickup Notice";
                default:
                    return templateName;
            }
        };

        const requestInfo = (file) => {
            if (file.request.material == "Any Material" && file.request.color == "Any Color") {
                return "Any Filament";
            } else {
                return (
                    (file.request.color == "Any Color" ? "Any" : file.request.color) +
                    " " +
                    (file.request.material == "Any Material" ? "Filament" : file.request.material)
                );
            }
        };

        const readyBorder = () => {
            if (submission.flags.allFilesReviewed && reviewDate < new Date("1980")) {
                return " border-green border-2 bg-highlightgreen";
            } else {
                return null;
            }
        };

        const buttonTextClasses = () => {
            return "flex-grow-1 px-1 lh-1 m-0";
        };

        const buttonFlexClasses = () => {
            return "d-flex flex-row align-items-center";
        };

        const requestAndUndoWaiveButton = () => {
            if (!this.props.user.isAdmin) {
                if (!submission.flags.isPendingWaive) {
                    return (
                        <button
                            type="button"
                            className="btn btn-outline-lime"
                            onClick={() => {
                                this.handleWaive();
                            }}>
                            <div className={buttonFlexClasses()}>
                                <i className="custom-icon">
                                    <GradCap />
                                </i>
                                <span className={buttonTextClasses()}>Request Waive</span>
                            </div>
                        </button>
                    );
                } else {
                    return (
                        <button
                            type="button"
                            className="btn btn-outline-orange"
                            onClick={() => {
                                this.handleUndoWaive();
                            }}>
                            <div className={buttonFlexClasses()}>
                                <i className="bi-arrow-90deg-left"></i>
                                <span className={buttonTextClasses()}>Undo Waive Request</span>
                            </div>
                        </button>
                    );
                }
            }
        };

        const adminWaiveButton = () => {
            if (this.props.user.isAdmin && !submission.flags.isPendingWaive) {
                return (
                    <button
                        type="button"
                        className="btn btn-outline-lime"
                        onClick={() => {
                            this.handleWaive();
                        }}>
                        <div className={buttonFlexClasses()}>
                            <i className="custom-icon">
                                <GradCap />
                            </i>

                            <span className={buttonTextClasses()}>Waive Payment</span>
                        </div>
                    </button>
                );
            } else {
                return null;
            }
        };

        const acceptRejectWaiveButtons = () => {
            if (this.props.user.isAdmin && submission.flags.isPendingWaive) {
                return (
                    <div className="row g-1">
                        <div className="col">
                            <button
                                type="button"
                                className="btn btn-outline-green w-100"
                                onClick={() => {
                                    this.handleWaive();
                                }}>
                                <div className={buttonFlexClasses()}>
                                    <i className="bi-hand-thumbs-up"></i>
                                    <span className={buttonTextClasses()}>Waive</span>
                                </div>
                            </button>
                        </div>
                        <div className="col">
                            <button
                                type="button"
                                className="btn btn-outline-red w-100"
                                onClick={() => {
                                    this.handleUndoWaive();
                                }}>
                                <div className={buttonFlexClasses()}>
                                    <i className="bi-hand-thumbs-down"></i>
                                    <span className={buttonTextClasses()}>Reject</span>
                                </div>
                            </button>
                        </div>
                    </div>
                );
            } else {
                return null;
            }
        };

        const pickupButton = () => {
            let hasPickup = submission.files.reduce((accum, curr) => {
                return accum || curr.status == "WAITING_FOR_PICKUP";
            }, false);

            if (hasPickup) {
                return (
                    <button
                        type="button"
                        className="btn btn-outline-purple"
                        onClick={() => {
                            this.openPickupModal(submission.files);
                        }}>
                        <div className={buttonFlexClasses()}>
                            <i className="bi-gift"></i>
                            <span className={buttonTextClasses()}>Pick Up All Files</span>
                        </div>
                    </button>
                );
            } else {
                return null;
            }
        };

        const finalTime = (hours, minutes) => {
            let extraMinutes = minutes % 60;
            let extraHours = Math.floor(minutes / 60);
            return {
                hours: hours + extraHours,
                minutes: extraMinutes,
            };
        };

        const formatMaterial = (material, color) => {
            if (
                (color.toLowerCase() == "any color" || color.toLowerCase() == "no preference") &&
                (material.toLowerCase() == "any material" || material.toLowerCase() == "no preference")
            ) {
                return "Any Filament";
            } else if (color.toLowerCase() == "any color" || color.toLowerCase() == "no preference") {
                return material;
            } else if (material.toLowerCase() == "any material" || material.toLowerCase() == "no preference") {
                return color;
            } else {
                return color + " " + material;
            }
        };

        return (
            <div className={"card shadow mb-3 " + readyBorder()} key={this.props.index}>
                <ReactTooltip place="left" />
                <div className="card-body">
                    <div className="row">
                        <div className="col-12  col-xxl-custom-left">
                            <div className="row">
                                <div className="col-12 col-sm-6 col-md-3 col-xxl-12">
                                    <div className="d-flex flex-nowrap w-100 align-items-baseline">
                                        <span className="h5 card-title mb-2 flex-grow-1">
                                            {submission.patron.fname + " " + submission.patron.lname}{" "}
                                        </span>
                                        <button
                                            className="btn btn-light bg-transparent p-1 rounded-circle"
                                            style={{ lineHeight: "1rem" }}
                                            onClick={() => {
                                                this.patronModal.current.openModal(submission);
                                            }}>
                                            <i className="bi-pen"></i>
                                        </button>
                                    </div>

                                    <h6 className="card-subtitle mb-3 text-muted text-capitalize">
                                        {submission.submissionDetails.submissionType.toLowerCase() + " submission"}
                                    </h6>
                                </div>
                                <div className="col-12 col-sm-6 col-md-3 col-xxl-12">
                                    {submission.submissionDetails.submissionType == "CLASS" && (
                                        <table className="table mb-0 table-sm table-borderless text-nowrap text-capitalize border-top border-bottom top-table">
                                            <tbody>
                                                <tr>
                                                    <td className="ps-0">
                                                        {submission.submissionDetails.classDetails.project}
                                                    </td>
                                                    <td>{submission.submissionDetails.classDetails.classCode}</td>
                                                </tr>
                                                <tr>
                                                    <td className="ps-0 text-muted" colSpan="2">
                                                        {submission.submissionDetails.classDetails.professor}
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    )}
                                    {submission.submissionDetails.submissionType == "INTERNAL" && (
                                        <table className="table mb-0 table-sm table-borderless text-nowrap text-capitalize border-top border-bottom top-table">
                                            <tbody>
                                                <tr>
                                                    <td className="ps-0">
                                                        {submission.submissionDetails.internalDetails.department}
                                                    </td>
                                                    <td>{submission.submissionDetails.internalDetails.project}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    )}
                                    <table
                                        className={
                                            "table mb-2 table-sm table-borderless text-nowrap border-top border-bottom bottom-table " +
                                            (submission.isForClass || submission.isForDepartment
                                                ? "has-top-table"
                                                : "no-top-table")
                                        }>
                                        <tbody>
                                            <tr>
                                                <td className="ps-0 text-muted">Submitted</td>
                                                <td className="text-end">
                                                    <FormattedDate date={submittedDate} />
                                                </td>
                                            </tr>
                                            {reviewDate > new Date("1980") && (
                                                <tr>
                                                    <td className="ps-0 text-muted">Reviewed</td>
                                                    <td className="text-end">
                                                        <FormattedDate date={reviewDate} />
                                                    </td>
                                                </tr>
                                            )}
                                            {paidDate > new Date("1980") && (
                                                <tr>
                                                    <td className="ps-0 text-muted">Paid</td>
                                                    <td className="text-end">
                                                        <FormattedDate date={paidDate} />
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="col-12 col-sm-6 col-md-3 col-xxl-12">
                                    <div className="d-grid gap-1 mt-2">
                                        {/* ------------------------- Request Payment Button ------------------------- */}
                                        {reviewDate < new Date("1980") && (
                                            <button
                                                type="button"
                                                className={
                                                    "btn " +
                                                    (submission.flags.allFilesReviewed
                                                        ? "btn-primary"
                                                        : "btn-outline-primary ")
                                                }
                                                onClick={() => {
                                                    this.handleRequestPayment();
                                                }}
                                                disabled={!submission.flags.allFilesReviewed}>
                                                <div className={buttonFlexClasses()}>
                                                    <i className="bi-cash-stack"></i>
                                                    <span className={buttonTextClasses()}>Request Payment</span>
                                                </div>
                                            </button>
                                        )}

                                        {/* -------------------------- Resend Payment -------------------------- */}
                                        {reviewDate > new Date("1980") && paidDate < new Date("1980") && (
                                            <React.Fragment>
                                                {requestAndUndoWaiveButton()}
                                                {acceptRejectWaiveButtons()}
                                                {adminWaiveButton()}

                                                <button
                                                    type="button"
                                                    className="btn btn-outline-orange"
                                                    onClick={() => {
                                                        this.handleRequestPayment();
                                                    }}>
                                                    <div className={buttonFlexClasses()}>
                                                        <i className="bi-envelope-open"></i>
                                                        <span className={buttonTextClasses()}>
                                                            Resend Payment Email
                                                        </span>
                                                    </div>
                                                </button>
                                            </React.Fragment>
                                        )}
                                        {/* ------------------------ Download All Files Button ----------------------- */}
                                        <button type="button" className="btn btn-outline-lightblue">
                                            <div
                                                className={buttonFlexClasses()}
                                                onClick={() => {
                                                    this.downloadAll(submission._id);
                                                }}>
                                                <i className="bi-file-earmark-zip"></i>
                                                <span className={buttonTextClasses()}>Download All Files</span>
                                            </div>
                                        </button>

                                        {/* ------------------------- Pickup Full Submission ------------------------- */}
                                        {pickupButton()}
                                    </div>
                                </div>
                                <div className="col-12 col-sm-6 col-md-3 col-xxl-12">
                                    {submission.emails.length > 0 && (
                                        <table className="table table-sm mt-2">
                                            <thead>
                                                <tr>
                                                    <th colSpan="2" className="ps-0">
                                                        Email Records
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {submission.emails.map((email, index) => {
                                                    return (
                                                        <tr>
                                                            <td className="ps-0 text-muted">
                                                                {emailTitle(email.templateName)}
                                                            </td>
                                                            <td className="text-end">
                                                                <FormattedShortDate date={email.timestampSent} />
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="col-12 col-xxl-custom-right">
                            <div className="card">
                                <table className="table mb-0 table-hover">
                                    <thead className="card-header">
                                        <tr>
                                            <th style={{ width: "1%" }}>Preview</th>
                                            <th style={{ width: "20%" }}>Filename</th>
                                            <th>Request</th>
                                            <th>Printer</th>
                                            <th>Review</th>
                                            <th>Price</th>
                                            <th>Print Attempts</th>
                                            <th style={{ width: "1%" }}></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {submission.files.map((file, index) => {
                                            return (
                                                <tr>
                                                    <td>
                                                        <div
                                                            className="rounded border"
                                                            style={{
                                                                backgroundImage: `url(submissions/thumbnail/${file._id})`,
                                                                backgroundSize: "cover",
                                                                backgroundPosition: "center center",
                                                                width: "4.5rem",
                                                                height: "4.5rem",
                                                            }}></div>
                                                    </td>
                                                    <td className="h-100">
                                                        <div>
                                                            <a
                                                                className={
                                                                    "text-decoration-none h5 mb-0 me-2 " +
                                                                    statusText(file)
                                                                }
                                                                href={`/files/${file._id}`}>
                                                                {file.fileName}
                                                            </a>
                                                        </div>
                                                        <p
                                                            className="mb-0"
                                                            data-place="bottom"
                                                            data-multiline={true}
                                                            data-tip="Volume calculated from the submitted file.<br/>This will not include supports!">
                                                            {file.review.calculatedVolumeCm.toFixed(2)} cm<sup>3</sup>
                                                        </p>
                                                        <div>
                                                            <StatusFlag file={file} />
                                                        </div>
                                                    </td>
                                                    <td>
                                                        {formatMaterial(file.request.material, file.request.color)}
                                                        <br />
                                                        {file.request.infill}% infill <br />
                                                        {file.request.pickupLocation}
                                                    </td>
                                                    <td className="text-capitalize">
                                                        {(file.review.slicedPrinter || "").toLowerCase()}
                                                        <br />
                                                        {file.review.slicedMaterial}
                                                    </td>
                                                    <td>
                                                        {file.review.slicedHours}h {file.review.slicedMinutes}m<br />
                                                        {file.review.slicedGrams}g <br />
                                                    </td>
                                                    <td>
                                                        $
                                                        {(
                                                            (file.review.slicedHours * 60 + file.review.slicedMinutes) /
                                                            60
                                                        ).toFixed(2)}
                                                    </td>
                                                    <td>
                                                        {file.printing.attemptDetails.map((attempt, index) => {
                                                            return (
                                                                <div className="">
                                                                    <p className="mb-0">
                                                                        <span
                                                                            className={
                                                                                attempt.isSuccess
                                                                                    ? "text-green"
                                                                                    : attempt.isFailure
                                                                                    ? "text-red"
                                                                                    : "text-blue"
                                                                            }>
                                                                            {attempt.prettyID}
                                                                        </span>
                                                                        :{" "}
                                                                        <span>
                                                                            {attempt.startWeight - attempt.endWeight}g
                                                                        </span>
                                                                    </p>
                                                                    {/* <p className="mb-0">{attempt.location}</p> */}
                                                                </div>
                                                            );
                                                        })}
                                                    </td>
                                                    <td>
                                                        <div className="d-flex flex-column">
                                                            <button
                                                                data-tip="Request to be deleted"
                                                                className="btn btn-outline-red lh-1 rounded-circle mb-1"
                                                                style={{ padding: "0.3rem" }}
                                                                onClick={() => {
                                                                    this.handleDeleteFile(file._id);
                                                                }}>
                                                                <Delete
                                                                    style={{
                                                                        width: "1rem",
                                                                        height: "1rem",
                                                                        verticalAlign: "-0.125em",
                                                                        fill: "currentcolor",
                                                                    }}
                                                                />
                                                            </button>
                                                            <button
                                                                data-tip="Request to be archived"
                                                                className="btn btn-outline-midgrey lh-1 rounded-circle"
                                                                style={{ padding: "0.3rem" }}>
                                                                <Archive
                                                                    style={{
                                                                        width: "1rem",
                                                                        height: "1rem",
                                                                        verticalAlign: "-0.125em",
                                                                        fill: "currentcolor",
                                                                    }}
                                                                />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        {/* ⃠*/}
                                    </tbody>
                                    <tfoot className="card-footer">
                                        <tr>
                                            <th scope="row">Totals</th>
                                            <td>
                                                {submission.sums.totalVolume.toFixed(2)} cm <sup>3</sup>
                                            </td>
                                            <td></td>
                                            <td></td>
                                            <td>
                                                {
                                                    finalTime(submission.sums.totalHours, submission.sums.totalMinutes)
                                                        .hours
                                                }
                                                h{" "}
                                                {
                                                    finalTime(submission.sums.totalHours, submission.sums.totalMinutes)
                                                        .minutes
                                                }
                                                m<br />
                                                {submission.sums.totalWeight}g
                                            </td>
                                            <td>${submission.paymentRequest.requestedPrice}</td>
                                            <td></td>
                                            <td></td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
                <PickupModal ref={this.pickupModal} />
                <PatronModal ref={this.patronModal} updatePage={this.updatePage.bind(this)} />
            </div>
        );
    }
}

export default withRouter(SingleSubmission);
