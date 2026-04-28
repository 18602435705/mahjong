import { useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { installAudioUnlock } from "./actionAudio";
import { AuthProvider } from "./auth/AuthContext";
import AuthPage from "./pages/AuthPage";
import GamePage from "./pages/GamePage";
import LobbyPage from "./pages/LobbyPage";
import ResultPage from "./pages/ResultPage";
import {
  ProtectedRoute,
  PublicOnlyRoute,
  RootRedirect,
} from "./router/RouteGuards";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route element={<PublicOnlyRoute />}>
        <Route path="/auth" element={<AuthPage />} />
      </Route>
      <Route element={<ProtectedRoute />}>
        <Route path="/lobby" element={<LobbyPage />} />
        <Route path="/game" element={<GamePage />} />
        <Route path="/result" element={<ResultPage />} />
      </Route>
      <Route path="*" element={<RootRedirect />} />
    </Routes>
  );
}

export default function App() {
  useEffect(() => {
    installAudioUnlock();
  }, []);

  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
