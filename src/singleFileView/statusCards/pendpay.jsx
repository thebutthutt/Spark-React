import React from "react";
import { Link } from "react-router-dom";
import FormattedDate from "../../common/formattedDate";
import axios from "../../common/axiosConfig";
import { statusText } from "../../common/utils";
import { withRouter } from "react-router-dom";

class PendingCard extends React.Component {
    constructor(props) {
        super(props);
    }

    reloadPage = () => {
        this.props.history.push("/files/" + this.props.file._id);
    };

    handleRequestPayment() {
        axios
            .post("/submissions/requestpayment/" + this.props.submission._id)
            .then((res) => {
                this.forceUpdate();
            })
            .catch((err) => {
                console.log(err);
            });
    }

    handleRequestPayment() {
        axios
            .post("/submissions/requestpayment/" + this.props.submission._id)
            .then((res) => {
                this.props.history.go(0);
            })
            .catch((err) => {
                console.log(err);
            });
    }

    handleWaive() {
        axios
            .post("/submissions/waive/" + this.props.submission._id)
            .then((res) => {
                this.props.history.go(0);
            })
            .catch((err) => {
                console.log(err);
            });
    }

    handleUndoWaive() {
        axios
            .post("/submissions/undowaive/" + this.props.submission._id)
            .then((res) => {
                this.props.history.go(0);
            })
            .catch((err) => {
                console.log(err);
            });
    }

    render() {
        let file = this.props.file;
        let submission = this.props.submission;
        return (
            <div className="card-body">
                <h3>
                    Status:{" "}
                    <span className={statusText(file)}>
                        {submission.isPendingWaive ? "Pending Waive" : "Pending Payment"}
                    </span>
                </h3>
                <h5 className="text-muted">
                    Payment requested on <FormattedDate date={file.payment.timestampPaymentRequested} />
                </h5>

                <table className="table">
                    <thead>
                        <tr>
                            <th></th>
                            <th>This File</th>
                            <th>Full Submission</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <th scope="row" className="text-muted">
                                Reviewed By
                            </th>
                            <td>
                                {file.review.reviewedByName} ({file.review.reviewedByEUID})
                            </td>
                            <td>
                                {submission.paymentRequestingName} ({submission.paymentRequestingEUID})
                            </td>
                        </tr>
                        <tr>
                            <th scope="row" className="text-muted">
                                Reviewed On
                            </th>
                            <td>
                                <FormattedDate date={file.review.timestampReviewed} />
                            </td>
                            <td>
                                <FormattedDate date={submission.timestampPaymentRequested} />
                            </td>
                        </tr>
                    </tbody>
                </table>

                {this.props.user.isAdmin && submission.isPendingWaive && (
                    <button
                        type="button"
                        className="w-100 btn btn-orange mb-2"
                        onClick={() => {
                            this.handleWaive();
                        }}>
                        <div className="d-flex flex-row">
                            <i className="bi bi-cash-coin"></i>
                            <span className="flex-grow-1 px-1">Confirm Payment Waive</span>
                        </div>
                    </button>
                )}
                <div className="row g-2">
                    <div className="col">
                        <button
                            type="button"
                            className="w-100 btn btn-lime"
                            onClick={() => {
                                if (submission.isPendingWaive) {
                                    this.handleUndoWaive();
                                } else {
                                    this.handleWaive();
                                }
                            }}>
                            <div className="d-flex flex-row">
                                <i className="bi bi-cash-coin"></i>
                                <span className="flex-grow-1 px-1">
                                    {submission.isPendingWaive
                                        ? this.props.user.isAdmin
                                            ? "Reject Waive Request"
                                            : "Undo Waive Request"
                                        : this.props.user.isAdmin
                                        ? "Waive Payment"
                                        : "Request Waive"}
                                </span>
                            </div>
                        </button>
                    </div>

                    <div className="col">
                        <button
                            type="button"
                            className="w-100 btn btn-teal"
                            onClick={() => {
                                this.handleRequestPayment();
                            }}>
                            <div className="d-flex flex-row">
                                <i className="bi bi-envelope-open"></i>
                                <span className="flex-grow-1 px-1">Resend Payment Request Email</span>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}

export default withRouter(PendingCard);