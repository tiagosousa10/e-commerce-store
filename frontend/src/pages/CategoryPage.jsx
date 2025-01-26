import { useEffect } from 'react'
import { useProductStore } from '../stores/useProductStore'
import { useParams } from 'react-router-dom'

const CategoryPage = () => {
   const {fetchProductsByCategory, products} = useProductStore()
   const {category} = useParams() 

   useEffect(() => {
      fetchProductsByCategory(category)
   }, [fetchProductsByCategory, category])

   console.log("category page products:" ,products )
  return (
    <div>CategoryPage</div>
  )
}

export default CategoryPage
