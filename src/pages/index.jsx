import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./Layout";

// Importação das Páginas
import Dashboard from "./Dashboard";
import Clients from "./Clients";
import Processes from "./Processes";
import Financial from "./Financial";
import Appointments from "./Appointments";
import Campaigns from "./Campaigns";
import Notices from "./Notices";
import Visits from "./Visits";
import Reports from "./Reports";

const Pages = () => {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="clients" element={<Clients />} />
          <Route path="processes" element={<Processes />} />
          <Route path="financial" element={<Financial />} />
          <Route path="appointments" element={<Appointments />} />
          <Route path="campaigns" element={<Campaigns />} />
          <Route path="notices" element={<Notices />} />
          <Route path="visits" element={<Visits />} />
          <Route path="reports" element={<Reports />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default Pages;