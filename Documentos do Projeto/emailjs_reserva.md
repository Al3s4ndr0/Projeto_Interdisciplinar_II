# EmailJS - Confirmacao de reserva

## Onde configurar no codigo

Arquivo: `pags_html/revisar_reserva.html`

Preencha as credenciais:

```js
const EMAILJS_CONFIG = {
  publicKey: 'COLE_SUA_PUBLIC_KEY_AQUI',
  serviceId: 'COLE_SEU_SERVICE_ID_AQUI',
  templateId: 'COLE_SEU_TEMPLATE_ID_AQUI'
};
```

Enquanto esses valores estiverem com `COLE_`, o app confirma a reserva normalmente, mas nao tenta enviar email.

## Template no EmailJS

No template do EmailJS, use o campo de destino com:

```txt
{{to_email}}
```

Se o EmailJS mostrar `The recipients address is empty`, confira no painel do template:

- Em **Settings**, o campo **To email** deve estar como `{{to_email}}`.
- Se o template estiver usando outro nome, também estão disponíveis `{{email}}`, `{{recipient}}` e `{{user_email}}`.
- No corpo do email, variáveis como `{{to_email}}` apenas exibem texto; o envio depende do campo **To email** em Settings.

Variaveis enviadas pelo Qmesa:

```txt
{{email}}
{{to_email}}
{{to_name}}
{{recipient}}
{{reply_to}}
{{user_email}}
{{nome_cliente}}
{{email_cliente}}
{{cpf_cliente}}
{{telefone_cliente}}
{{restaurante_nome}}
{{data_reserva}}
{{horario_reserva}}
{{qtd_pessoas}}
{{reserva_id}}
{{link_reserva}}
```

## Sugestao de assunto

```txt
Reserva confirmada - {{restaurante_nome}}
```

## Sugestao de corpo

```txt
Ola, {{nome_cliente}}!

Sua reserva no {{restaurante_nome}} foi registrada com sucesso.

Data: {{data_reserva}}
Horario: {{horario_reserva}}
Quantidade: {{qtd_pessoas}}
Codigo da reserva: {{reserva_id}}

CPF: {{cpf_cliente}}
Telefone: {{telefone_cliente}}

Obrigado por usar o Qmesa.
```

## HTML completo

```html
<div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; font-size: 15px; color: #263238; background-color: #f5f5f5; padding: 24px 14px;">
  <div style="max-width: 620px; margin: auto; background-color: #ffffff; border-radius: 8px; overflow: hidden;">
    <div style="background-color: #407C5A; padding: 22px 24px; text-align: center;">
      <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 800;">Qmesa</h1>
      <p style="margin: 6px 0 0; color: #e9f5ee; font-size: 14px;">Confirmacao de reserva</p>
    </div>

    <div style="padding: 28px 26px;">
      <h2 style="margin: 0 0 16px; color: #1f2933; font-size: 22px;">Ola, {{nome_cliente}}!</h2>

      <p style="margin: 0 0 18px; line-height: 1.6;">
        Sua reserva no <strong>{{restaurante_nome}}</strong> foi registrada com sucesso.
      </p>

      <div style="background-color: #f3faf6; border: 1px solid #d9eee2; border-radius: 8px; padding: 18px; margin: 22px 0;">
        <p style="margin: 0 0 10px;"><strong>Data:</strong> {{data_reserva}}</p>
        <p style="margin: 0 0 10px;"><strong>Horario:</strong> {{horario_reserva}}</p>
        <p style="margin: 0 0 10px;"><strong>Quantidade:</strong> {{qtd_pessoas}}</p>
        <p style="margin: 0;"><strong>Codigo da reserva:</strong> {{reserva_id}}</p>
      </div>

      <p style="margin: 0 0 8px;"><strong>CPF:</strong> {{cpf_cliente}}</p>
      <p style="margin: 0 0 24px;"><strong>Telefone:</strong> {{telefone_cliente}}</p>

      <div style="text-align: center; margin: 26px 0;">
        <a href="{{link_reserva}}" target="_blank" style="display: inline-block; background-color: #407C5A; color: #ffffff; text-decoration: none; font-weight: 700; padding: 12px 20px; border-radius: 6px;">
          Ajustar ou consultar reserva
        </a>
      </div>

      <p style="margin: 0; line-height: 1.6; text-align: center;">
        Obrigado por usar o Qmesa. Esperamos voce no horario reservado.
      </p>
    </div>
  </div>

  <div style="max-width: 620px; margin: 14px auto 0; color: #7b8794; font-size: 13px; text-align: center;">
    Este email foi enviado para {{to_email}} porque uma reserva foi realizada no Qmesa.
  </div>
</div>
```

