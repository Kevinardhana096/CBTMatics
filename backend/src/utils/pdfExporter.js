// PDF Exporter untuk laporan
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Generate exam report PDF
 */
async function generateExamReportPDF(reportData, outputPath) {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument();
            const stream = fs.createWriteStream(outputPath);

            doc.pipe(stream);

            // Header
            doc.fontSize(20).text('Exam Report', { align: 'center' });
            doc.moveDown();

            // Exam Info
            doc.fontSize(14).text(`Exam: ${reportData.exam.title}`);
            doc.fontSize(12).text(`Description: ${reportData.exam.description || 'N/A'}`);
            doc.text(`Duration: ${reportData.exam.duration} minutes`);
            doc.moveDown();

            // Statistics
            doc.fontSize(14).text('Statistics', { underline: true });
            doc.fontSize(12);
            doc.text(`Total Submissions: ${reportData.statistics.totalSubmissions}`);
            doc.text(`Average Score: ${reportData.statistics.averageScore}`);
            doc.text(`Max Score: ${reportData.statistics.maxScore}`);
            doc.text(`Min Score: ${reportData.statistics.minScore}`);
            doc.text(`Completion Rate: ${reportData.statistics.completionRate}%`);
            doc.moveDown();

            // Submissions Table
            doc.fontSize(14).text('Student Submissions', { underline: true });
            doc.fontSize(10);
            doc.moveDown(0.5);

            // Table header
            const startY = doc.y;
            doc.text('Student', 50, startY);
            doc.text('Score', 250, startY);
            doc.text('Status', 350, startY);
            doc.text('Submitted At', 450, startY);

            doc.moveDown();
            let currentY = doc.y;

            // Table rows
            reportData.submissions.forEach((submission, index) => {
                if (currentY > 700) { // New page if needed
                    doc.addPage();
                    currentY = 50;
                }

                doc.text(submission.username, 50, currentY);
                doc.text(submission.score || 'N/A', 250, currentY);
                doc.text(submission.status, 350, currentY);
                doc.text(submission.submitted_at ? new Date(submission.submitted_at).toLocaleDateString() : 'N/A', 450, currentY);

                currentY += 20;
            });

            // Footer
            doc.fontSize(10).text(
                `Generated on ${new Date().toLocaleDateString()}`,
                50,
                doc.page.height - 50,
                { align: 'center' }
            );

            doc.end();

            stream.on('finish', () => {
                resolve(outputPath);
            });

            stream.on('error', (err) => {
                reject(err);
            });

        } catch (err) {
            reject(err);
        }
    });
}

/**
 * Generate student performance report PDF
 */
async function generateStudentReportPDF(studentData, outputPath) {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument();
            const stream = fs.createWriteStream(outputPath);

            doc.pipe(stream);

            // Header
            doc.fontSize(20).text('Student Performance Report', { align: 'center' });
            doc.moveDown();

            // Student info would go here
            doc.fontSize(14).text('Overall Statistics', { underline: true });
            doc.fontSize(12);
            doc.text(`Total Exams: ${studentData.statistics.totalExams}`);
            doc.text(`Average Score: ${studentData.statistics.averageScore}`);
            doc.text(`Completed Exams: ${studentData.statistics.completedExams}`);
            doc.moveDown();

            // Performance details
            doc.fontSize(14).text('Exam History', { underline: true });
            doc.fontSize(10);
            doc.moveDown(0.5);

            studentData.performance.forEach((exam) => {
                doc.text(`${exam.exam_title}: ${exam.score || 'Not completed'} (${exam.status})`);
                doc.moveDown(0.5);
            });

            doc.end();

            stream.on('finish', () => {
                resolve(outputPath);
            });

            stream.on('error', (err) => {
                reject(err);
            });

        } catch (err) {
            reject(err);
        }
    });
}

module.exports = {
    generateExamReportPDF,
    generateStudentReportPDF
};
