import { useState, useEffect } from 'react'

const API_BASE = import.meta.env.VITE_API_BASE;

function extractSVG(svgString: string | string[]): string | string[] | null {
    if (typeof svgString === "string") {
        svgString = svgString.replace(
            /<svg([^>]*)\s(width|height)="[^"]*"/g, 
            (match) => match.replace(/(width|height)="[^"]*"/g, "")
        );

        const match = svgString.match(/<svg[\s\S]*?<\/svg>/i);
        return match ? match[0] : null;
    }

    const results = svgString.map(svg => {
        let string = svg.replace(
            /<svg([^>]*)\s(width|height)="[^"]*"/g, 
            (match) => match.replace(/(width|height)="[^"]*"/g, "")
        );
        const match = string.match(/<svg[\s\S]*?<\/svg>/i);
        return match ? match[0] : null;
    });

    return results.filter((s): s is string => s !== null)
}

type Chart = {
    key:string,
    searchKey:string,
    team:string,
    drivers:string[],
    driversAcr:string[],
    chartType:string,
    sessionType:string,
    year:number,
    svg:string,
    eventName:string,
}

export default function useChart() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())
    const [chartType, setChartType] = useState<string>("quali_h2h")
    const [chart, setChart] = useState<string | string[]>("")
    const [driver, setDriver] = useState<string>("")

    useEffect(() => {
        const controller = new AbortController();

        async function load() {
            try {
                let chart:string|string[] = [];
                let chartStr:string|string[]|null = ""

                setLoading(true); setError(null);

                

                const endpoint = `${API_BASE}/${selectedYear}/${chartType}/${driver === "" ? "none" : driver}`

                const res = await fetch(`${endpoint}/charts/`, { signal: controller.signal});

                if (!res.ok) throw new Error(`HTTP${res.status}`);

                const data:Chart[] = await res.json();

                if (!data || !Array.isArray(data)) {
                    setChart("No charts found");

                    return;
                }

                if (data.length >1) {
                    chart = data.map((d: Chart) => extractSVG(d.svg)).filter((s): s is string => !!s);
                    setChart(chart);
                    return;
                }else if (data.length === 1) {
                    chart = data[0].svg;

                    chartStr = extractSVG(chart);

                    if (!chartStr) {
                        throw new Error(`chartStr is not a string: ${chartStr}`)
                    }

                    setChart(chartStr);

                    return;
                }

            } catch (e: any) {
                if (e.name !== "AbortError") setError(e.message ?? "Error loading data");
            } finally {
                setLoading(false);
            }
        }
        const timeout = setTimeout(() => {
            load()
        }, 400)
        return () => {
            clearTimeout(timeout);
            controller.abort();
        }
    }, [selectedYear, chartType, driver])

    return {
        loading,
        setLoading,
        error,
        setError,
        selectedYear,
        setSelectedYear,
        chartType,
        setChartType,
        chart,
        setChart,
        driver,
        setDriver,
    }
}