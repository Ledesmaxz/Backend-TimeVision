const nodemailer = require('nodemailer');
const getResetPasswordTemplate = require('./resetPassword');

// Configurar el transporter de SMTP2GO
const transporter = nodemailer.createTransport({
  host: 'smtp.smtp2go.com',
  port: 2525,
  secure: false,
  auth: {
    user: process.env.SMTP2GO_USERNAME,
    pass: process.env.SMTP2GO_PASSWORD
  }
});

const sendResetPasswordEmail = async (email, resetCode) => {
  const mailOptions = {
    from: 'noreply@timevision.lat',
    to: email,
    subject: 'Recuperación de Contraseña - TimeVision',
    html: getResetPasswordTemplate(resetCode)
  };

  try {
    console.log('Configuración de email:', {
      host: transporter.options.host,
      port: transporter.options.port,
      auth: {
        user: process.env.SMTP2GO_USERNAME,
      }
    });
    
    const info = await transporter.sendMail(mailOptions);
    console.log('Email enviado exitosamente:', info.messageId);
    return { success: true };
  } catch (error) {
    console.error('Error detallado al enviar email:', error);
    return { 
      success: false, 
      error: error.message || 'Error desconocido al enviar el email'
    };
  }
};

module.exports = {
  sendResetPasswordEmail,
  generateResetCode: () => Math.floor(100000 + Math.random() * 900000).toString()
};