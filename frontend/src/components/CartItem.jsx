import React from 'react'
import { useCartStore } from '../stores/useCartStore'

const CartItem = () => {
  const {removeFromCart, updateQuantity} = useCartStore()
  return (
    <div className='rounded-lg border p-4 shadow-sm border-gray-700 bg-gray-800 md:p-6'>

    </div>
  )
}

export default CartItem
