import type { MessageKey } from './en.js';

export const pt: Record<MessageKey, string> = {
  'error.generic': 'Algo correu mal. Referência: {id}',
  'error.unknownCommand': 'Esse comando já não está disponível.',
  'error.wrongServer': 'Só funciono no meu servidor.',

  'ping.description': 'Verifica se a Aigis está acordada',
  'ping.reply': 'Pong. Todos os sistemas operacionais ({ms} ms).',

  'help.description': 'Mostra o que a Aigis sabe fazer',
  'help.title': 'Comandos disponíveis:',

  'language.description': 'Escolhe a língua que a Aigis usa contigo',
  'language.option': 'Língua',
  'language.saved': 'Vou responder-te em português.',

  'timezone.description': 'Define o teu fuso horário',
  'timezone.option': 'O teu fuso horário',
  'timezone.saved': 'O teu fuso horário passou a ser {zone}.',
  'timezone.invalid': 'Não conheço esse fuso horário.',

  'config.description': 'Configura a Aigis neste servidor',
  'config.language.description': 'Define a língua do servidor (só o dono)',
  'config.language.saved': 'A língua do servidor passou a ser o português.',
  'config.language.ownerOnly': 'Só o dono do servidor pode mudar a língua do servidor.',
  'config.channel.description': 'Escolhe os canais que a Aigis usa',
  'config.channel.add': 'Adiciona um canal',
  'config.channel.remove': 'Remove um canal',
  'config.channel.purpose': 'Para que serve o canal',
  'config.channel.channel': 'Canal',
  'config.channel.added': '{channel} adicionado aos canais "{purpose}".',
  'config.channel.removed': '{channel} removido dos canais "{purpose}".',
  'config.show.description': 'Mostra a configuração atual',
  'config.show.reply': 'Língua do servidor: {language}\nGerais: {general}\nComandos: {commands}',
  'config.none': 'nenhum',
  'config.adminOnly': 'Só os administradores podem fazer isso.',
};
