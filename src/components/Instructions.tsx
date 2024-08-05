function Instructions() {
  return (
    <>
      <p style={{ textAlign: 'justify' }}>
        The BOCA Problems Archive is a web application designed to streamline
        the curation of problems for programming competitions managed by the{' '}
        <a href="https://github.com/cassiopc/boca">BOCA</a> contest management
        system. The application provides access to hundreds of programming
        problems previously used in prominent competitive programming events,
        such as the{' '}
        <a href="https://maratona.sbc.org.br/" target="_blank" rel="noreferrer">
          SBC Programming Marathon
        </a>{' '}
        and the{' '}
        <a
          href="https://olimpiada.ic.unicamp.br/"
          target="_blank"
          rel="noreferrer"
        >
          Brazilian Olympiad in Informatics (&#x2009;OBI&#x2009;)
        </a>
        . Additionally, it&apos;s possible to create new problems from scratch.
        Once the problem creation/selection process is complete, users can
        download the problem packages in the format required by BOCA.
      </p>
    </>
  );
}

export default Instructions;
