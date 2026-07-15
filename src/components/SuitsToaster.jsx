import { Toaster } from 'react-hot-toast'
import { suitsToasterProps } from '../helpers/toast'

/** Global Suits Shop toast host — mount once in main.jsx */
export default function SuitsToaster() {
  return <Toaster {...suitsToasterProps} />
}
