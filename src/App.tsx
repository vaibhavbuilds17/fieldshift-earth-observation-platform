import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Header, ActiveTab } from './components/Header';
import { Footer } from './components/Footer';
import { DemonstrationWorkflowBanner } from './components/DemonstrationWorkflowBanner';
import { FarmerModeView } from './components/FarmerModeView';
import { GlobalOverviewView } from './components/GlobalOverviewView';
import { GlobalGeographicMap } from './components/GlobalGeographicMap';
import { DatePredictionView } from './components/DatePredictionView';
import { ResearchProjectsView } from './components/ResearchProjectsView';
import { PublicationsView } from './components/PublicationsView';
import { ContactFeedbackView } from './components/ContactFeedbackView';
import { UserProfileModal } from './components/UserProfileModal';
import { AgriculturalIntelligenceView } from './components/AgriculturalIntelligenceView';
import { SoilWaterIntelligenceView } from './components/SoilWaterIntelligenceView';
import { GeographicWorkspace } from './components/GeographicWorkspace';
import { StudyControls } from './components/StudyControls';
import { ResearchLab } from './components/ResearchLab';
import { ExploreData } from './components/ExploreData';
import { ClimateInsights } from './components/ClimateInsights';
import { FarmAdaptation } from './components/FarmAdaptation';
import { ScientificSourceRegistryView } from './components/ScientificSourceRegistryView';
import { MethodologyProvenanceView } from './components/MethodologyProvenanceView';
import { DataTableSection } from './components/DataTableSection';
import { ReportModal } from './components/ReportModal';
import { AiPredictionLab } from './components/AiPredictionLab';

