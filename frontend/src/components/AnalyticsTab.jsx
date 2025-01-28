import {motion} from 'framer-motion'
import { useEffect, useState } from 'react'
import axios from '../lib/axios'

const AnalyticsTab = () => {
  const [analyticsData, setAnalyticsData] = useState({
    // initialize with default values
    users:0,
    products:0,
    totalSales:0,
    totalRevenue:0,
  })
  const [dailySalesData, setDailySalesData] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        const res = await axios.get("/analytics")
        setAnalyticsData(res.data.analyticsData)
        setDailySalesData(res.data.dailySalesData)

      } catch(error) {
        console.log("Error in fetchAnalyticsData , AnalyticsTab", error.message)

      } finally{
        setIsLoading(false)

      }
    }
  }, [])

  if(isLoading) {
    return <div className='spinner'>Loading</div>
  }

  return (
    <div>AnalyticsTab</div>
  )
}

export default AnalyticsTab


const AnalyticsCard = ({ title, value, icon: Icon, color }) => (
	<motion.div
		className={`bg-gray-800 rounded-lg p-6 shadow-lg overflow-hidden relative ${color}`}
		initial={{ opacity: 0, y: 20 }}
		animate={{ opacity: 1, y: 0 }}
		transition={{ duration: 0.5 }}
	>
		<div className='flex justify-between items-center'>
			<div className='z-10'>
				<p className='text-emerald-300 text-sm mb-1 font-semibold'>{title}</p>
				<h3 className='text-white text-3xl font-bold'>{value}</h3>
			</div>
		</div>
		<div className='absolute inset-0 bg-gradient-to-br from-emerald-600 to-emerald-900 opacity-30' />
		<div className='absolute -bottom-4 -right-4 text-emerald-800 opacity-50'>
			<Icon className='h-32 w-32' />
		</div>
	</motion.div>
);
