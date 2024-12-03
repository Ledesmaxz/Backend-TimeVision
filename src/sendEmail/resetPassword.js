const getResetPasswordTemplate = (resetToken) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          font-family: Arial, sans-serif;
        }
        .header {
          background-color: #4A90E2;
          color: white;
          padding: 20px;
          text-align: center;
          border-radius: 5px 5px 0 0;
        }
        .content {
          background-color: #ffffff;
          padding: 20px;
          border: 1px solid #e9e9e9;
          border-radius: 0 0 5px 5px;
        }
        .token-container {
          background-color: #f5f5f5;
          padding: 15px;
          border-radius: 5px;
          margin: 20px 0;
          text-align: center;
        }
        .token {
          font-size: 24px;
          font-weight: bold;
          color: #4A90E2;
          letter-spacing: 2px;
        }
        .footer {
          text-align: center;
          margin-top: 20px;
          color: #666;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>Recuperación de Contraseña</h2>
        </div>
        <div class="content">
          <p>Has solicitado restablecer tu contraseña. Usa el siguiente código en la aplicación TimeVision para crear una nueva contraseña:</p>
          <div class="token-container">
            <div class="token">${resetToken}</div>
          </div>
          <p>Abre la aplicación TimeVision y usa este código en la pantalla de recuperación de contraseña.</p>
          <p>Si no solicitaste este cambio, puedes ignorar este correo.</p>
          <p>Este código expirará en 1 hora por seguridad.</p>
        </div>
        <div class="footer">
          <p>Este es un correo automático, por favor no responder.</p>
          <p>TimeVision © 2024</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

module.exports = getResetPasswordTemplate;