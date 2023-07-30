import Logo from '../components/logo';
import Search from '../components/search';
import Sidebar from '../components/sidebar';
import Map from '../components/map';

export default function Home() {
  return (
    <div className='grid-container'>
      <div className='item-1'> <Logo /> </div>
      <div className='item-2'> <Search /> </div>
      <div className='item-3'> <Sidebar /> </div>
      <div className='item-4'> <Map /> </div>
    </div>
  )
}