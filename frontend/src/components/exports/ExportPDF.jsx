// src/components/exports/ExportPDF.jsx

import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

function ExportPDF({ data = [], columns = [], filename='export', label = 'PDF'}) {
    const handleExport = () => {
        const doc = new jsPDF()
        doc.setFontSize(14)
        doc.text(filename , 14, 16)
        autoTable(doc, {
            startY: 22,
            columns: columns.map((c) => ({header: c.header, dataKey: c.dataKey })),
            body: data,
            styles: { fontSize: 9},
            headStyles: { fillColor: [255, 210, 100] },
        })
        doc.save(`${filename}.pdf`)
    }

    return (
        <button className="btn btn-sm btn-warning gap-1"
            onClick={handleExport}>
                <svg xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                    />
                </svg>
                {label}
        </button>
    )
}

export default ExportPDF