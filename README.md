# Squid PubSub API

Projeto que encapsula chamadas para a API do PubSub do GCloud.

## Instalação

```sh
$ npm install github:squidit/sq-pubsub-api
```

## Como obter um JWT válido

Para realizar as chamadas para a API do PubSub, é necessário obter um JWT de uma conta de serviço com as devidas permissões configuradas para o PubSub.

Primeiramente será necessário salvar um *credentials.json* com a respectiva conta de serviço na sua máquina, depois executar os seguintes comandos:

```sh
$ gcloud auth activate-service-account --key-file=[PATH_DO_CREDENTIALS.JSON]
$ gcloud auth print-access-token # Após essa etapa você irá ter um JWT válido
$ gcloud auth list # Para listar as contas de serviços
$ gcloud config set account [SUA_CONTA_PRINCIPAL] # Para voltar a usar a sua credencial default
```

## Uso

O projeto expõe duas classes, uma para manipular as subscriptions e outra topics.

### Subscription

Exemplo de código para escutar as mensagens de uma subscription específica:

```js
const SqPubSub = require('sq-pubsub-api')
const pubsub = new SqPubSub('credentials.json')
const sub = pubsub.subcription('subscription-name')

// Escutar as mensagens de uma inscrição
const handler = (message) => {
  console.log('Processei a mensagem')
}
const options = {
  maxMessages: 5,
  limitMessageTime: 1 * 60 * 1000,
  poolSleep: 5000
}

await sub.listen(handler, options)
```

- O **handler** deve ser uma função que recebe o body da mensagem como parâmetro
- O **options** são as opções da função `listen`:
  - `options.maxMessages`: número máximo de mensagens que serão processadas a cada ciclo (default: 1)
  - `options.limitMessageTime`: tempo máximo em milisegundos que uma mensagem pode aguardar no tópico antes de ser ignorada (default: infinito)
  - `options.poolSleep`: tempo em milisegundos que será aguardado entre as requisições caso não tenha nenhuma mensagem para ser entregue (default: 30 segundos)

### Topic

Exemplo de código para publicar uma mensagem em um tópico:

```js
const SqPubSub = require('sq-pubsub-api')
const pubsub = new SqPubSub('credentials.json')
const topic = pubsub.subcription('subscription-name')

const message = {
  teste: true
}
const messageId = await topic.publish(message)
```