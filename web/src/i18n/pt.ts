import type { Copy } from './en';

export const pt: Copy = {
  lang: 'pt-BR',
  path: '/pt/',
  og: 'og-pt.png',
  meta: {
    title: 'Heddle: automação que é sua de verdade',
    description:
      'Automação de fluxos open source com licença MIT. Conecte suas ferramentas em um editor visual e rode, embuta ou venda.',
  },
  skip: 'Pular para o conteúdo',
  home: 'Heddle, início',
  navLabel: 'Principal',
  nav: { what: 'O que faz', showcase: 'Showcase', early: 'Acesso antecipado', source: 'GitHub' },
  switchTo: { label: 'EN', title: 'View in English', lang: 'en', path: '/' },
  hero: {
    lines: ['Automação que', 'é sua de verdade.'],
    accent: 'sua',
    lead: 'Conecte suas ferramentas e automatize o trabalho que fica entre elas. Desenhe o fluxo você mesmo, ou descreva o que precisa e deixe a IA montar. Uma linha instala tudo no seu computador.',
    join: '[ Entrar na lista ]',
    selfHost: '[ Hospedar por conta própria ]',
  },
  entry: {
    kind: 'substantivo, em inglês.',
    text: 'Liço: a peça do tear que levanta cada fio da urdidura para a trama passar. É ela que decide o caminho de cada fio.',
  },
  what: {
    title: 'O que faz',
    intro:
      'Toda empresa roda em cima de pequenas tarefas repetidas: copiar isso para lá, avisar aquela pessoa, conferir isto antes daquilo. O Heddle faz essas tarefas por você. Você desenha os passos uma vez, e ele segue todas as vezes.',
    after:
      'Cada círculo é um passo, chamado de nó. Slack, Google Sheets, e-mail e armazenamento de arquivos têm passos próprios, qualquer outro serviço com API está a uma requisição HTTP de distância, e quando um passo precisa de lógica de verdade, você escreve em Elixir ou Python.',
  },
  figure: {
    title: 'Um novo pedido desenhado como um fluxo de fios',
    desc: 'Um novo pedido leva a uma verificação: está pago? Se sim, o estoque é avisado. Se não, fica registrado. Se avisar o estoque falhar, isso também fica registrado. Os dois caminhos terminam no fim. Um fio vermelho marca uma execução: novo pedido, pago, estoque avisado, fim.',
    webhook: 'Novo pedido',
    condition: 'Está pago?',
    http: 'Avisa o estoque',
    logger: 'Registra',
    output: 'Fim',
    yes: 'sim',
    no: 'não',
    failed: 'falhou',
    fig: 'Fig. 1.',
    caption: 'Chega um novo pedido. O fio vermelho é uma execução: o pedido estava pago, então o estoque foi avisado.',
    watch: '[ Ver fluxos de verdade ]',
  },
  today: {
    title: 'O que vem na caixa',
    claim: 'Suas ferramentas,',
    claimAccent: 'já conectadas.',
    lead: 'Inúmeros nós prontos. Coloque um no canvas, escolha uma credencial, e ele roda. Qualquer outro serviço com API está a uma requisição HTTP de distância.',
    stampsLabel: 'Funciona com',
    stamps: ['Slack', 'Google Sheets', 'E-mail', 'S3', 'FTP', 'CSV', 'HTTP', 'Claude', 'GPT', 'Gemini', 'Grok', 'MCP'],
    stampsMore: 'e muito mais',
    statsLabel: 'O Heddle em números',
    stats: [
      { value: '387', label: 'execuções por segundo' },
      { value: '11 ms', label: 'por execução' },
      { value: '0', label: 'execuções perdidas em um crash' },
    ],
    features: [
      {
        title: 'IA que faz o trabalho',
        text: 'Resuma, classifique, traduza e extraia dados. Leia e crie imagens, transcreva áudio, transforme texto em fala. Pronto para usar.',
      },
      {
        title: 'Agentes com ferramentas de verdade',
        text: 'Entregue seus outros passos a um AI Agent, e ele os usa como ferramentas para resolver o trabalho.',
      },
      {
        title: 'Descreva e ganhe um fluxo',
        text: 'Diga ao chat com IA o que você precisa. Ele planeja o fluxo e monta depois da sua aprovação.',
      },
      {
        title: 'Aberto às suas ferramentas de IA',
        text: 'Um servidor MCP embutido deixa elas lerem, montarem e rodarem seus fluxos.',
      },
      {
        title: 'Roda sozinho',
        text: 'Agendamentos com cron, webhooks que respondem com o resultado, novas tentativas automáticas e o histórico de cada execução.',
      },
      {
        title: 'Segredo fica em segredo',
        text: 'Credenciais criptografadas. O fluxo guarda só o nome delas, então uma chave nunca vai parar em um log.',
      },
      {
        title: 'Monte junto',
        text: 'Quem está no fluxo vê o cursor e as mudanças dos outros na hora. Salva sozinho, e o desfazer volta só o que você fez.',
      },
      {
        title: 'Publique quando estiver pronto',
        text: 'Edite um rascunho enquanto a produção roda a versão publicada. Cada versão guarda quem mudou o quê e quando, e volta com um clique.',
      },
      {
        title: 'Canvas ou terminal',
        text: 'Desenhe no navegador, com notas e seções que explicam o fluxo. Ou fique no terminal com o Treadle.',
      },
      {
        title: 'Código quando você quiser',
        text: 'Escreva em Elixir ou Python quando precisar de lógica de verdade, e controle tudo por uma API pública.',
      },
    ],
    nextLabel: 'O que vem depois está no',
    nextLink: 'quadro do projeto',
  },
  bench: {
    title: 'Benchmark',
    why: 'O Heddle roda na BEAM, a máquina virtual do Erlang, feita para manter milhares de processos leves ao mesmo tempo. Cada execução é um desses processos, e a fila fica no próprio Postgres, sem Redis nem outro serviço no caminho.',
    result:
      'Entre as ferramentas que gravam cada execução, ele foi o mais rápido: 387 execuções por segundo, 4 vezes o segundo colocado e cerca de 13 vezes o n8n, comparando dentro de cada rodada. Uma execução leva 11 ms do webhook ao destino, contra 52 ms ou mais nas outras, com a menor memória e o menor disco da tabela.',
    how: 'Mesmo fluxo, mesma máquina e configuração padrão: um webhook dispara uma chamada HTTP, e a execução só conta quando a chamada chega ao destino. São 20.000 chamadas, e cada número é a mediana de três rodadas.',
    caption: 'Resultado do mesmo trabalho em cada ferramenta, da mais rápida para a mais lenta',
    tool: 'Ferramenta',
    perSecond: 'Execuções por segundo',
    oneRun: 'Uma execução',
    memory: 'Memória parada',
    disk: 'Disco',
    star: '* Não terminou dentro do limite de 5 minutos do teste.',
    method: '[ Ver o método e os dados ]',
    tabsLabel: 'Resultados do benchmark',
    tabs: { speed: '[ Velocidade ]', slow: '[ API lenta ]', crash: '[ Quedas ]' },
    slow: {
      why: 'Uma API de verdade demora para responder, e o que conta então é quantas execuções a ferramenta mantém ao mesmo tempo. Cada worker do Heddle roda 50 por padrão, e uma execução esperando não ocupa conexão com o banco.',
      result:
        'Entre as ferramentas que gravam cada execução, ele foi o mais rápido: 395 execuções por segundo, 4,7 vezes o segundo colocado e cerca de 10 vezes o n8n, comparando dentro de cada rodada.',
      how: 'Mesmo fluxo e configuração padrão, com um destino que leva 100 ms para responder. São 3.000 chamadas, e cada número é a mediana de três rodadas.',
      caption: 'Execuções por segundo com um destino lento, da mais rápida para a mais lenta',
      limit: 'Cada worker faz no máximo 50 chamadas ao mesmo tempo, então um destino mais lento baixa esse número.',
    },
    crash: {
      why: 'A fila do Heddle fica no Postgres, então o que ele aceitou sobrevive a uma queda, mesmo com a máquina inteira desligando. Ao voltar, ele continua a fila e recomeça o que estava rodando.',
      result:
        'Entre as ferramentas que gravam cada execução, o Heddle ficou entre as duas que não perderam nada e não deixaram nada preso, mesmo com mais da metade do trabalho ainda na fila. O Windmill empatou nisso. As 50 repetidas do Heddle são as que estavam rodando na hora da queda: quanto mais execuções ao mesmo tempo, mais delas recomeçam.',
      how: 'Derrubamos cada ferramenta inteira, banco incluído, com kill -9 depois de 1.000 chamadas aceitas, e conferimos chamada por chamada. O destino leva 100 ms para responder. Cada número é a mediana de três rodadas.',
      caption: 'O que aconteceu com as chamadas aceitas depois de cada queda',
      lost: 'Perdidas',
      stuck: 'Presas',
      repeated: 'Repetidas',
      star: '* Com o Redis na configuração padrão, sem persistência.',
      rescue: 'No teste, o Heddle espera 1 minuto para recomeçar o que estava rodando. O padrão é 60 minutos.',
    },
  },
  early: {
    title: 'Acesso antecipado',
    intro:
      'Está nos planos um Heddle hospedado, sem nada para instalar. Entre na lista e avisamos quando o acesso antecipado abrir.',
    label: 'Seu e-mail',
    placeholder: 'voce@empresa.com',
    submit: '[ Entrar na lista ]',
    sending: '[ Enviando ]',
    success: 'Você está na lista. Avisamos quando abrir.',
    error: 'Não deu certo. Tente de novo em um minuto.',
    consent: 'Usamos seu e-mail só para isso. Para sair da lista, responda a qualquer mensagem.',
    noscript: 'Este formulário precisa de JavaScript. Você também nos encontra no',
  },
  selfHost: {
    title: 'Hospedar por conta própria',
    intro:
      'Prefere rodar você mesmo? É grátis e é seu. Cole uma linha no terminal, responda algumas perguntas e o Heddle abre no seu navegador. Não precisa instalar Docker nem configurar banco de dados.',
    unix: 'Mac e Linux',
    windows: 'Windows (PowerShell)',
    treadle: 'Só o Treadle, o editor de terminal',
    agent: 'Ou peça à sua IA favorita',
    agentPrompt:
      'Instale o Heddle neste computador para mim, seguindo {guide}. Primeiro me pergunte qual provedor e modelo de IA eu quero, e se também quero o Treadle, o editor de terminal. Depois rode a instalação de uma linha com --yes, para ela não perguntar nada, mais as opções das minhas respostas: passar --help para ela lista todas. Se eu der uma chave de API, passe na variável HEDDLE_LLM_API_KEY e nunca na linha de comando. Se eu preferir não compartilhar uma aqui, pule a IA: posso adicionar depois na página de IA. Quando terminar, rode heddle doctor e me diga o endereço.',
    copy: '[ Copiar ]',
    copied: '[ Copiado ]',
    safety:
      'O Heddle fica no seu computador e não pode ser acessado pela sua rede. Os fluxos podem rodar código com as permissões da sua conta, então rode só os que você confia.',
    after:
      'O instalador pergunta qual IA usar e se você também quer o Treadle. Sua chave é conferida antes de qualquer instalação. Depois, o comando heddle inicia, para, atualiza e faz backup dos seus dados.',
    guide: '[ Instalar em um servidor ]',
    tech: 'Para quem é técnico: dois papéis dividem um banco Postgres. A UI serve o editor e coloca cada execução na fila, os workers executam, e você adiciona workers conforme o volume cresce. O',
    scaling: 'guia de escala',
    techEnd: 'tem os detalhes, e o',
    api: 'guia da API pública',
    techTail: 'cobre o resto.',
  },
  open: {
    title: 'Às claras',
    a: 'O Heddle é feito em público. Os planos estão no',
    roadmap: 'roadmap',
    b: 'e a conversa acontece no',
    c: 'Se quiser ajudar, comece pelo',
    contributing: 'guia de contribuição',
  },
  showcase: {
    path: '/pt/showcase/',
    meta: {
      title: 'Showcase: fluxos reais feitos no Heddle',
      description:
        'Fluxos que as pessoas rodam de verdade, desenhados no canvas do Heddle: leads, relatórios, suporte, reembolsos, monitoramento e pedidos.',
    },
    title: 'Showcase',
    lead: 'Fluxos que as pessoas rodam de verdade, desenhados no canvas do próprio Heddle. Abra um para olhar de perto, e clique num nó para ver como ele está configurado.',
    galleryLabel: 'Fluxos',
    open: 'Abrir',
    trigger: { webhook: 'Por webhook', schedule: 'Agendado' },
    nodes: '{n} nós',
    close: 'Fechar',
    canvasLabel: 'O fluxo no canvas do Heddle',
    hint: 'Arraste para se mover, Ctrl e a rolagem para dar zoom. Clique num nó para ver como ele está configurado.',
    noscript: 'Abrir um fluxo precisa de JavaScript.',
    inspector: {
      label: 'Detalhes do nó',
      idle: 'Clique num nó para ver como ele está configurado.',
      fields: 'Campos',
      outputs: 'Sai por',
    },
    checked:
      'Todo fluxo daqui passa pelas verificações que o Heddle faz antes de salvar um. As credenciais ficam de fora, porque cada pessoa escolhe as suas.',
    tryIt: {
      title: 'Monte o seu',
      text: 'O Heddle se instala com uma linha, no seu computador ou num servidor. Desenhe um fluxo como estes, ou descreva e deixe a IA montar.',
    },
    flows: {
      leads: {
        title: 'Encaminhar novos leads',
        summary: 'Um formulário manda um lead. O fluxo procura a empresa no GitHub, dá uma nota e manda para vendas, para o funil ou para um e-mail de boas-vindas.',
        labels: {
          form: 'Formulário enviado',
          keep: 'Guarda o lead',
          lookup: 'Procura a empresa',
          score: 'Dá a nota',
          route: 'Encaminha pela nota',
          sales: 'Avisa vendas',
          pipeline: 'Põe no funil',
          welcome: 'Manda os guias',
          join: 'Junta',
          answer: 'Responde o formulário',
        },
        notes: {
          'why-keep':
            'O HTTP Request tem um campo body próprio, que esconderia o do formulário. Por isso o lead é guardado com outro nome antes.',
        },
      },
      'sales-report': {
        title: 'Relatório diário de vendas',
        summary: 'Todo dia útil às 8h, as vendas de ontem saem do banco, uma IA resume, e o resumo vai para o Slack e por e-mail.',
        labels: {
          morning: 'Dias úteis às 8h',
          sales: 'Vendas de ontem',
          summary: 'Resume',
          channel: 'Posta em #sales',
          leadership: 'Manda à diretoria',
          failed: 'Avisa ops da falha',
        },
        notes: {
          bound: 'A consulta roda como está escrita. Valores de uma execução entrariam como parâmetros, nunca como texto.',
        },
      },
      support: {
        title: 'Triagem de suporte com IA',
        summary: 'Uma IA classifica cada chamado novo. Bugs vão para a engenharia, cobrança vai para o financeiro, e dúvidas recebem uma primeira resposta na hora.',
        labels: {
          ticket: 'Novo chamado',
          sort: 'Classifica',
          route: 'Encaminha pelo tipo',
          engineering: 'Avisa a engenharia',
          billing: 'Encaminha à cobrança',
          draft: 'Escreve a resposta',
          reply: 'Responde o cliente',
          join: 'Junta',
          answer: 'Avisa o help desk',
        },
        notes: {
          copy: 'A resposta sai com o suporte em cópia, para uma pessoa ver todas.',
        },
      },
      refunds: {
        title: 'Reembolsos com aprovação',
        summary: 'Um reembolso espera o financeiro aprovar por um link no e-mail. Se ninguém aprovar em dois dias, o financeiro fica sabendo.',
        labels: {
          request: 'Reembolso pedido',
          keep: 'Guarda o pedido',
          ask: 'Pergunta ao financeiro',
          approval: 'Espera a aprovação',
          pay: 'Reembolsa o pedido',
          customer: 'Avisa o cliente',
          expired: 'Ninguém aprovou',
        },
        notes: {
          resume: 'O {{resume_url}} retoma esta execução. A espera fica salva, então sobrevive a um reinício do servidor.',
        },
      },
      uptime: {
        title: 'Monitor de site',
        summary: 'A cada cinco minutos o site é verificado. O Redis conta as falhas, e o plantão é avisado uma vez, na terceira seguida.',
        labels: {
          every: 'A cada 5 minutos',
          check: 'Verifica o site',
          clear: 'Esquece as falhas',
          count: 'Conta a falha',
          third: 'Terceira seguida?',
          alert: 'Avisa o plantão',
        },
        notes: {
          once: 'Só a terceira falha avisa. As seguintes continuam contando em silêncio, até o site voltar.',
        },
      },
      orders: {
        title: 'Pedidos e estoque',
        summary: 'Uma loja manda cada pedido. Cada item dá baixa no estoque do banco, e o cliente recebe a confirmação quando todos terminam.',
        labels: {
          order: 'Novo pedido',
          keep: 'Guarda o pedido',
          each: 'Cada item',
          stock: 'Dá baixa no estoque',
          confirm: 'Confirma o pedido',
          answer: 'Responde a loja',
        },
        notes: {
          bound: '{{item.quantity}} e {{item.sku}} vão ao banco como parâmetros, nunca colados no SQL.',
        },
      },
    },
  },
  footer: {
    closing: 'Cada fio vai aonde deve ir.',
    license: 'Licença MIT',
  },
};
