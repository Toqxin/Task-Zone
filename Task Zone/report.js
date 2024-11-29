document.addEventListener('DOMContentLoaded', function() {
    chrome.storage.local.get({tasks: []}, function(result) {
        let tasks = result.tasks || [];
        let tableBody = document.getElementById('task-table').getElementsByTagName('tbody')[0];

        while (tableBody.rows.length > 0) {
            tableBody.deleteRow(0);
        }

        tasks.forEach(function(task) {
            let row = tableBody.insertRow();
            let cell1 = row.insertCell(0);
            let cell2 = row.insertCell(1);
            cell1.textContent = task.task;
            cell2.textContent = new Date(task.time).toLocaleString();
        });
    });

    let downloadButton = document.getElementById('download-pdf');
    if (!downloadButton.hasListener) {
        downloadButton.addEventListener('click', function() {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();

            doc.setFont('times', 'normal');

            const pageWidth = doc.internal.pageSize.getWidth();
            const margin = 20;
            const tableWidth = pageWidth - margin * 2;

            doc.autoTable({
                html: '#task-table',
                startY: 40,
                margin: { top: 20, left: margin, right: margin },
                tableWidth: tableWidth,
                styles: { font: 'times', fontSize: 10, cellPadding: 5, fontStyle: 'bold', overflow: 'linebreak' },
                headStyles: { fillColor: [22, 138, 126], fontStyle: 'bold' },
                columnStyles: {
                    0: { cellWidth: 'auto', halign: 'left' },
                    1: { cellWidth: 'wrap', halign: 'center' }
                }
            });

            doc.save('tasks.pdf');
        });
        downloadButton.hasListener = true;
    }

    PDFObject.embed("your-file.pdf", "#pdf-container");
});
