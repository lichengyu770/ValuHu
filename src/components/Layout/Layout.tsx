import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import BottomNav from './BottomNav';
import './Layout.css';

const Layout = () => {
  return (
    <div className='layout'>
      <Header />
      <main className='main-content'><Outlet /></main>
      <BottomNav />
      <Footer />
    </div>
  );
};

export default Layout;
