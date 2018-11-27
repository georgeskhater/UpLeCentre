"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../index");
const express = require("express");
const cors = require("cors");
const mail = require("@sendgrid/mail");
exports.emailApi = express();
exports.emailApi.use(cors(index_1.corsOptions));
exports.emailApi.post('*', (request, response) => {
    const email = request.query.email;
    const userId = request.query.userId;
    const fromDate = request.query.fromDate;
    const toDate = request.query.toDate;
    const SENDGRID_API_KEY = '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';
    mail.setApiKey(SENDGRID_API_KEY);
    const msg = {
        to: email,
        from: 'roudykk@gmail.com',
        subject: 'Student report',
        text: `Check out the report at: https://up-student-report.firebaseapp.com/#/home/${userId}/${fromDate}/${toDate}`,
    };
    mail.send(msg).then(() => {
        response.status(200).send(JSON.stringify("Email Sent !"));
    }).catch(error => {
        response.status(401).send(JSON.stringify(error));
    });
});
//# sourceMappingURL=email-api.js.map