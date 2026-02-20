const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Generates a high-fidelity Salary Slip PDF based on specific visual requirements.
 */
exports.generateSalarySlip = async (data) => {
    return new Promise((resolve, reject) => {
        try {
            const uploadDir = 'uploads/payslips';
            if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

            const fileName = `salary_slip_${data.fhrid}_${data.month}_${data.year}_${Date.now()}.pdf`;
            const relativePath = path.join(uploadDir, fileName);
            const fullPath = path.resolve(relativePath);

            const doc = new PDFDocument({ size: 'A4', margin: 30 });
            const stream = fs.createWriteStream(fullPath);
            doc.pipe(stream);

            // Helper for currency formatting
            const formatCurr = (val) => `Rs. ${Number(val || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
            const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

            // --- HEADER ---
            // Draw blue line at top
            doc.rect(30, 30, 535, 1).fill('#4040a1'); // Subtle blue divider

            // Company Logo Placeholder / Text
            doc.fontSize(22).font('Helvetica-Bold').fillColor('#2d2d92').text('ANGLE COURIER AND LOGISTICS', 180, 45, { align: 'center' });
            doc.fontSize(11).font('Helvetica').fillColor('#000').text('ARAZI NO-372, PATANAVA BASANT NAGAR VNS', 180, 68, { align: 'center' });
            doc.text('VARANASI-221110 UTTAR PRADESH', 180, 83, { align: 'center' });
            doc.text(`TEL. NO.: 9889122531`, 180, 98, { align: 'center' });

            doc.moveDown(1.5);

            // Payslip for Month
            const periodY = 125;
            doc.rect(30, periodY, 535, 20).stroke();
            doc.fontSize(12).font('Helvetica').text(`Payslip for the Month of ${monthNames[data.month - 1]}, ${data.year}`, 30, periodY + 5, { align: 'center' });

            // --- EMPLOYEE DETAILS SECTION ---
            const summaryTop = periodY + 20;
            const colWidth = 267.5;
            doc.rect(30, summaryTop, colWidth, 140).stroke(); // Left box
            doc.rect(30 + colWidth, summaryTop, colWidth, 140).stroke(); // Right box

            // Left Side: Employee Pay Summary
            doc.fontSize(11).font('Helvetica-Bold').text('Employee Pay Summary', 30, summaryTop + 5, { align: 'center', width: colWidth });
            doc.rect(30, summaryTop + 20, colWidth, 1).stroke();

            const drawRow = (label, value, y) => {
                doc.fontSize(10).font('Helvetica').text(label, 35, y);
                doc.text(value, 160, y);
                doc.rect(30, y + 12, colWidth, 0.5).stroke('#dcdcdc');
            };

            let rowY = summaryTop + 25;
            drawRow('Employee Name', data.employeeName, rowY);
            rowY += 15;
            drawRow('FHR_ID', data.fhrid, rowY);
            rowY += 15;
            drawRow('Designation', data.designation, rowY);
            rowY += 15;
            drawRow('Date of Joining', data.doj || 'N/A', rowY);
            rowY += 15;
            drawRow('Pay Period', data.payPeriod || 'N/A', rowY);
            rowY += 15;
            drawRow('Pay Date', data.payDate || 'N/A', rowY);
            rowY += 15;
            drawRow('A/C Number', data.accountNumber || 'N/A', rowY);
            rowY += 15;
            drawRow('IFSC Code', data.ifscCode || 'N/A', rowY);

            // Right Side: Net Pay Display
            const rightCenter = 30 + colWidth;
            doc.fontSize(12).font('Helvetica').text('Employee Net Pay', rightCenter, summaryTop + 45, { align: 'center', width: colWidth });
            doc.fontSize(14).font('Helvetica-Bold').text(formatCurr(data.netPayable), rightCenter, summaryTop + 65, { align: 'center', width: colWidth });
            doc.fontSize(10).font('Helvetica').text(`Paid Days: ${data.paidDays || 0} | LOP Days: ${data.lopDays || 0}`, rightCenter, summaryTop + 85, { align: 'center', width: colWidth });

            // --- EARNINGS & DEDUCTIONS TABLES ---
            const tableTop = summaryTop + 140;
            doc.rect(30, tableTop, colWidth, 20).stroke();
            doc.rect(30 + colWidth, tableTop, colWidth, 20).stroke();

            doc.font('Helvetica-Bold').fontSize(10);
            doc.text('EARNINGS', 35, tableTop + 5);
            doc.text('AMOUNT', 30 + colWidth - 70, tableTop + 5);

            doc.text('DEDUCTIONS', 30 + colWidth + 5, tableTop + 5);
            doc.text('AMOUNT', 565 - 70, tableTop + 5);

            // Rows
            let itemY = tableTop + 20;
            const rowHeight = 18;
            const maxRows = 5;

            const earnings = [
                ['Basic', data.basic],
                ['Conveyance', data.conveyance],
                ['Other Allowances', data.otherAllowances]
            ].filter(i => i[1] !== undefined);

            const deductions = [
                ['Advance', data.advance],
                ['Other Deductions', data.otherDeductions],
                ['TDS (1%)', data.tds]
            ].filter(i => i[1] !== undefined);

            for (let i = 0; i < maxRows; i++) {
                doc.rect(30, itemY, colWidth, rowHeight).stroke();
                doc.rect(30 + colWidth, itemY, colWidth, rowHeight).stroke();

                if (earnings[i]) {
                    doc.font('Helvetica').text(earnings[i][0], 35, itemY + 5);
                    doc.text(formatCurr(earnings[i][1]), 30 + colWidth - 85, itemY + 5, { align: 'right', width: 80 });
                }
                if (deductions[i]) {
                    doc.font('Helvetica').text(deductions[i][0], 30 + colWidth + 5, itemY + 5);
                    doc.text(formatCurr(deductions[i][1]), 565 - 85, itemY + 5, { align: 'right', width: 80 });
                }
                itemY += rowHeight;
            }

            // --- GROSS TOTALS ---
            doc.rect(30, itemY, colWidth, 20).stroke();
            doc.rect(30 + colWidth, itemY, colWidth, 20).stroke();
            doc.font('Helvetica-Bold').text('Gross Earnings', 50, itemY + 5);
            doc.text(formatCurr(data.grossEarnings), 30 + colWidth - 85, itemY + 5, { align: 'right', width: 80 });

            doc.text('Total Deductions', 30 + colWidth + 20, itemY + 5);
            doc.text(formatCurr(data.totalDeductions), 565 - 85, itemY + 5, { align: 'right', width: 80 });

            // --- FINAL RECAP ---
            itemY += 20;
            doc.rect(30, itemY, 535, 20, { fill: true }).fillColor('#cedef0').stroke('#4040a1');
            doc.fillColor('#000').font('Helvetica-Bold');
            doc.text('NETPAY', 35, itemY + 5);
            doc.text('AMOUNT', 565 - 70, itemY + 5);

            itemY += 20;
            const recapRow = (label, val, y) => {
                doc.rect(30, y, 535, 18).stroke();
                doc.font('Helvetica').text(label, 35, y + 5);
                doc.text(formatCurr(val), 565 - 85, y + 5, { align: 'right', width: 80 });
            };

            recapRow('Gross Earnings', data.grossEarnings, itemY);
            itemY += 18;
            recapRow('Total Deductions', data.totalDeductions, itemY);
            itemY += 18;
            doc.rect(30, itemY, 535, 20).stroke();
            doc.font('Helvetica-Bold').text('Total Net Payable', 35, itemY + 5);
            doc.text(formatCurr(data.netPayable), 565 - 85, itemY + 5, { align: 'right', width: 80 });

            // Final Footer Line
            itemY += 25;
            doc.fontSize(10).font('Helvetica-Bold').text('**Total Net Payable = Gross Earnings - Total Deductions', 30, itemY, { align: 'center', width: 535 });

            doc.end();
            stream.on('finish', () => resolve(relativePath));
            stream.on('error', reject);
        } catch (err) {
            reject(err);
        }
    });
};

/**
 * Generates a Daily Performance Receipt PDF.
 */
exports.generateDailyReportReceipt = async (report, user) => {
    return new Promise((resolve, reject) => {
        try {
            const uploadDir = 'uploads/daily_reports';
            if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

            const fileName = `daily_receipt_${report.fhrid}_${Date.now()}.pdf`;
            const relativePath = path.join(uploadDir, fileName);
            const fullPath = path.resolve(relativePath);

            const doc = new PDFDocument({ size: 'A5', margin: 20 });
            const stream = fs.createWriteStream(fullPath);
            doc.pipe(stream);

            const accentColor = '#2d2d92';
            const formattedDate = new Date(report.reportDate).toLocaleDateString('en-IN', {
                day: '2-digit', month: 'long', year: 'numeric'
            });

            // Header
            doc.rect(20, 20, 380, 5).fill(accentColor);
            doc.fontSize(16).font('Helvetica-Bold').fillColor(accentColor).text('ANGLE COURIER AND LOGISTICS', 20, 35, { align: 'center' });
            doc.fontSize(10).font('Helvetica').fillColor('#555').text('Daily Performance Receipt', 20, 55, { align: 'center' });

            doc.moveDown(1.5);
            doc.rect(20, 80, 380, 0.5).stroke('#dcdcdc');

            // Employee Box
            const boxY = 95;
            doc.rect(25, boxY, 370, 70).fill('#f9f9f9').stroke('#eee');
            doc.fontSize(9).font('Helvetica-Bold').fillColor('#333');
            doc.text('ASSOCIATE IDENTITY', 35, boxY + 10);

            doc.font('Helvetica').fontSize(11).fillColor('#000');
            doc.text(`Name: ${user.fullName}`, 35, boxY + 25);
            doc.text(`FHRID: ${report.fhrid}`, 35, boxY + 40);
            doc.text(`Hub: ${report.hub_name || 'N/A'}`, 35, boxY + 55);

            doc.font('Helvetica-Bold').fontSize(10).text(`DATE: ${formattedDate}`, 280, boxY + 25, { align: 'right', width: 100 });

            // Metrics Table
            let itemY = 185;
            const drawMetric = (label, value, color = '#000') => {
                doc.rect(25, itemY, 370, 25).stroke('#eee');
                doc.fontSize(10).font('Helvetica').fillColor('#555').text(label, 40, itemY + 8);
                doc.font('Helvetica-Bold').fillColor(color).text(value.toString(), 340, itemY + 8, { align: 'right', width: 40 });
                itemY += 25;
            };

            drawMetric('Out For Delivery (OFD)', report.ofd);
            drawMetric('Delivered (DEL)', report.delivered, '#3F7D58');
            drawMetric('Out For Pickup (OFP)', report.ofp);
            drawMetric('Picked Up (PICK)', report.picked, '#4040a1');

            // Footer
            doc.moveDown(3);
            doc.fontSize(8).font('Helvetica-Oblique').fillColor('#999').text('This is an electronically generated performance record.', 20, doc.page.height - 40, { align: 'center' });

            doc.end();
            stream.on('finish', () => resolve(relativePath));
            stream.on('error', reject);
        } catch (err) {
            reject(err);
        }
    });
};
