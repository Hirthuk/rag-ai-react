import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    ResponsiveContainer,
    BarChart,
    Bar
} from "recharts"

export default function FinancialChart({
    chartData,
    chartType
}) {

    if (!chartData || chartData.length === 0) {

        return (
            <div className="text-gray-400">
                No chart data available
            </div>
        )
    }

    return (

        <div className="w-full h-full">

            <ResponsiveContainer width="100%" height={320}>

                {chartType === "bar" ? (

                    <BarChart data={chartData}>

                        <CartesianGrid strokeDasharray="3 3" />

                        <XAxis dataKey="year" />

                        <YAxis />

                        <Tooltip />

                        <Bar dataKey="value" />

                    </BarChart>

                ) : (

                    <LineChart data={chartData}>

                        <CartesianGrid strokeDasharray="3 3" />

                        <XAxis dataKey="year" />

                        <YAxis />

                        <Tooltip />

                        <Line
                            type="monotone"
                            dataKey="value"
                        />

                    </LineChart>

                )}

            </ResponsiveContainer>

        </div>
    )
}