## Template unico de movimentacao

Use o mesmo template para reserva atualizada e reserva cancelada. O app envia variaveis dinamicas para mudar titulo, texto, cor e botao.

IDs no codigo:

```js
// pags_html/reagendar_reserva.html
// pags_html/reserva_confirmada.html
const EMAILJS_CONFIG = {
  publicKey: 'SUA_PUBLIC_KEY',
  serviceId: 'SEU_SERVICE_ID',
  templateMovimentacaoId: 'template_7rbmg7s'
};
```

Assunto sugerido no EmailJS:

```txt
{{tipo_movimentacao}} - {{restaurante_nome}}
```

Variaveis extras desse template:

```txt
{{tipo_movimentacao}}
{{titulo_movimentacao}}
{{mensagem_movimentacao}}
{{cor_movimentacao}}
{{cta_movimentacao}}
{{rodape_movimentacao}}
{{dados_anteriores_texto}}
{{data_reserva_anterior}}
{{horario_reserva_anterior}}
{{qtd_pessoas_anterior}}
```

HTML:

```html
<div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; font-size: 15px; color: #263238; background-color: #f5f5f5; padding: 24px 14px;">
  <div style="max-width: 620px; margin: auto; background-color: #ffffff; border-radius: 8px; overflow: hidden;">
    <div style="background-color: {{cor_movimentacao}}; padding: 22px 24px; text-align: center;">
      <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 800;">Qmesa</h1>
      <p style="margin: 6px 0 0; color: #f3f4f6; font-size: 14px;">{{titulo_movimentacao}}</p>
    </div>

    <div style="padding: 28px 26px;">
      <h2 style="margin: 0 0 16px; color: #1f2933; font-size: 22px;">Ola, {{nome_cliente}}!</h2>

      <p style="margin: 0 0 18px; line-height: 1.6;">
        {{mensagem_movimentacao}} Restaurante: <strong>{{restaurante_nome}}</strong>.
      </p>

      <div style="background-color: #f3faf6; border: 1px solid #d9eee2; border-radius: 8px; padding: 18px; margin: 22px 0;">
        <p style="margin: 0 0 10px;"><strong>Data:</strong> {{data_reserva}}</p>
        <p style="margin: 0 0 10px;"><strong>Horario:</strong> {{horario_reserva}}</p>
        <p style="margin: 0 0 10px;"><strong>Quantidade:</strong> {{qtd_pessoas}}</p>
        <p style="margin: 0;"><strong>Codigo da reserva:</strong> {{reserva_id}}</p>
      </div>

      <p style="margin: 0 0 8px; color: #6b7280; text-align: center;">
        {{dados_anteriores_texto}}
      </p>

      <div style="text-align: center; margin: 26px 0;">
        <a href="{{link_reserva}}" target="_blank" style="display: inline-block; background-color: #407C5A; color: #ffffff; text-decoration: none; font-weight: 700; padding: 12px 20px; border-radius: 6px;">
          {{cta_movimentacao}}
        </a>
      </div>

      <p style="margin: 0; line-height: 1.6; text-align: center;">
        {{rodape_movimentacao}}
      </p>
    </div>
  </div>

  <div style="max-width: 620px; margin: 14px auto 0; color: #7b8794; font-size: 13px; text-align: center;">
    Este email foi enviado para {{to_email}} por uma movimentacao de reserva no Qmesa.
  </div>
</div>
```
