# Squid PubSub API

Projeto que encapsula chamadas para a API do PubSub do GCloud.

## Instalação

```sh
$ npm install github:squidit/sq-pubsub-api
```

## Uso

O projeto expõe uma classe `PubSub` para manipular subscriptions e topics.

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