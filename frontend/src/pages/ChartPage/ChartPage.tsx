import Header from '../../components/Header/Header'
import Chart from '../../components/Chart/Chart'
import ChartContext from '../../context/ChartContext'
import useChart from '../../hooks/useChart'

export default function Charts () {
    return (
        <ChartContext
            value={useChart()}
        >
            <Header />
            <Chart />
        </ChartContext>
    )
}
