function Instructions() {
  return (
    <div style={{ textAlign: 'justify' }}>
      <h2 className="h4 mb-4dot5">Informações gerais</h2>
      <div className="mb-3">
        <p>
          O BOCA Problems Archive é um aplicativo web projetado para simplificar
          a criação e curadoria de problemas para maratonas de programação
          gerenciadas pelo sistema de gerenciamento de competições{' '}
          <a href="https://github.com/cassiopc/boca">BOCA</a>. O aplicativo
          possibilita a criação de problemas do zero ou a seleção dentre
          centenas de problemas anteriormente utilizados em dois eventos
          brasileiros de programação competitiva de destaque — a{' '}
          <a
            href="https://maratona.sbc.org.br/"
            target="_blank"
            rel="noreferrer"
          >
            Maratona SBC de Programação (&#x2009;MP-SBC&#x2009;)
          </a>{' '}
          e a{' '}
          <a
            href="https://olimpiada.ic.unicamp.br/"
            target="_blank"
            rel="noreferrer"
          >
            Olimpíada Brasileira de Informática (&#x2009;OBI&#x2009;)
          </a>
          . Após a conclusão do processo de criação&#x2009;/&#x2009;seleção de
          problemas, os usuários podem baixar os{' '}
          <strong>pacotes de problemas</strong> no formato exigido pelo BOCA.
        </p>
      </div>
      <div className="mb-4dot5">
        <button
          className="text-primary border-0 bg-transparent p-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#collapseExample"
        >
          O que é um pacote de problemas?
        </button>
        <div className="collapse mt-4" id="collapseExample">
          <p>
            Para cadastrar um problema no BOCA, é necessário fazer o upload de
            um pacote de problema. O pacote de problema é um arquivo ZIP que
            contém diversos arquivos necessários para a apresentação, execução e
            correção do problema.
          </p>
          <ul>
            <li>
              Os arquivos relacionados à execução de código são padronizados em
              pacotes de problemas — isso é, o conteúdo desses arquivos é o
              mesmo independentemente do problema. Esses arquivos estão
              localizados nos diretórios <code>compare/</code>,{' '}
              <code>compile/</code>, <code>limits/</code>, <code>run/</code> e{' '}
              <code>tests/</code>. Por outro lado, os arquivos referentes à
              apresentação e avaliação são específicos para cada problema.
            </li>
            <li>
              Existem dois arquivos de apresentação: um arquivo de texto
              denominado <code>problem.info</code> que contém metadados diversos
              e um arquivo em formato PDF que contém a descrição do problema. O
              PDF será disponibilizado para os participantes durante a maratona
              de programação. Ambos os arquivos estão localizados no diretório{' '}
              <code>description/</code>.
            </li>
            <li>
              Em relação aos arquivos usados na correção do problema, estes
              consistem em pares de arquivos de texto de entrada e saída que
              contêm os casos de teste localizados nos diretórios{' '}
              <code>input/</code> e <code>output/</code>, respectivamente.
              Durante a correção automatizada de submissões, a solução de código
              submetida será executada tantas vezes quanto há pares de arquivos
              de entrada e saída. Cada execução utilizará um arquivo de entrada
              específico, e o resultado obtido será comparado com o arquivo de
              saída correspondente. Tipicamente, um pacote de problema incluirá
              várias dezenas de pares de arquivos de entrada e saída para
              garantir uma testagem completa do código.
            </li>
          </ul>
          <p>A estrutura de um pacote de problema é demostrada abaixo.</p>
          <code
            style={{ whiteSpace: 'pre-wrap' }}
            dangerouslySetInnerHTML={{
              /* eslint-disable no-irregular-whitespace */
              __html: `├── compare
│   ├── c
│   ├── cc
│   ├── java
│   ├── py2
│   └── py3
├── compile
│   ├── c
│   ├── cc
│   ├── java
│   ├── py2
│   └── py3
├── description
│   ├── problem.info
│   └── problem.pdf
├── input
│   ├── A
│   ├── B
│   └── C
├── limits
│   ├── c
│   ├── cc
│   ├── java
│   ├── py2
│   └── py3
├── output
│   ├── A
│   ├── B
│   └── C
├── run
│   ├── c
│   ├── cc
│   ├── java
│   ├── py2
│   └── py3
└── tests`,
              /* eslint-disable no-irregular-whitespace */
            }}
          ></code>
        </div>
      </div>
      <h2 className="h4 mb-4">Instruções</h2>
      <p>
        Siga os passos abaixo para usar o BOCA Problems Archive na preparação
        dos pacotes de problemas para uma maratona de programação.
      </p>
      <ol className="ps-5 ol-li-extra-padding" style={{ lineHeight: '1.8' }}>
        <li>
          Customize informações gerais sobre a maratona, como o nome e o
          logotipo, na página{' '}
          <span className="fw-medium">Configurar competição</span>, acessível
          por meio do link de mesmo nome na seção Menu da barra lateral.
        </li>
        <li>
          Há duas opções para adicionar problemas na competição. Acesse a página{' '}
          <span className="fw-medium">Criar novo problema</span> para criar
          problemas do zero ou a página{' '}
          <span className="fw-medium">Selecionar problema existente</span> para
          selecionar problemas existentes. Ambas as páginas são acessíveis por
          meio dos links de mesmo nome na seção Menu da barra lateral.
        </li>
        <li>
          Os problemas adicionados à maratona são listados na seção{' '}
          <span className="fw-medium">Problemas da competição</span> da barra
          lateral. Essa seção contém botões que permitem a reordenação,
          visualização, edição e remoção dos problemas da maratona.
        </li>
        <li>
          Após concluir o processo de criação e seleção de problemas, faça o
          download dos pacotes de problemas na página{' '}
          <span className="fw-medium">Gerenciamento de dados</span>, acessível
          por meio do link de mesmo nome na seção Menu da barra lateral. Nesta
          mesma seção, é possível realizar e restaurar backups em formato JSON,
          o que possibilita o armazenamento permanente dos dados e a edição em
          diferentes dispositivos.
        </li>
      </ol>
    </div>
  );
}

export default Instructions;