import {
  EnvironmentalPointData,
  StudyLocation,
  DataStatus,
} from './types/nasa';
import { PRESET_LOCATIONS } from './data/presetLocations';
import {
  fetchNasaPowerData,
  DEFAULT_PARAMETERS,
  NasaFetchResult,
} from './services/nasaPowerService';
import {
  calculateStatistics,
  calculateMonthlyAggregates,
} from './services/statisticsService';
import { 
  getStoredUserProfile, 
  UserProfile, 
  addHistoryEntry 
} from './services/projectStorageService';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [userMode, setUserMode] = useState<'farmer' | 'researcher'>('researcher');
  const [userProfile, setUserProfile] = useState<UserProfile>(() => getStoredUserProfile());
  const [profileModalOpen, setProfileModalOpen] = useState<boolean>(false);

  const [currentLocation, setCurrentLocation] = useState<StudyLocation>(
    PRESET_LOCATIONS[0]
  );
  const [startDate, setStartDate] = useState<string>('2024-01-01');
  const [endDate, setEndDate] = useState<string>('2024-12-31');
  const [selectedParams, setSelectedParams] = useState<string[]>(DEFAULT_PARAMETERS);

  // Data fetching state
  const [data, setData] = useState<EnvironmentalPointData[]>([]);
  const [dataStatus, setDataStatus] = useState<DataStatus>('loading');
  const [isSampleData, setIsSampleData] = useState<boolean>(false);
  const [retrievedAt, setRetrievedAt] = useState<string>('');
  const [sources, setSources] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const [dataQualityAudit, setDataQualityAudit] = useState<any>();
  const [parameterMetadata, setParameterMetadata] = useState<Record<string, { units: string; longname: string }> | undefined>();

  // Threshold controls for insights
  const [heatThreshold, setHeatThreshold] = useState<number>(38.0);
  const [dryThreshold, setDryThreshold] = useState<number>(1.0);

  // Request sequence tracker to prevent race conditions
  const fetchSequenceRef = useRef<number>(0);

  // Report Modal state
  const [reportModalOpen, setReportModalOpen] = useState<boolean>(false);

  // Execute query function for NASA POWER
  const executeQuery = useCallback(
    async (
      loc: StudyLocation = currentLocation,
      start: string = startDate,
      end: string = endDate,
      params: string[] = selectedParams,
      forceSample: boolean = false
    ) => {
      const fetchId = ++fetchSequenceRef.current;
      setIsLoading(true);
      setDataStatus('loading');
      setErrorMessage(undefined);

      try {
        const result: NasaFetchResult = await fetchNasaPowerData(
          {
            latitude: loc.latitude,
            longitude: loc.longitude,
            startDate: start,
            endDate: end,
            parameters: params,
            community: 'AG',
          },
          forceSample
        );

        if (fetchId !== fetchSequenceRef.current) return;

        setData(result.data);
        setDataStatus(result.status);
        setIsSampleData(result.isSampleData);
        setRetrievedAt(result.retrievedAt);
        setSources(result.sources);
        setDataQualityAudit(result.dataQualityAudit);
        setParameterMetadata(result.parameterMetadata);
        if (result.elevationMeters !== undefined) {
          setCurrentLocation((prev) => ({
            ...prev,
            elevationMeters: result.elevationMeters,
          }));
        }
        if (result.errorMessage) {
          setErrorMessage(result.errorMessage);
        }

        // Log to history
        addHistoryEntry({
          action: 'data_retrieved',
          locationName: loc.name,
          latitude: loc.latitude,
          longitude: loc.longitude,
          summary: `NASA POWER data retrieved (${start} to ${end}, ${result.data.length} records).`,
        });
      } catch (err) {
        if (fetchId !== fetchSequenceRef.current) return;
        console.error('Data retrieval failed:', err);
        setDataStatus('api_unavailable');
        setErrorMessage('Failed to connect to the NASA POWER API.');
      } finally {
        if (fetchId === fetchSequenceRef.current) {
          setIsLoading(false);
        }
      }
    },
    [currentLocation, startDate, endDate, selectedParams]
  );

  // Initial load on mount
  useEffect(() => {
    executeQuery();
  }, []);

  // Compute summary statistics & monthly aggregates
  const statistics = useMemo(() => {
    return calculateStatistics(data, dataQualityAudit);
  }, [data, dataQualityAudit]);

  const monthlyAggregates = useMemo(() => {
    return calculateMonthlyAggregates(data);
  }, [data]);

  const handleUpdateLocation = (newLoc: StudyLocation) => {
    setCurrentLocation(newLoc);
    executeQuery(newLoc, startDate, endDate, selectedParams);
    addHistoryEntry({
      action: 'location_inspected',
      locationName: newLoc.name,
      latitude: newLoc.latitude,
      longitude: newLoc.longitude,
      summary: `Target location updated to ${newLoc.name}.`,
    });
  };

  const handleUpdateDates = (newStart: string, newEnd: string) => {
    setStartDate(newStart);
    setEndDate(newEnd);
    executeQuery(currentLocation, newStart, newEnd, selectedParams);
  };

  const handleToggleParam = (paramCode: string) => {
    const next = selectedParams.includes(paramCode)
      ? selectedParams.filter((p) => p !== paramCode)
      : [...selectedParams, paramCode];

    if (next.length === 0) {
      alert('At least one parameter must remain active.');
      return;
    }
    setSelectedParams(next);
    executeQuery(currentLocation, startDate, endDate, next);
  };

  // Workflow navigation mapper
  const handleWorkflowStepNavigate = (stepIndex: number) => {
    switch (stepIndex) {
      case 0:
        setActiveTab('map');
        break;
      case 1:
        setActiveTab('earth_obs');
        break;
      case 2:
        setActiveTab('weather_climate');
        break;
      case 3:
        setActiveTab('ai_predictions');
        break;
      case 4:
        setActiveTab('agriculture');
        break;
      case 5:
        setActiveTab('farmer_mode');
        break;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Strict Scientific Top Bar */}
      <Header
        activeTab={activeTab}
        onSelectTab={(tab) => {
          if (tab === 'profile') {
            setProfileModalOpen(true);
          } else {
            setActiveTab(tab);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }}
        onOpenReportModal={() => setReportModalOpen(true)}
        hasData={data.length > 0}
        userMode={userMode}
        onToggleUserMode={setUserMode}
        userProfile={userProfile}
        onOpenProfile={() => setProfileModalOpen(true)}
      />

      {/* NASA Space Apps Challenge Demonstration Workflow Banner */}
      <DemonstrationWorkflowBanner
        activeStep={
          activeTab === 'map' ? 0 :
          activeTab === 'earth_obs' || activeTab === 'satellite' ? 1 :
          activeTab === 'weather_climate' || activeTab === 'climate' ? 2 :
          activeTab === 'ai_predictions' || activeTab === 'ai_lab' ? 3 :
          activeTab === 'agriculture' ? 4 :
          activeTab === 'farmer_mode' ? 5 : 0
        }
        onNavigateStep={handleWorkflowStepNavigate}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* EXPERIENCE A: FARMER MODE */}
        {(activeTab === 'farmer_mode' || userMode === 'farmer') && (
          <FarmerModeView
            currentLocation={currentLocation}
            data={data}
            statistics={statistics}
            onSelectLocation={handleUpdateLocation}
            onSwitchToResearcher={() => {
              setUserMode('researcher');
              setActiveTab('home');
            }}
            onOpenReportModal={() => setReportModalOpen(true)}
          />
        )}

        {/* EXPERIENCE B: RESEARCHER WORKSPACES (when in researcher mode) */}
        {userMode === 'researcher' && activeTab !== 'farmer_mode' && (
          <>
            {/* 1. HOME / OVERVIEW */}
            {(activeTab === 'home' || activeTab === 'overview') && (
              <GlobalOverviewView
                currentLocation={currentLocation}
                onSelectLocation={handleUpdateLocation}
                onNavigateTab={(tab) => {
                  setActiveTab(tab);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onOpenReportModal={() => setReportModalOpen(true)}
              />
            )}

            {/* 2. GLOBAL 2D MAP (56 LAYERS, NO FAKE 3D GLOBE OR STREAMLINES) */}
            {(activeTab === 'map' || activeTab === 'weather') && (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
                <GlobalGeographicMap
                  currentLocation={currentLocation}
                  onSelectLocation={handleUpdateLocation}
                  onOpenReportModal={() => setReportModalOpen(true)}
                />
              </div>
            )}

            {/* 3. WEATHER AND CLIMATE */}
            {(activeTab === 'weather_climate' || activeTab === 'climate') && (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
                <ClimateInsights
                  data={data}
                  statistics={statistics}
                  location={currentLocation}
                  heatThreshold={heatThreshold}
                  dryThreshold={dryThreshold}
                  onUpdateHeatThreshold={setHeatThreshold}
                  onUpdateDryThreshold={setDryThreshold}
                />

                <ExploreData
                  data={data}
                  monthlyAggregates={monthlyAggregates}
                  statistics={statistics}
                  currentLocation={currentLocation}
                  isSampleData={isSampleData}
                />

                <DataTableSection
                  data={data}
                  location={currentLocation}
                  statistics={statistics}
                  retrievedAt={retrievedAt}
                  isSampleData={isSampleData}
                />
              </div>
            )}

            {/* 4. EARTH OBSERVATION & SATELLITES */}
            {(activeTab === 'earth_obs' || activeTab === 'satellite') && (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
                <GeographicWorkspace
                  currentLocation={currentLocation}
                  dataStatus={dataStatus}
                  isSampleData={isSampleData}
                  startDate={startDate}
                  endDate={endDate}
                  dataQualityAudit={dataQualityAudit}
                  onSelectLocation={handleUpdateLocation}
                  onNavigateToLab={() => {
                    setActiveTab('research_lab');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  onNavigateToCharts={() => {
                    setActiveTab('weather_climate');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />

                <DataTableSection
                  data={data}
                  location={currentLocation}
                  statistics={statistics}
                  retrievedAt={retrievedAt}
                  isSampleData={isSampleData}
                />
              </div>
            )}

            {/* 5. AGRICULTURE & CROPS */}
            {activeTab === 'agriculture' && (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
                <AgriculturalIntelligenceView
                  currentLocation={currentLocation}
                  data={data}
                  statistics={statistics}
                  onOpenReportModal={() => setReportModalOpen(true)}
                />

                <FarmAdaptation
                  currentLocation={currentLocation}
                  onOpenReportModal={() => setReportModalOpen(true)}
                />
              </div>
            )}

            {/* 6. SOIL AND WATER */}
            {activeTab === 'soil_water' && (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
                <SoilWaterIntelligenceView
                  currentLocation={currentLocation}
                  data={data}
                  statistics={statistics}
                />
              </div>
            )}

            {/* 7. AI PREDICTIONS & DATE-BASED FORECASTING */}
            {(activeTab === 'ai_predictions' || activeTab === 'ai_lab') && (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
                <DatePredictionView
                  currentLocation={currentLocation}
                  data={data}
                  statistics={statistics}
                  onOpenReportModal={() => setReportModalOpen(true)}
                />

                <AiPredictionLab
                  data={data}
                  currentLocation={currentLocation}
                />
              </div>
            )}

            {/* 8. RESEARCH LABORATORY (20 PROTOCOLS) */}
            {(activeTab === 'research_lab' || activeTab === 'lab') && (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
                <StudyControls
                  currentLocation={currentLocation}
                  startDate={startDate}
                  endDate={endDate}
                  selectedParams={selectedParams}
                  dataStatus={dataStatus}
                  isSampleData={isSampleData}
                  isLoading={isLoading}
                  errorMessage={errorMessage}
                  onUpdateLocation={handleUpdateLocation}
                  onUpdateDates={handleUpdateDates}
                  onToggleParam={handleToggleParam}
                  onRunAnalysis={(forceSample) =>
                    executeQuery(currentLocation, startDate, endDate, selectedParams, forceSample)
                  }
                  onOpenMap={() => {
                    setActiveTab('map');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />

                <ResearchLab
                  location={currentLocation}
                  data={data}
                  statistics={statistics}
                  monthlyAggregates={monthlyAggregates}
                  dataStatus={dataStatus}
                  isSampleData={isSampleData}
                  retrievedAt={retrievedAt}
                  sources={sources}
                  startDate={startDate}
                  endDate={endDate}
                  onOpenReportModal={() => setReportModalOpen(true)}
                  onNavigateToCharts={() => setActiveTab('weather_climate')}
                  onRetryFetch={() =>
                    executeQuery(currentLocation, startDate, endDate, selectedParams, false)
                  }
                  onLoadSample={() =>
                    executeQuery(currentLocation, startDate, endDate, selectedParams, true)
                  }
                />

                <DataTableSection
                  data={data}
                  location={currentLocation}
                  statistics={statistics}
                  retrievedAt={retrievedAt}
                  isSampleData={isSampleData}
                />
              </div>
            )}

            {/* 9. RESEARCH PROJECTS */}
            {activeTab === 'projects' && (
              <ResearchProjectsView
                currentLocation={currentLocation}
                onSelectLocation={handleUpdateLocation}
                onOpenReportModal={() => setReportModalOpen(true)}
              />
            )}

            {/* 10. PUBLICATIONS & OPEN SCIENCE */}
            {activeTab === 'publications' && (
              <PublicationsView
                currentLocation={currentLocation}
                data={data}
                statistics={statistics}
                onOpenReportModal={() => setReportModalOpen(true)}
              />
            )}

            {/* 11. DATA SOURCES & METHODOLOGY */}
            {(activeTab === 'sources' || activeTab === 'sources_provenance') && (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
                <ScientificSourceRegistryView
                  currentLat={currentLocation.latitude}
                  currentLng={currentLocation.longitude}
                />

                <MethodologyProvenanceView
                  currentLocation={currentLocation}
                  startDate={startDate}
                  endDate={endDate}
                  retrievedAt={retrievedAt}
                  sources={sources}
                />
              </div>
            )}

            {/* 12. EXPLORATION HISTORY */}
            {activeTab === 'history' && (
              <ResearchProjectsView
                currentLocation={currentLocation}
                onSelectLocation={handleUpdateLocation}
                onOpenReportModal={() => setReportModalOpen(true)}
              />
            )}

            {/* 13. CONTACT & FEEDBACK */}
            {activeTab === 'contact_feedback' && (
              <ContactFeedbackView
                currentLocation={currentLocation}
              />
            )}
          </>
        )}
      </main>

      {/* Scientific Report Generator Modal */}
      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        location={currentLocation}
        data={data}
        statistics={statistics}
        sources={sources}
        retrievedAt={retrievedAt}
        isSampleData={isSampleData}
        heatThreshold={heatThreshold}
        dryThreshold={dryThreshold}
      />

      {/* User Profile Modal */}
      <UserProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        currentUser={userProfile}
        onUserChange={setUserProfile}
      />

      {/* Clean Scientific Footer */}
      <Footer
        onSelectTab={(tab: ActiveTab) => {
          if (tab === 'sources' || tab === 'provenance') setActiveTab('sources');
          else if (tab === 'lab') setActiveTab('research_lab');
          else if (tab === 'explore' || tab === 'insights') setActiveTab('weather_climate');
          else if (tab === 'adaptation') setActiveTab('agriculture');
          else setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    </div>
  );
}
