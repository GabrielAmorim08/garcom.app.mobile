/**
 * Brazilian Portuguese — the reference locale. Every other file must mirror these keys.
 * Namespaces follow the entities, so a screen only pulls the branch it needs.
 */
export const ptBR = {
  common: {
    appName: 'ServeUp',
    tagline: 'Pessoas que servem boas experiências',
    continue: 'Continuar',
    back: 'Voltar',
    cancel: 'Cancelar',
    confirm: 'Confirmar',
    save: 'Salvar',
    close: 'Fechar',
    next: 'Avançar',
    optional: 'opcional',
    loading: 'Carregando...',
    retry: 'Tentar novamente',
    seeDetails: 'Ver detalhes',
    filter: 'Filtrar',
    map: 'Mapa',
    list: 'Lista',
    today: 'Hoje',
    tomorrow: 'Amanhã',
    stepOf: '{{current}} de {{total}}',
    distanceKm: '{{value}} km',
    distanceFromYou: '{{value}} km de você',
    waiterCount_one: '{{count}} garçom',
    waiterCount_other: '{{count}} garçons',
    hoursShort: '{{count}}h',
  },

  errors: {
    generic: 'Algo deu errado. Tente novamente.',
    network: 'Sem conexão. Verifique sua internet.',
    unauthorized: 'Sua sessão expirou. Entre novamente.',
    notFound: 'Não encontramos o que você procura.',
    required: 'Campo obrigatório',
    invalidEmail: 'E-mail inválido',
    invalidDate: 'Data inválida',
    endBeforeStart: 'O horário de término deve ser depois do início',
  },

  tabs: {
    home: 'Início',
    services: 'Serviços',
    messages: 'Mensagens',
    profile: 'Perfil',
  },

  auth: {
    signIn: 'Entrar',
    signInTitle: 'Entre na sua conta',
    signInSubtitle: 'Acesse vagas próximas ou publique serviços para o seu estabelecimento.',
    signOut: 'Sair',
    email: 'E-mail',
    fullName: 'Nome completo',
    fullNamePlaceholder: 'Seu nome',
    phone: 'Telefone',
    password: 'Senha',
    passwordMin: 'A senha deve ter pelo menos 8 caracteres.',
    forgotPassword: 'Esqueci minha senha',
    createAccount: 'Criar conta',
    createWaiterAccount: 'Criar conta de garçom',
    createCompanyAccount: 'Criar conta de empresa',
    hasAccount: 'Já tenho conta',
    noAccount: 'Criar uma conta',
    signUpTitle: 'Crie sua conta',
    signUpSubtitle: 'Escolha seu perfil e comece a usar o ServeUp.',
    companySectionTitle: 'Dados da empresa',
    companySectionSubtitle: 'Essas informações serão usadas para publicar vagas e receber candidatos.',
    companyLegalName: 'Razão social',
    companyLegalNamePlaceholder: 'Nome registrado da empresa',
    companyTradeName: 'Nome fantasia',
    companyTradeNamePlaceholder: 'Nome conhecido pelo público',
    companyTaxId: 'CNPJ',
    companyTaxIdInvalid: 'Informe um CNPJ válido.',
    companyEmail: 'E-mail da empresa',
    companyPhone: 'Telefone da empresa',
    emailVerificationTitle: 'Verifique seu e-mail',
    emailVerificationSubtitle: 'Enviamos um código para {{email}}. Digite o código para liberar sua conta.',
    emailVerificationCode: 'Código de verificação',
    emailVerificationCodeInvalid: 'Informe o código de 6 dígitos.',
    emailVerificationConfirm: 'Verificar e-mail',
    emailVerificationResend: 'Reenviar código',
    emailVerificationSent: 'Enviamos um novo código para o seu e-mail.',
    useAnotherAccount: 'Usar outra conta',
    iAmACompany: 'Sou empresa',
    iAmAWaiter: 'Sou garçom',
  },

  company: {
    home: {
      heroTitle: 'Garçons profissionais para o seu evento',
      heroSubtitle: 'Solicite em poucos passos e conte com profissionais qualificados.',
      requestWaiter: 'Solicitar um garçom',
      myServices: 'Meus serviços',
    },
  },

  serviceRequest: {
    newRequest: 'Nova solicitação',

    step1: {
      question: 'Qual tipo de serviço?',
      types: {
        privateEvent: { label: 'Evento particular', hint: 'Aniversários, casamentos, reuniões, etc.' },
        restaurant: { label: 'Restaurante / Bar', hint: 'Reforço na equipe' },
        corporate: { label: 'Corporativo', hint: 'Eventos empresariais, congressos, etc.' },
        other: { label: 'Outro', hint: 'Descreva sua necessidade' },
      },
    },

    step2: {
      question: 'Quando e onde?',
      date: 'Data',
      time: 'Horário',
      timeRange: '{{start}} às {{end}}',
      address: 'Endereço',
      useMyLocation: 'Usar minha localização',
      addressPlaceholder: 'Rua, número, bairro',
    },

    step3: {
      title: 'Detalhes do serviço',
      waiterQuantity: 'Quantos garçons?',
      notes: 'Observações',
      notesPlaceholder: 'Ex.: tipo de evento, perfil desejado, traje, etc.',
      estimatedValue: 'Valor estimado',
      estimatedRange: '{{min}} - {{max}}',
      estimateDisclaimer: 'O valor final pode variar conforme duração e detalhes do serviço.',
      submit: 'Solicitar agora',
    },

    sent: {
      title: 'Solicitação enviada com sucesso!',
      message: 'Em breve, garçons próximos poderão visualizar e se candidatar ao seu serviço.',
      track: 'Acompanhar solicitação',
      backHome: 'Voltar para o início',
    },

    status: {
      draft: 'Rascunho',
      published: 'Publicada',
      filled: 'Completa',
      cancelled: 'Cancelada',
      completed: 'Concluída',
    },
  },

  waiter: {
    home: {
      greeting: 'Olá, {{name}}!',
      subtitle: 'Pronto para o próximo serviço?',
      servicesDone: 'Serviços realizados',
      averageRating: 'Avaliação média',
    },
    nearby: {
      title: 'Serviços próximos',
      empty: 'Nenhum serviço perto de você agora.',
      emptyHint: 'Aumente o raio de busca no seu perfil.',
    },
    detail: {
      waitersNeeded_one: '{{count}} garçom necessário',
      waitersNeeded_other: '{{count}} garçons necessários',
      perWaiter: '({{value}} por garçom)',
      description: 'Descrição',
      talkToClient: 'Fale com o contratante',
      talkToClientHint: 'Tire dúvidas e alinhe os detalhes do serviço.',
      apply: 'Quero este serviço',
      applyHint: 'Você será notificado se for selecionado.',
      alreadyApplied: 'Candidatura enviada',
    },
    confirmed: {
      title: 'Parabéns!',
      subtitle: 'Você foi selecionado!',
      chat: 'Conversar agora',
    },
    myServices: {
      title: 'Meus serviços',
      upcoming: 'Próximos',
      history: 'Histórico',
      monthEarnings: 'Ganhos este mês',
      emptyUpcoming: 'Você ainda não tem serviços agendados.',
      emptyHistory: 'Seu histórico aparecerá aqui.',
    },
  },

  assignment: {
    status: {
      confirmed: 'Confirmado',
      checkedIn: 'Em andamento',
      checkedOut: 'Finalizado',
      noShow: 'Não compareceu',
      cancelled: 'Cancelado',
      completed: 'Concluído',
    },
  },

  rating: {
    title: 'Como foi o serviço?',
    commentPlaceholder: 'Conte como foi (opcional)',
    submit: 'Enviar avaliação',
  },
};

export type TranslationSchema = typeof ptBR;
