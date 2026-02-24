const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Generate a PDF Salary Slip
 * @param {Object} data Payslip data
 * @returns {Promise<string>} Path to generated PDF
 */
exports.generateSalarySlip = async (data) => {
    return new Promise((resolve, reject) => {
        try {
            const dir = 'uploads/salary_slips';
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

            const fileName = `salary_slip_${data.fhrid}_${data.month}_${data.year}_${Date.now()}.pdf`;
            const filePath = path.join(dir, fileName);

            // Using 0 margin for absolute control like a table
            const doc = new PDFDocument({ size: 'A4', margin: 0 });

            // Pipe to res/stream if provided, else to file
            const stream = data.res || fs.createWriteStream(filePath);
            doc.pipe(stream);

            // --- HEADER BOX (Border) ---
            doc.rect(0, 0, 595, 120).stroke('#000000');

            // Logo (Left side)
            const logoPath = path.join(__dirname, '..', 'assets', 'logo.png');
            if (fs.existsSync(logoPath)) {
                doc.image(logoPath, 5, 5, { height: 110 });
            }
            // Vertical line after logo
            doc.moveTo(150, 0).lineTo(150, 120).stroke('#000000');

            // Company Name and Address (Right side) - REDUCED FONT SIZE TO PREVENT OVERLAP
            doc.fontSize(22).font('Helvetica-Bold').fillColor('#303F9F') // Reduced from 28
                .text('ANGLE COURIER AND LOGISTICS', 150, 20, { align: 'center', width: 435 });

            doc.fontSize(11).font('Helvetica-Bold').fillColor('#000000') // Reduced from 14
                .text('ARAZI NO-372, PATANAVA BASANT NAGAR VNS', 150, 52, { align: 'center', width: 435 });
            doc.text('VARANASI-221110 UTTAR PRADESH', 150, 70, { align: 'center', width: 435 });
            doc.text('TEL. NO.:9889122531', 150, 88, { align: 'center', width: 435 });

            // --- MONTH TITLE BAR ---
            let currentY = 120;
            doc.rect(0, currentY, 595, 20).fillAndStroke('#FFFFFF', '#000000');
            doc.fontSize(11).font('Helvetica').fillColor('#000000')
                .text(`Payslip for the Month of ${getMonthName(data.month)}, ${data.year}`, 0, currentY + 4, { align: 'center', width: 595 });
            currentY += 20;

            // --- PAY SUMMARY SECTION ---
            // left table box
            const leftColWidth = 300;
            const rightColWidth = 295;

            doc.rect(0, currentY, leftColWidth, 20).fillAndStroke('#F5F5F5', '#000000');
            doc.fontSize(11).font('Helvetica-Bold').text('Employee Pay Summary', 0, currentY + 5, { align: 'center', width: leftColWidth });

            // right net pay box (large)
            const infoTotalHeight = 150; // Total height for the info section
            doc.rect(leftColWidth, currentY, rightColWidth, infoTotalHeight).stroke('#000000');

            doc.fontSize(14).font('Helvetica').fillColor('#616161')
                .text('Employee Net Pay', leftColWidth, currentY + 40, { align: 'center', width: rightColWidth });
            doc.fontSize(22).font('Helvetica-Bold').fillColor('#000000')
                .text(`Rs. ${data.netPayable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, leftColWidth, currentY + 65, { align: 'center', width: rightColWidth });
            doc.fontSize(11).font('Helvetica').fillColor('#616161')
                .text(`Paid Days: ${data.paidDays} | LOP Days: ${data.lopDays}`, leftColWidth, currentY + 95, { align: 'center', width: rightColWidth });

            currentY += 20;

            // Info Rows
            const rows = [
                ['Employee Name', data.employeeName],
                ['FHR_ID', data.fhrid],
                ['Designation', data.designation],
                ['Date of Joining', data.doj || 'N/A'],
                ['Pay Period', '30 Day'],
                ['Pay Date', data.payDate || 'N/A'],
                ['A/C Number', data.accountNumber || 'N/A'],
                ['IFSC Code', data.ifscCode || 'N/A']
            ];

            const rowHeight = (infoTotalHeight - 20) / rows.length;
            rows.forEach(([label, value]) => {
                doc.rect(0, currentY, 130, rowHeight).stroke('#000000');
                doc.rect(130, currentY, 170, rowHeight).stroke('#000000');
                doc.fontSize(10).font('Helvetica').fillColor('#000000').text(label, 5, currentY + 3);
                doc.font('Helvetica-Bold').text(value || '', 135, currentY + 3);
                currentY += rowHeight;
            });

            // --- EARNINGS & DEDUCTIONS TABLE ---
            doc.rect(0, currentY, 130, 20).stroke('#000000');
            doc.rect(130, currentY, 170, 20).stroke('#000000');
            doc.rect(300, currentY, 120, 20).stroke('#000000');
            doc.rect(420, currentY, 175, 20).stroke('#000000');

            doc.fontSize(11).font('Helvetica-Bold');
            doc.text('EARNINGS', 5, currentY + 5);
            doc.text('AMOUNT', 135, currentY + 5);
            doc.text('DEDUCTIONS', 305, currentY + 5);
            doc.text('AMOUNT', 425, currentY + 5);
            currentY += 20;

            const earnings = [
                ['Basic', data.basic, 'Advance', data.advance],
                ['Conveyance', data.conveyance, '', null],
                ['Incentives', data.incentives, '', null],
                ['Other Allowance', data.otherAllowances, '', null]
            ];

            earnings.forEach(([eLab, eVal, dLab, dVal]) => {
                doc.rect(0, currentY, 130, 20).stroke('#000000');
                doc.rect(130, currentY, 170, 20).stroke('#000000');
                doc.rect(300, currentY, 120, 20).stroke('#000000');
                doc.rect(420, currentY, 175, 20).stroke('#000000');

                doc.fontSize(10).font('Helvetica').text(eLab, 5, currentY + 5);
                if (eVal !== null) doc.text(`Rs. ${eVal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 135, currentY + 5);

                doc.text(dLab || '', 305, currentY + 5);
                if (dVal !== null) doc.text(`Rs. ${dVal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 425, currentY + 5);
                currentY += 20;
            });

            // Lower Totals
            doc.rect(0, currentY, 130, 20).stroke('#000000');
            doc.rect(130, currentY, 170, 20).stroke('#000000');
            doc.rect(300, currentY, 120, 20).stroke('#000000');
            doc.rect(420, currentY, 175, 20).stroke('#000000');

            doc.fontSize(10).font('Helvetica-Bold');
            doc.text('Gross Earnings', 30, currentY + 5);
            doc.text(`Rs. ${data.grossEarnings.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 135, currentY + 5);
            doc.text('Total Deductions', 305, currentY + 5);
            doc.text(`Rs. ${data.totalDeductions.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 425, currentY + 5);
            currentY += 20;

            // --- NET PAY FINAL SUMMARY ---
            // Colored header row
            doc.rect(0, currentY, 420, 20).fillAndStroke('#C5CAE9', '#000000');
            doc.rect(420, currentY, 175, 20).fillAndStroke('#C5CAE9', '#000000');
            doc.fontSize(11).font('Helvetica-Bold').fillColor('#000000');
            doc.text('NETPAY', 5, currentY + 5);
            doc.text('AMOUNT', 425, currentY + 5, { align: 'right', width: 165 });
            currentY += 20;

            const summary = [
                ['Gross Earnings', data.grossEarnings],
                ['Total Deductions', data.totalDeductions],
                ['Total Net Payable', data.netPayable]
            ];

            summary.forEach(([label, value], idx) => {
                doc.rect(0, currentY, 420, 20).stroke('#000000');
                doc.rect(420, currentY, 175, 20).stroke('#000000');
                doc.fontSize(10).font(idx === 2 ? 'Helvetica-Bold' : 'Helvetica').text(label, 5, currentY + 5);
                doc.text(`Rs. ${value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 425, currentY + 5, { align: 'right', width: 165 });
                currentY += 20;
            });

            // Motto Footer
            doc.fontSize(12).font('Helvetica-Bold').text('**Total Net Payable = Gross Earnings - Total Deductions', 0, currentY + 15, { align: 'center', width: 595 });

            // Small Disclaimer
            doc.fontSize(8).font('Helvetica-Oblique').fillColor('#9E9E9E').text('This is a computer generated document and does not require a signature.', 0, 800, { align: 'center', width: 595 });

            doc.end();
            stream.on('finish', () => resolve(filePath));
            stream.on('error', reject);
        } catch (err) {
            reject(err);
        }
    });
};

/**
 * Generate a Daily Report Performance Receipt
 */
exports.generateDailyReportReceipt = async (report, user) => {
    return new Promise((resolve, reject) => {
        try {
            const dir = 'uploads/receipts';
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

            const fileName = `report_${report.fhrid}_${Date.now()}.pdf`;
            const filePath = path.join(dir, fileName);
            const doc = new PDFDocument({ size: 'A5', margin: 30 }); // A5 for smaller receipt feel

            const stream = fs.createWriteStream(filePath);
            doc.pipe(stream);

            // Design
            doc.rect(0, 0, doc.page.width, 10).fill('#1B2B44');

            doc.fontSize(14).font('Helvetica-Bold').fillColor('#1e293b').text('PERFORMANCE RECEIPT', 30, 30);
            doc.fontSize(8).font('Helvetica').fillColor('#64748b').text('ANGLE COURIER AND LOGISTICS', 30, 48);

            doc.rect(30, 65, doc.page.width - 60, 1).fill('#e2e8f0');

            let y = 80;
            const row = (l, v) => {
                doc.fontSize(9).font('Helvetica').fillColor('#64748b').text(l, 35, y);
                doc.fontSize(9).font('Helvetica-Bold').fillColor('#1e293b').text(String(v || 'N/A'), 120, y);
                y += 18;
            };

            const formattedDate = new Date(report.reportDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

            row('Report Date:', formattedDate);
            row('Employee:', user.fullName);
            row('FHR ID:', report.fhrid);
            row('Hub Name:', report.hub_name || 'N/A');

            y += 10;
            doc.rect(30, y, doc.page.width - 60, 20).fill('#f1f5f9');
            doc.fontSize(9).font('Helvetica-Bold').fillColor('#475569').text('OPERATIONS DATA', 35, y + 6);
            y += 25;

            row('Total OFD:', report.ofd);
            row('Total OFP:', report.ofp);
            row('Delivered:', report.delivered);
            row('Picked:', report.picked);

            y += 10;
            doc.rect(30, y, doc.page.width - 60, 1).fill('#e2e8f0');
            y += 15;

            doc.fontSize(8).font('Helvetica-Oblique').fillColor('#94a3b8')
                .text('Generated on ' + new Date().toLocaleString(), 30, y, { align: 'center', width: doc.page.width - 60 });

            doc.end();
            stream.on('finish', () => resolve(filePath));
            stream.on('error', reject);
        } catch (err) {
            reject(err);
        }
    });
};

function getMonthName(month) {
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    return months[month - 1] || "N/A";
}
