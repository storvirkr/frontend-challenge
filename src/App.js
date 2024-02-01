
import React, { useState, useEffect } from 'react';
import './App.css';
import liked from '../src/assets/liked.svg'
import like from '../src/assets/like.svg'

function App() {
  const [catImages, setCatImages] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState('all');
  const [isLoading, setIsLoading] = useState(false);


  useEffect(() => {
 
    const storedFavorites = JSON.parse(localStorage.getItem('favorites')) || [];
    setFavorites(storedFavorites);
    
    loadCatImages();
  }, []);


  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop ===
        document.documentElement.offsetHeight &&
        !isLoading
      ) {
        
        loadCatImages();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [catImages, isLoading]); 

  
  const loadCatImages = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`https://api.thecatapi.com/v1/images/search?limit=10&page=${page}`);
      const data = await response.json();
      const newCatImages = data.map((cat) => ({
        url: cat.url,
        isFavorite: favorites.includes(cat.url),
      }));

      setCatImages((prevCatImages) => [...prevCatImages, ...newCatImages]);
      setPage((prevPage) => prevPage + 1);
    } catch (error) {
      console.error('Error fetching cat images:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addToFavorites = (imageUrl) => {
    setCatImages((prevCatImages) => {
      const updatedCatImages = prevCatImages.map((cat) => {
        if (cat.url === imageUrl) {
          
          return { ...cat, isFavorite: !cat.isFavorite };
        }
        return cat;
      });

      return updatedCatImages;
    });

    setFavorites((prevFavorites) => {
      if (prevFavorites.includes(imageUrl)) {
        
        return prevFavorites.filter((favorite) => favorite !== imageUrl);
      } else {
        return [...prevFavorites, imageUrl];
      }
    });
    localStorage.setItem('favorites', JSON.stringify(favorites));
  };

  const switchToAllCats = () => {
    setActiveTab('all');
  };

  const switchToFavorites = () => {
    setActiveTab('favorites');
  };

  const filteredCatImages = activeTab === 'favorites'
    ? catImages.filter((cat) => cat.isFavorite)
    : catImages;

  return (
    <div>
      
      <div className="tab-buttons">
        <button className='tab-button-all' onClick={switchToAllCats}>Show All Cats</button>
        <button className='tab-button-fav' onClick={switchToFavorites}>Show Favorite Cats</button>
      </div>

      <div className="cat-container">
        {activeTab === 'all' && (
          <div className="cat-grid">
            {catImages.map((cat, index) => (
              <div key={index} className="cat-item">
                <img src={cat.url} alt={`Cat ${index + 1}`} />
                {cat.isFavorite ? (
                  <img className="liked-icon" src={liked} alt="liked" onClick={() => addToFavorites(cat.url)} />
                ) : (<img className="like-icon" src={like} alt="like" onClick={() => addToFavorites(cat.url)}/>)}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'favorites' && (
          <ul className="favorites-list">
            {catImages
              .filter((cat) => cat.isFavorite)
              .map((favorite, index) => (
                <li key={index} className="cat-item">
                  <img src={favorite.url} alt={`Favorite Cat ${index + 1}`} />
                  
                  <img className="liked-icon" src={liked} alt="liked" onClick={() => addToFavorites(favorite.url)} />
                  
                </li>
              ))}
          </ul>
        )}

        {filteredCatImages.length === 0 && !isLoading && (
          <p style={{ textAlign: 'center', margin: '10px' }}>No cats found.</p>
        )}
      </div>

      {isLoading && <p style={{ textAlign: 'center', margin: '10px' }}>... loading more cats ...</p>}
    </div>
  );
}

export default App;
