import { CheckCircle } from "lucide-react"

const PurchaseSuccessPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      {/* <Confetti /> */}
      <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-lg overflow-hidden relative z-10">
         <div className="p-6 sm:p-8">
            <div className="flex justify-center">
               <CheckCircle className="text-emerald-400 w-16 h-16 mb-4"  />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-center text-emerald-400 mb-2">
               Purchase Successful!
            </h1>

            <p className="text-gray-300 text-center mb-2">
               Thank you for your order. {"We're"} processing it now.
            </p>
            <p className="text-emerald-400 text-center text-sm mb-6">
               Check your email for order details and updates.
            </p>

            <div className="bg-gray-700 rounded-lg p-4 mb-6">
               <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Estimated delivery</span>
                  <span className="text-sm font-semibold text-emerald-400">3-5 business days</span>
               </div>
            </div>

         </div>
      </div>
    </div>
  )
}

export default PurchaseSuccessPage
