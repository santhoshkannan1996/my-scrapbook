import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Signup from './components/Signup';
import Home from './components/Home';
import PrivateRoute from './components/PrivateRoute';
import NavigationBar from './components/NavigationBar';
import FriendsList from './components/FriendsList';
// import Write from './components/Write'; // Uncomment if you have a Write component

// Layout for private pages
const PrivateLayout = ({ children }) => (
  <>
    <NavigationBar />
    <div className="pt-4">
      {children}
    </div>
  </>
);

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route 
            path="/home" 
            element={
              <PrivateRoute>
                <PrivateLayout>
                  <Home />
                </PrivateLayout>
              </PrivateRoute>
            } 
          />
          <Route 
            path="/friends" 
            element={
              <PrivateRoute>
                <PrivateLayout>
                  <FriendsList />
                </PrivateLayout>
              </PrivateRoute>
            } 
          />
          {/* <Route 
            path="/write" 
            element={
              <PrivateRoute>
                <PrivateLayout>
                  <Write />
                </PrivateLayout>
              </PrivateRoute>
            } 
          /> */}
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
