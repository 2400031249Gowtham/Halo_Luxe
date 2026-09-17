import nodemailer from "nodemailer";

const GMAIL_USER = process.env.GMAIL_USER || "hanexis.mail@gmail.com";
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD || "hnihlzpuiujcccck";

// Singleton transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: GMAIL_USER,
    pass: GMAIL_APP_PASSWORD,
  },
});

/**
 * Send an OTP verification email formatted with the HALO luxury visual identity.
 */
export async function sendOtpEmail(
  to: string,
  otp: string,
  purpose: "register" | "forgot_password"
) {
  const isRegister = purpose === "register";
  const title = isRegister
    ? "Verify Your HALO Account"
    : "Reset Your HALO Account Password";
  const actionText = isRegister
    ? "to finalize your HALO customer account creation"
    : "to reset your account password";

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <title>${title}</title>
    </head>
    <body style="margin:0;padding:0;background-color:#F4EEE4;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#1C211E;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#F4EEE4;padding:40px 10px;">
        <tr>
          <td align="center">
            <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;background-color:#FFFFFF;border:1px solid #C8A15A;box-shadow:0 10px 25px rgba(2,40,30,0.08);">
              
              <!-- Luxury Header Banner -->
              <tr>
                <td style="background-color:#02281E;padding:36px 40px;text-align:center;border-bottom:2px solid #C8A15A;">
                  <h1 style="margin:0;font-size:28px;letter-spacing:0.25em;color:#F4EEE4;font-weight:300;text-transform:uppercase;">
                    H A L O
                  </h1>
                  <p style="margin:6px 0 0 0;font-size:10px;letter-spacing:0.2em;color:#D9BD82;text-transform:uppercase;">
                    Dental Crystals & Clinical Elegance
                  </p>
                </td>
              </tr>

              <!-- Email Body -->
              <tr>
                <td style="padding:40px 48px;background-color:#FFFFFF;">
                  <h2 style="margin:0 0 16px 0;font-size:20px;font-weight:400;color:#02281E;">
                    ${title}
                  </h2>
                  <p style="margin:0 0 24px 0;font-size:14px;line-height:1.6;color:#4A5568;">
                    Please enter the one-time verification code below ${actionText}. This code is confidential and valid for the next <strong>10 minutes</strong>.
                  </p>

                  <!-- OTP Display Box -->
                  <div style="text-align:center;margin:32px 0;padding:24px 20px;background-color:#FAF6F0;border:1px solid #E8D5B5;border-radius:4px;">
                    <span style="display:inline-block;font-size:36px;font-weight:700;letter-spacing:0.35em;color:#02281E;font-family:monospace;">
                      ${otp}
                    </span>
                    <p style="margin:8px 0 0 0;font-size:11px;letter-spacing:0.1em;color:#8C733E;text-transform:uppercase;">
                      One-Time Passcode
                    </p>
                  </div>

                  <p style="margin:0 0 20px 0;font-size:13px;line-height:1.5;color:#718096;">
                    If you did not request this verification, you can safely ignore this email. Your account credentials remain protected.
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color:#FAF6F0;padding:24px 40px;text-align:center;border-top:1px solid #EDE4D5;">
                  <p style="margin:0 0 6px 0;font-size:11px;color:#718096;letter-spacing:0.05em;">
                    HALO Luxury Dental Crystals • Authorised Sourcing & Clinical Care
                  </p>
                  <p style="margin:0;font-size:10px;color:#A0AEC0;">
                    &copy; ${new Date().getFullYear()} HALO. All rights reserved.
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const info = await transporter.sendMail({
    from: `"HALO Luxury" <${GMAIL_USER}>`,
    to,
    subject: `${isRegister ? "Verify Your Account" : "Reset Your Password"} - Code: ${otp}`,
    html,
  });

  return info;
}

/**
 * Send an Order Confirmation email with payment and delivery details.
 */
export async function sendOrderConfirmationEmail(to: string, order: any) {
  const itemsRows = order.items
    .map(
      (item: any) => `
      <tr>
        <td style="padding:12px 8px;border-bottom:1px solid #EDE4D5;font-size:13px;color:#1C211E;">
          <strong>${item.name}</strong> ${item.size ? `(${item.size})` : ""}<br>
          <span style="font-size:11px;color:#718096;">Qty: ${item.quantity}</span>
        </td>
        <td align="right" style="padding:12px 8px;border-bottom:1px solid #EDE4D5;font-size:13px;color:#02281E;font-weight:600;">
          ₹${(item.price * item.quantity).toLocaleString("en-IN")}
        </td>
      </tr>
    `
    )
    .join("");

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head><meta charset="utf-8"><title>Order Confirmed</title></head>
    <body style="margin:0;padding:0;background-color:#F4EEE4;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#1C211E;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#F4EEE4;padding:40px 10px;">
        <tr>
          <td align="center">
            <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;background-color:#FFFFFF;border:1px solid #C8A15A;">
              <tr>
                <td style="background-color:#02281E;padding:36px 40px;text-align:center;border-bottom:2px solid #C8A15A;">
                  <h1 style="margin:0;font-size:26px;letter-spacing:0.25em;color:#F4EEE4;font-weight:300;">H A L O</h1>
                  <p style="margin:6px 0 0 0;font-size:10px;letter-spacing:0.2em;color:#D9BD82;text-transform:uppercase;">Order Confirmation</p>
                </td>
              </tr>
              <tr>
                <td style="padding:32px 40px;">
                  <h2 style="margin:0 0 8px 0;font-size:18px;color:#02281E;">Thank you for your order, ${order.customerName}!</h2>
                  <p style="margin:0 0 24px 0;font-size:13px;color:#4A5568;">
                    Order <strong>${order.orderNumber}</strong> has been successfully confirmed and paid online via Razorpay.
                  </p>
                  
                  <table width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:24px;">
                    <thead>
                      <tr style="border-bottom:2px solid #02281E;">
                        <th align="left" style="padding:8px;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:#02281E;">Item</th>
                        <th align="right" style="padding:8px;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:#02281E;">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${itemsRows}
                      <tr>
                        <td style="padding:12px 8px;font-weight:700;font-size:14px;color:#02281E;">Total Amount Paid</td>
                        <td align="right" style="padding:12px 8px;font-weight:700;font-size:16px;color:#02281E;">₹${order.total.toLocaleString("en-IN")}</td>
                      </tr>
                    </tbody>
                  </table>

                  <div style="background-color:#FAF6F0;border:1px solid #EDE4D5;padding:16px;margin-bottom:24px;">
                    <p style="margin:0 0 6px 0;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:#8C733E;font-weight:700;">Delivery Address</p>
                    <p style="margin:0;font-size:13px;color:#2D3748;line-height:1.5;">
                      ${order.shippingAddress.fullName} • ${order.shippingAddress.phone}<br>
                      ${order.shippingAddress.street}, ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pinCode}
                    </p>
                  </div>

                  <p style="margin:0;font-size:12px;color:#718096;text-align:center;">
                    Track your shipment anytime from your HALO account dashboard.
                  </p>
                </td>
              </tr>
              <tr>
                <td style="background-color:#FAF6F0;padding:20px;text-align:center;border-top:1px solid #EDE4D5;">
                  <p style="margin:0;font-size:10px;color:#A0AEC0;">&copy; ${new Date().getFullYear()} HALO Luxury Dental Crystals. All rights reserved.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  return transporter.sendMail({
    from: `"HALO Luxury" <${GMAIL_USER}>`,
    to,
    subject: `Order Confirmed: ${order.orderNumber} - HALO Luxury`,
    html,
  });
}
