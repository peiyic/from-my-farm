import Logo from '../components/logo';
import Search from '../components/search';
import Sidebar from '../components/sidebar';
import Map from '../components/map';

export default function Home() {
  return (
    <div className='grid-container'>
      <Logo />
      <Search />
      <Sidebar />
      <Map />
    </div>
  )
}