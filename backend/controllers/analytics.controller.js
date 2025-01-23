import Order from "../models/order.model.js"
import Product from "../models/product.model.js"
import User from "../models/user.model.js"

export const getAnalyticsData = async () => {
  const totalUsers = await User.countDocuments()
  const totalProducts = await Product.countDocuments()

  const salesData = await Order.aggregate([
    {
      $group: {
        _id: null, // it groups all documents together
        totalSales: { $sum : 1},
        totalRevenue: { $sum : "$totalAmount"}
      }
    }
  ])

  const {totalSales, totalRevenue} = salesData[0] || {totalSales: 0, totalRevenue: 0}

  return {
    users: totalUsers,
    products: totalProducts,
    totalSales,
    totalRevenue
  }
}

export const getDailySalesData = async (startDate, endDate) => {
  try {
    const dailySalesData = await Order.aggregate([
      {
        $match: { // filter by date
          createdAt: {
            $gte: startDate, // greater than or equal
            $lte: endDate // less than or equal
          }
        }
      },
      {
        $group: { 
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, // it groups all documents together
          totalSales: { $sum : 1}, // calculate total sales
          totalRevenue: { $sum : "$totalAmount"} // calculate total amount from all orders
        }
      },
      {
        $sort: {
          _id: 1
        }
      }
    ])
  
    const dateArray = getDatesInRange(startDate, endDate)
    //console.log(dateArray) // ["2023-08-01", "2023-08-02", "2023-08-03", "2023-08-04", "2023-08-05", "2023-08-06", "2023-08-07"]
  
    return dateArray.map(date => {
      const foundData = dailySalesData.find(item => item._id === date) //that means if the date is in the array, return the data
  
      return {
        date,
        sales: foundData?.sales || 0,
        revenue: foundData?.revenue || 0,
      }
    })
  } catch(error) {
    throw new Error(error)
  }
}


function getDatesInRange(startDate, endDate) {
  const dates = [];
  let  currentDate = new Date(startDate);

  while (currentDate <= endDate) { 
    dates.push(currentDate.toISOString().split('T')[0]); // add the date to the array
    currentDate.setDate(currentDate.getDate() + 1); // Increment the date by 1 day
  }

  return dates;
}
