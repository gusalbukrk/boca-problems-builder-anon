import { faFloppyDisk, faImages } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEffect, useRef, useState } from 'react';

import db from '../db';

function ContestSettings() {
  const [name, setName] = useState('');
  const [logo, setLogo] = useState('');

  const nameInputRef = useRef<HTMLInputElement>(null);
  // const logoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    (async () => {
      const name = ((await db.miscellaneous.get('contestName'))?.value ??
        '') as string;
      setName(name);

      const logo = ((await db.miscellaneous.get('logo'))?.value ??
        '') as string;
      setLogo(logo);
    })();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    await db.miscellaneous.update('contestName', {
      value: name,
    });

    await db.miscellaneous.update('logo', {
      value: logo,
    });

    nameInputRef.current?.focus();
    window.scroll({ top: 0 });
  };

  return (
    <>
      <h2 className="h4 mb-4dot5">Configurar competição</h2>
      <form
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onSubmit={handleSubmit}
        className="container mt-4"
      >
        <div className="mb-4dot5">
          <label htmlFor="name" className="form-label fw-medium">
            Nome da competição
          </label>
          <input
            id="name"
            type="text"
            className="form-control"
            ref={nameInputRef}
            value={name}
            onChange={(e) => {
              setName(e.target.value);
            }}
            required
          />
        </div>
        <div className="mb-4dot5">
          <label htmlFor="logo" className="form-label fw-medium d-block">
            Logo da competição ou da instituição organizadora
          </label>
          <label htmlFor="logo" className="btn btn-outline-primary btn-sm mt-2">
            <FontAwesomeIcon icon={faImages} className="me-2" />
            Escolher logo
          </label>
          <input
            id="logo"
            type="file"
            accept="image/*"
            className="form-control form-control-sm"
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            onChange={async (e) => {
              const file = e.target.files?.[0];

              if (file !== undefined) {
                const logo = await new Promise((res, rej) => {
                  const reader = new FileReader();

                  reader.onload = () => {
                    res(reader.result);
                  };

                  reader.onerror = () => {
                    // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
                    rej(reader.error);
                  };

                  reader.readAsDataURL(file);
                });
                setLogo(logo as string);
              }
            }}
            hidden
          />
          <div className="d-flex column-gap-3 mt-3 align-items-center">
            {logo === '' ? (
              <p>Nenhum logo foi adicionado.</p>
            ) : (
              <img width="150" src={logo} />
            )}
          </div>
        </div>
        <button type="submit" className="btn btn-primary fw-medium">
          <FontAwesomeIcon icon={faFloppyDisk} className="me-2" />
          Salvar
        </button>
      </form>
    </>
  );
}

export default ContestSettings;
