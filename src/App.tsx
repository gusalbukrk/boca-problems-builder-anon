import { useState } from 'react';

import './App.css';
import DownloadProblems from './components/DownloadProblems';
import Instructions from './components/Instructions';
import Menu from './components/Menu';
import ProblemForm from './components/ProblemForm';
import SelectExistingProblem from './components/SelectExistingProblem';

function App() {
  const [selectedComponent, setSelectedComponent] = useState('instructions');
  const [selectedProblemID, setSelectedProblemID] = useState<string | null>(
    null,
  );

  return (
    <>
      <h1 className="mb-4 fw-semibold">BOCA Problems Packages Builder</h1>
      <div id="wrapper" className="d-flex" style={{ gap: '1.5rem' }}>
        <Menu
          setSelectedComponent={setSelectedComponent}
          setSelectedProblemID={setSelectedProblemID}
        />
        <main className="flex-grow-1 p-3">
          {selectedComponent === 'instructions' && <Instructions />}

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

          {selectedComponent === 'select' && <SelectExistingProblem />}

          {selectedComponent === 'download' && <DownloadProblems />}
        </main>
      </div>
    </>
  );
}

export default App;
