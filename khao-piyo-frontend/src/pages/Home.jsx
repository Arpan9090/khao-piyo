import React, { useState } from 'react';
import Header from '../components/Header.jsx';
import ExploreMenu from '../components/ExploreMenu.jsx';
import FoodDisplay from '../components/FoodDisplay.jsx';

const Home = () => {
  const [category, setCategory] = useState('All');

  return (
    <>
      <Header />
      <ExploreMenu category={category} setCategory={setCategory} />
      <FoodDisplay
        category={category}
        title={category === 'All' ? 'Top dishes near you' : `${category} near you`}
      />
    </>
  );
};

export default Home;
