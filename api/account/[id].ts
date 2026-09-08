import { neon } from '@neondatabase/serverless';

export default async function handler(req: any, res: any) {
  // Configura CORS per consentire l'accesso da altri domini (es. frontend Vercel e localhost)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  // Verifica presenza DATABASE_URL
  if (!process.env.DATABASE_URL) {
    res.status(500).json({ error: 'Configurazione database mancante' });
    return;
  }

  const sql = neon(process.env.DATABASE_URL);
  const id = req.query.id as string;

  if (!id) {
    res.status(400).json({ error: 'ID account mancante' });
    return;
  }

  if (req.method === 'GET') {
    try {
      const rows = await sql`SELECT data FROM accounts WHERE id = ${id}`;
      if (rows.length > 0) {
        res.status(200).json(rows[0].data);
      } else {
        res.status(404).json({ error: 'Account non trovato' });
      }
    } catch (e: any) {
      console.error('Errore GET /api/account:', e);
      res.status(500).json({ error: 'Errore interno del server' });
    }
  } else if (req.method === 'POST') {
    try {
      const data = req.body;
      
      // Upsert: Inserisce un nuovo record o aggiorna se l'id esiste
      await sql`
        INSERT INTO accounts (id, data)
        VALUES (${id}, ${data}::jsonb)
        ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data
      `;
      
      res.status(200).json({ success: true });
    } catch (e: any) {
      console.error('Errore POST /api/account:', e);
      // Ritorna l'errore per aiutare il debug qualora la tabella non fosse stata creata
      res.status(500).json({ error: 'Errore durante il salvataggio dei dati' });
    }
  } else {
    res.status(405).json({ error: 'Metodo non consentito' });
  }
}
