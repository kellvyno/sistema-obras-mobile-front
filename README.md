Sistema de Cadastro de Obras - Aplicativo Mobile (Frontend)

Este repositório contém o código-fonte do aplicativo mobile "Sistema de Cadastro de Obras", desenvolvido com React Native e Expo. Ele atua como o frontend de um sistema maior, integrando-se a um backend dedicado para gerenciar o cadastro e acompanhamento de obras e suas respectivas fiscalizações.

O objetivo do aplicativo é fornecer uma ferramenta intuitiva para registrar e monitorar o progresso de obras em andamento, permitindo a inserção de dados detalhados, localização geográfica via GPS, anexação de fotos tiradas diretamente com a câmera do dispositivo e organização de fiscalizações associadas.
✨ Requisitos Funcionais Atendidos

O aplicativo foi cuidadosamente desenvolvido para atender a todos os requisitos funcionais estabelecidos:

1. Entidade principal: Obra

    Campos: Nome da obra, Responsável, Data de início, Previsão de término, Localização (obtida via GPS), Foto da obra (usando a câmera do dispositivo), Descrição.

2. Entidade secundária: Fiscalização

    Campos: Data da fiscalização, Status da obra (Conforme, Não Conforme, Pendente, Em Análise), Observações, Localização (GPS), Foto (tirada na fiscalização), Obra relacionada.


    Botões de Ação: Para editar, excluir e enviar por e-mail os dados da obra e fiscalizações (o usuário digita ou escolhe o e-mail para envio).

🛠️ Tecnologias Utilizadas

    React Native: Framework robusto para construção de aplicativos móveis nativos utilizando JavaScript e React.

    Expo: Poderosa plataforma e conjunto de ferramentas para desenvolvimento universal de aplicativos React Native, simplificando o desenvolvimento, testes e deploy.

    @react-navigation/native & @react-navigation/stack: Solução completa para navegação entre as diferentes telas do aplicativo.

    Axios: Cliente HTTP baseado em Promises, utilizado para fazer requisições à API RESTful do backend.

    expo-location: API para acesso à localização geográfica (GPS) do dispositivo.

    expo-image-picker & expo-camera: APIs para acesso à câmera e galeria de fotos do dispositivo.

    react-native-modal-datetime-picker: Componente personalizável para seleção de datas e horários em formulários.

    @react-native-picker/picker: Componente seletor nativo para opções pré-definidas (usado para o status da fiscalização).

    react-native-elements: Biblioteca de componentes de UI de alta qualidade para React Native (para estilização e componentes comuns).

    react-native-maps: Componente para incorporar mapas e interagir com localizações geográficas.

📋 Pré-requisitos

Para configurar e rodar este aplicativo em seu ambiente de desenvolvimento, você precisará de:

    Node.js (versão 18.x ou superior, compatível com o Expo SDK 53.0.0).

    npm (gerenciador de pacotes do Node.js, vem com o Node.js).

    Aplicativo Expo Go instalado no seu smartphone (disponível na Google Play Store e Apple App Store).

    Backend do Sistema de Cadastro de Obras rodando e acessível na mesma rede local. Certifique-se de que o backend esteja ativo e que o endereço IP da sua máquina seja conhecido. Consulte o README do repositório do Backend do Sistema de Obras para instruções de instalação e execução.

🚀 Instalação e Execução

Siga os passos abaixo para configurar e iniciar o aplicativo mobile.
1. Clone o Repositório:

git clone https://github.com/seu-usuario/sistema-obras-mobile.git
cd sistema-obras-mobile # Ou o nome do seu diretório clonado, ex: sistema-obras-mobile-final

2. Instale as Dependências:

npm install

