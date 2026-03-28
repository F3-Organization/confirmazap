# Business Rules - AgendaOk

## 1. Identificação de Clientes e Telefones (Client Matching)
O sistema deve tentar encontrar o telefone do cliente final em duas etapas (Fallback Strategy):
- **Estratégia A (Base de Dados):** O sistema busca na tabela `clients` se existe um cliente cadastrado pelo usuário cujo `name` ou `email` bata com o título/convidado do evento no Google Calendar.

## 2. Janela de Notificação (Cron Jobs)
- O sistema varre os eventos futuros a cada 15 minutos.
- **Regra de Disparo:** Enviar mensagem de confirmação apenas para eventos que ocorrerão entre as próximas 24 horas e 2 horas.
- **Horário de Silêncio (Anti-Spam):** Nunca enviar mensagens automáticas para os clientes finais entre 21:00 e 08:00 (Fuso horário de Boa Vista / GMT-4). Mensagens geradas nesse período devem ficar na fila do BullMQ agendadas para 08:01.

## 3. Notificações do Profissional (SaaS User)
O profissional (usuário do SaaS) deve cadastrar o seu **próprio número de telefone** nas configurações da conta para receber alertas do sistema:
- **Alerta de Cancelamento:** Se um cliente responder "Não" (Cancelamento), o sistema deve avisar o profissional imediatamente no WhatsApp dele: *"Atenção: O cliente [Nome] cancelou o horário de [Data/Hora]."*
- **Daily Summary (Opcional):** Todo dia às 08:00, enviar um resumo: *"Você tem X agendamentos hoje. Y já confirmaram."*

## 4. Status e Conciliação (Google Calendar Sync)
Quando o cliente responde no WhatsApp:
- Se resposta = SIM -> Mudar cor do evento na API do Google para 'Verde' (ID 10) e adicionar o prefixo `[CONFIRMADO]`.
- Se resposta = NÃO -> Mudar cor para 'Vermelho' (ID 11), adicionar prefixo `[CANCELADO]` e disparar o alerta para o profissional (Regra 3).
- O sistema nunca deve deletar o evento do calendário, apenas atualizar seu status para manter o histórico.