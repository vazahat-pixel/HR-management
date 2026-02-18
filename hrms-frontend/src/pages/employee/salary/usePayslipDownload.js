import { useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

export const usePayslipDownload = () => {
    const [isDownloading, setIsDownloading] = useState(false);

    const downloadPDF = async (templateRef, salaryData, user) => {
        const element = templateRef.current;
        if (!element) {
            console.error('Template element not found in ref');
            return;
        }

        setIsDownloading(true);
        console.log('Starting PDF generation for:', salaryData.month);

        try {
            console.log('Capture element dimensions:', element.offsetWidth, 'x', element.offsetHeight);

            const canvas = await html2canvas(element, {
                scale: 1.2,
                useCORS: true,
                allowTaint: true,
                scrollX: 0,
                scrollY: 0,
                windowWidth: 794,
                windowHeight: 1123,
                logging: true
            });

            if (!canvas) throw new Error('Canvas generation returned null');

            console.log('Canvas generated successfully');
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const imgWidth = 210;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

            const monthParts = salaryData.month.split(' ');
            const monthShort = monthParts[0].substring(0, 3);
            const year = monthParts[1];
            const empId = user?.employeeId || 'EMP102';
            const fileName = `payslip_${empId}_${monthShort}_${year}.pdf`;

            pdf.save(fileName);
            console.log('PDF saved:', fileName);
        } catch (error) {
            console.error('CRITICAL PDF ERROR:', error);
            alert(`Failed to generate PDF: ${error.message}`);
        } finally {
            setIsDownloading(false);
        }
    };

    const downloadExcel = (salaryData, user) => {
        setIsDownloading(true);
        try {
            const baseAmount = parseFloat(salaryData.amount.replace(/[^0-9.-]+/g, ""));
            const bonuses = salaryData.type === 'Bonus' ? 270 : 0;
            const deductions = 150;
            const netSalary = baseAmount + bonuses - deductions;

            const data = [
                ["COMPANY", "HRMS PRO ENTERPRISE"],
                ["PAYSLIP FOR PERIOD", salaryData.month.toUpperCase()],
                ["", ""],
                ["EMPLOYEE DETAILS", ""],
                ["Name", user?.fullName],
                ["Employee ID", user?.employeeId || 'EMP102'],
                ["Designation", "Senior Product Designer"],
                ["", ""],
                ["SALARY BREAKDOWN", ""],
                ["Description", "Amount (USD)"],
                ["Basic Salary", baseAmount],
                ["Bonus/Incentive", bonuses],
                ["Deductions (Tax/PF)", -deductions],
                ["NET PAYABLE", netSalary],
                ["", ""],
                ["STATUS", "PAID"],
                ["DATE", salaryData.date]
            ];

            const ws = XLSX.utils.aoa_to_sheet(data);

            // Set column widths
            const wscols = [{ wch: 25 }, { wch: 30 }];
            ws['!cols'] = wscols;

            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Payslip");

            const monthParts = salaryData.month.split(' ');
            const monthShort = monthParts[0].substring(0, 3);
            const year = monthParts[1];
            const empId = user?.employeeId || 'EMP102';
            const fileName = `payslip_${empId}_${monthShort}_${year}.xlsx`;

            const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
            saveAs(new Blob([wbout], { type: 'application/octet-stream' }), fileName);
        } catch (error) {
            console.error('Excel Generation Error:', error);
            alert('Failed to generate Excel. Please try again.');
        } finally {
            setIsDownloading(false);
        }
    };

    return {
        isDownloading,
        downloadPDF,
        downloadExcel
    };
};
