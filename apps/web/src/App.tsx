import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Login } from "@/pages/Login";
import { DashboardLayout } from "@/pages/DashboardLayout";
import { Dashboard } from "@/pages/Dashboard";
import { Account } from "@/pages/Account";
import { FormalityDetail } from "@/pages/FormalityDetail";
import { Users } from "@/pages/Users";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="account" element={<Account />} />
            <Route path="users" element={<Users />} />
            <Route path="users/:uuid" element={<div>TODO: User edit</div>} />
            <Route path="formalities/:uuid" element={<FormalityDetail />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
