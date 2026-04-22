// src/components/exports/ExportCSV.jsx

function ExportCSV ({ data = [], filename = 'export', label = 'CSV'}) {
    const handleExport = () => {
        if(!data.length) return
        const headers = Object.keys(data[0]).join(',')
        const rows = data.map((row) => 
            Object.values(row)
                .map((v) => (typeof v === 'string' && v.includes(',') ? `"${v}"` : v))
                .join(',')
        )
        const csv = [headers, ...rows].join('\n')
        const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `${filename}.csv`
        link.click()
        URL.revokeObjectURL(url)
    }

    return (
        <button className="btn btn-sm btn-info gap-1"
            onClick={handleExport}
        >
            <svg className="h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
                <path strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
            </svg>
            {label}
        </button>
    )

}
export default ExportCSV