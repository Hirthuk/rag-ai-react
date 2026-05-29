// DebugChart.jsx - Temporary test component
export default function DebugChart({ chartData, chartType }) {
    return (
        <div className="p-4 bg-gray-100 rounded-lg">
            <h3 className="font-bold mb-2">Debug Info:</h3>
            <p>Chart Type: {chartType}</p>
            <p>Data Length: {chartData?.length || 0}</p>
            <pre className="text-xs bg-white p-2 rounded overflow-auto">
                {JSON.stringify(chartData, null, 2)}
            </pre>
            
            {/* Test with a simple div chart */}
            <div className="mt-4">
                <h4 className="font-semibold mb-2">Simple Bar Visualization:</h4>
                {chartData?.map((item, idx) => (
                    <div key={idx} className="mb-2">
                        <span className="inline-block w-16">{item.year}: </span>
                        <div 
                            className="inline-block bg-blue-500 h-6 rounded"
                            style={{ 
                                width: `${(item.value / Math.max(...chartData.map(d => d.value))) * 200}px`,
                                maxWidth: '200px'
                            }}
                        />
                        <span className="ml-2 text-sm">${(item.value / 1000000).toFixed(1)}M</span>
                    </div>
                ))}
            </div>
        </div>
    )
}