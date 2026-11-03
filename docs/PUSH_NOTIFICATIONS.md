# Notificações push

O TaxaUp usa Firebase Cloud Messaging (FCM). O Android recebe diretamente pelo FCM e o iOS recebe pelo FCM integrado ao Apple Push Notification service (APNs). As notificações também continuam gravadas na central interna do app.

## Firebase

1. Crie o projeto **TaxaUp** no [Firebase Console](https://console.firebase.google.com/).
2. Adicione o app Android com o package `com.taxaup.app` e baixe o arquivo `google-services.json` em `android/app/google-services.json`.
3. Adicione o app iOS com o bundle ID `com.taxaup.app` e baixe `GoogleService-Info.plist` em `ios/GoogleService-Info.plist`.
4. Não versione esses arquivos. O `.gitignore` já os protege.

## iOS e APNs

No portal Apple Developer, habilite **Push Notifications** e **Background Modes / Remote notifications** para `com.taxaup.app`. Gere uma chave APNs (`.p8`) e envie-a em Firebase Console > Project settings > Cloud Messaging > iOS app configuration.

Depois dos arquivos do Firebase, execute `pod install` dentro da pasta `ios` em um Mac. O workflow de iOS também deve executar esse passo.

## Credencial do servidor

Em Firebase Console > Project settings > Service accounts, gere uma chave privada JSON. No Windows, gere a versão Base64 sem exibir o segredo no terminal:

```powershell
[Convert]::ToBase64String([System.IO.File]::ReadAllBytes('C:\caminho\firebase-service-account.json')) | Set-Clipboard
```

No servidor, inclua os valores no arquivo `/opt/taxaup/.env`:

```dotenv
FirebasePush__ProjectId=seu-id-do-projeto-firebase
FirebasePush__ServiceAccountJsonBase64=cole-o-conteudo-da-area-de-transferencia
```

Recrie somente o container da API após salvar a configuração. Nunca envie o JSON da conta de serviço, o Base64 ou a chave APNs para o Git.

## Teste

1. Instale o app em um aparelho físico e autorize notificações.
2. Entre na conta; o app registra automaticamente o token FCM na API.
3. Faça uma candidatura, aceite-a com a empresa, cancele uma vaga ou realize check-in/check-out.
4. Confirme a notificação com o app em segundo plano e, depois, com ele aberto.