3. Configure a Conexão com o Backend:

    Abra o arquivo src/api/api.js no seu editor de código.

    Localize a linha baseURL.

    Substitua o IP de exemplo (192.168.0.104) pelo IP real da sua máquina na rede local onde o servidor backend está rodando. Este IP é fundamental para que o aplicativo mobile possa se comunicar com o backend. Você pode encontrar este IP no terminal onde o Metro Bundler do Expo está iniciado (geralmente como exp://SEU_IP_AQUI:8081).

    Exemplo:

    // src/api/api.js
    import axios from 'axios';

    const api = axios.create({
      baseURL: 'http://192.168.0.104:3000/api', // <-- Substitua pelo IP da sua máquina
    });

    export default api;

    Salve o arquivo api.js.

4. Inicie o Servidor de Desenvolvimento Expo:

npx expo start --clear

(O comando --clear garante que o cache do bundler seja limpo, resolvendo possíveis problemas de carregamento e dependência).
5. Abra o Aplicativo no Seu Dispositivo:

    Após executar o comando acima, o terminal exibirá um código QR e URLs de acesso.

    Abra o aplicativo Expo Go no seu smartphone.

    Use a câmera do seu celular para escanear o código QR exibido no terminal.

    O aplicativo será carregado no seu dispositivo.

    Alternativas:

        Para abrir em um emulador Android conectado (configurado previamente), pressione a no terminal.

        Para abrir no seu navegador web (para testes no navegador), pressione w no terminal.

📝 Exemplos de Uso do Aplicativo

Após iniciar o aplicativo e garantir que o backend esteja ativo:

    Tela Home: Você verá a tela principal listando as obras cadastradas (inicialmente, estará vazia com uma mensagem indicando para adicionar uma nova obra).

    Adicionar Obra: Clique no botão flutuante + no canto inferior direito. Preencha os detalhes da obra, utilize os botões para Obter GPS (localização atual) e Selecionar Foto (via câmera ou galeria). Clique em Cadastrar Obra.

    Visualizar Detalhes da Obra: Na Tela Home, clique em uma obra da lista. Você será levado à tela de detalhes, onde verá todas as informações da obra e uma lista de fiscalizações associadas.

    Adicionar Fiscalização: Na tela de detalhes da obra, clique em Adicionar Nova Fiscalização. Preencha os campos, utilize Obter GPS e Selecionar Foto. O campo Status é um seletor com opções válidas para evitar erros de validação.

    Editar e Excluir: Nas telas de detalhes da obra e fiscalização, você encontrará botões para Editar e Excluir os registros.

    Enviar por E-mail: Na tela de detalhes da obra, o botão Enviar E-mail abrirá um modal para você digitar o e-mail do destinatário e enviar os detalhes da obra.

📁 Estrutura do Projeto

A estrutura deste projeto React Native segue convenções comuns para modularidade e organização, facilitando o desenvolvimento e a manutenção.

    sistema-obras-mobile-final/
    ├── .expo/                       # Cache e configurações internas do Expo
    ├── assets/                      # Arquivos de mídia (imagens, ícones)
    ├── node_modules/                # Todas as bibliotecas e dependências do projeto
    ├── src/                         # Código-fonte principal da aplicação
    │   ├── api/                     # Módulos para comunicação com a API do backend
    │   │   ├── api.js               # Instância configurada do Axios
    │   │   ├── fiscalizacoes.js     # Funções CRUD para a entidade Fiscalização
    │   │   └── obras.js             # Funções CRUD para a entidade Obra
    │   ├── components/              # Componentes de UI reutilizáveis em várias telas
    │   │   ├── BotaoPadrao.js       # Componente de botão customizado
    │   │   └── CardObra.js          # Componente de cartão para exibir obras na lista
    │   ├── hooks/                   # Hooks React personalizados para lógica reutilizável
    │   │   └── useFetchData.js      # Exemplo de hook para buscar dados
    │   ├── navigation/              # Configuração da estrutura de navegação do aplicativo
    │   │   └── AppNavigator.js      # Define o Stack Navigator e as rotas das telas
    │   └── screens/                 # Telas principais do aplicativo
    │       ├── FiscalizacaoDetailsScreen.js # Tela de detalhes de uma fiscalização
    │       ├── FiscalizacaoFormScreen.js    # Formulário para criar/editar fiscalizações
    │       ├── HomeScreen.js                # Tela inicial que lista todas as obras
    │       ├── ObraDetailsScreen.js         # Tela de detalhes de uma obra específica
    │       └── ObraFormScreen.js            # Formulário para criar/editar obras
    │   └── utils/                   # Funções utilitárias e ajudantes
    │       └── formatters.js        # Exemplo de funções de formatação
    ├── .gitignore                   # Arquivos e diretórios a serem ignorados pelo Git
    ├── App.js                       # Componente raiz principal que renderiza o AppNavigator
    ├── app.json                     # Configurações do aplicativo Expo (nome, ícone, splash screen)
    ├── index.js                     # Ponto de entrada do aplicativo Expo
    ├── package-lock.json            # Garante que as versões das dependências sejam fixas
    └── package.json                 # Metadados do projeto e lista de dependências

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues para bugs ou sugestões de melhoria, ou para enviar pull requests com novas funcionalidades.
📞 Suporte

Para dúvidas ou problemas com o aplicativo mobile, por favor:

    Abra uma issue no repositório GitHub.

    Envie um email para: suporte@exemplo.com

📄 Licença

Este projeto está sob a licença MIT. Para mais detalhes, consulte o arquivo LICENSE na raiz do repositório.
