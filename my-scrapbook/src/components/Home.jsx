import { useNavigate } from 'react-router-dom';
import { signOutUser } from '../firebase';

const Home = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    const result = await signOutUser();
    if (result.success) {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-8">
            Welcome to My Scrapbook
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            You have successfully logged in! This is your home page.
          </p>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home; 