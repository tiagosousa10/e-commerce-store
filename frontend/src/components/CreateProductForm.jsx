import {useState} from 'react'
import {motion} from 'framer-motion'
import {PlusCircle, Upload, Loader} from 'lucide-react'

const categories = ["jean", "t-shirt", "shoe", "glasses", "jacket", "suit", "bag"]

const CreateProductForm = () => {
  const [newProduct, setNewProduct] = useState({
    name: "",
    description:"",
    price: "",
    category: "",
    image:"",
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log(newProduct)
  }

  return (
    <motion.div 
      className='bg-gray-800 shadow-lg rounded-lg p-8 mb-8 max-w-xl mx-auto'
      initial={{opacity: 0, y:-20}}
      animate={{opacity: 1, y:0}}
      transition={{duration: 0.8}}
    >
      <h2 className='text-2xl font-semibold text-emerald-300 mb-6'>Create New Product</h2>

      <form onSubmit={handleSubmit}>
        <div>
        <label htmlFor="name" className='block text-sm font-medium text-gray-300'>
          Product Name
        </label>
        <input 
          type="text"
          id='name'
          name='name'
          value={newProduct.name}
          onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
          className='mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2
						 px-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500'
				  required
        />
        </div>
      </form>
    </motion.div>
  )
}

export default CreateProductForm
