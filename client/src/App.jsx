import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import TriggerDetail from './pages/TriggerDetail.jsx';
import NewTrigger from './pages/NewTrigger.jsx';
import HowItWorks from './pages/HowItWorks.jsx';
import Analytics from './pages/Analytics.jsx';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/triggers/new" element={<NewTrigger />} />
        <Route path="/triggers/:id" element={<TriggerDetail />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/analytics" element={<Analytics />} />
      </Routes>
    </Layout>
  );
}
