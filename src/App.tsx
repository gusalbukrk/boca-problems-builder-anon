import { useState } from 'react';

import './App.css';
import ContestSettings from './components/ContestSettings';
import DataManagement from './components/DataManagement';
import ExistingProblems from './components/ExistingProblems';
import Instructions from './components/Instructions';
import Menu from './components/Menu';
import ProblemForm from './components/ProblemForm';

function App() {
  const [selectedComponent, setSelectedComponent] = useState('instructions');
  const [selectedProblemID, setSelectedProblemID] = useState<string | null>(
    null,
  );

  return (
    <>
      <h1 className="h2 mb-4 fw-semibold">BOCA Problems Archive</h1>
      <div id="wrapper" className="d-flex" style={{ gap: '1.5rem' }}>
        <Menu
          setSelectedComponent={setSelectedComponent}
          setSelectedProblemID={setSelectedProblemID}
        />
        <main className="p-3" style={{ width: '65%' }}>
          {selectedComponent === 'instructions' && <Instructions />}

          {selectedComponent === 'contestSettings' && <ContestSettings />}

          {selectedComponent === 'create' && (
            <>
              <ProblemForm />
            </>
          )}

          {selectedComponent === 'update' && (
            <>
              <ProblemForm
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                selectedProblemID={selectedProblemID!}
              />
            </>
          )}

          {selectedComponent === 'view' && (
            <>
              <ProblemForm
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                selectedProblemID={selectedProblemID!}
                readonly={true}
              />
            </>
          )}

          {selectedComponent === 'select' && (
            <ExistingProblems
              setSelectedProblemID={(id) => {
                setSelectedComponent('view');
                setSelectedProblemID(id);
              }}
            />
          )}

          {selectedComponent === 'dataManagement' && <DataManagement />}
        </main>
      </div>
    </>
  );
}

export default App;
