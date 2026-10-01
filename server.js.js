const express = require('express');
const admin = require('firebase-admin');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// تحميل مفتاح Firebase
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// مسار استقبال الـ Webhook
app.post('/webhook/email', async (req, res) => {
  try {
    const { to, from, subject, text, html } = req.body;

    if (!to) {
      return res.status(400).send('No recipient address provided');
    }

    await db.collection('emails').add({
      to: (to || '').toLowerCase().trim(),
      from: from || 'غير معروف',
      subject: subject || 'بدون عنوان',
      body: text || html || '',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log(`تم حفظ الرسالة بنجاح للعنوان: ${to}`);
    return res.status(200).send('OK');
  } catch (error) {
    console.error('حدث خطأ أثناء حفظ البريد:', error);
    return res.status(500).send('Server Error');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`الخادم المجاني يعمل على المنفذ ${PORT}`));