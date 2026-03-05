import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ClerkProvider, SignedIn, SignedOut } from '@clerk/clerk-react';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { AIAssistantPage } from './pages/AIAssistantPage';
import { Tags } from './pages/Tags';
import { SignInPage } from './pages/SignInPage';
import { SignUpPage } from './pages/SignUpPage';
import { Welcome } from './pages/Welcome';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key")
}

function ClerkProviderWithRoutes() {

  return (
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
    >
      <Routes>
        {/* Public Routes for Auth */}
        <Route path="/signin/*" element={<SignInPage />} />
        <Route path="/signup/*" element={<SignUpPage />} />
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/share/:shareToken" element={<Layout><Home /></Layout>} />

        {/* Protected Routes */}
        <Route
          path="*"
          element={
            <>
              <SignedIn>
                <Layout>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/ai" element={<AIAssistantPage />} />
                    <Route path="/tags" element={<Tags />} />
                    {/* <Route path="/settings" element={<SettingsPage />} /> */}
                    {/* Redirect unknown protected routes to home */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </Layout>
              </SignedIn>
              <SignedOut>
                {/* If user is not signed in, show welcome page unless searching for share */}
                {/* This handles the root path and any other unauthenticated access attempt */}
                <Welcome />
              </SignedOut>
            </>
          }
        />
      </Routes>
    </ClerkProvider>
  );
}

function App() {
  return (
    <Router>
      <ClerkProviderWithRoutes />
    </Router>
  );
}
export default App;
