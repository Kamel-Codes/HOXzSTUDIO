'use client'
import { LayoutGroup, AnimatePresence } from "motion/react";
import { Suspense } from "react";
import { useState } from "react";



import HeroSection from "./components/sections/Hero";
import Navbar from "./components/layout/Navbar";
import { SettingsProvider } from "./store/SettingsContext";

type Section = 'home' | 'stack' | 'projects' | 'secret' | 'dashboard' | 'view_link';


export default function App() {

  function openContactModal() { }
  const [currentSection, setCurrentSection] = useState<Section>(() => {
    if (typeof window === 'undefined') return 'home';
    // Persisted return: if the admin was on the dashboard, a refresh keeps them
    // there (dashboard is reached via in-app nav, not the URL, so it'd otherwise
    // reset to home). Only 'dashboard' is restored - public sections follow the URL.
    try {
      if (localStorage.getItem('revil_section') === 'dashboard') return 'dashboard';
    } catch { /* ignore */ }
    const path = window.location.pathname;
    const base = "";
    const normPath = path.replace(/\/$/, '');
    const normBase = base.replace(/\/$/, '');
    if (normPath !== normBase && normPath !== '') {
      return 'view_link';
    }
    return 'home';
  });

  return (<SettingsProvider>

    <main className="">
      <div className="blob-container" style={{ zIndex: 0 }}>
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
        <div className="blob blob-4"></div>
        <div className="blob blob-5"></div>
        <div className="blob blob-6"></div>
      </div>
      <HeroSection onOpenContact={openContactModal} />

      <LayoutGroup>
        {(currentSection !== 'dashboard') && (
          <Navbar
            // onNavigate={navigateTo}
            currentSection={currentSection}
            onOpenContact={openContactModal}
          // isContactOpen={isContactModalOpen}
          // onOpenCV={openCVModal}
          // isCVOpen={isCVModalOpen}
          />
        )}
        {/* <ErrorBoundary fallback={modalErrorFallback}>
        <Suspense fallback={null}>
          <AnimatePresence>
            {isContactModalOpen && (
              <MContact onClose={closeContactModal} />
            )}
          </AnimatePresence>
        </Suspense>
      </ErrorBoundary>
      <ErrorBoundary fallback={modalErrorFallback}>
        <Suspense fallback={null}>
          <AnimatePresence>
            {isCVModalOpen && (
              <MCV onClose={closeCVModal} onProjectClick={handleProjectClick} />
            )}
          </AnimatePresence>
        </Suspense>
      </ErrorBoundary>

      <ErrorBoundary fallback={modalErrorFallback}>
        <Suspense fallback={null}>
          <AnimatePresence>
            {showProjectModal && selectedProject && (
              <MProjectView
                project={selectedProject}
                onClose={() => setShowProjectModal(false)}
                onContributorClick={handleContributorClick}
              />
            )}
          </AnimatePresence>
        </Suspense>
      </ErrorBoundary>

      <ErrorBoundary fallback={modalErrorFallback}>
        <Suspense fallback={null}>
          <AnimatePresence>
            {showContributorModal && selectedContributor && (
              <MContributorView
                contributor={selectedContributor}
                onClose={() => setShowContributorModal(false)}
              />
            )}
          </AnimatePresence>
        </Suspense>
      </ErrorBoundary> */}
      </LayoutGroup>
    </main>
  </SettingsProvider>)
}