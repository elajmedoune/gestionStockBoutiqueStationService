// src/components/exports/ExportExcel.jsx

import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

function ExportExcel({ data = [], filename = 'export', label = 'Excel' }) {
    const handleExport = () => {
        const ws = XLSX.utils.json_to_sheet(data)
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, 'Donnees')
        const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
        const blob = new Blob([buffer], { type: 'application/octet-stream' })
        saveAs(blob, `${filename}.xlsx`)
    }

    return (
        <button className="btn btn-sm btn-success gap-1"
            onClick={handleExport}
        >
            <svg className="h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke='currentColor'
            >
                <path strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
            </svg>
            {label}
        </button>
    )
}

export default ExportExcel