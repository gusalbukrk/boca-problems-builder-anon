import { useState } from 'react';

import './App.css';
import CreateNewProblem from './components/CreateNewProblem';
import DownloadProblems from './components/DownloadProblems';
import Instructions from './components/Instructions';
import Menu from './components/Menu';
import SelectExistingProblem from './components/SelectExistingProblem';

import type { problem } from './shared';

function App() {
  const [selectedComponent, setSelectedComponent] = useState('instructions');
  const [problems, setProblems] = useState<problem[]>([]);

  const addProblem = (problem: problem) => {
    setProblems([...problems, problem]);
  };

  return (
    <>
      <h1 className="mb-4">BOCA Problems Packages Builder</h1>
      <div id="wrapper" className="d-flex" style={{ gap: '1.5rem' }}>
        <Menu problems={problems} setSelectedComponent={setSelectedComponent} />
        <main className="flex-grow-1 p-3">
          {selectedComponent === 'instructions' && <Instructions />}

          {selectedComponent === 'create' && (
            <>
              <CreateNewProblem addProblem={addProblem} />
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
