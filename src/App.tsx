import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import Dashboard from "@/pages/Dashboard";
import SeatsPage from "@/pages/Seats";
import CycleRulesPage from "@/pages/Cycle/Rules";
import CycleGeneratePage from "@/pages/Cycle/Generate";
import CycleListPage from "@/pages/Cycle/List";
import StudentsPage from "@/pages/Students";
import MatchingPage from "@/pages/Matching";
import RankingPage from "@/pages/Ranking";
import ResultPage from "@/pages/Result";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/seats" element={<SeatsPage />} />
          <Route path="/cycle/rules" element={<CycleRulesPage />} />
          <Route path="/cycle/generate" element={<CycleGeneratePage />} />
          <Route path="/cycle/list" element={<CycleListPage />} />
          <Route path="/students" element={<StudentsPage />} />
          <Route path="/matching" element={<MatchingPage />} />
          <Route path="/ranking" element={<RankingPage />} />
          <Route path="/result" element={<ResultPage />} />
        </Route>
      </Routes>
    </Router>
  );
}
